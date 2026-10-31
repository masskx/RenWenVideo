// The "package" kit: the parts the lemo-opuscar news templates are built from, rewritten for 9:16 and our pipeline
// (templates: lemo/caption-news and lemo/news-package, docs/video-craft/prompt-library/vendor/lemomo-ai__lemo-opuscar/
// <pin>/styles/<style>/STYLE.md; how we use them: prompt-library/选用指南.md §〇, 学习/lemo-opuscar.md §精修).
// Everything is in full-frame coordinates (1080 × 1920) and is meant to be drawn from a scene's backdrop, so a template
// film lays out the whole frame itself. One accent per film, taken from its material (`Pk`).
// 9:16 zones: top safe band y 140–300 (bug, source tag), picture y 300–1150, caption card y 1170–1420, nothing to read at
// x > 930 between y 900 and 1600 (the platform's buttons) or below y 1560 (the description).
import React from 'react';
import {Img, OffthreadVideo, staticFile, useCurrentFrame} from 'remotion';
import {clamp, ease} from '../fx';
import {font} from './theme';
import {cond, hand, plex} from './fonts';
import {TimedCaption} from './types';

export type Pk = {bg: string; panel: string; ink: string; accent: string; onAccent: string; dim: string; second?: string};
export const W = 1080, H = 1920, L = 64;
export const GRADE = 'contrast(1.07) saturate(0.92) brightness(0.98)';
/** 0 → 1 over [a, b] frames, ease-out (cards, wipes, lines). */
export const eo = (f: number, a: number, b: number) => ease.outCubic(clamp((f - a) / Math.max(1, b - a)));
/** The template's slam: 1.3 → 1 with a small overshoot over `d` frames from `at`; null before. */
export const slam = (f: number, at: number, d = 4) => (f < at ? null : 1 + 0.3 * (1 - ease.outBack(clamp((f - at) / d), 1.6)));

/** Material under one grade, with the 6 % warm soft-light layer (caption-news §6). `src` is an image or, with `video`, an mp4. */
export const Plate: React.FC<{src: string; video?: boolean; from?: number; style: React.CSSProperties; fit?: React.CSSProperties; warm?: number; filter?: string}> = ({
  src, video = false, from = 0, style, fit, warm = 0.06, filter = GRADE,
}) => (
  <div style={{position: 'absolute', overflow: 'hidden', ...style}}>
    {video
      ? <OffthreadVideo src={staticFile(src)} muted trimBefore={Math.round(from * 30)} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', filter, ...fit}} />
      : <Img src={staticFile(src)} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', filter, ...fit}} />}
    {warm > 0 && <div style={{position: 'absolute', inset: 0, background: `rgba(255,170,70,${warm})`, mixBlendMode: 'soft-light'}} />}
  </div>
);
/** Gradients that let type sit on the picture without a box: under the caption card and under the bug. */
export const Veil: React.FC<{from?: number; top?: boolean; a?: number}> = ({from = 860, top = true, a = 0.88}) => <>
  <div style={{position: 'absolute', left: 0, right: 0, top: from, bottom: 0, background: `linear-gradient(180deg, rgba(14,14,12,0) 0, rgba(14,14,12,${a * 0.7}) 28%, rgba(14,14,12,${a}) 55%)`}} />
  {top && <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 330, background: 'linear-gradient(180deg, rgba(14,14,12,0.62), rgba(14,14,12,0))'}} />}
</>;
export const Vignette: React.FC<{a?: number}> = ({a = 0.42}) => <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse 85% 70% at 50% 42%, transparent 55%, rgba(0,0,0,${a}) 100%)`}} />;
/** The ruled sheet the data cards are drawn on (caption-news "ledger"): panel, faint rules every 54 px, a double margin. */
export const Ledger: React.FC<{k: Pk; f?: number; at?: number}> = ({k, f = 0, at = -99}) => {
  const p = eo(f, at, at + 6), ox = (1 - p) * 140;
  return <div style={{position: 'absolute', inset: 0, background: k.panel, overflow: 'hidden'}}>
    <div style={{position: 'absolute', inset: 0, transform: `translateX(${ox}px)`}}>
      {Array.from({length: 34}, (_, i) => <div key={i} style={{position: 'absolute', left: 0, right: 0, top: 80 + i * 54, height: 2, background: 'rgba(255,255,255,0.045)'}} />)}
      {[38, 46].map((x) => <div key={x} style={{position: 'absolute', top: 0, bottom: 0, left: x, width: 2, background: `${k.accent}55`}} />)}
    </div>
    {p < 1 && Array.from({length: 6}, (_, i) => <div key={i} style={{position: 'absolute', left: W - (1 - p) * 900 - i * 120, top: 300 + i * 170, width: 600 * (1 - p), height: 3, background: k.accent, opacity: 0.5 * (1 - p)}} />)}
  </div>;
};
/** A 1–2 frame white flash (the turn, the freeze). */
export const Flash: React.FC<{f: number; at: number; d?: number}> = ({f, at, d = 4}) => {
  const k = (f - at) / d;
  return k < 0 || k >= 1 ? null : <div style={{position: 'absolute', inset: 0, background: `rgba(255,255,255,${(1 - k) * 0.9})`}} />;
};

/* ---------- the package: bug, source tag, credit, lower third, strap, corner tag ---------- */

/** Channel bug, top left: accent block + topic plate (a fictional "channel" is the account's own series name). */
export const Bug: React.FC<{k: Pk; tag: string; topic: string; en?: string; f?: number; at?: number}> = ({k, tag, topic, en, f = 0, at = -99}) => {
  const p = eo(f, at, at + 8);
  return <div style={{position: 'absolute', left: L, top: 150, display: 'flex', height: 58, opacity: p, transform: `translateX(${(1 - p) * -30}px)`}}>
    <div style={{background: k.accent, color: k.onAccent, fontFamily: font, fontWeight: 900, fontSize: 32, padding: '0 16px', display: 'flex', alignItems: 'center'}}>{tag}</div>
    <div style={{background: 'rgba(14,14,12,0.66)', display: 'flex', alignItems: 'center', gap: 14, padding: '0 18px'}}>
      <span style={{fontFamily: font, fontWeight: 900, fontSize: 30, color: k.ink}}>{topic}</span>
      {en && <span style={{fontFamily: cond, fontWeight: 800, fontSize: 24, color: k.accent, letterSpacing: 1}}>{en}</span>}
    </div>
  </div>;
};
/** Source tag under the bug: slides in from the left whenever a figure or a document is on screen. */
export const SourceTag: React.FC<{k: Pk; label: string; f: number; at: number}> = ({k, label, f, at}) => {
  const p = eo(f, at, at + 6);
  if (f < at) return null;
  return <div style={{position: 'absolute', left: L - (1 - p) * 40, top: 222, display: 'flex', height: 44, opacity: p}}>
    <div style={{background: k.ink, color: '#0E0E0C', fontFamily: font, fontWeight: 900, fontSize: 26, padding: '0 12px', display: 'flex', alignItems: 'center'}}>来源</div>
    <div style={{background: 'rgba(14,14,12,0.82)', color: k.ink, fontFamily: plex, fontWeight: 500, fontSize: 24, padding: '0 14px', display: 'flex', alignItems: 'center', letterSpacing: 0.5, whiteSpace: 'nowrap'}}>{label}</div>
  </div>;
};
/** Footage credit chip at the bottom-right corner of the picture (our external-footage rule: 「@作者｜案例展示」). */
export const Credit: React.FC<{text: string; right?: number; bottom: number}> = ({text, right = 24, bottom}) => (
  <div style={{position: 'absolute', right, top: bottom - 40, background: 'rgba(14,14,12,0.62)', color: 'rgba(247,245,239,0.92)', fontFamily: font, fontWeight: 700, fontSize: 24, padding: '4px 12px', whiteSpace: 'nowrap'}}>{text}</div>
);
/** Lower third: accent bar + label + one small Latin line (a place, a date, a speaker — never the main sentence). */
export const LowerThird: React.FC<{k: Pk; zh: string; en?: string; x?: number; y: number; f: number; at: number}> = ({k, zh, en, x = L, y, f, at}) => {
  const p = eo(f, at, at + 7);
  if (f < at) return null;
  return <div style={{position: 'absolute', left: x, top: y, display: 'flex', height: en ? 92 : 70, clipPath: `inset(-10px ${(1 - p) * 100}% -10px 0)`}}>
    <div style={{width: 8, background: k.accent}} />
    <div style={{background: 'rgba(14,14,12,0.8)', padding: '8px 22px'}}>
      <div style={{fontFamily: font, fontWeight: 900, fontSize: 38, color: k.ink, lineHeight: 1.1, whiteSpace: 'nowrap'}}>{zh}</div>
      {en && <div style={{fontFamily: cond, fontWeight: 600, fontSize: 26, color: k.dim, letterSpacing: 1, whiteSpace: 'nowrap'}}>{en}</div>}
    </div>
  </div>;
};
/** Corner tag for schematic charts or illustrations (news-package §2): `SCHEMATIC / 示意图`. */
export const CornerTag: React.FC<{k: Pk; text: string; f: number; at: number; y?: number}> = ({k, text, f, at, y = 300}) => (f < at ? null :
  <div style={{position: 'absolute', left: L, top: y, transform: `scaleY(${eo(f, at, at + 6)})`, background: 'rgba(14,14,12,0.7)', border: `2px solid ${k.dim}`, color: k.dim, fontFamily: plex, fontSize: 22,
    padding: '4px 12px', letterSpacing: 1}}>{text}</div>);
/**
 * The strap (news-package §3): category tab + headline on paper + ink end block, held at the bottom of the picture for
 * the whole programme; `items` change its words with a vertical flip (0.32 s), the tab flashes white when the category changes.
 */
export type StrapItem = {at: number; tab: string; zh: string; en?: string};
export const Strap: React.FC<{k: Pk; items: StrapItem[]; f: number; y?: number; end?: string}> = ({k, items, f, y = 1180, end}) => {
  const cur = [...items].reverse().find((s) => f >= s.at);
  if (!cur) return null;
  const i = items.indexOf(cur), prev = items[i - 1];
  const p = eo(f, cur.at, cur.at + 10), enter = i === 0 ? eo(f, cur.at, cur.at + 8) : 1;
  const tabFlash = prev && prev.tab !== cur.tab ? clamp(1 - (f - cur.at) / 8) : 0;
  const row = (s: StrapItem, dy: number, o: number) => <div style={{position: 'absolute', left: 0, top: dy, opacity: o}}>
    <div style={{fontFamily: font, fontWeight: 900, fontSize: 44, color: '#111', whiteSpace: 'nowrap'}}>{s.zh}</div>
    {s.en && <div style={{fontFamily: cond, fontWeight: 600, fontSize: 24, color: '#6E5A1E', letterSpacing: 1, whiteSpace: 'nowrap', marginTop: -2}}>{s.en}</div>}
  </div>;
  return <div style={{position: 'absolute', left: L - (1 - enter) * 300, top: y, opacity: enter}}>
    <div style={{display: 'inline-block', background: tabFlash > 0 ? '#FFFFFF' : k.accent, color: tabFlash > 0 ? '#121417' : k.onAccent, fontFamily: font, fontWeight: 900, fontSize: 26, padding: '6px 14px', height: 44,
      boxSizing: 'border-box', opacity: 1}}>{cur.tab}</div>
    <div style={{display: 'flex'}}>
      <div style={{position: 'relative', width: 820, height: 104, background: '#F4F1E8', overflow: 'hidden', padding: '0 24px', boxSizing: 'border-box'}}>
        <div style={{position: 'absolute', left: 24, top: 12, right: 0, bottom: 0}}>
          {prev && p < 1 && row(prev, -p * 104, 1 - p)}
          {row(cur, prev ? (1 - p) * 104 : 0, prev ? p : 1)}
        </div>
      </div>
      <div style={{width: 96, height: 104, background: k.bg, borderLeft: `6px solid ${k.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: cond, fontWeight: 800, fontSize: 30, color: k.accent}}>{end}</div>
    </div>
  </div>;
};
/** Vertical band wipe between stories (news-package: accent band + ink line + secondary edge, 0.3 s), left → right. */
export const BandWipe: React.FC<{k: Pk; f: number; at: number; d?: number}> = ({k, f, at, d = 9}) => {
  const p = (f - at) / d;
  if (p < 0 || p > 1) return null;
  const x = -120 + (W + 240) * ease.inOutCubic(p);
  return <div style={{position: 'absolute', left: x - 120, top: 0, height: H, display: 'flex'}}>
    <div style={{width: 120, background: k.accent}} /><div style={{width: 6, background: k.bg}} /><div style={{width: 18, background: k.second ?? k.dim}} />
  </div>;
};

/* ---------- numbers, quotes, brackets ---------- */

/** A number with fixed-width digits (Barlow Condensed 800), so a rolling counter never jitters. */
export const Num: React.FC<{v: string; size: number; color: string; style?: React.CSSProperties}> = ({v, size, color, style}) => (
  <span style={{fontFamily: cond, fontWeight: 800, fontSize: size, color, fontVariantNumeric: 'tabular-nums', lineHeight: 0.86, letterSpacing: -1, ...style}}>{v}</span>
);
export const roll = (f: number, a: number, b: number, to: number, from = 0) => Math.round(from + (to - from) * ease.outCubic(clamp((f - a) / Math.max(1, b - a))));
export const fmt = (n: number) => n.toLocaleString('en-US');
/** The number block of the frame-4 hook: an accent block the number rolls inside, slammed in. */
export const NumBlock: React.FC<{k: Pk; f: number; at: number; to: number; from?: number; rollFrames?: number; size?: number; unit?: string; prefix?: string; x?: number; y: number; sep?: boolean}> = ({
  k, f, at, to, from = 0, rollFrames = 14, size = 240, unit, prefix, x = L - 18, y, sep = true,
}) => {
  const s = slam(f, at, 5);
  if (s === null) return null;
  const v = roll(f, at, at + rollFrames, to, from);
  return <div style={{position: 'absolute', left: x, top: y, transformOrigin: '0 50%', transform: `scale(${s})`, display: 'flex', alignItems: 'flex-end', gap: 16, background: k.accent, padding: `8px ${size * 0.1}px 4px ${size * 0.08}px`}}>
    {prefix && <span style={{fontFamily: cond, fontWeight: 800, fontSize: size * 0.6, color: k.onAccent, lineHeight: 1.1}}>{prefix}</span>}
    <Num v={sep ? fmt(v) : String(v)} size={size} color={k.onAccent} />
    {unit && <span style={{fontFamily: font, fontWeight: 900, fontSize: size * 0.38, color: k.onAccent, paddingBottom: size * 0.1}}>{unit}</span>}
  </div>;
};
/**
 * Quote card (news-package §3): ink card with an accent quotation mark that lands first, the lines push up one by one,
 * the gist in Chinese, a rule, then who / where / when. `mark` is underlined as the voice says it (`markAt`).
 */
export const QuoteCard: React.FC<{k: Pk; f: number; at: number; lines: string[]; gist?: string; who: string; mark?: string; markAt?: number; marks?: {text: string; at: number}[];
  x?: number; y: number; w?: number; size?: number}> = ({k, f, at, lines, gist, who, mark, markAt = 1e9, marks = [], x = L, y, w = 900, size = 60}) => {
  if (f < at) return null;
  const m = slam(f, at, 5) ?? 1;
  const all = mark ? [{text: mark, at: markAt}, ...marks] : marks;
  const under = (line: string): React.ReactNode => {
    const hit = all.find((u) => line.includes(u.text));
    if (!hit) return line;
    const [pre, ...rest] = line.split(hit.text), u = eo(f, hit.at, hit.at + 10);
    return <>{pre}<span style={{backgroundImage: `linear-gradient(${k.accent}, ${k.accent})`, backgroundSize: `${u * 100}% 8px`, backgroundPosition: '0 95%', backgroundRepeat: 'no-repeat'}}>{hit.text}</span>{under(rest.join(hit.text))}</>;
  };
  return <div style={{position: 'absolute', left: x, top: y, width: w}}>
    <div style={{fontFamily: cond, fontWeight: 800, fontSize: 150, color: k.accent, lineHeight: 0.7, height: 70, transformOrigin: '0 50%', transform: `scale(${m})`}}>“</div>
    {lines.map((line, i) => {
      const p = eo(f, at + 6 + i * 5, at + 12 + i * 5);
      return <div key={i} style={{fontFamily: cond, fontWeight: 800, fontSize: size, color: k.ink, lineHeight: 1.08, opacity: p, transform: `translateY(${(1 - p) * 30}px)`}}>{under(line)}</div>;
    })}
    {gist && <div style={{marginTop: 18, fontFamily: font, fontWeight: 900, fontSize: 40, color: k.accent, opacity: eo(f, at + 10 + lines.length * 5, at + 18 + lines.length * 5)}}>{gist}</div>}
    <div style={{marginTop: 16, height: 3, width: 240 * eo(f, at + 14 + lines.length * 5, at + 24 + lines.length * 5), background: k.second ?? k.dim}} />
    <div style={{marginTop: 12, fontFamily: plex, fontSize: 24, color: k.dim, letterSpacing: 1, opacity: eo(f, at + 16 + lines.length * 5, at + 24 + lines.length * 5)}}>{who}</div>
  </div>;
};
/** Yellow corner brackets closing in on a box (the freeze frame, the culprit). */
export const Brackets: React.FC<{k: Pk; f: number; at: number; x: number; y: number; w: number; h: number; s?: number}> = ({k, f, at, x, y, w, h, s = 60}) => {
  if (f < at) return null;
  const p = eo(f, at, at + 7), g = (1 - p) * 60;
  const c = (cx: number, cy: number, sx: number, sy: number) => <div style={{position: 'absolute', left: cx - (sx < 0 ? s : 0) - sx * g, top: cy - (sy < 0 ? s : 0) - sy * g, width: s, height: s,
    [sx > 0 ? 'borderLeft' : 'borderRight']: `8px solid ${k.accent}`, [sy > 0 ? 'borderTop' : 'borderBottom']: `8px solid ${k.accent}`}} />;
  return <>{c(x, y, 1, 1)}{c(x + w, y, -1, 1)}{c(x, y + h, 1, -1)}{c(x + w, y + h, -1, -1)}</>;
};
/** A document re-set in type on paper (what must be read is typeset, never a scaled screenshot), with a highlighter sweep. */
export const Doc: React.FC<{k: Pk; f: number; at: number; head: string; body: string; mark?: string; markAt?: number; x?: number; y: number; w?: number; rot?: number; size?: number}> = ({
  k, f, at, head, body, mark, markAt = 1e9, x = 70, y, w = 940, rot = -1.5, size = 44,
}) => {
  if (f < at) return null;
  const p = eo(f, at, at + 8), u = eo(f, markAt, markAt + 12);
  const parts = mark && body.includes(mark) ? body.split(mark) : null;
  return <div style={{position: 'absolute', left: x, top: y + (1 - p) * 120, width: w, opacity: p, transform: `rotate(${rot}deg)`, background: '#FBFAF6', padding: '34px 40px 38px',
    boxShadow: '0 30px 60px rgba(0,0,0,0.5)', boxSizing: 'border-box'}}>
    <div style={{fontFamily: plex, fontSize: 24, color: '#6B6B66', letterSpacing: 1, marginBottom: 16}}>{head}</div>
    <div style={{fontFamily: '"Georgia", "Noto Serif", serif', fontSize: size, lineHeight: 1.32, color: '#1A1A18'}}>
      {parts ? <>{parts[0]}<span style={{backgroundImage: `linear-gradient(${k.accent}cc, ${k.accent}cc)`, backgroundSize: `${u * 100}% 88%`, backgroundPosition: '0 60%', backgroundRepeat: 'no-repeat',
        mixBlendMode: 'multiply'}}>{mark}</span>{parts[1]}</> : body}
    </div>
  </div>;
};

/* ---------- captions as part of the template ---------- */

const units = (s: string) => [...s].reduce((w, ch) => w + ((ch.codePointAt(0) ?? 0) < 128 ? 0.56 : 1), 0);
/**
 * Split a caption into ≤ 2 lines: at punctuation when it has some (balanced), otherwise at the most balanced point that
 * does not cut a keyword or a quotation in half (and preferably sits on a keyword's edge); line-final commas dropped.
 */
export const captionLines = (text: string, max = 9.5, keyword?: string): string[] => {
  const parts = text.split(/(?<=[，、：；,:;])/).map((s) => s.trim()).filter(Boolean);
  const clean = (s: string) => s.replace(/[，、：；,:;]$/, '');
  if (units(clean(text)) <= max) return [clean(text)];
  if (parts.length > 1) {
    let best = [clean(text)], score = 1e9;
    for (let i = 1; i < parts.length; i++) {
      const a = clean(parts.slice(0, i).join('')), b = clean(parts.slice(i).join(''));
      const sc = Math.max(units(a), units(b));
      if (sc < score) { score = sc; best = [a, b]; }
    }
    return best;
  }
  const chars = [...clean(text)], str = chars.join('');
  const kAt = keyword ? str.indexOf(keyword) : -1, kEnd = kAt >= 0 ? kAt + [...(keyword as string)].length : -1;
  let best = Math.ceil(chars.length / 2), score = 1e9;
  for (let i = 2; i <= chars.length - 2; i++) {
    const a = chars.slice(0, i).join(''), b = chars.slice(i).join('');
    let sc = Math.max(units(a), units(b));
    if (kAt >= 0 && i > kAt && i < kEnd) sc += 100;                     // never inside the keyword
    if (kAt >= 0 && (i === kAt || i === kEnd)) sc -= 1.2;                 // its edges are good places to break
    if ((a.split('“').length - a.split('”').length) !== 0) sc += 100;    // never inside a quotation
    if (/[A-Za-z0-9]$/.test(a) && /^[A-Za-z0-9]/.test(b)) sc += 100;      // never inside a Latin word or a number
    if (/[的了上里都就着也来]$/.test(a) || /^[最在把就还也只]/.test(b)) sc -= 1.2;  // natural pauses in Chinese
    if (sc < score) { score = sc; best = i; }
  }
  return [chars.slice(0, best).join(''), chars.slice(best).join('')];
};
/**
 * The caption card (caption-news §4, in 9:16): the subtitle *is* the graphic. Left aligned at x 64, two stacked lines,
 * each slammed in 0.12 s after the previous (1.3 → 1, overshoot), one keyword (the first of `keywords` it contains) on an
 * accent block that wipes in behind it. Sized to stay inside x 64–930. `breaks` ("原句" → "前半|后半", look.breaks) sets the
 * line break of a caption exactly — the splitter can't know where a Chinese word ends.
 */
export const CaptionCard: React.FC<{captions: TimedCaption[]; k: Pk; keywords?: string[]; breaks?: Record<string, string>; y?: number; size?: number}> = ({captions, k, keywords = [], breaks = {}, y = 1180, size = 96}) => {
  const frame = useCurrentFrame();
  const ms = (frame / 30) * 1000;
  const c = captions.find((x) => ms >= x.startMs && ms < x.endMs);
  if (!c) return null;
  const kw = [...keywords].sort((a, b) => b.length - a.length).find((w) => c.text.includes(w));
  const lines = breaks[c.text]?.split('|') ?? captionLines(c.text, 9.5, kw);
  const sz = Math.min(size, Math.floor(866 / Math.max(...lines.map((l) => units(l) + (kw && l.includes(kw) ? 0.3 : 0)))));
  const t = (ms - c.startMs) / 1000;
  let used = false;
  return <div style={{position: 'absolute', left: L, top: y}}>
    {lines.map((line, i) => {
      const t0 = 0.04 + i * 0.12, kk = clamp((t - t0) / 0.13);
      if (t < t0) return <div key={i} style={{height: sz * 1.2}} />;
      const sc = 1 + 0.3 * (1 - ease.outBack(kk, 1.6));
      const hit = kw && !used && line.includes(kw) ? kw : null;
      if (hit) used = true;
      const parts = hit ? line.split(hit) : [line];
      const wk = clamp((t - t0 - 0.05) / 0.12);
      return <div key={i} style={{fontFamily: font, fontWeight: 900, fontSize: sz, lineHeight: 1.2, color: k.ink, whiteSpace: 'nowrap', transformOrigin: '0 60%', transform: `scale(${sc})`,
        opacity: clamp(kk * 3), textShadow: '0 4px 20px rgba(0,0,0,0.6)'}}>
        {parts[0]}
        {hit && <span style={{position: 'relative', display: 'inline-block', margin: '0 6px', padding: '0 12px', color: wk > 0.4 ? k.onAccent : k.ink, textShadow: 'none'}}>
          <span style={{position: 'absolute', left: 0, top: '8%', height: '92%', width: `${wk * 100}%`, background: k.accent, zIndex: -1}} />{hit}</span>}
        {hit && parts.slice(1).join(hit)}
      </div>;
    })}
  </div>;
};
/**
 * The transcript strip (satellite-briefing §4, in 9:16): bottom left, a 2 px white rule over a dark plate that fades to
 * the right, left-aligned, two lines at most (the template's one line does not fit a vertical frame), no keyword block —
 * the accent belongs to the one reading on screen. The plate grows with the rule in 0.15 s.
 */
export const CaptionStrip: React.FC<{captions: TimedCaption[]; k: Pk; breaks?: Record<string, string>; y?: number}> = ({captions, k, breaks = {}, y = 1330}) => {
  const frame = useCurrentFrame();
  const ms = (frame / 30) * 1000;
  const c = captions.find((x) => ms >= x.startMs && ms < x.endMs);
  if (!c) return null;
  const lines = breaks[c.text]?.split('|') ?? captionLines(c.text, 11.5);
  const sz = Math.max(60, Math.min(70, Math.floor(820 / Math.max(...lines.map(units)))));
  const p = clamp((ms - c.startMs) / 150);
  return <div style={{position: 'absolute', left: 0, top: y, width: 1000}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: 960, height: lines.length * sz * 1.22 + 44, background: 'linear-gradient(90deg, rgba(5,8,11,0.82) 0, rgba(5,8,11,0.62) 55%, rgba(5,8,11,0) 100%)',
      clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`}} />
    <div style={{position: 'absolute', left: L, top: 0, width: 700 * ease.outCubic(p), height: 2, background: k.ink}} />
    <div style={{position: 'relative', paddingLeft: L, paddingTop: 20}}>
      {lines.map((line, i) => <div key={i} style={{fontFamily: font, fontWeight: 900, fontSize: sz, lineHeight: 1.22, color: k.ink, whiteSpace: 'nowrap', opacity: clamp(p * 2 - i * 0.3),
        textShadow: '0 2px 10px rgba(0,0,0,0.7)'}}>{line}</div>)}
    </div>
  </div>;
};
/** The quieter caption for templates without burned-in subtitles (news-package): one ink band under the strap. */
export const CaptionBar: React.FC<{captions: TimedCaption[]; k: Pk; keywords?: string[]; breaks?: Record<string, string>; y?: number}> = ({captions, k, keywords = [], breaks = {}, y = 1400}) => {
  const frame = useCurrentFrame();
  const ms = (frame / 30) * 1000;
  const c = captions.find((x) => ms >= x.startMs && ms < x.endMs);
  if (!c) return null;
  const kw = [...keywords].sort((a, b) => b.length - a.length).find((w) => c.text.includes(w));
  const lines = breaks[c.text]?.split('|') ?? captionLines(c.text, 13.5, kw);
  const sz = Math.max(60, Math.min(64, Math.floor(866 / Math.max(...lines.map(units)))));
  return <div style={{position: 'absolute', left: L, top: y}}>
    {lines.map((line, i) => {
      const parts = kw && line.includes(kw) ? line.split(kw) : null;
      return <div key={i} style={{fontFamily: font, fontWeight: 900, fontSize: sz, lineHeight: 1.18, color: k.ink, whiteSpace: 'nowrap', textShadow: '0 3px 14px rgba(0,0,0,0.75)'}}>
        {parts ? <>{parts[0]}<span style={{color: k.accent}}>{kw}</span>{parts.slice(1).join(kw as string)}</> : line}
      </div>;
    })}
  </div>;
};

/**
 * The toast caption (dark-keynote §4, in 9:16): captions are a UI component — a dark translucent pill centred at the
 * bottom, 1 px light border, soft shadow, a small accent "speaking" dot; it rises 14 px and fades in over 0.16 s. Two
 * lines at most, 60 px (our phone floor; the template's 40 px is a 1080p size).
 */
export const CaptionToast: React.FC<{captions: TimedCaption[]; k: Pk; breaks?: Record<string, string>; y?: number}> = ({captions, k, breaks = {}, y = 1360}) => {
  const frame = useCurrentFrame();
  const ms = (frame / 30) * 1000;
  const c = captions.find((x) => ms >= x.startMs && ms < x.endMs);
  if (!c) return null;
  const lines = breaks[c.text]?.split('|') ?? captionLines(c.text, 12.5);
  const sz = Math.max(60, Math.min(64, Math.floor(820 / Math.max(...lines.map(units)))));
  const p = ease.outCubic(clamp((ms - c.startMs) / 160));
  const pulse = 0.55 + 0.45 * Math.abs(Math.sin((ms / 1000) * Math.PI * 2.2));
  return <div style={{position: 'absolute', left: 0, width: W, top: y + (1 - p) * 14, display: 'flex', justifyContent: 'center', opacity: p}}>
    <div style={{position: 'relative', maxWidth: 940, padding: '18px 40px 20px 64px', borderRadius: 999, background: 'rgba(10,18,36,0.78)', border: '1px solid rgba(255,255,255,0.14)',
      boxShadow: '0 14px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)'}}>
      <div style={{position: 'absolute', left: 30, top: '50%', width: 14, height: 14, marginTop: -7, borderRadius: 7, background: k.accent, opacity: pulse, boxShadow: `0 0 12px ${k.accent}`}} />
      {lines.map((line, i) => <div key={i} style={{fontFamily: font, fontWeight: 800, fontSize: sz, lineHeight: 1.2, color: k.ink, whiteSpace: 'nowrap', textAlign: 'center'}}>{line}</div>)}
    </div>
  </div>;
};
/**
 * The board label caption (whiteboard §4, in 9:16): an off-white rounded label (~90 %), a handwriting face (霞鹜文楷),
 * dark ink, a short accent marker dash before the line; clause by clause, ≤ 2 lines; enters with a 0.12 s settle.
 */
export const CaptionLabel: React.FC<{captions: TimedCaption[]; k: Pk; breaks?: Record<string, string>; y?: number}> = ({captions, k, breaks = {}, y = 1400}) => {
  const frame = useCurrentFrame();
  const ms = (frame / 30) * 1000;
  const c = captions.find((x) => ms >= x.startMs && ms < x.endMs);
  if (!c) return null;
  const lines = breaks[c.text]?.split('|') ?? captionLines(c.text, 12.5);
  const sz = Math.max(60, Math.min(66, Math.floor(840 / Math.max(...lines.map(units)))));
  const p = ease.outBack(clamp((ms - c.startMs) / 120), 1.4);
  return <div style={{position: 'absolute', left: 0, width: W, top: y, display: 'flex', justifyContent: 'center', opacity: clamp(p * 2)}}>
    <div style={{position: 'relative', maxWidth: 960, padding: '14px 34px 18px 82px', borderRadius: 22, background: 'rgba(251,250,245,0.92)', boxShadow: '0 6px 18px rgba(30,30,25,0.18)',
      transform: `scale(${0.96 + 0.04 * p}) rotate(-0.4deg)`}}>
      <div style={{position: 'absolute', left: 28, top: 22 + sz * 0.42, width: 34, height: 9, borderRadius: 5, background: k.accent, transform: 'rotate(-4deg)'}} />
      {lines.map((line, i) => <div key={i} style={{fontFamily: hand, fontWeight: 500, fontSize: sz, lineHeight: 1.22, color: k.ink, whiteSpace: 'nowrap'}}>{line}</div>)}
    </div>
  </div>;
};

/**
 * The telestrator subtitle bar (telestrator §5, in 9:16): a black bar (0.72) with a 4 px accent edge on top, centred,
 * Chinese only (the template's English line is dropped — our viewers read Chinese), ≤ 2 lines at 60–64 px; it cuts in
 * (no fade) and the edge draws across in 0.12 s.
 */
export const CaptionTele: React.FC<{captions: TimedCaption[]; k: Pk; breaks?: Record<string, string>; y?: number}> = ({captions, k, breaks = {}, y = 1390}) => {
  const frame = useCurrentFrame();
  const ms = (frame / 30) * 1000;
  const c = captions.find((x) => ms >= x.startMs && ms < x.endMs);
  if (!c) return null;
  const lines = breaks[c.text]?.split('|') ?? captionLines(c.text, 13);
  const sz = Math.max(60, Math.min(64, Math.floor(860 / Math.max(...lines.map(units)))));
  const p = ease.outCubic(clamp((ms - c.startMs) / 120));
  return <div style={{position: 'absolute', left: 0, width: W, top: y, display: 'flex', justifyContent: 'center'}}>
    <div style={{position: 'relative', maxWidth: 980, padding: '16px 36px 20px', background: 'rgba(6,9,10,0.78)'}}>
      <div style={{position: 'absolute', left: 0, top: 0, height: 4, width: `${p * 100}%`, background: k.accent}} />
      {lines.map((line, i) => <div key={i} style={{fontFamily: font, fontWeight: 800, fontSize: sz, lineHeight: 1.2, color: k.ink, whiteSpace: 'nowrap', textAlign: 'center'}}>{line}</div>)}
    </div>
  </div>;
};
/**
 * The Swiss caption (swiss-motion §4, in 9:16): part of the layout, not a bar — flush left on the first column (x 64),
 * a 1 px ink rule above that grows along its length, each line rising out of a clip rect from below its baseline
 * (0.1 s apart, the precise ease), ≤ 2 lines at 60–66 px, ink on the page.
 */
export const CaptionSwiss: React.FC<{captions: TimedCaption[]; k: Pk; breaks?: Record<string, string>; y?: number}> = ({captions, k, breaks = {}, y = 1420}) => {
  const frame = useCurrentFrame();
  const ms = (frame / 30) * 1000;
  const c = captions.find((x) => ms >= x.startMs && ms < x.endMs);
  if (!c) return null;
  const lines = breaks[c.text]?.split('|') ?? captionLines(c.text, 12.5);
  const sz = Math.max(60, Math.min(66, Math.floor(860 / Math.max(...lines.map(units)))));
  const t = (ms - c.startMs) / 1000;
  const snap = (x: number) => { const u = clamp(x); return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; };
  return <div style={{position: 'absolute', left: L, top: y}}>
    <div style={{width: 860 * snap(t / 0.2), height: 2, background: k.ink, marginBottom: 18}} />
    {lines.map((line, i) => {
      const q = snap((t - 0.04 - i * 0.1) / 0.18);
      return <div key={i} style={{overflow: 'hidden', height: sz * 1.2}}>
        <div style={{fontFamily: font, fontWeight: 800, fontSize: sz, lineHeight: 1.2, color: k.ink, whiteSpace: 'nowrap', letterSpacing: -0.5, transform: `translateY(${(1 - q) * sz * 1.2}px)`}}>{line}</div>
      </div>;
    })}
  </div>;
};

/**
 * The map-label subtitle (lemo iso-infographic §4, in 9:16): a pale card with a small radius and an ink border, a tiny
 * isometric cube as the legend chip, centred above the bottom band. The border draws first (0.12 s), then the text wipes
 * in left → right (0.18 s). `chip` is the colour of the protocol on stage (net-six-protocols: the subtitle is the legend),
 * three tones derived like the engine's faces. ≤ 2 lines at 60–64 px.
 */
export const CaptionMap: React.FC<{captions: TimedCaption[]; k: Pk; breaks?: Record<string, string>; y?: number; chip?: string}> = ({captions, k, breaks = {}, y = 1440, chip}) => {
  const frame = useCurrentFrame();
  const ms = (frame / 30) * 1000;
  const c = captions.find((x) => ms >= x.startMs && ms < x.endMs);
  if (!c) return null;
  const lines = breaks[c.text]?.split('|') ?? captionLines(c.text, 12.5);
  const sz = Math.max(60, Math.min(64, Math.floor(800 / Math.max(...lines.map(units)))));
  const b = ease.outCubic(clamp((ms - c.startMs) / 120));
  const t = ease.outCubic(clamp((ms - c.startMs - 60) / 180));
  const cc = chip ?? k.accent;
  return <div style={{position: 'absolute', left: 0, width: W, top: y, display: 'flex', justifyContent: 'center'}}>
    <div style={{position: 'relative', maxWidth: 900, padding: '14px 34px 18px 96px', borderRadius: 14, background: k.panel,
      boxShadow: `0 0 0 ${3 * b}px ${k.ink}`, clipPath: `inset(0 ${(1 - b) * 100}% 0 0 round 14px)`}}>
      <svg width={46} height={50} viewBox="-23 -25 46 50" style={{position: 'absolute', left: 30, top: 18 + (lines.length - 1) * sz * 0.6}}>
        <polygon points="0,-20 19,-10 0,0 -19,-10" fill={cc} style={{filter: 'brightness(1.08)'}} />
        <polygon points="-19,-10 0,0 0,22 -19,12" fill={cc} style={{filter: 'brightness(0.86)'}} />
        <polygon points="19,-10 0,0 0,22 19,12" fill={cc} style={{filter: 'brightness(0.66)'}} />
      </svg>
      <div style={{clipPath: `inset(0 ${(1 - t) * 100}% 0 0)`}}>
        {lines.map((line, i) => <div key={i} style={{fontFamily: font, fontWeight: 800, fontSize: sz, lineHeight: 1.22, color: k.ink, whiteSpace: 'nowrap'}}>{line}</div>)}
      </div>
    </div>
  </div>;
};
