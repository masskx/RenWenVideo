"""Synthesize a dark, royalty-free pulse bed that turns bright once (for security / threat films).

Usage:
  python scripts/generate-pulse-bed.py <id> --turn=<seconds>

A low D-minor drone with a soft heartbeat-like pulse (100 bpm) until `--turn`, then the pulse stops and one open D major
add9 chord rings to the end — the score's shape follows the film: threat in the dark, then "here's what you do".
Reads tutorials/<id>.timeline.json for the length and writes the file named by musicSrc (mp3).
"""
import json
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SR = 44100


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def tone(freqs, n, detune=0.003):
    t = np.arange(n) / SR
    out = np.zeros(n)
    for f in freqs:
        for d in (-detune, detune):
            out += np.sin(2 * np.pi * f * (1 + d) * t)
    return out / (2 * len(freqs))


def main():
    sid = sys.argv[1]
    turn = float(next((a.split('=')[1] for a in sys.argv[2:] if a.startswith('--turn=')), '0'))
    cfg = json.loads((ROOT / 'tutorials' / f'{sid}.json').read_text(encoding='utf-8'))
    tl = json.loads((ROOT / 'tutorials' / f'{sid}.timeline.json').read_text(encoding='utf-8'))
    dur = tl['totalFrames'] / tl['fps'] + 1.0
    n = int(dur * SR)
    t = np.arange(n) / SR
    k = np.clip((t - turn) / 1.2, 0, 1)  # 0 = dark, 1 = bright

    # dark: D1 sub + D2/A2/F3 drone with a slow filter-like swell
    drone = tone([hz(38), hz(50), hz(57), hz(65)], n) * (0.75 + 0.25 * np.sin(2 * np.pi * t / 7.5))
    # pulse: a soft low thump on every beat, a lighter one on the off-beat
    beat = 60 / 100
    pulse = np.zeros(n)
    for i in range(int(turn / beat) + 1):
        for off, g in ((0, 1.0), (beat * 0.32, 0.45)):
            s = int((i * beat + off) * SR)
            m = min(n - s, int(0.35 * SR))
            if s >= n or m <= 0:
                continue
            tt = np.arange(m) / SR
            pulse[s:s + m] += g * np.sin(2 * np.pi * (55 + 40 * np.exp(-tt * 30)) * tt) * np.exp(-tt * 9)
    # bright: an open D major add9 chord, slow attack
    bright = tone([hz(50), hz(57), hz(62), hz(66), hz(69), hz(76)], n, 0.002)
    mix = (1 - k) * (0.55 * drone + 0.7 * pulse) + k * 0.55 * bright * np.clip((t - turn) / 2.5, 0, 1)
    mix *= np.clip(t / 0.8, 0, 1) * np.clip((dur - t) / 2.0, 0, 1)
    mix = mix / (np.max(np.abs(mix)) + 1e-9) * 0.8

    out = ROOT / 'public' / cfg['musicSrc']
    out.parent.mkdir(parents=True, exist_ok=True)
    wav = out.with_suffix('.wav')
    with wave.open(str(wav), 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((mix * 32767).astype(np.int16).tobytes())
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(wav), '-b:a', '160k', str(out)], check=True)
    wav.unlink()
    print(f'wrote {out.relative_to(ROOT)} ({dur:.1f}s, turn at {turn:.1f}s)')


if __name__ == '__main__':
    main()
