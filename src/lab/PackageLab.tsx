import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {font} from '../tutorial/theme';
import {cond, plex} from '../tutorial/fonts';
import {Grain} from '../tutorial/props';

// PackageLab: proof frames for the "news package" finish learned from lemo-opuscar's caption-news and news-package
// styles (docs/video-craft/学习/lemo-opuscar.md §精修), redone on the two paused films so they can be put next to the
// current frames. The grammar, not their look: real material full-bleed under one grade, a caption card that *is* the
// subtitle (left aligned, chunks, one keyword in a block), a bug + source tag, condensed fixed-width numerals, mono
// datelines, one accent per film taken from its own material. 9:16: the caption stacks on two lines under the picture
// (caption-news §2), clear of the right-hand button column (x > 930) and the bottom description band (y > 1560).
// Render: npx remotion still src/index.ts PackageLab qa/lab/package-<shot>.png --props='{"shot":"burnHook"}'

export type PackageShot = 'burnHook' | 'burnWhy' | 'phdHook' | 'phdCompute';
type Look = {bg: string; panel: string; ink: string; accent: string; onAccent: string; dim: string};
const BURN: Look = {bg: '#111827', panel: '#172033', ink: '#F7F5EF', accent: '#FBBF24', onAccent: '#111827', dim: '#9CA3AF'}; // his chart's colours
const PHD: Look = {bg: '#111928', panel: '#18212F', ink: '#F7F5EF', accent: '#3A9AAD', onAccent: '#FFFFFF', dim: '#9AA3AF'}; // the compute slide's teal
const GRADE = 'contrast(1.07) saturate(0.92) brightness(0.98)';
const L = 64; // left margin of every type block

const Graded: React.FC<{src: string; style: React.CSSProperties; warm?: number}> = ({src, style, warm = 0.06}) => (
  <div style={{position: 'absolute', overflow: 'hidden', ...style}}>
    <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: GRADE}} />
    <div style={{position: 'absolute', inset: 0, background: `rgba(255,170,70,${warm})`, mixBlendMode: 'soft-light'}} />
  </div>
);
/** Bug (top left): accent block + topic plate. */
const Bug: React.FC<{k: Look; tag: string; topic: string; en: string}> = ({k, tag, topic, en}) => (
  <div style={{position: 'absolute', left: L, top: 150, display: 'flex', height: 58}}>
    <div style={{background: k.accent, color: k.onAccent, fontFamily: font, fontWeight: 900, fontSize: 32, padding: '0 16px', display: 'flex', alignItems: 'center'}}>{tag}</div>
    <div style={{background: 'rgba(14,14,12,0.66)', display: 'flex', alignItems: 'center', gap: 14, padding: '0 18px'}}>
      <span style={{fontFamily: font, fontWeight: 900, fontSize: 30, color: k.ink}}>{topic}</span>
      <span style={{fontFamily: cond, fontWeight: 800, fontSize: 24, color: k.accent, letterSpacing: 1}}>{en}</span>
    </div>
  </div>
);
/** Source tag under the bug (only on data / document shots). */
const Source: React.FC<{k: Look; label: string}> = ({k, label}) => (
  <div style={{position: 'absolute', left: L, top: 222, display: 'flex', height: 44}}>
    <div style={{background: k.ink, color: '#0E0E0C', fontFamily: font, fontWeight: 900, fontSize: 26, padding: '0 12px', display: 'flex', alignItems: 'center'}}>来源</div>
    <div style={{background: 'rgba(14,14,12,0.82)', color: k.ink, fontFamily: plex, fontWeight: 500, fontSize: 24, padding: '0 14px', display: 'flex', alignItems: 'center', letterSpacing: 0.5}}>{label}</div>
  </div>
);
/** Footage credit chip at the footage's bottom-right corner (our external-footage rule). */
const Credit: React.FC<{text: string; x: number; y: number}> = ({text, x, y}) => (
  <div style={{position: 'absolute', right: 1080 - x, top: y - 40, background: 'rgba(14,14,12,0.6)', color: 'rgba(247,245,239,0.9)', fontFamily: font, fontWeight: 700, fontSize: 24, padding: '4px 12px'}}>{text}</div>
);
/** The caption card: the subtitle as the graphic. Lines of chunks; `{word}` sits in the accent block. */
const CapCard: React.FC<{k: Look; lines: string[]; sub?: string; y?: number; size?: number}> = ({k, lines, sub, y = 1190, size = 100}) => (
  <div style={{position: 'absolute', left: L, top: y}}>
    {lines.map((line, i) => <div key={i} style={{fontFamily: font, fontWeight: 900, fontSize: size, lineHeight: 1.18, color: k.ink, whiteSpace: 'nowrap', textShadow: '0 4px 20px rgba(0,0,0,0.6)'}}>
      {line.split(/(\{[^}]+\})/).filter(Boolean).map((q, j) => q[0] === '{'
        ? <span key={j} style={{background: k.accent, color: k.onAccent, padding: '0 14px', margin: '0 4px', textShadow: 'none'}}>{q.slice(1, -1)}</span>
        : <span key={j}>{q}</span>)}
    </div>)}
    {sub && <div style={{marginTop: 18, fontFamily: plex, fontWeight: 500, fontSize: 26, color: 'rgba(247,245,239,0.78)', letterSpacing: 0.5}}>{sub}</div>}
  </div>
);
/** Under the caption card: bottom gradient plus a dark corner, so type sits on the picture without a box. */
const Veil: React.FC<{from?: number}> = ({from = 820}) => <>
  <div style={{position: 'absolute', left: 0, right: 0, top: from, bottom: 0, background: 'linear-gradient(180deg, rgba(14,14,12,0) 0, rgba(14,14,12,0.6) 30%, rgba(14,14,12,0.88) 60%)'}} />
  <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 320, background: 'linear-gradient(180deg, rgba(14,14,12,0.6), rgba(14,14,12,0))'}} />
</>;
const Vignette: React.FC = () => <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 85% 70% at 50% 45%, transparent 55%, rgba(0,0,0,0.42) 100%)'}} />;
/** A number with fixed-width digits (so a rolling counter never jitters), Barlow Condensed 800. */
const Num: React.FC<{v: string; size: number; color: string}> = ({v, size, color}) => (
  <span style={{fontFamily: cond, fontWeight: 800, fontSize: size, color, fontVariantNumeric: 'tabular-nums', lineHeight: 0.86, letterSpacing: -2}}>{v}</span>
);

/* ---------- ai-more-work-burnout ---------- */

// his monthly contributions, Jan 2019 … Oct 2026 (read back from his SVG; see src/tutorial/scenes/ai-more-work-burnout.tsx)
const ALL = [74, 114, 68, 38, 12, 30, 21, 67, 86, 147, 148, 180, 212, 249, 246, 319, 220, 287, 184, 257, 226, 200, 162, 149, 127, 167, 138, 138, 205, 78, 69, 141, 202, 196, 216, 162,
  111, 126, 171, 122, 76, 109, 109, 117, 122, 167, 150, 118, 125, 151, 71, 56, 135, 108, 72, 87, 111, 105, 95, 73, 147, 196, 105, 167, 91, 73, 148, 118, 107, 99, 89, 86,
  103, 170, 88, 111, 113, 83, 129, 150, 145, 124, 88, 50, 277, 233, 203, 187, 114, 77, 104, 427, 301, 179];
const Ledger: React.FC<{k: Look; top: number; h: number}> = ({k, top, h}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top, height: h, background: k.panel}}>
    {Array.from({length: Math.floor(h / 54)}, (_, i) => <div key={i} style={{position: 'absolute', left: 0, right: 0, top: 40 + i * 54, height: 2, background: 'rgba(255,255,255,0.045)'}} />)}
    {[44, 52].map((x) => <div key={x} style={{position: 'absolute', top: 0, bottom: 0, left: x, width: 2, background: 'rgba(251,191,36,0.32)'}} />)}
  </div>
);
const Curve: React.FC<{k: Look; x: number; y: number; w: number; h: number; max: number}> = ({k, x, y, w, h, max}) => {
  const px = (i: number) => x + (i / (ALL.length - 1)) * w, py = (v: number) => y + h - (v / max) * h;
  const d = ALL.map((v, i) => `${i ? 'L' : 'M'}${px(i).toFixed(1)} ${py(v).toFixed(1)}`).join(' ');
  return <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
    {[100, 200, 300, 400].map((v) => <g key={v}><line x1={x} x2={x + w} y1={py(v)} y2={py(v)} stroke="rgba(255,255,255,0.08)" strokeWidth={2} />
      <text x={x + w} y={py(v) - 10} textAnchor="end" fontFamily={plex} fontSize={22} fill={k.dim}>{v}</text></g>)}
    <path d={`${d} L${px(ALL.length - 1)} ${y + h} L${x} ${y + h} Z`} fill={k.accent} opacity={0.12} />
    <path d={d} fill="none" stroke={k.accent} strokeWidth={5} strokeLinejoin="round" />
    <circle cx={px(91)} cy={py(427)} r={13} fill="#FDE68A" /><circle cx={px(91)} cy={py(427)} r={34} fill="none" stroke="#FDE68A" strokeWidth={4} opacity={0.6} />
    <circle cx={px(15)} cy={py(319)} r={9} fill={k.dim} />
    <line x1={px(15)} x2={px(91)} y1={py(319)} y2={py(319)} stroke={k.dim} strokeWidth={3} strokeDasharray="10 9" />
    <text x={px(15) + 18} y={py(319) - 16} fontFamily={plex} fontSize={24} fill={k.dim}>APR 2020 · 319</text>
    {[2019, 2021, 2023, 2025].map((yr) => <text key={yr} x={px((yr - 2019) * 12)} y={y + h + 40} textAnchor="middle" fontFamily={plex} fontSize={22} fill={k.dim}>{yr}</text>)}
    <text x={px(91)} y={y + h + 40} textAnchor="middle" fontFamily={plex} fontSize={22} fill={k.accent}>AUG 2026</text>
  </svg>;
};
const BurnHook: React.FC = () => {
  const k = BURN;
  return <AbsoluteFill style={{background: k.bg}}>
    <Ledger k={k} top={0} h={1920} />
    <Curve k={k} x={70} y={560} w={940} h={520} max={450} />
    {/* frame-0 hook: kicker, the number in the accent block, the unit */}
    <div style={{position: 'absolute', left: L, top: 300}}>
      <div style={{fontFamily: font, fontWeight: 900, fontSize: 64, color: k.ink, textShadow: '0 4px 16px rgba(0,0,0,0.6)'}}>今年 8 月 · 一个人</div>
    </div>
    <div style={{position: 'absolute', left: L - 18, top: 392, display: 'flex', alignItems: 'flex-end', gap: 18, background: k.accent, padding: '10px 26px 6px 22px'}}>
      <Num v="427" size={260} color={k.onAccent} />
      <span style={{fontFamily: font, fontWeight: 900, fontSize: 96, color: k.onAccent, paddingBottom: 26}}>次贡献</span>
    </div>
    <Veil from={980} />
    <Bug k={k} tag="AI 新闻" topic="他的 GitHub" en="ONE MAN'S LEDGER" />
    <Source k={k} label="oioannou.com · 2026.10.27" />
    <CapCard k={k} lines={['AI 说好', '让他{少干活}']} sub="GitHub contributions · commits + PRs + reviews + issues" />
    <Vignette />
    <Grain w={1080} h={1920} o={0.35} />
  </AbsoluteFill>;
};
const BurnWhy: React.FC = () => {
  const k = BURN;
  // the recording, punched in 1.35× on the "Needs you" column (source 1920 × 1080 → band 1080 wide; ≤ 1.5× of source)
  return <AbsoluteFill style={{background: k.bg}}>
    <div style={{position: 'absolute', left: 0, top: 300, width: 1080, height: 820, overflow: 'hidden'}}>
      <Graded src="images/lab/package/pc-needs-you.jpg" style={{left: -40, top: -60, width: 1080 * 1.35 * 1.0, height: 608 * 1.35 * 1.0}} warm={0.04} />
      {/* corner brackets close in on the column that needs him */}
      {[[60, 70, 1, 1], [470, 70, -1, 1], [60, 610, 1, -1], [470, 610, -1, -1]].map(([x, y, sx, sy], i) => <div key={i} style={{position: 'absolute', left: x - (sx < 0 ? 60 : 0), top: y - (sy < 0 ? 60 : 0), width: 60, height: 60,
        borderLeft: sx > 0 ? `8px solid ${k.accent}` : undefined, borderRight: sx < 0 ? `8px solid ${k.accent}` : undefined, borderTop: sy > 0 ? `8px solid ${k.accent}` : undefined, borderBottom: sy < 0 ? `8px solid ${k.accent}` : undefined}} />)}
      <div style={{position: 'absolute', left: 500, top: 120, background: k.accent, color: k.onAccent, padding: '6px 18px', display: 'flex', alignItems: 'flex-end', gap: 12}}>
        <Num v="3" size={150} color={k.onAccent} /><div style={{paddingBottom: 18}}><div style={{fontFamily: font, fontWeight: 900, fontSize: 52, lineHeight: 1}}>个在等他</div><div style={{fontFamily: cond, fontWeight: 600, fontSize: 30}}>NEEDS YOU</div></div>
      </div>
    </div>
    <Credit text="录屏 @Parallel Code｜案例展示" x={1080 - 24} y={1120} />
    <Veil from={900} />
    {/* lower third: what we are looking at */}
    <div style={{position: 'absolute', left: L, top: 1000, display: 'flex', height: 86}}>
      <div style={{width: 8, background: k.accent}} />
      <div style={{background: 'rgba(14,14,12,0.78)', padding: '8px 22px'}}>
        <div style={{fontFamily: font, fontWeight: 900, fontSize: 36, color: k.ink, lineHeight: 1.1}}>7 个 agent 同时在跑</div>
        <div style={{fontFamily: cond, fontWeight: 600, fontSize: 24, color: k.dim, letterSpacing: 1}}>SEVEN TASKS · ONE ENGINEER</div>
      </div>
    </div>
    <Bug k={k} tag="AI 新闻" topic="他的 GitHub" en="ONE MAN'S LEDGER" />
    <CapCard k={k} lines={['每个都不一直要你', '但每个都{有时}要你']} y={1180} size={86} sub="“Every one of them needs me sometimes.”" />
    <Vignette />
    <Grain w={1080} h={1920} o={0.35} />
  </AbsoluteFill>;
};

/* ---------- anthropic-phd-career-reset ---------- */

const PhdHook: React.FC = () => {
  const k = PHD;
  return <AbsoluteFill style={{background: k.bg}}>
    <Graded src="images/lab/package/speaker.jpg" style={{left: -300, top: 260, width: 1620, height: 911}} />
    <Credit text="视频 @Stanford HAI｜案例展示" x={1080 - 24} y={1171} />
    <Veil from={760} />
    {/* the quote card: his slide's words, verbatim */}
    <div style={{position: 'absolute', left: L, top: 330, width: 640, background: 'rgba(17,25,40,0.86)', padding: '26px 30px 24px', borderTop: `8px solid ${k.accent}`}}>
      <div style={{fontFamily: cond, fontWeight: 800, fontSize: 96, color: k.accent, lineHeight: 0.6, height: 44}}>“</div>
      <div style={{fontFamily: cond, fontWeight: 800, fontSize: 58, color: k.ink, lineHeight: 1.05}}>I think we're going to have AGI in <span style={{borderBottom: `6px solid ${k.accent}`}}>3 years</span>.</div>
      <div style={{fontFamily: cond, fontWeight: 600, fontSize: 40, color: 'rgba(247,245,239,0.75)', lineHeight: 1.1, marginTop: 10}}>… I'm planning to finish my PhD in 2 years, get a postdoc, and apply for faculty jobs.</div>
      <div style={{marginTop: 16, fontFamily: plex, fontSize: 22, color: k.dim}}>A GRAD STUDENT · QUOTED ON HIS SLIDE</div>
    </div>
    <div style={{position: 'absolute', left: L, top: 1010, display: 'flex', height: 86}}>
      <div style={{width: 8, background: k.accent}} />
      <div style={{background: 'rgba(14,14,12,0.78)', padding: '8px 22px'}}>
        <div style={{fontFamily: font, fontWeight: 900, fontSize: 36, color: k.ink, lineHeight: 1.1}}>Jascha Sohl-Dickstein · Anthropic</div>
        <div style={{fontFamily: cond, fontWeight: 600, fontSize: 24, color: k.dim, letterSpacing: 1}}>STANFORD PAI26 · JUNE 2026</div>
      </div>
    </div>
    <Bug k={k} tag="AI 观点" topic="斯坦福演讲" en="STANFORD PAI26" />
    <CapCard k={k} lines={['AGI {3 年}内就来', '他却规划博后、教职']} y={1180} size={90} />
    <Vignette />
    <Grain w={1080} h={1920} o={0.35} />
  </AbsoluteFill>;
};
const PhdCompute: React.FC = () => {
  const k = PHD;
  return <AbsoluteFill style={{background: k.bg}}>
    <div style={{position: 'absolute', inset: 0, background: k.panel}}>
      {Array.from({length: 34}, (_, i) => <div key={i} style={{position: 'absolute', left: 0, right: 0, top: 40 + i * 54, height: 2, background: 'rgba(255,255,255,0.04)'}} />)}
    </div>
    {/* the slide as paper on the desk, pushed in on the 2010–2025 line */}
    <div style={{position: 'absolute', left: -120, top: 330, width: 1320, transform: 'rotate(-1.5deg)', boxShadow: '0 30px 60px rgba(0,0,0,0.5)'}}>
      <Img src={staticFile('images/tutorials/anthropic-phd-career-reset/compute-plot.jpg')} style={{width: '100%', display: 'block', filter: 'contrast(1.04)'}} />
      <svg width={1320} height={742} style={{position: 'absolute', left: 0, top: 0}}>
        <line x1={730 * 1.1} y1={373 * 1.1} x2={855 * 1.1} y2={205 * 1.1} stroke={k.accent} strokeWidth={26} strokeLinecap="round" opacity={0.35} />
        <circle cx={855 * 1.1} cy={205 * 1.1} r={30} fill="none" stroke={k.accent} strokeWidth={6} />
      </svg>
    </div>
    <div style={{position: 'absolute', left: L - 18, top: 1010, display: 'flex', alignItems: 'flex-end', gap: 14, background: k.accent, padding: '8px 24px 4px 20px'}}>
      <span style={{fontFamily: cond, fontWeight: 800, fontSize: 120, color: k.onAccent, lineHeight: 0.9}}>×</span>
      <Num v="10,000,000" size={170} color={k.onAccent} />
    </div>
    <Veil from={1120} />
    <Bug k={k} tag="AI 观点" topic="斯坦福演讲" en="STANFORD PAI26" />
    <Source k={k} label="SPEAKER'S SLIDE · OUR WORLD IN DATA" />
    <CapCard k={k} lines={['十年，训练算力', '涨了约{1000 万倍}']} y={1250} size={90} sub="“about 10 million fold in the last decade” · 04:43" />
    <Vignette />
    <Grain w={1080} h={1920} o={0.35} />
  </AbsoluteFill>;
};

export const PackageLab: React.FC<{shot: PackageShot}> = ({shot}) => (
  shot === 'burnHook' ? <BurnHook /> : shot === 'burnWhy' ? <BurnWhy /> : shot === 'phdHook' ? <PhdHook /> : <PhdCompute />
);
