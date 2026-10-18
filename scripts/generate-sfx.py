"""Synthesize a small royalty-free SFX library for contact frames (docs/video-craft/archive/导演层.md §7).

Usage:
  python scripts/generate-sfx.py            -> public/audio/sfx/<kind>.wav

Every sound is generated from numpy with a fixed seed, so the files are reproducible and free to use.
Kinds follow motion: speed -> whoosh, impulse -> tap / thud / stamp, state change -> tick / pop / chime,
refusal -> block, paper sliding -> paper. Peaks are normalised to -3 dBFS; scenes set the mix gain.
"""
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "audio" / "sfx"
SR = 44100
rng = np.random.default_rng(20261015)


def t_axis(sec):
    return np.arange(int(SR * sec)) / SR


def lowpass(x, cutoff):
    """One-pole low-pass; cutoff may be a scalar or a per-sample array (Hz)."""
    c = np.broadcast_to(np.asarray(cutoff, dtype=float), x.shape)
    a = np.exp(-2 * np.pi * c / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc = (1 - a[i]) * x[i] + a[i] * acc
        y[i] = acc
    return y


def highpass(x, cutoff):
    return x - lowpass(x, cutoff)


def env(n, attack, release, shape=2.0):
    """Attack-release envelope over n samples (seconds)."""
    t = np.arange(n) / SR
    a = np.clip(t / max(attack, 1e-4), 0, 1)
    r = np.exp(-np.maximum(t - attack, 0) / max(release, 1e-4) * shape)
    return a * r


def norm(x, db=-3.0):
    peak = np.max(np.abs(x)) or 1.0
    return x / peak * (10 ** (db / 20))


def whoosh(sec):
    n = int(SR * sec)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    # Filter opens then closes: air passing by.
    k = np.sin(np.pi * np.clip(t / sec, 0, 1)) ** 1.5
    cut = 250 + 1800 * k
    band = lowpass(lowpass(noise, cut), cut) - lowpass(noise, 120 + 300 * k)
    return band * k


def tap():
    t = t_axis(0.12)
    body = (np.sin(2 * np.pi * 820 * t) * 0.7 + np.sin(2 * np.pi * 1630 * t) * 0.3) * np.exp(-t / 0.022)
    click = highpass(rng.standard_normal(len(t)), 2500) * np.exp(-t / 0.004) * 0.6
    return body + click


def thud():
    t = t_axis(0.35)
    f = 95 * np.exp(-t / 0.12) + 55
    phase = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(phase) * np.exp(-t / 0.11)
    knock = lowpass(rng.standard_normal(len(t)), 900) * np.exp(-t / 0.015) * 0.8
    return body + knock


def paper():
    t = t_axis(0.32)
    noise = highpass(rng.standard_normal(len(t)), 1800)
    grain = 1 + 0.5 * np.sin(2 * np.pi * 37 * t) * np.sin(2 * np.pi * 11 * t)
    return noise * grain * env(len(t), 0.06, 0.12)


def tick():
    t = t_axis(0.05)
    return np.sin(2 * np.pi * 2600 * t) * np.exp(-t / 0.006) + highpass(rng.standard_normal(len(t)), 4000) * np.exp(-t / 0.002) * 0.4


def pop():
    t = t_axis(0.09)
    f = 420 + 700 * (t / 0.09)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.004, 0.03)


def chime():
    t = t_axis(0.9)
    out = np.zeros_like(t)
    for start, freq in ((0.0, 659.25), (0.09, 987.77)):
        s = np.clip(t - start, 0, None)
        on = (t >= start).astype(float)
        out += on * (np.sin(2 * np.pi * freq * s) + 0.25 * np.sin(2 * np.pi * freq * 2 * s)) * np.exp(-s / 0.28)
    return out


def block():
    t = t_axis(0.38)
    out = np.zeros_like(t)
    for start, freq in ((0.0, 196.0), (0.14, 155.56)):
        s = np.clip(t - start, 0, None)
        on = (t >= start).astype(float)
        tone = np.tanh(3 * np.sin(2 * np.pi * freq * s)) * 0.6
        out += on * lowpass(tone, 1400) * np.exp(-s / 0.09)
    return out


def stamp():
    body = thud()
    crunch = paper()[: len(body)] * 0.45
    return body + np.pad(crunch, (0, len(body) - len(crunch)))


SOUNDS = {
    "whoosh": lambda: whoosh(0.34),
    "whoosh-short": lambda: whoosh(0.2),
    "tap": tap,
    "thud": thud,
    "paper": paper,
    "tick": tick,
    "pop": pop,
    "chime": chime,
    "block": block,
    "stamp": stamp,
}


def write(path, x):
    x = norm(x)
    fade = int(SR * 0.004)
    x[-fade:] *= np.linspace(1, 0, fade)
    data = (np.clip(x, -1, 1) * 32767).astype("<i2")
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for name, make in SOUNDS.items():
        path = OUT / f"{name}.wav"
        write(path, make())
        print(f"wrote {path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
