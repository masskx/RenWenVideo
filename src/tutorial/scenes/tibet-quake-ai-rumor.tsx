import React from 'react';
import {cinema} from '../theme';
import {beatZoom, clamp, ease} from '../../fx';
import {Cue, Scene} from '../paper';
import {Abs, DIM, FAINT, GOLD, Headline, INK, Pool, Reveal, Root, Surface, display, font, rise} from '../cinema';

// tibet-quake-ai-rumor: after the M7.0 Baqing (Nagqu, Tibet) earthquake of 22 Oct 2026, three ways to check a "disaster
// picture" before sharing it — look at the details, search for the source, check the official bulletin (≈ 38 s).
// Script: inputs/tibet-quake-ai-rumor/script.md, narration verbatim; facts per its sources.md (CEIC via 应急管理部 /
// 中新网 / 新华网: 22:33, 北纬32.40 东经93.79, 7.0级, 震源深度10千米). Disaster rules: no casualty figures, no prediction,
// no real disaster imagery, no map outline (an imprecise border is its own problem — a pin and rings instead), agency names
// as text only. The one fake picture is a flat drawing, badged 「AI生成示例」 the whole time it is on screen. Restrained
// tone: no marker sweeps, no loud hits, soft sounds. Cinema look, background D. huashu-motion: the drawn "disaster picture"
// is the object carried from the feed through the checks to the last frame.

const R = 14;
const SLATE2 = '#273249', LINE = 'rgba(220,230,245,0.75)';

const Stage: React.FC<{f: number; dur: number; beats: number[]; children: React.ReactNode}> = ({f, dur, beats, children}) => {
  const z = beatZoom(f / 30, beats.map((b) => b / 30), {amp: 0.035, drift: 8, d: 0.7});
  return <Root f={f} dur={dur}>
    <div style={{position: 'absolute', inset: 0, transformOrigin: '50% 40%', transform: `translate(${z.dx.toFixed(2)}px, ${z.dy.toFixed(2)}px) scale(${z.s.toFixed(4)})`}}>{children}</div>
  </Root>;
};
const gold = (s: string) => <span style={{color: GOLD}}>{s}</span>;
const Big: React.FC<{size?: number; c?: string; w?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({size = 64, c = INK, w = 900, style, children}) => (
  <div style={{fontFamily: display, fontWeight: w, fontSize: size, lineHeight: 1.18, color: c, whiteSpace: 'nowrap', ...style}}>{children}</div>
);
const Small: React.FC<{c?: string; size?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({c = DIM, size = 40, style, children}) => (
  <Big size={size} c={c} w={700} style={{fontFamily: font, letterSpacing: 2, ...style}}>{children}</Big>
);

/* ---------- the drawn "AI disaster picture": flat, schematic, no people, no rubble ---------- */

// Spots the lens visits (in the drawing's 800 × 500 space).
const SPOT = {sign: [230, 175], hand: [215, 395], building: [610, 250]} as const;

/** Glyph-like scribbles for the garbled sign (deterministic). */
const Garble: React.FC<{x: number; y: number}> = ({x, y}) => {
  const strokes: string[] = [];
  for (let g = 0; g < 5; g += 1) {
    const gx = x + g * 62;
    for (let s = 0; s < 4; s += 1) {
      const r = Math.sin(g * 12.9898 + s * 78.233) * 43758.5453, u = r - Math.floor(r);
      const r2 = Math.sin(g * 4.1 + s * 9.7) * 9631.7, v = r2 - Math.floor(r2);
      const x1 = gx + u * 40, y1 = y + v * 44, x2 = gx + ((u * 7) % 1) * 44, y2 = y + ((v * 5) % 1) * 46;
      strokes.push(`M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}`);
    }
  }
  return <path d={strokes.join(' ')} stroke="#e8eef8" strokeWidth={6} strokeLinecap="round" fill="none" />;
};
const Drawing: React.FC = () => (
  <g>
    <rect x={0} y={0} width={800} height={500} fill="url(#sky)" />
    <rect x={0} y={455} width={800} height={45} fill="#141b29" />
    {/* the warped building: its right edge and floors bend */}
    <path d="M470 455 L470 95 Q560 80 690 92 Q760 180 728 300 Q706 380 742 455 Z" fill={SLATE2} stroke={LINE} strokeWidth={3} />
    {Array.from({length: 5}, (_, r) => Array.from({length: 3}, (_, c) => {
      const y = 120 + r * 64, x = 500 + c * 66 + Math.sin(r * 1.3 + c) * 10 + r * 6;
      return <rect key={`${r}-${c}`} x={x} y={y} width={42} height={36} rx={4} fill="#3b4a66" transform={`skewX(${(r - 2) * 7})`} style={{transformOrigin: `${x + 21}px ${y + 18}px`, transformBox: 'view-box'}} />;
    }))}
    {/* the shop sign with garbled "characters" */}
    <rect x={60} y={130} width={340} height={92} rx={10} fill="#33405a" stroke={LINE} strokeWidth={3} />
    <Garble x={80} y={152} />
    <line x1={230} y1={222} x2={230} y2={300} stroke={LINE} strokeWidth={4} />
    {/* the hand with six fingers */}
    <g fill="#c4cfdf" stroke="#8fa0ba" strokeWidth={2}>
      <rect x={192} y={420} width={48} height={50} rx={10} />
      {[-34, -20, -7, 6, 19, 33].map((a, i) => <rect key={i} x={207} y={298} width={18} height={84} rx={9} transform={`rotate(${a} 216 404)`} />)}
      <rect x={170} y={366} width={92} height={74} rx={30} />
      <rect x={128} y={378} width={20} height={58} rx={10} transform="rotate(-42 160 420)" />
    </g>
  </g>
);
const Defs: React.FC<{id: string}> = ({id}) => (
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1e2a40" /><stop offset="1" stopColor="#2a3550" /></linearGradient>
    <clipPath id={id}><rect x={0} y={0} width={800} height={500} rx={18} /></clipPath>
  </defs>
);
/** The fake picture at width w, with an optional magnifying lens (spot, zoom k, appear 0..1). */
const FakePic: React.FC<{w: number; lens?: readonly [number, number]; lensOn?: number; badge?: boolean; uid: string}> = ({w, lens, lensOn = 0, badge = true, uid}) => {
  const h = w * 500 / 800;
  return <div style={{position: 'relative', width: w, height: h}}>
    <svg width={w} height={h} viewBox="0 0 800 500" style={{display: 'block'}}>
      <Defs id={`clip-${uid}`} />
      <g clipPath={`url(#clip-${uid})`}><Drawing /></g>
      {lens && lensOn > 0 && <g opacity={clamp(lensOn * 1.5)}>
        <clipPath id={`lens-${uid}`}><circle cx={lens[0]} cy={lens[1]} r={110 * lensOn} /></clipPath>
        <rect x={0} y={0} width={800} height={500} fill="rgba(7,11,20,0.45)" />
        <g clipPath={`url(#lens-${uid})`}>
          <g transform={`translate(${lens[0]} ${lens[1]}) scale(2) translate(${-lens[0]} ${-lens[1]})`}><Drawing /></g>
        </g>
        <circle cx={lens[0]} cy={lens[1]} r={110 * lensOn} fill="none" stroke={GOLD} strokeWidth={6} />
      </g>}
    </svg>
    {badge && <div style={{position: 'absolute', right: 12, top: 12, background: '#ffffff', color: cinema.bg, fontFamily: font, fontWeight: 900,
      fontSize: Math.max(40, Math.round(w / 20)), lineHeight: 1, padding: '10px 14px', borderRadius: 10}}>AI生成示例</div>}
  </div>;
};

/* ---------- 1 hook: the earthquake, calmly ---------- */

const hookPlan = (cue: Cue) => ({a: cue('a', 50), b: cue('b', 147)});
const Rings: React.FC<{f: number; calm: number}> = ({f, calm}) => (
  <svg width={900} height={520} viewBox="-450 -260 900 520" style={{display: 'block', overflow: 'visible'}}>
    {/* flattened rings on the ground plane, spreading out slowly from the epicentre */}
    {[0, 1, 2, 3].map((i) => {
      const u = ((f / 90 + i / 4) % 1);
      return <ellipse key={i} cx={0} cy={60} rx={60 + u * 380} ry={(60 + u * 380) * 0.32} fill="none" stroke={GOLD} strokeWidth={3}
        opacity={(1 - u) * (0.7 - 0.35 * calm)} />;
    })}
    <ellipse cx={0} cy={60} rx={36} ry={12} fill="rgba(255,197,61,0.35)" />
    <path d="M0 50 C -38 0 -42 -40 0 -78 C 42 -40 38 0 0 50 Z" fill={GOLD} />
    <circle cx={0} cy={-26} r={16} fill={cinema.bg} />
  </svg>
);
const Hook: Scene = ({f, dur, cue}) => {
  const p = hookPlan(cue);
  const calm = rise(f, p.b, 30);
  return <Stage f={f} dur={dur} beats={[p.a]}>
    <Pool x={450} y={760} o={0.12 + 0.06 * calm} />
    <Abs y={0}><Headline f={f} at={-20} kicker="10月22日 22:33" lines={['西藏巴青', <span key="2">{gold('7.0')}级地震</span>]} size={124} /></Abs>
    <Abs y={360}><Reveal f={f} at={-6} d={R} dy={12}><Small c={DIM}>信息以中国地震台网为准</Small></Reveal></Abs>
    <Abs y={470}><Reveal f={f} at={-4} d={R}><Rings f={f} calm={calm} /></Reveal></Abs>
    <Abs y={1000} style={{textAlign: 'center'}}><Reveal f={f} at={p.a + 4} d={R} dy={10}><Small c={FAINT}>北纬32.40° · 东经93.79°</Small></Reveal></Abs>
  </Stage>;
};
Hook.sfx = () => [{at: 0, kind: 'chime', gain: 0.08}];

/* ---------- 2 the feed fills with "disaster pictures" ---------- */

const feedPlan = (cue: Cue) => ({a: cue('a', 37), b: cue('b', 108), c: cue('c', 150)});
const POSTS = [{tag: '灾情图', q: true}, {tag: '视频', q: false}, {tag: '灾情图', q: true}, {tag: '视频', q: true}, {tag: '灾情图', q: false}];
const Post: React.FC<{tag: string; q: number; video: boolean; uid: string}> = ({tag, q, video, uid}) => (
  <div style={{background: 'rgba(255,255,255,0.06)', borderRadius: 18, padding: 16, marginBottom: 18}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12}}>
      <div style={{width: 40, height: 40, borderRadius: 20, background: 'rgba(255,255,255,0.18)'}} />
      <div style={{width: 160, height: 14, borderRadius: 7, background: 'rgba(255,255,255,0.18)'}} />
      <div style={{marginLeft: 'auto', fontFamily: font, fontWeight: 800, fontSize: 40, color: DIM}}>{tag}</div>
    </div>
    <div style={{position: 'relative', filter: 'blur(1.5px) saturate(0.7)', opacity: 0.85}}>
      <FakePic w={408} badge={false} uid={uid} />
      {video && <div style={{position: 'absolute', left: '50%', top: '50%', width: 0, height: 0, transform: 'translate(-30%, -50%)',
        borderLeft: '44px solid rgba(255,255,255,0.85)', borderTop: '28px solid transparent', borderBottom: '28px solid transparent'}} />}
    </div>
    {q > 0 && <div style={{position: 'absolute', right: 28, top: 92, width: 76, height: 76, borderRadius: 38, background: GOLD, color: cinema.bg,
      fontFamily: display, fontWeight: 900, fontSize: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${q})`}}>?</div>}
  </div>
);
const Feed: Scene = ({f, dur, cue}) => {
  const p = feedPlan(cue);
  const scroll = Math.min(f, p.c) * 4.2 + ease.outCubic(clamp((f - p.c) / 20)) * 30;
  return <Stage f={f} dur={dur} beats={[p.b, p.c]}>
    <Pool x={450} y={560} o={0.12} />
    <Abs y={0}><Headline f={f} at={-10} lines={['先别急着转']} size={112} /></Abs>
    <Abs y={150}><Reveal f={f} at={p.b - 4} d={R} dy={12}><Big size={52} w={800} c={DIM}>网上会有 {gold('AI 假灾情图')}</Big></Reveal></Abs>
    {/* a generic phone: no app chrome, no accounts */}
    <Abs x={210} y={240} w={480}><Reveal f={f} at={-6} d={R}>
      <div style={{width: 480, height: 620, borderRadius: 54, border: '3px solid rgba(255,255,255,0.28)', background: 'rgba(10,15,26,0.9)',
        boxShadow: '0 30px 80px rgba(0,0,0,0.55)', overflow: 'hidden', position: 'relative'}}>
        <div style={{position: 'absolute', left: 20, right: 20, top: 30 - (scroll % (5 * 330)), transform: 'translateZ(0)'}}>
          {[...POSTS, ...POSTS].map((x, i) => <div key={i} style={{position: 'relative'}}>
            <Post tag={x.tag} video={x.tag === '视频'} q={x.q ? rise(f, p.b + (i % 5) * 4, 10) : 0} uid={`feed${i}`} />
          </div>)}
        </div>
      </div>
    </Reveal></Abs>
    <Abs y={900}><Reveal f={f} at={p.c - 4} d={R} dy={30}>
      <Surface accent={GOLD} pad="0 40px" style={{height: 150, background: 'rgba(22,30,46,0.96)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 26}}>
        {['看细节', '搜来源', '对官方'].map((t, i) => <Big key={t} size={56} w={800} style={{opacity: rise(f, p.c + i * 6, 10)}}>{gold(`${i + 1}`)} {t}</Big>)}
      </Surface>
    </Reveal></Abs>
  </Stage>;
};
Feed.sfx = (cue) => {
  const p = feedPlan(cue);
  return [{at: p.b, kind: 'tick', gain: 0.06}, {at: p.c, kind: 'tap', gain: 0.08}];
};

/* ---------- 3 one: look at the details (the lens visits sign, hand, building) ---------- */

const detailPlan = (cue: Cue) => ({a: cue('a', 48), b: cue('b', 84), c: cue('c', 114), d: cue('d', 146)});
const lerp2 = (a: readonly [number, number], b: readonly [number, number], k: number) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k] as const;
const Detail: Scene = ({f, dur, cue}) => {
  const p = detailPlan(cue);
  const m1 = ease.inOutCubic(clamp((f - p.b + 6) / 12)), m2 = ease.inOutCubic(clamp((f - p.c + 6) / 12));
  const spot = m2 > 0 ? lerp2(SPOT.hand, SPOT.building, m2) : lerp2(SPOT.sign, SPOT.hand, m1);
  const lensOn = rise(f, p.a - 6, 12) * (1 - rise(f, p.d, 12));
  const items = [{t: '招牌乱码', at: p.a}, {t: '手指不对', at: p.b}, {t: '建筑扭曲', at: p.c}];
  return <Stage f={f} dur={dur} beats={[p.a, p.b, p.c, p.d]}>
    <Pool x={450} y={560} o={0.12} />
    <Abs y={0}><Headline f={f} at={-12} no={1} total={3} lines={['看细节']} size={104} /></Abs>
    <Abs y={300}><Reveal f={f} at={-2} d={R}>
      <Surface pad="14px"><FakePic w={872} lens={spot} lensOn={lensOn} uid="detail" /></Surface>
    </Reveal></Abs>
    <Abs y={890} style={{display: 'flex', gap: 18}}>
      {items.map((x) => {
        const on = rise(f, x.at - 2, 10);
        return <div key={x.t} style={{flex: 1, opacity: 0.35 + 0.65 * on}}>
          <Surface accent={on > 0.5 ? GOLD : undefined} pad="0" style={{height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Big size={52} w={800} c={on > 0.5 ? INK : DIM}>{x.t}</Big>
          </Surface>
        </div>;
      })}
    </Abs>
  </Stage>;
};
Detail.sfx = (cue) => {
  const p = detailPlan(cue);
  return [{at: p.a, kind: 'tick', gain: 0.08}, {at: p.b, kind: 'tick', gain: 0.08}, {at: p.c, kind: 'tick', gain: 0.08}];
};

/* ---------- 4 two: search for the source (crop → reverse image search → old / elsewhere) ---------- */

const searchPlan = (cue: Cue) => ({a: cue('a', 48), b: cue('b', 95), c: cue('c', 126), d: cue('d', 156)});
const Search: Scene = ({f, dur, cue}) => {
  const p = searchPlan(cue);
  const crop = rise(f, p.a - 4, 12), fly = ease.inOutCubic(clamp((f - p.a - 12) / 18));
  const results = [{chip: '旧图', note: '以前就发过', at: p.c}, {chip: '别处', note: '拍的是别的地方', at: p.d}];
  return <Stage f={f} dur={dur} beats={[p.a, p.b, p.c, p.d]}>
    <Pool x={450} y={560} o={0.12} />
    <Abs y={0}><Headline f={f} at={-12} no={2} total={3} lines={['搜来源']} size={104} /></Abs>
    {/* the picture, with a crop frame drawn on it */}
    <Abs x={0} y={300} w={420}><Reveal f={f} at={-2} d={R}>
      <div style={{position: 'relative', opacity: 1 - 0.5 * fly}}>
        <FakePic w={420} uid="search" />
        <div style={{position: 'absolute', inset: -8, border: `4px dashed ${GOLD}`, borderRadius: 14, opacity: crop, transform: `scale(${1.1 - 0.1 * crop})`}} />
      </div>
    </Reveal></Abs>
    {/* the search box: generic, no engine name or logo */}
    <Abs x={0} y={600}><Reveal f={f} at={p.a - 6} d={R}>
      <div style={{height: 120, borderRadius: 60, background: 'rgba(255,255,255,0.92)', display: 'flex', alignItems: 'center', gap: 22, padding: '0 34px'}}>
        <svg width={56} height={56} viewBox="0 0 56 56"><circle cx={24} cy={24} r={16} fill="none" stroke={cinema.bg} strokeWidth={6} /><path d="M36 36 L50 50" stroke={cinema.bg} strokeWidth={7} strokeLinecap="round" /></svg>
        <Big size={52} w={800} c={cinema.bg}>以图搜图</Big>
        <div style={{marginLeft: 'auto', width: 136, height: 85, borderRadius: 12, overflow: 'hidden', opacity: fly, transform: `scale(${0.6 + 0.4 * fly})`}}>
          <FakePic w={136} badge={false} uid="thumb" />
        </div>
      </div>
    </Reveal></Abs>
    {/* the flight from picture to box */}
    {fly > 0 && fly < 1 && <Abs x={60 + 650 * fly} y={330 + 290 * fly} w={300} style={{transform: `scale(${1 - 0.55 * fly})`, transformOrigin: '0 0', opacity: 0.9}}>
      <FakePic w={300} badge={false} uid="fly" />
    </Abs>}
    <Abs x={460} y={330} w={440}><Reveal f={f} at={p.b - 4} d={R} dy={14}>
      <Small c={DIM}>看最早出处</Small>
      <Big size={60} w={800} style={{marginTop: 6}}>第一次是谁发的？</Big>
    </Reveal></Abs>
    <Abs y={760} style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      {results.map((r) => <Reveal key={r.chip} f={f} at={r.at - 4} d={R} dy={30}>
        <Surface accent={GOLD} pad="0 34px" style={{height: 130, display: 'flex', alignItems: 'center', gap: 26}}>
          <div style={{background: GOLD, color: cinema.bg, fontFamily: display, fontWeight: 900, fontSize: 52, borderRadius: 14, padding: '6px 22px'}}>{r.chip}</div>
          <Big size={48} w={700} c={DIM} style={{fontFamily: font}}>{r.note}</Big>
        </Surface>
      </Reveal>)}
    </Abs>
  </Stage>;
};
Search.sfx = (cue) => {
  const p = searchPlan(cue);
  return [{at: p.a, kind: 'tick', gain: 0.07}, {at: p.a + 14, kind: 'whoosh-short', gain: 0.07}, {at: p.c, kind: 'tap', gain: 0.08}, {at: p.d, kind: 'tap', gain: 0.08}];
};

/* ---------- 5 three: check the official bulletin ---------- */

const offPlan = (cue: Cue) => ({a: cue('a', 50), b: cue('b', 71), c: cue('c', 89), d: cue('d', 111), e: cue('e', 155), f: cue('f', 182)});
const Official: Scene = ({f, dur, cue}) => {
  const p = offPlan(cue);
  const facts = [{k: '震级', v: '7.0级 · 震源深度10千米', at: p.a}, {k: '位置', v: '北纬32.40 东经93.79', at: p.b}, {k: '灾情', v: '只认权威通报', at: p.c}];
  const orgs = [{t: '中国地震台网', at: p.d}, {t: '应急管理部', at: p.e}, {t: '新华社', at: p.f}];
  return <Stage f={f} dur={dur} beats={[p.a, p.d, p.f]}>
    <Pool x={450} y={560} o={0.12} />
    <Abs y={0}><Headline f={f} at={-12} no={3} total={3} lines={['对官方']} size={104} /></Abs>
    <Abs y={300}><Reveal f={f} at={-2} d={R}>
      <Surface pad="26px 40px">
        <Small c={FAINT}>官方测定示例 · 10月22日 22:33</Small>
        {facts.map((x) => <div key={x.k} style={{display: 'flex', alignItems: 'baseline', gap: 28, height: 92, marginTop: 6, opacity: 0.3 + 0.7 * rise(f, x.at - 2, 10)}}>
          <Big size={48} w={800} c={DIM} style={{fontFamily: font, width: 110}}>{x.k}</Big>
          <Big size={x.k === '灾情' ? 56 : 52} w={800} c={x.k === '灾情' ? GOLD : INK}>{x.v}</Big>
        </div>)}
      </Surface>
    </Reveal></Abs>
    <Abs y={720}><Reveal f={f} at={p.d - 8} d={R} dy={12}><Small c={DIM}>只认这些地方发的</Small></Reveal></Abs>
    <Abs y={790} style={{display: 'flex', gap: 16}}>
      {orgs.map((o) => <Reveal key={o.t} f={f} at={o.at - 4} d={R} dy={30} style={{flex: 1}}>
        <Surface accent={GOLD} pad="0" style={{height: 170, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Big size={o.t.length > 5 ? 44 : 50} w={800}>{o.t}</Big>
        </Surface>
      </Reveal>)}
    </Abs>
  </Stage>;
};
Official.sfx = (cue) => {
  const p = offPlan(cue);
  return [{at: p.a, kind: 'tick', gain: 0.06}, {at: p.b, kind: 'tick', gain: 0.06}, {at: p.c, kind: 'tick', gain: 0.06},
    {at: p.d, kind: 'tap', gain: 0.07}, {at: p.e, kind: 'tap', gain: 0.07}, {at: p.f, kind: 'tap', gain: 0.07}];
};

/* ---------- 6 end: unsure? don't share ---------- */

const endPlan = (cue: Cue) => ({a: cue('a', 49), b: cue('b', 71)});
const ShareIcon: React.FC<{c: string}> = ({c}) => (
  <svg width={56} height={56} viewBox="0 0 56 56"><path d="M8 44 C 12 26 24 18 38 18 L38 8 L52 24 L38 40 L38 30 C 26 30 16 34 8 44 Z" fill={c} /></svg>
);
const End: Scene = ({f, dur, cue}) => {
  const p = endPlan(cue);
  const hold = rise(f, p.a, 16);
  return <Stage f={f} dur={dur} beats={[p.a]}>
    <Pool x={450} y={560} o={0.1 + 0.06 * hold} />
    <Abs y={0} style={{textAlign: 'center'}}><Headline f={f} at={-12} lines={['拿不准，就不转']} size={112} align="center" /></Abs>
    <Abs x={150} y={220} w={600}><Reveal f={f} at={-4} d={R}>
      <Surface pad="20px 20px 10px">
        <FakePic w={560} uid="end" />
        <div style={{display: 'flex', alignItems: 'center', gap: 18, height: 96, padding: '0 10px'}}>
          <div style={{width: 160, height: 16, borderRadius: 8, background: 'rgba(255,255,255,0.18)'}} />
          <div style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12, opacity: 1 - 0.7 * hold}}>
            <ShareIcon c={hold > 0.5 ? FAINT : INK} /><Big size={44} w={800} c={hold > 0.5 ? FAINT : INK} style={{fontFamily: font}}>转发</Big>
          </div>
        </div>
      </Surface>
    </Reveal></Abs>
    <Abs y={760} style={{textAlign: 'center'}}><Reveal f={f} at={p.a - 2} d={R} dy={14}><Big size={64} w={800}>{gold('不转发')}</Big></Reveal></Abs>
    <Abs y={860} style={{textAlign: 'center'}}><Reveal f={f} at={p.b - 2} d={R} dy={14}><Small c={DIM} size={44}>就是最简单的帮忙</Small></Reveal></Abs>
  </Stage>;
};
End.sfx = (cue) => [{at: endPlan(cue).a, kind: 'chime', gain: 0.07}];

/* ---------- cover anchor (880 × 800): the picture under the lens ---------- */

const Cover: Scene = () => <div style={{position: 'relative', width: 880, height: 800}}>
  <Pool x={440} y={420} o={0.22} />
  <Abs x={40} y={140} w={800}><Surface pad="14px"><FakePic w={772} lens={SPOT.hand} lensOn={1} uid="cover" /></Surface></Abs>
</div>;

export const tibetQuakeAiRumorScenes: Record<string, Scene> = {
  'tqr.hook': Hook,
  'tqr.feed': Feed,
  'tqr.detail': Detail,
  'tqr.search': Search,
  'tqr.official': Official,
  'tqr.end': End,
  'tqr.cover': Cover,
};
