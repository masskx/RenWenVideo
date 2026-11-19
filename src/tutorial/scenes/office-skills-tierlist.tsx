import React from 'react';
import {Img, staticFile} from 'remotion';
import {clamp, ease} from '../../fx';
import {font} from '../theme';
import {cond, jet} from '../fonts';
import {Scene} from '../paper';
import {BEAT, Banner, Bean, Burst, CREAM, Card, Dots, INK, Judge, Rays, Shelf, Stripes, TIERS, Telop, drop, hit, hop, pop, punch, rowFeet, rowTop, typed} from '../gameshow';

// office-skills-tierlist, made on the template lemo/game-show (docs/video-craft/prompt-library/vendor/lemomo-ai__lemo-opuscar/
// 3961ddb/styles/game-show/STYLE.md): flat vector, ink outlines, hard shadows, bean contestants, judgement words, all on a
// 120 BPM grid (BEAT = 15 frames). 9:16: the stage is a five-row tier shelf (the post's own tier colours), y 330–1330; the
// telop caption plate sits under it (look.captions "telop"). Inputs: inputs/office-skills-tierlist/ (idea.md).
// Personal information (user, 2026-11-19): no handle, name or avatar of the post's author, no GitHub owner usernames — only
// project names (and companies). The ranking is the author's own ("原帖 · 纯主观"); star counts as of 2026-11-17 per the post.

const NAVY = '#26264A', NAVY2 = '#2F2F5C';
const T = Object.fromEntries(TIERS.map((t) => [t.id, t.color])) as Record<string, string>;
const OFFICIAL = '#D97757';
const IMG = (n: string) => staticFile(`images/office-skills-tierlist/${n}`);

const make = (draw: NonNullable<Scene['backdrop']>, sfx?: Scene['sfx']): Scene => {
  const S: Scene = () => null;
  S.backdrop = draw; S.sfx = sfx;
  return S;
};
/** Stage wrapper: the set, a frame punch on the given hits, and the small source line. */
const Stage: React.FC<{f: number; set: React.ReactNode; hits?: number[]; src?: boolean; children: React.ReactNode}> = ({f, set, hits = [], src = true, children}) => (
  <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: NAVY}}>
    {set}
    <div style={{position: 'absolute', inset: 0, transform: `scale(${punch(f, hits)})`, transformOrigin: '50% 45%'}}>{children}</div>
    {src && <div style={{position: 'absolute', left: 44, top: 1342, fontFamily: font, fontWeight: 700, fontSize: 26, color: 'rgba(255,255,255,0.78)'}}>原帖 · 纯主观排名 · 星数截至 2026-11-17</div>}
  </div>
);
/** A name label on a shelf row, right of the bean. */
const RowLabel: React.FC<{x: number; row: number; text: string; sub?: string; f?: number; at?: number}> = ({x, row, text, sub, f = 99, at = -99}) => {
  if (f < at) return null;
  const p = pop(f, at, 6);
  return <div style={{position: 'absolute', left: x, top: rowTop(row) + (sub ? 44 : 62), transform: `scale(${p})`, transformOrigin: '0 50%'}}>
    <div style={{fontFamily: font, fontWeight: 900, fontSize: 40, color: INK, whiteSpace: 'nowrap', lineHeight: 1.2}}>{text}</div>
    {sub && <div style={{fontFamily: font, fontWeight: 700, fontSize: 30, color: '#4A4F5C', whiteSpace: 'nowrap', marginTop: 4}}>{sub}</div>}
  </div>;
};

/* ---------- 1 hook: 0★ in 顶级, 848★ falls through to 拉完了 ---------- */

const HOOK_FALL = 14;
/** Feet y of the falling 848★ bean: hovers above the shelf, then falls (ease-in) to the 拉完了 row, landing at a + 12. */
const fallY = (f: number, a: number) => {
  const y0 = 318, y1 = rowFeet(4) + 8, land = a + 12;
  if (f < land - HOOK_FALL) return y0 + hop(f, 10);
  return f >= land ? y1 : y0 + (y1 - y0) * ease.inCubic(clamp(1 - (land - f) / HOOK_FALL));
};
const Hook = make(({f, cue}) => {
  const a = cue('a', 42), land = a + 12;
  const y848 = fallY(f, a);
  const falling = f >= land - HOOK_FALL && f < land;
  // row-top crossings while falling: a plop each (sfx below uses the same formula)
  return <Stage f={f} set={<Dots f={f} a={NAVY} dot="rgba(255,255,255,0.07)" />} hits={[0, land]}>
    <Banner f={f} at={-10} tag="办公 SKILL · 39 个" title="从夯到拉" color={T.top} />
    <Shelf f={f} />
    {/* 0★ — call-notes-to-actions, already in 顶级 */}
    <Bean x={330} y={rowFeet(1) + 8 + hop(f, 14)} scale={0.78} color="#8ED1FC" mark={{kind: 'ball', color: '#FFD23F'}} squash={hit(f, 0) * 0.8} mouth={f % 30 < 12} arms={f < 20 ? 'up' : 'down'}
      score="0★" scoreSize={46} />
    <RowLabel x={440} row={1} text="call-notes-to-actions" sub="会议纪要 · <100 行" />
    <Judge f={f} at={-10} text="顶级！" x={690} y={rowTop(1) - 34} size={100} fill={T.top} rot={-7} />
    {/* 848★ — claude-office-skills, falls through the rows */}
    <Bean x={falling || f >= land ? 330 : 690} y={y848} scale={0.78} color="#FF8FB1" mark={{kind: 'ball', color: '#8ED1FC'}} squash={hit(f, land)} mouth={f < land + 20} arms={f < land ? 'up' : 'down'}
      score="848★" scoreSize={46} scoreColor="#fff" rot={f < land ? Math.sin(f / 3) * 6 : 0} />
    {falling && <div style={{position: 'absolute', left: 300, top: y848 - 260, width: 60, height: 120, borderLeft: `6px solid ${INK}`, borderRight: `6px solid ${INK}`, opacity: 0.5}} />}
    <Burst f={f} at={land} x={330} y={rowFeet(4) - 40} r={80} color="#C3CAD9" />
    <RowLabel x={440} row={4} text="claude-office-skills" sub="Word · 848★" f={f} at={land + 3} />
    <Judge f={f} at={land + 2} text="拉完了！" x={690} y={rowTop(4) - 30} size={100} fill="#C3CAD9" rot={6} />
  </Stage>;
}, (cue) => {
  const a = cue('a', 42), land = a + 12;
  const cross = [1, 2, 3].map((i) => land - Math.round(HOOK_FALL * (1 - Math.sqrt((rowTop(i) - 318) / (rowFeet(4) - 318)))));
  return [{at: 0, kind: 'pop', gain: 0.08}, {at: 2, kind: 'stamp', gain: 0.07}, ...cross.map((at) => ({at, kind: 'tick', gain: 0.06})), {at: land, kind: 'thud', gain: 0.1}, {at: land + 2, kind: 'stamp', gain: 0.08}];
});

/* ---------- shared bits for the rounds ---------- */

const CANDY = ['#FFD23F', '#FF8C42', '#FF8FB1', '#5BD68A', '#C6F16D', '#8ED1FC', '#4D7CFE', '#B07CE8', '#FFB870', '#3FB8AF'];
/** Deterministic pseudo-random in 0…1 for index i (crowds must not change between renders). */
const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const Floor: React.FC<{y?: number; color: string}> = ({y = 1240, color}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: y, height: 1920 - y, background: color, borderTop: `8px solid ${INK}`}} />
);
/** A cream sticker with black-weight text (labels, tags, verdict chips). */
const Sticker: React.FC<{f: number; at: number; x: number; y: number; text: string; size?: number; fill?: string; color?: string; rot?: number; w?: number}> = ({f, at, x, y, text, size = 40, fill = CREAM, color = INK, rot = 0, w}) => {
  if (f < at) return null;
  const ww = w ?? Math.ceil([...text].reduce((s, ch) => s + ((ch.codePointAt(0) ?? 0) < 128 ? 0.6 : 1), 0) * size + 44);
  return <Card x={x} y={y} w={ww} h={size * 1.7} fill={fill} r={16} sh={8} ow={6} rot={rot} scale={pop(f, at, 6)}>
    <div style={{textAlign: 'center', fontFamily: font, fontWeight: 900, fontSize: size, color, lineHeight: `${size * 1.7 - 12}px`, whiteSpace: 'nowrap'}}>{text}</div>
  </Card>;
};

/* ---------- 2 intro: 39 contestants, ten categories, five tiers ---------- */

const CATS = ['PPT', 'Word', 'Excel', 'PDF', '会议', '邮件', '待办', '简历', '翻译', '视觉'];
const Intro = make(({f, cue}) => {
  const a = cue('a', 44), b = cue('b', 75);
  const n = Math.min(39, Math.max(0, Math.floor(f * 39 / Math.max(10, a - 6))));
  const crowdUp = ease.inOutCubic(clamp((f - b) / 10));
  return <Stage f={f} set={<Dots f={f} a={NAVY} dot="rgba(255,255,255,0.07)" />} hits={[a, b]}>
    {/* the counter */}
    {f < b + 4 && <div style={{position: 'absolute', left: 0, right: 0, top: 120, display: 'flex', justifyContent: 'center', opacity: 1 - crowdUp}}>
      <div style={{transform: `scale(${1 + 0.08 * hit(f, a - 6)})`}}><Telop text={`${n}`} size={260} fill="#FFD23F" family={cond} weight={800} anchor="middle" sw={36} /></div>
    </div>}
    {f < b + 4 && <div style={{position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', fontFamily: font, fontWeight: 900, fontSize: 44, color: '#fff', opacity: 1 - crowdUp}}>个办公 skill · 原帖候选</div>}
    {/* ten category cards, two rows of five */}
    {f >= a && f < b + 4 && CATS.map((c, i) => <Sticker key={c} f={f} at={a + i * 1.5} x={56 + (i % 5) * 172} y={580 + Math.floor(i / 5) * 120} w={156} text={c} size={c.length > 3 ? 40 : 38}
      fill={i < 4 ? ['#C8431F', '#185ABD', '#107C41', '#A4262C'][i] : '#6B4FBB'} color="#fff" rot={((i * 37) % 7) - 3} />)}
    {/* the tier shelf slams in at b, a row per half beat */}
    {f >= b && <Shelf f={f} pops={[b, b + 4, b + 8, b + 12, b + 16]} />}
    {/* the crowd: 39 beans dropping one per frame-ish, then they scatter into the rows */}
    {Array.from({length: 39}, (_, i) => {
      const at = Math.round(i * (a - 6) / 39);
      if (f < at) return null;
      const col = i % 8, row = Math.floor(i / 8);
      let x = 90 + col * 118 + (row % 2) * 40, y = 1010 + row * 62 + drop(f, at, 6, 700);
      if (f >= b) {
        const tier = Math.floor(rnd(i) * 5), slot = (i * 7) % 6;
        const tx = 300 + slot * 110, ty = rowFeet(tier) + 4;
        x = x + (tx - x) * crowdUp; y = y + (ty - y) * crowdUp;
      }
      return <Bean key={i} x={x} y={y + hop(f, 6, rnd(i))} scale={0.3 + 0.08 * crowdUp} color={CANDY[i % CANDY.length]} mark={{kind: 'ball', color: CANDY[(i + 3) % CANDY.length]}} squash={hit(f, at) * 0.6} />;
    })}
  </Stage>;
}, (cue) => [...Array.from({length: 10}, (_, i) => ({at: Math.round(i * (cue('a', 44) - 6) / 10), kind: 'pop', gain: 0.04})),
  ...Array.from({length: 10}, (_, i) => ({at: cue('a', 44) + Math.round(i * 1.5), kind: 'tick', gain: 0.035})),
  ...[0, 4, 8, 12, 16].map((d) => ({at: cue('b', 75) + d, kind: 'block', gain: 0.06}))]);

/* ---------- 3 ppt: a wall of contestants that doesn't end ---------- */

const Ppt = make(({f, cue, dur}) => {
  const a = cue('a', 30);
  const scroll = f * 7;
  return <Stage f={f} set={<Stripes f={f} a="#C8431F" b="#D45530" />} hits={[a]}>
    {Array.from({length: 8 * 14}, (_, i) => {
      const col = i % 7, row = Math.floor(i / 7);
      const y = 1500 + row * 120 - scroll;
      if (y < 200 || y > 1700) return null;
      return <Bean key={i} x={96 + col * 128 + (row % 2) * 30} y={y + hop(f, 5, rnd(i))} scale={0.33} color={CANDY[(i * 3) % CANDY.length]} mark={{kind: 'badge', text: 'P', color: '#C8431F'}} />;
    })}
    <Banner f={f} at={-10} tag="ROUND 1" title="PPT" color={T.top} />
    {f >= a && <div style={{position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', justifyContent: 'center', transform: `scale(${pop(f, a, 7)})`}}>
      <Card x={-330} y={0} w={660} h={330} fill={INK} r={36} sh={14} style={{position: 'relative', left: 0}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 10, textAlign: 'center', fontFamily: cond, fontWeight: 800, fontSize: 210, color: '#FFD23F', lineHeight: 1}}>200+</div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 236, textAlign: 'center', fontFamily: font, fontWeight: 700, fontSize: 34, color: '#fff'}}>做 PPT 的 skill · 一个榜单就收了 227 个</div>
      </Card>
    </div>}
    {dur > 0 && null}
  </Stage>;
}, (cue) => [{at: 0, kind: 'whoosh-short', gain: 0.06}, {at: cue('a', 30), kind: 'stamp', gain: 0.09}]);

/* ---------- 5 word: 22 kinds of official documents, national-standard layout ---------- */

const Word = make(({f, cue}) => {
  const a = cue('a', 44), b = cue('b', 79), win = b + 34;
  const fanN = Math.min(22, Math.max(0, Math.floor((f - a) / 1.2)));
  const card = pop(f, b, 8);
  return <Stage f={f} set={<Stripes f={f} a="#185ABD" b="#2466C8" />} hits={[a, b, win]}>
    <Floor color="#0F3C82" />
    <Banner f={f} at={-10} tag="ROUND 2 · Word" title="公文写作" color="#4D7CFE" />
    {/* the fan of 22 documents */}
    {f >= a && f < b + 10 && Array.from({length: fanN}, (_, i) => {
      const ang = -50 + (i / 21) * 100;
      return <div key={i} style={{position: 'absolute', left: 470, top: 420, width: 150, height: 210, transformOrigin: '50% 140%', transform: `rotate(${ang}deg)`, background: '#fff', border: `5px solid ${INK}`, borderRadius: 10,
        boxShadow: `6px 6px 0 ${INK}`, opacity: f >= b ? 1 - (f - b) / 10 : 1}}>
        <div style={{height: 10, margin: '16px 14px 0', background: '#E5494D', borderRadius: 3}} />
        {[38, 58, 78, 98].map((y) => <div key={y} style={{position: 'absolute', left: 14, right: 14, top: y, height: 7, background: '#C9CCD6', borderRadius: 3}} />)}
      </div>;
    })}
    {f >= a && f < b + 6 && <div style={{position: 'absolute', left: 0, right: 0, top: 860, display: 'flex', justifyContent: 'center'}}>
      <Telop text={`${fanN} 种`} size={150} fill="#FFD23F" anchor="middle" sw={30} />
    </div>}
    {/* the repo's own before/after, stamped */}
    {f >= b && <Card x={50} y={320 + (1 - card) * 500} w={980} h={610} fill="#fff" r={26} sh={14} rot={-1.5 * card} scale={0.6 + 0.4 * card}>
      <Img src={IMG('gongwen-before-after.jpg')} style={{position: 'absolute', left: 0, top: 0, width: 964, height: 563, objectFit: 'cover'}} />
      <div style={{position: 'absolute', right: 12, bottom: 10, background: 'rgba(17,24,32,0.82)', color: '#fff', fontFamily: font, fontWeight: 700, fontSize: 24, padding: '2px 10px', borderRadius: 6}}>仓库官方效果图｜案例展示</div>
    </Card>}
    {f >= b + 14 && <div style={{position: 'absolute', left: 520, top: 880, transform: `rotate(-9deg) scale(${pop(f, b + 14, 6)})`, border: `8px solid #E5494D`, color: '#E5494D', background: 'rgba(255,255,255,0.92)',
      fontFamily: cond, fontWeight: 800, fontSize: 80, padding: '0 20px', borderRadius: 16, lineHeight: 1.15}}>GB/T 9704</div>}
    <Bean x={190} y={1250 + hop(f, 16)} scale={0.95} color="#FFB870" mark={{kind: 'badge', text: '公', color: '#E5494D'}} squash={hit(f, a) * 0.6 + hit(f, b + 14)} mouth={f >= a && f < a + 10 || f >= win}
      arms={f >= win ? 'up' : 'hold'} score="883★" scoreSize={40} tag="公文写作 skill" tagSize={36} />
    <Judge f={f} at={win} text="夯爆了！" x={640} y={1140} size={118} fill="#FFD23F" rot={-6} />
    <Burst f={f} at={win} x={640} y={1140} r={110} />
  </Stage>;
}, (cue) => [...Array.from({length: 8}, (_, i) => ({at: cue('a', 44) + i * 3, kind: 'paper', gain: 0.03})), {at: cue('b', 79), kind: 'whoosh-short', gain: 0.06},
  {at: cue('b', 79) + 14, kind: 'stamp', gain: 0.1}, {at: cue('b', 79) + 34, kind: 'pop', gain: 0.08}]);

/* ---------- 6 excel: live formulas only; formula errors hammered to 0 ---------- */

const SHEET: [string, string, string, string][] = [
  ['项目', '数量', '单价', '金额'],
  ['A', '12', '35', '=B2*C2'],
  ['B', '8', '120', '=B3*C3'],
  ['C', '30', '9', '=B4*C4'],
  ['D', '5', '260', '=B5*C5'],
  ['合计', '', '', '=SUM(D2:D5)'],
];
const Excel = make(({f, cue}) => {
  const a = cue('a', 47), win = a + 26;
  const errs = f < a ? 3 : f < a + 8 ? 3 - Math.floor((f - a) / 3) : 0;
  return <Stage f={f} set={<Stripes f={f} a="#107C41" b="#1A8A4C" />} hits={[a + 8, win]}>
    <Floor color="#0A5A2E" />
    <Banner f={f} at={-10} tag="ROUND 3 · Excel" title="官方 xlsx" color="#5BD68A" />
    <Card x={50} y={320} w={980} h={560} fill="#fff" r={24} sh={14}>
      {SHEET.map((r, i) => r.map((c, j) => {
        const isF = c.startsWith('=');
        const lit = isF && f >= 4 + (i - 1) * 7;
        const w = [180, 170, 170, 444][j], x = [0, 180, 350, 520][j];
        return <div key={`${i}-${j}`} style={{position: 'absolute', left: x, top: i * 90, width: w, height: 90, boxSizing: 'border-box', borderRight: j < 3 ? '3px solid #C9CCD6' : undefined, borderBottom: '3px solid #C9CCD6',
          background: i === 0 ? '#107C41' : lit ? 'rgba(91,214,138,0.28)' : i === 5 ? '#F2F4F0' : '#fff', display: 'flex', alignItems: 'center', justifyContent: j === 0 ? 'center' : 'flex-end', paddingRight: 20,
          fontFamily: isF ? jet : font, fontWeight: isF ? 400 : 900, fontSize: isF ? 40 : 42, color: i === 0 ? '#fff' : lit ? '#0A5A2E' : INK}}>{isF && !lit ? '' : c}</div>;
      }))}
    </Card>
    {/* the error counter, hammered to 0 */}
    <Card x={400} y={950} w={600} h={190} fill={INK} r={30} sh={12}>
      <div style={{position: 'absolute', left: 30, top: 24, fontFamily: font, fontWeight: 900, fontSize: 40, color: '#fff'}}>公式错误</div>
      <div style={{position: 'absolute', right: 40, top: 0, fontFamily: cond, fontWeight: 800, fontSize: 170, lineHeight: 1.1, color: errs === 0 ? '#5BD68A' : '#E5494D', transform: `scale(${1 + 0.2 * hit(f, a + 8)})`}}>{errs}</div>
      <div style={{position: 'absolute', left: 30, top: 96, fontFamily: font, fontWeight: 700, fontSize: 30, color: '#C9CCE0'}}>还会自己校验</div>
    </Card>
    <Bean x={190} y={1250 + hop(f, 14)} scale={0.95} color={OFFICIAL} mark={{kind: 'badge', text: 'X', color: '#107C41'}} squash={hit(f, a + 8)} mouth={f >= win} arms={f >= a && f < a + 10 ? 'up' : f >= win ? 'up' : 'down'} tag="官方 xlsx" tagSize={36} />
    <Judge f={f} at={win} text="夯爆了！" x={700} y={1250} size={110} fill="#FFD23F" rot={-6} />
  </Stage>;
}, (cue) => [...[0, 1, 2, 3, 4].map((i) => ({at: 4 + i * 7, kind: 'tick', gain: 0.05})), {at: cue('a', 47) + 8, kind: 'thud', gain: 0.1}, {at: cue('a', 47) + 26, kind: 'pop', gain: 0.08}]);

/* ---------- 7 meet: the same official contestant tops two categories ---------- */

const Meet = make(({f, cue}) => {
  const a = cue('a', 31), jump = a + 14;
  const p = clamp((f - a) / 14);
  const bx = 285 + (795 - 285) * ease.inOutCubic(p), by = 1060 - Math.sin(p * Math.PI) * 300;
  const note = clamp((f - jump - 10) / 12);
  const Panel: React.FC<{x: number; title: string; c: string}> = ({x, title, c}) => <Card x={x} y={380} w={470} h={760} fill={CREAM} r={30} sh={12}>
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 110, background: c, borderBottom: `6px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <Telop text={title} size={58} anchor="middle" sw={12} />
    </div>
    <div style={{position: 'absolute', left: 24, top: 140, background: T.hang, color: '#fff', fontFamily: font, fontWeight: 900, fontSize: 38, padding: '2px 18px 6px', borderRadius: 12, border: `5px solid ${INK}`}}>夯爆了</div>
  </Card>;
  return <Stage f={f} set={<Dots f={f} a="#6B4FBB" />} hits={[a, jump]}>
    <Panel x={40} title="会议纪要" c="#B07CE8" />
    <Panel x={560} title="日程待办" c="#3FB8AF" />
    <Bean x={f < a ? 285 : f < jump ? bx : 795} y={(f < a ? 1060 : f < jump ? by : 1060) + (f < a || f >= jump ? hop(f, 12) : 0)} scale={1} color={OFFICIAL} mark={{kind: 'star'}}
      squash={hit(f, jump)} mouth={f >= a && f < jump + 6} arms={f >= a && f < jump ? 'up' : 'down'} />
    {f >= jump + 8 && <Bean x={285} y={1060 + hop(f, 12, 0.5)} scale={1} color={OFFICIAL} mark={{kind: 'star'}} squash={hit(f, jump + 8)} />}
    {/* TASKS.md: meeting action items flow into the to-do list */}
    {f >= jump + 10 && <div style={{position: 'absolute', left: 150 + 560 * ease.inOutCubic(note), top: 560 - Math.sin(note * Math.PI) * 120, transform: `rotate(${-6 + 12 * note}deg)`}}>
      <Card x={0} y={0} w={240} h={150} fill="#FFD23F" r={10} sh={8} ow={6}>
        <div style={{position: 'absolute', left: 16, top: 12, fontFamily: jet, fontSize: 32, color: INK, fontWeight: 700}}>TASKS.md</div>
        {[64, 92, 120].map((y) => <div key={y} style={{position: 'absolute', left: 16, top: y, fontFamily: font, fontWeight: 900, fontSize: 22, color: INK}}>☐ ——————</div>)}
      </Card>
    </div>}
    <div style={{position: 'absolute', left: 40, top: 1180, width: 1000, textAlign: 'center'}}>
      <span style={{background: INK, color: '#fff', fontFamily: font, fontWeight: 900, fontSize: 40, padding: '6px 24px 10px', borderRadius: 999, border: '4px solid #fff'}}>knowledge-work-plugins · 36,273★</span>
    </div>
    <Banner f={f} at={-10} tag="ROUND 4–5" title="会议 · 待办" color="#B07CE8" />
  </Stage>;
}, (cue) => [{at: cue('a', 31), kind: 'whoosh-short', gain: 0.06}, {at: cue('a', 31) + 14, kind: 'pop', gain: 0.09}, {at: cue('a', 31) + 22, kind: 'paper', gain: 0.05}]);

/* ---------- 9 zero: under 100 lines of Markdown; notes in, three outputs out ---------- */

const OUTS = [{t: '决议', s: '会上定了什么', c: '#8ED1FC'}, {t: '行动项', s: '负责人 · 截止日', c: '#FFD23F'}, {t: '跟进邮件', s: '可以直接发', c: '#5BD68A'}];
const Zero = make(({f, cue}) => {
  const a = cue('a', 55), b = cue('b', 84), win = b + 3 * BEAT;
  const lines = Math.min(97, Math.floor(f * 97 / Math.max(20, a - 10)));
  const eat = clamp((f - a) / 10);
  return <Stage f={f} set={<Dots f={f} a="#2B8F88" />} hits={[a + 10, b, b + BEAT, b + 2 * BEAT, win]}>
    <Floor color="#1E6B66" />
    <Banner f={f} at={-10} tag="顶级 · 会议纪要" title="0★ 那个" color={T.top} />
    {/* the .md scroll with its line counter */}
    {f < b && <Card x={430} y={330} w={590} h={560} fill="#fff" r={20} sh={12}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 70, background: INK, color: '#fff', fontFamily: jet, fontSize: 30, lineHeight: '70px', paddingLeft: 22}}>call-notes-to-actions.md</div>
      {Array.from({length: 9}, (_, i) => <div key={i} style={{position: 'absolute', left: 20, top: 92 + i * 50, fontFamily: jet, fontSize: 30, color: '#9AA0AE', whiteSpace: 'nowrap'}}>
        {String(Math.max(1, lines - 8 + i)).padStart(2, ' ')}<span style={{display: 'inline-block', width: 300 - ((i * 53) % 160), height: 14, background: '#DDE1E8', borderRadius: 6, marginLeft: 22}} /></div>)}
    </Card>}
    {f < b && <div style={{position: 'absolute', left: 470, top: 910}}><Telop text={`${lines} 行`} size={110} fill="#FFD23F" sw={22} /></div>}
    {/* meeting notes (illustrative, no names) dropping into its mouth */}
    {f >= a - 12 && f < a + 10 && <div style={{position: 'absolute', left: 150 + 40 * eat, top: 500 + 520 * ease.inCubic(eat), transform: `scale(${1 - 0.7 * eat}) rotate(-6deg)`}}>
      <Card x={0} y={0} w={260} h={300} fill={CREAM} r={12} sh={8} ow={6}>
        <div style={{position: 'absolute', left: 18, top: 14, fontFamily: font, fontWeight: 900, fontSize: 30, color: INK}}>会议记录</div>
        {[64, 98, 132, 166, 200, 234].map((y, i) => <div key={y} style={{position: 'absolute', left: 18, top: y, width: 220 - (i % 3) * 40, height: 12, background: '#C9CCD6', borderRadius: 6}} />)}
      </Card>
    </div>}
    {/* three outputs on three beats */}
    {OUTS.map((o, i) => {
      const at = b + i * BEAT;
      if (f < at) return null;
      return <Card key={o.t} x={420} y={340 + i * 230} w={600} h={200} fill={o.c} r={24} sh={12} rot={[-2, 1.5, -1][i]} scale={pop(f, at, 7)}>
        <div style={{position: 'absolute', left: 30, top: 22, fontFamily: font, fontWeight: 900, fontSize: 60, color: INK}}>{o.t}</div>
        <div style={{position: 'absolute', left: 32, top: 112, fontFamily: font, fontWeight: 700, fontSize: 38, color: INK}}>{o.s}</div>
        <div style={{position: 'absolute', right: 24, top: 20, fontFamily: font, fontWeight: 700, fontSize: 24, color: INK, opacity: 0.6}}>示意</div>
      </Card>;
    })}
    <Bean x={210} y={1250 + hop(f, 14)} scale={1.05} color="#8ED1FC" mark={{kind: 'ball', color: '#FFD23F'}} squash={hit(f, a + 10) + hit(f, b) * 0.5} mouth={f >= a - 6 && f < a + 12 || f >= win}
      arms={f >= win ? 'up' : 'down'} score="0★" scoreSize={56} tag="call-notes-to-actions" tagSize={32} />
    <Judge f={f} at={win} text="顶级！" x={720} y={1130} size={110} fill={T.top} rot={-6} />
  </Stage>;
}, (cue) => [{at: 0, kind: 'clack', gain: 0.05}, {at: cue('a', 55) + 10, kind: 'pop', gain: 0.08}, ...[0, 1, 2].map((i) => ({at: cue('b', 84) + i * BEAT, kind: 'tick', gain: 0.07})),
  {at: cue('b', 84) + 3 * BEAT, kind: 'stamp', gain: 0.08}]);

/* ---------- 10 lazy: why the bottom row is the bottom row ---------- */

const Lazy = make(({f, cue}) => {
  const a = cue('a', 70), b = cue('b', 107), fall = b + 30;
  const slump = (at: number) => (f >= fall ? 'down' : f >= at ? 'up' : 'down') as 'down' | 'up';
  return <Stage f={f} set={<Stripes f={f} a="#5E6470" b="#686E7A" speed={0.25} />} hits={[12, 34, a, b, fall]}>
    <Floor y={1200} color="#3E434D" />
    <Banner f={f} at={-10} tag="拉完了 · 为什么" title="三种垫底" color="#787878" />
    {/* 1: 848★, stopped and unlicensed */}
    <Bean x={180} y={1210 + (f >= fall ? 0 : hop(f, 8))} scale={1.15} color="#FF8FB1" mark={{kind: 'ball', color: '#8ED1FC'}} squash={hit(f, 12) * 0.7 + hit(f, 34) * 0.7} blink={f >= fall} rot={f >= fall ? -10 : 0}
      score="848★" scoreSize={40} scoreColor="#fff" arms={slump(9999)} tag="claude-office-skills" tagSize={26} />
    <Sticker f={f} at={12} x={60} y={960} text="停更" size={48} fill="#C3CAD9" rot={-8} />
    <Sticker f={f} at={34} x={50} y={1060} text="无许可证" size={44} fill="#C3CAD9" rot={5} />
    {/* 2: a paid shell */}
    {f >= a && <Bean x={500} y={1210 + drop(f, a, 8, 900)} scale={1.15} color="#C3CAD9" shell mark={{kind: 'none'}} squash={hit(f, a)} rot={f >= fall ? 8 : 0} blink={f >= fall}
      score="3★" scoreSize={40} scoreColor="#fff" tag="SlideSpeak API 版" tagSize={26} />}
    <Sticker f={f} at={a + 6} x={380} y={1010} text="需付费订阅" size={42} fill="#FFD23F" rot={-4} />
    {/* 3: a report, but no table */}
    {f >= b && <Bean x={800} y={1210 + drop(f, b, 8, 900)} scale={1.15} color="#B07CE8" mark={{kind: 'ball', color: '#5BD68A'}} squash={hit(f, b)} rot={f >= fall ? -8 : 0} blink={f >= fall}
      score="486★" scoreSize={40} scoreColor="#fff" arms={slump(b)} tag="csv-data-summarizer" tagSize={26} />}
    {f >= b + 6 && <div style={{position: 'absolute', left: 660, top: 560, transform: `scale(${pop(f, b + 6, 6)})`, transformOrigin: '50% 100%'}}>
      <Card x={0} y={0} w={230} h={130} fill="#fff" r={14} sh={8} ow={6}><div style={{textAlign: 'center', fontFamily: font, fontWeight: 900, fontSize: 40, lineHeight: '118px', color: INK}}>报告 ✓</div></Card>
      <Card x={0} y={150} w={230} h={130} fill="transparent" r={14} sh={0} ow={6} style={{borderStyle: 'dashed'}}><div style={{textAlign: 'center', fontFamily: font, fontWeight: 900, fontSize: 40, lineHeight: '118px', color: '#E5494D'}}>新表 ✕</div></Card>
    </div>}
    <Judge f={f} at={fall} text="拉完了！" x={540} y={460} size={130} fill="#C3CAD9" rot={5} />
  </Stage>;
}, (cue) => [{at: 12, kind: 'stamp', gain: 0.07}, {at: 34, kind: 'stamp', gain: 0.07}, {at: cue('a', 70), kind: 'thud', gain: 0.08}, {at: cue('a', 70) + 6, kind: 'pop', gain: 0.06},
  {at: cue('b', 107), kind: 'thud', gain: 0.08}, {at: cue('b', 107) + 6, kind: 'pop', gain: 0.06}, {at: cue('b', 107) + 30, kind: 'block', gain: 0.08}]);

/* ---------- 11 rule (climax): the whole shelf, files held up ---------- */

type Who = {row: number; x: number; c: string; m: BeanMarkT; tag: string; file?: [string, string]};
type BeanMarkT = Parameters<typeof Bean>[0]['mark'];
const CAST: Who[] = [
  {row: 0, x: 330, c: '#FFD23F', m: {kind: 'badge', text: 'P', color: '#C8431F'}, tag: 'PPT Master', file: ['.pptx', '#C8431F']},
  {row: 0, x: 560, c: '#FFB870', m: {kind: 'badge', text: '公', color: '#E5494D'}, tag: '公文写作', file: ['.docx', '#185ABD']},
  {row: 0, x: 790, c: OFFICIAL, m: {kind: 'badge', text: 'X', color: '#107C41'}, tag: '官方 xlsx', file: ['.xlsx', '#107C41']},
  {row: 1, x: 330, c: '#8ED1FC', m: {kind: 'ball', color: '#FFD23F'}, tag: 'call-notes', file: ['.md', '#111820']},
  {row: 1, x: 560, c: '#5BD68A', m: {kind: 'ball', color: '#FF8FB1'}, tag: 'frontend-slides'},
  {row: 2, x: 330, c: '#4D7CFE', m: {kind: 'ball', color: '#FFD23F'}, tag: 'GenOffice'},
  {row: 2, x: 560, c: '#C6F16D', m: {kind: 'ball', color: '#B07CE8'}, tag: 'many-ppt-skills'},
  {row: 3, x: 330, c: '#3FB8AF', m: {kind: 'ball', color: '#FFD23F'}, tag: 'creator-skills'},
  {row: 4, x: 330, c: '#FF8FB1', m: {kind: 'ball', color: '#8ED1FC'}, tag: '848★'},
  {row: 4, x: 560, c: '#C3CAD9', m: {kind: 'none'}, tag: '3★'},
  {row: 4, x: 790, c: '#B07CE8', m: {kind: 'ball', color: '#5BD68A'}, tag: '486★'},
];
const Rule = make(({f, cue}) => {
  const a = cue('a', 49);
  const pull = ease.outCubic(clamp(f / 14));
  const beats = [0, 1, 2, 3].map((i) => a + i * BEAT);
  return <Stage f={f} set={f >= a ? <Rays f={f} a={NAVY} b={NAVY2} cy={rowTop(0)} /> : <Dots f={f} a={NAVY} dot="rgba(255,255,255,0.07)" />} hits={beats}>
    <div style={{position: 'absolute', inset: 0, transform: `scale(${1.25 - 0.25 * pull})`, transformOrigin: '50% 40%'}}>
      <Shelf f={f} dim={f >= a ? [1, 2, 3, 4] : []} />
      {CAST.map((w, i) => {
        const up = f >= a && w.row === 0;
        return <div key={i} style={{opacity: f >= a && w.row > 0 ? 0.55 : 1}}>
          <Bean x={w.x} y={rowFeet(w.row) + 8 + (f >= a && w.row === 0 ? hop(f, 26) : hop(f, 6, rnd(i)))} scale={0.62} color={w.c} mark={w.m} shell={w.tag === '3★'}
            squash={beats.reduce((s, t) => s + (w.row === 0 ? hit(f, t) * 0.6 : 0), 0)} mouth={up} arms={up ? 'up' : 'down'} blink={w.row === 4} />
          <div style={{position: 'absolute', left: w.x - 100, width: 200, top: rowFeet(w.row) - 10, textAlign: 'center', fontFamily: font, fontWeight: 900, fontSize: 24, color: INK, whiteSpace: 'nowrap'}}>{w.tag}</div>
          {w.file && f >= a && <div style={{position: 'absolute', left: w.x - 70, top: rowTop(w.row) - 70 + hop(f, 26), transform: `scale(${pop(f, a + (i % 3) * 3, 6)}) rotate(${[-6, 4, -3, 5][i % 4]}deg)`}}>
            <Card x={0} y={0} w={140} h={78} fill="#fff" r={12} sh={6} ow={5}><div style={{textAlign: 'center', fontFamily: jet, fontWeight: 700, fontSize: 32, color: w.file[1], lineHeight: '68px'}}>{w.file[0]}</div></Card>
          </div>}
        </div>;
      })}
    </div>
    <Judge f={f} at={a + BEAT} text="能直接用！" x={540} y={rowTop(2) + 60} size={140} fill="#FFD23F" rot={-6} />
    <Burst f={f} at={a + BEAT} x={540} y={rowTop(2) + 60} r={150} />
  </Stage>;
}, (cue) => [{at: 0, kind: 'whoosh', gain: 0.05}, {at: cue('a', 49), kind: 'pop', gain: 0.08}, {at: cue('a', 49) + BEAT, kind: 'stamp', gain: 0.1}, {at: cue('a', 49) + BEAT, kind: 'chime', gain: 0.06}]);

/* ---------- 4 pptmaster: swallow a doc, spit a native PPTX ---------- */

const PptMaster = make(({f, cue}) => {
  const a = cue('a', 40), b = cue('b', 70), win = b + 40;
  const docY = f < a ? -400 : a + 10 > f ? 260 + (900 - 260) * ease.inCubic(clamp((f - a) / 10)) : 2000;
  const card = pop(f, b, 8);
  const tags = ['原生形状', '切换动画', '数据图表'];
  return <Stage f={f} set={<Stripes f={f} a="#C8431F" b="#D45530" />} hits={[a + 10, b, win]}>
    <Banner f={f} tag="ROUND 1 · PPT" title="PPT Master" color={T.top} />
    {/* floor band */}
    <div style={{position: 'absolute', left: 0, right: 0, top: 1240, height: 120, background: '#8E2C12', borderTop: `8px solid ${INK}`}} />
    {/* the doc falling into its mouth */}
    {f >= a && f < a + 10 && <Card x={150} y={docY - 1000} w={150} h={190} fill="#fff" r={10} sh={8} ow={6} rot={-8}>
      <div style={{position: 'absolute', left: 16, top: 16, background: '#185ABD', color: '#fff', fontFamily: font, fontWeight: 900, fontSize: 26, padding: '0 8px', borderRadius: 6}}>.docx</div>
      {[70, 100, 130, 160].map((y) => <div key={y} style={{position: 'absolute', left: 16, right: 16, top: y, height: 8, background: '#C9CCD6', borderRadius: 4}} />)}
    </Card>}
    {/* the PPTX card it spits out: the repo's own example image */}
    {f >= b && <Card x={60} y={300 + (1 - card) * 300} w={950} h={600} fill="#1B1D2B" r={30} sh={14} rot={2 - 2 * card} scale={0.6 + 0.4 * card} origin="20% 100%">
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 64, background: '#C8431F', borderBottom: `6px solid ${INK}`, display: 'flex', alignItems: 'center', paddingLeft: 22, gap: 14}}>
        <span style={{background: '#fff', color: '#C8431F', fontFamily: font, fontWeight: 900, fontSize: 34, padding: '0 12px', borderRadius: 8}}>.pptx</span>
        <span style={{fontFamily: font, fontWeight: 900, fontSize: 30, color: '#fff'}}>原生 · 可编辑</span>
      </div>
      <Img src={IMG('pptmaster-breakfast.jpg')} style={{position: 'absolute', left: 0, top: 64, width: 934, height: 520, objectFit: 'cover'}} />
      <div style={{position: 'absolute', right: 14, bottom: 10, background: 'rgba(17,24,32,0.82)', color: '#fff', fontFamily: font, fontWeight: 700, fontSize: 24, padding: '2px 10px', borderRadius: 6}}>仓库官方效果图｜案例展示</div>
    </Card>}
    {tags.map((t, i) => {
      const at = b + 10 + i * BEAT;
      if (f < at) return null;
      return <Card key={t} x={330 + i * 200} y={940} w={186} h={78} fill={CREAM} r={18} sh={8} ow={6} rot={[-3, 2, -2][i]} scale={pop(f, at, 6)}>
        <div style={{textAlign: 'center', fontFamily: font, fontWeight: 900, fontSize: 38, color: INK, lineHeight: '66px'}}>{t}</div>
      </Card>;
    })}
    <Bean x={190} y={1250 + hop(f, 18)} scale={1.05} color="#FFD23F" mark={{kind: 'badge', text: 'P', color: '#C8431F'}} squash={hit(f, a + 10) + hit(f, b) * 0.6} mouth={f >= a - 4 && f < a + 14 || f >= b - 2 && f < b + 8}
      arms={f >= win ? 'up' : 'down'} score="77,509★" scoreSize={40} tag="PPT Master" tagSize={38} />
    <Judge f={f} at={win} text="夯爆了！" x={640} y={1150} size={124} fill="#FFD23F" rot={-6} />
    <Burst f={f} at={win} x={640} y={1150} r={120} />
  </Stage>;
}, (cue) => [{at: cue('a', 40) + 10, kind: 'pop', gain: 0.08}, {at: cue('b', 70), kind: 'whoosh-short', gain: 0.07},
  ...[0, 1, 2].map((i) => ({at: cue('b', 70) + 10 + i * BEAT, kind: 'tick', gain: 0.06})), {at: cue('b', 70) + 40, kind: 'stamp', gain: 0.09}]);

/* ---------- 8 twist: five official beans, one shared board (the signature) ---------- */

const OFF = [
  {tag: 'pptx', mark: 'P', c: '#C8431F'}, {tag: 'docx', mark: 'W', c: '#185ABD'}, {tag: 'xlsx', mark: 'X', c: '#107C41'},
  {tag: 'pdf', mark: 'PDF', c: '#A4262C'}, {tag: 'canvas', mark: '画', c: '#D7A520'},
];
const XS = [130, 295, 460, 625, 790];
const roll = (f: number, at: number, n: number) => Math.round(n * ease.outCubic(clamp((f - at) / 12)));
const Twist = make(({f, cue}) => {
  const a = cue('a', 40), b = cue('b', 80);
  const merge = ease.inOutCubic(clamp((f - b - 6) / 10));
  return <Stage f={f} set={<Stripes f={f} a={NAVY} b={NAVY2} speed={0.3} />} hits={[b, b + 16]}>
    <Banner f={f} tag="原帖提醒" title="先看清星数" color="#6F7F98" />
    <div style={{position: 'absolute', left: 0, right: 0, top: 1190, height: 170, background: '#1C1C3A', borderTop: `8px solid ${INK}`}} />
    {OFF.map((o, i) => {
      const at = a + i * 5;
      const n = roll(f, at, 195868);
      return <Bean key={o.tag} x={XS[i]} y={1200 + hop(f, 10, i % 2 ? 0.5 : 0)} scale={0.86} color={OFFICIAL} mark={{kind: 'badge', text: o.mark, color: o.c}}
        squash={hit(f, b) * 0.7} mouth={f >= b && f < b + 12} arms={f >= b && f < b + 20 ? 'up' : 'down'} look={-0.4 + i * 0.2}
        score={merge < 0.5 ? `${f < at ? 0 : n.toLocaleString('en-US')}★` : undefined} scoreSize={28} tag={o.tag} tagSize={30} />;
    })}
    {/* the ink frame binding the five boards, then the merged board */}
    {f >= b && merge < 1 && <div style={{position: 'absolute', left: 50, top: 880, width: 840, height: 92, border: `8px solid ${INK}`, borderRadius: 20, background: 'rgba(255,214,63,0.18)',
      transform: `scaleX(${pop(f, b, 6)})`, transformOrigin: '50% 50%'}} />}
    {merge > 0 && <Card x={130 + (1 - merge) * 80} y={470 + (1 - merge) * 420} w={680} h={340} fill={INK} r={34} sh={14} scale={0.4 + 0.6 * merge}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 28, textAlign: 'center', fontFamily: cond, fontWeight: 800, fontSize: 150, color: '#FFD23F', lineHeight: 1}}>195,868★</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 200, textAlign: 'center', fontFamily: jet, fontSize: 40, color: '#fff'}}>anthropics/skills</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 260, textAlign: 'center', fontFamily: font, fontWeight: 700, fontSize: 32, color: '#C9CCE0'}}>单个 skill 没有自己的星</div>
    </Card>}
    {f >= b && <div style={{position: 'absolute', left: 640, top: 420, transform: `rotate(12deg) scale(${pop(f, b, 6)})`}}>
      <Card x={0} y={0} w={240} h={130} fill={T.hang} r={20} sh={10}>
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Telop text="整仓" size={84} anchor="middle" sw={16} /></div>
      </Card>
    </div>}
    <Burst f={f} at={b} x={760} y={485} r={110} />
  </Stage>;
}, (cue) => [...OFF.map((_, i) => ({at: cue('a', 40) + i * 5, kind: 'tick', gain: 0.05})), {at: cue('b', 80), kind: 'stamp', gain: 0.1}, {at: cue('b', 80) + 6, kind: 'whoosh-short', gain: 0.06}]);

/* ---------- 12 end: the report card with the two install lines ---------- */

const ROWS: [string, string, string][] = [
  ['PPT', '#C8431F', 'PPT Master · 官方 pptx · guizang'],
  ['Word', '#185ABD', '官方 docx · 公文写作 skill'],
  ['Excel', '#107C41', '官方 xlsx · 三表财务模型'],
  ['PDF', '#A4262C', '官方 pdf'],
  ['会议 · 待办', '#6B4FBB', 'knowledge-work-plugins'],
];
const CMD = ['/plugin marketplace add', 'anthropics/skills', '/plugin install', 'document-skills@anthropic-agent-skills'];
const End = make(({f, cue}) => {
  const a = cue('a', 30);
  const up = ease.outBack(clamp(f / 10), 1.2);
  return <Stage f={f} set={<Rays f={f} a={NAVY} b={NAVY2} cy={700} />} hits={[0, a]} src={false}>
    <Card x={40} y={320 + (1 - up) * 900} w={1000} h={1020} fill={CREAM} r={36} sh={14}>
      <div style={{position: 'absolute', left: 44, top: 26}}><Telop text="办公 Skill 成绩单" size={70} fill={INK} stroke={CREAM} sw={2} /></div>
      <div style={{position: 'absolute', left: 50, top: 118, fontFamily: font, fontWeight: 700, fontSize: 26, color: '#6F7F98'}}>各类「夯爆了」· 原帖纯主观 · 星数截至 11-17</div>
      {ROWS.map(([cat, c, names], i) => {
        const at = 6 + i * 4;
        return <div key={cat} style={{position: 'absolute', left: 40, top: 172 + i * 78, display: 'flex', alignItems: 'center', gap: 18, transform: `scale(${pop(f, at, 5)})`, transformOrigin: '0 50%'}}>
          <span style={{width: 196, textAlign: 'center', background: c, color: '#fff', fontFamily: font, fontWeight: 900, fontSize: 34, padding: '2px 0 4px', borderRadius: 14, border: `5px solid ${INK}`}}>{cat}</span>
          <span style={{fontFamily: font, fontWeight: 900, fontSize: 38, color: INK, whiteSpace: 'nowrap'}}>{names}</span>
        </div>;
      })}
      {/* the install lines: Claude Code, two commands */}
      <div style={{position: 'absolute', left: 24, right: 24, top: 580, height: 410, background: INK, borderRadius: 24, padding: '22px 22px', boxSizing: 'border-box'}}>
        <div style={{fontFamily: font, fontWeight: 900, fontSize: 34, color: '#FFD23F', marginBottom: 10}}>官方四件套 · Claude Code 里输入：</div>
        {[0, 1].map((k) => {
          const at = 6 + k * 22;
          return <div key={k} style={{marginBottom: 18}}>
            <div style={{fontFamily: jet, fontSize: 38, color: '#fff', lineHeight: 1.3, minHeight: 49}}>{typed(CMD[k * 2], f, at, 0.35)}</div>
            <div style={{fontFamily: jet, fontSize: 38, color: '#8ED1FC', lineHeight: 1.3, minHeight: 49}}>{typed(CMD[k * 2 + 1], f, at + CMD[k * 2].length * 0.35, 0.35)}</div>
          </div>;
        })}
      </div>
    </Card>
  </Stage>;
}, (cue) => [{at: 0, kind: 'whoosh-short', gain: 0.06}, ...[0, 1, 2, 3, 4].map((i) => ({at: 6 + i * 4, kind: 'pop', gain: 0.04})), {at: cue('a', 30), kind: 'tick', gain: 0.05}]);

/* ---------- cover anchor: the hook after the landing ---------- */

const HookBack = Hook.backdrop!;
const Cover = make(({f}) => <HookBack f={f + 80} dur={150} cue={(_n, fb) => fb ?? 0} />);

export const OFFICE_SKILLS_SCENES: Record<string, Scene> = {
  'ost.hook': Hook, 'ost.intro': Intro, 'ost.ppt': Ppt, 'ost.pptmaster': PptMaster, 'ost.word': Word, 'ost.excel': Excel, 'ost.meet': Meet,
  'ost.twist': Twist, 'ost.zero': Zero, 'ost.lazy': Lazy, 'ost.rule': Rule, 'ost.end': End, 'ost.cover': Cover,
};
