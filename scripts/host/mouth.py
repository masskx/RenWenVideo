"""Lip-sync track for the host IP: what the mouth does, measured from the narration itself.

For every voiced scene of a film (public/audio/tutorials/<id>/NN-<scene>.mp3 + .words.json) this writes
NN-<scene>.mouth.json next to them:
  rate    samples per second of `env`
  lead    ms the track is shifted earlier (the mouth moves a frame before the sound is heard, as real mouths do)
  env     how open the mouth is, 0..1, from the voice's vowel band (250-1200 Hz, 32 ms windows, fast attack / slower
          release, normalised to the clip's own loud vowels) — the mouth opens exactly when there is sound, dips between
          syllables and closes in pauses
  syl     one entry per spoken character: {ms, end, v, close} — v is the viseme from its pinyin final
          (A open · O round · E mid · I spread · U pucker), close marks a b/p/m/f onset (the lips meet first)

The per-character times from the TTS are coarse (37 ms steps, some stretched), so they only choose the *shape*; the
*timing and size* come from the audio. Run: python3 scripts/host/mouth.py <id>   (needs numpy, ffmpeg; pypinyin for the
shapes — without it every syllable gets the neutral E shape and the script says so). tutorial:render runs it when a
track is missing or older than its voice.
"""
import json, os, re, subprocess, sys
import numpy as np

try:
    from pypinyin import pinyin, Style
except ImportError:  # shapes fall back to neutral; timing still comes from the audio
    pinyin = None

RATE = 60          # envelope samples per second
LEAD_MS = 35       # mouth leads the sound by about a frame
SR = 16000


def envelope(mp3):
    """Mouth opening from the vowel band (250-1200 Hz) of the voice: vowels are loud there, consonants and syllable
    boundaries dip, so the mouth articulates each syllable instead of hanging open (the TTS voice is compressed, so plain
    loudness barely moves). Gated by full-band level so breaths and room tone stay closed."""
    pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', mp3, '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'], capture_output=True, check=True).stdout
    x = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768
    hop, n_fft = SR // RATE, 512
    x = np.concatenate([np.zeros(n_fft // 2), x, np.zeros(n_fft)])
    win = np.hanning(n_fft)
    fr = np.fft.rfftfreq(n_fft, 1 / SR)
    vb = (fr >= 250) & (fr <= 1200)
    n = max(1, (len(x) - n_fft) // hop)
    band, full = np.zeros(n), np.zeros(n)
    for i in range(n):
        S = np.abs(np.fft.rfft(x[i * hop: i * hop + n_fft] * win)) ** 2
        band[i] = 10 * np.log10(S[vb].sum() + 1e-12)
        full[i] = 10 * np.log10(S.sum() + 1e-12)
    loud = np.percentile(band[band > band.max() - 50], 90)
    floor = loud - 18                                            # 18 dB under the clip's loud vowels = closed
    e = np.clip((band - floor) / 18, 0, 1) ** 1.2
    e[full < np.percentile(full, 95) - 38] = 0                   # silence / breath gate
    out, prev = np.zeros_like(e), 0.0
    for i, v in enumerate(e):                                   # attack ~1 sample, release ~50 ms
        prev = v if v > prev else prev + (v - prev) * 0.35
        out[i] = prev
    return out


FINAL = [  # pinyin final (Style.FINALS) -> viseme; order matters (longest first is not needed: exact match by family)
    ('A', re.compile(r'^(a|ia|ua|an|ian|uan|van|ang|iang|uang|ai|uai|ao|iao)$')),
    ('O', re.compile(r'^(o|uo|ou|iou|ong|iong)$')),
    ('U', re.compile(r'^(u|v|ve|vn|un|uen|ueng)$')),
    ('I', re.compile(r'^(i|ie|in|ing|ei|uei)$')),
    ('E', re.compile(r'^(e|en|eng|er|ue)$')),
]
HAN = re.compile(r'[一-鿿]')


def viseme(ch):
    if pinyin is None or not HAN.match(ch):
        if ch.lower() in 'aeiou':
            return {'a': 'A', 'o': 'O', 'u': 'U', 'i': 'I'}.get(ch.lower(), 'E'), False
        return 'E', ch.lower() in 'bpmfvw'
    fin = pinyin(ch, style=Style.FINALS, strict=False)[0][0] or 'e'
    ini = pinyin(ch, style=Style.INITIALS, strict=False)[0][0]
    v = next((name for name, rx in FINAL if rx.match(fin)), 'E')
    return v, ini in ('b', 'p', 'm', 'f')


def track(mp3, words_json):
    words = json.load(open(words_json)).get('words', [])
    spoken = [w for w in words if w['text'].strip() and not re.match(r'^[，。、；：！？,.;:!?“”"「」（）()…—\-\s]+$', w['text'])]
    syl = []
    for i, w in enumerate(spoken):
        end = spoken[i + 1]['ms'] if i + 1 < len(spoken) else w['ms'] + w['dur']
        end = min(end, w['ms'] + max(w['dur'], 120))
        v, close = viseme(w['text'][0])
        syl.append({'ms': round(w['ms']), 'end': round(end), 'v': v, 'close': close})
    env = envelope(mp3)
    shift = int(round(LEAD_MS / 1000 * RATE))
    env = np.concatenate([env[shift:], np.zeros(shift)])
    return {'rate': RATE, 'lead': LEAD_MS, 'env': [round(float(v), 3) for v in env], 'syl': syl}


def main(fid):
    tl = json.load(open(f'tutorials/{fid}.timeline.json'))
    if pinyin is None:
        print('note: pypinyin not installed (pip install pypinyin) — mouth shapes fall back to neutral; timing still from the audio')
    for s in tl['scenes']:
        mp3 = os.path.join('public', s['audioSrc'])
        wj = mp3[:-4] + '.words.json'
        if not os.path.exists(mp3) or not os.path.exists(wj):
            continue
        out = mp3[:-4] + '.mouth.json'
        json.dump(track(mp3, wj), open(out, 'w'), separators=(',', ':'))
        print('mouth', out)


if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit('usage: python3 scripts/host/mouth.py <id>')
    main(sys.argv[1])
