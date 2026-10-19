"""Generate per-scene narration + caption/cue timing for a tutorial video.

Usage:
  python scripts/generate-tutorial-voice.py <id> [--force]     (reads tutorials/<id>.json)

TTS: the user's own cloned voice on Doubao (Volcano Engine) TTS v3 — the voice every video uses.
  "tts": {"provider": "doubao"}    DOUBAO_API_KEY (or DOUBAO_APP_ID + DOUBAO_ACCESS_TOKEN), voice from DOUBAO_VOICE_ZH
                                   (or "voice"), resource seed-icl-2.0. Each scene is ONE request, so prosody runs
                                   across sentences; per-character timestamps (enable_subtitle) give the cue and
                                   caption times. Details: docs/video-craft/配音.md
  "tts": {"provider": "edge", "voice": "zh-CN-YunxiNeural"}
                                   BACKUP ONLY, and only when the user agrees: edge-tts (free, `pip install edge-tts`),
                                   word timings from the service. Never used as a silent fallback for Doubao.

Per scene: "pace" (slow/calm/normal/brisk/fast), "mood" (a delivery instruction, Doubao context_texts),
"voiceEnv" (another cloned voice id from the environment, e.g. a high-energy clone for hooks). Every scene is then
pause-tightened (gaps > 170 ms cut, 240 ms after 。？！; "tts": {"pauses": false} to disable) and run through a light
presence chain — see docs/video-craft/配音.md.

One line, for the explainer pipeline (scripts/build-explainer.mjs --voice):
  python scripts/generate-tutorial-voice.py --say <out.mp3> [--rate 1.16] [--provider edge --voice zh-CN-YunxiNeural] < text

Narration markup:
  {a}            cue marker; its time (ms from scene start) is written to timing.cues.a
  [显示|朗读]     caption shows the left side, TTS speaks the right side

Outputs:
  public/audio/tutorials/<id>/<nn>-<scene>.mp3
  tutorials/<id>.timeline.json
"""
import base64
import json
import math
import os
import re
import ssl
import subprocess
import sys
import tempfile
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
def resolve_tutorial(arg):
    """Accept an id ("rea-quickstart") or a path ("tutorials/rea-quickstart.json")."""
    target = Path(arg or "rea-quickstart")
    if target.suffix != ".json":
        target = Path("tutorials") / f"{target.name}.json"
    return ROOT / target


def timeline_path(spec_path):
    return spec_path.with_name(f"{spec_path.stem}.timeline.json")


TOKEN = re.compile(r"\{([a-z0-9]+)\}|\[([^\]|]+)\|([^\]]+)\]|\{pace:([a-z0-9.]+)\}")
# Speaking pace (docs/video-craft/配音.md §三): named presets, calibrated to the user's cloned voice, which reads
# slower than stock TTS voices at rate 1.0. A scene sets one with "pace"; {pace:NAME} inside the narration changes
# it from the next sentence on. A number works too ({pace:1.15}). Override the table with tts.paces.
# Recalibrated 2026-10-17 for short-video pacing: the cloned voice ran at 3.7 chars/s at the old "normal" (1.1) with
# 29 % of the track in pauses; these rates plus pause tightening (tighten_pauses) land at about 4.8-5.5 chars/s.
PACES = {"slow": 1.04, "calm": 1.1, "normal": 1.16, "brisk": 1.24, "fast": 1.32}
# Default Doubao model for the cloned voice: measured on the same line, seed-tts-2.0-expressive + a spoken-style script
# gave a 19.2-semitone pitch range vs 15.1 for the plain default (docs/video-craft/配音.md §四).
DOUBAO_MODEL = "seed-tts-2.0-expressive"
# Pause tightening (short-video "气口" editing): gaps longer than max_ms are cut down to max_ms (sentence ends keep a
# little more), word timestamps shifted to match. Off with "tts": {"pauses": false}.
PAUSES = {"max_ms": 170, "sentence_ms": 240, "detect_db": -38}
# Voice chain for presence on phone speakers: rumble cut, a little 3 kHz presence, gentle compression.
VOICE_CHAIN = "highpass=f=75,equalizer=f=3000:t=q:w=1.2:g=2.5,acompressor=threshold=-20dB:ratio=3:attack=5:release=80:makeup=2"
BREAK = set("，。？！；：、,?!;:")
KEEP_TAIL = set("？！?!")
# Limits are in visual width: a CJK character is 1, latin letters/digits/spaces about 0.55.
MAX_CAPTION = 15
MERGE_BELOW = 6
MERGE_MAX = 14


def width(text):
    return sum(0.55 if ch.isascii() else 1 for ch in text)


def parse(narration):
    """Return display text, spoken text, spoken->display index map, cue positions (display index) and pace changes
    [(spoken index, pace)]."""
    display, spoken, to_display, cues, paces = "", "", [], {}, []
    pos = 0
    for m in TOKEN.finditer(narration):
        plain = narration[pos:m.start()]
        for ch in plain:
            to_display.append(len(display))
            display += ch
            spoken += ch
        if m.group(1):
            cues[m.group(1)] = len(display)
        elif m.group(4):
            paces.append((len(spoken), m.group(4)))
        else:
            shown, said = m.group(2), m.group(3)
            start = len(display)
            display += shown
            spoken += said
            to_display.extend([start] * len(said))
        pos = m.end()
    for ch in narration[pos:]:
        to_display.append(len(display))
        display += ch
        spoken += ch
    return display, spoken, to_display, cues, paces


SENTENCE_END = set("。？！；?!;")
CLOSERS = set("”」』）)")
MIN_CAPTION_MS = 700


def is_latin(ch):
    return ch.isascii() and (ch.isalnum() or ch in ".%-_/²")


def cut_points(display, s, e):
    """Indices where a long run may be broken: spaces and closing quotes, but never inside
    "Claude Code"-style latin phrases or between a number and its measure word ("6 个")."""
    points = []
    for k in range(s + 4, e - 3):
        before, after = display[k - 1], display[k + 1] if k + 1 < e else ""
        if display[k] == " ":
            if is_latin(before) and is_latin(after):
                continue
            if before.isdigit() and not is_latin(after):
                continue
            points.append(k + 1)
        elif display[k - 1] in CLOSERS and display[k] not in BREAK:
            points.append(k)
    return points


def caption_chunks(display):
    """Split display text into caption-sized chunks: list of (start_index, end_index)."""
    chunks, start = [], 0
    for i, ch in enumerate(display):
        if ch in BREAK:
            chunks.append((start, i + 1))
            start = i + 1
    if start < len(display):
        chunks.append((start, len(display)))
    merged = []
    for s, e in chunks:
        # fold very short fragments ("第一步，") into the following phrase, but not across a sentence end
        prev = merged[-1] if merged else None
        if prev and width(display[prev[0]:prev[1]]) < MERGE_BELOW and width(display[prev[0]:e]) <= MERGE_MAX and display[prev[1] - 1] not in SENTENCE_END:
            merged[-1] = (prev[0], e)
        else:
            merged.append((s, e))
    out = []
    for s, e in merged:
        while width(display[s:e]) > MAX_CAPTION:
            points = cut_points(display, s, e)
            if not points and width(display[s:e]) <= MAX_CAPTION + 3:
                break
            mid = s + (e - s) // 2
            if points:
                cut = min(points, key=lambda k: abs(k - mid))
            else:
                # no natural break: cut near the middle, outside latin words
                cut = min((k for k in range(s + 4, e - 3) if not (is_latin(display[k - 1]) and is_latin(display[k]))),
                          key=lambda k: abs(k - mid), default=mid)
            out.append((s, cut))
            s = cut
        out.append((s, e))
    return [(s, e) for s, e in out if display[s:e].strip(" ，。；：、,;:")]


def merge_flashes(display, chunks, starts, end_ms):
    """Join captions that would flash by in under MIN_CAPTION_MS with the next one."""
    chunks, starts = list(chunks), list(starts)
    i = 0
    while i < len(chunks) - 1:
        (s, e), (s2, e2) = chunks[i], chunks[i + 1]
        shown = starts[i + 1] - starts[i]
        joined = width(clean_caption(display[s:e2]))
        if shown < MIN_CAPTION_MS and joined <= MAX_CAPTION + 1 and display[e - 1] not in SENTENCE_END:
            chunks[i] = (s, e2)
            del chunks[i + 1], starts[i + 1]
        else:
            i += 1
    return chunks, starts


def clean_caption(text):
    text = text.strip()
    while text and text[-1] in BREAK and text[-1] not in KEEP_TAIL:
        text = text[:-1]
    return text.strip()


EDGE_VOICE = "zh-CN-YunxiNeural"


def synthesize_edge(text, tts, out_path):
    """Backup engine: edge-tts, imported only when chosen. Returns the service's word timings."""
    import asyncio
    try:
        import edge_tts
        import edge_tts.communicate
    except ImportError:
        raise SystemExit("pip install edge-tts  (needed for the edge backup voice)")
    # Behind a TLS-inspecting proxy edge-tts must trust the proxy CA; it pins certifi otherwise.
    ca = os.environ.get("TTS_CA_BUNDLE") or os.environ.get("SSL_CERT_FILE")
    if ca and Path(ca).exists():
        edge_tts.communicate._SSL_CTX = ssl.create_default_context(cafile=ca)
    rate = tts.get("rate", 1.0)
    rate = rate if isinstance(rate, str) else f"{round((rate - 1) * 100):+d}%"  # 1.16 -> "+16%"

    async def run():
        words = []
        communicate = edge_tts.Communicate(text, tts.get("voice") or EDGE_VOICE, rate=rate, boundary="WordBoundary")
        with open(out_path, "wb") as f:
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    f.write(chunk["data"])
                elif chunk["type"] == "WordBoundary":
                    words.append({"text": chunk["text"], "ms": chunk["offset"] / 10000, "dur": chunk["duration"] / 10000})
        return words
    return asyncio.run(run())


def load_dotenv():
    env = ROOT / ".env"
    if not env.exists():
        return
    for line in env.read_text(encoding="utf-8").splitlines():
        m = re.match(r"\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$", line)
        if m and m.group(1) not in os.environ:
            os.environ[m.group(1)] = m.group(2).strip().strip('"').strip("'")


def map_timestamps(text, service):
    """service: [{"text", "begin", "end"}] in ms. Returns one timing entry per non-space character of `text`."""
    # Walk the service's words against our text: same characters advance together; where the service normalized
    # something ("3" read as "三", "AI" split oddly) the text pointer still advances one character per character.
    chars = [(i, ch) for i, ch in enumerate(text) if not ch.isspace()]
    out, k = [], 0
    for w in service:
        piece = [ch for ch in w["text"] if not ch.isspace()]
        if not piece:
            continue
        dur = max(1, w["end"] - w["begin"]) / len(piece)
        for j, ch in enumerate(piece):
            if k >= len(chars):
                break
            # resync on an exact match within the next few characters (skipped punctuation, normalized digits)
            for look in range(4):
                if k + look < len(chars) and chars[k + look][1].lower() == ch.lower():
                    k += look
                    break
            out.append({"text": chars[k][1], "ms": w["begin"] + dur * j, "dur": dur})
            k += 1
    for i, ch in chars[k:]:  # anything the service did not stamp: put it at the end
        out.append({"text": ch, "ms": out[-1]["ms"] + out[-1]["dur"] if out else 0.0, "dur": 60})
    return out


def synthesize_doubao(text, tts, out_path):
    """Doubao (Volcano Engine) TTS v3, whole scene in one request; per-character timestamps via enable_subtitle.
    Default voice: the user's own cloned voice (DOUBAO_VOICE_ZH, resource seed-icl-2.0). Key: DOUBAO_API_KEY."""
    import uuid
    # Two ways to authenticate (Volcano Engine console): an API key (X-Api-Key), or the app's APP ID + Access
    # Token (X-Api-App-Id + X-Api-Access-Key) from the app the voices were trained in. App credentials win if set.
    app_id, token, key = os.environ.get("DOUBAO_APP_ID"), os.environ.get("DOUBAO_ACCESS_TOKEN"), os.environ.get("DOUBAO_API_KEY")
    if app_id and token:
        auth = {"X-Api-App-Id": app_id, "X-Api-Access-Key": token}
    elif key:
        auth = {"X-Api-Key": key}
    else:
        raise SystemExit("Set DOUBAO_API_KEY, or DOUBAO_APP_ID + DOUBAO_ACCESS_TOKEN (environment or .env)")
    voice = tts.get("voice") or os.environ.get(tts.get("voiceEnv", "DOUBAO_VOICE_ZH"))
    if not voice:
        raise SystemExit("No Doubao voice: set tts.voice or DOUBAO_VOICE_ZH")
    resource = tts.get("resource", "seed-icl-2.0")
    audio_params = {"format": "mp3", "sample_rate": 24000, "enable_subtitle": True,
                    # rate 1.0 = normal; Doubao's speech_rate is -50..100 (100 = 2x)
                    "speech_rate": round((tts.get("rate", 1.0) - 1) * 100), **(tts.get("audio") or {})}
    req_params = {"text": text, "speaker": voice, "audio_params": audio_params, **(tts.get("params") or {})}
    # Don't send "model" by default: with resource seed-icl-2.0 the server rejects "model": "seed-icl-2.0" as
    # InvalidModel (tested 2026-10-16); the resource header already selects it. Set tts.model only to pick a variant.
    model = tts.get("model", DOUBAO_MODEL if resource == "seed-icl-2.0" else None)
    if model:
        req_params["model"] = model
    if tts.get("mood"):  # natural-language delivery instruction (Doubao 2.0 context_texts); weak on cloned voices, see 配音.md
        req_params["additions"] = json.dumps({"context_texts": [tts["mood"]]}, ensure_ascii=False)
    body = json.dumps({"req_params": req_params}).encode()
    endpoint = os.environ.get("DOUBAO_TTS_ENDPOINT", "https://openspeech.bytedance.com/api/v3/tts/unidirectional")
    ctx = ssl.create_default_context(cafile=os.environ.get("SSL_CERT_FILE")) if os.environ.get("SSL_CERT_FILE") else None
    last = None
    for attempt in range(4):
        req = urllib.request.Request(endpoint, data=body, method="POST", headers={
            "Content-Type": "application/json", **auth, "X-Api-Resource-Id": resource, "X-Api-Request-Id": str(uuid.uuid4())})
        audio, words, done = bytearray(), {}, None
        try:
            with urllib.request.urlopen(req, context=ctx, timeout=180) as r:
                for line in r:
                    if not line.strip():
                        continue
                    msg = json.loads(line)
                    if msg.get("data"):
                        audio += base64.b64decode(msg["data"])
                    sentence = msg.get("sentence") or {}
                    if sentence.get("words"):  # one event per sentence; times are absolute seconds
                        for w in sentence["words"]:
                            words[(round(w["startTime"], 3), w["word"])] = w
                    if msg.get("code") not in (0, None):
                        done = msg
            if done and done.get("code") != 20000000:
                raise RuntimeError(f"Doubao TTS error {done.get('code')}: {done.get('message')}")
            if audio:
                break
            last = "no audio returned"
        except urllib.error.HTTPError as error:
            last = f"HTTP {error.code}: {error.read()[:300]!r}"
            if error.code in (401, 403):  # permissions won't fix themselves on retry
                break
        except Exception as error:
            last = str(error)[:300]
        import time
        time.sleep(2 * (attempt + 1))
    else:
        raise SystemExit(f"Doubao TTS failed for scene {text[:30]!r}…: {last}")
    if not audio:
        raise SystemExit(f"Doubao TTS failed for scene {text[:30]!r}…: {last}"
                         + ("\n  -> the API key is not granted the voice-cloning resource; enable 声音复刻 2.0 (seed-icl-2.0) for this key"
                            " in the Volcano Engine console (see docs/video-craft/配音.md)" if "not granted" in str(last) else ""))
    with tempfile.TemporaryDirectory() as tmp:
        raw = Path(tmp) / "scene.mp3"
        raw.write_bytes(bytes(audio))
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(raw), "-af", TAIL_TRIM, "-ar", "44100", "-ac", "2",
                        "-c:a", "libmp3lame", "-b:a", "192k", str(out_path)], check=True)
    service = [{"text": w["word"], "begin": w["startTime"] * 1000, "end": w["endTime"] * 1000}
               for w in sorted(words.values(), key=lambda w: w["startTime"])]
    return map_timestamps(text, spread_stubs(service))


def spread_stubs(service, stub_ms=60):
    """Doubao stamps some latin words and digits ("DeepSeek", "V3", "2") with a ~30 ms stub that sits either at the
    start or at the end of the spoken word (measured 2026-10-18: "是 DeepSeek。" -> DeepSeek stamped 1.1 s late).
    A run of stubs really fills the gap from the previous word's end to the next real word's start: spread it there,
    in proportion to each stub's visual width."""
    out = [dict(w) for w in service]
    i = 0
    while i < len(out):
        if out[i]["end"] - out[i]["begin"] >= stub_ms:
            i += 1
            continue
        j = i
        while j < len(out) and out[j]["end"] - out[j]["begin"] < stub_ms:
            j += 1
        start = out[i - 1]["end"] if i else out[i]["begin"]
        end = out[j]["begin"] if j < len(out) else max(w["end"] for w in out[i:j])
        if end - start > stub_ms * (j - i):
            weights = [max(1.0, width(w["text"].strip("，。？！、,.?!"))) for w in out[i:j]]
            cursor = start
            for w, k in zip(out[i:j], weights):
                w["begin"], cursor = cursor, cursor + (end - start) * k / sum(weights)
                w["end"] = cursor
        i = j
    return out


def pace_rate(pace, tts):
    """A pace name (or number) -> rate (1.0 = the voice's natural speed)."""
    table = {**PACES, **(tts.get("paces") or {})}
    if pace is None:
        return tts.get("rate", table["normal"])
    try:
        return float(pace)
    except (TypeError, ValueError):
        if pace not in table:
            raise SystemExit(f"Unknown pace {pace!r}; use one of {', '.join(table)} or a number")
        return table[pace]


def synthesize_paced(text, tts, out_path, base_rate, changes, engine):
    """Voice a scene whose pace changes at sentence boundaries: one request per stretch of equal pace (never split
    mid-sentence, so each stretch keeps its own intonation), joined with a short breath; timestamps shifted."""
    def snap(i):  # a pace change takes effect at the start of the sentence it sits in: never split a sentence
        while i > 0 and text[i - 1] not in SENTENCE_END:
            i -= 1
        return i
    changes = [(snap(i), pace) for i, pace in changes]
    cuts = sorted({i for i, _ in changes} | {0, len(text)})
    rate_at, rate = {}, base_rate
    for i, pace in sorted(changes):
        rate_at[i] = pace_rate(pace, tts)
    parts, words, cursor = [], [], 0.0
    with tempfile.TemporaryDirectory() as tmp:
        for k in range(len(cuts) - 1):
            a, b = cuts[k], cuts[k + 1]
            rate = rate_at.get(a, rate)
            piece = text[a:b]
            if not piece.strip():
                continue
            mp3 = Path(tmp) / f"{k:02d}.mp3"
            ws = engine(piece, {**tts, "rate": rate}, mp3)
            words += [{**w, "ms": w["ms"] + cursor} for w in ws]
            parts.append(mp3)
            cursor += probe_ms(mp3) + PACE_BREATH_MS
        inputs = [x for p in parts for x in ("-i", str(p))]
        labels = "".join(f"[{i}:a]apad=pad_dur={PACE_BREATH_MS / 1000}[a{i}];" for i in range(len(parts)))
        graph = labels + "".join(f"[a{i}]" for i in range(len(parts))) + f"concat=n={len(parts)}:v=0:a=1[out]"
        subprocess.run(["ffmpeg", "-y", "-v", "error", *inputs, "-filter_complex", graph, "-map", "[out]", "-c:a", "libmp3lame", "-b:a", "192k",
                        str(out_path)], check=True)
    return words


PACE_BREATH_MS = 180


TAIL_TRIM = "areverse,silenceremove=start_periods=1:start_threshold=-42dB:start_silence=0.08,areverse"


def probe_ms(path):
    result = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
                            check=True, capture_output=True, text=True)
    return float(result.stdout.strip()) * 1000


def align(words, spoken, to_display):
    """Attach a display index to every boundary word by searching the spoken text in order."""
    cursor = 0
    for w in words:
        idx = spoken.find(w["text"], cursor)
        if idx < 0:
            idx = cursor
        w["display"] = to_display[min(idx, len(to_display) - 1)]
        cursor = idx + len(w["text"])
    return words


def time_at(words, display_index, fallback):
    for w in words:
        if w["display"] >= display_index:
            return w["ms"]
    return fallback


def tighten_pauses(mp3, words, tts, spoken):
    """Cut every pause longer than the limit down to it (more room after 。？！), keep the rest, shift timestamps.
    Then the voice chain. Returns the shifted words. This is what makes a calm read feel like short-video pacing."""
    cfg = tts.get("pauses", {})
    if cfg is False:
        return words
    cfg = {**PAUSES, **(cfg if isinstance(cfg, dict) else {})}
    out = subprocess.run(["ffmpeg", "-i", str(mp3), "-af", f"silencedetect=n={cfg['detect_db']}dB:d={cfg['max_ms'] / 1000}", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    starts = [float(x) * 1000 for x in re.findall(r"silence_start: ([\d.]+)", out)]
    ends = [float(x) * 1000 for x in re.findall(r"silence_end: ([\d.]+)", out)]
    total = probe_ms(mp3)
    # sentence ends (in ms) from the word timings: a pause right after 。？！ may keep a little more air
    sent_end = [w["ms"] for w in words if w.get("text") in SENTENCE_END]  # one entry per character, punctuation included
    cuts = []
    for a, b in zip(starts, ends):
        if a <= 1 or b >= total - 1:   # leave the head and the tail alone (head keeps timestamps aligned)
            continue
        keep = cfg["sentence_ms"] if any(abs(a - t) < 120 for t in sent_end) else cfg["max_ms"]
        if b - a > keep:
            cuts.append((a + keep / 2, b - keep / 2))
    if cuts:
        keep_parts, cursor = [], 0.0
        for a, b in cuts:
            keep_parts.append((cursor, a))
            cursor = b
        keep_parts.append((cursor, total))
        expr = "+".join(f"between(t,{a / 1000:.4f},{b / 1000:.4f})" for a, b in keep_parts)
        tmp = mp3.with_suffix(".tight.mp3")
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(mp3), "-af", f"aselect='{expr}',asetpts=N/SR/TB,{VOICE_CHAIN}",
                        "-c:a", "libmp3lame", "-b:a", "192k", str(tmp)], check=True)
        tmp.replace(mp3)

        def shift(t):
            return t - sum(min(b, t) - a for a, b in cuts if t > a)
        words = [{**w, "ms": shift(w["ms"])} for w in words]
    else:
        tmp = mp3.with_suffix(".tight.mp3")
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(mp3), "-af", VOICE_CHAIN, "-c:a", "libmp3lame", "-b:a", "192k", str(tmp)], check=True)
        tmp.replace(mp3)
    removed = sum(b - a for a, b in cuts)
    print(f"  tightened pauses: {len(cuts)} cut, {removed / 1000:.1f}s of {total / 1000:.1f}s removed")
    return words


def engine_for(tts, where):
    provider = tts.get("provider", "doubao")
    engines = {"doubao": synthesize_doubao, "edge": synthesize_edge}
    if provider not in engines:
        raise SystemExit(f"{where}: tts.provider {provider!r} is not supported; use \"doubao\" (the cloned voice) or, "
                         'as an agreed backup only, "edge" (docs/video-craft/配音.md)')
    return engines[provider]


def say(argv):
    """--say <out.mp3> [--rate r] [--provider edge --voice v]: voice one line read from stdin (explainer pipeline)."""
    opt = lambda name, default=None: argv[argv.index(name) + 1] if name in argv else default
    out = Path(opt("--say"))
    load_dotenv()
    tts = {"provider": opt("--provider", "doubao"), "rate": float(opt("--rate", PACES["normal"])), "voice": opt("--voice")}
    text = sys.stdin.read().strip()
    words = engine_for(tts, "--say")(text, tts, out)
    tighten_pauses(out, words, tts, text)


def main():
    if "--say" in sys.argv:
        return say(sys.argv)
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    force = "--force" in sys.argv
    spec_path = resolve_tutorial(args[0] if args else None)
    spec = json.loads(spec_path.read_text(encoding="utf-8"))
    load_dotenv()
    tts = spec.get("tts") or {"provider": "doubao"}
    engine = engine_for(tts, spec_path.name)
    if engine is synthesize_edge:
        voice_key = f"edge:{tts.get('voice') or EDGE_VOICE}:{tts.get('rate')}:{json.dumps(tts.get('pauses', PAUSES))}"
    else:
        voice_key = (f"doubao:{tts.get('voice') or os.environ.get(tts.get('voiceEnv', 'DOUBAO_VOICE_ZH'))}:{tts.get('resource', 'seed-icl-2.0')}:{tts.get('rate')}"
                     f":{tts.get('model', DOUBAO_MODEL)}:{json.dumps(tts.get('pauses', PAUSES))}:{VOICE_CHAIN}")
    audio_dir = ROOT / "public" / "audio" / "tutorials" / spec["id"]
    audio_dir.mkdir(parents=True, exist_ok=True)
    fps, lead, tail = spec["fps"], spec.get("leadMs", 200), spec.get("tailMs", 400)
    scenes, start_frame = [], 0
    for n, scene in enumerate(spec["scenes"], 1):
        display, spoken, to_display, cue_pos, pace_changes = parse(scene["narration"])
        scene_rate = pace_rate(scene.get("pace", tts.get("pace")), tts)
        rel = f"audio/tutorials/{spec['id']}/{n:02d}-{scene['id']}.mp3"
        mp3 = ROOT / "public" / rel
        words_cache = mp3.with_suffix(".words.json")
        cache = json.loads(words_cache.read_text(encoding="utf-8")) if words_cache.exists() else {}
        mood = scene.get("mood", tts.get("mood"))
        # a scene may use another cloned voice (e.g. a high-energy clone for hooks): "voiceEnv": "DOUBAO_VOICE_ZH_ENERGY"
        scene_voice = {"voiceEnv": scene["voiceEnv"], "voice": None} if scene.get("voiceEnv") else {}
        pace_key = f"{scene_rate}:{pace_changes}:{mood or ''}:{scene.get('voiceEnv', '')}"
        stale = cache.get("spoken") != spoken or cache.get("voice") != voice_key or cache.get("pace", "") != pace_key
        if force or stale or not mp3.exists():
            scene_tts = {**tts, "mood": mood, **scene_voice}
            if pace_changes:
                words = synthesize_paced(spoken, scene_tts, mp3, scene_rate, pace_changes, engine)
            else:
                words = engine(spoken, {**scene_tts, "rate": scene_rate}, mp3)
            words = tighten_pauses(mp3, words, tts, spoken)
            words_cache.write_text(json.dumps({"spoken": spoken, "voice": voice_key, "pace": pace_key, "words": words}, ensure_ascii=False, indent=1),
                                   encoding="utf-8")
            print(f"voiced {rel}")
        cached = json.loads(words_cache.read_text(encoding="utf-8"))
        words = align(cached["words"], spoken, to_display)
        audio_ms = probe_ms(mp3)
        speech_end = words[-1]["ms"] + words[-1]["dur"] if words else audio_ms
        duration_frames = math.ceil((lead + audio_ms + scene.get("tailMs", tail)) / 1000 * fps)  # a scene may hold longer (end card)
        cues = {k: round(lead + time_at(words, p, speech_end)) for k, p in cue_pos.items()}
        captions = []
        chunks = caption_chunks(display)
        starts = [time_at(words, s, speech_end) for s, _ in chunks]
        chunks, starts = merge_flashes(display, chunks, starts, speech_end)
        for i, (s, e) in enumerate(chunks):
            end = starts[i + 1] if i + 1 < len(chunks) else speech_end + 250
            text = clean_caption(display[s:e])
            if text:
                captions.append({"text": text, "startMs": round(lead + starts[i]), "endMs": round(lead + end)})
        scenes.append({"id": scene["id"], "audioSrc": rel, "audioMs": round(audio_ms), "startFrame": start_frame,
                       "durationFrames": duration_frames, "cues": cues, "captions": captions})
        start_frame += duration_frames
    timing = {"id": spec["id"], "voice": tts.get("provider", "doubao"), "rate": tts.get("rate"), "fps": fps, "leadMs": lead,
              "totalFrames": start_frame, "scenes": scenes}
    out = timeline_path(spec_path)
    out.write_text(json.dumps(timing, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{len(scenes)} scenes, {start_frame} frames ({start_frame / fps:.1f}s) -> {out.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
