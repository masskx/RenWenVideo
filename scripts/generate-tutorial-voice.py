"""Generate per-scene narration + caption/cue timing for a tutorial video.

Usage:
  python scripts/generate-tutorial-voice.py tutorials/rea-quickstart.json [--force]

Narration markup:
  {a}            cue marker; its time (ms from scene start) is written to timing.cues.a
  [显示|朗读]     caption shows the left side, TTS speaks the right side

Outputs:
  public/audio/tutorials/<id>/<nn>-<scene>.mp3
  tutorials/<id>.timing.json
"""
import asyncio
import json
import math
import os
import re
import ssl
import subprocess
import sys
from pathlib import Path

import edge_tts
import edge_tts.communicate

ROOT = Path(__file__).resolve().parent.parent
# Behind a TLS-inspecting proxy edge-tts must trust the proxy CA; it pins certifi otherwise.
_ca = os.environ.get("TTS_CA_BUNDLE") or os.environ.get("SSL_CERT_FILE")
if _ca and Path(_ca).exists():
    edge_tts.communicate._SSL_CTX = ssl.create_default_context(cafile=_ca)

TOKEN = re.compile(r"\{([a-z0-9]+)\}|\[([^\]|]+)\|([^\]]+)\]")
BREAK = set("，。？！；：、,?!;:")
KEEP_TAIL = set("？！?!")
MAX_CAPTION = 15
MERGE_BELOW = 6
MERGE_MAX = 14


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
        # fold very short fragments ("第一步，") into the following phrase
        if merged and merged[-1][1] - merged[-1][0] < MERGE_BELOW and e - merged[-1][0] <= MERGE_MAX:
            merged[-1] = (merged[-1][0], e)
        else:
            merged.append((s, e))
    out = []
    for s, e in merged:
        while e - s > MAX_CAPTION:
            # split long runs at a space if possible, else in the middle
            mid = s + (e - s) // 2
            spaces = [k for k in range(s + 4, e - 4) if display[k] == " "]
            cut = min(spaces, key=lambda k: abs(k - mid)) + 1 if spaces else mid
            out.append((s, cut))
            s = cut
        out.append((s, e))
    return [(s, e) for s, e in out if display[s:e].strip(" ，。；：、,;:")]


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
    spec_path = ROOT / (args[0] if args else "tutorials/rea-quickstart.json")
    spec = json.loads(spec_path.read_text(encoding="utf-8"))
    audio_dir = ROOT / "public" / "audio" / "tutorials" / spec["id"]
    audio_dir.mkdir(parents=True, exist_ok=True)
    fps, lead, tail = spec["fps"], spec.get("leadMs", 200), spec.get("tailMs", 400)
    scenes, start_frame = [], 0
    for n, scene in enumerate(spec["scenes"], 1):
        display, spoken, to_display, cue_pos = parse(scene["narration"])
        rel = f"audio/tutorials/{spec['id']}/{n:02d}-{scene['id']}.mp3"
        mp3 = ROOT / "public" / rel
        words_cache = mp3.with_suffix(".words.json")
        stale = not words_cache.exists() or json.loads(words_cache.read_text(encoding="utf-8")).get("spoken") != spoken
        if force or stale or not mp3.exists():
            words = await synthesize(spoken, spec["voice"], spec.get("rate", "+0%"), mp3)
            words_cache.write_text(json.dumps({"spoken": spoken, "words": words}, ensure_ascii=False, indent=1), encoding="utf-8")
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
        for i, (s, e) in enumerate(chunks):
            end = starts[i + 1] if i + 1 < len(chunks) else speech_end + 250
            text = clean_caption(display[s:e])
            if text:
                captions.append({"text": text, "startMs": round(lead + starts[i]), "endMs": round(lead + end)})
        scenes.append({"id": scene["id"], "audioSrc": rel, "audioMs": round(audio_ms), "startFrame": start_frame,
                       "durationFrames": duration_frames, "cues": cues, "captions": captions})
        start_frame += duration_frames
    timing = {"id": spec["id"], "voice": spec["voice"], "rate": spec.get("rate"), "fps": fps, "leadMs": lead,
              "totalFrames": start_frame, "scenes": scenes}
    out = spec_path.with_name(f"{spec['id']}.timing.json")
    out.write_text(json.dumps(timing, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{len(scenes)} scenes, {start_frame} frames ({start_frame / fps:.1f}s) -> {out.relative_to(ROOT)}")


if __name__ == "__main__":
    asyncio.run(main())
