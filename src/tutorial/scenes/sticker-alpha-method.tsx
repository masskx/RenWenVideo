import React from 'react';
import {Img, Loop, OffthreadVideo, Sequence, staticFile} from 'remotion';
import {font} from '../theme';
import {clamp, ease, springStep} from '../../fx';
import {Cue, S, Scene, hitOf, phaseOp} from '../paper';
import {A, B, BG, Big, DIM, INK, LINE, PANEL, STEEL, mono} from '../tech';

// sticker-alpha-method: one locked character → a consistent set of transparent stickers (≈ 85 s, length override in the script).
// Script: inputs/sticker-alpha-method/script.md; storyboard: tutorials/sticker-alpha-method.storyboard.md. Narration and on-screen copy are verbatim.
// Every picture was generated for this video with the method itself → small 「AI 生成示例」 bottom-right, no 「案例展示」.
// The chat mock is rebuilt here from the real transparent stickers (C0x_sticker_alpha) so they can pop in and stay clear of the right-hand button column.
// Accents: amber A and cyan B; red / green only for ✗ / ✓.

const W = 900;
const RED = '#ff5a5a';
const GREEN = '#4ade80';
const CLIP = (n: string) => staticFile(`video/sticker-alpha-method/${n}.mp4`);
const IMG = (n: string) => staticFile(`images/tutorials/sticker-alpha-method/${n}`);

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
const AiTag: React.FC<{style?: React.CSSProperties}> = ({style}) => (
  <div style={{position: 'absolute', right: 0, bottom: 0, background: 'rgba(12,26,44,0.85)', color: INK, fontFamily: font, fontWeight: 700, fontSize: 40,
    padding: '0 12px', whiteSpace: 'nowrap', ...style}}>AI 生成示例</div>
);
const Mark: React.FC<{ok: boolean; size?: number}> = ({ok, size = 110}) => (
  <div style={{width: size, height: size, borderRadius: size / 2, background: ok ? GREEN : RED, color: BG, fontFamily: font, fontWeight: 900,
    fontSize: size * 0.72, lineHeight: `${size}px`, textAlign: 'center'}}>{ok ? '✓' : '✗'}</div>
);
/** Grey / white checkerboard, the usual "this area is transparent" pattern (drawn by us, not baked into any asset). */
const checker = (cell = 28): React.CSSProperties => ({background: `repeating-conic-gradient(#d6dbe3 0% 25%, #ffffff 0% 50%) 0 0 / ${cell * 2}px ${cell * 2}px`});

/** A square crop of a 16:9 clip (the character sits in the centre third), optionally looping. */
const Clip: React.FC<{f: number; n: string; x: number; y: number; size: number; from?: number; src?: number; loop?: boolean; tag?: boolean; border?: string;
  style?: React.CSSProperties; children?: React.ReactNode}> = ({f, n, x, y, size, from = 0, src = 0, loop = true, tag = true, border = STEEL, style, children}) => {
  const v = <OffthreadVideo src={CLIP(n)} muted trimBefore={Math.round(src * 30)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />;
  return <div style={{position: 'absolute', left: x, top: y, width: size, height: size, overflow: 'hidden', background: '#fff', outline: `3px solid ${border}`, ...style}}>
    {f >= from && <Sequence from={from} layout="none">{loop ? <Loop durationInFrames={84} layout="none">{v}</Loop> : v}</Sequence>}
    {children}
    {tag && <AiTag />}
  </div>;
};
const Pic: React.FC<{n: string; x?: number; y: number; w: number; h?: number; fit?: 'cover' | 'contain'; bg?: string; tag?: boolean; border?: string;
  imgStyle?: React.CSSProperties; style?: React.CSSProperties; children?: React.ReactNode}> = ({n, x = 0, y, w, h, fit = 'cover', bg = '#fff', tag = true, border = STEEL,
  imgStyle, style, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h ?? w, overflow: 'hidden', background: bg, outline: border ? `3px solid ${border}` : undefined, ...style}}>
    <Img src={IMG(n)} style={{display: 'block', width: '100%', height: '100%', objectFit: fit, ...imgStyle}} />
    {children}
    {tag && <AiTag />}
  </div>
);
const Ring: React.FC<{f: number; at: number; x: number; y: number; r?: number; c?: string}> = ({f, at, x, y, r = 50, c = RED}) => (
  f >= at ? <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: r, border: `7px solid ${c}`, ...popIn(f, at),
    transformOrigin: '50% 50%', boxShadow: `0 0 18px ${c}`}} /> : null
);

/* ---------- chat mock (generic UI, demo conversation, no real contacts) ---------- */

type ChatItem = {at: number; msg?: string; sticker?: string; row?: string[]; x?: number};
const Chat: React.FC<{f: number; items: ChatItem[]; y: number; h: number; bg?: string}> = ({f, items, y, h, bg = '#16181f'}) => (
  <div style={{position: 'absolute', left: 0, top: y, width: W, height: h, overflow: 'hidden', background: bg, outline: `3px solid ${LINE}`, borderRadius: 18}}>
    <div style={{height: 84, background: '#22252e', color: '#e6e8ee', fontFamily: font, fontWeight: 700, fontSize: 44, lineHeight: '84px', textAlign: 'center'}}>工作群（示范对话）</div>
    <div style={{padding: '24px 30px', display: 'flex', flexDirection: 'column', gap: 18}}>
      {items.map((it, i) => f >= it.at - 1 && (it.msg
        ? <div key={i} style={{alignSelf: 'flex-start', ...popIn(f, it.at), transformOrigin: '0% 50%', background: '#30343f', color: '#eef0f4', fontFamily: font,
          fontWeight: 700, fontSize: 44, padding: '14px 26px', borderRadius: 22, whiteSpace: 'nowrap'}}>{it.msg}</div>
        : <div key={i} style={{alignSelf: 'flex-end', marginRight: it.x ?? 20, display: 'flex', gap: 10}}>
          {(it.row ?? [it.sticker ?? '']).map((n, j) => <div key={n} style={{...popIn(f, it.at + j * 5), transformOrigin: '100% 100%'}}>
            <Img src={IMG(`${n}.png`)} style={{display: 'block', width: 260, height: 260, transformOrigin: '50% 100%',
              transform: `rotate(${4 * Math.sin((f + i * 11 + j * 7) / 7)}deg) translateY(${-8 * Math.abs(Math.sin((f + i * 11 + j * 7) / 9))}px)`}} />
          </div>)}
        </div>))}
    </div>
  </div>
);

/* ---------- 1 hook: one character → a whole sticker set, transparent ---------- */

const hookPlan = (cue: Cue) => ({a: cue('a', 76), b: cue('b', 121), c: cue('c', 153)});
// frame 0 already shows the first message and sticker (they "popped" before the video starts); the rest pop in over 0.6 s
const HOOK_CHAT: ChatItem[] = [{at: -14, msg: '方案发你了，帮忙看下'}, {at: -10, sticker: 'C03a'}, {at: 4, msg: '改好了，辛苦啦'}, {at: 9, row: ['C04a', 'C05a']}];
const BGS = ['#16181f', '#f3f1ea', '#ff7a3d', '#2a6be0'];
const Hook: Scene = ({f, cue}) => {
  const p = hookPlan(cue);
  const swap = f >= p.b ? Math.floor((f - p.b) / 10) % BGS.length : 0;
  return <Root>
    <Abs y={-10} w={W}><Big size={84} style={{whiteSpace: 'nowrap'}}>一张图 → <span style={{color: A}}>一整套表情包</span></Big></Abs>
    <Chat f={f} y={120} h={900} items={HOOK_CHAT} bg={BGS[swap]} />
    {f >= p.b - 1 && f < p.c && <Abs x={20} y={300}><Pop f={f} at={p.b}><Chip c={GREEN} size={64} fill>还是透明底 ✓</Chip></Pop></Abs>}
    {f >= p.c - 2 && <Clip f={f} n="V05" x={180} y={190} size={540} from={p.c - 2} border={A} style={popIn(f, p.c)} />}
    {f >= p.c && <Abs y={760} w={W} style={{textAlign: 'center'}}><Pop f={f} at={p.c + 8} origin="50% 50%"><Chip c={A} size={56} fill>任何生图模型都能用</Chip></Pop></Abs>}
  </Root>;
};
Hook.sfx = (cue) => {
  const p = hookPlan(cue);
  return [{at: 4, kind: 'tick', gain: 0.1}, {at: 9, kind: 'pop', gain: 0.12}, {at: 14, kind: 'pop', gain: 0.14}, {at: p.b, kind: 'tick', gain: 0.1},
    {at: p.c, kind: 'whoosh-short', gain: 0.1}];
};

/* ---------- 2 master: a text-free master first ---------- */

const masterPlan = (cue: Cue) => ({a: cue('a', 85), b: cue('b', 116), c: cue('c', 148), d: cue('d', 172), e: cue('e', 208)});
const PROMPT: {t: string; key?: 'b' | 'c' | 'd' | 'e'}[] = [{t: '原创聊天表情角色，短发、圆眼镜、绿色圆领上衣，'}, {t: '正面半身', key: 'b'}, {t: '，'},
  {t: '粗线条平涂', key: 'd'}, {t: '，五官简洁，轮廓清楚。'}, {t: '白色背景', key: 'c'}, {t: '，人物四周留空，'}, {t: '下方预留文字区', key: 'e'}, {t: '。只画一个人物，不加文字。'}];
const Master: Scene = ({f, cue}) => {
  const p = masterPlan(cue);
  const keys = [{t: '正面半身', at: p.b}, {t: '纯色背景', at: p.c}, {t: '粗线条平涂', at: p.d}, {t: '下方留字', at: p.e}];
  return <Root>
    <Abs y={-10} w={W}><Big size={72} style={{whiteSpace: 'nowrap'}}>先出一张<span style={{color: A}}>不带字</span>的定稿</Big></Abs>
    <Clip f={f} n="V01" x={0} y={120} size={500}>
      {f >= p.e && <div style={{position: 'absolute', left: 30, right: 30, bottom: 8, height: 70, border: `5px dashed ${A}`, ...popIn(f, p.e), transformOrigin: '50% 50%'}} />}
      {f >= p.a && <div style={{position: 'absolute', left: 12, top: 12}}><Pop f={f} at={p.a}><Chip c={B} size={44} fill>定稿 · 无字</Chip></Pop></div>}
    </Clip>
    <Abs x={530} y={120} w={370} style={{display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'flex-start'}}>
      {keys.map((k) => <Pop key={k.t} f={f} at={k.at}><Chip c={B} size={52}>{k.t}</Chip></Pop>)}
    </Abs>
    <Abs y={660} w={W} style={{...phaseOp(f, 10), border: `3px solid ${LINE}`, background: PANEL, padding: '18px 24px'}}>
      <div style={{fontFamily: font, fontWeight: 700, fontSize: 40, color: DIM, marginBottom: 6}}>提示词（中文版）</div>
      <div style={{fontFamily: font, fontWeight: 700, fontSize: 42, lineHeight: 1.45, color: INK}}>
        {PROMPT.map((s, i) => {
          const start = PROMPT.slice(0, i).reduce((n, x) => n + x.t.length, 0);
          const shown = Math.max(0, Math.min(s.t.length, Math.floor(f * 1.0) - start));
          return <span key={i} style={s.key && f >= p[s.key] ? {color: BG, background: B} : undefined}>{s.t.slice(0, shown)}</span>;
        })}
      </div>
    </Abs>
  </Root>;
};
Master.sfx = (cue) => {
  const p = masterPlan(cue);
  return [{at: p.a, kind: 'stamp', gain: 0.12}, ...[p.b, p.c, p.d, p.e].map((at) => ({at, kind: 'tick', gain: 0.1}))];
};

/* ---------- 3 shrink check: the detailed one turns to mush when small ---------- */

const shrinkPlan = (cue: Cue) => ({a: cue('a', 30), b: cue('b', 55), c: cue('c', 104)});
const Shrink: Scene = ({f, cue}) => {
  const p = shrinkPlan(cue);
  const k = ease.inOutCubic(clamp((f - p.a) / 18));
  const size = 420 - (420 - 105) * k; // ¼ of the side
  return <Root>
    <Abs y={-10} w={W}><Big size={72} style={{whiteSpace: 'nowrap'}}>缩小看：糊了就<span style={{color: A}}>减细节</span></Big></Abs>
    {[{n: 'C03w.png', x: 0, ok: true, label: '简洁'}, {n: 'A00.jpg', x: 470, ok: false, label: '细节多'}].map((s) => <React.Fragment key={s.n}>
      <Abs x={s.x} y={130}><Chip c={s.ok ? B : DIM} size={48}>{s.label}</Chip></Abs>
      <Pic n={s.n} x={s.x + (420 - size) / 2} y={230 + (420 - size) / 2} w={size} tag={false} border={f >= p.b ? (s.ok ? GREEN : RED) : STEEL} />
      {f >= p.b && <Abs x={s.x + 160} y={480}><Pop f={f} at={p.b + (s.ok ? 8 : 0)} origin="50% 50%"><Mark ok={s.ok} /></Pop></Abs>}
    </React.Fragment>)}
    {f >= p.a && <Abs y={680} w={W} style={{textAlign: 'center'}}><Pop f={f} at={p.a} origin="50% 50%"><Chip c={INK} size={52}>缩到 1/4</Chip></Pop></Abs>}
    <Abs y={800} w={W} style={{display: 'flex', gap: 16, flexWrap: 'wrap'}}>
      <Pop f={f} at={p.b}><Chip c={RED} size={52}>眼镜嘴巴糊成一团</Chip></Pop>
      <Pop f={f} at={p.c}><Chip c={A} size={52} fill>→ 减少细节</Chip></Pop>
    </Abs>
    <AiTag style={{bottom: 0}} />
  </Root>;
};
Shrink.sfx = (cue) => {
  const p = shrinkPlan(cue);
  return [{at: p.a, kind: 'whoosh-short', gain: 0.1}, {at: p.b, kind: 'block', gain: 0.12}, {at: p.b + 8, kind: 'tick', gain: 0.1}, {at: p.c, kind: 'pop', gain: 0.12}];
};

/* ---------- 4 same reference every time; only the last action line changes ---------- */

const refPlan = (cue: Cue) => ({a: cue('a', 54), b: cue('b', 124), c: cue('c', 218)});
const SLOTS = [{n: 'V02', t: '举手比OK', x: 380, y: 120}, {n: 'V03', t: '举着手机看', x: 650, y: 120}, {n: 'V04', t: '双手合十', x: 380, y: 450},
  {n: 'V06', t: '竖食指', x: 650, y: 450}];
const Ref: Scene = ({f, cue}) => {
  const p = refPlan(cue);
  return <Root>
    <Pic n="A01.png" x={0} y={160} w={330} border={A} />
    <Abs x={0} y={110}><Chip c={A} size={44} fill>定稿 · 参考图</Chip></Abs>
    <svg width={W} height={800} style={{position: 'absolute', left: 0, top: 0}}>
      {SLOTS.map((s, i) => {
        const k = ease.inOutCubic(clamp((f - p.a - i * 6) / 10));
        const x1 = 330, y1 = 325, x2 = s.x, y2 = s.y + 125;
        return <line key={s.n} x1={x1} y1={y1} x2={x1 + (x2 - x1) * k} y2={y1 + (y2 - y1) * k} stroke={A} strokeWidth={6} strokeDasharray="14 10" opacity={k > 0 ? 1 : 0} />;
      })}
    </svg>
    {SLOTS.map((s, i) => {
      const at = p.a + i * 8;
      return <React.Fragment key={s.n}>
        <div style={{position: 'absolute', left: s.x, top: s.y, width: 250, height: 250, border: `4px dashed ${LINE}`}} />
        {f >= at && <Clip f={f} n={s.n} x={s.x} y={s.y} size={250} from={at} tag={false} style={popIn(f, at)} />}
        {f >= at && <Abs x={s.x} y={s.y + 258} w={250} style={{textAlign: 'center', fontFamily: font, fontWeight: 900, fontSize: 40, color: f >= p.c ? A : INK,
          whiteSpace: 'nowrap', ...popIn(f, at + 4), transformOrigin: '50% 0%'}}>{s.t}</Abs>}
      </React.Fragment>;
    })}
    <Abs y={790} w={W} style={{display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'flex-start'}}>
      <Pop f={f} at={p.b}><Chip c={B} size={56}>固定特征不变：发型 · 眼镜 · 衣服</Chip></Pop>
      <Pop f={f} at={p.c}><Chip c={A} size={56} fill>只换最后一句动作</Chip></Pop>
    </Abs>
    <AiTag style={{bottom: 300}} />
  </Root>;
};
Ref.sfx = (cue) => {
  const p = refPlan(cue);
  return [...[0, 1, 2, 3].map((i) => ({at: p.a + i * 8, kind: 'pop', gain: 0.1})), {at: p.b, kind: 'tick', gain: 0.1}, {at: p.c, kind: 'stamp', gain: 0.12}];
};

/* ---------- 5 don't chain from the newest image; redo only the drifted one ---------- */

const chainPlan = (cue: Cue) => ({a: cue('a', 73), b: cue('b', 117), c: cue('c', 149)});
// drift, drawn as a growing hue / shape shift on copies of the master (a diagram of the idea, not a real generation)
const DRIFT = [0, 30, 70, 120];
const Chain: Scene = ({f, cue}) => {
  const p = chainPlan(cue);
  const bar = ease.inOutCubic(clamp((f - p.a) / 30));
  const fixed = f >= p.c + 6;
  return <Root>
    <Abs y={-10} w={W}><Chip c={RED} size={52}>✗ 拿上一张新图当参考</Chip></Abs>
    {DRIFT.map((d, i) => <React.Fragment key={i}>
      {i > 0 && f >= i * 8 && <Abs x={i * 232 - 40} y={190} w={40}><Big size={52} c={DIM} w={40}>→</Big></Abs>}
      {f >= i * 8 && <Pic n="A01.png" x={i * 232} y={110} w={190} tag={false} border={i ? RED : A} style={popIn(f, i * 8)}
        imgStyle={{filter: `hue-rotate(${d}deg) saturate(${1 + i * 0.4})`, transform: `scale(${1 + i * 0.08}, ${1 - i * 0.06}) rotate(${i * 3}deg)`}} />}
    </React.Fragment>)}
    <Abs y={320} w={W} style={{display: 'flex', alignItems: 'center', gap: 16}}>
      <div style={{flex: 1, height: 34, background: PANEL, border: `2px solid ${LINE}`}}><div style={{height: '100%', width: `${bar * 100}%`, background: RED}} /></div>
      <Pop f={f} at={p.a}><Chip c={RED} size={48} fill>偏差越传越大</Chip></Pop>
    </Abs>
    {f >= p.b - 1 && <>
      <Abs y={430} w={W} style={phaseOp(f, p.b)}><Chip c={GREEN} size={52}>✓ 每次都用同一张定稿</Chip></Abs>
      <Pic n="A01.png" x={0} y={530} w={240} tag={false} border={A} style={popIn(f, p.b)} />
      <svg width={W} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
        {[0, 1, 2].map((i) => <line key={i} x1={240} y1={650} x2={340 + i * 190 + 80} y2={560 + (i === 1 ? 260 : 0) + 80} stroke={GREEN} strokeWidth={5}
          opacity={clamp((f - p.b - 4 - i * 4) / 6)} />)}
      </svg>
      {['A02.png', 'A04.png', 'A06.png'].map((n, i) => {
        const at = p.b + 4 + i * 4;
        const drifted = i === 2 && f >= p.b + 20 && !fixed;
        return f >= at ? <React.Fragment key={n}>
          <Pic n={n} x={340 + i * 190} y={560 + (i === 1 ? 260 : 0)} w={160} tag={false} border={drifted ? RED : GREEN} style={popIn(f, i === 2 && fixed ? p.c + 6 : at)}
            imgStyle={drifted ? {filter: 'hue-rotate(120deg) saturate(1.8)', transform: 'scale(1.15, 0.9) rotate(6deg)'} : undefined} />
        </React.Fragment> : null;
      })}
    </>}
    <Abs x={330} y={930} w={570}><Pop f={f} at={p.c}><Chip c={A} size={52} fill>跑偏只重做那张</Chip></Pop></Abs>
    <AiTag style={{bottom: 160}} />
  </Root>;
};
Chain.sfx = (cue) => {
  const p = chainPlan(cue);
  return [...[0, 8, 16, 24].map((at) => ({at, kind: 'tick', gain: 0.08})), {at: p.a, kind: 'block', gain: 0.12}, {at: p.b, kind: 'whoosh-short', gain: 0.1},
    {at: p.c + 6, kind: 'pop', gain: 0.12}];
};

/* ---------- 6 Alpha channel: every pixel stores its transparency ---------- */

const alphaPlan = (cue: Cue) => ({a: cue('a', 90), b: cue('b', 143)});
// an illustrative 4 × 4 block across an outline: opaque inside, soft edge, transparent outside (8-bit alpha)
const GRID = [[255, 255, 160, 0], [255, 255, 96, 0], [255, 200, 40, 0], [255, 128, 0, 0]];
const Alpha: Scene = ({f, cue}) => {
  const p = alphaPlan(cue);
  const zoom = ease.inOutCubic(clamp((f - p.a + 10) / 20));
  return <Root>
    <Abs y={-10} w={W}><Big size={76} style={{whiteSpace: 'nowrap'}}>透明靠 <span style={{color: A, fontFamily: mono}}>Alpha</span> 通道</Big></Abs>
    <div style={{position: 'absolute', left: 150 * (1 - zoom), top: 130, width: 600 - 200 * zoom, height: 600 - 200 * zoom, ...checker(25), outline: `3px solid ${STEEL}`}}>
      <Img src={IMG('B01.png')} style={{width: '100%', height: '100%', transform: `scale(${1 + 0.06 * clamp(f / 180)})`}} />
      <div style={{position: 'absolute', left: '62%', top: '10%', width: '22%', height: '22%', border: `5px solid ${A}`, opacity: zoom}} />
      <AiTag />
    </div>
    {f >= p.a - 10 && <div style={{position: 'absolute', left: 460, top: 130, width: 440, height: 440, ...checker(20), outline: `4px solid ${A}`, opacity: zoom,
      transform: `scale(${0.4 + 0.6 * zoom})`, transformOrigin: '0% 0%'}}>
      {GRID.map((row, r) => row.map((a, c) => <div key={`${r}-${c}`} style={{position: 'absolute', left: c * 110, top: r * 110, width: 110, height: 110,
        background: `rgba(30,30,30,${a / 255})`, outline: `1px solid ${LINE}`, color: a > 120 ? '#fff' : '#1a1a1a', fontFamily: mono, fontWeight: 800, fontSize: 40,
        lineHeight: '110px', textAlign: 'center', opacity: clamp((f - p.a - 6 - (r + c) * 2) / 6)}}>{a}</div>))}
    </div>}
    <Abs y={640} w={W} style={{display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start'}}>
      <Pop f={f} at={p.a + 10}><Chip c={INK} size={58}><span style={{fontFamily: mono}}>A = 0</span>{'\u3000'}透明</Chip></Pop>
      <Pop f={f} at={p.a + 22}><Chip c={B} size={58}><span style={{fontFamily: mono}}>A = 255</span>{'\u3000'}不透明</Chip></Pop>
      <Pop f={f} at={p.b}><Chip c={A} size={58} fill>中间 = 半透明</Chip></Pop>
    </Abs>
  </Root>;
};
Alpha.sfx = (cue) => {
  const p = alphaPlan(cue);
  return [{at: p.a, kind: 'whoosh-short', gain: 0.1}, {at: p.a + 10, kind: 'tick', gain: 0.1}, {at: p.a + 22, kind: 'tick', gain: 0.1}, {at: p.b, kind: 'pop', gain: 0.12}];
};

/* ---------- 7 asked for transparent, got white → plain background, then remove it ---------- */

const whitePlan = (cue: Cue) => ({a: cue('a', 93), b: cue('b', 138), c: cue('c', 195), d: cue('d', 234)});
const White: Scene = ({f, cue}) => {
  const p = whitePlan(cue);
  const phase = f < p.a ? 0 : f < p.c ? 1 : 2;
  const wipe = ease.inOutCubic(clamp((f - p.d) / 16));
  return <Root>
    {phase === 0 && <>
      <Abs y={-10} w={W}><Big size={72} style={{whiteSpace: 'nowrap'}}>有的模型：直接出 <span style={{color: GREEN}}>透明 PNG</span></Big></Abs>
      <div style={{position: 'absolute', left: 150, top: 150, width: 600, height: 600, ...checker(30), outline: `3px solid ${STEEL}`, ...phaseOp(f, 0)}}>
        <Img src={IMG('B05.png')} style={{width: '100%', height: '100%', transform: `translateY(${-10 * Math.abs(Math.sin(f / 9))}px)`}} />
        <AiTag />
      </div>
    </>}
    {phase === 1 && <>
      <Abs y={-10} w={W}><Big size={72} style={{whiteSpace: 'nowrap'}}>说了透明 <span style={{color: RED}}>≠</span> 真透明</Big></Abs>
      <Abs y={120} w={W} style={{...phaseOp(f, p.a), border: `4px solid ${B}`, background: PANEL, padding: '16px 22px'}}>
        <div style={{fontFamily: font, fontWeight: 700, fontSize: 40, color: DIM}}>提示词</div>
        <div style={{fontFamily: font, fontWeight: 700, fontSize: 44, lineHeight: 1.4, color: INK}}>同一个角色……<span style={{color: BG, background: B}}>透明背景，PNG</span>。只画一个人物，不加文字。</div>
      </Abs>
      <Clip f={f} n="V07" x={170} y={380} size={560} from={p.a} loop={false} style={phaseOp(f, p.a)}>
        {f >= p.b && <div style={{position: 'absolute', left: 30, top: 30, rotate: '-8deg'}}><Pop f={f} at={p.b}><Chip c={RED} size={60} fill>返回：白底 JPG</Chip></Pop></div>}
      </Clip>
    </>}
    {phase === 2 && <>
      <Abs y={-10} w={W} style={{display: 'flex', alignItems: 'center', gap: 16}}>
        <Chip c={INK} size={60}>纯色底</Chip><Big size={60} c={DIM} w={60}>→</Big><Pop f={f} at={p.d}><Chip c={GREEN} size={60} fill>去背景</Chip></Pop>
      </Abs>
      <div style={{position: 'absolute', left: -60, top: 130, width: 1080, height: 820, background: '#2a6be0', overflow: 'hidden', ...phaseOp(f, p.c)}}>
        <Img src={IMG('A07.png')} style={{position: 'absolute', left: 230, top: 90, width: 620, height: 620, clipPath: `inset(0 0 0 ${wipe * 100}%)`}} />
        <Img src={IMG('B01.png')} style={{position: 'absolute', left: 230, top: 90, width: 620, height: 620, clipPath: `inset(0 ${(1 - wipe) * 100}% 0 0)`}} />
        {f >= p.d && <div style={{position: 'absolute', top: 60, bottom: 60, width: 8, left: 230 + 620 * wipe, background: A, opacity: wipe < 1 ? 1 : 0}} />}
        <div style={{position: 'absolute', left: 30, bottom: 24}}><Chip c={f >= p.d + 16 ? GREEN : RED} size={48} fill>{f >= p.d + 16 ? '换底：干净 ✓' : '换底：带白框 ✗'}</Chip></div>
        <AiTag />
      </div>
    </>}
  </Root>;
};
White.sfx = (cue) => {
  const p = whitePlan(cue);
  return [{at: p.a, kind: 'whoosh-short', gain: 0.1}, {at: p.b, kind: 'stamp', gain: 0.16}, {at: p.c, kind: 'whoosh-short', gain: 0.1}, {at: p.d, kind: 'whoosh', gain: 0.1}];
};

/* ---------- 8 a checkerboard painted into the pixels is just a background ---------- */

const fakePlan = (cue: Cue) => ({a: cue('a', 13), b: cue('b', 68)});
const Fake: Scene = ({f, cue}) => {
  const p = fakePlan(cue);
  const s = 1080 / 1440;
  return <Root>
    <Abs y={-10} w={W}><Big size={64} style={{whiteSpace: 'nowrap'}}>棋盘格画进图里 = <span style={{color: RED}}>假透明</span></Big></Abs>
    <Pic n="D03.jpg" x={-60} y={130} w={1080} h={645} imgStyle={{transform: `scale(${1 + 0.05 * clamp(f / 110)})`}}>
      {f >= p.a && <div style={{position: 'absolute', left: 30 * s, top: 180 * s, width: 640 * s, height: 640 * s, border: `7px solid ${RED}`, ...popIn(f, p.a),
        transformOrigin: '50% 50%'}} />}
      <div style={{position: 'absolute', left: 260, top: 30}}><Pop f={f} at={p.a} origin="50% 50%"><Mark ok={false} /></Pop></div>
      <div style={{position: 'absolute', left: 830, top: 30}}><Pop f={f} at={p.b} origin="50% 50%"><Mark ok /></Pop></div>
    </Pic>
    <Abs y={810} w={W} style={{display: 'flex', gap: 16}}>
      <Pop f={f} at={p.a + 6}><Chip c={RED} size={52}>只是普通背景</Chip></Pop>
      <Pop f={f} at={p.b}><Chip c={GREEN} size={52} fill>真透明</Chip></Pop>
    </Abs>
  </Root>;
};
Fake.sfx = (cue) => {
  const p = fakePlan(cue);
  return [{at: p.a, kind: 'block', gain: 0.14}, {at: p.b, kind: 'pop', gain: 0.12}];
};

/* ---------- 9 test on dark / light / colour ---------- */

const bgPlan = (cue: Cue) => ({a: cue('a', 81), b: cue('b', 99), c: cue('c', 119), d: cue('d', 144)});
const BgTest: Scene = ({f, cue}) => {
  const p = bgPlan(cue);
  const s = 1080 / 1280;
  const rows = [{t: '深色', at: p.a}, {t: '浅色', at: p.b}, {t: '彩色', at: p.c}];
  return <Root>
    <Abs y={-10} w={W}><Big size={64} style={{whiteSpace: 'nowrap'}}>深色 · 浅色 · 彩色 底都试一遍</Big></Abs>
    {f < p.a && <div style={{position: 'absolute', left: 150, top: 160, width: 600, height: 600, ...checker(30), outline: `3px solid ${STEEL}`, ...phaseOp(f, 0)}}>
      <Img src={IMG('C02a.png')} style={{width: '100%', height: '100%', transform: `scale(${1 + 0.08 * clamp(f / 80)})`}} />
      <AiTag />
    </div>}
    {f >= p.a - 2 && <div style={{position: 'absolute', left: -60, top: 130, width: 1080, height: 648, overflow: 'hidden', outline: `3px solid ${STEEL}`, background: BG}}>
      <Img src={IMG('D01.jpg')} style={{width: '100%', height: '100%', transform: `scale(${1 + 0.06 * clamp((f - p.a) / 90)})`, transformOrigin: '20% 30%'}} />
      {rows.map((r, i) => <div key={r.t} style={{position: 'absolute', left: 0, right: 0, top: i * 216, height: 216, background: BG, opacity: 1 - clamp((f - r.at) / 8)}} />)}
      {rows.map((r, i) => f >= r.at && <div key={`l${r.t}`} style={{position: 'absolute', right: 10, top: i * 216 + 10}}><Pop f={f} at={r.at} origin="100% 0%">
        <Chip c={A} size={44} fill>{r.t}</Chip></Pop></div>)}
      <Ring f={f} at={p.d} x={90 * s} y={130 * s} r={60} c={A} />
      <AiTag />
    </div>}
    <Abs y={820} w={W}><Pop f={f} at={p.d}><Chip c={A} size={60} fill>看有没有白边</Chip></Pop></Abs>
  </Root>;
};
BgTest.sfx = (cue) => {
  const p = bgPlan(cue);
  return [p.a, p.b, p.c].map((at) => ({at, kind: 'tick', gain: 0.12})).concat([{at: p.d, kind: 'pop', gain: 0.12}]);
};

/* ---------- 10 don't delete every white pixel: teeth and eye highlights get punched through ---------- */

const punchPlan = (cue: Cue) => ({a: cue('a', 70), b: cue('b', 111)});
const Punch: Scene = ({f, cue}) => {
  const p = punchPlan(cue);
  const s = 1080 / 1440;
  const zoom = 1 + 0.5 * ease.inOutCubic(clamp((f - p.a) / 16)) * (1 - ease.inOutCubic(clamp((f - p.b - 10) / 16)));
  return <Root>
    <Abs y={-10} w={W}><Big size={68} style={{whiteSpace: 'nowrap'}}>别<span style={{color: RED}}>一键删掉</span>所有白色</Big></Abs>
    <Pic n="D02.jpg" x={-60} y={130} w={1080} h={540} bg={BG} imgStyle={{transform: `scale(${zoom})`, transformOrigin: '31% 55%'}}>
      {zoom < 1.05 && <>
        <Ring f={f} at={p.b + 20} x={445 * s} y={465 * s} r={45} />
        <Ring f={f} at={p.b + 24} x={364 * s} y={351 * s} r={30} />
        <Ring f={f} at={p.b + 28} x={537 * s} y={351 * s} r={30} />
      </>}
    </Pic>
    <Abs y={700} w={W} style={{display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'flex-start'}}>
      <Pop f={f} at={6}><Chip c={RED} size={54}>一键删白色 ✗</Chip></Pop>
      <Pop f={f} at={p.a}><Chip c={RED} size={54} fill>牙齿眼睛被抠穿</Chip></Pop>
      <Pop f={f} at={p.b}><Chip c={GREEN} size={54} fill>从边缘抠背景 ✓</Chip></Pop>
    </Abs>
  </Root>;
};
Punch.sfx = (cue) => {
  const p = punchPlan(cue);
  return [{at: 6, kind: 'tick', gain: 0.1}, {at: p.a, kind: 'block', gain: 0.14}, {at: p.b, kind: 'pop', gain: 0.12}];
};

/* ---------- 11 ¼-size check: can you still read the words? ---------- */

const quarterPlan = (cue: Cue) => ({a: cue('a', 18), b: cue('b', 62), c: cue('c', 91), d: cue('d', 122)});
// left = a sketch of the failure (big figure, small caption), drawn here from A03; right = the finished sticker C03
const SmallText: React.FC = () => <div style={{position: 'relative', width: '100%', height: '100%', background: '#fff'}}>
  <Img src={IMG('A03.png')} style={{position: 'absolute', left: '-4%', top: '-4%', width: '108%', height: '108%'}} />
  <div style={{position: 'absolute', left: 0, right: 0, bottom: '3%', textAlign: 'center', fontFamily: font, fontWeight: 700, fontSize: '7%', color: '#222'}}>我马上看</div>
</div>;
const Quarter: Scene = ({f, cue}) => {
  const p = quarterPlan(cue);
  const k = ease.inOutCubic(clamp((f - p.a) / 18));
  const size = 420 - 315 * k;
  const tiles = [{x: 0, ok: false, el: <SmallText />}, {x: 480, ok: true, el: <Img src={IMG('C03w.png')} style={{width: '100%', height: '100%'}} />}];
  return <Root>
    <Abs y={-10} w={W}><Big size={72} style={{whiteSpace: 'nowrap'}}>缩到 <span style={{color: A}}>1/4</span> 还认得出字</Big></Abs>
    <div style={{position: 'absolute', left: 0, top: 130, width: W, height: 440, background: '#16181f', borderRadius: 18, opacity: k}}>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 12, textAlign: 'center', fontFamily: font, fontWeight: 700, fontSize: 40, color: DIM}}>聊天里的实际大小</div>
    </div>
    {tiles.map((t) => <React.Fragment key={t.x}>
      <div style={{position: 'absolute', left: t.x + (420 - size) / 2, top: 140 + (420 - size) / 2, width: size, height: size, overflow: 'hidden', borderRadius: 10,
        outline: `4px solid ${f >= p.b ? (t.ok ? GREEN : RED) : STEEL}`}}>{t.el}</div>
      {f >= (t.ok ? p.c : p.b) && <Abs x={t.x + 155} y={380}><Pop f={f} at={t.ok ? p.c : p.b} origin="50% 50%"><Mark ok={t.ok} /></Pop></Abs>}
    </React.Fragment>)}
    <Abs y={640} w={W} style={{display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'flex-start'}}>
      <Pop f={f} at={p.b}><Chip c={RED} size={64}>字认不出来</Chip></Pop>
      <div style={{display: 'flex', gap: 14}}>
        <Pop f={f} at={p.c}><Chip c={B} size={64}>人缩小</Chip></Pop>
        <Pop f={f} at={p.d}><Chip c={A} size={64} fill>字放大</Chip></Pop>
      </div>
    </Abs>
    <AiTag style={{bottom: 120}} />
  </Root>;
};
Quarter.sfx = (cue) => {
  const p = quarterPlan(cue);
  return [{at: p.a, kind: 'whoosh-short', gain: 0.1}, {at: p.b, kind: 'block', gain: 0.12}, {at: p.c, kind: 'pop', gain: 0.12}, {at: p.d, kind: 'pop', gain: 0.12}];
};

/* ---------- 12 text rules ---------- */

const textPlan = (cue: Cue) => ({a: cue('a', 32), b: cue('b', 60), c: cue('c', 84)});
const TextRules: Scene = ({f, cue}) => {
  const p = textPlan(cue);
  const s = 1080 / 1536;
  const line = ease.inOutCubic(clamp((f - p.c) / 14));
  return <Root>
    <Pic n="E01.jpg" x={-60} y={0} w={1080} h={720} tag={false} imgStyle={{transform: `scale(${1.04 - 0.04 * clamp(f / 115)})`}}>
      {[328, 690].map((y) => <div key={y} style={{position: 'absolute', left: 0, top: y * s, height: 6, width: `${line * 100}%`, background: A}} />)}
    </Pic>
    <Abs y={760} w={W} style={{display: 'flex', gap: 16, flexWrap: 'wrap'}}>
      <Pop f={f} at={p.a}><Chip c={A} size={64} fill>≤6个字</Chip></Pop>
      <Pop f={f} at={p.b}><Chip c={INK} size={64}>粗黑字</Chip></Pop>
      <Pop f={f} at={p.c}><Chip c={B} size={64}>位置统一</Chip></Pop>
    </Abs>
    <AiTag style={{right: -60, bottom: 'auto', top: 724}} />
  </Root>;
};
TextRules.sfx = (cue) => {
  const p = textPlan(cue);
  return [p.a, p.b, p.c].map((at) => ({at, kind: 'pop', gain: 0.12}));
};

/* ---------- 13 reuse: poster, video overlay, slides (our own mock-ups) ---------- */

const reusePlan = (cue: Cue) => ({a: cue('a', 82), b: cue('b', 101), c: cue('c', 145)});
const Reuse: Scene = ({f, cue}) => {
  const p = reusePlan(cue);
  const bob = (o: number) => `translateY(${-8 * Math.sin((f + o) / 8)}px)`;
  return <Root>
    <Abs y={-10} w={W}><Big size={72} style={{whiteSpace: 'nowrap'}}>透明角色 <span style={{color: A}}>接着用</span></Big></Abs>
    {f < p.a && <div style={{position: 'absolute', left: 200, top: 170, width: 500, height: 500, ...checker(25), outline: `3px solid ${STEEL}`, ...phaseOp(f, 0)}}>
      <Img src={IMG('B01.png')} style={{width: '100%', height: '100%', transform: bob(0)}} />
      <AiTag />
    </div>}
    {f >= p.a - 1 && <div style={{position: 'absolute', left: 0, top: 130, width: 420, height: 600, overflow: 'hidden', background: 'linear-gradient(160deg, #ff9a3d, #ff5e62)',
      ...popIn(f, p.a), transformOrigin: '50% 100%'}}>
      <div style={{padding: '30px 0 0', textAlign: 'center', fontFamily: font, fontWeight: 900, fontSize: 84, color: '#fff', textShadow: '0 4px 0 rgba(0,0,0,0.2)'}}>下班快乐</div>
      <Img src={IMG('B05.png')} style={{position: 'absolute', left: 10, bottom: -20, width: 400, height: 400, transform: bob(5)}} />
    </div>}
    {f >= p.b - 1 && <div style={{position: 'absolute', left: 450, top: 130, width: 450, height: 254, overflow: 'hidden', background: 'linear-gradient(135deg, #2b3a55, #10161f)',
      ...popIn(f, p.b), transformOrigin: '50% 50%'}}>
      <div style={{position: 'absolute', left: 170, top: 90, width: 0, height: 0, borderLeft: '50px solid rgba(255,255,255,0.8)', borderTop: '30px solid transparent',
        borderBottom: '30px solid transparent'}} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 10, background: '#444'}}><div style={{height: '100%', width: `${(f % 120) / 1.2}%`, background: RED}} /></div>
      <Img src={IMG('B02.png')} style={{position: 'absolute', right: -10, bottom: 4, width: 170, height: 170, transform: bob(9)}} />
    </div>}
    {f >= p.c - 1 && <div style={{position: 'absolute', left: 450, top: 420, width: 450, height: 254, overflow: 'hidden', background: '#f6f7f9', ...popIn(f, p.c),
      transformOrigin: '50% 50%'}}>
      <div style={{position: 'absolute', left: 24, top: 18, fontFamily: font, fontWeight: 900, fontSize: 44, color: '#1b2430'}}>本周进度</div>
      {[0, 1, 2].map((i) => <div key={i} style={{position: 'absolute', left: 24, top: 96 + i * 44, width: 200 - i * 40, height: 16, background: '#c9d1dc', borderRadius: 8}} />)}
      <Img src={IMG('B06.png')} style={{position: 'absolute', right: -10, bottom: -10, width: 210, height: 210, transform: bob(13)}} />
    </div>}
    <Abs y={770} w={W} style={{display: 'flex', gap: 16}}>
      <Pop f={f} at={p.a}><Chip c={A} size={60} fill>海报</Chip></Pop>
      <Pop f={f} at={p.b}><Chip c={B} size={60} fill>视频贴图</Chip></Pop>
      <Pop f={f} at={p.c}><Chip c={INK} size={60} fill>PPT</Chip></Pop>
    </Abs>
    {f >= p.a && <AiTag style={{bottom: 170}} />}
  </Root>;
};
Reuse.sfx = (cue) => {
  const p = reusePlan(cue);
  return [p.a, p.b, p.c].map((at) => ({at, kind: 'pop', gain: 0.12}));
};

/* ---------- 14 close: make four, try them in a chat ---------- */

const closePlan = (cue: Cue) => ({a: cue('a', 12), b: cue('b', 44)});
const Close: Scene = ({f, cue}) => {
  const p = closePlan(cue);
  return <Root>
    <Abs y={-10} w={W} style={{display: 'flex', alignItems: 'center', gap: 18}}>
      <Pop f={f} at={p.a}><Chip c={A} size={64} fill>先做四张</Chip></Pop>
      <Pop f={f} at={p.b}><Chip c={B} size={64}>发进聊天试试</Chip></Pop>
    </Abs>
    <Chat f={f} y={120} h={900} items={[{at: 0, msg: '方案发你了，帮忙看下'}, {at: p.b, sticker: 'C02a'}, {at: p.b + 20, msg: '好嘞'}, {at: p.b + 34, sticker: 'C06a'}]} />
    {f >= p.a && f < p.b + 6 && <Clip f={f} n="V02" x={200} y={420} size={500} from={p.a} border={A} style={{...popIn(f, p.a), opacity: 1 - clamp((f - p.b) / 6)}} />}
  </Root>;
};
Close.sfx = (cue) => {
  const p = closePlan(cue);
  return [{at: p.a, kind: 'tap', gain: 0.14}, {at: p.b, kind: 'pop', gain: 0.14}, {at: p.b + 34, kind: 'pop', gain: 0.12}];
};

/* ---------- covers (anchor box 880 × 800) ---------- */

const Cover67: Scene = () => <div style={{position: 'relative', width: 880, height: 800, display: 'flex', alignItems: 'center'}}>
  <Img src={IMG('E01.jpg')} style={{width: 880, height: 587, objectFit: 'cover', outline: `4px solid ${STEEL}`}} />
</div>;
const Cover34: Scene = () => <div style={{position: 'relative', width: 880, height: 800}}>
  <div style={{position: 'absolute', left: 200, top: 0, width: 600, height: 600, ...checker(30), outline: `4px solid ${STEEL}`}}>
    <Img src={IMG('C05a.png')} style={{width: '100%', height: '100%'}} />
  </div>
  <div style={{position: 'absolute', left: -60, top: 560, width: 240, height: 240, outline: `5px solid ${RED}`, overflow: 'hidden', background: '#2a6be0'}}>
    <Img src={IMG('D03a.jpg')} style={{width: '100%', height: '100%'}} />
    <div style={{position: 'absolute', right: 8, top: 8}}><Mark ok={false} size={90} /></div>
  </div>
</div>;

export const stickerAlphaScenes: Record<string, Scene> = {
  'sa.hook': Hook,
  'sa.master': Master,
  'sa.shrink': Shrink,
  'sa.ref': Ref,
  'sa.chain': Chain,
  'sa.alpha': Alpha,
  'sa.white': White,
  'sa.fake': Fake,
  'sa.bgtest': BgTest,
  'sa.punch': Punch,
  'sa.quarter': Quarter,
  'sa.text': TextRules,
  'sa.reuse': Reuse,
  'sa.close': Close,
  'sa.cover67': Cover67,
  'sa.cover34': Cover34,
};
