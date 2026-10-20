import React from 'react';
import {Img, OffthreadVideo, Sequence, staticFile} from 'remotion';
import {font} from '../theme';
import {clamp, ease, springStep} from '../../fx';
import {Cue, S, Scene, hitOf, phaseOp} from '../paper';
import {A, B, BG, Big, DIM, INK, LINE, Mono, PANEL, STEEL, mono} from '../tech';

// awesome-seedance: an open-source library of verified Seedance video prompts (≈ 112 s, length override in the script).
// Script: inputs/awesome-seedance/script.md; storyboard: tutorials/awesome-seedance.storyboard.md. Narration and on-screen copy are verbatim.
// Stage = the "full" layout, 900 × 1080 at (60, 200); the chapter bar (look.header "chapters") sits above it.
// Every clip / screenshot is someone else's AI case → muted, 「案例展示」 bottom-right. No handles, no URLs:
// clip 03 is re-encoded without its bottom strip (a hovered link showed there), clip 01c is never shown between 5.5 and 6.4 s
// (garbled letters on the pants), clip 06a stops before 6.4 s (garbled letters on the earcup), screenshot 11 keeps its blur.
// Accents: amber A (= orange in the script) and cyan B; red / green only for ✗ / ✓.

const W = 900;
const RED = '#ff5a5a';
const GREEN = '#4ade80';
const CLIP = (n: string) => staticFile(`video/awesome-seedance/${n}.mp4`);
const IMG = (n: string) => staticFile(`images/tutorials/awesome-seedance/${n}.jpg`);

const Root: React.FC<{children: React.ReactNode}> = ({children}) => <div style={{position: 'relative', width: W, height: 1080}}>{children}</div>;
const Abs: React.FC<{x?: number; y: number; w?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({x = 0, y, w, style, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, ...style}}>{children}</div>
);
const popIn = (f: number, at: number) => {
  const k = springStep(S(f), S(at), {f: 2.6, z: 0.62});
  const sq = hitOf(f, [at + 4], 1);
  return {opacity: clamp(k * 2), transform: `scale(${(0.6 + 0.4 * k) * (1 + 0.04 * sq)}, ${(0.6 + 0.4 * k) * (1 - 0.05 * sq)})`};
};
const Chip: React.FC<{c?: string; size?: number; fill?: boolean; children: React.ReactNode; style?: React.CSSProperties}> = ({c = A, size = 56, fill, children, style}) => (
  <div style={{display: 'inline-block', background: fill ? c : BG, border: `4px solid ${c}`, color: fill ? BG : c, fontFamily: font, fontWeight: 900, fontSize: size,
    padding: '2px 18px', whiteSpace: 'nowrap', ...style}}>{children}</div>
);
const Pop: React.FC<{f: number; at: number; origin?: string; children: React.ReactNode}> = ({f, at, origin = '0% 50%', children}) => (
  f >= at - 1 ? <div style={{...popIn(f, at), transformOrigin: origin}}>{children}</div> : null
);
const CaseTag: React.FC<{style?: React.CSSProperties}> = ({style}) => (
  <div style={{position: 'absolute', right: 0, bottom: 0, background: 'rgba(12,26,44,0.88)', color: INK, fontFamily: font, fontWeight: 700, fontSize: 40,
    padding: '2px 14px', whiteSpace: 'nowrap', ...style}}>案例展示</div>
);
const Mark: React.FC<{ok: boolean; size?: number}> = ({ok, size = 120}) => (
  <div style={{width: size, height: size, borderRadius: size / 2, background: ok ? GREEN : RED, color: BG, fontFamily: font, fontWeight: 900,
    fontSize: size * 0.72, lineHeight: `${size}px`, textAlign: 'center'}}>{ok ? '✓' : '✗'}</div>
);

/** A footage box: segments of clips (from `src` s, at `rate`) or freeze stills, each starting at frame `from`. */
type Seg = {clip?: string; still?: string; src?: number; from: number; to?: number; rate?: number; zoom?: number; ox?: number; oy?: number};
const Footage: React.FC<{f: number; x: number; y: number; w: number; h: number; segs: Seg[]; border?: string; tag?: boolean; dim?: number;
  children?: React.ReactNode; style?: React.CSSProperties}> = ({f, x, y, w, h, segs, border = STEEL, tag = true, dim = 0, children, style}) => {
  const cur = segs.filter((s) => f >= s.from).at(-1) ?? segs[0];
  const punch = cur.still ? 1 : 1 + 0.04 * (1 - ease.outCubic(clamp((f - cur.from) / 8)));
  return <div style={{position: 'absolute', left: x, top: y, width: w, height: h, overflow: 'hidden', background: '#000', outline: `3px solid ${border}`, ...style}}>
    {segs.map((s, i) => {
      const end = s.to ?? segs[i + 1]?.from ?? 1e5;
      if (f < s.from || f >= end) return null;
      const inner = s.still
        ? <Img src={IMG(s.still)} style={{width: '100%', height: '100%', objectFit: 'cover', opacity: 1 - dim}} />
        : <OffthreadVideo src={CLIP(s.clip ?? '')} muted trimBefore={Math.round((s.src ?? 0) * 30)} playbackRate={s.rate ?? 1}
          style={{width: '100%', height: '100%', objectFit: 'cover', opacity: 1 - dim}} />;
      return <Sequence key={i} from={s.from} layout="none">
        <div style={{position: 'absolute', inset: 0, transform: `scale(${(s.zoom ?? 1) * punch})`, transformOrigin: `${s.ox ?? 50}% ${s.oy ?? 50}%`}}>{inner}</div>
      </Sequence>;
    })}
    {children}
    {tag && <CaseTag />}
  </div>;
};
/** A screenshot crop as a card (white page), optionally pushing in. */
const Shot: React.FC<{src: string; x?: number; y: number; w: number; h?: number; push?: number; tag?: boolean; children?: React.ReactNode; style?: React.CSSProperties}> = (
  {src, x = 0, y, w, h, push = 1, tag = true, children, style}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, overflow: 'hidden', background: '#fff', outline: `3px solid ${STEEL}`, ...style}}>
    <Img src={IMG(src)} style={{display: 'block', width: '100%', height: h ? '100%' : undefined, objectFit: 'cover', objectPosition: '0% 0%',
      transform: `scale(${push})`, transformOrigin: '30% 30%'}} />
    {children}
    {tag && <CaseTag />}
  </div>
);
/** An expanding impact ring at (x, y) inside a box, starting at frame `at`. */
const Ring: React.FC<{f: number; at: number; x: number; y: number; c?: string}> = ({f, at, x, y, c = A}) => {
  if (f < at) return null;
  const k = ease.outCubic(clamp((f - at) / 14));
  const r = 30 + 90 * k;
  return <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: r, border: `${10 - 6 * k}px solid ${c}`,
    opacity: 1 - 0.55 * k, boxShadow: `0 0 30px ${c}`}} />;
};
const strikeW = (f: number, at: number) => `${100 * ease.inOutCubic(clamp((f - at) / 10))}%`;

/* ---------- 1 hook: left swings at air ✗ / right kick lands ✓ (staircase split so 左 / 右 still reads) ---------- */

const hookPlan = (cue: Cue) => ({a: cue('a', 47), b: cue('b', 81), c: cue('c', 126)});
// 01b: kick lands at 1.3 s and 4.3 s (and 7.6 s); each impact holds 9 frames.
const HOOK_GOOD: Seg[] = [{clip: '01b', src: 0.4, from: 0}, {still: 'f-01b-13', from: 27}, {clip: '01b', src: 1.3, from: 36}, {clip: '01b', src: 3.7, from: 58},
  {still: 'f-01b-43', from: 76}, {clip: '01b', src: 4.3, from: 85}, {clip: '01b', src: 7.0, from: 118}, {still: 'f-01b-76', from: 136}, {clip: '01b', src: 7.6, from: 145}];
const CW = 780, CH = Math.round(CW * 608 / 1080);
const Hook: Scene = ({f, cue}) => {
  const p = hookPlan(cue);
  const s = CW / 1080;
  const loop = f >= p.c;
  return <Root>
    <Abs y={-10} w={W}><Big size={92} style={{whiteSpace: 'nowrap'}}>同样让AI拍打架</Big></Abs>
    <Footage f={f} x={-60} y={120} w={CW} h={CH} border={RED} segs={[{clip: '01a', src: 0, from: 0}, {clip: '01a', src: 0.2, from: 118}]} dim={loop ? 0.35 : 0}>
      <Abs x={18} y={16}><Chip c={RED} size={60} fill>对着空气打 ✗</Chip></Abs>
    </Footage>
    <Footage f={f} x={240} y={580} w={CW} h={CH} border={GREEN} segs={HOOK_GOOD} dim={loop ? 0.35 : 0}>
      <Ring f={f} at={27} x={760 * s} y={410 * s} c={GREEN} />
      <Ring f={f} at={76} x={440 * s} y={210 * s} c={GREEN} />
      <Ring f={f} at={136} x={520 * s} y={260 * s} c={GREEN} />
      <Abs x={18} y={16}><Chip c={GREEN} size={60} fill>一脚踢实 ✓</Chip></Abs>
    </Footage>
    {f >= p.b - 1 && <Abs x={-60} y={505} w={1080} style={{...phaseOp(f, p.b), background: 'rgba(12,26,44,0.92)', borderTop: `3px solid ${A}`, borderBottom: `3px solid ${A}`,
      padding: '14px 0', textAlign: 'center'}}>
      <Big size={64} w={1080} style={{whiteSpace: 'nowrap'}}>同一类模型 · 差在<span style={{color: A}}>提示词</span></Big>
      {loop && <div style={{...popIn(f, p.c), transformOrigin: '50% 50%'}}><Big size={96} c={A} w={1080} style={{whiteSpace: 'nowrap'}}>里的「一样东西」？</Big></div>}
    </Abs>}
  </Root>;
};
Hook.sfx = (cue) => {
  const p = hookPlan(cue);
  return [{at: 27, kind: 'thud', gain: 0.16}, {at: 76, kind: 'thud', gain: 0.18}, {at: 136, kind: 'thud', gain: 0.14}, {at: p.b, kind: 'whoosh-short', gain: 0.1},
    {at: p.c, kind: 'stamp', gain: 0.14}];
};

/* ---------- 2 what: the repo (hero) → checked against the original post + re-run on a second model ---------- */

const whatPlan = (cue: Cue) => ({a: cue('a', 53), b: cue('b', 177), c: cue('c', 222), d: cue('d', 260)});
const What: Scene = ({f, cue}) => {
  const p = whatPlan(cue);
  const table = f >= p.c - 4;
  const s = 1080 / 985;
  return <Root>
    {f < p.a && <>
      <Abs y={0} w={W} style={phaseOp(f, 0, p.a - 6)}><Big size={64} c={DIM}>开头那样东西？</Big><Big size={110} c={A}>答案后面揭晓</Big></Abs>
      <Footage f={f} x={-60} y={330} w={1080} h={608} border={LINE} segs={[{still: 'f-01b-43', from: 0, zoom: 1.08}]} dim={0.55} style={phaseOp(f, 0, p.a - 6)}>
        <Abs x={0} y={250} w={1080} style={{textAlign: 'center'}}><Chip c={A} size={64}>→ 03 打斗秘诀</Chip></Abs>
      </Footage>
    </>}
    {f >= p.a - 2 && !table && <>
      <Abs y={0} w={W} style={phaseOp(f, p.a - 2)}><Chip c={B} size={52}>GitHub · 开源项目</Chip></Abs>
      <Shot src="02" x={-60} y={110} w={1080} push={1 + 0.12 * clamp((f - p.a) / 160)} style={phaseOp(f, p.a)}>
        <div style={{position: 'absolute', top: 0, bottom: 0, width: 8, left: `${((f - p.a) * 14) % 1200 - 60}px`, background: A, boxShadow: `0 0 24px ${A}`, opacity: 0.8}} />
      </Shot>
      <Abs y={380} w={W} style={phaseOp(f, p.a + 6)}>
        <div style={{fontFamily: mono, fontWeight: 800, fontSize: 82, color: INK, whiteSpace: 'nowrap'}}>awesome-<span style={{color: A}}>seedance</span></div>
      </Abs>
      <Abs y={500} w={W} style={phaseOp(f, p.a + 10)}><Big size={58} style={{whiteSpace: 'nowrap'}}>专门整理 <span style={{color: f >= p.b ? A : INK}}>Seedance</span> 视频提示词</Big></Abs>
      <Abs x={-60} y={640} w={1080} style={{display: 'flex', gap: 12}}>
        {[{c: '01b', src: 3.0}, {c: '06a', src: 0.5}, {c: '12c', src: 4.6}].map((n, i) => f >= p.a + 14 + i * 6 - 1
          ? <div key={n.c} style={{position: 'relative', width: 352, height: 380, ...popIn(f, p.a + 14 + i * 6), transformOrigin: '50% 100%'}}>
            <Footage f={f} x={0} y={0} w={352} h={380} segs={[{clip: n.c, src: n.src, from: p.a + 14 + i * 6}]} />
          </div> : <div key={n.c} style={{width: 352}} />)}
      </Abs>
    </>}
    {table && <>
      <Abs y={0} w={W} style={{display: 'flex', gap: 18}}>
        <Pop f={f} at={p.c}><Chip c={GREEN} size={60}>对过原帖 ✓</Chip></Pop>
        <Pop f={f} at={p.d}><Chip c={A} size={60} fill>换模型重跑 ✓</Chip></Pop>
      </Abs>
      <Shot src="04t" x={-60} y={130} w={1080} push={1} style={phaseOp(f, p.c - 4)}>
        {f >= p.d && [168, 379].map((yy, i) => <div key={yy} style={{position: 'absolute', left: 785 * s, top: (yy - 40) * s, width: 205 * s, height: 80 * s,
          border: `6px solid ${GREEN}`, ...popIn(f, p.d + 6 + i * 6)}} />)}
      </Shot>
    </>}
  </Root>;
};
What.sfx = (cue) => {
  const p = whatPlan(cue);
  return [{at: p.a, kind: 'whoosh-short', gain: 0.1}, {at: p.b, kind: 'tick', gain: 0.1}, {at: p.c, kind: 'pop', gain: 0.12}, {at: p.d, kind: 'stamp', gain: 0.14}];
};

/* ---------- 3 numbers: 800+ · 27 · 80 over the template gallery, then who it is for ---------- */

const numPlan = (cue: Cue) => ({a: cue('a', 46), b: cue('b', 72), c: cue('c', 104), d: cue('d', 149), e: cue('e', 166), f: cue('f', 194), g: cue('g', 212),
  h: cue('h', 258)});
const Counter: React.FC<{f: number; at: number; to: number; plus?: boolean; label: string; c: string}> = ({f, at, to, plus, label, c}) => {
  const v = Math.round(to * ease.outCubic(clamp((f - at) / 18)));
  return <div style={{width: 284, ...popIn(f, at), transformOrigin: '50% 50%', textAlign: 'center', border: `4px solid ${c}`, background: BG, padding: '6px 0 10px'}}>
    <div style={{fontFamily: mono, fontWeight: 800, fontSize: 100, lineHeight: 1.05, color: c}}>{v}{plus ? '+' : ''}</div>
    <div style={{fontFamily: font, fontWeight: 900, fontSize: 48, color: INK}}>{label}</div>
  </div>;
};
const USES = [{t: '带货', still: 'f-12c-90'}, {t: '产品展示', still: 'f-06a-60'}, {t: 'vlog', still: 'f-06b-25'}];
const Numbers: Scene = ({f, cue}) => {
  const p = numPlan(cue);
  const uses = f >= p.d - 4;
  return <Root>
    <Abs y={0} w={W} style={{display: 'flex', gap: 24}}>
      {f >= p.a - 1 && <Counter f={f} at={p.a} to={800} plus label="案例" c={A} />}
      {f >= p.b - 1 && <Counter f={f} at={p.b} to={27} label="模板" c={B} />}
      {f >= p.c - 1 && <Counter f={f} at={p.c} to={80} label="Skill" c={INK} />}
    </Abs>
    {!uses && <Footage f={f} x={-60} y={240} w={1080} h={760} border={STEEL} segs={[{clip: '03', src: 0, from: 0, rate: 0.85, zoom: 1 + 0.12 * clamp(f / 150), ox: 20, oy: 20}]} />}
    {uses && <Abs x={-60} y={240} w={1080} style={{display: 'flex', gap: 12}}>
      {USES.map((u, i) => {
        const at = [p.d, p.e, p.f][i];
        return f >= at - 2 ? <div key={u.t} style={{position: 'relative', width: 352, height: 520, overflow: 'hidden', outline: `3px solid ${STEEL}`, ...popIn(f, at),
          transformOrigin: '50% 100%'}}>
          <Img src={IMG(u.still)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.05 + 0.06 * clamp((f - at) / 90)})`}} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 0, background: 'rgba(12,26,44,0.88)', textAlign: 'center', fontFamily: font, fontWeight: 900,
            fontSize: 60, color: A, padding: '4px 0'}}>{u.t}</div>
          <CaseTag />
        </div> : <div key={u.t} style={{width: 352}} />;
      })}
    </Abs>}
    {f >= p.g - 1 && <Abs y={810} w={W} style={{display: 'flex', alignItems: 'center', gap: 18}}>
      <Pop f={f} at={p.g}><Chip c={RED} size={56}><span style={{textDecoration: 'line-through'}}>烧积分试错</span></Chip></Pop>
      <Pop f={f} at={p.h}><Chip c={GREEN} size={56} fill>直接拿来用</Chip></Pop>
    </Abs>}
  </Root>;
};
Numbers.sfx = (cue) => {
  const p = numPlan(cue);
  return [{at: p.a, kind: 'pop', gain: 0.12}, {at: p.b, kind: 'pop', gain: 0.12}, {at: p.c, kind: 'pop', gain: 0.12}, {at: p.d, kind: 'whoosh-short', gain: 0.1},
    {at: p.e, kind: 'tick', gain: 0.1}, {at: p.f, kind: 'tick', gain: 0.1}, {at: p.g, kind: 'block', gain: 0.12}, {at: p.h, kind: 'stamp', gain: 0.14}];
};

/* ---------- 4 template steps ① ②: pick the type, copy and swap the [brackets] ---------- */

const StepHead: React.FC<{n: string; t: string; on: boolean}> = ({n, t, on}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 18, whiteSpace: 'nowrap'}}>
    <div style={{width: 84, height: 84, borderRadius: 42, background: on ? A : PANEL, color: on ? BG : DIM, fontFamily: mono, fontWeight: 800, fontSize: 56,
      lineHeight: '84px', textAlign: 'center'}}>{n}</div>
    <Big size={62} c={on ? INK : DIM} w={800}>{t}</Big>
  </div>
);
const tpl12Plan = (cue: Cue) => ({a: cue('a', 51), b: cue('b', 89), c: cue('c', 154), d: cue('d', 196), e: cue('e', 239), f: cue('f', 301)});
const Tpl12: Scene = ({f, cue}) => {
  const p = tpl12Plan(cue);
  const two = f >= p.d;
  const s5 = 900 / 1142, s6 = 900 / 1035;
  return <Root>
    <Abs y={0} w={W} style={{display: 'flex', alignItems: 'center', gap: 20}}>
      <Big size={76} w={460} style={{whiteSpace: 'nowrap'}}>新手先用模板</Big>
      <Pop f={f} at={p.a}><Chip c={GREEN} size={48}>不用装任何东西</Chip></Pop>
    </Abs>
    {f >= p.b - 2 && <Abs y={140} w={W} style={phaseOp(f, p.b)}><StepHead n="①" t="按画面挑类型" on={!two} /></Abs>}
    {f >= p.b - 2 && <Shot src="05t" y={250} w={W} push={1} style={{...phaseOp(f, p.b + 4), opacity: two ? 0.45 : undefined}}>
      {f >= p.c && <div style={{position: 'absolute', left: 4 * s5, top: 8 * s5, width: 152 * s5, height: 40 * s5, border: `5px solid ${A}`, ...popIn(f, p.c)}} />}
    </Shot>}
    {f >= p.c - 1 && !two && <Abs y={400} w={W}><Pop f={f} at={p.c}><Chip c={A} size={72} fill>手持UGC vlog</Chip></Pop></Abs>}
    {two && <>
      <Abs y={410} w={W} style={phaseOp(f, p.d)}><StepHead n="②" t="复制模板 换成你的产品" on /></Abs>
      <Shot src="06b" y={520} w={W} push={1 + 0.04 * clamp((f - p.d) / 90)} style={phaseOp(f, p.d + 4)}>
        {f >= p.e && <div style={{position: 'absolute', left: 10 * s6, top: 22 * s6, width: 1010 * s6, height: 90 * s6, border: `5px solid ${A}`, ...popIn(f, p.e)}} />}
      </Shot>
      <Abs y={840} w={W} style={{display: 'flex', alignItems: 'center', gap: 16}}>
        <Pop f={f} at={p.e}><Chip c={B} size={56}>【方括号】</Chip></Pop>
        {f >= p.f - 1 && <Big size={60} c={DIM} w={70}>→</Big>}
        <Pop f={f} at={p.f}><Chip c={A} size={64} fill>头戴耳机</Chip></Pop>
      </Abs>
    </>}
  </Root>;
};
Tpl12.sfx = (cue) => {
  const p = tpl12Plan(cue);
  return [{at: p.a, kind: 'tick', gain: 0.1}, {at: p.b, kind: 'tap', gain: 0.14}, {at: p.c, kind: 'pop', gain: 0.12}, {at: p.d, kind: 'tap', gain: 0.14},
    {at: p.e, kind: 'tick', gain: 0.1}, {at: p.f, kind: 'pop', gain: 0.12}];
};

/* ---------- 5 template steps ③ ④: send with the product image, paste into Seedance ---------- */

const tpl34Plan = (cue: Cue) => ({a: cue('a', 14), b: cue('b', 40), c: cue('c', 119), d: cue('d', 164), e: cue('e', 226)});
const Tpl34: Scene = ({f, cue}) => {
  const p = tpl34Plan(cue);
  const four = f >= p.d;
  const prog = ease.inOutCubic(clamp((f - p.d - 8) / Math.max(10, p.e - p.d - 8)));
  return <Root>
    <Abs y={0} w={W} style={phaseOp(f, Math.min(p.a, 2))}><StepHead n="③" t="产品图+模板 发给AI" on={!four} /></Abs>
    <Shot src="06f" y={110} w={W} h={four ? 330 : 760} push={four ? 1 : 1 + 0.1 * clamp(f / 110)} style={{...phaseOp(f, 0), opacity: four ? 0.45 : undefined}}>
      {f >= p.b - 1 && <div style={{position: 'absolute', right: 10, top: 10, width: 230, height: 230, background: '#fff', border: `6px solid ${A}`, ...popIn(f, p.b),
        transformOrigin: '100% 0%'}}>
        <Img src={IMG('06p')} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
      </div>}
    </Shot>
    {f >= p.c - 1 && !four && <Abs y={890} w={W}><Pop f={f} at={p.c}><Chip c={GREEN} size={64} fill>→ 改成完整提示词 ✓</Chip></Pop></Abs>}
    {four && <>
      <Abs y={480} w={W} style={phaseOp(f, p.d)}><StepHead n="④" t="贴进即梦 Seedance 生成" on /></Abs>
      <Abs y={580} w={W} style={{...phaseOp(f, p.d + 4), border: `4px solid ${A}`, background: PANEL, padding: '22px 26px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
          <Chip c={B} size={52}>粘贴</Chip><Big size={56} c={DIM} w={60}>→</Big><Chip c={A} size={52} fill={prog >= 1}>生成</Chip>
          <div style={{marginLeft: 'auto', fontFamily: mono, fontWeight: 800, fontSize: 56, color: prog >= 1 ? GREEN : INK}}>{Math.round(prog * 100)}%</div>
        </div>
        <div style={{marginTop: 22, height: 26, background: BG, border: `2px solid ${LINE}`}}>
          <div style={{height: '100%', width: `${prog * 100}%`, background: prog >= 1 ? GREEN : A}} />
        </div>
      </Abs>
      {f >= p.e - 1 && <Footage f={f} x={250} y={800} w={400} h={230} segs={[{clip: '06b', src: 3.0, from: p.e - 1}]} style={popIn(f, p.e)} />}
    </>}
  </Root>;
};
Tpl34.sfx = (cue) => {
  const p = tpl34Plan(cue);
  return [{at: p.a, kind: 'tap', gain: 0.14}, {at: p.b, kind: 'pop', gain: 0.12}, {at: p.c, kind: 'stamp', gain: 0.12}, {at: p.d, kind: 'tap', gain: 0.14},
    {at: p.e, kind: 'chime', gain: 0.12}];
};

/* ---------- 6 result: the original author's headphone vlog from that template ---------- */

const resultPlan = (cue: Cue) => ({a: cue('a', 104), b: cue('b', 118), c: cue('c', 151)});
const Result: Scene = ({f, cue}) => {
  const p = resultPlan(cue);
  return <Root>
    <Abs y={0} w={W}><Big size={64} style={{whiteSpace: 'nowrap'}}>原作者用这个模板跑出来的</Big></Abs>
    <Footage f={f} x={-60} y={100} w={1080} h={810} segs={[{clip: '06a', src: 0.2, from: 0}, {clip: '06a', src: 5.5, from: 72}, {clip: '06b', src: 0.5, from: 96}]}>
      {f < 60 && <div style={{position: 'absolute', left: 24, top: 24, width: 440, ...phaseOp(f, 2, 52), outline: `4px solid ${A}`, background: '#fff'}}>
        <Img src={IMG('06b')} style={{display: 'block', width: '100%'}} />
        <div style={{position: 'absolute', left: 0, top: -2, background: A, color: BG, fontFamily: font, fontWeight: 900, fontSize: 40, padding: '0 10px'}}>②</div>
      </div>}
    </Footage>
    <Abs y={930} w={W} style={{display: 'flex', gap: 16}}>
      <Pop f={f} at={p.a}><Chip c={B} size={54}>手抖</Chip></Pop>
      <Pop f={f} at={p.b}><Chip c={B} size={54}>对焦慢半拍</Chip></Pop>
      <Pop f={f} at={p.c}><Chip c={A} size={54} fill>像真人拍</Chip></Pop>
    </Abs>
  </Root>;
};
Result.sfx = (cue) => {
  const p = resultPlan(cue);
  return [{at: 72, kind: 'whoosh-short', gain: 0.08}, {at: 96, kind: 'whoosh-short', gain: 0.08}, {at: p.a, kind: 'pop', gain: 0.1}, {at: p.b, kind: 'pop', gain: 0.1},
    {at: p.c, kind: 'stamp', gain: 0.12}];
};

/* ---------- 7 pitfalls: handheld + 4K cinematic light = plastic; chest-up at most ---------- */

const pitPlan = (cue: Cue) => ({a: cue('a', 51), b: cue('b', 75), c: cue('c', 153), d: cue('d', 212), e: cue('e', 234), f: cue('f', 267)});
const Pitfalls: Scene = ({f, cue}) => {
  const p = pitPlan(cue);
  const frame = f >= p.e - 4;
  const sp = 1080 / 1052;
  const fs = 1080 / 1080;
  return <Root>
    <Abs y={0} w={W}><Big size={72} style={{whiteSpace: 'nowrap'}}>模板里最值钱：<span style={{color: f >= p.a ? A : INK}}>常见坑</span></Big></Abs>
    {!frame && <>
      <Shot src="05p" x={-60} y={120} w={1080} push={1 + 0.04 * clamp((f - p.a) / 90)} style={phaseOp(f, p.a - 4)}>
        {f >= p.c && <div style={{position: 'absolute', left: 405 * sp, top: 66 * sp, height: 6, width: 180 * sp}}>
          <div style={{height: '100%', width: strikeW(f, p.c), background: RED}} /></div>}
      </Shot>
      <Abs y={330} w={W} style={{display: 'flex', flexDirection: 'column', gap: 22, alignItems: 'flex-start'}}>
        <Pop f={f} at={p.b}><Chip c={B} size={76}>手持真实感</Chip></Pop>
        <Pop f={f} at={p.c}><Chip c={A} size={76}>+ 4K电影级打光</Chip></Pop>
        <Pop f={f} at={p.d}><div style={{display: 'flex', alignItems: 'center', gap: 20}}><Chip c={RED} size={88} fill>= 发塑料</Chip><Mark ok={false} size={110} /></div></Pop>
      </Abs>
    </>}
    {frame && <Footage f={f} x={-60} y={120} w={1080} h={810} segs={[{still: 'f-06b-25', from: 0}]} style={phaseOp(f, p.e - 4)}>
      {/* chest line ≈ y 560 in the frame; the face sits ≈ x 500–720, y 120–340 */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 560 * fs, borderTop: `6px dashed ${GREEN}`, width: `${100 * ease.inOutCubic(clamp((f - p.e) / 12))}%`}} />
      <Abs x={30} y={480 * fs}><Pop f={f} at={p.e + 4}><Chip c={GREEN} size={60} fill>最紧拍到胸口 ✓</Chip></Pop></Abs>
      {f >= p.f && <div style={{position: 'absolute', left: 490 * fs, top: 110 * fs, width: 240 * fs, height: 240 * fs, border: `6px solid ${RED}`, ...popIn(f, p.f)}} />}
      <Abs x={540} y={30}><Pop f={f} at={p.f + 4} origin="100% 0%"><Chip c={RED} size={52} fill>大特写 = 露AI脸</Chip></Pop></Abs>
    </Footage>}
  </Root>;
};
Pitfalls.sfx = (cue) => {
  const p = pitPlan(cue);
  return [{at: p.b, kind: 'pop', gain: 0.12}, {at: p.c, kind: 'pop', gain: 0.12}, {at: p.d, kind: 'block', gain: 0.14}, {at: p.e, kind: 'whoosh-short', gain: 0.1},
    {at: p.f, kind: 'block', gain: 0.12}];
};

/* ---------- 8 fight: back to the hook — write the contact points, chain the moves ---------- */

const fightPlan = (cue: Cue) => ({a: cue('a', 49), b: cue('b', 108), c: cue('c', 139), d: cue('d', 173), e: cue('e', 205), f: cue('f', 234)});
const Fight: Scene = ({f, cue}) => {
  const p = fightPlan(cue);
  const good = f >= p.b - 2;
  return <Root>
    <Abs y={0} w={W}>
      {!good ? <Big size={72} style={{whiteSpace: 'nowrap'}}>回到开头</Big>
        : <div style={{...popIn(f, p.b), transformOrigin: '0% 50%'}}><Big size={92} c={A} style={{whiteSpace: 'nowrap'}}>秘诀：写接触点</Big></div>}
    </Abs>
    {!good && <>
      <Footage f={f} x={-60} y={120} w={1080} h={612} border={RED} segs={[{clip: '01a', src: 0, from: 0}]}>
        <Abs x={900} y={20}><Mark ok={false} size={130} /></Abs>
      </Footage>
      {f >= p.a - 1 && <Abs y={780} w={W} style={{...popIn(f, p.a), transformOrigin: '0% 50%'}}>
        <div style={{position: 'relative', display: 'inline-block'}}>
          <Chip c={RED} size={80}>只写“激烈搏斗”</Chip>
          <div style={{position: 'absolute', left: -6, top: '50%', height: 8, width: strikeW(f, p.a + 10), background: RED}} />
        </div>
      </Abs>}
    </>}
    {good && <>
      <Footage f={f} x={-60} y={150} w={1080} h={608} border={GREEN}
        segs={[{clip: '01b', src: 3.9, from: p.b - 2, rate: 0.5}, {still: 'f-01b-43', from: p.b + 22, zoom: 1 + 0.06 * clamp((f - p.b - 22) / 120), ox: 40, oy: 35}]}>
        <Ring f={f} at={p.b + 22} x={440} y={210} />
        <Ring f={f} at={p.c} x={440} y={210} c={B} />
      </Footage>
      <Abs y={800} w={W} style={{display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center'}}>
        <Pop f={f} at={p.c}><Chip c={A} size={56}>打中哪里</Chip></Pop>
        <Pop f={f} at={p.d}><Chip c={B} size={56}>怎么格挡</Chip></Pop>
        <Pop f={f} at={p.e}><Chip c={B} size={56}>怎么反击</Chip></Pop>
        <Pop f={f} at={p.f}><Chip c={A} size={56} fill>串成一条链</Chip></Pop>
      </Abs>
    </>}
  </Root>;
};
Fight.sfx = (cue) => {
  const p = fightPlan(cue);
  return [{at: p.a, kind: 'block', gain: 0.12}, {at: p.b + 22, kind: 'thud', gain: 0.18}, {at: p.c, kind: 'pop', gain: 0.1}, {at: p.d, kind: 'pop', gain: 0.1},
    {at: p.e, kind: 'pop', gain: 0.1}, {at: p.f, kind: 'stamp', gain: 0.12}];
};

/* ---------- 9 chain: 7–10 s fight, more than 4 moves stops reading ---------- */

const chainPlan = (cue: Cue) => ({a: cue('a', 19), b: cue('b', 54), c: cue('c', 92)});
const MOVES = ['直拳', '勾拳', '低扫', '格挡', '反击体踢'];
const Chain: Scene = ({f, cue}) => {
  const p = chainPlan(cue);
  return <Root>
    <Abs y={0} w={W} style={{display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center'}}>
      {MOVES.map((m, i) => <React.Fragment key={m}>
        {i > 0 && f >= i * 4 && <Big size={52} c={DIM} w={40}>→</Big>}
        <Pop f={f} at={i * 4}><Chip c={i < 4 ? B : RED} size={56} fill={f >= p.b && i < 4}>{m}</Chip></Pop>
      </React.Fragment>)}
    </Abs>
    <Abs y={250} w={W} style={{display: 'flex', alignItems: 'baseline', gap: 24}}>
      <Pop f={f} at={p.a}><div style={{fontFamily: mono, fontWeight: 800, fontSize: 150, color: INK, lineHeight: 1, whiteSpace: 'nowrap'}}>7–10<span style={{fontSize: 80}}>秒</span></div></Pop>
    </Abs>
    <Abs y={460} w={W} style={{display: 'flex', gap: 14}}>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const at = p.b + i * 5;
        const over = i >= 4;
        return f >= at - 1 ? <div key={i} style={{width: 132, height: 132, ...popIn(f, at), transformOrigin: '50% 100%', background: over ? 'transparent' : B,
          border: `6px solid ${over ? RED : B}`, color: over ? RED : BG, fontFamily: mono, fontWeight: 800, fontSize: 72, lineHeight: '120px', textAlign: 'center'}}>{over ? '✗' : i + 1}</div>
          : <div key={i} style={{width: 132}} />;
      })}
    </Abs>
    <Abs y={640} w={W} style={{display: 'flex', alignItems: 'center', gap: 20}}>
      <Pop f={f} at={p.b + 6}><Chip c={A} size={72} fill>≤ 4 段动作</Chip></Pop>
      <Pop f={f} at={p.c}><Chip c={RED} size={64}>再多就看不清</Chip></Pop>
    </Abs>
    {f >= 6 && <Shot src="07p" y={810} w={W} style={phaseOp(f, 6)} />}
  </Root>;
};
Chain.sfx = (cue) => {
  const p = chainPlan(cue);
  return [...MOVES.map((_, i) => ({at: i * 4, kind: 'tick', gain: 0.08})), {at: p.a, kind: 'pop', gain: 0.12},
    ...[0, 1, 2, 3].map((i) => ({at: p.b + i * 5, kind: 'tick', gain: 0.1})), {at: p.c, kind: 'block', gain: 0.14}];
};

/* ---------- 10 styles: Muay Thai = big arc, Taekwondo = straight line from the hip (slow-mo + freeze) ---------- */

const stylesPlan = (cue: Cue) => ({a: cue('a', 57), b: cue('b', 85), c: cue('c', 153)});
const SH = 450;
const Styles: Scene = ({f, cue}) => {
  const p = stylesPlan(cue);
  // cover-fit: frames stay 1080 wide (×1); 608 tall is clipped to SH, so frame y maps to y − (608 − SH) / 2
  const oy = (608 - SH) / 2;
  const draw = (at: number) => ease.inOutCubic(clamp((f - at) / 16));
  return <Root>
    <Abs y={-10} w={W}><Big size={72} style={{whiteSpace: 'nowrap'}}>还能指名<span style={{color: A}}>流派</span></Big></Abs>
    <Footage f={f} x={-60} y={100} w={1080} h={SH} border={f >= p.b ? A : LINE}
      segs={[{clip: '01b', src: 0.3, from: 0}, {clip: '01b', src: 3.9, from: p.b - 6, rate: 0.5}, {still: 'f-01b-43', from: p.b + 18}]}>
      {f >= p.b + 18 && <svg width={1080} height={SH} style={{position: 'absolute', left: 0, top: 0}}>
        <path d={`M ${880} ${500 - oy} Q ${940} ${120 - oy} ${450} ${210 - oy}`} fill="none" stroke={A} strokeWidth={14} strokeLinecap="round"
          pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw(p.b + 18)} />
      </svg>}
      <Abs x={18} y={14}><Pop f={f} at={p.b}><Chip c={A} size={60} fill>泰拳：大弧线</Chip></Pop></Abs>
    </Footage>
    <Footage f={f} x={-60} y={570} w={1080} h={SH} border={f >= p.c ? B : LINE}
      segs={[{clip: '01c', src: 0.3, from: 0}, {clip: '01c', src: 3.9, from: p.c - 6, rate: 0.5}, {still: 'f-01c-43', from: p.c + 18}]}>
      {f >= p.c + 18 && <svg width={1080} height={SH} style={{position: 'absolute', left: 0, top: 0}}>
        <line x1={760} y1={330 - oy} x2={760 - 470 * draw(p.c + 18)} y2={330 - oy - 180 * draw(p.c + 18)} stroke={B} strokeWidth={14} strokeLinecap="round" />
      </svg>}
      <Abs x={18} y={14}><Pop f={f} at={p.c}><Chip c={B} size={60} fill>跆拳道：直线</Chip></Pop></Abs>
    </Footage>
    {f >= p.a - 1 && f < p.b && <Abs y={470} w={W} style={{...popIn(f, p.a), transformOrigin: '0% 50%'}}><Chip c={INK} size={60}>同样是踢腿</Chip></Abs>}
  </Root>;
};
Styles.sfx = (cue) => {
  const p = stylesPlan(cue);
  return [{at: p.a, kind: 'tick', gain: 0.1}, {at: p.b + 18, kind: 'thud', gain: 0.16}, {at: p.c + 18, kind: 'thud', gain: 0.16}];
};

/* ---------- 11 skill: template = one shot's recipe, Skill = the whole short's shooting manual ---------- */

const skillPlan = (cue: Cue) => ({a: cue('a', 89), b: cue('b', 138), c: cue('c', 208), d: cue('d', 228), e: cue('e', 257)});
const Skill: Scene = ({f, cue}) => {
  const p = skillPlan(cue);
  const s = 1080 / 1445;
  const rowBox = (top: number, h: number, at: number, c: string) => f >= at && <div style={{position: 'absolute', left: 6, top: top * s, width: 1066, height: h * s,
    border: `6px solid ${c}`, ...popIn(f, at), transformOrigin: '50% 50%'}} />;
  return <Root>
    <Abs y={0} w={W}><Big size={64} style={{whiteSpace: 'nowrap'}}>每周做同一类视频 → <span style={{color: A}}>Skill</span></Big></Abs>
    <Shot src="08t" x={-60} y={110} w={1080} push={1 + 0.08 * clamp(f / p.a)} style={phaseOp(f, 0)}>
      {f < p.a && <div style={{position: 'absolute', left: 0, right: 0, height: 60, top: `${(f * 9) % 460}px`, background: 'rgba(79,214,232,0.22)'}} />}
      {rowBox(75, 120, p.a, B)}
      {rowBox(460, 120, p.b, A)}
    </Shot>
    <Abs y={570} w={W} style={{display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start'}}>
      <Pop f={f} at={p.a}><Chip c={B} size={60}>模板 = 单个镜头的配方</Chip></Pop>
      <Pop f={f} at={p.b}><Chip c={A} size={60} fill>Skill = 整条短片拍摄手册</Chip></Pop>
    </Abs>
    <Abs y={800} w={W} style={{display: 'flex', gap: 14}}>
      <Pop f={f} at={p.c}><Chip c={INK} size={54}>拆分镜</Chip></Pop>
      <Pop f={f} at={p.d}><Chip c={INK} size={54}>写提示词</Chip></Pop>
      <Pop f={f} at={p.e}><Chip c={INK} size={54}>列检查清单</Chip></Pop>
    </Abs>
  </Root>;
};
Skill.sfx = (cue) => {
  const p = skillPlan(cue);
  return [{at: p.a, kind: 'pop', gain: 0.12}, {at: p.b, kind: 'stamp', gain: 0.12}, ...[p.c, p.d, p.e].map((at) => ({at, kind: 'tick', gain: 0.1}))];
};

/* ---------- 12 install: one command in Claude Code / Codex, then just say what you need ---------- */

const installPlan = (cue: Cue) => ({a: cue('a', 18), b: cue('b', 46), c: cue('c', 71), d: cue('d', 100)});
const CMD = 'npx seedance-prompt-library install';
const Install: Scene = ({f, cue}) => {
  const p = installPlan(cue);
  const typed = Math.round(CMD.length * ease.outCubic(clamp((f - p.c + 6) / 22)));
  return <Root>
    <Abs y={0} w={W} style={{display: 'flex', gap: 16}}>
      <Pop f={f} at={Math.min(p.a, 6)}><Chip c={B} size={60}>Claude Code</Chip></Pop>
      <Pop f={f} at={p.b}><Chip c={B} size={60}>Codex</Chip></Pop>
    </Abs>
    <Abs y={130} w={W} style={{...phaseOp(f, 0), border: `4px solid ${A}`, background: '#0a1422'}}>
      <div style={{height: 60, display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px', borderBottom: `2px solid ${LINE}`, background: PANEL}}>
        {['#ff5f57', '#febc2e', '#28c840'].map((x) => <div key={x} style={{width: 18, height: 18, borderRadius: 9, background: x}} />)}
        <Mono size={40} c={DIM}>一行命令装好</Mono>
      </div>
      <div style={{padding: '22px 26px', fontFamily: mono, fontWeight: 800, fontSize: 46, lineHeight: 1.4, color: INK, minHeight: 150, whiteSpace: 'nowrap'}}>
        <span style={{color: A}}>$ </span>{CMD.slice(0, Math.min(typed, 27))}{typed > 28 && <><br />{'  ' + CMD.slice(28, typed)}</>}
        <span style={{color: A, opacity: Math.floor(f / 8) % 2 ? 1 : 0}}>▍</span>
      </div>
    </Abs>
    <Shot src="11" x={-60} y={420} w={1080} push={1 + 0.04 * clamp(f / 130)} style={{...phaseOp(f, 4), opacity: f >= p.d ? 1 : 0.55}} />
    <Abs y={470} x={20}><Pop f={f} at={p.d}><Chip c={GREEN} size={64} fill>直接说需求</Chip></Pop></Abs>
  </Root>;
};
Install.sfx = (cue) => {
  const p = installPlan(cue);
  return [{at: p.b, kind: 'pop', gain: 0.1}, {at: p.c, kind: 'tap', gain: 0.14}, {at: p.d, kind: 'whoosh-short', gain: 0.1}];
};

/* ---------- 13 compare: the same shampoo, template version vs Skill version ---------- */

const cmpPlan = (cue: Cue) => ({a: cue('a', 49), b: cue('b', 78), c: cue('c', 108), d: cue('d', 153)});
const COLW = 534, COLH = 860;
const Compare: Scene = ({f, cue}) => {
  const p = cmpPlan(cue);
  const hl = (on: boolean, c: string) => (on ? c : LINE);
  return <Root>
    <Abs y={0} w={W}><Big size={64} style={{whiteSpace: 'nowrap'}}>同一瓶洗发水</Big></Abs>
    <Footage f={f} x={-60} y={110} w={COLW} h={COLH} border={hl(f >= p.a && f < p.b, B)}
      segs={[{clip: '10b', src: 4.0, from: 0, rate: 2}, {clip: '10c', src: 4.5, from: 60}]}>
      <Abs x={0} y={0} w={COLW} style={{textAlign: 'center', background: 'rgba(12,26,44,0.9)', padding: '6px 0'}}><Big size={56} c={B} w={COLW}>模板版</Big></Abs>
      {f < 48 && <div style={{position: 'absolute', left: 12, top: 560, width: 510, outline: `4px solid ${B}`, ...phaseOp(f, 0, 42)}}>
        <Img src={IMG('09b')} style={{display: 'block', width: '100%'}} />
      </div>}
    </Footage>
    <Footage f={f} x={486} y={110} w={COLW} h={COLH} border={hl(f >= p.b, A)}
      segs={[{clip: '12b', src: 3.0, from: 0, rate: 2}, {clip: '12a', src: 2.4, from: 30, zoom: 1.1, oy: 60}, {clip: '12c', src: 5.0, from: 110}]}>
      <Abs x={0} y={0} w={COLW} style={{textAlign: 'center', background: 'rgba(12,26,44,0.9)', padding: '6px 0'}}><Big size={56} c={A} w={COLW}>Skill版</Big></Abs>
      <Abs x={20} y={560} w={COLW - 40} style={{display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start'}}>
        <Pop f={f} at={p.c}><Chip c={A} size={52} fill>口播更多</Chip></Pop>
        <Pop f={f} at={p.c + 8}><Chip c={A} size={52} fill>卖点更多</Chip></Pop>
      </Abs>
    </Footage>
    {f >= p.d - 1 && <Abs x={500} y={990} style={{...popIn(f, p.d), transformOrigin: '50% 50%'}}><Chip c={GREEN} size={60} fill>更像测评 ✓</Chip></Abs>}
  </Root>;
};
Compare.sfx = (cue) => {
  const p = cmpPlan(cue);
  return [{at: p.a, kind: 'tick', gain: 0.1}, {at: p.b, kind: 'tick', gain: 0.1}, {at: p.c, kind: 'pop', gain: 0.12}, {at: p.c + 8, kind: 'pop', gain: 0.12},
    {at: p.d, kind: 'stamp', gain: 0.14}];
};

/* ---------- 14 close: pick a case → copy, swap words → run it; save this ---------- */

const closePlan = (cue: Cue) => ({a: cue('a', 66), b: cue('b', 85), c: cue('c', 106), d: cue('d', 129)});
const Close: Scene = ({f, cue}) => {
  const p = closePlan(cue);
  const rows = [{t: '挑案例', at: 4, c: INK}, {t: '复制 · 换词', at: p.a, c: B}, {t: '跑起来', at: p.c, c: A}];
  return <Root>
    <Abs y={20} w={W} style={{display: 'flex', flexDirection: 'column', gap: 10}}>
      {rows.map((r, i) => <Pop key={r.t} f={f} at={r.at}><div style={{display: 'flex', alignItems: 'center', gap: 22}}>
        <div style={{fontFamily: mono, fontWeight: 800, fontSize: 64, color: DIM, width: 70}}>{i ? '→' : ''}</div>
        <div><Big size={120} c={r.c} w={760} style={{whiteSpace: 'nowrap', textShadow: '0 6px 24px rgba(0,0,0,0.7)'}}>{r.t}</Big>
          <div style={{height: 10, background: r.c, width: `${Math.min(100, 100 * ease.outCubic(clamp((f - r.at) / 40)))}%`, maxWidth: 560}} /></div>
      </div></Pop>)}
    </Abs>
    {f >= p.d - 1 && <Abs y={700} w={W} style={{...popIn(f, p.d), transformOrigin: '0% 50%', display: 'flex', alignItems: 'center', gap: 24}}>
      <svg width={120} height={140} viewBox="0 0 24 28" style={{transform: `translateY(${-14 * Math.abs(Math.sin((f - p.d) / 7))}px)`}}><path d="M3 1 h18 v26 l-9 -7 l-9 7 z" fill={A} /></svg>
      <div><Big size={80} w={760} style={{whiteSpace: 'nowrap'}}>收藏这条</Big><Big size={52} c={DIM} w={760} style={{whiteSpace: 'nowrap'}}>做视频时照着用</Big></div>
    </Abs>}
  </Root>;
};
Close.backdrop = ({f}) => <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
  <Img src={IMG('f-12c-90')} style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, objectFit: 'cover', filter: 'blur(14px)', opacity: 0.55,
    transform: `scale(${1.1 + 0.25 * clamp(f / 230)}) translateY(${-60 * clamp(f / 230)}px)`}} />
  <div style={{position: 'absolute', top: 0, bottom: 0, width: 260, left: (f * 12) % 1700 - 400, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
    transform: 'skewX(-18deg)'}} />
  <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(rgba(12,26,44,0.75), rgba(12,26,44,0.35) 50%, rgba(12,26,44,0.8))'}} />
  <div style={{position: 'absolute', right: 30, bottom: 380}}><CaseTag style={{position: 'static'}} /></div>
</div>;
Close.sfx = (cue) => {
  const p = closePlan(cue);
  return [{at: 4, kind: 'tap', gain: 0.14}, {at: p.a, kind: 'tap', gain: 0.14}, {at: p.c, kind: 'tap', gain: 0.14}, {at: p.d, kind: 'chime', gain: 0.14}];
};

/* ---------- covers (anchor box 880 × 800) ---------- */

const Cover67: Scene = () => <div style={{position: 'relative', width: 880, height: 800}}>
  {[{n: 'f-01a-10', ok: false, y: 0}, {n: 'f-01b-43', ok: true, y: 410}].map((c) => <div key={c.n} style={{position: 'absolute', left: -100, top: c.y, width: 1080, height: 390,
    overflow: 'hidden', outline: `5px solid ${c.ok ? GREEN : RED}`}}>
    <Img src={IMG(c.n)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    <div style={{position: 'absolute', right: 120, top: 20}}><Mark ok={c.ok} size={130} /></div>
  </div>)}
</div>;
const Cover34: Scene = () => <div style={{position: 'relative', width: 880, height: 800}}>
  <Img src={IMG('f-12c-90')} style={{position: 'absolute', left: 0, top: 0, width: 880, height: 800, objectFit: 'cover', objectPosition: '50% 60%', outline: `4px solid ${STEEL}`}} />
  <div style={{position: 'absolute', right: -20, bottom: -20, width: 420, height: 236, overflow: 'hidden', outline: `5px solid ${GREEN}`}}>
    <Img src={IMG('f-01b-43')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
  </div>
</div>;

export const awesomeSeedanceScenes: Record<string, Scene> = {
  'as.hook': Hook,
  'as.what': What,
  'as.numbers': Numbers,
  'as.tpl12': Tpl12,
  'as.tpl34': Tpl34,
  'as.result': Result,
  'as.pitfalls': Pitfalls,
  'as.fight': Fight,
  'as.chain': Chain,
  'as.styles': Styles,
  'as.skill': Skill,
  'as.install': Install,
  'as.compare': Compare,
  'as.close': Close,
  'as.cover67': Cover67,
  'as.cover34': Cover34,
};
