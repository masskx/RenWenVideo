"""Synthesize a light, royalty-free tech-tutorial music bed (pad + soft arpeggio + sub).

Usage:
  python scripts/generate-tutorial-music.py tutorials/rea-quickstart.json

Reads tutorials/<id>.timing.json for the length and writes the file named by musicSrc.
"""
import json
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SR = 44100
BPM = 84
# Cmaj9 – Am9 – Fmaj7(#11) – G6sus, two bars each
CHORDS = [
    (48, [60, 64, 67, 71, 74]),
    (45, [57, 60, 64, 67, 71]),
    (41, [57, 60, 64, 65, 69]),
    (43, [55, 59, 62, 64, 67]),
]


def hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def envelope(n, attack, release):
    env = np.ones(n)
    a, r = int(attack * SR), int(release * SR)
    env[:a] = np.linspace(0, 1, a)
    env[-r:] *= np.linspace(1, 0, r)
    return env


def main():
    spec_path = ROOT / (sys.argv[1] if len(sys.argv) > 1 else "tutorials/rea-quickstart.json")
    spec = json.loads(spec_path.read_text(encoding="utf-8"))
    timing = json.loads(spec_path.with_name(f"{spec['id']}.timing.json").read_text(encoding="utf-8"))
    seconds = timing["totalFrames"] / timing["fps"] + 1.0
    total = int(seconds * SR)
    out = np.zeros(total)
    beat = 60 / BPM
    chord_len = beat * 8
    rng = np.random.default_rng(7)
    t_chord = np.arange(int(chord_len * SR) + int(1.5 * SR)) / SR
    k = 0
    while k * chord_len < seconds:
        root, notes = CHORDS[k % len(CHORDS)]
        start = int(k * chord_len * SR)
        # pad: detuned sine pairs, slow swell
        pad = np.zeros_like(t_chord)
        for m in notes:
            for detune in (-0.12, 0.12):
                f = hz(m + detune)
                pad += np.sin(2 * np.pi * f * t_chord + rng.uniform(0, 6)) + 0.18 * np.sin(4 * np.pi * f * t_chord)
        pad *= envelope(len(t_chord), 1.6, 1.8) * 0.032
        # sub bass
        sub = np.sin(2 * np.pi * hz(root) * t_chord) * envelope(len(t_chord), 0.4, 1.2) * 0.10
        seg = pad + sub
        end = min(total, start + len(seg))
        out[start:end] += seg[: end - start]
        # arpeggio on eighth notes, soft pluck
        arp = [notes[i] + 12 for i in (0, 2, 4, 2, 1, 3, 4, 3)]
        for i in range(16):
            n_start = start + int(i * beat / 2 * SR)
            dur = int(0.9 * SR)
            if n_start >= total:
                break
            tt = np.arange(dur) / SR
            f = hz(arp[i % len(arp)])
            tone = np.sin(2 * np.pi * f * tt) + 0.25 * np.sin(4 * np.pi * f * tt) + 0.08 * np.sin(6 * np.pi * f * tt)
            tone *= np.exp(-tt * 5.5) * np.minimum(1, tt / 0.004) * (0.05 if i % 2 == 0 else 0.035)
            e = min(total, n_start + dur)
            out[n_start:e] += tone[: e - n_start]
        k += 1
    # gentle soft-knee limiting, global fades
    out = np.tanh(out * 1.4) / 1.4
    fade_in, fade_out = int(1.0 * SR), int(2.5 * SR)
    out[:fade_in] *= np.linspace(0, 1, fade_in)
    out[-fade_out:] *= np.linspace(1, 0, fade_out)
    out *= 0.89 / max(1e-6, np.max(np.abs(out)))
    stereo = np.stack([out, np.roll(out, int(0.011 * SR))], axis=1)
    target = ROOT / "public" / spec["musicSrc"]
    target.parent.mkdir(parents=True, exist_ok=True)
    tmp = target.with_suffix(".wav")
    with wave.open(str(tmp), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((stereo * 32767).astype("<i2").tobytes())
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(tmp), "-b:a", "160k", str(target)], check=True)
    tmp.unlink()
    print(f"{seconds:.1f}s music -> {target.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
