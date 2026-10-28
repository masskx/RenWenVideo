"""Compose a background score for a film from its voice timeline: synthesized, royalty-free, arranged to the edit.

Usage:
  python scripts/generate-score.py <id> [--mood=tension] [--climax=<scene id>] [--seed=1] [--preview] [--use]

Settings come from tutorials/<id>.json → "score": {"mood": …, "climax": <scene id>, "climaxAt": <s into that scene, default 0>, "lifts": [scene ids], "seed": n, "key": <midi root>, "bpm": n,
"silences": [{"scene": <id>, "at": <s into the scene>, "dur": <s>}]}
(flags override them). Writes public/audio/tutorials/<id>/score.mp3; sets musicSrc to it when the film has no music yet (or
with --use), and musicVolume / musicDuckDb when missing. --preview also writes qa/<id>/mix-preview.mp3: the narration placed on the
timeline with the score at the renderer's exact gain curve, so the mix can be heard without rendering the video.
The level is set from the film's own narration: ≈12 dB under the voice in pauses, ≈22 dB under it while it speaks (the
old beds sat ~40 dB under the voice and were inaudible).

Why it is built this way (docs/video-craft/音效.md §配乐, 抖音技巧.md):
- No fade-in: the first downbeat (a soft hit + the first chord) lands on frame 0 — the hook needs energy at once.
- The grid is stretched (±8 % tempo) so the climax scene starts exactly on a downbeat; a riser leads into it and the full
  arrangement drops there.
- It ends with the narration: a final chord on the last word, a short tail (≤ 1 s), then silence — no long fade.
- The 1–4 kHz band where the voice lives is dipped, and the renderer ducks the bed further while the voice speaks.

Moods (pick for the film's ground colour / emotion, not by habit):
  tension  security, threats, incidents — D minor, low pulse, dark pad, sparse plucks          (gheist, php2shell)
  news     neutral tech news, launches — bright add9 chords, plucked arps, light kit           (kimi, deepseek)
  warm     human, emotional, late-night — slow, soft keys, no drums                            (late-night-emo)
  wonder   showcases, "look what it made" — lydian lift, shimmering arps, big drop             (demos)
  playful  light, funny, quirky — bouncy bass, staccato plucks, claps                          (crawler, stickers)
"""
import json
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SR = 44100

Q = {'m9': [0, 3, 7, 10, 14], 'm7': [0, 3, 7, 10], 'm': [0, 3, 7, 12], 'maj9': [0, 4, 7, 11, 14], 'add9': [0, 4, 7, 14], 'maj7': [0, 4, 7, 11],
     'sus2': [0, 2, 7, 12], '7sus': [0, 5, 7, 10], 'lyd': [0, 4, 6, 11, 14], '6': [0, 4, 7, 9]}
MOODS = {
    'tension': dict(bpm=100, key=38, prog=[(0, 'm9'), (8, 'maj7'), (3, 'maj9'), (10, '7sus')], bright=0.35, pluck=0.5, keys=0.0, drums='pulse', bass='eighths', arp='sparse'),
    'news': dict(bpm=108, key=40, prog=[(0, 'add9'), (7, 'sus2'), (9, 'm7'), (5, 'maj9')], bright=0.75, pluck=0.9, keys=0.0, drums='light', bass='syncopated', arp='eighths'),
    'warm': dict(bpm=76, key=41, prog=[(0, 'maj9'), (9, 'm9'), (5, 'maj7'), (7, '6')], bright=0.45, pluck=0.25, keys=1.0, drums='none', bass='whole', arp='broken'),
    'wonder': dict(bpm=92, key=43, prog=[(0, 'lyd'), (2, 'add9'), (9, 'm9'), (5, 'maj9')], bright=0.9, pluck=1.0, keys=0.3, drums='light', bass='whole', arp='sixteenths'),
    'playful': dict(bpm=116, key=45, prog=[(0, '6'), (5, 'add9'), (7, 'sus2'), (2, 'm7')], bright=0.8, pluck=1.0, keys=0.0, drums='claps', bass='bouncy', arp='staccato'),
}


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def place(buf, start, sig, gain=1.0, pan=0.0):
    """Add a mono signal into the stereo buffer at sample `start` with constant-power pan (-1 left … 1 right)."""
    if start >= buf.shape[0] or len(sig) == 0:
        return
    s0 = max(0, start)
    sig = sig[s0 - start:]
    e = min(buf.shape[0], s0 + len(sig))
    a = (pan + 1) * np.pi / 4
    buf[s0:e, 0] += sig[:e - s0] * gain * np.cos(a)
    buf[s0:e, 1] += sig[:e - s0] * gain * np.sin(a)


def adsr(n, a=0.01, d=0.1, s=0.7, r=0.2):
    t = np.arange(n) / SR
    dur = n / SR
    env = np.where(t < a, t / max(a, 1e-4), s + (1 - s) * np.exp(-(t - a) / max(d, 1e-4)))
    rel = np.clip((dur - t) / max(r, 1e-4), 0, 1)
    return env * rel


def pad_voice(freq, n, bright, rng):
    """A soft detuned pad: a few harmonics per voice, fewer when darker; slow internal movement."""
    t = np.arange(n) / SR
    out = np.zeros(n)
    nh = 2 + int(5 * bright)
    for det in (-0.004, 0.0, 0.004):
        ph = rng.uniform(0, 2 * np.pi)
        for h in range(1, nh + 1):
            out += np.sin(2 * np.pi * freq * (1 + det) * h * t + ph * h) / (h ** 1.6)
    return out * (1 + 0.15 * np.sin(2 * np.pi * 0.23 * t + rng.uniform(0, 6)))


def pluck(freq, n, rng, damp=0.996):
    """Karplus–Strong string, computed one delay-line block at a time (vectorised)."""
    p = max(2, int(SR / freq))
    y = np.zeros(n + p + 1)
    y[:p + 1] = rng.uniform(-1, 1, p + 1)
    for s in range(p + 1, len(y), p):
        e = min(s + p, len(y))
        y[s:e] = damp * 0.5 * (y[s - p:e - p] + y[s - p - 1:e - p - 1])
    out = y[p + 1:p + 1 + n]
    return out * np.minimum(1, np.arange(n) / (0.002 * SR))


def keys_note(freq, n):
    """A soft electric-piano-ish tone: decaying partials with a slightly faster top."""
    t = np.arange(n) / SR
    out = np.sin(2 * np.pi * freq * t) * np.exp(-t * 1.6)
    out += 0.35 * np.sin(2 * np.pi * 2 * freq * t) * np.exp(-t * 3.0)
    out += 0.12 * np.sin(2 * np.pi * 3.01 * freq * t) * np.exp(-t * 5.0)
    return out * np.minimum(1, t / 0.004)


def kick(n=int(0.45 * SR), punch=1.0):
    t = np.arange(n) / SR
    f = 45 + 85 * np.exp(-t * 28)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7) * punch


def noise_hit(rng, n, decay, hp=True):
    x = rng.uniform(-1, 1, n)
    if hp:
        x = np.diff(x, prepend=0)
    return x * np.exp(-np.arange(n) / SR * decay)


def fft_filter(x, curve):
    """Filter a mono signal by a magnitude curve(freqs) in the frequency domain."""
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(X * curve(f), len(x))


def reverb(x, rng, seconds=1.6, wet=0.22):
    n = int(seconds * SR)
    ir = rng.uniform(-1, 1, n) * np.exp(-np.arange(n) / SR * (6.9 / seconds))
    ir = fft_filter(ir, lambda f: 1 / (1 + (f / 6000) ** 2))
    ir /= np.sqrt(np.sum(ir ** 2))
    m = len(x) + n
    size = 1 << (m - 1).bit_length()
    y = np.fft.irfft(np.fft.rfft(x, size) * np.fft.rfft(ir, size), size)[:len(x)]
    return x * (1 - wet) + y * wet


def load(sid):
    cfg = json.loads((ROOT / 'tutorials' / f'{sid}.json').read_text(encoding='utf-8-sig'))
    tl = json.loads((ROOT / 'tutorials' / f'{sid}.timeline.json').read_text(encoding='utf-8-sig'))
    return cfg, tl


def last_word_time(tl):
    sc = tl['scenes'][-1]
    caps = sc.get('captions') or []
    end_ms = max((c['endMs'] for c in caps), default=sc['audioMs'])
    return sc['startFrame'] / tl['fps'] + end_ms / 1000


def compose(cfg, tl, opts):
    mood = MOODS[opts['mood']]
    rng = np.random.default_rng(opts.get('seed', 1))
    fps = tl['fps']
    total = tl['totalFrames'] / fps
    end_t = min(total, last_word_time(tl))
    climax_id = opts.get('climax')
    sc_by = {s['id']: s for s in tl['scenes']}
    climax_t = sc_by[climax_id]['startFrame'] / fps + float(opts.get('climaxAt', 0)) if climax_id in sc_by else total * 0.62  # climaxAt: s into the scene
    # stretch the tempo (±8 %) so the climax lands on a downbeat
    bpm = opts.get('bpm', mood['bpm'])
    bar = 4 * 60 / bpm
    bars_to_climax = max(1, round(climax_t / bar))
    bar = min(bar * 1.08, max(bar * 0.92, climax_t / bars_to_climax))
    beat = bar / 4
    climax_bar = round(climax_t / bar)
    # secondary lifts ("score": {"lifts": [scene ids]}): a smaller hit and four fuller bars where a later beat turns
    lift_bars = sorted({round(sc_by[i]['startFrame'] / fps / bar) for i in opts.get('lifts', []) if i in sc_by} - {climax_bar})
    n_total = int((total + 0.2) * SR)
    music = np.zeros((n_total, 2))
    tonal = np.zeros((n_total, 2))
    key = opts.get('key', mood['key'])
    n_bars = int(np.ceil(end_t / bar)) + 1

    def energy(b):
        t = b * bar
        if t >= end_t - bar * 0.5:
            return 0.35
        if b < 2:
            return 0.55
        if climax_bar - 2 <= b < climax_bar:
            return 0.45  # pull back before the drop, the riser fills it
        if climax_bar <= b < climax_bar + 4:
            return 1.0
        for lb in lift_bars:
            if lb <= b < lb + 4:
                return 0.8
        if b > climax_bar + 4:
            return 0.6
        return 0.55 + 0.25 * b / max(1, climax_bar)

    for b in range(n_bars):
        t0 = b * bar
        if t0 >= end_t:
            break
        s0 = int(t0 * SR)
        en = energy(b)
        per = 1 if mood['bpm'] >= 90 else 2  # slow moods change chord every two bars
        root_off, q = mood['prog'][(b // per) % len(mood['prog'])]
        root = key + root_off
        notes = [root + (24 if mood['bright'] >= 0.7 else 12) + iv for iv in Q[q]]  # darker moods voice lower, out of the voice band
        bar_n = int(min(bar, end_t - t0 + 0.05) * SR)
        # pad (attack is immediate on bar 0 so frame 0 already sounds)
        n = bar_n + int(0.6 * SR)
        att = 0.02 if b == 0 else 0.35
        p = sum(pad_voice(hz(m), n, mood['bright'], rng) for m in notes) / len(notes)
        p *= adsr(n, a=att, d=1.0, s=0.85, r=0.6)
        place(tonal, s0, p, 0.22, -0.1)
        place(tonal, s0, p, 0.22, 0.1)
        # bass
        style = mood['bass']
        hits = {'eighths': [i * 0.5 for i in range(8)], 'syncopated': [0, 1.5, 2.5], 'whole': [0], 'bouncy': [0, 0.75, 1.5, 2.5, 3.0]}[style]
        if en < 0.5 and style == 'eighths':
            hits = [0, 1, 2, 3]
        for h in hits:
            hs = t0 + h * beat
            if hs >= end_t:
                break
            ln = int((beat * (4 if style == 'whole' else 0.45)) * SR)
            tt = np.arange(ln) / SR
            f = hz(root + 12)
            sig = (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(4 * np.pi * f * tt)) * adsr(ln, 0.005, 0.12, 0.6, 0.06)
            place(music, int(hs * SR), sig, 0.20 * (0.8 + 0.2 * en), 0)
        # arpeggio / plucks / keys
        arp = mood['arp']
        steps = {'sparse': [0, 1.5, 2.5], 'eighths': [i * 0.5 for i in range(8)], 'broken': [0, 1, 2, 3], 'sixteenths': [i * 0.25 for i in range(16)],
                 'staccato': [0, 0.5, 1.5, 2, 3, 3.5]}[arp]
        if en < 0.5 and arp == 'sixteenths':
            steps = steps[::2]
        for i, st in enumerate(steps):
            ts = t0 + st * beat
            if ts >= end_t - 0.05:
                break
            m = notes[(i * 2 + b) % len(notes)] + (12 if arp != 'broken' else 0)
            ln = int(0.9 * SR)
            if mood['keys'] > 0:
                place(tonal, int(ts * SR), keys_note(hz(m), ln), 0.16 * mood['keys'], -0.25 + 0.5 * (i % 2))
            if mood['pluck'] > 0:
                place(tonal, int(ts * SR), pluck(hz(m), ln, rng, 0.994 if arp == 'staccato' else 0.997), 0.10 * mood['pluck'] * (0.7 + 0.3 * en),
                      0.35 if i % 2 else -0.35)
        # drums
        kit = mood['drums']
        breath = b % 8 == 7 and en < 0.95  # every 8th bar the drums drop out for its second half, so long beds breathe
        if kit != 'none':
            k_hits = [0, 2] if kit != 'pulse' else [0, 1, 2, 3]
            if en >= 0.95:
                k_hits = [0, 1, 2, 3]
            for kb in k_hits:
                ks = t0 + kb * beat
                if ks < end_t - 0.1 and not (breath and kb >= 2):
                    place(music, int(ks * SR), kick(punch=0.8 if kit == 'pulse' else 1.0), (0.22 if kit == 'pulse' else 0.28) * (0.6 + 0.4 * en), 0)
            if en >= 0.5:
                for hh in range(8):
                    hs = t0 + hh * beat / 2
                    if hs < end_t - 0.1 and not (breath and hh >= 4):
                        place(music, int(hs * SR), noise_hit(rng, int(0.06 * SR), 60), 0.035 * en * (1.0 if hh % 2 else 0.6), 0.3)
            if kit == 'claps' or en >= 0.95:
                for cb in (1, 3):
                    cs = t0 + cb * beat
                    if cs < end_t - 0.1:
                        place(music, int(cs * SR), noise_hit(rng, int(0.18 * SR), 22, hp=False) * 0.7, 0.07 * en, -0.1)
    # riser into the climax and an impact on it
    soft = mood['drums'] == 'none'  # warm films: a swelling chord instead of a noise riser, no boom
    if soft and 2 <= climax_bar < n_bars and climax_t < end_t - 1:
        rl = int(2 * bar * SR)
        tt = np.arange(rl) / SR
        ro, qq = mood['prog'][(climax_bar // 2) % len(mood['prog'])]
        sw = sum(pad_voice(hz(key + 24 + ro + iv), rl, 0.6, rng) for iv in Q[qq]) / len(Q[qq])
        place(tonal, int((climax_bar * bar - 2 * bar) * SR), sw * (tt / tt[-1]) ** 2.5, 0.35, 0)
    if not soft and 2 <= climax_bar < n_bars and climax_t < end_t - 1:
        rl = int(2 * bar * SR)
        tt = np.arange(rl) / SR
        rise = np.diff(rng.uniform(-1, 1, rl), prepend=0) * (tt / tt[-1]) ** 2.2
        rise += 0.3 * np.sin(2 * np.pi * np.cumsum(220 * 2 ** (2 * tt / tt[-1])) / SR) * (tt / tt[-1]) ** 2
        place(music, int((climax_bar * bar - 2 * bar) * SR), rise, 0.09, 0)
        bl = int(1.6 * SR)
        tb = np.arange(bl) / SR
        boom = np.sin(2 * np.pi * np.cumsum(38 + 50 * np.exp(-tb * 10)) / SR) * np.exp(-tb * 2.5)
        place(music, int(climax_bar * bar * SR), boom, 0.45, 0)
        place(music, int(climax_bar * bar * SR), noise_hit(rng, int(1.4 * SR), 3.2), 0.05, 0.2)
    for lb in lift_bars:
        if lb * bar < end_t - 1 and not soft:
            tb = np.arange(int(1.0 * SR)) / SR
            place(music, int(lb * bar * SR), np.sin(2 * np.pi * np.cumsum(45 + 40 * np.exp(-tb * 12)) / SR) * np.exp(-tb * 3.5), 0.28, 0)
            place(music, int(lb * bar * SR), noise_hit(rng, int(0.9 * SR), 4.5), 0.035, -0.2)
    # the ending: one chord on the last word, short ring, then silence
    fl = int(1.0 * SR)
    root_off, q = mood['prog'][0]
    for iv in Q[q]:
        m = key + 24 + root_off + iv
        tone = (keys_note(hz(m), fl) if mood['keys'] else pluck(hz(m + 12), fl, rng, 0.998)) * np.clip((fl / SR - np.arange(fl) / SR) / 0.5, 0, 1)
        place(tonal, int(end_t * SR), tone, 0.12, 0)
    place(music, int(end_t * SR), kick(punch=0.6), 0.18, 0)
    # space, then the voice-band dip, then glue
    for c in (0, 1):
        tonal[:, c] = reverb(tonal[:, c], np.random.default_rng(opts.get('seed', 1) + c), 1.8, 0.28)
    mix = music + tonal
    # the arrangement's loudness follows the energy curve: −10 dB in the quiet bars, full at the drop
    g = np.zeros(n_total)
    for b in range(n_bars):
        a, z = int(b * bar * SR), int(min(n_total, (b + 1) * bar * SR))
        g[a:z] = -10 * (1 - energy(b))
    g[int(min(n_total, n_bars * bar * SR)):] = g[int(min(n_total, n_bars * bar * SR)) - 1] if n_bars * bar * SR < n_total else 0
    k = int(0.25 * SR)
    g = np.convolve(np.pad(g, (k, k), mode='edge'), np.ones(2 * k + 1) / (2 * k + 1), mode='same')[k:-k]
    mix *= (10 ** (g / 20))[:, None]
    cut = int(min(n_total, (end_t + 1.0) * SR))
    mix[cut:] = 0
    fade = int(0.35 * SR)
    mix[cut - fade:cut] *= np.linspace(1, 0, fade)[:, None]
    dip = lambda f: 1 - 0.55 * np.exp(-((np.log2(np.maximum(f, 1) / 1300)) ** 2) / 1.6)  # ≈ −7 dB at 1.3 kHz, −3 dB at 400 Hz / 4 kHz: the voice's band
    hp = lambda f: 1 / np.sqrt(1 + (30 / np.maximum(f, 1)) ** 8)
    for c in (0, 1):
        mix[:, c] = fft_filter(mix[:, c], lambda f: dip(f) * hp(f))
    mix = np.tanh(mix * 1.15) / 1.15
    mix *= 0.89 / max(1e-6, np.max(np.abs(mix)))
    # real silences ("score": {"silences": [{"scene": id, "at": s, "dur": s}]}): the music stops dead before a turn and
    # comes back on it (lemo DIRECTOR §6: at least two, and the first sound after one is among the most important)
    sc_at = {s['id']: s['startFrame'] / fps for s in tl['scenes']}
    for sl in opts.get('silences', []):
        if sl.get('scene') not in sc_at:
            continue
        a0 = int((sc_at[sl['scene']] + sl.get('at', 0)) * SR)
        a1 = int(min(n_total, a0 + sl.get('dur', 0.5) * SR))
        e = int(0.03 * SR)
        if a0 >= n_total or a1 <= a0:
            continue
        mix[max(0, a0 - e):a0] *= np.linspace(1, 0, a0 - max(0, a0 - e))[:, None]
        mix[a0:a1] = 0
        back = min(e, n_total - a1)
        mix[a1:a1 + back] *= np.linspace(0, 1, back)[:, None]
    return mix, dict(bpm=round(4 * 60 / bar, 1), climax_t=round(climax_bar * bar, 2), end_t=round(end_t, 2))


def write_mp3(mix, out):
    out.parent.mkdir(parents=True, exist_ok=True)
    wav = out.with_suffix('.wav')
    with wave.open(str(wav), 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(mix, -1, 1) * 32767).astype('<i2').tobytes())
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', str(wav), '-b:a', '192k', str(out)], check=True)
    wav.unlink()


def decode(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(path), '-f', 's16le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, '<i2').astype(np.float64).reshape(-1, 2) / 32768


def lufs(path):
    out = subprocess.run(['ffmpeg', '-i', str(path), '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
    vals = [float(l.split()[1]) for l in out.splitlines() if l.strip().startswith('I:') and 'LUFS' in l]
    return vals[-1] if vals else -20.0


def levels(tl, music_path, gap_lu=12, under_lu=22):
    """musicVolume / musicDuckDb so the bed sits `gap_lu` under the narration in pauses and `under_lu` under it while the
    voice speaks (TutorialVideo.tsx multiplies the track by musicVolume, and by −musicDuckDb dB during captions)."""
    voice = np.mean([lufs(ROOT / 'public' / sc['audioSrc']) for sc in tl['scenes']])
    vol = 10 ** ((voice - gap_lu - lufs(music_path)) / 20)
    return round(float(np.clip(vol, 0.02, 1.0)), 3), under_lu - gap_lu


def preview(sid, cfg, tl, music_path):
    """Narration on the timeline + the score with exactly the renderer's gain curve (base level, ducked while a caption is
    spoken, 8-frame ramps), normalised to −15 LUFS like the final render: hear the mix without rendering the video."""
    fps, lead = tl['fps'], cfg.get('leadMs', 100) / 1000
    n = int((tl['totalFrames'] / fps + 0.5) * SR)
    voice = np.zeros((n, 2))
    spans = []
    for sc in tl['scenes']:
        v = decode(ROOT / 'public' / sc['audioSrc'])
        a = int((sc['startFrame'] / fps + lead) * SR)
        e = min(n, a + len(v))
        voice[a:e] += v[:e - a]
        spans += [(sc['startFrame'] + c['startMs'] / 1000 * fps, sc['startFrame'] + c['endMs'] / 1000 * fps) for c in sc.get('captions', [])]
    m = decode(music_path)[:n]
    m = np.pad(m, ((0, n - len(m)), (0, 0)))
    f = np.arange(n) / SR * fps
    near = np.full(n, 1e9)
    for a, b in spans:
        near = np.minimum(near, np.where(f < a, a - f, np.where(f > b, f - b, 0)))
    k = np.where(near <= 0, 1, np.where(near >= 8, 0, 1 - near / 8))
    duck = 10 ** (-cfg.get('musicDuckDb', 10) / 20)
    g = cfg.get('musicVolume', 0.07) * (1 - (1 - duck) * k)
    mix = voice + m * g[:, None]
    out = ROOT / 'qa' / sid / 'score-preview.mp3'
    out.parent.mkdir(parents=True, exist_ok=True)
    wav = out.with_suffix('.wav')
    with wave.open(str(wav), 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(mix, -1, 1) * 32767).astype('<i2').tobytes())
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', str(wav), '-af', 'loudnorm=I=-15:TP=-1.5', '-b:a', '192k', str(out)], check=True)
    wav.unlink()
    return out


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    if not args:
        print(__doc__)
        sys.exit(1)
    sid = args[0]
    flags = dict(a[2:].split('=', 1) for a in sys.argv[1:] if a.startswith('--') and '=' in a)
    cfg, tl = load(sid)
    opts = {**{'mood': 'news', 'seed': 1}, **(cfg.get('score') or {})}
    for k in ('mood', 'climax'):
        if k in flags:
            opts[k] = flags[k]
    for k in ('seed', 'key', 'bpm'):
        if k in flags:
            opts[k] = int(flags[k])
    if opts['mood'] not in MOODS:
        raise SystemExit(f"mood must be one of {', '.join(MOODS)}")
    mix, info = compose(cfg, tl, opts)
    rel = f'audio/tutorials/{sid}/score.mp3'
    out = ROOT / 'public' / rel
    write_mp3(mix, out)
    print(f"score ({opts['mood']}, {info['bpm']} bpm, climax on a downbeat at {info['climax_t']} s, ends with the last word at {info['end_t']} s) -> public/{rel}")
    # A film that already has music keeps it unless asked (--use): finished films are not changed behind the user's back.
    changed = False
    if cfg.get('musicSrc') != rel and (not cfg.get('musicSrc') or '--use' in sys.argv):
        cfg['musicSrc'] = rel
        changed = True
    elif cfg.get('musicSrc') != rel:
        print(f"note: tutorials/{sid}.json keeps musicSrc {cfg['musicSrc']}; pass --use to switch it to the new score")
    vol, duck = levels(tl, out)
    if cfg.get('musicSrc') == rel and (cfg.get('musicVolume'), cfg.get('musicDuckDb')) != (vol, duck):
        cfg['musicVolume'], cfg['musicDuckDb'] = vol, duck  # level the bed against this film's narration
        changed = True
    print(f'level: musicVolume {vol}, musicDuckDb {duck} (≈12 dB under the voice in pauses, ≈22 dB while it speaks)')
    if changed:
        p = ROOT / 'tutorials' / f'{sid}.json'
        p.write_text(json.dumps(cfg, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
        print(f'set musicSrc / musicVolume / musicDuckDb in tutorials/{sid}.json')
    if '--preview' in sys.argv:
        pcfg = {**cfg, 'musicVolume': vol, 'musicDuckDb': duck}  # hear the new score at its own level even before --use
        print(f'preview -> {preview(sid, pcfg, tl, out).relative_to(ROOT)}')


if __name__ == '__main__':
    main()
