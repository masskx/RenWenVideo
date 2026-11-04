"""Trace the user's avatar (inputs/host-ip/avatar.webp) into the host IP's vector layers (src/tutorial/host-art.ts).

The avatar is a flat illustration in a dozen colours, so a colour-cluster trace reproduces it faithfully: every layer is
one colour region, smoothed and simplified into an SVG path in the avatar's own 1254 x 1254 space. The parts that move
(eyes, brows, mouth) are traced as separate shapes and anchored, so the rig can blink, raise, open and shape them; the
head (hair, face, ears, glasses, features) and the body (neck, hoodie) are split at the jaw so the head can turn and nod.
Usage: python3 scripts/host/trace-avatar.py  (needs opencv-python-headless, numpy, pillow)
"""
import json, sys
import numpy as np, cv2
from PIL import Image

SRC = 'inputs/host-ip/avatar.webp'
OUT = 'src/tutorial/host-art.ts'
im = cv2.cvtColor(np.array(Image.open(SRC).convert('RGB')), cv2.COLOR_RGB2BGR)
H, W = im.shape[:2]
lum = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY).astype(int)
b, g, r = [im[:, :, i].astype(int) for i in range(3)]
yy, xx = np.mgrid[0:H, 0:W]

def disk(n): return cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * n + 1, 2 * n + 1))
def mor(m, op, n): return cv2.morphologyEx(m.astype(np.uint8), op, disk(n)) > 0
def comp_at(m, pts):
    n, lab = cv2.connectedComponents(m.astype(np.uint8))
    ids = {lab[y, x] for x, y in pts if lab[y, x] > 0}
    return np.isin(lab, list(ids))
def drop_small(m, a):
    n, lab, st, _ = cv2.connectedComponentsWithStats(m.astype(np.uint8))
    keep = np.zeros(n, bool); keep[1:] = st[1:, cv2.CC_STAT_AREA] >= a
    return keep[lab]

# --- classes -------------------------------------------------------------------------------------------------------
bg = (lum > 225) & (r - b < 40)                       # cream page + disc
dark = lum < 72
ink = lum < 34                                        # the darkest: outlines and line work
skinish = (~dark) & (~bg)
# --- big regions -----------------------------------------------------------------------------------------------------
mass = mor(dark, cv2.MORPH_OPEN, 6)
hair = comp_at(mass, [(640, 150), (420, 250), (850, 250)])
hair = mor(hair, cv2.MORPH_CLOSE, 4)
hood = comp_at(mass, [(640, 1220), (200, 1100), (1100, 1100)])
hood = mor(hood, cv2.MORPH_CLOSE, 4)
figure = mor(~bg, cv2.MORPH_CLOSE, 3) & ~mor(bg, cv2.MORPH_OPEN, 2)
skin = figure & ~hair & ~hood
skin = mor(skin, cv2.MORPH_CLOSE, 6)
skin = drop_small(skin, 4000)

# jaw split: head above, neck (body) below
JAW = np.array([(0, 700), (395, 700), (470, 800), (560, 890), (650, 932), (760, 880), (850, 790), (905, 690), (1254, 690)], np.float32)
jaw_y = np.interp(np.arange(W), JAW[:, 0], JAW[:, 1])
above = yy < jaw_y[None, :]
face = skin & above
neck = skin & ~above

# feature boxes (procedural / separately anchored parts)
def box(x0, y0, x1, y1): return (xx >= x0) & (xx < x1) & (yy >= y0) & (yy < y1)
EYES = box(470, 470, 920, 640)
BROWS = box(470, 410, 920, 490)
MOUTH = box(560, 725, 790, 830)
GLASS = box(330, 460, 960, 650)

thick = mor(dark & GLASS | dark & BROWS, cv2.MORPH_OPEN, 6)
brows = drop_small(thick & box(470, 400, 885, 500), 800)
eyes = drop_small(thick & box(500, 495, 900, 600), 300) & ~brows
def top2(m):
    n, lab, st, _ = cv2.connectedComponentsWithStats(m.astype(np.uint8))
    big = sorted(range(1, n), key=lambda i: -st[i, cv2.CC_STAT_AREA])[:2]
    return np.isin(lab, big)
eyes = top2(eyes)
glasses = (dark | (lum < 110)) & GLASS & ~mor(brows | eyes, cv2.MORPH_DILATE, 3) & ~hair
glasses = drop_small(mor(glasses, cv2.MORPH_CLOSE, 1), 60)
lips = (lum < 200) & (r - b > 50) & MOUTH & ~dark
lips = drop_small(mor(lips, cv2.MORPH_CLOSE, 2), 200)
mouthline = ink & MOUTH
feat = mor(GLASS | MOUTH | BROWS, cv2.MORPH_DILATE, 0)

# shading inside regions
shade = (lum < 205) & (lum > 120) & ~bg & skin & ~(GLASS | MOUTH | BROWS)
shade = drop_small(mor(shade, cv2.MORPH_OPEN, 2), 250)
deep = (lum < 175) & (lum > 90) & skin & ~(GLASS | MOUTH | BROWS) & ~ink
deep = drop_small(mor(deep, cv2.MORPH_OPEN, 1), 120)
hair_hi = (lum >= 40) & (lum < 72) & hair
hair_hi = drop_small(mor(hair_hi, cv2.MORPH_OPEN, 1), 90)
hood_lo = (lum < 36) & hood
hood_lo = drop_small(mor(hood_lo, cv2.MORPH_OPEN, 2), 200)
lines = ink & ~mor(hair | hood, cv2.MORPH_ERODE, 3) & ~(GLASS | MOUTH | BROWS)
lines = drop_small(lines, 40)
hood_hi = (lum >= 46) & (lum < 80) & hood & ~mor(hood_lo, cv2.MORPH_DILATE, 1)
hood_lines = drop_small(mor(hood_hi, cv2.MORPH_OPEN, 1), 80)

# --- vectorise ---------------------------------------------------------------------------------------------------------
def smooth(c, k):
    if len(c) < 2 * k + 3: return c
    p = np.concatenate([c[-k:], c, c[:k]])
    ker = np.ones(2 * k + 1) / (2 * k + 1)
    return np.stack([np.convolve(p[:, i], ker, 'valid') for i in range(2)], 1)
def path(m, eps=1.1, k=2, min_area=30):
    cs, hier = cv2.findContours(m.astype(np.uint8), cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
    out = []
    for c in cs:
        if abs(cv2.contourArea(c)) < min_area: continue
        p = smooth(c[:, 0, :].astype(float), k).astype(np.float32).reshape(-1, 1, 2)
        p = cv2.approxPolyDP(p, eps, True)[:, 0, :]
        if len(p) < 3: continue
        out.append('M' + ' '.join(f'{x:.0f},{y:.0f}' for x, y in p) + 'Z')
    return ''.join(out)
def anchor(m):
    ys, xs = np.nonzero(m)
    return [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())]
def split(m, keep=2):
    n, lab, st, cen = cv2.connectedComponentsWithStats(m.astype(np.uint8))
    big = sorted(range(1, n), key=lambda i: -st[i, cv2.CC_STAT_AREA])[:keep]
    parts = sorted(big, key=lambda i: cen[i][0])
    return [lab == i for i in parts]

colour = lambda m: '#%02X%02X%02X' % tuple(int(v) for v in np.median(im[m][:, ::-1], axis=0))
L = lambda m, **kw: {'d': path(m, **kw), 'fill': colour(m) if m.any() else '#000'}
eye_parts = split(eyes); brow_parts = split(brows)
art = {
    'size': [W, H],
    'body': {
        'neck': L(neck | (box(470, 640, 830, 900) & skin), k=3),
        'neckShade': L(neck & shade | neck & deep, k=2),
        'hood': L(hood, k=3), 'hoodLo': L(hood_lo, k=2), 'hoodHi': L(hood_lines, k=1, eps=0.9),
        'lines': {'d': path(lines & ~above, k=1, eps=0.9), 'fill': '#100D0C'},
    },
    'head': {
        'face': L(face, k=3), 'shade': L(face & shade, k=2), 'deep': L(face & deep, k=2),
        'lines': {'d': path(lines & above, k=1, eps=0.9), 'fill': '#100D0C'},
        'hair': L(hair, k=2, eps=1.0), 'hairHi': L(hair_hi, k=1, eps=0.9),
        'glasses': {'d': path(glasses, k=1, eps=0.8, min_area=20), 'fill': colour(glasses)},
        'lips': L(lips, k=2), 'mouthLine': {'d': path(mouthline, k=1, eps=0.8, min_area=10), 'fill': '#100D0C'},
    },
    'eyes': [{'d': path(e, k=1), 'box': anchor(e)} for e in eye_parts],
    'brows': [{'d': path(e, k=2), 'box': anchor(e)} for e in brow_parts],
    'mouth': anchor(lips | mouthline) if (lips | mouthline).any() else [600, 750, 740, 790],
    'pivot': [645, 900],
}
with open(OUT, 'w') as f:
    f.write('// Generated by scripts/host/trace-avatar.py from inputs/host-ip/avatar.webp (the user\'s own profile picture). Do not edit by hand.\n')
    f.write('export const HOST_ART = ' + json.dumps(art, separators=(',', ':')) + ' as const;\n')
print('eyes', [e['box'] for e in art['eyes']], 'brows', [e['box'] for e in art['brows']], 'mouth', art['mouth'])
print({k: len(v['d']) for k, v in {**art['body'], **art['head']}.items()}, 'bytes', sum(len(json.dumps(art))  for _ in [0]))
