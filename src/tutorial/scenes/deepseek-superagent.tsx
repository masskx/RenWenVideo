import React from 'react';
import {Img, staticFile} from 'remotion';
import {clamp, ease} from '../../fx';
import {font} from '../theme';
import {inter, jet} from '../fonts';
import {Cue, Scene} from '../paper';
import {W} from '../package';

// deepseek-superagent, made on the template lemo/living-screencast (docs/video-craft/prompt-library/vendor/lemomo-ai__
// lemo-opuscar/3961ddb/styles/living-screencast/STYLE.md): the DeepSeek Harness team's article 《Super-agent 设计探索》
// (2026-10-31) — an architecture exploration, explicitly not a product announcement — and its MIT research prototype.
// Inputs: inputs/deepseek-superagent/ (materials.md, review.md — Eko approved with wording rules, sources.md, the full
// official text in assets/text/official-wechat-fulltext.txt).
// - What the template gives: the product's UI redrawn in 2D (here the official demo's group chat, transcribed verbatim from
//   the official image), a window floating on a soft wallpaper; a mascot of big square pixels that IS the software's
//   agency (the Router), living on the top edges of UI; "cell division" when new sessions open (the Workers); a chapter
//   pill; spotlight freeze (push-in + vignette) on the one line that holds the promise; captions in a frosted pill at the
//   bottom; the cursor is the user; 8-bit steps for the mascot over a hi-fi bed.
// - Customised (模板改造): the mascot's single saturated hue is DeepSeek's own diagram blue (#2460EA, the Router box in the
//   official figure) and it splits into three smaller Worker sprites; the "real UI" also includes evidence the template
//   would never show — the official results table and the prototype README, framed in the window with a spotlight;
//   borrowed from lemo/dataviz: two same-scale bars (12.4 vs 20.4 min, then 2323 万 vs 605 万 tokens); score is our
//   synthesized playful.
// - Review wording honoured: "架构思路 / 研究原型", never "new product"; the experiment is the team's own with synthetic
//   load and time scaled 1/4; "faster" is always followed by "more tokens"; P50 vs P50 (12.4 vs 20.4); the group-chat fix
//   came from a configured "静默复现并修复" policy (shown on screen).

const K = {wall0: '#EEF1F7', wall1: '#DCE2EE', win: '#FFFFFF', bar: '#F4F6FA', line: '#E1E5EE', ink: '#1C2333', dim: '#6B7385', blue: '#2460EA', bubble: '#ECF0FC', soft: '#C8D4F8'};
const A = (n: string) => staticFile(`video/deepseek-superagent/${n}`);
const WX = 50, WY = 230, WW = W - 100, WH = 990; // the app window

/* ---------- pixel sprites (one square-pixel grid) ---------- */
const ROUTER = [
  '....bbbb....',
  '..bbbbbbbb..',
  '.bbbbbbbbbb.',
  'kbbwwbbwwbbk',
  'kbbwebbwebbk',
  '.bbbbbbbbbb.',
  '.bbbbmmbbbb.',
  '..bbbbbbbb..',
  '..bb....bb..',
  '..bb....bb..',
];
const WORKER = [
  '..bbbbbb..',
  '.bbbbbbbb.',
  '.bwwbbwwb.',
  '.bweb.web.',
  '.bbbbbbbb.',
  '..bbbbbb..',
  '..b....b..',
];
const Sprite: React.FC<{rows: string[]; px: number; color?: string; eyes?: number; squash?: number}> = ({rows, px, color = K.blue, eyes = 0, squash = 0}) => {
  const C: Record<string, string> = {b: color, w: '#FFFFFF', e: K.ink, k: K.ink, m: '#FFFFFF'};
  return <svg width={rows[0].length * px} height={rows.length * px} style={{display: 'block', overflow: 'visible', transform: `scale(${1 + squash * 0.18},${1 - squash * 0.18})`, transformOrigin: '50% 100%'}} shapeRendering="crispEdges">
    {rows.flatMap((r, y) => [...r].map((ch, x) => {
      if (ch === '.') return null;
      const dx = ch === 'e' ? Math.round(eyes) : 0;
      return <rect key={`${x}-${y}`} x={(x + dx) * px} y={y * px} width={px} height={px} fill={C[ch]} />;
    }))}
  </svg>;
};

/* ---------- the stage: wallpaper, window, chapter pill ---------- */
const Wall: React.FC<{children: React.ReactNode}> = ({children}) => <div style={{position: 'absolute', inset: 0, background: `linear-gradient(160deg, ${K.wall0} 0%, ${K.wall1} 100%)`, overflow: 'hidden'}}>{children}</div>;
const Win: React.FC<{title: string; f: number; push?: number; origin?: string; children: React.ReactNode}> = ({title, f, push = 0.03, origin = '50% 40%', children}) => (
  <div style={{position: 'absolute', left: WX, top: WY, width: WW, height: WH, transform: `scale(${1 + push * clamp(f / 150)})`, transformOrigin: origin}}>
    <div style={{position: 'absolute', inset: 0, background: K.win, borderRadius: 22, boxShadow: '0 30px 70px rgba(28,35,51,0.22)', overflow: 'hidden'}}>
      <div style={{height: 70, background: K.bar, borderBottom: `1px solid ${K.line}`, display: 'flex', alignItems: 'center', gap: 12, padding: '0 26px'}}>
        {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => <div key={c} style={{width: 18, height: 18, borderRadius: 9, background: c}} />)}
        <div style={{marginLeft: 20, fontFamily: font, fontWeight: 700, fontSize: 30, color: K.dim}}>{title}</div>
      </div>
      <div style={{position: 'absolute', left: 0, top: 70, right: 0, bottom: 0}}>{children}</div>
    </div>
  </div>
);
const Pill: React.FC<{n: string; t: string; big?: boolean}> = ({n, t, big}) => <div style={{position: 'absolute', left: WX, top: big ? 96 : 120, display: 'flex', alignItems: 'center', gap: 16,
  background: 'rgba(255,255,255,0.75)', borderRadius: 50, padding: big ? '12px 34px 12px 14px' : '8px 26px 8px 10px', boxShadow: '0 6px 16px rgba(28,35,51,0.1)'}}>
  <span style={{fontFamily: jet, fontWeight: 500, fontSize: big ? 40 : 30, color: '#fff', background: K.blue, borderRadius: 40, padding: big ? '6px 18px' : '4px 14px'}}>{n}</span>
  <span style={{fontFamily: font, fontWeight: 900, fontSize: big ? 66 : 44, color: K.ink}}>{t}</span>
</div>;
const Tag: React.FC<{children: React.ReactNode; y?: number}> = ({children, y = WY + WH + 14}) => <div style={{position: 'absolute', left: WX + 230, right: WX, top: y, fontFamily: font, fontWeight: 700, fontSize: 28, color: K.dim}}>{children}</div>;
/** Spotlight freeze: darken everything but a rect (window coords). */
const Spot: React.FC<{x: number; y: number; w: number; h: number; p: number}> = ({x, y, w, h, p}) => p <= 0 ? null : <div style={{position: 'absolute', left: x - 10, top: y - 8, width: w + 20, height: h + 16, borderRadius: 12,
  boxShadow: `0 0 0 3000px rgba(28,35,51,${0.55 * p})`, outline: `4px solid rgba(36,96,234,${p})`}} />;

const make = (draw: NonNullable<Scene['backdrop']>, sfx?: Scene['sfx']): Scene => {
  const Sc: Scene = () => null;
  Sc.backdrop = draw;
  Sc.sfx = sfx;
  return Sc;
};

/* ---------- 1 hook: the group chat; nobody @-s it; it reads, reproduces in the background, files the PR ---------- */
const Msg: React.FC<{who: string; text: React.ReactNode; me?: boolean; quiet?: boolean; show?: number}> = ({who, text, me, quiet, show = 1}) => show <= 0 ? null : <div style={{display: 'flex', gap: 18, padding: '12px 30px', opacity: clamp(show * 2), transform: `translateY(${(1 - ease.outCubic(clamp(show))) * 16}px)`}}>
  <div style={{width: 64, height: 64, borderRadius: 14, flexShrink: 0, background: me ? K.blue : quiet ? K.line : '#C9CFDB', color: '#fff', fontFamily: font, fontWeight: 900, fontSize: 30, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{me ? 'S' : who.slice(-1)}</div>
  <div style={{flex: 1}}>
    <div style={{fontFamily: font, fontWeight: 700, fontSize: 28, color: me ? K.blue : K.dim}}>{who}</div>
    <div style={{fontFamily: font, fontWeight: quiet ? 600 : 700, fontSize: quiet ? 30 : 36, lineHeight: 1.38, color: quiet ? K.dim : K.ink, background: me ? K.bubble : quiet ? 'transparent' : '#F5F6F9',
      border: me ? `2px solid ${K.soft}` : 'none', borderRadius: 16, padding: quiet ? '4px 0' : '14px 20px', marginTop: 6}}>{text}</div>
  </div>
</div>;
const hookPlan = (cue: Cue) => ({a: cue('a', 33), b: cue('b', 74)});
const Hook = make(({f, cue}) => {
  const p = hookPlan(cue);
  // the mascot climbs out of the Super-agent avatar slot, runs along user A's message (reading), then works quietly
  const run = clamp((f - p.a) / 24);
  const mx = 130 + run * 700, my = 240 - (run > 0 && run < 1 ? Math.abs(Math.sin(run * Math.PI * 4)) * 26 : 0);
  return <Wall>
    <Pill n="01" t="没人 @ 它" big />
    <Win title="产品用户群 · 官方演示（转录）" f={f}>
      <Msg who="群内日常消息" quiet text="其他成员在群内讨论日常使用与功能建议，Super-agent 静默监听、不介入" />
      <Msg who="用户 A" text="在 macOS 桌面端，窗口未聚焦时点击会话会被识别为双击并进入重命名，我每天会误触发几十次。" />
      <Msg who="后台静默执行" quiet show={(f - p.a - 6) / 8} text={<span>无人 @ Super-agent，它识别出这是一条具体缺陷，在后台自动复现并排查代码 <span style={{fontFamily: jet, color: K.blue, background: K.bubble, padding: '0 10px', borderRadius: 8}}>▶▶ 后台</span></span>} />
      <Msg who="Super-agent" me show={(f - p.b) / 8} text={<span>已修复并提交 Pull Request，附前后对比截图。根因是 Electron 默认吞掉激活窗口的那次点击，下一次点击带 <span style={{fontFamily: jet}}>detail=2</span>，因此被识别为双击。</span>} />
      {f >= p.b + 10 && <div style={{position: 'absolute', left: 112, top: 800, display: 'flex', alignItems: 'center', gap: 14, background: '#fff', border: `2px solid ${K.line}`, borderRadius: 14, padding: '12px 20px', boxShadow: '0 8px 20px rgba(28,35,51,0.12)',
        transform: `scale(${ease.outBack(clamp((f - p.b - 10) / 8), 1.6)})`, transformOrigin: '0 50%'}}>
        <span style={{fontFamily: jet, fontSize: 30, color: '#1A7F37'}}>⬤ Pull Request</span><span style={{fontFamily: font, fontWeight: 800, fontSize: 32, color: K.ink}}>已提交 · 附对比截图</span>
      </div>}
      {f >= p.a && f < p.b + 8 && <div style={{position: 'absolute', left: mx, top: my}}><Sprite rows={ROUTER} px={9} eyes={run < 1 ? 1 : 0} squash={run >= 1 ? Math.max(0, 1 - (f - p.a - 24) / 5) : 0} /></div>}
    </Win>
    <Tag>DeepSeek 官方演示图（转录）· 官方为它配置了“静默复现并修复”策略</Tag>
  </Wall>;
}, (cue) => { const p = hookPlan(cue); return [{at: 0, kind: 'pop', gain: 0.08}, {at: p.a, kind: 'tick', gain: 0.07}, {at: p.a + 8, kind: 'tap', gain: 0.05}, {at: p.a + 16, kind: 'tap', gain: 0.05}, {at: p.b, kind: 'chime', gain: 0.1}]; });

/* ---------- 2 what: the article itself — its first line says what it is (spotlight freeze) ---------- */
const whatPlan = (cue: Cue) => ({a: cue('a', 101)});
const What = make(({f, cue}) => {
  const p = whatPlan(cue);
  const sp = ease.outCubic(clamp((f - p.a + 6) / 10));
  return <Wall>
    <Pill n="02" t="是什么" />
    <Win title="DeepSeek Harness 团队 · 公众号" f={f} push={sp * 0.06} origin="50% 55%">
      <div style={{padding: '50px 56px'}}>
        <div style={{fontFamily: font, fontWeight: 900, fontSize: 62, lineHeight: 1.3, color: K.ink}}>Super-agent 设计探索：<br />迈向更自主的 Agent 系统</div>
        <div style={{fontFamily: font, fontWeight: 700, fontSize: 30, color: K.dim, marginTop: 20}}>DeepSeek 产品部 · DeepSeek Harness 团队 · 2026-10-31</div>
        <div style={{position: 'relative', marginTop: 50, borderLeft: `6px solid ${K.line}`, padding: '10px 26px', fontFamily: font, fontWeight: 700, fontSize: 42, lineHeight: 1.55, color: '#3A4255'}}>
          本文是一篇面向工程实践的架构思路探讨，并非对 DeepSeek Harness 现有产品功能的介绍。
          <Spot x={-10} y={-4} w={WW - 150} h={150} p={sp} />
        </div>
        <div style={{fontFamily: font, fontWeight: 900, fontSize: 40, color: K.ink, marginTop: 50}}>1. Super-agent</div>
        <div style={{fontFamily: font, fontWeight: 600, fontSize: 34, lineHeight: 1.6, color: K.dim, marginTop: 14}}>过去一年里，以 Coding Agent 为代表的单任务 Agent 已经证明，模型能够使用工具解决复杂问题……</div>
      </div>
    </Win>
    <Tag>官方原文（转录）</Tag>
  </Wall>;
}, (cue) => { const p = whatPlan(cue); return [{at: 0, kind: 'fs-paper-slide', gain: 0.07}, {at: p.a - 6, kind: 'whoosh-short', gain: 0.06}]; });

/* ---------- 3 limit: one person, 3–5 sessions — cell division until attention runs out ---------- */
const limitPlan = (cue: Cue) => ({a: cue('a', 25)});
const Limit = make(({f, cue}) => {
  const p = limitPlan(cue);
  const n = Math.min(6, 1 + Math.floor(Math.max(0, f - 6) / 9));
  const focus = Math.floor(f / 7) % Math.min(n, 5);
  const cells = [[0, 0], [1, 0], [0, 1], [1, 1], [0, 2], [1, 2]];
  const cw = (WW - 90) / 2, ch = (WH - 70 - 120) / 3;
  return <Wall>
    <Pill n="03" t="人的注意力" />
    <Win title="Session 1 · Session 2 · Session 3 …" f={f}>
      {cells.slice(0, n).map(([cx, cy], i) => {
        const dim = i >= 5 ? 1 : i >= 3 ? 0.45 : 0;
        return <div key={i} style={{position: 'absolute', left: 30 + cx * (cw + 30), top: 30 + cy * (ch + 30), width: cw, height: ch, borderRadius: 16, border: `3px ${i >= 5 ? 'dashed' : 'solid'} ${i === focus && i < 5 ? K.blue : K.line}`,
          background: i >= 5 ? 'transparent' : '#F7F8FB', opacity: 1 - dim * 0.55}}>
          <div style={{padding: 22, fontFamily: jet, fontSize: 30, color: K.dim}}>Session {i + 1}</div>
          {i < 5 && [0, 1, 2].map((k) => <div key={k} style={{margin: '10px 22px', height: 18, borderRadius: 9, background: k === 2 ? K.soft : K.line, width: `${70 - k * 18}%`}} />)}
          {i >= 5 && <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font, fontWeight: 900, fontSize: 80, color: K.dim}}>?</div>}
        </div>;
      })}
      {/* the cursor: the person, hopping between sessions */}
      {(() => { const [cx, cy] = cells[focus]; const x = 30 + cx * (cw + 30) + cw - 80, y = 30 + cy * (ch + 30) + ch - 70; return <svg style={{position: 'absolute', left: x, top: y}} width={50} height={60}><path d="M4,2 L4,46 L16,34 L26,56 L34,52 L24,31 L42,31 Z" fill={K.ink} stroke="#fff" strokeWidth={3} /></svg>; })()}
      {f >= p.a && <div style={{position: 'absolute', right: 40, bottom: 34, background: K.ink, color: '#fff', borderRadius: 16, padding: '14px 26px', fontFamily: inter, fontWeight: 600, fontSize: 64, transform: `scale(${ease.outBack(clamp((f - p.a) / 8), 1.6)})`}}>3–5 <span style={{fontFamily: font, fontSize: 40}}>个会话</span></div>}
    </Win>
    <Tag>据官方观察（不是实验数据）</Tag>
  </Wall>;
}, (cue) => { const p = limitPlan(cue); return [0, 1, 2, 3, 4, 5].map((i) => ({at: 6 + i * 9, kind: 'pop', gain: 0.05})).concat([{at: p.a, kind: 'stamp', gain: 0.08}]); });

/* ---------- 4 router: two layers — the Router talks and dispatches, and doesn't do the work ---------- */
const routerPlan = (cue: Cue) => ({a: cue('a', 33), b: cue('b', 88)});
const SRC = ['IM', 'GitHub', '邮件 / 日程'];
const RouterSc = make(({f, cue}) => {
  const p = routerPlan(cue);
  return <Wall>
    <Pill n="04" t="两层：Router + Worker" />
    <Win title="双层架构 · 示意（据官方架构图）" f={f}>
      {SRC.map((s, i) => {
        const t = ((f - 10 - i * 11) % 50) / 50;
        return <React.Fragment key={s}>
          <div style={{position: 'absolute', left: 40, top: 150 + i * 230, width: 220, height: 110, borderRadius: 18, border: `3px solid ${K.line}`, background: '#F7F8FB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font, fontWeight: 800, fontSize: 38, color: K.ink}}>{s}</div>
          {f > 10 + i * 11 && <div style={{position: 'absolute', left: 270 + t * 160, top: 190 + i * 230 + (380 - (190 + i * 230)) * t, width: 34, height: 26, borderRadius: 6, background: K.soft, border: `2px solid ${K.blue}`}} />}
        </React.Fragment>;
      })}
      <div style={{position: 'absolute', left: 440, top: 300, width: 420, height: 330, borderRadius: 26, border: `4px solid ${K.blue}`, background: K.bubble}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 22, textAlign: 'center', fontFamily: inter, fontWeight: 600, fontSize: 50, color: K.blue}}>Router</div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 86, textAlign: 'center', fontFamily: font, fontWeight: 800, fontSize: 34, color: K.ink}}>{f >= p.a ? '沟通 · 派活' : '总管'}</div>
        <div style={{position: 'absolute', left: 156, top: 150, transform: `translateY(${Math.round(Math.sin(f / 5)) * 4}px)`}}><Sprite rows={ROUTER} px={9} eyes={Math.round(Math.sin(f / 9))} /></div>
      </div>
      {f >= p.b && <div style={{position: 'absolute', left: 520, top: 690, display: 'flex', alignItems: 'center', gap: 16, transform: `scale(${ease.outBack(clamp((f - p.b) / 8), 1.6)})`, transformOrigin: '0 50%'}}>
        <div style={{position: 'relative', fontFamily: jet, fontSize: 44, color: K.dim, border: `3px solid ${K.dim}`, borderRadius: 12, padding: '6px 18px'}}>$ bash
          <div style={{position: 'absolute', left: -10, right: -10, top: '50%', height: 6, background: '#D93025', transform: 'rotate(-12deg)'}} /></div>
        <div style={{fontFamily: font, fontWeight: 800, fontSize: 38, color: K.ink}}>自己不干活<br /><span style={{fontSize: 30, color: K.dim}}>甚至可以不配 Bash（据官方）</span></div>
      </div>}
    </Win>
    <Tag>示意 · 依据官方双层架构图</Tag>
  </Wall>;
}, (cue) => { const p = routerPlan(cue); return [{at: 10, kind: 'tick', gain: 0.05}, {at: 21, kind: 'tick', gain: 0.05}, {at: 32, kind: 'tick', gain: 0.05}, {at: p.a, kind: 'pop', gain: 0.07}, {at: p.b, kind: 'block', gain: 0.07}]; });

/* ---------- 5 worker: cell division — three isolated sessions; results report back to the Router ---------- */
const workerPlan = (cue: Cue) => ({a: cue('a', 62)});
const Worker = make(({f, cue}) => {
  const p = workerPlan(cue);
  return <Wall>
    <Pill n="05" t="Worker 隔离干活" />
    <Win title="双层架构 · 示意（据官方架构图）" f={f}>
      <div style={{position: 'absolute', left: 60, top: 360, width: 300, height: 260, borderRadius: 24, border: `4px solid ${K.blue}`, background: K.bubble}}>
        <div style={{textAlign: 'center', fontFamily: inter, fontWeight: 600, fontSize: 44, color: K.blue, marginTop: 16}}>Router</div>
        <div style={{position: 'absolute', left: 96, top: 100}}><Sprite rows={ROUTER} px={9} eyes={f >= p.a ? -1 : 1} /></div>
      </div>
      {[0, 1, 2].map((i) => {
        const born = ease.outBack(clamp((f - 4 - i * 8) / 10), 1.4);
        const prog = clamp((f - 16 - i * 8) / (p.a - 20));
        const y = 90 + i * 300;
        return <React.Fragment key={i}>
          {born > 0 && <div style={{position: 'absolute', left: 470, top: y, width: 440, height: 250, borderRadius: 20, border: `3px solid ${K.line}`, background: '#F7F8FB', transform: `scale(${born})`, transformOrigin: '0% 50%'}}>
            <div style={{padding: '16px 22px', fontFamily: jet, fontSize: 30, color: K.dim}}>Worker Session {i + 1}</div>
            <div style={{position: 'absolute', left: 22, top: 66, fontFamily: font, fontWeight: 700, fontSize: 28, color: K.dim}}>隔离上下文</div>
            <div style={{position: 'absolute', left: 22, right: 140, bottom: 34, height: 18, borderRadius: 9, background: K.line}}><div style={{width: `${prog * 100}%`, height: '100%', borderRadius: 9, background: K.blue}} /></div>
            <div style={{position: 'absolute', right: 26, bottom: 22, transform: `translateY(${Math.round(Math.sin(f / 3 + i)) * 3}px)`}}><Sprite rows={WORKER} px={8} color="#5A86F0" /></div>
          </div>}
          {f >= p.a + i * 5 && (() => { const t = clamp((f - p.a - i * 5) / 14); return <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1} height={1}>
            <path d={`M470,${y + 125} C420,${y + 125} 410,490 ${470 - 110 * t},490`} fill="none" stroke={K.blue} strokeWidth={5} strokeDasharray="14 10" />
          </svg>; })()}
        </React.Fragment>;
      })}
      {f >= p.a + 18 && <div style={{position: 'absolute', left: 60, top: 660, width: 300, fontFamily: font, fontWeight: 800, fontSize: 36, color: K.ink, textAlign: 'center'}}>汇报 → 由 Router<br />统一回复你</div>}
    </Win>
    <Tag>示意 · Worker 不直接回复用户（据官方原文）</Tag>
  </Wall>;
}, (cue) => { const p = workerPlan(cue); return [{at: 4, kind: 'pop', gain: 0.07}, {at: 12, kind: 'pop', gain: 0.07}, {at: 20, kind: 'pop', gain: 0.07}, {at: p.a, kind: 'whoosh-short', gain: 0.06}]; });

/* ---------- 6–7 the official table: speed (P50 vs P50), then the token bill ---------- */
const TW = WW - 60, TS = TW / 1080; // table scale in the window
const TableWin: React.FC<{f: number; title: string; spot?: [number, number, number, number][]; sp: number; children?: React.ReactNode}> = ({f, title, spot = [], sp, children}) => (
  <Win title={title} f={f} push={0.03}>
    <div style={{position: 'absolute', left: 30, top: 430}}>
      <Img src={A('table.png')} style={{width: TW, display: 'block', border: `1px solid ${K.line}`}} />
      {spot.map(([x, y, w, h], i) => <div key={i} style={{position: 'absolute', left: x * TS, top: y * TS, width: w * TS, height: h * TS, border: `5px solid ${K.blue}`, borderRadius: 10, opacity: sp, transform: `scale(${1.15 - 0.15 * sp})`}} />)}
    </div>
    {children}
  </Win>
);
const Bars: React.FC<{f: number; at: number; rows: [string, number, string][]; max: number}> = ({f, at, rows, max}) => <div style={{position: 'absolute', left: 40, top: 40, width: WW - 80}}>
  {rows.map(([label, v, txt], i) => {
    const g = ease.outCubic(clamp((f - at - i * 10) / 14));
    return <div key={label} style={{marginBottom: 34, opacity: f >= at + i * 10 ? 1 : 0}}>
      <div style={{fontFamily: font, fontWeight: 800, fontSize: 34, color: i ? K.dim : K.ink}}>{label}</div>
      <div style={{display: 'flex', alignItems: 'center', gap: 20, marginTop: 8}}>
        <div style={{height: 52, width: (WW - 380) * (v / max) * g, background: i ? '#9AA6BD' : K.blue, borderRadius: 8}} />
        <span style={{fontFamily: inter, fontWeight: 600, fontSize: 56, color: i ? K.dim : K.blue, opacity: g > 0.6 ? 1 : 0}}>{txt}</span>
      </div>
    </div>;
  })}
</div>;
const speedPlan = (cue: Cue) => ({a: cue('a', 68)});
const Speed = make(({f, cue}) => {
  const p = speedPlan(cue);
  return <Wall>
    <Pill n="06" t="快了" />
    <TableWin f={f} title="官方实验结果表" sp={ease.outCubic(clamp((f - 8) / 8))} spot={[[396, 128, 120, 42], ...(f >= p.a ? [[396, 278, 120, 42]] as [number, number, number, number][] : [])]}>
      <Bars f={f} at={4} max={20.4} rows={[['Super-agent · P50', 12.4, '12.4 分'], ...(f >= p.a - 10 ? [['单 Session + Subagent（中性提示）· P50', 20.4, '20.4 分']] as [string, number, string][] : [])]} />
    </TableWin>
    <Tag>官方自测 · 合成负载 · 时长按 1/4 缩放 · 只评调度协作</Tag>
  </Wall>;
}, (cue) => { const p = speedPlan(cue); return [{at: 4, kind: 'tick', gain: 0.07}, {at: p.a - 10, kind: 'tick', gain: 0.07}]; });
const costPlan = (cue: Cue) => ({a: cue('a', 69)});
const Cost = make(({f, cue}) => {
  const p = costPlan(cue);
  return <Wall>
    <Pill n="07" t="但更费 token" />
    <TableWin f={f} title="官方实验结果表" sp={ease.outCubic(clamp((f - 8) / 8))} spot={[[690, 128, 170, 42], [690, 278, 170, 42]]}>
      <Bars f={f} at={4} max={2323} rows={[['Super-agent · 读缓存 token', 2323, '2323 万'], ['单 Session（中性提示）', 605, '605 万']]} />
      {f >= p.a && <div style={{position: 'absolute', right: 50, top: 330, background: K.ink, color: '#fff', borderRadius: 18, padding: '10px 26px', fontFamily: inter, fontWeight: 600, fontSize: 72, transform: `scale(${ease.outBack(clamp((f - p.a) / 8), 1.8)}) rotate(-3deg)`}}>≈ 3.8×</div>}
    </TableWin>
    <Tag>官方自测 · 单次实验读缓存 token（全部 Session）</Tag>
  </Wall>;
}, (cue) => { const p = costPlan(cue); return [{at: 4, kind: 'tick', gain: 0.07}, {at: 14, kind: 'tick', gain: 0.07}, {at: p.a, kind: 'stamp', gain: 0.1}]; });

/* ---------- 8 proto: the prototype's README — its first bold line, spotlit ---------- */
const protoPlan = (cue: Cue) => ({a: cue('a', 30)});
const RS = (WW - 60) / 908;
const Proto = make(({f, cue}) => {
  const p = protoPlan(cue);
  const sp = ease.outCubic(clamp((f - p.a + 4) / 10));
  return <Wall>
    <Pill n="08" t="原型开源 · MIT" />
    <Win title="github · dsh-superagent-prototype" f={f} push={0.08 * sp} origin="30% 40%">
      <div style={{position: 'absolute', left: 30, top: 230}}>
        <Img src={A('readme.png')} style={{width: 908 * RS, display: 'block'}} />
        <Spot x={50 * RS} y={153 * RS} w={570 * RS} h={30 * RS} p={sp} />
      </div>
      {f >= p.a + 8 && <div style={{position: 'absolute', left: 30, right: 30, top: 640, textAlign: 'center', fontFamily: font, fontWeight: 900, fontSize: 56, color: '#fff', opacity: sp, zIndex: 2}}>研究原型，仅供参考<br />不是 DeepSeek 正式产品</div>}
    </Win>
    <Tag>仓库 README 截图 · 中文为对照翻译</Tag>
  </Wall>;
}, (cue) => { const p = protoPlan(cue); return [{at: 0, kind: 'fs-paper-slide', gain: 0.06}, {at: p.a - 4, kind: 'whoosh-short', gain: 0.06}]; });

/* ---------- 9 end: attention saved, tokens spent — two meters and the Router at rest ---------- */
const endPlan = (cue: Cue) => ({a: cue('a', 44)});
const End = make(({f, cue}) => {
  const p = endPlan(cue);
  const m = (label: string, v: number, color: string, x: number, at: number) => {
    const g = ease.outCubic(clamp((f - at) / 18));
    return <div style={{position: 'absolute', left: x, top: 200, width: 300, textAlign: 'center', opacity: f >= at ? 1 : 0.25}}>
      <div style={{margin: '0 auto', width: 120, height: 480, borderRadius: 20, border: `4px solid ${K.line}`, background: '#F7F8FB', position: 'relative', overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: `${100 * (v > 0 ? 0.3 + 0.6 * g : 0.85 - 0.6 * g)}%`, background: color}} />
      </div>
      <div style={{fontFamily: font, fontWeight: 900, fontSize: 46, color: K.ink, marginTop: 20}}>{label}</div>
      <div style={{fontFamily: font, fontWeight: 700, fontSize: 32, color: K.dim}}>{v > 0 ? '花得更多' : '省下来'}</div>
    </div>;
  };
  return <Wall>
    <Pill n="09" t="省注意力 · 花 token" />
    <Win title="Super-agent · 示意" f={f}>
      {m('你的注意力', -1, '#9AA6BD', 120, 0)}
      {m('token', 1, K.blue, 560, p.a)}
      <div style={{position: 'absolute', left: 400, top: 760}}><Sprite rows={ROUTER} px={10} eyes={f >= p.a ? 1 : -1} /></div>
    </Win>
  </Wall>;
}, (cue) => { const p = endPlan(cue); return [{at: 2, kind: 'tick', gain: 0.06}, {at: p.a, kind: 'tick', gain: 0.07}]; });

/** Cover anchor (880 × 800): the chat — user A's report and the PR reply. */
const Cover: Scene = () => <div style={{position: 'absolute', left: 0, top: 0, width: 880, height: 800, overflow: 'hidden', background: K.wall0}}>
  <div style={{position: 'absolute', left: -60, top: -300, width: W, height: 1920, transform: 'scale(0.92)', transformOrigin: '50% 30%'}}>
    {Hook.backdrop ? <Hook.backdrop f={200} dur={200} cue={(_n, fb) => (fb ?? 0) - 40} /> : null}
  </div>
</div>;

export const deepseekSuperagentScenes: Record<string, Scene> = {
  'ds.hook': Hook, 'ds.what': What, 'ds.limit': Limit, 'ds.router': RouterSc, 'ds.worker': Worker, 'ds.speed': Speed, 'ds.cost': Cost, 'ds.proto': Proto, 'ds.end': End, 'ds.cover': Cover,
};
