import React from 'react';
import {Img, staticFile} from 'remotion';
import {clamp, ease} from '../../fx';
import {font} from '../theme';
import {cond, hand, plex} from '../fonts';
import {Scene} from '../paper';

// nrta-ai-duanju-regulate, made on the template lemo/archive-lighttable (docs/video-craft/prompt-library/vendor/lemomo-ai__lemo-opuscar/
// b5e8ef9/styles/archive-lighttable/STYLE.md): real objects on a backlit table, a loupe that lands on one line, the line lights,
// a reading card quotes it, the table becomes the index. Here the "archive" is five real web pages (cropped screenshots from the
// input pack: inputs/nrta-ai-duanju-regulate/assets/img), laid out in date order along a ruler.
// The story is the review's own rule: "扶持真人剧，规范AI剧" is five separate records, not one new ban. Each claim goes back to
// the record that says it; the last move searches all five for "禁止" and finds nothing (checked on the full texts, assets/text).
// Storyboard: tutorials/nrta-ai-duanju-regulate.storyboard.md.

const TABLE = '#EEF2F5', DESK = '#131518', INK = '#15171A', GREY = '#6B737C', SIG = '#CB2026', PLATE = 'rgba(14,15,17,0.8)';
const I = (n: string) => staticFile(`images/nrta-ai-duanju-regulate/${n}`);
const eio = (t: number) => ease.inOutCubic(clamp(t));
const eo = (f: number, a: number, d = 10) => ease.outCubic(clamp((f - a) / d));
const make = (draw: NonNullable<Scene['backdrop']>, sfx?: Scene['sfx']): Scene => {
  const S: Scene = () => null;
  S.backdrop = draw; S.sfx = sfx;
  return S;
};

/* ---------- the table: five records in date order, a ruler, one photograph ---------- */

type K = 'D' | 'E' | 'A' | 'B' | 'C';
type Doc = {src: string; w: number; h: number; x: number; y: number; r: number; tag: string; who: string};
const TW = 2800, TH = 4900, RX = 560;
const DOCS: Record<K, Doc> = {
  D: {src: 'doc-D.png', w: 1086, h: 678, x: 1430, y: 650, r: -1.2, tag: 'D · 2026-09-04', who: '新华社 · 管理提示'},
  E: {src: 'doc-E.png', w: 677, h: 380, x: 1280, y: 1350, r: 1.6, tag: 'E · 2026-09-30', who: '澎湃 · 9-28 调度会'},
  A: {src: 'doc-A.png', w: 1110, h: 1058, x: 1430, y: 2200, r: -0.7, tag: 'A · 2026-11-05', who: '新华社 · 负责人讲话'},
  B: {src: 'doc-B.png', w: 1256, h: 326, x: 1470, y: 3000, r: 0.9, tag: 'B · 2026-11-05', who: '总局官网 · 论坛'},
  C: {src: 'doc-C.png', w: 1192, h: 668, x: 1430, y: 3700, r: -1, tag: 'C · 2026-11-06', who: '总局官网 · 专项治理'},
};
/** A pixel of a record → table coordinates (the record is rotated about its centre). */
const dp = (k: K, px: number, py: number) => {
  const d = DOCS[k], a = (d.r * Math.PI) / 180, u = px - d.w / 2, v = py - d.h / 2;
  return {x: d.x + u * Math.cos(a) - v * Math.sin(a), y: d.y + u * Math.sin(a) + v * Math.cos(a)};
};
type Rect = [number, number, number, number];
const ROWS = {
  a1: [[310, 230, 522, 264]] as Rect[],                       // 扶持真人剧，规范AI剧
  a2: [[32, 705, 892, 739]] as Rect[],                        // 规范AI剧，不是不发展，而是要稳量提质
  a3: [[32, 798, 892, 832]] as Rect[],                        // 坚决落实“凡播必审、全量人审”
  a4: [[32, 834, 892, 868], [32, 870, 140, 904]] as Rect[],   // 未经授权使用肖像声音……加大打击力度
  d1: [[28, 230, 888, 264], [28, 266, 460, 300]] as Rect[],   // 使用账号上传的微短剧……严格执行凡播必审制度
  d2: [[28, 542, 888, 576], [28, 578, 145, 612]] as Rect[],   // 鼓励探索边播出、边审核的模式
  e1: [[28, 32, 645, 118]] as Rect[],                         // 持续支持真人微短剧，引导AI剧健康规范发展
  c1: [[150, 273, 1040, 303], [150, 303, 180, 333]] as Rect[],// 为期两个月，自11月1日起至12月底
  c2: [[150, 333, 1040, 363]] as Rect[],                      // 儿童类不良、软色情擦边
  c3: [[150, 363, 1040, 393]] as Rect[],                      // “盗脸”“偷声”
  c4: [[150, 393, 1040, 423], [150, 423, 265, 453]] as Rect[],// 更换片名或主角姓名……反复播出
  c5: [[150, 483, 1040, 513]] as Rect[],                      // 累计下架违规微短剧7.5万部，处置违规账号1500余个
};
type Lit = Partial<Record<K, {rows: Rect[]; p: number}>>;
/** Ruler ticks: table y, label. Dates are where the records lie, not a linear scale. */
const TICKS: [number, string][] = [[250, '2026-01'], [650, '09-04'], [1350, '09-28'], [1800, '11-01'], [2200, '11-05'], [3000, '11-05'], [3700, '11-06'], [4150, '12月底']];

type Cam = {x: number; y: number; z: number};
const SY = 880;
const at = (k: K, px: number, py: number, z: number): Cam => ({...dp(k, px, py), z});
/** Camera through keys [frame, cam]: smooth in-out between neighbours, held outside. */
const track = (keys: [number, Cam][], f: number): Cam => {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, c1] = keys[i], [t0, c0] = keys[i - 1];
    if (f <= t1) {
      const e = eio((f - t0) / Math.max(1, t1 - t0));
      // zoom in log space so a pull-back reads at constant speed
      return {x: c0.x + (c1.x - c0.x) * e, y: c0.y + (c1.y - c0.y) * e, z: Math.exp(Math.log(c0.z) + (Math.log(c1.z) - Math.log(c0.z)) * e)};
    }
  }
  return keys[keys.length - 1][1];
};
const w2s = (c: Cam, x: number, y: number) => ({x: 540 + (x - c.x) * c.z, y: SY + (y - c.y) * c.z});

const Record: React.FC<{k: K; lit?: {rows: Rect[]; p: number}; z: number; tags: number}> = ({k, lit, z, tags}) => {
  const d = DOCS[k];
  const p = lit ? clamp(lit.p) : 0;
  return <div style={{position: 'absolute', left: d.x - d.w / 2, top: d.y - d.h / 2, width: d.w, height: d.h, transform: `rotate(${d.r}deg)`,
    boxShadow: '0 0 0 1px rgba(20,24,28,0.12), 0 3px 10px rgba(20,24,28,0.16), 0 0 60px rgba(255,255,255,0.9)'}}>
    <Img src={I(d.src)} style={{width: d.w, height: d.h, display: 'block'}} />
    {lit && <svg width={d.w} height={d.h} style={{position: 'absolute', left: 0, top: 0}}>
      <defs><mask id={`m-${k}`}><rect width={d.w} height={d.h} fill="#fff" />{lit.rows.map(([x0, y0, x1, y1], i) => <rect key={i} x={x0 - 6} y={y0} width={x1 - x0 + 12} height={y1 - y0} fill="#000" />)}</mask></defs>
      <rect width={d.w} height={d.h} fill="#EEF2F5" opacity={0.66 * p} mask={`url(#m-${k})`} />
      {lit.rows.map(([x0, , x1, y1], i) => {
        const q = clamp(p * lit.rows.length - i);
        return <line key={i} x1={x0} y1={y1 - 1} x2={x0 + (x1 - x0) * q} y2={y1 - 1} stroke={SIG} strokeWidth={3} />;
      })}
    </svg>}
    {tags > 0 && <div style={{position: 'absolute', left: 0, top: -12 / z - 40 / z, display: 'flex', alignItems: 'center', gap: 10 / z, opacity: clamp(tags),
      whiteSpace: 'nowrap', transform: `translateY(${(1 - clamp(tags)) * 10 / z}px)`}}>
      <span style={{width: 14 / z, height: 14 / z, borderRadius: '50%', background: SIG, boxShadow: `0 0 0 ${4 / z}px rgba(203,32,38,0.25)`}} />
      <span style={{fontFamily: plex, fontSize: 26 / z, color: INK, fontWeight: 600}}>{d.tag}</span>
      <span style={{fontFamily: font, fontSize: 24 / z, color: GREY, fontWeight: 700}}>{d.who}</span>
    </div>}
  </div>;
};

/** The world: desk, the backlit table, ruler, photograph, records. `cam` puts table point (x, y) at screen (ox, oy). */
const World: React.FC<{cam: Cam; ox?: number; oy?: number; lit?: Lit; tags?: number; ruler?: number; extra?: (z: number) => React.ReactNode}> = ({cam, ox = 540, oy = SY, lit = {}, tags = 0, ruler = 0.5, extra}) => {
  const z = cam.z;
  return <div style={{position: 'absolute', left: 0, top: 0, width: TW, height: TH, transformOrigin: '0 0', transform: `translate(${ox - cam.x * z}px, ${oy - cam.y * z}px) scale(${z})`}}>
    <div style={{position: 'absolute', left: -30, top: -30, width: TW + 60, height: TH + 60, background: 'linear-gradient(135deg, #C9CFD5, #9EA6AE 50%, #C3C9CF)', borderRadius: 10}} />
    <div style={{position: 'absolute', left: 0, top: 0, width: TW, height: TH, background: `radial-gradient(ellipse 70% 55% at 50% 45%, #FBFCFD 0%, ${TABLE} 60%, #DDE3E8 100%)`}} />
    <svg width={TW} height={TH} style={{position: 'absolute', left: 0, top: 0}}>
      <line x1={RX} y1={TICKS[0][0]} x2={RX} y2={TICKS[0][0] + (TICKS[TICKS.length - 1][0] - TICKS[0][0]) * clamp(ruler * 2)} stroke={INK} strokeOpacity={0.5} strokeWidth={Math.max(2, 2 / z)} />
      {TICKS.map(([y, l], i) => clamp(ruler * 2) * (TICKS.length - 1) < i ? null : <g key={i}>
        <line x1={RX - 18 / z} y1={y} x2={RX + 18 / z} y2={y} stroke={INK} strokeWidth={Math.max(2, 2.5 / z)} />
        <text x={RX - 30 / z} y={y + 9 / z} textAnchor="end" fontFamily={plex} fontSize={26 / z} fill={INK} opacity={0.75}>{l}</text>
      </g>)}
    </svg>
    <div style={{position: 'absolute', left: 2140, top: 2720, width: 560, height: 374, transform: 'rotate(2deg)', boxShadow: '0 3px 10px rgba(20,24,28,0.2)', border: '10px solid #fff', boxSizing: 'content-box'}}>
      <Img src={I('forum.jpg')} style={{width: 560, height: 374, display: 'block'}} />
      <div style={{position: 'absolute', left: 0, top: 394, fontFamily: font, fontSize: 22 / z, color: GREY, whiteSpace: 'nowrap', fontWeight: 700, opacity: clamp(tags)}}>论坛现场（人物已模糊）· 总局官网</div>
    </div>
    {(Object.keys(DOCS) as K[]).map((k) => <Record key={k} k={k} lit={lit[k]} z={z} tags={tags} />)}
    {extra?.(z)}
  </div>;
};

/** The loupe: lands on table point (wx, wy) and shows it magnified ×m inside a black ring. */
const Loupe: React.FC<{cam: Cam; wx: number; wy: number; land: number; lit?: Lit; m?: number; R?: number; extra?: (z: number) => React.ReactNode}> = ({cam, wx, wy, land, lit, m = 1.7, R = 200, extra}) => {
  if (land <= 0) return null;
  const s = w2s(cam, wx, wy), k = 1 + 0.35 * (1 - land);
  return <div style={{position: 'absolute', left: s.x - R, top: s.y - R, width: 2 * R, height: 2 * R, transform: `scale(${k})`, opacity: clamp(land * 1.4)}}>
    <div style={{position: 'absolute', left: 26 * (1 + (1 - land) * 3), top: 34 * (1 + (1 - land) * 3), width: 2 * R, height: 2 * R, borderRadius: '50%', background: 'rgba(10,12,14,0.28)', filter: 'blur(16px)'}} />
    <div style={{position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden', background: TABLE}}>
      <div style={{position: 'absolute', left: -(s.x - R), top: -(s.y - R), width: 1080, height: 1920}}>
        <World cam={{x: wx, y: wy, z: cam.z * m}} ox={s.x} oy={s.y} lit={lit} extra={extra} />
      </div>
      <div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.22), rgba(255,255,255,0) 45%), radial-gradient(circle, rgba(0,0,0,0) 78%, rgba(0,0,0,0.18) 100%)'}} />
    </div>
    <div style={{position: 'absolute', inset: -16, borderRadius: '50%', border: '16px solid #0E0F11', boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.35), 0 0 0 2px rgba(255,255,255,0.12)'}} />
  </div>;
};

/** A reading card, fixed on screen: a small label, the record's own words, the source. Wipes in from the left. */
const Reading: React.FC<{f: number; at: number; label: string; text: string; src?: string; y?: number; size?: number; out?: number}> = ({f, at, label, text, src, y = 170, size = 58, out}) => {
  if (f < at || (out !== undefined && f >= out + 8)) return null;
  const p = eo(f, at, 9), q = out === undefined ? 1 : 1 - eo(f, out, 8);
  return <div style={{position: 'absolute', left: 64, top: y, width: 952, opacity: q, clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`}}>
    <div style={{background: PLATE, borderLeft: `6px solid ${SIG}`, padding: '18px 28px 20px'}}>
      <div style={{fontFamily: plex, fontSize: 26, color: '#AEB6BE', letterSpacing: 1}}>{label}</div>
      <div style={{fontFamily: font, fontWeight: 900, fontSize: size, lineHeight: 1.25, color: '#F4F6F8', marginTop: 8}}>{text}</div>
      {src && <div style={{fontFamily: plex, fontSize: 24, color: '#8D959D', marginTop: 10}}>{src}</div>}
    </div>
  </div>;
};
/** A chip with the signal edge: a verdict or a lifted word. */
const Chip: React.FC<{f: number; at: number; text: string; x: number; y: number; size?: number; strong?: boolean}> = ({f, at, text, x, y, size = 50, strong}) => {
  if (f < at) return null;
  const p = eo(f, at, 8);
  return <div style={{position: 'absolute', left: x, top: y + (1 - p) * 26, opacity: p, background: strong ? SIG : PLATE, color: '#F4F6F8', padding: '10px 22px', fontFamily: font, fontWeight: 900, fontSize: size,
    borderTop: strong ? 'none' : `3px solid ${SIG}`, whiteSpace: 'nowrap', boxShadow: '0 8px 20px rgba(10,12,14,0.25)'}}>{text}</div>;
};
/** The misreading, on a torn slip laid over the table. */
const Rumor: React.FC<{f: number; at: number; x?: number; y?: number; text?: string; strike?: number; size?: number}> = ({f, at, x = 120, y = 1060, text = 'AI短剧要被禁了？', strike = 0, size = 80}) => {
  if (f < at) return null;
  const p = eo(f, at, 7);
  return <div style={{position: 'absolute', left: x, top: y - (1 - p) * 60, transform: `rotate(${-3 + (1 - p) * 6}deg) scale(${1 + (1 - p) * 0.2})`, opacity: p,
    background: '#FFFFFF', padding: '22px 40px 26px', boxShadow: '0 14px 30px rgba(10,12,14,0.28)', clipPath: 'polygon(0 4%, 6% 0, 30% 5%, 55% 0, 80% 4%, 100% 0, 98% 50%, 100% 96%, 70% 100%, 45% 95%, 20% 100%, 0 96%, 2% 50%)'}}>
    <div style={{fontFamily: hand, fontSize: size, color: INK, whiteSpace: 'nowrap', position: 'relative'}}>
      {text}
      {strike > 0 && <div style={{position: 'absolute', left: -10, top: '52%', height: 8, width: `calc(${clamp(strike) * 100}% + 20px)`, background: SIG, transform: 'rotate(-2deg)'}} />}
    </div>
  </div>;
};
const Dark: React.FC<{p: number}> = ({p}) => p <= 0 ? null : <div style={{position: 'absolute', inset: 0, background: DESK, opacity: 0.72 * clamp(p)}} />;
const Grain: React.FC<{f: number}> = ({f}) => <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none', mixBlendMode: 'multiply'}}>
  <filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={1} seed={f % 30} /><feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.07 0" /></filter>
  <rect width={1080} height={1920} filter="url(#g)" />
</svg>;
const Stage: React.FC<{f: number; children: React.ReactNode}> = ({f, children}) => <div style={{position: 'absolute', inset: 0, background: DESK, overflow: 'hidden'}}>
  {children}
  <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 85% 70% at 50% 45%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.22) 100%)', pointerEvents: 'none'}} />
  <Grain f={f} />
</div>;

/* ---------- cameras, shared by neighbouring scenes so the table never jumps ---------- */

const C_HOOK0 = at('A', 470, 300, 1.16), C_HOOK1 = at('A', 470, 330, 1.26);
const C_QUOTE = at('A', 470, 700, 1.22);
const C_ALL: Cam = {x: 1450, y: 2200, z: 0.33};
const C_D = at('D', 470, 330, 1.2), C_D2 = at('D', 470, 470, 1.2);
const C_E = at('E', 340, 200, 1.4), C_SPAN: Cam = {x: 1150, y: 1760, z: 0.5};
const C_A3 = at('A', 470, 760, 1.2);
const C_C = at('C', 600, 300, 0.95), C_C2 = at('C', 600, 420, 1.05), C_C3 = at('C', 520, 520, 1.1);
const C_END = at('A', 470, 820, 1.3);

/* ---------- 1 hook: the line everyone quotes, and how it was read ---------- */

const Hook = make(({f, cue}) => {
  const b = cue('b', 123);
  const cam = track([[0, C_HOOK0], [170, C_HOOK1]], f);
  const L = dp('A', 418, 247), lit: Lit = {A: {rows: ROWS.a1, p: 1}};
  return <Stage f={f}>
    <World cam={cam} lit={lit} tags={1} />
    <Loupe cam={cam} wx={L.x} wy={L.y} land={1} lit={lit} />
    <Reading f={f} at={-99} label="A · 新华社 · 2026-11-05 21:43" text="「扶持真人剧，规范AI剧」" src="总局相关负责人在京重申（新华社报道）" size={68} />
    <Rumor f={f} at={b - 3} x={300} y={1080} />
  </Stage>;
}, (cue) => [{at: 0, kind: 'tap', gain: 0.08}, {at: cue('b', 123) - 3, kind: 'fs-paper-slide', gain: 0.1}]);

/* ---------- 2 quote: the second half of the sentence ---------- */

const Quote = make(({f, cue}) => {
  const a = cue('a', 40), b = cue('b', 92);
  const cam = track([[0, C_HOOK1], [24, C_QUOTE]], f);
  const L0 = dp('A', 418, 247), L1 = dp('A', 470, 722);
  const mv = eio((f - 6) / 18), wx = L0.x + (L1.x - L0.x) * mv, wy = L0.y + (L1.y - L0.y) * mv;
  const land = f < 6 ? 1 - eo(f, 0, 6) * 0.3 : f < 24 ? 0.7 : 0.7 + 0.3 * eo(f, 24, 6);
  const lit: Lit = {A: {rows: ROWS.a2, p: eo(f, a, 16)}};
  return <Stage f={f}>
    <World cam={cam} lit={lit} tags={1} />
    <Loupe cam={cam} wx={wx} wy={wy} land={land} lit={lit} />
    <Rumor f={f} at={-99} x={300} y={1080} strike={eo(f, b + 8, 10)} />
    <Reading f={f} at={a} label="A · 同一篇 · 第五段" text={f < b ? '「规范AI剧，不是不发展，」' : '「规范AI剧，不是不发展，而是要稳量提质」'} src="……必须把握好AI的边界，版权底线、伦理底线必须守住" size={60} />
  </Stage>;
}, (cue) => [{at: 6, kind: 'whoosh-short', gain: 0.05}, {at: 26, kind: 'tap', gain: 0.09}, {at: cue('a', 40), kind: 'fs-paper-slide', gain: 0.06}, {at: cue('b', 92) + 8, kind: 'tick', gain: 0.1}]);

/* ---------- 3 table: pull back, the five records and their dates ---------- */

const Table = make(({f}) => {
  const cam = track([[0, C_QUOTE], [42, C_ALL]], f);
  return <Stage f={f}>
    <World cam={cam} tags={eo(f, 26, 14)} ruler={eo(f, 20, 30)} lit={{A: {rows: ROWS.a2, p: 1 - eo(f, 0, 14)}}} />
  </Stage>;
}, () => [{at: 0, kind: 'whoosh-short', gain: 0.06}, ...[0, 1, 2, 3, 4].map((i) => ({at: 28 + i * 4, kind: 'tick', gain: 0.06}))]);

/* ---------- 4 sep: 9-04, the management note — user uploads, and "边播边审" ---------- */

const Sep = make(({f, cue}) => {
  const a = cue('a', 50), b = cue('b', 115);
  const cam = track([[0, C_ALL], [26, C_D], [b - 4, C_D], [b + 14, C_D2]], f);
  const L1 = dp('D', 470, 265), L2 = dp('D', 470, 577);
  const mv = eio((f - b + 4) / 14), wx = L1.x + (L2.x - L1.x) * mv, wy = L1.y + (L2.y - L1.y) * mv;
  const lit: Lit = {D: {rows: f < b ? ROWS.d1 : ROWS.d2, p: f < b ? eo(f, a, 16) : eo(f, b + 6, 14)}};
  return <Stage f={f}>
    <World cam={cam} lit={lit} tags={1} ruler={1} />
    <Loupe cam={cam} wx={wx} wy={wy} land={eo(f, a - 12, 12)} lit={lit} />
    <Reading f={f} at={a} out={b - 2} label="D · 新华社 · 2026-09-04 · 网络视听司管理提示" text="用户用账号上传的微短剧：平台「严格执行凡播必审制度」" src="对象：机构或个人用户上传的剧" size={54} />
    <Reading f={f} at={b + 4} label="D · 同一篇 · 最后一段" text="「鼓励探索边播出、边审核的模式」" src="前提：确保传播合规、内容合格" size={58} />
  </Stage>;
}, (cue) => [{at: 0, kind: 'whoosh-short', gain: 0.06}, {at: cue('a', 50) - 2, kind: 'tap', gain: 0.09}, {at: cue('b', 115) + 4, kind: 'fs-paper-slide', gain: 0.06}]);

/* ---------- 5 sept: 9-28 meeting said it already; the bracket to November ---------- */

const Sept = make(({f, cue}) => {
  const a = cue('a', 45), b = cue('b', 122);
  const cam = track([[0, C_D2], [24, C_E], [b - 6, C_E], [b + 16, C_SPAN]], f);
  const L = dp('E', 330, 75);
  const lit: Lit = {E: {rows: ROWS.e1, p: eo(f, a, 16)}};
  const span = eo(f, b + 10, 16);
  const bracket = (z: number) => span <= 0 ? null : <svg width={TW} height={TH} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
    <path d={`M ${RX + 30 / z} 1350 C ${RX + 150 / z} 1350, ${RX + 150 / z} 2200, ${RX + 30 / z} 2200`} fill="none" stroke={SIG} strokeWidth={6 / z} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - span} />
    <polygon points={`${RX + 30 / z},2200 ${RX + 64 / z},${2200 - 22 / z} ${RX + 60 / z},${2200 + 22 / z}`} fill={SIG} opacity={span >= 1 ? 1 : 0} />
  </svg>;
  return <Stage f={f}>
    <World cam={cam} lit={lit} tags={1} ruler={1} extra={bracket} />
    <Loupe cam={cam} wx={L.x} wy={L.y} land={eo(f, a - 10, 12) * (1 - eo(f, b - 6, 10))} lit={lit} />
    <Reading f={f} at={a} out={b + 4} label="E · 澎湃 · 2026-09-30 · 9-28 第三次调度会" text="「持续支持真人剧，引导AI剧健康规范发展」" size={58} />
    <Chip f={f} at={b + 20} text="11 月是重申，不是首提" x={340} y={1170} strong />
  </Stage>;
}, (cue) => [{at: 0, kind: 'whoosh-short', gain: 0.05}, {at: cue('a', 45) - 2, kind: 'tap', gain: 0.09}, {at: cue('b', 122) + 10, kind: 'fs-paper-slide', gain: 0.06}, {at: cue('b', 122) + 20, kind: 'tick', gain: 0.1}]);

/* ---------- 6 nov5: the speech's demand, held next to the September note ---------- */

const Nov5 = make(({f, cue}) => {
  const a = cue('a', 35), b = cue('b', 113);
  const cam = track([[0, C_SPAN], [26, C_A3]], f);
  const L = dp('A', 470, 815);
  const lit: Lit = {A: {rows: ROWS.a3, p: eo(f, a, 16)}};
  return <Stage f={f}>
    <World cam={cam} lit={lit} tags={1} ruler={1} />
    <Loupe cam={cam} wx={L.x} wy={L.y} land={eo(f, a - 10, 12)} lit={lit} />
    <Reading f={f} at={a} label="A · 11-05 · 总局相关负责人讲话（未具名）" text="各平台「坚决落实“凡播必审、全量人审”」" src="对象：各平台 · 环节：上线关口" size={54} />
    <Reading f={f} at={b - 8} label="D · 09-04 · 管理提示" text="「严格执行凡播必审制度」" src="对象：用户账号上传的剧" y={500} size={46} />
    <Chip f={f} at={b + 6} text="讲话要求" x={64} y={1120} strong />
    <Chip f={f} at={b + 14} text="≠ 新文件" x={330} y={1120} />
  </Stage>;
}, (cue) => [{at: 0, kind: 'whoosh-short', gain: 0.05}, {at: cue('a', 35) - 2, kind: 'tap', gain: 0.09}, {at: cue('b', 113) - 8, kind: 'fs-paper-slide', gain: 0.06}, {at: cue('b', 113) + 6, kind: 'tick', gain: 0.1}]);

/* ---------- 7 nov6: the campaign, 11-01 → end of December ---------- */

const Nov6 = make(({f, cue}) => {
  const a = cue('a', 57), b = cue('b', 106);
  const cam = track([[0, C_A3], [34, C_C]], f);
  const L = dp('C', 860, 298);
  const lit: Lit = {C: {rows: ROWS.c1, p: eo(f, a, 16)}};
  return <Stage f={f}>
    <World cam={cam} lit={lit} tags={1} ruler={1} />
    <Loupe cam={cam} wx={L.x} wy={L.y} land={eo(f, a - 12, 12)} lit={lit} />
    <Reading f={f} at={a} label="C · 总局官网 · 2026-11-06 19:47" text="「为期两个月，自11月1日起至12月底」" src="微短剧低俗化同质化专项治理" size={58} />
    <Chip f={f} at={b} text="低俗化" x={64} y={1130} size={58} strong />
    <Chip f={f} at={b + 26} text="同质化" x={330} y={1130} size={58} strong />
  </Stage>;
}, (cue) => [{at: 2, kind: 'whoosh-short', gain: 0.06}, {at: cue('a', 57) - 2, kind: 'tap', gain: 0.09}, {at: cue('b', 106), kind: 'tick', gain: 0.1}, {at: cue('b', 106) + 26, kind: 'tick', gain: 0.1}]);

/* ---------- 8 targets: three lines light, three words lift ---------- */

const Targets = make(({f, cue}) => {
  const a = cue('a', 30), b = cue('b', 94);
  const cam = track([[0, C_C], [20, C_C2]], f);
  const P = [dp('C', 850, 378), dp('C', 700, 348), dp('C', 900, 408)], T = [0, a, b];
  const i = f < a ? 0 : f < b ? 1 : 2, mv = eio((f - T[i]) / 8), prev = P[Math.max(0, i - 1)];
  const wx = prev.x + (P[i].x - prev.x) * (i ? mv : 1), wy = prev.y + (P[i].y - prev.y) * (i ? mv : 1);
  const rows = [...ROWS.c3, ...(f >= a ? ROWS.c2 : []), ...(f >= b ? ROWS.c4 : [])];
  const lit: Lit = {C: {rows, p: 1}};
  return <Stage f={f}>
    <World cam={cam} lit={lit} tags={1} ruler={1} />
    <Loupe cam={cam} wx={wx} wy={wy} land={1} lit={lit} />
    <div style={{position: 'absolute', left: 64, top: 160, fontFamily: plex, fontSize: 26, color: '#AEB6BE', background: PLATE, padding: '8px 18px'}}>C · 治理对象（原文用词）</div>
    <Chip f={f} at={2} text="「盗脸」「偷声」" x={64} y={230} size={60} />
    <Chip f={f} at={a} text="软色情擦边 · 儿童类不良" x={64} y={340} size={54} />
    <Chip f={f} at={b} text="更换片名或主角姓名 · 反复播出" x={64} y={444} size={50} />
  </Stage>;
}, (cue) => [{at: 2, kind: 'tick', gain: 0.1}, {at: cue('a', 30), kind: 'tick', gain: 0.1}, {at: cue('b', 94), kind: 'tick', gain: 0.1}]);

/* ---------- 9 number: 7.5万 is this year's earlier total, not this round ---------- */

const Number_ = make(({f, cue}) => {
  const a = cue('a', 78), b = cue('b', 110);
  const cam = track([[0, C_C2], [16, C_C3], [a - 2, C_C3], [a + 22, C_ALL]], f);
  const L = dp('C', 430, 498);
  const lit: Lit = {C: {rows: ROWS.c5, p: eo(f, 10, 14)}};
  const n = Math.min(7.5, 7.5 * ease.outCubic(clamp((f - 14) / 34)));
  const br = eo(f, a + 6, 16), br2 = eo(f, b + 2, 14);
  const brackets = (z: number) => <svg width={TW} height={TH} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
    {br > 0 && <rect x={RX + 30 / z} y={250} width={24 / z} height={(1800 - 250) * br} fill={INK} opacity={0.55} />}
    {br2 > 0 && <rect x={RX + 30 / z} y={1800} width={24 / z} height={(4150 - 1800) * br2} fill={SIG} />}
  </svg>;
  return <Stage f={f}>
    <World cam={cam} lit={lit} tags={1} ruler={1} extra={brackets} />
    <Loupe cam={cam} wx={L.x} wy={L.y} land={eo(f, 4, 12) * (1 - eo(f, a - 4, 10))} lit={lit} />
    <div style={{position: 'absolute', left: 64, top: 170, background: PLATE, borderLeft: `6px solid ${SIG}`, padding: '14px 28px 18px', width: 896, opacity: 1 - eo(f, a + 30, 10)}}>
      <div style={{fontFamily: plex, fontSize: 26, color: '#AEB6BE'}}>C · 总局自报 · 今年以来累计</div>
      <div style={{fontFamily: cond, fontWeight: 800, fontSize: 150, color: '#F4F6F8', lineHeight: 1.05, whiteSpace: 'nowrap'}}>{n.toFixed(1)}<span style={{fontFamily: font, fontSize: 96}}>万部</span></div>
      <div style={{fontFamily: font, fontWeight: 800, fontSize: 40, color: '#C9D0D6'}}>违规微短剧下架 · 另处置违规账号1500余个</div>
    </div>
    <Chip f={f} at={a + 8} text="前期累计（今年以来）" x={340} y={500} size={46} />
    <Chip f={f} at={b + 4} text="本轮：11-01 → 12月底" x={340} y={1180} size={46} strong />
  </Stage>;
}, (cue) => [{at: 6, kind: 'tap', gain: 0.08}, ...Array.from({length: 10}, (_, i) => ({at: 14 + Math.round(34 * Math.cbrt(i / 10)), kind: 'tick', gain: 0.04})), {at: cue('a', 78), kind: 'whoosh-short', gain: 0.06}, {at: cue('b', 110) + 4, kind: 'tick', gain: 0.1}]);

/* ---------- 10 index: split the rumour; two pieces find their record, the third finds none ---------- */

const FRAGS: {t: string; to: K[]}[] = [{t: '凡播必审', to: ['D', 'A']}, {t: '全量人审', to: ['A']}, {t: '禁止AI剧', to: []}];
const Index = make(({f, cue}) => {
  const a = cue('a', 34), b = cue('b', 105);
  const cam = C_ALL;
  const scan = clamp((f - b) / 22);                 // a search band sweeps the whole table for "禁止"
  const band = (z: number) => scan <= 0 || scan >= 1 ? null : <div style={{position: 'absolute', left: 0, top: 200 + scan * (TH - 400) - 90, width: TW, height: 180,
    background: 'linear-gradient(180deg, rgba(203,32,38,0), rgba(203,32,38,0.22) 50%, rgba(203,32,38,0))', borderTop: `${3 / z}px solid rgba(203,32,38,0.5)`}} />;
  const fx = [96, 380, 664], fy = 250;
  return <Stage f={f}>
    <World cam={cam} tags={1} ruler={1} extra={band} lit={{D: {rows: ROWS.d1, p: eo(f, a + 10, 10)}, A: {rows: ROWS.a3, p: eo(f, a + 10, 10)}}} />
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      {FRAGS.flatMap((fr, i) => fr.to.map((k) => {
        const d = DOCS[k], s = w2s(cam, d.x - d.w / 2 + 40, d.y), p = eo(f, a + i * 6, 14);
        const x0 = fx[i] + 130, y0 = fy + 120;
        return p <= 0 ? null : <g key={i + k}>
          <path d={`M${x0},${y0} C${x0},${y0 + 200} ${s.x - 160},${s.y} ${s.x},${s.y}`} fill="none" stroke={SIG} strokeWidth={4} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
          {p >= 1 && <circle cx={s.x} cy={s.y} r={12} fill={SIG} />}
        </g>;
      }))}
    </svg>
    <div style={{position: 'absolute', left: 64, top: 160, fontFamily: plex, fontSize: 26, color: '#AEB6BE', background: PLATE, padding: '8px 18px'}}>把说法拆开 → 逐条找出处</div>
    {FRAGS.map((fr, i) => {
      const hit = fr.to.length > 0, done = hit ? eo(f, a + i * 6 + 14, 6) : eo(f, b + 24, 8);
      return <div key={i} style={{position: 'absolute', left: fx[i], top: fy, width: 260, opacity: eo(f, i * 3, 8)}}>
        <div style={{background: '#fff', padding: '16px 0', textAlign: 'center', fontFamily: hand, fontSize: 54, color: INK, boxShadow: '0 10px 24px rgba(10,12,14,0.3)', transform: `rotate(${(i - 1) * 2}deg)`, position: 'relative'}}>
          {fr.t}
          {!hit && done > 0 && <div style={{position: 'absolute', left: 10, right: 10, top: '50%', height: 7, background: SIG, transform: `scaleX(${done}) rotate(-3deg)`, transformOrigin: '0 50%'}} />}
        </div>
        <div style={{marginTop: 14, textAlign: 'center', fontFamily: plex, fontSize: 30, fontWeight: 600, color: hit ? '#F4F6F8' : '#fff', background: hit ? PLATE : SIG, padding: '6px 0', opacity: done}}>
          {hit ? `出处 ${fr.to.join(' · ')}` : '0 处'}
        </div>
      </div>;
    })}
    <Chip f={f} at={b + 34} text="五份原文里，没有一处写“禁止”" x={110} y={1180} size={50} strong />
  </Stage>;
}, (cue) => [{at: cue('a', 34) + 14, kind: 'tick', gain: 0.1}, {at: cue('a', 34) + 20, kind: 'tick', gain: 0.1}, {at: cue('b', 105), kind: 'whoosh-short', gain: 0.07}, {at: cue('b', 105) + 24, kind: 'tap', gain: 0.12}]);

/* ---------- 11 end: the one line a maker can act on today; the table goes dark around it ---------- */

const End = make(({f, cue}) => {
  const a = cue('a', 70);
  const cam = track([[0, C_ALL], [30, C_END]], f);
  const L = dp('A', 470, 868);
  const lit: Lit = {A: {rows: ROWS.a4, p: eo(f, 26, 14)}};
  const dark = eo(f, a + 10, 18);
  return <Stage f={f}>
    <World cam={cam} lit={lit} tags={1 - dark} ruler={1} />
    <Dark p={dark} />
    <Loupe cam={cam} wx={L.x} wy={L.y} land={eo(f, 20, 12)} lit={lit} />
    <Reading f={f} at={a} label="A · 新华社 · 2026-11-05" text="「未经授权使用肖像声音等侵权行为」将持续加大打击力度" size={52} />
    <Chip f={f} at={a + 30} text="用到真人的脸和声音 → 先拿授权" x={64} y={1150} size={50} strong />
  </Stage>;
}, (cue) => [{at: 0, kind: 'whoosh-short', gain: 0.05}, {at: 24, kind: 'tap', gain: 0.09}, {at: cue('a', 70), kind: 'fs-paper-slide', gain: 0.06}]);

/* ---------- cover anchor: the loupe on the second half of the sentence, the misreading struck ---------- */

const Cover = make(({f}) => {
  const cam = at('A', 470, 640, 1.15), L = dp('A', 470, 722), lit: Lit = {A: {rows: ROWS.a2, p: 1}};
  return <Stage f={f}>
    <World cam={cam} lit={lit} tags={1} />
    <Loupe cam={cam} wx={L.x} wy={L.y} land={1} lit={lit} />
    <Rumor f={f} at={-99} x={150} y={1120} strike={1} />
  </Stage>;
});

export const NRTA_SCENES: Record<string, Scene> = {
  'nrta.hook': Hook, 'nrta.quote': Quote, 'nrta.table': Table, 'nrta.sep': Sep, 'nrta.sept': Sept, 'nrta.nov5': Nov5,
  'nrta.nov6': Nov6, 'nrta.targets': Targets, 'nrta.number': Number_, 'nrta.index': Index, 'nrta.end': End, 'nrta.cover': Cover,
};
