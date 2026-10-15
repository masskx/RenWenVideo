"""Generate per-scene narration + caption/cue timing for a tutorial video.

Usage:
  python scripts/generate-tutorial-voice.py <id> [--force]     (reads tutorials/<id>.json)

TTS backends (tutorial JSON):
  "voice"/"rate"                   edge-tts (default), word timings from the service
  "tts": {"provider": "dashscope", "voice": "longsanshu_v3", "rate": 1.2, "model": "cosyvoice-v3-flash"}
                                   Alibaba Cloud CosyVoice (DASHSCOPE_API_KEY). Each phrase is synthesized
                                   separately, so cue marks on phrase boundaries are exact; characters inside a
                                   phrase are timed proportionally.

Narration markup:
  {a}            cue marker; its time (ms from scene start) is written to timing.cues.a
  [显示|朗读]     caption shows the left side, TTS speaks the right side

Outputs:
  public/audio/tutorials/<id>/<nn>-<scene>.mp3
  tutorials/<id>.timeline.json
"""
import asyncio
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

import edge_tts
import edge_tts.communicate

ROOT = Path(__file__).resolve().parent.parent
# Behind a TLS-inspecting proxy edge-tts must trust the proxy CA; it pins certifi otherwise.
_ca = os.environ.get("TTS_CA_BUNDLE") or os.environ.get("SSL_CERT_FILE")
if _ca and Path(_ca).exists():
    edge_tts.communicate._SSL_CTX = ssl.create_default_context(cafile=_ca)

def resolve_tutorial(arg):
    """Accept an id ("rea-quickstart") or a path ("tutorials/rea-quickstart.json")."""
    target = Path(arg or "rea-quickstart")
    if target.suffix != ".json":
        target = Path("tutorials") / f"{target.name}.json"
    return ROOT / target


def timeline_path(spec_path):
    return spec_path.with_name(f"{spec_path.stem}.timeline.json")


TOKEN = re.compile(r"\{([a-z0-9]+)\}|\[([^\]|]+)\|([^\]]+)\]")
BREAK = set("，。？！；：、,?!;:")
KEEP_TAIL = set("？！?!")
# Limits are in visual width: a CJK character is 1, latin letters/digits/spaces about 0.55.
MAX_CAPTION = 15
MERGE_BELOW = 6
MERGE_MAX = 14


def width(text):
    return sum(0.55 if ch.isascii() else 1 for ch in text)


def parse(narration):
    """Return display text, spoken text, spoken->display index map and cue positions (display index)."""
    display, spoken, to_display, cues = "", "", [], {}
    pos = 0
    for m in TOKEN.finditer(narration):
        plain = narration[pos:m.start()]
        for ch in plain:
            to_display.append(len(display))
            display += ch
            spoken += ch
        if m.group(1):
            cues[m.group(1)] = len(display)
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
    return display, spoken, to_display, cues


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


async def synthesize(text, voice, rate, out_path):
    words = []
    communicate = edge_tts.Communicate(text, voice, rate=rate, boundary="WordBoundary")
    with open(out_path, "wb") as f:
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                words.append({"text": chunk["text"], "ms": chunk["offset"] / 10000, "dur": chunk["duration"] / 10000})
    return words


def load_dotenv():
    env = ROOT / ".env"
    if not env.exists():
        return
    for line in env.read_text(encoding="utf-8").splitlines():
        m = re.match(r"\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$", line)
        if m and m.group(1) not in os.environ:
            os.environ[m.group(1)] = m.group(2).strip().strip('"').strip("'")


def dashscope_phrase(text, tts, out_path):
    """One CosyVoice request for a short phrase; writes an mp3."""
    key = os.environ.get("DASHSCOPE_API_KEY")
    if not key:
        raise SystemExit("DASHSCOPE_API_KEY is not set (environment or .env)")
    endpoint = os.environ.get("DASHSCOPE_TTS_ENDPOINT", "https://dashscope.aliyuncs.com/api/v1/services/audio/tts/SpeechSynthesizer")
    body = {"model": tts.get("model", "cosyvoice-v3-flash"),
            "input": {"text": text, "voice": tts.get("voice", "longsanshu_v3"), "format": "mp3", "sample_rate": 44100,
                      "rate": tts.get("rate", 1.0), "pitch": tts.get("pitch", 1.0), "volume": tts.get("volume", 60), "language_hints": ["zh"]}}
    req = urllib.request.Request(endpoint, data=json.dumps(body).encode(), method="POST",
                                 headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"})
    ctx = ssl.create_default_context(cafile=os.environ.get("SSL_CERT_FILE")) if os.environ.get("SSL_CERT_FILE") else None
    last = None
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, context=ctx, timeout=60) as r:
                payload = json.loads(r.read())
            audio = payload.get("output", {}).get("audio", {})
            if audio.get("data"):
                data = base64.b64decode(audio["data"])
            else:
                with urllib.request.urlopen(audio["url"], context=ctx, timeout=60) as r:
                    data = r.read()
            Path(out_path).write_bytes(data)
            return
        except Exception as error:  # network hiccups and 429s: back off and retry
            last = error
            import time
            time.sleep(1.5 * (attempt + 1))
    raise SystemExit(f"DashScope TTS failed for {text!r}: {last}")


def phrases(spoken):
    """Split spoken text after every pause mark; each piece is one TTS request."""
    out, start = [], 0
    for i, ch in enumerate(spoken):
        if ch in BREAK:
            out.append(spoken[start:i + 1])
            start = i + 1
    if spoken[start:].strip():
        out.append(spoken[start:])
    return [p for p in out if p.strip(" ，。；：、,;:")]


TRIM = ("silenceremove=start_periods=1:start_threshold=-42dB:start_silence=0.02,areverse,"
        "silenceremove=start_periods=1:start_threshold=-42dB:start_silence=0.04,areverse")


def synthesize_dashscope(text, tts, out_path):
    """Synthesize phrase by phrase, trim each clip's own lead/tail silence, and join with natural pauses
    (short after a comma, longer at a sentence end). Returns per-character pseudo word timings."""
    words, cursor = [], 0.0
    pause = {"comma": tts.get("commaPauseMs", 120), "stop": tts.get("stopPauseMs", 260)}
    with tempfile.TemporaryDirectory() as tmp:
        parts, gaps = [], []
        for i, phrase in enumerate(phrases(text)):
            raw = Path(tmp) / f"{i:03d}-raw.mp3"
            part = Path(tmp) / f"{i:03d}.wav"
            dashscope_phrase(phrase, tts, raw)
            subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(raw), "-af", TRIM, "-ar", "44100", "-ac", "2", str(part)], check=True)
            ms = probe_ms(part)
            gap_ms = pause["stop"] if phrase.rstrip()[-1:] in SENTENCE_END else pause["comma"]
            chars = [ch for ch in phrase if ch.strip()]
            for k, ch in enumerate(chars):
                words.append({"text": ch, "ms": cursor + ms * k / max(1, len(chars)), "dur": ms / max(1, len(chars))})
            parts.append(part)
            gaps.append(gap_ms)
            cursor += ms + gap_ms
        inputs, labels = [], []
        for i, part in enumerate(parts):
            inputs += ["-i", str(part)]
            labels.append(f"[{i}:a]aresample=44100,aformat=channel_layouts=stereo,apad=pad_dur={gaps[i] / 1000}[a{i}]")
        graph = ";".join(labels) + ";" + "".join(f"[a{i}]" for i in range(len(parts))) + f"concat=n={len(parts)}:v=0:a=1[out]"
        subprocess.run(["ffmpeg", "-y", "-v", "error", *inputs, "-filter_complex", graph, "-map", "[out]", "-c:a", "libmp3lame", "-b:a", "192k", str(out_path)], check=True)
    return words


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


async def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    force = "--force" in sys.argv
    spec_path = resolve_tutorial(args[0] if args else None)
    spec = json.loads(spec_path.read_text(encoding="utf-8"))
    load_dotenv()
    tts = spec.get("tts") or {"provider": "edge"}
    voice_key = f"{tts.get('provider')}:{tts.get('voice')}:{tts.get('rate')}" if tts.get("provider") == "dashscope" else f"edge:{spec['voice']}:{spec.get('rate')}"
    audio_dir = ROOT / "public" / "audio" / "tutorials" / spec["id"]
    audio_dir.mkdir(parents=True, exist_ok=True)
    fps, lead, tail = spec["fps"], spec.get("leadMs", 200), spec.get("tailMs", 400)
    scenes, start_frame = [], 0
    for n, scene in enumerate(spec["scenes"], 1):
        display, spoken, to_display, cue_pos = parse(scene["narration"])
        rel = f"audio/tutorials/{spec['id']}/{n:02d}-{scene['id']}.mp3"
        mp3 = ROOT / "public" / rel
        words_cache = mp3.with_suffix(".words.json")
        cache = json.loads(words_cache.read_text(encoding="utf-8")) if words_cache.exists() else {}
        stale = cache.get("spoken") != spoken or cache.get("voice", f"edge:{spec['voice']}:{spec.get('rate')}") != voice_key
        if force or stale or not mp3.exists():
            if tts.get("provider") == "dashscope":
                words = synthesize_dashscope(spoken, tts, mp3)
            else:
                words = await synthesize(spoken, spec["voice"], spec.get("rate", "+0%"), mp3)
            words_cache.write_text(json.dumps({"spoken": spoken, "voice": voice_key, "words": words}, ensure_ascii=False, indent=1), encoding="utf-8")
            print(f"voiced {rel}")
        cached = json.loads(words_cache.read_text(encoding="utf-8"))
        words = align(cached["words"], spoken, to_display)
        audio_ms = probe_ms(mp3)
        speech_end = words[-1]["ms"] + words[-1]["dur"] if words else audio_ms
        duration_frames = math.ceil((lead + audio_ms + tail) / 1000 * fps)
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
    timing = {"id": spec["id"], "voice": tts.get("voice") if tts.get("provider") == "dashscope" else spec["voice"],
              "rate": tts.get("rate") if tts.get("provider") == "dashscope" else spec.get("rate"), "fps": fps, "leadMs": lead,
              "totalFrames": start_frame, "scenes": scenes}
    out = timeline_path(spec_path)
    out.write_text(json.dumps(timing, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{len(scenes)} scenes, {start_frame} frames ({start_frame / fps:.1f}s) -> {out.relative_to(ROOT)}")


if __name__ == "__main__":
    asyncio.run(main())
