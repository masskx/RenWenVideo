import React from 'react';
import {Img, staticFile} from 'remotion';
import {clamp, ease} from '../../fx';
import {font} from '../theme';
import {cond, plex} from '../fonts';
import {Scene} from '../paper';

// apache-http2-rce-ai-found, made on the template lemo/visual-investigation (docs/video-craft/prompt-library/vendor/lemomo-ai__lemo-opuscar/
// 3961ddb/styles/visual-investigation/STYLE.md): a cold desk, greyscale evidence strips cut from the real pages, red only ever points
// (highlights, circles, the playhead, the one matching row), the clock read in the picture (dates → "T+16 天"), known vs unresolved.
// Inputs: inputs/apache-http2-rce-ai-found/ (materials.md, sources.md, REVIEW-DOUYIN.md: conditional pass, nine conditions).
// - Affected only if BOTH: 2.4.55–2.4.70 (or standalone mod_h2 2.0.8–2.0.42) AND h2 / h2c enabled; HTTP/2 is off by default.
// - 64 % / 51 % = Wiz's own data, configuration not counted. Exploitation: no official / Wiz report at publication; Red Hat says public
//   research demonstrated a reliable exploit, research not published. Red Hat's 9.8 is not shown (not an NVD score). No exploit details.
// - Finders as Apache credits them: Anthropic's OSS Scanner (2026-10-26) and Google Cloud Vulnerability Research (2026-11-03).

const BG = '#0B0C0E', PANEL = '#141619', LINE = '#2E3238', TXT = '#ECEAE4', DIM = '#8B9097', TICK = '#4A4F57', RED = '#FF4A2E';
const I = (n: string) => staticFile(`images/apache-http2-rce-ai-found/${n}`);
const eo = (f: number, a: number, d = 10) => ease.outCubic(clamp((f - a) / d));
const eio = (t: number) => ease.inOutCubic(clamp(t));
const make = (draw: NonNullable<Scene['backdrop']>, sfx?: Scene['sfx']): Scene => {
  const S: Scene = () => null;
  S.backdrop = draw; S.sfx = sfx;
  return S;
};

const Desk: React.FC<{f: number; dur?: number; children: React.ReactNode}> = ({f, dur = 150, children}) => <div style={{position: 'absolute', inset: 0, background: BG, overflow: 'hidden'}}>
  <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, opacity: 0.5}}>
    {Array.from({length: 13}, (_, i) => <line key={i} x1={60 + i * 80} y1={0} x2={60 + i * 80} y2={1920} stroke={LINE} strokeWidth={1} opacity={0.35} />)}
  </svg>
  {/* the camera never moves; the layout itself pushes in slowly (≤ 1.06, §5) and a hairline scans down the desk */}
  <div style={{position: 'absolute', inset: 0, transformOrigin: '50% 38%', transform: `scale(${1 + 0.06 * ease.inOutCubic(clamp(f / dur))})`}}>{children}</div>
  <div style={{position: 'absolute', left: 0, right: 0, top: 120 + ((f * 9) % 1100), height: 2, background: 'rgba(255,74,46,0.18)'}} />
  <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none', mixBlendMode: 'overlay'}}>
    <filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={1} seed={f % 20} /><feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.12 0" /></filter>
    <rect width={1080} height={1920} filter="url(#g)" />
  </svg>
</div>;

/** Cut in with a 3–4 frame white flash (pulled from the evidence locker); nothing flies. */
const Cut: React.FC<{f: number; at: number; children: React.ReactNode; style?: React.CSSProperties}> = ({f, at, children, style}) => f < at ? null : (
  <div style={{position: 'absolute', ...style}}>
    {children}
    {f - at < 4 && <div style={{position: 'absolute', inset: 0, background: '#fff', opacity: 0.85 * (1 - (f - at) / 4)}} />}
  </div>);
/** A source tag: a 6×12 red chip + `type · source` in mono. */
const Tag: React.FC<{text: string}> = ({text}) => <div style={{display: 'flex', alignItems: 'center', gap: 10, fontFamily: plex, fontSize: 26, color: DIM, marginBottom: 10, whiteSpace: 'nowrap'}}>
  <span style={{width: 6, height: 12, background: RED}} />{text}</div>;
type Hl = {x0: number; y0: number; x1: number; y1: number; at: number};
/** A greyscale evidence strip cut from the real page; only the decisive line is highlighted (red multiply, wiped). */
const Strip: React.FC<{src: string; w: number; h: number; k: number; f: number; hl?: Hl[]; circle?: Hl; dim?: boolean}> = ({src, w, h, k, f, hl = [], circle, dim}) => (
  <div style={{position: 'relative', width: w * k, height: h * k, border: `1px solid ${LINE}`, overflow: 'hidden'}}>
    <Img src={I(src)} style={{width: w * k, height: h * k, display: 'block', filter: `grayscale(1) contrast(1.05) brightness(${dim ? 0.6 : 0.86})`}} />
    {hl.map((r, i) => <div key={i} style={{position: 'absolute', left: r.x0 * k, top: r.y0 * k, height: (r.y1 - r.y0) * k, width: (r.x1 - r.x0) * k * eo(f, r.at, 8),
      background: RED, opacity: 0.6, mixBlendMode: 'multiply'}} />)}
    {circle && f >= circle.at && <svg width={w * k} height={h * k} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <ellipse cx={(circle.x0 + circle.x1) / 2 * k} cy={(circle.y0 + circle.y1) / 2 * k} rx={(circle.x1 - circle.x0) / 2 * k + 16} ry={(circle.y1 - circle.y0) / 2 * k + 7}
        fill="none" stroke={RED} strokeWidth={3} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - eo(f, circle.at, 15)} />
    </svg>}
  </div>);
const H: React.FC<{children: React.ReactNode; size?: number; color?: string}> = ({children, size = 64, color = TXT}) => <div style={{fontFamily: font, fontWeight: 700, fontSize: size, color, lineHeight: 1.2}}>{children}</div>;
const Tick: React.FC<{on: boolean; dashed?: boolean}> = ({on, dashed}) => <div style={{width: 44, height: 44, flex: 'none', border: `3px ${dashed ? 'dashed' : 'solid'} ${dashed ? TICK : RED}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
  {on && !dashed && <svg width={30} height={30}><path d="M4,16 L12,24 L26,6" fill="none" stroke={RED} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" /></svg>}
  {dashed && on && <span style={{fontFamily: plex, fontSize: 30, color: DIM}}>?</span>}
</div>;

/* ---------- 1 hook: the advisory, and who found it ---------- */

const Hook = make(({f, cue, dur}) => {
  const a = cue('a', 80), b = cue('b', 104);
  return <Desk f={f} dur={dur}>
    <Cut f={f} at={0} style={{left: 64, top: 170}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
        <span style={{fontFamily: plex, fontWeight: 600, fontSize: 64, color: TXT}}>CVE-2026-119618</span>
        <span style={{background: RED, color: BG, fontFamily: plex, fontWeight: 600, fontSize: 34, padding: '4px 14px'}}>critical</span>
      </div>
      <div style={{marginTop: 18}}><H size={60}>mod_http2 · 远程代码执行</H></div>
    </Cut>
    <Cut f={f} at={6} style={{left: 64, top: 430}}>
      <Tag text="公告 · Apache 官方" />
      <Strip src="adv.png" w={855} h={350} k={1.1} f={f} hl={[{x0: 38, y0: 0, x1: 680, y1: 28, at: 10}, {x0: 78, y0: 189, x1: 610, y1: 209, at: a}]}
        circle={{x0: 126, y0: 191, x1: 292, y1: 207, at: a + 8}} />
    </Cut>
    <Cut f={f} at={b} style={{left: 64, top: 930, width: 952}}>
      <div style={{background: PANEL, border: `1px solid ${LINE}`, borderLeft: `6px solid ${RED}`, padding: '20px 28px'}}>
        <div style={{fontFamily: plex, fontSize: 26, color: DIM}}>finder（官方致谢）</div>
        <div style={{fontFamily: font, fontWeight: 700, fontSize: 70, color: TXT, whiteSpace: 'nowrap'}}>Anthropic OSS Scanner</div>
      </div>
    </Cut>
  </Desk>;
}, (cue) => [{at: 0, kind: 'shutter', gain: 0.07}, {at: 6, kind: 'paper', gain: 0.06}, {at: cue('a', 80) + 8, kind: 'tick', gain: 0.08}, {at: cue('b', 104), kind: 'shutter', gain: 0.08}]);

/* ---------- 2 clock: three dates; the readout counts the days ---------- */

const DATES: {d: string; day: number; who: string; row: number}[] = [
  {d: '10-26', day: 0, who: 'Anthropic OSS Scanner 报告', row: 252},
  {d: '11-03', day: 8, who: 'Google Cloud 漏洞研究 报告', row: 274},
  {d: '11-11', day: 16, who: '2.4.71 发布修复', row: 316},
];
const AX0 = 120, AX1 = 960, AY = 760;
const dx = (day: number) => AX0 + (AX1 - AX0) * day / 16;
const Clock = make(({f, cue, dur}) => {
  const a = cue('a', 46), b = cue('b', 95);
  const T = [4, a, b], k = f < a ? 0 : f < b ? 1 : 2;
  const play = k === 0 ? 0 : k === 1 ? 8 * eio((f - a) / 14) : 8 + 8 * eio((f - b) / 14);
  return <Desk f={f} dur={dur}>
    <div style={{position: 'absolute', left: 64, top: 180}}>
      <div style={{fontFamily: plex, fontSize: 28, color: DIM}}>2026</div>
      <div style={{fontFamily: plex, fontWeight: 600, fontSize: 190, color: TXT, lineHeight: 1}}>{(() => { const d = Math.round(play); return d <= 5 ? `10-${26 + d}` : `11-${String(d - 5).padStart(2, '0')}`; })()}</div>
      <div style={{fontFamily: plex, fontSize: 44, color: RED, marginTop: 8}}>T+{Math.round(play)} 天</div>
    </div>
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      <line x1={AX0} y1={AY} x2={AX1} y2={AY} stroke={LINE} strokeWidth={3} />
      {Array.from({length: 17}, (_, i) => <line key={i} x1={dx(i)} y1={AY - 10} x2={dx(i)} y2={AY + 10} stroke={TICK} strokeWidth={2} />)}
      <line x1={dx(0)} y1={AY} x2={dx(play)} y2={AY} stroke={RED} strokeWidth={5} />
      <line x1={dx(play)} y1={AY - 50} x2={dx(play)} y2={AY + 50} stroke={RED} strokeWidth={3} />
    </svg>
    {DATES.map((x, i) => <Cut key={i} f={f} at={T[i]} style={{left: Math.min(dx(x.day) - 20, 700), top: i === 1 ? AY + 40 : AY - 170, width: 340}}>
      <div style={{fontFamily: plex, fontWeight: 600, fontSize: 40, color: TXT}}>{x.d}</div>
      <div style={{fontFamily: font, fontWeight: 700, fontSize: 34, color: i === k ? TXT : DIM, whiteSpace: 'nowrap'}}>{x.who}</div>
    </Cut>)}
    <div style={{position: 'absolute', left: 64, top: 980}}>
      <Tag text="公告 · Apache 官方（日期表）" />
      <div style={{width: 855 * 1.1, height: 100 * 1.1, overflow: 'hidden', position: 'relative'}}>
        <div style={{position: 'absolute', left: 0, top: -240 * 1.1}}>
          <Strip src="adv.png" w={855} h={350} k={1.1} f={f} hl={DATES.map((x, i) => ({x0: 40, y0: x.row - 10, x1: 852, y1: x.row + 11, at: T[i] + 2}))} />
        </div>
      </div>
    </div>
  </Desk>;
}, (cue) => [{at: 4, kind: 'tick', gain: 0.09}, {at: cue('a', 46), kind: 'tick', gain: 0.09}, {at: cue('b', 95), kind: 'tick', gain: 0.1}]);

/* ---------- 3 gate: both conditions or nothing — a truth table over four servers ---------- */

const V0 = 53, V1 = 72, RX0 = 110, RX1 = 970;
const vx = (v: number) => RX0 + (RX1 - RX0) * (v - V0) / (V1 - V0);
const SERVERS: {v: string; h2: boolean; out: string; hit: boolean}[] = [
  {v: '2.4.62', h2: true, out: '受影响', hit: true},
  {v: '2.4.62', h2: false, out: '不受影响', hit: false},
  {v: '2.4.71', h2: true, out: '已修复', hit: false},
  {v: '2.4.52', h2: true, out: '不在范围', hit: false},
];
const Gate = make(({f, cue, dur}) => {
  const a = cue('a', 43), b = cue('b', 147);
  const br = eo(f, a + 4, 16);
  return <Desk f={f} dur={dur}>
    {(() => {
      // heading → a big version readout while the playhead scans the ruler → heading again for condition 2
      const t = clamp((f - a - 18) / Math.max(1, b - a - 26)), v = Math.round(V0 + t * (V1 - V0)), hit = v >= 55 && v <= 70;
      if (f >= a + 18 && f < b - 4) return <div style={{position: 'absolute', left: 64, top: 130, display: 'flex', alignItems: 'baseline', gap: 26}}>
        <span style={{fontFamily: plex, fontWeight: 600, fontSize: 120, color: hit ? RED : TXT, lineHeight: 1}}>{`2.4.${v}`}</span>
        <span style={{fontFamily: font, fontWeight: 700, fontSize: 48, color: hit ? RED : DIM}}>{hit ? '在范围内' : v > 70 ? '已修复' : '不在范围'}</span>
      </div>;
      return <Cut f={f} at={0} style={{left: 64, top: 150}}><H size={66}>两条<span style={{color: RED}}>同时</span>满足才中招</H></Cut>;
    })()}
    {/* condition 1: the version ruler */}
    <Cut f={f} at={a} style={{left: 0, top: 290, width: 1080, height: 230}}>
      <div style={{position: 'absolute', left: 64, top: 0}}><Tag text="条件 1 · 版本（官方公告）" /></div>
      <svg width={1080} height={230} style={{position: 'absolute', left: 0, top: 0}}>
        <line x1={RX0} y1={130} x2={RX1} y2={130} stroke={LINE} strokeWidth={3} />
        {Array.from({length: V1 - V0 + 1}, (_, i) => <line key={i} x1={vx(V0 + i)} y1={(V0 + i) % 5 === 0 ? 108 : 118} x2={vx(V0 + i)} y2={142} stroke={TICK} strokeWidth={2} />)}
        <rect x={vx(55) - 6} y={100} width={(vx(70) - vx(55) + 12) * br} height={60} fill={RED} opacity={0.25} />
        <line x1={vx(55)} y1={100} x2={vx(55) + (vx(70) - vx(55)) * br} y2={100} stroke={RED} strokeWidth={4} />
        {(() => {
          // a playhead walks the versions: inside 2.4.55–2.4.70 it reads red
          const t = clamp((f - a - 18) / Math.max(1, b - a - 26)), v = Math.round(V0 + t * (V1 - V0)), hit = v >= 55 && v <= 70;
          return t <= 0 || f >= b ? null : <g>
            <line x1={vx(v)} y1={86} x2={vx(v)} y2={160} stroke={hit ? RED : TXT} strokeWidth={4} />
            <text x={vx(v)} y={78} textAnchor="middle" fontFamily={plex} fontSize={34} fill={hit ? RED : TXT}>{`2.4.${v}`}</text>
          </g>;
        })()}
      </svg>
      {[[55, '2.4.55'], [70, '2.4.70']].map(([v, l]) => <div key={l} style={{position: 'absolute', left: vx(v as number) - 60, top: 172, fontFamily: plex, fontSize: 32, color: TXT, opacity: br}}>{l}</div>)}
      <div style={{position: 'absolute', left: vx(71) - 150, top: 52, fontFamily: plex, fontSize: 30, color: DIM, opacity: br, whiteSpace: 'nowrap'}}>2.4.71 已修 ↓</div>
    </Cut>
    {/* condition 2: HTTP/2 on, which is off by default */}
    <Cut f={f} at={b - 4} style={{left: 64, top: 560}}>
      <Tag text="条件 2 · 开了 HTTP/2（官方手册）" />
      <div style={{display: 'flex', gap: 24, alignItems: 'flex-start'}}>
        <Strip src="proto.png" w={445} h={180} k={1.12} f={f} hl={[{x0: 4, y0: 56, x1: 300, y1: 79, at: b + 36}]} />
        <div>
          <div style={{fontFamily: plex, fontSize: 26, color: DIM, marginBottom: 8}}>开启写法</div>
          <Strip src="protoex.png" w={275} h={37} k={1.4} f={f} hl={[{x0: 108, y0: 4, x1: 130, y1: 32, at: b + 6}]} />
          <div style={{fontFamily: font, fontWeight: 700, fontSize: 34, color: TXT, marginTop: 16, opacity: eo(f, b + 36, 6)}}>默认只有</div>
          <div style={{fontFamily: plex, fontSize: 34, color: RED, opacity: eo(f, b + 36, 6)}}>http/1.1</div>
        </div>
      </div>
    </Cut>
    {/* the truth table */}
    <Cut f={f} at={b + 8} style={{left: 64, top: 860, width: 952}}>
      <div style={{display: 'grid', gridTemplateColumns: '220px 240px 1fr', fontFamily: plex, fontSize: 28, color: DIM, borderBottom: `1px solid ${LINE}`, paddingBottom: 6}}>
        <span>版本</span><span>HTTP/2</span><span>结果</span>
      </div>
      {SERVERS.map((s, i) => f < b + 12 + i * 6 ? null : <div key={i} style={{display: 'grid', gridTemplateColumns: '220px 240px 1fr', alignItems: 'center', height: 70, borderBottom: `1px solid ${LINE}`,
        background: s.hit ? 'rgba(255,74,46,0.14)' : 'transparent'}}>
        <span style={{fontFamily: plex, fontSize: 38, color: TXT}}>{s.v}</span>
        <span style={{fontFamily: font, fontWeight: 700, fontSize: 36, color: s.h2 ? TXT : DIM}}>{s.h2 ? '开' : '关'}</span>
        <span style={{fontFamily: font, fontWeight: 700, fontSize: 40, color: s.hit ? RED : DIM}}>{s.out}</span>
      </div>)}
      <div style={{fontFamily: plex, fontSize: 24, color: TICK, marginTop: 10}}>示例服务器 · 独立 mod_h2：2.0.8–2.0.42</div>
    </Cut>
  </Desk>;
}, (cue) => [{at: 0, kind: 'shutter', gain: 0.06}, {at: cue('a', 43), kind: 'paper', gain: 0.06}, {at: cue('b', 147) - 4, kind: 'paper', gain: 0.06}, ...[0, 1, 2, 3].map((i) => ({at: cue('b', 147) + 12 + i * 6, kind: 'tick', gain: i === 0 ? 0.12 : 0.06}))]);

/* ---------- 4 wiz: 64 %, as Wiz states it ---------- */

const Wiz = make(({f, cue, dur}) => {
  const a = cue('a', 34), b = cue('b', 111);
  const n = Math.round(64 * ease.outCubic(clamp((f - a) / 18)));
  return <Desk f={f} dur={dur}>
    <Cut f={f} at={0} style={{left: 64, top: 170}}>
      <div style={{fontFamily: plex, fontSize: 30, color: RED}}>Wiz 自报</div>
      <div style={{fontFamily: cond, fontWeight: 800, fontSize: 300, color: TXT, lineHeight: 1}}>{f < a ? '—' : `${n}%`}</div>
      <H size={52}>的云环境里，有资源受此漏洞影响</H>
    </Cut>
    <Cut f={f} at={a} style={{left: 64, top: 760}}>
      <Tag text="博客 · Wiz 2026-11-11" />
      <Strip src="wiz64.png" w={1010} h={70} k={0.94} f={f} hl={[{x0: 200, y0: 6, x1: 444, y1: 34, at: a + 6}, {x0: 416, y0: 38, x1: 880, y1: 66, at: b}]} />
    </Cut>
    <Cut f={f} at={b + 4} style={{left: 64, top: 930}}>
      <div style={{display: 'flex', gap: 20}}>
        <div style={{border: `3px dashed ${TICK}`, padding: '10px 22px', fontFamily: font, fontWeight: 700, fontSize: 44, color: TXT}}>未计入配置</div>
        <div style={{border: `1px solid ${LINE}`, padding: '10px 22px', fontFamily: font, fontWeight: 700, fontSize: 36, color: DIM, alignSelf: 'center'}}>另：51% 有对外暴露的实例</div>
      </div>
    </Cut>
  </Desk>;
}, (cue) => [{at: cue('a', 34), kind: 'tick', gain: 0.08}, {at: cue('a', 34) + 18, kind: 'tap', gain: 0.08}, {at: cue('b', 111), kind: 'paper', gain: 0.06}]);

/* ---------- 5 known / unresolved ---------- */

const Known = make(({f, cue, dur}) => {
  const a = cue('a', 76), b = cue('b', 130);
  return <Desk f={f} dur={dur}>
    <Cut f={f} at={0} style={{left: 64, top: 150, width: 952}}>
      <div style={{fontFamily: plex, fontSize: 30, color: TXT, borderBottom: `2px solid ${RED}`, paddingBottom: 8, marginBottom: 20}}>已知</div>
      <div style={{display: 'flex', gap: 18, alignItems: 'center', marginBottom: 16}}><Tick on={f >= 6} /><H size={42}>Apache 公告：没写利用情况</H></div>
      <div style={{display: 'flex', gap: 18, alignItems: 'center', marginBottom: 14}}><Tick on={f >= 14} /><H size={42}>Wiz 发表时：无利用、无在野报告</H></div>
      <Strip src="wiznoexp.png" w={970} h={40} k={0.98} f={f} hl={[{x0: 270, y0: 4, x1: 950, y1: 36, at: 20}]} />
    </Cut>
    <Cut f={f} at={a - 4} style={{left: 64, top: 620, width: 952}}>
      <div style={{fontFamily: plex, fontSize: 30, color: DIM, borderBottom: `2px dashed ${TICK}`, paddingBottom: 8, marginBottom: 20}}>未解决</div>
      <div style={{display: 'flex', gap: 18, alignItems: 'center', marginBottom: 14}}><Tick on dashed /><H size={42}>红帽：有公开研究演示过可靠利用</H></div>
      <Strip src="redhat.png" w={645} h={185} k={1.45} f={f} dim hl={[{x0: 385, y0: 64, x1: 640, y1: 86, at: a + 4}, {x0: 8, y0: 88, x1: 620, y1: 110, at: a + 10}]} />
      <div style={{display: 'flex', gap: 18, alignItems: 'center', marginTop: 18, opacity: f >= b ? 1 : 0}}><Tick on dashed /><H size={42} color={RED}>这份研究：没公布</H></div>
    </Cut>
  </Desk>;
}, (cue) => [{at: 6, kind: 'tick', gain: 0.07}, {at: 14, kind: 'tick', gain: 0.07}, {at: cue('a', 76) - 4, kind: 'shutter', gain: 0.07}, {at: cue('b', 130), kind: 'tap', gain: 0.08}]);

/* ---------- 6 act: three things, today ---------- */

const STEPS: {n: string; cmd: string; note: string}[] = [
  {n: '1', cmd: 'httpd -v', note: '看版本（apachectl -v 同样可用）'},
  {n: '2', cmd: '升级到 2.4.71', note: '独立 mod_h2：高于 2.0.42'},
  {n: '3', cmd: 'Protocols http/1.1', note: '暂时升不了：去掉 h2 / h2c（Wiz 建议的临时缓解）'},
];
const Act = make(({f, cue, dur}) => {
  const a = cue('a', 22), b = cue('b', 78);
  const T = [4, b, 138];
  return <Desk f={f} dur={dur}>
    <Cut f={f} at={0} style={{left: 64, top: 150}}><H size={66}>现在就做</H></Cut>
    {STEPS.map((s, i) => <Cut key={i} f={f} at={T[i]} style={{left: 64, top: 290 + i * 230, width: 952}}>
      <div style={{display: 'flex', gap: 22, alignItems: 'flex-start', background: PANEL, border: `1px solid ${LINE}`, borderLeft: `6px solid ${i === 2 ? TICK : RED}`, padding: '18px 24px'}}>
        <span style={{fontFamily: plex, fontSize: 40, color: DIM}}>{s.n}</span>
        <div>
          <div style={{fontFamily: plex, fontWeight: 600, fontSize: 52, color: TXT, whiteSpace: 'nowrap'}}>{s.cmd}</div>
          <div style={{fontFamily: font, fontWeight: 700, fontSize: 32, color: DIM, marginTop: 6}}>{s.note}</div>
        </div>
      </div>
    </Cut>)}
    <Cut f={f} at={a} style={{left: 64, top: 1010}}>
      <Tag text="手册 · httpd -v" />
      <Strip src="httpdv.png" w={470} h={90} k={1.5} f={f} hl={[{x0: 46, y0: 21, x1: 300, y1: 42, at: a + 4}]} />
    </Cut>
  </Desk>;
}, (cue) => [{at: 4, kind: 'tick', gain: 0.08}, {at: cue('b', 78), kind: 'tick', gain: 0.08}, {at: 138, kind: 'tick', gain: 0.08}]);

/* ---------- cover anchor: the truth table ---------- */

const Cover = make(({f}) => <Desk f={f}>
  <div style={{position: 'absolute', left: 64, top: 860, width: 952}}>
    {SERVERS.map((s, i) => <div key={i} style={{display: 'grid', gridTemplateColumns: '220px 240px 1fr', alignItems: 'center', height: 70, borderBottom: `1px solid ${LINE}`, background: s.hit ? 'rgba(255,74,46,0.14)' : 'transparent'}}>
      <span style={{fontFamily: plex, fontSize: 38, color: TXT}}>{s.v}</span>
      <span style={{fontFamily: font, fontWeight: 700, fontSize: 36, color: s.h2 ? TXT : DIM}}>HTTP/2 {s.h2 ? '开' : '关'}</span>
      <span style={{fontFamily: font, fontWeight: 700, fontSize: 40, color: s.hit ? RED : DIM}}>{s.out}</span>
    </div>)}
  </div>
</Desk>);

export const APACHE_H2_SCENES: Record<string, Scene> = {
  'ahr.hook': Hook, 'ahr.clock': Clock, 'ahr.gate': Gate, 'ahr.wiz': Wiz, 'ahr.known': Known, 'ahr.act': Act, 'ahr.cover': Cover,
};
