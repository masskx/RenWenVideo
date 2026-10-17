#!/usr/bin/env python3
"""青春，别拿健康冒险 — school drug-prevention PSA, rendered end to end from project.json.

    python output/render.py              # full render -> output/final_video.mp4 (+ subtitles, tracks, QA sheets)
    python output/render.py --draft      # faster preview (540x960) -> work/draft.mp4
    python output/render.py --only-qa    # re-run the checks on output/final_video.mp4
    python output/render.py --force-tts  # re-synthesize the narration (otherwise cached in work/tts/)

Everything the film says, shows and plays is in project.json (narration per act, shots with source clip / in-point /
focus / camera move, overlays anchored to spoken words with "@词", sound effects). Edit that file and run again.

Pipeline (Python + FFmpeg + libass + Pillow):
  1. narration per act — Doubao TTS with the user's cloned voice (DOUBAO_API_KEY, DOUBAO_VOICE_ZH; whole act per
     request, per-character timestamps); if that fails, edge-tts (Microsoft neural voice, word boundaries). Cached.
  2. timeline — each act is as long as its narration needs (>= "min"); shot lengths follow their weights.
  3. shots — every shot is cut from the 4K/1080p source, cropped to 9:16 around "focus", moved with an eased
     push / pull / pan (zoompan on a 2x canvas so the motion stays smooth), graded for its act
     (noir -> cold -> mono -> warm -> golden), optionally with a rack-focus in.
  4. acts joined with motivated transitions (fade / fade-to-black / fade-to-white).
  5. graphics and subtitles — one ASS file (libass): subtitles from the timestamps, kinetic titles, warning cards,
     the help card, the end card; the phone notification is a Pillow PNG overlaid with a slide-in.
  6. audio — narration, two licensed music beds (ducked under the voice), sound effects on their cues;
     loudness-normalised to about -14 LUFS. Stems are kept in tracks/.
  7. QA — ffprobe, black-frame detection, a key-frame contact sheet, subtitle-overlap and safe-area checks.
"""
import argparse
import asyncio
import base64
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import time
import urllib.request
import uuid
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent          # output/
ROOT = HERE.parent                              # project root (assets/, work/, tracks/)
WORK, TRACKS, QA = ROOT / "work", ROOT / "tracks", HERE / "qa"
FPS = 30
W, H = 1080, 1920
PUNCT = "，。？！：；、“”‘’（）《》·…—,.?!:; "
RED = "&H1B25E1&"                               # safety red #E1251B in ASS (&HBBGGRR&)

GRADES = {
    # act colour scripts: cool and drained while the danger grows, warm once the right choices begin
    "noir": "eq=contrast=1.18:brightness=-0.04:saturation=0.35,colorbalance=bs=0.06:bm=0.03,vignette=angle=PI/4.2",
    "cold": "eq=contrast=1.10:brightness=-0.05:saturation=0.55,colorbalance=rs=-0.06:bs=0.10:rm=-0.04:bm=0.06,vignette=angle=PI/4.5",
    "mono": "hue=s=0,eq=contrast=1.20:brightness=-0.13,vignette=angle=PI/4",
    "warm": "eq=contrast=1.04:brightness=0.02:saturation=1.08,colorbalance=rs=0.05:gs=0.01:bs=-0.06:rh=0.04:bh=-0.04,vignette=angle=PI/6",
    "golden": "eq=contrast=1.06:brightness=0.03:saturation=1.15,colorbalance=rs=0.08:gs=0.03:bs=-0.08:rh=0.06:bh=-0.06,vignette=angle=PI/6",
}


def run(cmd, quiet=True):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        sys.stderr.write(r.stderr[-3000:])
        raise SystemExit(f"command failed: {' '.join(map(str, cmd[:6]))} …")
    return r


def probe(path, entries="format=duration"):
    out = run(["ffprobe", "-v", "error", "-show_entries", entries, "-of", "json", str(path)]).stdout
    return json.loads(out)


def duration(path):
    return float(probe(path)["format"]["duration"])


def find_font():
    """A CJK font file for Pillow and a fonts dir for libass: assets/fonts first, then fontconfig."""
    local = sorted((ROOT / "assets/fonts").glob("*.[ot]t[fc]"))
    if local:
        return local[0]
    path = run(["fc-match", "-f", "%{file}", "Noto Sans CJK SC:style=Bold"]).stdout.strip()
    if not path:
        raise SystemExit("No CJK font found: put NotoSansCJKsc / SourceHanSansSC / msyh into assets/fonts/")
    return Path(path)


# ---------------------------------------------------------------- narration

def doubao_tts(text, rate, out_mp3):
    """Doubao TTS v3, cloned voice. Returns [(text, start_s, end_s)] tokens from enable_subtitle."""
    key, voice = os.environ.get("DOUBAO_API_KEY"), os.environ.get("DOUBAO_VOICE_ZH")
    if not key or not voice:
        raise RuntimeError("DOUBAO_API_KEY / DOUBAO_VOICE_ZH not set")
    # expressive model: more pitch movement on the cloned voice (docs/video-craft/配音.md §〇·三)
    body = json.dumps({"req_params": {"text": text, "speaker": voice, "model": "seed-tts-2.0-expressive", "audio_params": {
        "format": "mp3", "sample_rate": 24000, "enable_subtitle": True, "speech_rate": round((rate - 1) * 100)}}}).encode()
    last = None
    for attempt in range(3):
        req = urllib.request.Request("https://openspeech.bytedance.com/api/v3/tts/unidirectional", data=body, method="POST", headers={
            "Content-Type": "application/json", "X-Api-Key": key, "X-Api-Resource-Id": "seed-icl-2.0", "X-Api-Request-Id": str(uuid.uuid4())})
        audio, words, err = bytearray(), {}, None
        try:
            with urllib.request.urlopen(req, timeout=180) as r:
                for line in r:
                    if not line.strip():
                        continue
                    msg = json.loads(line)
                    if msg.get("data"):
                        audio += base64.b64decode(msg["data"])
                    for w in (msg.get("sentence") or {}).get("words") or []:
                        words[(round(w["startTime"], 3), w["word"])] = w
                    if msg.get("code") not in (0, None, 20000000):
                        err = f"{msg.get('code')}: {msg.get('message')}"
            if audio and not err:
                out_mp3.write_bytes(bytes(audio))
                return [(w["word"], w["startTime"], w["endTime"]) for w in sorted(words.values(), key=lambda w: w["startTime"])]
            last = err or "no audio"
        except Exception as e:  # network / HTTP errors: retry, then fall back
            last = str(e)[:200]
        time.sleep(2 * (attempt + 1))
    raise RuntimeError(f"Doubao TTS failed: {last}")


def edge_tts_synth(text, voice, rate, out_mp3):
    import edge_tts

    async def go():
        pct = f"{round((rate - 1) * 100):+d}%"
        comm = edge_tts.Communicate(text, voice, rate=pct, boundary="WordBoundary")
        tokens, audio = [], bytearray()
        async for chunk in comm.stream():
            if chunk["type"] == "audio":
                audio += chunk["data"]
            elif chunk["type"] == "WordBoundary":
                t0 = chunk["offset"] / 1e7
                tokens.append((chunk["text"], t0, t0 + chunk["duration"] / 1e7))
        out_mp3.write_bytes(bytes(audio))
        return tokens
    return asyncio.run(go())


def char_times(text, tokens):
    """Map every non-punctuation character of `text` to a time, walking the TTS tokens in order."""
    stream = []
    for tok, t0, t1 in tokens:
        chars = [c for c in tok if c not in PUNCT]
        for i, c in enumerate(chars):
            stream.append((c, t0 + (t1 - t0) * i / max(1, len(chars)), t0 + (t1 - t0) * (i + 1) / max(1, len(chars))))
    out, j = {}, 0
    for i, c in enumerate(text):
        if c in PUNCT:
            continue
        # resync: look a few characters ahead in the token stream for this character
        for k in range(j, min(j + 4, len(stream))):
            if stream[k][0] == c:
                j = k
                break
        if j < len(stream):
            out[i] = (stream[j][1], stream[j][2])
            j += 1
        elif stream:
            out[i] = (stream[-1][2], stream[-1][2])
    return out


def narrate(act, cfg, force=False):
    """-> (wav path, duration, {char index: (t0, t1)}, engine) for one act, cached by text + voice + pace."""
    rate = cfg["voice"]["paces"].get(act.get("pace", "normal"), 1.1)
    text = act["narration"]
    key = hashlib.sha1(f"{text}|{rate}|{os.environ.get('DOUBAO_VOICE_ZH', '')}|{cfg['voice']['provider']}".encode()).hexdigest()[:12]
    d = WORK / "tts"
    d.mkdir(parents=True, exist_ok=True)
    wav, meta = d / f"{act['id']}-{key}.wav", d / f"{act['id']}-{key}.json"
    if wav.exists() and meta.exists() and not force:
        m = json.loads(meta.read_text())
        return wav, m["dur"], {int(k): tuple(v) for k, v in m["chars"].items()}, m["engine"]
    mp3 = d / f"{act['id']}-{key}.mp3"
    engine = "doubao (cloned voice)"
    try:
        if cfg["voice"]["provider"] != "doubao":
            raise RuntimeError("provider is not doubao")
        tokens = doubao_tts(text, rate, mp3)
    except RuntimeError as e:
        print(f"  [{act['id']}] {e} -> falling back to edge-tts {cfg['voice']['fallback']}")
        tokens = edge_tts_synth(text, cfg["voice"]["fallback"], rate, mp3)
        engine = f"edge-tts {cfg['voice']['fallback']}"
    # trim the tail silence only; keep the head so the timestamps stay valid
    run(["ffmpeg", "-y", "-v", "error", "-i", str(mp3), "-af", "areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse",
         "-ar", "48000", "-ac", "2", str(wav)])
    chars = char_times(text, tokens)
    dur = duration(wav)
    meta.write_text(json.dumps({"dur": dur, "chars": chars, "engine": engine, "text": text}, ensure_ascii=False))
    return wav, dur, chars, engine


# ---------------------------------------------------------------- timeline

def plan(cfg, force_tts=False):
    t = 0.0
    for k, act in enumerate(cfg["acts"]):
        wav, vdur, chars, engine = narrate(act, cfg, force_tts)
        act["_wav"], act["_vdur"], act["_chars"], act["_engine"] = wav, vdur, chars, engine
        need = act["voice_at"] + vdur + act.get("tail", 0.6)
        act["_len"] = round(max(act.get("min", 0), need) * FPS) / FPS
        overlap = act["transition"]["dur"] if act.get("transition") and k else 0
        act["_start"] = t - overlap
        t = act["_start"] + act["_len"]
        fixed = sum(s.get("black", 0) for s in act["shots"])
        weights = sum(s.get("w", 0) for s in act["shots"])
        frames_left = round((act["_len"] - fixed) * FPS)
        acc = 0
        clips = [s for s in act["shots"] if "clip" in s]
        for i, s in enumerate(act["shots"]):
            if "black" in s:
                s["_frames"] = round(s["black"] * FPS)
            else:
                share = round(frames_left * s["w"] / weights) if i != len(act["shots"]) - 1 or s is not clips[-1] else frames_left - acc
                s["_frames"] = share
                acc += share
        # fix rounding so the shots fill the act exactly
        diff = round(act["_len"] * FPS) - sum(s["_frames"] for s in act["shots"])
        clips[-1]["_frames"] += diff
    cfg["_total"] = t
    for k, act in enumerate(cfg["acts"]):
        act["_vis_end"] = cfg["acts"][k + 1]["_start"] if k + 1 < len(cfg["acts"]) else t
    return cfg


def at_time(act, spec):
    """'@词' -> the moment that word is spoken (absolute seconds); a number -> seconds into the act; 'end' -> the moment the
    next act starts to cross-fade in (so text never sits on a transition flash)."""
    if spec == "end":
        return act["_vis_end"]
    if isinstance(spec, (int, float)):
        return act["_start"] + spec
    word = spec.lstrip("@")
    i = act["narration"].find(word)
    if i < 0:
        raise SystemExit(f"{act['id']}: anchor {spec} not in narration")
    while i in range(len(act["narration"])) and i not in act["_chars"]:
        i += 1
    return act["_start"] + act["voice_at"] + act["_chars"][i][0]


# ---------------------------------------------------------------- shots

def move_expr(move, n):
    p = f"min(1,on/{max(1, n - 1)})"
    e = f"({p}*{p}*(3-2*{p}))"  # smoothstep: camera moves ease in and out
    cx, cy = "iw/2-(iw/zoom/2)", "ih/2-(ih/zoom/2)"
    return {
        "push": (f"1+0.07*{e}", cx, cy),
        "push_fast": (f"1+0.15*{e}", cx, cy),
        "push_slow": (f"1+0.04*{e}", cx, cy),
        "pull": (f"1.09-0.07*{e}", cx, cy),
        "pan_r": ("1.12", f"(iw-iw/zoom)*(0.1+0.8*{e})", cy),
        "pan_l": ("1.12", f"(iw-iw/zoom)*(0.9-0.8*{e})", cy),
    }.get(move, ("1", cx, cy))


def render_shot(shot, grade, out, scale=1.0):
    n = shot["_frames"]
    w, h = int(W * scale) // 2 * 2, int(H * scale) // 2 * 2
    if "black" in shot:
        run(["ffmpeg", "-y", "-v", "error", "-f", "lavfi", "-i", f"color=c=black:s={w}x{h}:r={FPS}", "-frames:v", str(n),
             "-c:v", "libx264", "-crf", "14", "-pix_fmt", "yuv420p", str(out)])
        return
    src = ROOT / f"assets/video/mixkit-{shot['clip']}.mp4"
    info = probe(src, "stream=width,height:format=duration")
    sw, sh = info["streams"][0]["width"], info["streams"][0]["height"]
    sdur = float(info["format"]["duration"])
    need = n / FPS + 0.3
    start = min(shot.get("in", 0), max(0, sdur - need))
    if start != shot.get("in", 0):
        print(f"  note: {shot['clip']} in-point moved to {start:.2f}s to fit {n / FPS:.2f}s")
    if sw / sh > W / H:   # landscape -> 9:16 window around the subject
        cw, ch = int(sh * W / H) // 2 * 2, sh
        cx = int(min(max(shot.get("focus", 0.5) * sw - cw / 2, 0), sw - cw)) // 2 * 2
        cy = 0
    else:
        cw, ch = sw, int(sw * H / W) // 2 * 2
        cx, cy = 0, (sh - ch) // 2
    z, x, y = move_expr(shot.get("move"), n)
    big_w, big_h = w * 2, h * 2   # zoompan on a 2x canvas: sub-pixel steps become invisible after downscale
    vf = (f"fps={FPS},crop={cw}:{ch}:{cx}:{cy},scale={big_w}:{big_h}:flags=bicubic,"
          f"zoompan=z='{z}':x='{x}':y='{y}':d=1:s={w}x{h}:fps={FPS},setsar=1")
    if shot.get("rack"):  # rack focus in: from a soft blur to sharp over the first ~1.1 s
        q = "min(1,T/1.1)"
        vf += f",split[a][b];[a]gblur=sigma={30 * scale:.1f}[blur];[blur][b]blend=all_expr='A+(B-A)*{q}*{q}*(3-2*{q})'"
    vf += f",{GRADES[grade]},format=yuv420p"
    run(["ffmpeg", "-y", "-v", "error", "-ss", f"{start:.3f}", "-t", f"{need:.3f}", "-i", str(src), "-filter_complex", vf,
         "-frames:v", str(n), "-an", "-c:v", "libx264", "-crf", "14", "-preset", "fast", "-pix_fmt", "yuv420p", str(out)])


def build_video(cfg, scale, tag):
    d = WORK / f"shots{tag}"
    d.mkdir(parents=True, exist_ok=True)
    acts = []
    for act in cfg["acts"]:
        parts = []
        for i, s in enumerate(act["shots"]):
            key = hashlib.sha1(json.dumps({k: v for k, v in s.items() if not k.startswith("_")} | {"n": s["_frames"], "g": act["grade"], "sc": scale,
                                                                                                  "vf": GRADES[act["grade"]]}, sort_keys=True).encode()).hexdigest()[:10]
            out = d / f"{act['id']}-{i:02d}-{key}.mp4"
            if not out.exists():
                print(f"  shot {act['id']}#{i} {s.get('clip', 'black')} {s['_frames'] / FPS:.2f}s {s.get('move', '')}")
                render_shot(s, act["grade"], out, scale)
            parts.append(out)
        lst = d / f"{act['id']}.txt"
        lst.write_text("".join(f"file '{p.name}'\n" for p in parts))
        act_file = d / f"{act['id']}.mp4"
        run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", str(lst), "-c", "copy", str(act_file)])
        acts.append(act_file)
    # join the acts with their transitions
    inputs, chain, last = [], [], "[0:v]"
    for i, f in enumerate(acts):
        inputs += ["-i", str(f)]
    for k in range(1, len(acts)):
        tr = cfg["acts"][k]["transition"] or {"kind": "fade", "dur": 1 / FPS}
        label = f"[v{k}]"
        chain.append(f"{last}[{k}:v]xfade=transition={tr['kind']}:duration={tr['dur']}:offset={cfg['acts'][k]['_start']:.4f}{label}")
        last = label
    base = WORK / f"base{tag}.mp4"
    run(["ffmpeg", "-y", "-v", "error", *inputs, "-filter_complex", ";".join(chain), "-map", last, "-c:v", "libx264", "-crf", "15",
         "-preset", "medium", "-pix_fmt", "yuv420p", "-r", str(FPS), str(base)])
    return base


# ---------------------------------------------------------------- graphics: ASS (libass) + PNG

def ts(t):
    t = max(0, t)
    return f"{int(t // 3600)}:{int(t // 60) % 60:02d}:{int(t) % 60:02d}.{int(round((t - int(t)) * 100)) % 100:02d}"


MAX_SUB = 13  # characters per subtitle line (≈ 58 px glyphs → fits the 900 px safe width)


def split_line(part):
    """Split a too-long run of (index, char) at the comma / 、 nearest its middle (never inside a word)."""
    vis = [p for p in part if p[1] not in PUNCT]
    if len(vis) <= MAX_SUB:
        return [part]
    cuts = [k for k, (_, c) in enumerate(part[:-1]) if c in "，、"]
    if not cuts:
        return [part]
    mid = len(part) / 2
    k = min(cuts, key=lambda c: abs(c - mid))
    return split_line(part[:k + 1]) + split_line(part[k + 1:])


def chunks(act):
    """Subtitle lines: one sentence each (。？！：；), long sentences split at a comma; times from the narration timestamps."""
    text, out, cur = act["narration"], [], []
    for i, c in enumerate(text):
        cur.append((i, c))
        if c in "。？！：；":
            out += split_line(cur)
            cur = []
    if cur:
        out += split_line(cur)
    lines = []
    for part in out:
        idx = [i for i, c in part if i in act["_chars"]]
        if not idx:
            continue
        s = "".join(c for _, c in part).strip().strip("，。、：；")
        t0 = act["_start"] + act["voice_at"] + act["_chars"][idx[0]][0]
        t1 = act["_start"] + act["voice_at"] + act["_chars"][idx[-1]][1]
        lines.append([s, t0, t1])
    for a, b in zip(lines, lines[1:]):
        a[2] = min(max(a[2] + 0.3, a[2]), b[1] - 0.04)
    if lines:
        lines[-1][2] += 0.4
    return lines


def kinetic(text, x0, y, size, t0, t1, style="Big", color="&HFFFFFF&", stagger=0.05, rise=26, align_center=True):
    """Per-character reveal: each glyph fades in, sharpens from a blur and settles from a small rise — staggered."""
    n = len(text)
    widths = [size * 0.69 if ord(c) > 255 else size * 0.36 for c in text]  # libass glyph advance for Noto CJK, measured
    total = sum(widths)
    x = x0 - total / 2 if align_center else x0
    ev = []
    for i, c in enumerate(text):
        cxp = x + widths[i] / 2
        x += widths[i]
        if c == " ":
            continue
        s = t0 + i * stagger
        ms = int(260)
        ev.append(f"Dialogue: 2,{ts(s)},{ts(t1)},{style},,0,0,0,,{{\\an5\\fs{size}\\c{color}\\move({cxp:.0f},{y + rise},{cxp:.0f},{y},0,{ms})"
                  f"\\blur6\\t(0,{ms},\\blur0)\\fad(180,260)}}{c}")
    return ev


def rect(x, y, w, h, t0, t1, color=RED, grow=True, layer=1, alpha="00"):
    tg = "\\fscx0\\t(0,320,\\fscx100)" if grow else ""
    return (f"Dialogue: {layer},{ts(t0)},{ts(t1)},Shape,,0,0,0,,{{\\an7\\pos({x},{y})\\c{color}\\1a&H{alpha}&{tg}\\fad(120,200)\\p1}}"
            f"m 0 0 l {w} 0 l {w} {h} l 0 {h}{{\\p0}}")


def wrap(text, n):
    return [text[i:i + n] for i in range(0, len(text), n)]


def build_ass(cfg, font_family):
    head = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Sub,{font_family},84,&H00FFFFFF,&H00FFFFFF,&H00101010,&H64000000,-1,0,0,0,100,100,2,0,1,3.4,1.5,2,90,90,470,1
Style: BigSub,{font_family},100,&H00FFFFFF,&H00FFFFFF,&H00101010,&H64000000,-1,0,0,0,100,100,4,0,1,3.6,2,2,80,80,520,1
Style: Big,{font_family},100,&H00FFFFFF,&H00FFFFFF,&H00141414,&H70000000,-1,0,0,0,100,100,0,0,1,4.2,4,5,0,0,0,1
Style: Text,{font_family},60,&H00FFFFFF,&H00FFFFFF,&H00101010,&H80000000,-1,0,0,0,100,100,2,0,1,2.4,2,7,0,0,0,1
Style: Note,{font_family},44,&H00E6E6E6,&H00FFFFFF,&H00101010,&H80000000,0,0,0,0,100,100,1,0,1,1.6,1,7,0,0,0,1
Style: Shape,{font_family},20,&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,0,0,7,0,0,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    ev, srt = [], []
    for act in cfg["acts"]:
        mode = act.get("subs", "normal")
        for s, t0, t1 in chunks(act):
            srt.append((s, t0, t1))
            if mode == "none":
                continue
            style = "BigSub" if mode == "big" else "Sub"
            ev.append(f"Dialogue: 0,{ts(t0)},{ts(t1)},{style},,0,0,0,,{{\\fad(120,120)}}{s}")
        end = act["_vis_end"]
        for o in act.get("overlays", []):
            t0 = at_time(act, o["at"])
            t1 = at_time(act, o["until"]) - 0.08 if "until" in o else (t0 + o["dur"] if "dur" in o else end)
            if o["type"] == "title":
                ev += kinetic(o["text"], 540, 900, 128, t0, t1, stagger=0.06)
                ev.append(rect(280, 1000, 520, 8, t0 + 0.35, t1))
                ev.append(f"Dialogue: 2,{ts(t0 + 0.5)},{ts(t1)},Note,,0,0,0,,{{\\an5\\pos(540,1066)\\fs40\\fsp6\\fad(250,200)}}{o['sub']}")
            elif o["type"] == "hook":
                t_b = at_time(act, o["at2"])
                ev += kinetic(o["lines"][0], 540, 1180, 110, t0, t1, stagger=0.07)
                ev += kinetic(o["lines"][1], 540, 1320, 110, t_b, t1, stagger=0.06)
            elif o["type"] == "ecg":
                # a red ECG trace drawn left to right on the black opening, one spike per heartbeat
                for beat in o["beats"]:
                    b0 = act["_start"] + beat
                    path = "m 0 0 l 300 0 l 330 -20 l 350 0 l 380 0 l 400 60 l 425 -260 l 450 140 l 470 0 l 520 0 l 550 -40 l 590 0 l 1080 0"
                    ev.append(f"Dialogue: 1,{ts(b0 - 0.1)},{ts(b0 + 0.9)},Shape,,0,0,0,,{{\\an7\\pos(0,960)\\c{RED}\\bord5\\3c{RED}\\1a&HFF&"
                              f"\\clip(0,0,0,1920)\\t(0,500,\\clip(0,0,1080,1920))\\fad(0,350)\\p1}}{path}{{\\p0}}")
            elif o["type"] == "card":
                y = 560
                ev.append(rect(80, y - 4, 10, 300, t0, t1))
                ev.append(f"Dialogue: 2,{ts(t0)},{ts(t1)},Text,,0,0,0,,{{\\an7\\move(70,{y - 130},120,{y - 130},0,300)\\fs88\\c{RED}\\blur4\\t(0,300,\\blur0)\\fad(150,200)}}{o['index']}")
                ev.append(f"Dialogue: 2,{ts(t0 + 0.08)},{ts(t1)},Text,,0,0,0,,{{\\an7\\move(80,{y},120,{y},0,320)\\fs96\\blur5\\t(0,320,\\blur0)\\fad(150,200)}}{o['lines'][0]}")
                ev.append(f"Dialogue: 2,{ts(t0 + 0.22)},{ts(t1)},Text,,0,0,0,,{{\\an7\\move(80,{y + 130},120,{y + 130},0,320)\\fs140\\blur5\\t(0,320,\\blur0)\\fad(150,200)}}{o['lines'][1]}")
                if o.get("note"):
                    for k, line in enumerate(wrap(o["note"], 26)):
                        ev.append(f"Dialogue: 2,{ts(t0 + 0.8)},{ts(t1)},Note,,0,0,0,,{{\\an7\\pos(120,{y + 360 + k * 52})\\fad(300,200)}}{line}")
            elif o["type"] == "pill":
                ev += kinetic(o["lines"][0], 540, 420, 140, t0, t1)
                ev += kinetic(o["lines"][1], 540, 590, 140, t0 + 0.25, t1)
                ev.append(rect(440, 690, 200, 8, t0 + 0.4, t1, color="&H3FA6FF&"))
            elif o["type"] == "help":
                # lower panel (faces sit in the upper half of these shots): dark backing for legibility
                ev.append(f"Dialogue: 1,{ts(t0)},{ts(t1)},Shape,,0,0,0,,{{\\an7\\pos(60,760)\\c&H000000&\\1a&H50&\\blur12\\fad(250,200)\\p1}}m 0 0 l 960 0 l 960 560 l 0 560{{\\p0}}")
                ev.append(f"Dialogue: 2,{ts(t0)},{ts(t1)},Text,,0,0,0,,{{\\an7\\pos(110,790)\\fs70\\fad(200,200)}}{o['title']}")
                for k, item in enumerate(o["items"]):
                    s = t0 + 0.25 + 0.18 * k
                    ev.append(rect(110, 900 + k * 100, 12, 64, s, t1, color="&H3FA6FF&", grow=False))
                    ev.append(f"Dialogue: 2,{ts(s)},{ts(t1)},Text,,0,0,0,,{{\\an7\\move(150,{900 + k * 100 - 4},150,{900 + k * 100 - 16},0,260)\\fs96\\fad(160,200)}}{item}")
                s = t0 + 0.9
                ev.append(f"Dialogue: 2,{ts(s)},{ts(t1)},Text,,0,0,0,,{{\\an7\\pos(110,1215)\\fs72\\c&H3FA6FF&\\fad(200,200)}}{o['foot']}")
            elif o["type"] == "final":
                ev += kinetic(o["lines"][0], 540, 620, 200, t0, end, stagger=0.09, rise=40)
                ev += kinetic(o["lines"][1], 540, 830, 200, t0 + 0.45, end, stagger=0.09, rise=40)
            elif o["type"] == "endcard":
                ev.append(rect(240, 1020, 600, 8, t0, end))
                ev += kinetic(o["lines"][0], 540, 1130, 96, t0 + 0.1, end, stagger=0.04, rise=18)
                ev += kinetic(o["lines"][1], 540, 1280, 130, t0 + 0.5, end, stagger=0.06, rise=22, color=RED)
    return head + "\n".join(ev) + "\n", srt


def notify_png(o, font, out):
    """A neutral phone notification (no real app, no logo): dark rounded card, generic chat icon, two lines."""
    w, h, s = 900, 200, 2
    img = Image.new("RGBA", (w * s, h * s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 0, w * s - 1, h * s - 1], radius=44 * s, fill=(28, 28, 32, 236))
    d.rounded_rectangle([34 * s, 40 * s, 118 * s, 124 * s], radius=22 * s, fill=(90, 90, 98, 255))
    d.rounded_rectangle([52 * s, 62 * s, 100 * s, 96 * s], radius=10 * s, fill=(235, 235, 240, 255))
    d.polygon([(60 * s, 94 * s), (58 * s, 108 * s), (74 * s, 95 * s)], fill=(235, 235, 240, 255))
    f1 = ImageFont.truetype(str(font), 34 * s)
    f2 = ImageFont.truetype(str(font), 46 * s)
    for f in (f1, f2):
        try:
            f.set_variation_by_name("Bold")
        except Exception:
            pass
    d.text((146 * s, 34 * s), o.get("app", "新消息"), font=f1, fill=(170, 170, 180, 255))
    d.text((w * s - 120 * s, 34 * s), "刚刚", font=f1, fill=(140, 140, 150, 255))
    d.text((146 * s, 92 * s), o["text"], font=f2, fill=(255, 255, 255, 255))
    img.resize((w, h), Image.LANCZOS).save(out)


# ---------------------------------------------------------------- audio

def build_audio(cfg, out_mix):
    total = cfg["_total"]
    inputs, f, labels = [], [], {"vo": [], "mus": [], "sfx": []}

    def add(path):
        inputs.extend(["-i", str(path)])
        return len(inputs) // 2 - 1
    for act in cfg["acts"]:
        k = add(act["_wav"])
        ms = int((act["_start"] + act["voice_at"]) * 1000)
        f.append(f"[{k}:a]aformat=sample_rates=48000:channel_layouts=stereo,adelay={ms}|{ms},volume=1.0[vo{k}]")
        labels["vo"].append(f"[vo{k}]")
    acts = {a["id"]: a for a in cfg["acts"]}
    for m in cfg["music"]:
        k = add(ROOT / m["file"])
        start = acts[m["from_act"]]["_start"]
        stop = total if m["to_act"] == "end" else acts[m["to_act"]]["_start"] + (acts[m["to_act"]]["transition"] or {"dur": 0})["dur"]
        length = stop - start
        ms = int(start * 1000)
        f.append(f"[{k}:a]aformat=sample_rates=48000:channel_layouts=stereo,atrim=start={m['offset']}:duration={length:.3f},asetpts=PTS-STARTPTS,"
                 f"afade=t=in:d={m['fade_in']},afade=t=out:st={length - m['fade_out']:.3f}:d={m['fade_out']},volume={m['gain_db']}dB,adelay={ms}|{ms}[mu{k}]")
        labels["mus"].append(f"[mu{k}]")
    for act in cfg["acts"]:
        for s in act.get("sfx", []):
            k = add(ROOT / "assets/sfx" / s["file"])
            ms = int(at_time(act, s["at"]) * 1000)
            f.append(f"[{k}:a]aformat=sample_rates=48000:channel_layouts=stereo,volume={s['gain_db']}dB,adelay={ms}|{ms}[sx{k}]")
            labels["sfx"].append(f"[sx{k}]")
    n = lambda lst: len(lst)
    f.append(f"{''.join(labels['vo'])}amix=inputs={n(labels['vo'])}:normalize=0,apad=whole_dur={total:.3f},asplit=3[vo][key][vostem]")
    f.append(f"{''.join(labels['mus'])}amix=inputs={n(labels['mus'])}:normalize=0,apad=whole_dur={total:.3f}[mus]")
    # duck the music under the voice (sidechain), so narration always stays on top
    f.append("[mus][key]sidechaincompress=threshold=0.025:ratio=7:attack=15:release=420:makeup=1,asplit=2[mduck][mstem]")
    f.append(f"{''.join(labels['sfx'])}amix=inputs={n(labels['sfx'])}:normalize=0,apad=whole_dur={total:.3f},asplit=2[sfx][sstem]")
    f.append(f"[vo][mduck][sfx]amix=inputs=3:normalize=0,atrim=duration={total:.3f},afade=t=out:st={total - 0.6:.3f}:d=0.6,"
             f"alimiter=limit=0.89,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[mix]")
    TRACKS.mkdir(exist_ok=True)
    run(["ffmpeg", "-y", "-v", "error", *inputs, "-filter_complex", ";".join(f),
         "-map", "[mix]", "-c:a", "pcm_s16le", str(out_mix),
         "-map", "[vostem]", "-c:a", "pcm_s16le", str(TRACKS / "voice.wav"),
         "-map", "[mstem]", "-c:a", "pcm_s16le", str(TRACKS / "music_ducked.wav"),
         "-map", "[sstem]", "-c:a", "pcm_s16le", str(TRACKS / "sfx.wav")])


# ---------------------------------------------------------------- final + QA

def srt_time(t):
    ms = int(round(t * 1000))
    return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"


def qa(video, cfg=None):
    QA.mkdir(exist_ok=True)
    info = probe(video, "stream=codec_type,codec_name,width,height,r_frame_rate,sample_rate,channels:format=duration,size,bit_rate")
    rep = ["# QA report", "", f"file: {video.relative_to(ROOT)}", f"duration: {float(info['format']['duration']):.2f} s",
           f"size: {int(info['format']['size']) / 1e6:.1f} MB"]
    for s in info["streams"]:
        rep.append(f"stream: {s['codec_type']} {s['codec_name']} " + (f"{s['width']}x{s['height']} @ {s['r_frame_rate']}" if s["codec_type"] == "video" else f"{s['sample_rate']} Hz x{s['channels']}"))
    bd = run(["ffmpeg", "-v", "info", "-i", str(video), "-vf", "blackdetect=d=0.25:pic_th=0.97", "-an", "-f", "null", "-"]).stderr
    blacks = re.findall(r"black_start:([\d.]+) black_end:([\d.]+)", bd)
    rep.append("black intervals (>=0.25 s): " + (", ".join(f"{float(a):.2f}–{float(b):.2f}" for a, b in blacks) or "none"))
    lu = run(["ffmpeg", "-i", str(video), "-af", "ebur128", "-f", "null", "-"]).stderr
    m = re.findall(r"I:\s+(-?[\d.]+) LUFS", lu)
    rep.append(f"integrated loudness: {m[-1] if m else '?'} LUFS")
    # key frames every 3 s -> contact sheet
    frames = QA / "frames"
    shutil.rmtree(frames, ignore_errors=True)
    frames.mkdir()
    run(["ffmpeg", "-y", "-v", "error", "-i", str(video), "-vf", "fps=1/3,scale=270:480", str(frames / "f%03d.jpg")])
    files = sorted(frames.glob("*.jpg"))
    cols = 9
    sheet = Image.new("RGB", (cols * 270, ((len(files) + cols - 1) // cols) * 480), "black")
    for i, p in enumerate(files):
        sheet.paste(Image.open(p), ((i % cols) * 270, (i // cols) * 480))
    sheet.save(QA / "contact_sheet.jpg", quality=86)
    if cfg:
        # subtitle checks: no two subtitle lines on screen at once; every line inside the safe width
        lines = [(s, a, b) for act in cfg["acts"] for s, a, b in chunks(act)]
        overlaps = [(x[0], y[0]) for x, y in zip(lines, lines[1:]) if x[2] > y[1] + 1e-3]
        rep.append(f"subtitle lines: {len(lines)}; overlapping pairs: {len(overlaps)}")
        longest = max(lines, key=lambda l: len(l[0]))
        rep.append(f"longest subtitle: {len(longest[0])} chars (~{len(longest[0]) * 58} px of 900 px safe width) — 「{longest[0]}」")
    (QA / "report.md").write_text("\n".join(rep) + "\n")
    print("\n".join(rep))


def write_sources(cfg):
    """sources.csv: every asset the film actually uses, with link, author, licence, download date and where it is used."""
    import csv
    manifest = json.loads((ROOT / "assets/manifest.json").read_text())
    sfx_credits = json.loads((ROOT / "assets/sfx/CREDITS.json").read_text())
    used = {}
    for act in cfg["acts"]:
        for i, s in enumerate(act["shots"]):
            if "clip" in s:
                used.setdefault(f"mixkit-{s['clip']}.mp4", []).append(f"{act['id']} {act['name']} 镜头{i + 1}")
        for s in act.get("sfx", []):
            used.setdefault(s["file"], []).append(f"{act['id']} {act['name']}")
    for m in cfg["music"]:
        used.setdefault(Path(m["file"]).name, []).append(f"背景音乐 {m['from_act']}–{m['to_act']}")
    rows = []
    for name, where in used.items():
        if name in manifest:
            m = manifest[name]
            rows.append({"type": {"video": "视频", "music": "音乐"}[m["kind"]], "file": m["file"], "title": m["title"],
                         "author": m.get("artist") or "Mixkit (Envato) 签约创作者", "source_page": m["page"], "download_url": m["download_url"],
                         "license": m["license_name"], "license_url": f"https://mixkit.co/license/#{m['license']}",
                         "license_terms": "可用于商业与个人项目，无需署名；不得原样转售素材（Mixkit 官方说明）", "downloaded": m["downloaded"],
                         "used_in": "；".join(dict.fromkeys(where))})
        else:
            key = name.rsplit(".", 1)[0]
            c = sfx_credits[key]
            rows.append({"type": "音效", "file": f"assets/sfx/{name}", "title": c["title"], "author": c["creator"], "source_page": c["source"],
                         "download_url": f"https://api.openverse.org/v1/audio/{c['openverse_id']}/", "license": f"{c['license'].upper()} {c['license_version']}",
                         "license_url": c["license_url"], "license_terms": "CC0：无需署名" if c["license"] == "cc0" else "CC BY：须署名（见 README）",
                         "downloaded": c["fetched"], "used_in": "；".join(dict.fromkeys(where))})
    with open(HERE / "sources.csv", "w", newline="", encoding="utf-8-sig") as fh:
        w = csv.DictWriter(fh, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(sorted(rows, key=lambda r: (r["type"], r["file"])))
    return rows


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--draft", action="store_true")
    ap.add_argument("--only-qa", action="store_true")
    ap.add_argument("--force-tts", action="store_true")
    args = ap.parse_args()
    cfg = json.loads((HERE / "project.json").read_text())
    final = HERE / "final_video.mp4"
    if args.only_qa:
        qa(final, plan(cfg))
        return
    WORK.mkdir(exist_ok=True)
    font = find_font()
    print(f"font: {font}")
    print("1/5 narration + timeline")
    plan(cfg, args.force_tts)
    for a in cfg["acts"]:
        print(f"  {a['id']} {a['name']}: start {a['_start']:.2f}s, length {a['_len']:.2f}s, voice {a['_vdur']:.2f}s [{a['_engine']}]")
    print(f"  total {cfg['_total']:.2f}s")
    scale = 0.5 if args.draft else 1.0
    tag = "-draft" if args.draft else ""
    print("2/5 shots")
    base = build_video(cfg, scale, tag)
    print("3/5 graphics + subtitles")
    ass_text, srt = build_ass(cfg, "Noto Sans CJK SC")
    ass = WORK / "graphics.ass"
    ass.write_text(ass_text, encoding="utf8")
    (HERE / "subtitles.srt").write_text("".join(f"{i + 1}\n{srt_time(a)} --> {srt_time(b)}\n{s}\n\n" for i, (s, a, b) in enumerate(srt)), encoding="utf8")
    (HERE / "voiceover.txt").write_text(
        f"{cfg['title']}（{cfg['title_en']}）— 旁白全文\n\n" + "\n\n".join(f"【{a['name']}】{a['narration']}" for a in cfg["acts"]) + "\n", encoding="utf8")
    notes = [(a, o) for a in cfg["acts"] for o in a.get("overlays", []) if o["type"] == "notify"]
    print("4/5 audio")
    mix = WORK / "mix.wav"
    build_audio(cfg, mix)
    print("5/5 final encode")
    fontsdir = font.parent
    inputs = ["-i", str(base)]
    fc, last = [f"[0:v]noise=alls=3:allf=t,format=yuv420p[g]"], "[g]"   # light film grain
    for k, (act, o) in enumerate(notes):
        png = WORK / f"notify{k}.png"
        notify_png(o, font, png)
        inputs += ["-loop", "1", "-i", str(png)]
        t0 = at_time(act, o["at"])
        t1 = t0 + o["dur"]
        idx = len(inputs) // 2 - 1 if False else k + 1
        sc = 0.5 if args.draft else 1.0
        # slide down 60 px with an ease-out and fade in; fade out at the end
        fc.append(f"[{idx}:v]scale=iw*{sc}:-1,format=rgba,fade=t=in:st={t0:.3f}:d=0.3:alpha=1,fade=t=out:st={t1 - 0.3:.3f}:d=0.3:alpha=1[n{k}]")
        y = f"({330 * sc}-{60 * sc}*pow(1-min(1,max(0,(t-{t0:.3f})/0.35)),3))"
        fc.append(f"{last}[n{k}]overlay=x=(W-w)/2:y='{y}':enable='between(t,{t0:.3f},{t1:.3f})':shortest=1[o{k}]")
        last = f"[o{k}]"
    ass_esc = str(ass).replace(":", "\\:")
    fc.append(f"{last}ass='{ass_esc}':fontsdir='{str(fontsdir)}'" + (f":original_size={W}x{H}" if args.draft else "") +
              f",fade=t=in:st=0:d=0.25,fade=t=out:st={cfg['_total'] - 0.5:.3f}:d=0.5[v]")
    out = WORK / "draft.mp4" if args.draft else final
    run(["ffmpeg", "-y", "-v", "error", *inputs, "-i", str(mix), "-filter_complex", ";".join(fc), "-map", "[v]", "-map", f"{len(notes) + 1}:a",
         "-t", f"{cfg['_total']:.3f}", "-c:v", "libx264", "-preset", "slow", "-crf", "20" if not args.draft else "24", "-maxrate", "7M", "-bufsize", "14M",
         "-profile:v", "high",
         "-pix_fmt", "yuv420p", "-r", str(FPS), "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", str(out)])
    if not args.draft:
        # graded picture without any text, for re-editing (kept under 100 MB)
        run(["ffmpeg", "-y", "-v", "error", "-i", str(base), "-c:v", "libx264", "-crf", "18", "-maxrate", "8M", "-bufsize", "16M", "-preset", "slow",
             "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(TRACKS / "video_no_text.mp4")])
        shutil.copy(ass, TRACKS / "graphics_and_subtitles.ass")
        for p in WORK.glob("notify*.png"):
            shutil.copy(p, TRACKS / p.name)
        shutil.copy(mix, TRACKS / "mix.wav")
    print(f"saved {out.relative_to(ROOT)}")
    write_sources(cfg)
    qa(out, cfg)


if __name__ == "__main__":
    main()
