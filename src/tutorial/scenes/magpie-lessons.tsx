import React from 'react';
import {color, font, mono} from '../theme';
import {Appear, Check, Chip, CueGlow, Panel, SceneProps, Window, ramp, usePop} from '../ui';
import {Stamp, ease, prog, sway, typed} from '../../fx';

// magpie 的错题本 (WquGuru's article on yetone/magpie). Storyboard: tutorials/magpie-lessons.storyboard.md.
// Quoted rules were checked against github.com/yetone/magpie (LESSONS.md, docs/code-standards.md, 2026-10-15).
// A = 错题本 (color.keyA), B = 硬规则 (color.keyB); green is reserved for B / passed checks.

const A = color.keyA;
const B = color.keyB;

const H: React.FC<{size?: number; c?: string; style?: React.CSSProperties; children: React.ReactNode}> = ({size = 60, c = color.text, style, children}) => (
  <div style={{fontFamily: font, fontWeight: 900, fontSize: size, color: c, lineHeight: 1.25, ...style}}>{children}</div>
);
const P: React.FC<{size?: number; c?: string; style?: React.CSSProperties; children: React.ReactNode}> = ({size = 36, c = color.dim, style, children}) => (
  <div style={{fontFamily: font, fontSize: size, color: c, lineHeight: 1.45, ...style}}>{children}</div>
);
const Root: React.FC<{f: number; beats: number[]; glow?: string; children: React.ReactNode}> = ({f, beats, glow = color.violet, children}) => (
  <div style={{position: 'relative', isolation: 'isolate'}}><CueGlow f={f} beats={beats} c={glow} />{children}</div>
);
const count = (f: number, from: number, to: number, start: number, frames: number) =>
  Math.round(from + (to - from) * ease.outCubic(prog(f, start, frames))).toLocaleString('en-US');

/** Small line-art robot standing in for "an agent". */
const Bot: React.FC<{size?: number; c?: string; on?: number}> = ({size = 64, c = color.cyan, on = 1}) => (
  <svg width={size} height={size} viewBox="0 0 64 64" style={{opacity: 0.35 + 0.65 * on}}>
    <line x1={32} y1={6} x2={32} y2={14} stroke={c} strokeWidth={3} strokeLinecap="round" />
    <circle cx={32} cy={6} r={3.5} fill={c} />
    <rect x={10} y={14} width={44} height={36} rx={10} fill={`${c}22`} stroke={c} strokeWidth={3} />
    <circle cx={24} cy={31} r={4.5} fill={c} /><circle cx={40} cy={31} r={4.5} fill={c} />
    <path d="M24 42 Q32 46 40 42" stroke={c} strokeWidth={3} fill="none" strokeLinecap="round" />
  </svg>
);

/** A file card: name on top, coloured edge for its role. */
const FileCard: React.FC<{name: string; role: string; c: string; p: number; style?: React.CSSProperties; children?: React.ReactNode}> = ({name, role, c, p, style, children}) => (
  <Appear p={p} dy={30} style={style}>
    <div style={{background: '#121a2e', border: `3px solid ${c}`, borderRadius: 22, padding: '20px 26px', boxShadow: `0 0 30px ${c}33`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
        <span style={{fontFamily: mono, fontSize: 36, fontWeight: 800, color: color.text}}>{name}</span>
        <span style={{marginLeft: 'auto', fontFamily: font, fontSize: 36, fontWeight: 900, color: c}}>{role}</span>
      </div>
      {children}
    </div>
  </Appear>
);

/* hook — 19 days, 1204 releases, written/reviewed/merged/released by agents → a mistake log */
const Hook: React.FC<SceneProps> = ({f, cue}) => {
  const pop = usePop();
  const [a, b, c, d] = [cue('a', 92), cue('b', 139), cue('c', 275), cue('d', 392)];
  const chain = ['写', '审', '合', '发'];
  return <Root f={f} beats={[0, a, b, c, d]} glow={color.cyan}>
    <div style={{display: 'flex', justifyContent: 'center', gap: 26}}>
      {[[`${Math.min(19, Math.round(19 * ease.outCubic(prog(f, 0, 40))))}`, '天'], [count(f, 0, 1204, 4, 80), '个版本']].map(([n, u], i) => (
        <Appear key={u} p={pop(f, i * 6)} scale>
          <Panel glow={i ? color.amber : undefined} style={{textAlign: 'center', padding: '22px 34px', minWidth: 300}}>
            <div style={{fontFamily: mono, fontSize: 104, fontWeight: 900, color: i ? color.amber : color.text, lineHeight: 1}}>{n}</div>
            <div style={{fontFamily: font, fontSize: 38, color: color.text, marginTop: 8}}>{u}</div>
          </Panel>
        </Appear>
      ))}
    </div>
    <Appear p={pop(f, a)} style={{textAlign: 'center', marginTop: 22}}><Chip c={color.amber} style={{fontSize: 40}}>一天 60 多个版本</Chip></Appear>
    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 40}}>
      {chain.map((t, i) => {
        const on = ramp(f, b + i * 8, b + i * 8 + 10);
        return <React.Fragment key={t}>
          {i > 0 && <span style={{fontFamily: font, fontSize: 40, color: on > 0.5 ? color.cyan : '#2a3352'}}>→</span>}
          <div style={{textAlign: 'center', width: 160, padding: '14px 0', borderRadius: 20, background: on > 0.5 ? 'rgba(34,211,238,0.12)' : 'rgba(255,255,255,0.03)',
            border: `2px solid ${on > 0.5 ? color.cyan : '#2a3352'}`, transform: `scale(${0.9 + 0.1 * on})`}}>
            <Bot size={62} on={on} />
            <div style={{fontFamily: font, fontSize: 40, fontWeight: 900, color: color.text}}>{t}</div>
          </div>
        </React.Fragment>;
      })}
    </div>
    <Appear p={pop(f, b + 34)} style={{textAlign: 'center', marginTop: 14}}><P size={34}>全是 agent，人几乎不碰</P></Appear>
    <Appear p={pop(f, c)} dy={30} style={{marginTop: 26}}>
      <Panel style={{padding: '20px 28px', textAlign: 'center'}}>
        <div style={{fontFamily: mono, fontSize: 52, fontWeight: 900, color: color.text}}>yetone / magpie</div>
        <P size={32} style={{marginTop: 6}}>本地 LLM 网关 · 把 Claude Code、Codex、Gemini CLI 接到任意模型</P>
      </Panel>
    </Appear>
    <div style={{position: 'relative', height: 150, display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 12}}>
      <Stamp t={f / 30} at={d / 30} text="答案：一本错题本" color={A} size={58} deg={-5} font={font} style={{position: 'relative'}} />
    </div>
  </Root>;
};

/* compare — magpie vs OpenClaw, first 19 days */
const Compare: React.FC<SceneProps> = ({f, cue}) => {
  const pop = usePop();
  const [a, b, c] = [cue('a', 144), cue('b', 203), cue('c', 236)];
  const Bar: React.FC<{label: string; value: number; max: number; at: number; c: string; text: string}> = ({label, value, max, at, c: col, text}) => {
    const g = ease.outCubic(prog(f, at, 24));
    return <div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 14}}>
      <span style={{fontFamily: mono, fontSize: 32, color: color.text, width: 190}}>{label}</span>
      <div style={{flex: 1, height: 52, borderRadius: 14, background: '#1b2238', position: 'relative'}}>
        <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 14, width: `${Math.max(1.2, value / max * 100) * g}%`, background: col}} />
      </div>
      <span style={{fontFamily: mono, fontSize: 36, fontWeight: 800, color: col, width: 150, textAlign: 'right', opacity: g}}>{text}</span>
    </div>;
  };
  return <Root f={f} beats={[0, a, b, c]} glow={color.amber}>
    <Appear p={pop(f, 0)}><H size={64}>头 19 天对比</H></Appear>
    <Appear p={pop(f, 6)}><P size={34}>作者把 magpie 的 2,862 个 commit 全翻了一遍</P></Appear>
    <Panel style={{marginTop: 30}}>
      <H size={42} c={color.cyan}>commit</H>
      <Bar label="magpie" value={2862} max={2862} at={10} c={color.cyan} text="2,862" />
      {f >= a && <Bar label="OpenClaw" value={1423} max={2862} at={b} c={color.violet} text="1,423" />}
      <Appear p={pop(f, b + 10)} style={{textAlign: 'right', marginTop: 10}}><Chip c={color.cyan}>多一倍</Chip></Appear>
    </Panel>
    <Panel style={{marginTop: 24}}>
      <H size={42} c={color.amber}>版本 tag</H>
      <Bar label="magpie" value={1204} max={1204} at={c} c={color.amber} text="1,204" />
      {f >= a && <Bar label="OpenClaw" value={10} max={1204} at={c + 8} c={color.violet} text="约 10" />}
    </Panel>
    <div style={{position: 'relative', height: 140, display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 16}}>
      <Stamp t={f / 30} at={(c + 24) / 30} text="版本多一百多倍" color={color.amber} size={54} deg={-6} font={font} style={{position: 'relative'}} />
    </div>
  </Root>;
};

/* files — CLAUDE.md is two lines: a routing table and a mistake log */
const Files: React.FC<SceneProps> = ({f, cue}) => {
  const pop = usePop();
  const [a, b, c] = [cue('a', 31), cue('b', 96), cue('c', 255)];
  const routes = [['改子系统', 'docs/subsystems/'], ['写代码、审代码', 'code-standards.md'], ['审社区 PR', 'contributors.md']];
  return <Root f={f} beats={[0, a, b, b + 40, c]} glow={color.cyan}>
    <Appear p={pop(f, 0)}><H size={64}>入口只有两行</H></Appear>
    <Appear p={pop(f, 4)} dy={30} style={{marginTop: 20}}>
      <Window title="CLAUDE.md" bodyStyle={{fontFamily: mono, fontSize: 40, lineHeight: 1.5}}>
        <div style={{color: color.cyan}}>{typed('@AGENTS.md', f / 30, a / 30, 18)}</div>
        <div style={{color: A}}>{typed('@LESSONS.md', f / 30, (a + 22) / 30, 18)}</div>
      </Window>
    </Appear>
    <FileCard name="AGENTS.md" role="路由表" c={color.cyan} p={pop(f, b)} style={{marginTop: 24}}>
      {routes.map(([what, doc], i) => (
        <Appear key={doc} p={pop(f, b + 12 + i * 12)} dy={12} style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 12}}>
          <span style={{fontFamily: font, fontSize: 38, color: color.text}}>{what}</span>
          <span style={{fontFamily: font, fontSize: 36, color: color.dim}}>→</span>
          <span style={{fontFamily: mono, fontSize: 32, color: color.cyan}}>{doc}</span>
        </Appear>
      ))}
    </FileCard>
    <FileCard name="LESSONS.md" role="错题本" c={A} p={pop(f, c)} style={{marginTop: 22}}>
      <div style={{fontFamily: mono, fontSize: 26, color: color.dim, marginTop: 12}}>magpie's code is written, reviewed, merged and released by agents.</div>
      <P size={38} c={color.text} style={{marginTop: 6}}>代码由 agent 编写、审查、合并和发布</P>
    </FileCard>
  </Root>;
};

/* nightly — every night, three kinds of trouble */
const Nightly: React.FC<SceneProps> = ({f, cue}) => {
  const pop = usePop();
  const [a, b, c] = [cue('a', 108), cue('b', 144), cue('c', 184)];
  const kinds = [{t: '修完又返工', c: color.red, at: a, row: 1}, {t: '压根不该合', c: color.amber, at: b, row: 3}, {t: '验证太糙', c: color.violet, at: c, row: 4}];
  const rows = ['fix: 修复 provider 列表报错', 'feat: 新增模型路由', 'fix: 再次修复 provider 列表', 'chore: 发布 v0.1.9xx', 'test: 补一条测试', 'fix: 调整 GUI 布局'];
  const scroll = (f * 0.6) % 70;
  return <Root f={f} beats={[0, a, b, c]} glow={color.violet}>
    <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
      <svg width={70} height={70} viewBox="0 0 84 84" style={{flex: 'none'}}><path d="M56 12 A32 32 0 1 0 72 58 A26 26 0 1 1 56 12 Z" fill={color.amber} /></svg>
      <Appear p={pop(f, 0)}><H size={56} style={{whiteSpace: 'nowrap'}}>每天夜里，复盘当天的 commit</H></Appear>
    </div>
    <Panel style={{marginTop: 24, padding: '18px 22px', height: 450, overflow: 'hidden', position: 'relative'}}>
      <div style={{fontFamily: font, fontSize: 24, color: color.dim, marginBottom: 6}}>当天的 commit（示意）</div>
      <div style={{transform: `translateY(${-scroll}px)`}}>
        {[...rows, ...rows].map((m, i) => {
          const k = kinds.find((x) => x.row === i % rows.length && f >= x.at);
          return <div key={i} style={{display: 'flex', alignItems: 'center', gap: 16, height: 70, borderBottom: '1px solid #1f2842'}}>
            <span style={{fontFamily: mono, fontSize: 26, color: color.dim}}>{(0x3a1f0 + i * 4567).toString(16).slice(0, 7)}</span>
            <span style={{fontFamily: font, fontSize: 30, color: color.text, flex: 1, whiteSpace: 'nowrap'}}>{m}</span>
            {k && <span style={{fontFamily: font, fontSize: 26, fontWeight: 800, color: '#0a0e1a', background: k.c, borderRadius: 10, padding: '4px 12px'}}>{k.t}</span>}
          </div>;
        })}
      </div>
    </Panel>
    <div style={{display: 'flex', gap: 16, marginTop: 26}}>
      {kinds.map((k, i) => (
        <Appear key={k.t} p={pop(f, k.at)} scale style={{flex: 1}}>
          <div style={{textAlign: 'center', padding: '22px 8px', borderRadius: 20, border: `3px solid ${k.c}`, background: `${k.c}1f`}}>
            <div style={{fontFamily: mono, fontSize: 40, fontWeight: 900, color: k.c}}>{i + 1}</div>
            <div style={{fontFamily: font, fontSize: 36, fontWeight: 900, color: color.text, whiteSpace: 'nowrap'}}>{k.t}</div>
          </div>
        </Appear>
      ))}
    </div>
  </Root>;
};

/* entry — one lesson: rule, reason, evidence; #834 came back four times */
const Entry: React.FC<SceneProps> = ({f, cue}) => {
  const pop = usePop();
  const [a, b, c, d] = [cue('a', 61), cue('b', 85), cue('c', 106), cue('d', 266)];
  const Tag: React.FC<{t: string; col: string}> = ({t, col}) => (
    <span style={{fontFamily: font, fontSize: 28, fontWeight: 800, color: '#0a0e1a', background: col, borderRadius: 10, padding: '4px 14px', flex: 'none', alignSelf: 'flex-start'}}>{t}</span>
  );
  const versions = ['.920', '.925', '.931', '.938'];
  const sw = sway(f / 30, 0.7, {dy: 3, deg: 0.4});
  return <Root f={f} beats={[0, a, c, d]} glow={A}>
    <Appear p={pop(f, 0)}><H size={60}>错题本里的一条</H></Appear>
    <Appear p={pop(f, 4)} dy={30} style={{marginTop: 20, transform: `translateY(${sw.dy}px) rotate(${sw.deg}deg)`}}>
      <div style={{background: '#121a2e', border: `3px solid ${A}`, borderRadius: 22, padding: '22px 26px'}}>
        <div style={{fontFamily: mono, fontSize: 26, color: A}}>LESSONS.md</div>
        <Appear p={pop(f, a)} dy={14} style={{display: 'flex', gap: 14, marginTop: 14}}>
          <Tag t="规则" col={color.cyan} />
          <div>
            <div style={{fontFamily: font, fontSize: 40, fontWeight: 900, color: color.text}}>说修好之前，先在报告人用的界面上原样复现</div>
            <div style={{fontFamily: mono, fontSize: 22, color: color.dim, marginTop: 4}}>Reproduce the reporter's exact case, on the surface they use, before you call it fixed.</div>
          </div>
        </Appear>
        <Appear p={pop(f, b)} dy={14} style={{display: 'flex', gap: 14, marginTop: 16, alignItems: 'center'}}>
          <Tag t="原因" col={color.amber} /><span style={{fontFamily: font, fontSize: 36, color: color.text}}>每轮只修了截图里那一个 agent</span>
        </Appear>
        <Appear p={pop(f, c)} dy={14} style={{display: 'flex', gap: 14, marginTop: 16, alignItems: 'center'}}>
          <Tag t="证据" col={color.violet} /><span style={{fontFamily: mono, fontSize: 32, color: color.text}}>#834 · v0.1.920 → .925 → .931 → .938</span>
        </Appear>
        <Appear p={pop(f, c + 10)} dy={10}><div style={{fontFamily: mono, fontSize: 28, color: color.dim, marginTop: 14}}>Seen 1×</div></Appear>
      </div>
    </Appear>
    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 40}}>
      {versions.map((v, i) => {
        const p = pop(f, d + i * 9);
        return <React.Fragment key={v}>
          {i > 0 && <svg width={60} height={60} viewBox="0 0 60 60" style={{opacity: ramp(f, d + i * 9 - 6, d + i * 9)}}>
            <path d="M8 40 Q30 4 52 40" stroke={color.red} strokeWidth={5} fill="none" strokeLinecap="round" /><path d="M44 34 L52 40 L46 48" stroke={color.red} strokeWidth={5} fill="none" strokeLinecap="round" /></svg>}
          <Appear p={p} scale>
            <div style={{width: 150, height: 150, borderRadius: 75, border: `4px solid ${color.red}`, background: `${color.red}1c`, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center'}}>
              <div style={{fontFamily: mono, fontSize: 38, fontWeight: 900, color: color.text}}>{v}</div>
              <div style={{fontFamily: font, fontSize: 24, color: color.red}}>第 {i + 1} 次</div>
            </div>
          </Appear>
        </React.Fragment>;
      })}
    </div>
    <Appear p={pop(f, d + 40)} style={{textAlign: 'center', marginTop: 18}}><P size={34} c={color.text}>同一个问题，返工了 4 次</P></Appear>
  </Root>;
};

/* seen — three separate days → moves into code-standards.md as a hard rule */
const Seen: React.FC<SceneProps> = ({f, cue}) => {
  const pop = usePop();
  const [a, b, c, d] = [cue('a', 56), cue('b', 147), cue('c', 250), cue('d', 332)];
  const days = ['10-05', '10-06', '10-07'];
  const n = f < a ? 1 : Math.min(3, 1 + Math.floor((f - a) / 18));
  const move = ease.inOutCubic(prog(f, b, 24));
  return <Root f={f} beats={[0, a, b, c, d]} glow={B}>
    <Appear p={pop(f, 0)}><H size={60}>关键是最后那行 Seen</H></Appear>
    <div style={{display: 'flex', alignItems: 'center', gap: 26, marginTop: 24}}>
      <Panel glow={n === 3 ? B : undefined} style={{padding: '18px 30px', textAlign: 'center'}}>
        <div style={{fontFamily: mono, fontSize: 30, color: color.dim}}>Seen</div>
        <div style={{fontFamily: mono, fontSize: 96, fontWeight: 900, color: n === 3 ? B : color.text, lineHeight: 1}}>{n}×</div>
      </Panel>
      <div style={{display: 'flex', gap: 12, flexWrap: 'wrap'}}>
        {days.map((dd, i) => <Appear key={dd} p={pop(f, a + i * 18)} scale><Chip c={color.amber} style={{fontSize: 34}}>{dd}</Chip></Appear>)}
        <Appear p={pop(f, a + 50)}><P size={30}>3 个不同的日子都被抓到</P></Appear>
      </div>
    </div>
    <div style={{position: 'relative', height: 430, marginTop: 26}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 150, borderRadius: 22, border: `3px dashed ${A}`, padding: '14px 22px'}}>
        <span style={{fontFamily: mono, fontSize: 30, color: A}}>LESSONS.md</span><span style={{fontFamily: font, fontSize: 32, color: A, marginLeft: 14, fontWeight: 900}}>错题本</span>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 250, height: 170, borderRadius: 22, border: `3px solid ${B}`, background: `${B}12`, padding: '14px 22px'}}>
        <span style={{fontFamily: mono, fontSize: 30, color: B}}>docs/code-standards.md</span><span style={{fontFamily: font, fontSize: 32, color: B, marginLeft: 14, fontWeight: 900}}>硬规则</span>
      </div>
      <div style={{position: 'absolute', left: 40, right: 40, top: 56 + move * 272, padding: '14px 20px', borderRadius: 16, background: '#18213a',
        border: `2px solid ${move > 0.5 ? B : A}`, fontFamily: font, fontSize: 34, color: color.text, boxShadow: '0 12px 30px rgba(0,0,0,0.4)'}}>
        同类的 bug 要一起修掉 <span style={{fontFamily: mono, fontSize: 26, color: color.dim}}>Seen {n}×</span>
      </div>
      <div style={{position: 'absolute', right: 10, top: 180}}>
        <Stamp t={f / 30} at={(b + 26) / 30} text="硬规则" color={B} size={54} deg={-8} font={font} style={{position: 'relative'}} />
      </div>
    </div>
    <div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 24}}>
      <Appear p={pop(f, c)} dy={16} style={{display: 'flex', alignItems: 'center', gap: 12}}>
        <span style={{fontFamily: font, fontSize: 34, color: color.text}}>每个 PR 逐条对</span>
        {[0, 1, 2].map((i) => <Check key={i} p={ramp(f, c + 6 + i * 8, c + 16 + i * 8)} size={44} c={color.cyan} />)}
      </Appear>
      <Appear p={pop(f, d)} scale style={{marginLeft: 'auto'}}><Chip c={B} style={{fontSize: 34}}>Done right 也记</Chip></Appear>
    </div>
  </Root>;
};

const PROMOTED = [
  {zh: '同类的 bug 要一起修掉', en: 'A fix reaches every sibling of the bug'},
  {zh: 'main 上挂掉的测试，就是马上要修的 bug', en: 'A test that fails on main is a bug to fix now'},
  {zh: '打 tag 之前，CI 必须全绿', en: 'A tag waits for a green run'},
];

/* promoted — 8 → 15 hard rules; three examples */
const Promoted: React.FC<SceneProps> = ({f, cue}) => {
  const pop = usePop();
  const [a, b, c, d] = [cue('a', 96), cue('b', 324), cue('c', 376), cue('d', 459)];
  const n = f < a ? 8 : Math.round(8 + 7 * ease.outCubic(prog(f, a, 40)));
  return <Root f={f} beats={[0, a, a + 70, a + 140, b, c, d]} glow={B}>
    <div style={{display: 'flex', alignItems: 'flex-end', gap: 22}}>
      <div style={{fontFamily: mono, fontSize: 150, fontWeight: 900, color: B, lineHeight: 0.9}}>{n}</div>
      <div><H size={52}>条硬规则</H><P size={30}>{f < a ? '原文发出时（10-12）' : '10 月 15 日再看'}</P></div>
    </div>
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginTop: 26}}>
      {Array.from({length: 15}, (_, i) => {
        const lit = i < 8 ? 1 : ramp(f, a + (i - 8) * 6, a + (i - 8) * 6 + 10);
        const pick = (i === 0 && f >= b) || (i === 2 && f >= c) || (i === 13 && f >= d);
        return <div key={i} style={{height: 74, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: mono, fontSize: 32, fontWeight: 800, color: pick ? '#0a0e1a' : lit > 0.5 ? B : '#2a3352',
          background: pick ? B : `${B}${lit > 0.5 ? '1c' : '05'}`, border: `2px solid ${lit > 0.5 ? B : '#2a3352'}`, transform: `scale(${0.85 + 0.15 * lit})`}}>
          {String(i + 1).padStart(2, '0')}</div>;
      })}
    </div>
    <Appear p={pop(f, a + 60)} style={{marginTop: 18}}><P size={30}>每一条都标着 3 个日期，从错题本搬过来</P></Appear>
    <div style={{marginTop: 18}}>
      {PROMOTED.map((r, i) => {
        const at = [b, c, d][i];
        const sw = sway(f / 30, i * 1.3, {dy: 2, deg: 0.3});
        return <Appear key={r.en} p={pop(f, at)} dy={24} style={{marginTop: 14, transform: `translateY(${sw.dy}px)`}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '16px 22px', borderRadius: 18, background: '#121a2e', border: `2px solid ${B}88`}}>
            <Check p={ramp(f, at, at + 12)} size={44} c={B} />
            <div>
              <div style={{fontFamily: font, fontSize: 36, fontWeight: 800, color: color.text}}>{r.zh}</div>
              <div style={{fontFamily: mono, fontSize: 22, color: color.dim}}>{r.en}</div>
            </div>
          </div>
        </Appear>;
      })}
    </div>
  </Root>;
};

/* crash — the day before the mistake log: 168 releases, 40 fixing fresh releases, CI cancelled */
const Crash: React.FC<SceneProps> = ({f, cue}) => {
  const pop = usePop();
  const [a, b, c] = [cue('a', 151), cue('b', 233), cue('c', 305)];
  const shown = f < a ? 0 : Math.min(168, Math.floor((f - a) * 3.2));
  const red = (i: number) => f >= b && (i * 37) % 168 < 40;
  return <Root f={f} beats={[0, a, b, c]} glow={color.red}>
    <Appear p={pop(f, 0)} dy={20}>
      <Panel glow={A} style={{padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16}}>
        <span style={{fontFamily: mono, fontSize: 30, color: color.dim}}>303819c5</span>
        <span style={{fontFamily: font, fontSize: 34, color: color.text}}>10-06 凌晨 3:10</span>
        <span style={{marginLeft: 'auto', fontFamily: font, fontSize: 34, fontWeight: 900, color: A}}>错题本 第一版</span>
      </Panel>
    </Appear>
    <Appear p={pop(f, a - 10)} style={{marginTop: 26}}>
      <div style={{display: 'flex', alignItems: 'baseline', gap: 16}}>
        <H size={52}>前一天 10-05：</H>
        <span style={{fontFamily: mono, fontSize: 80, fontWeight: 900, color: color.amber}}>{shown}</span><H size={44}>个版本</H>
      </div>
    </Appear>
    <div style={{display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 14}}>
      {Array.from({length: shown}, (_, i) => <div key={i} style={{width: 36, height: 18, borderRadius: 4, background: red(i) ? color.red : `${color.amber}aa`}} />)}
    </div>
    <Appear p={pop(f, b)} style={{marginTop: 14}}><Chip c={color.red} style={{fontSize: 36}}>约 40 个在修刚发出去的版本</Chip></Appear>
    <Panel style={{marginTop: 22, padding: '16px 22px'}}>
      <div style={{fontFamily: font, fontSize: 30, color: color.dim, marginBottom: 6}}>CI 每轮都被下一次 push 取消（示意）</div>
      {[0, 1, 2, 3].map((i) => {
        const cut = ramp(f, c + i * 10, c + i * 10 + 8);
        return <div key={i} style={{display: 'flex', alignItems: 'center', gap: 14, height: 54}}>
          <span style={{fontFamily: mono, fontSize: 28, color: color.text}}>CI · v0.1.{877 + i * 5}</span>
          <div style={{flex: 1, height: 12, borderRadius: 6, background: '#1b2238', position: 'relative'}}>
            <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${30 + i * 8}%`, borderRadius: 6, background: cut > 0.5 ? '#3a4466' : color.cyan}} />
          </div>
          <span style={{fontFamily: font, fontSize: 30, fontWeight: 800, color: color.red, opacity: cut, whiteSpace: 'nowrap'}}>✗ 已取消</span>
        </div>;
      })}
    </Panel>
  </Root>;
};

/* brake — one rule; releases per day 168 → 42 → 15–26 */
const Brake: React.FC<SceneProps> = ({f, cue}) => {
  const pop = usePop();
  const [a, b, c, d, e] = [cue('a', 57), cue('b', 140), cue('c', 194), cue('d', 356), cue('e', 272)];
  const bars = [{day: '10-05', v: 168, at: 0, col: color.red}, {day: '10-06', v: 42, at: b, col: color.amber}, {day: '10-07', v: 15, at: c, col: color.cyan},
    {day: '之后', v: 26, lo: 15, at: c + 20, col: color.cyan}];
  return <Root f={f} beats={[0, a, b, c, c + 45, e, d]} glow={color.cyan}>
    <Appear p={pop(f, a)} dy={24}>
      <div style={{display: 'flex', alignItems: 'center', gap: 18, padding: '20px 24px', borderRadius: 20, background: '#121a2e', border: `3px solid ${A}`}}>
        <svg width={64} height={64} viewBox="0 0 64 64"><circle cx={32} cy={32} r={26} fill={f >= a + 16 ? B : '#2a3352'} /><circle cx={32} cy={32} r={12} fill="#0a0e1a" opacity={0.35} /></svg>
        <div>
          <div style={{fontFamily: font, fontSize: 36, fontWeight: 900, color: color.text}}>打 tag 前，CI 必须跑完、全绿</div>
          <div style={{fontFamily: font, fontSize: 28, color: A}}>错题本第一版就加的一条</div>
        </div>
      </div>
    </Appear>
    <Appear p={pop(f, 0)} style={{marginTop: 26}}><H size={48}>每天发版数</H></Appear>
    <div style={{display: 'flex', alignItems: 'flex-end', gap: 30, height: 420, marginTop: 10, padding: '0 20px', borderBottom: '3px solid #2a3352'}}>
      {bars.map((x) => {
        const g = ease.outCubic(prog(f, x.at, 22));
        const h = x.v / 168 * 350 * g;
        return <div key={x.day} style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%'}}>
          <div style={{fontFamily: mono, fontSize: 40, fontWeight: 900, color: x.col, opacity: g}}>{x.lo ? `${x.lo}–${x.v}` : x.v}</div>
          <div style={{width: '100%', height: h, borderRadius: '14px 14px 0 0', background: x.lo ? `linear-gradient(180deg, ${x.col}55, ${x.col})` : x.col}} />
        </div>;
      })}
    </div>
    {/* holds the "15 到 26 之间" line: an arrow from 168 down to the new band */}
    <div style={{position: 'relative', height: 0}}>
      <svg width={880} height={420} viewBox="0 0 880 420" style={{position: 'absolute', left: 0, top: -440, overflow: 'visible', pointerEvents: 'none'}}>
        <path d="M150 50 Q520 40 760 300" stroke={color.amber} strokeWidth={8} fill="none" strokeLinecap="round" strokeDasharray={800}
          strokeDashoffset={800 * (1 - ease.inOutCubic(prog(f, c + 45, 22)))} />
        <path d="M736 286 L762 306 L770 274" stroke={color.amber} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={ramp(f, c + 62, c + 68)} />
      </svg>
      <Appear p={pop(f, c + 64)} scale style={{position: 'absolute', left: 250, top: -318}}><Chip c={color.amber} style={{fontSize: 38}}>降了约九成</Chip></Appear>
    </div>
    <div style={{display: 'flex', gap: 30, padding: '10px 20px 0'}}>
      {bars.map((x) => <div key={x.day} style={{flex: 1, textAlign: 'center', fontFamily: mono, fontSize: 30, color: color.dim}}>{x.day}</div>)}
    </div>
    <div style={{display: 'flex', justifyContent: 'center', gap: 22, marginTop: 18}}>
      {['开会', '发通知'].map((t, i) => {
        const strike = ramp(f, e + 14 + i * 10, e + 24 + i * 10);
        return <Appear key={t} p={pop(f, e + i * 8)} scale>
          <div style={{position: 'relative', fontFamily: font, fontSize: 40, fontWeight: 800, color: color.dim, padding: '10px 30px', borderRadius: 16, border: '2px solid #3a4466'}}>
            {t}
            <div style={{position: 'absolute', left: 14, right: 14, top: '50%', height: 5, borderRadius: 3, background: color.red, transform: `scaleX(${strike})`, transformOrigin: 'left'}} />
          </div>
        </Appear>;
      })}
    </div>
    <div style={{position: 'relative', height: 130, display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 34}}>
      <Stamp t={f / 30} at={d / 30} text="没开会，自己踩了刹车" color={color.amber} size={50} deg={-5} font={font} style={{position: 'relative'}} />
    </div>
  </Root>;
};

/* accept — six criteria, three unusual ones */
const Accept: React.FC<SceneProps> = ({f, cue}) => {
  const pop = usePop();
  const [a, b, c] = [cue('a', 137), cue('b', 244), cue('c', 354)];
  const cards = [
    {t: '回退测试', d: '旧代码放回去，新测试必须真挂（FAIL）', icon: '↶', at: a, col: color.red},
    {t: '真实使用', d: '改了哪家厂商，就拿真账号、真配置去验', icon: '⚿', at: b, col: color.amber},
    {t: '没跑的写出来', d: '没跑的检查列为 Not run，不能省略', icon: '∅', at: c, col: color.violet},
  ];
  return <Root f={f} beats={[0, a, b, c]} glow={color.violet}>
    <Appear p={pop(f, 0)}><H size={60}>6 条验收标准，全过才合并</H></Appear>
    <div style={{display: 'flex', gap: 10, marginTop: 20}}>
      {Array.from({length: 6}, (_, i) => {
        const special = [0, 3, 5].indexOf(i);
        const on = special >= 0 && f >= cards[special].at;
        return <Appear key={i} p={pop(f, 6 + i * 4)} scale style={{flex: 1}}>
          <div style={{height: 70, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: mono, fontSize: 34, fontWeight: 900,
            color: on ? '#0a0e1a' : color.dim, background: on ? cards[special].col : 'rgba(255,255,255,0.05)', border: `2px solid ${on ? cards[special].col : '#2a3352'}`}}>{i + 1}</div>
        </Appear>;
      })}
    </div>
    <Appear p={pop(f, 24)}><P size={30} style={{marginTop: 10}}>三平台编译、沙箱跑测试这些常规的之外，有三条很少见：</P></Appear>
    <div style={{marginTop: 14}}>
      {cards.map((k) => (
        <Appear key={k.t} p={pop(f, k.at)} dy={30} style={{marginTop: 18}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 22, padding: '22px 26px', borderRadius: 22, background: '#121a2e', border: `3px solid ${k.col}`}}>
            <div style={{width: 92, height: 92, borderRadius: 24, background: `${k.col}26`, border: `2px solid ${k.col}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: mono, fontSize: 56, color: k.col, flex: 'none'}}>{k.icon}</div>
            <div>
              <div style={{fontFamily: font, fontSize: 44, fontWeight: 900, color: color.text}}>{k.t}</div>
              <div style={{fontFamily: font, fontSize: 34, color: color.text, opacity: 0.85, marginTop: 4}}>{k.d}</div>
            </div>
          </div>
        </Appear>
      ))}
    </div>
  </Root>;
};

/* pr — a merge comment with Red check / Break check / Not run, and the reviewed-head merge */
const Pr: React.FC<SceneProps> = ({f, cue}) => {
  const pop = usePop();
  const [a, b, c, d] = [cue('a', 68), cue('b', 119), cue('c', 217), cue('d', 279)];
  const lines = [
    {k: 'Red check', v: '旧代码放回去，新测试 FAIL', at: a, ok: true},
    {k: 'Break check', v: '故意改坏，测试抓到了', at: b, ok: true},
    {k: 'Not run', v: '真机没测，就写没测', at: c, ok: false},
  ];
  const cmd = 'gh pr merge --match-head-commit <审过的 sha>';
  return <Root f={f} beats={[0, a, b, c, d, d + 50]} glow={color.cyan}>
    <Appear p={pop(f, 0)}><H size={56}>合并前，PR 里留的评论</H></Appear>
    <Appear p={pop(f, 4)} dy={30} style={{marginTop: 18}}>
      <Window title="PR #1339 · 合并前评论（原文举例）" bodyStyle={{padding: 24}}>
        {lines.map((l) => (
          <Appear key={l.k} p={pop(f, l.at)} dy={14} style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16}}>
            {l.ok ? <Check p={ramp(f, l.at, l.at + 12)} size={46} c={B} />
              : <div style={{width: 46, height: 46, borderRadius: 23, border: `3px solid ${color.dim}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: mono, fontSize: 30, color: color.dim}}>–</div>}
            <div>
              <div style={{fontFamily: mono, fontSize: 36, fontWeight: 800, color: l.ok ? color.text : color.dim}}>{l.k}</div>
              <div style={{fontFamily: font, fontSize: 36, color: l.ok ? color.text : color.dim}}>{l.v}</div>
            </div>
          </Appear>
        ))}
      </Window>
    </Appear>
    <Appear p={pop(f, d)} dy={30} style={{marginTop: 26}}>
      <div style={{background: '#0d1220', borderRadius: 20, border: `2px solid ${color.panelBorder}`, padding: '20px 24px', fontFamily: mono, fontSize: 30, lineHeight: 1.6}}>
        <div style={{color: color.text}}><span style={{color: B}}>$ </span>{typed(cmd, f / 30, d / 30, 40)}</div>
        {f >= d + 34 && <div style={{color: color.amber}}>⚠ 审查期间有人 push 了新 commit</div>}
        {f >= d + 52 && <div style={{color: color.red, fontWeight: 800}}>✗ 合并失败：head 已经变了</div>}
      </div>
    </Appear>
    <Appear p={pop(f, d + 70)} style={{marginTop: 14}}><P size={32} c={color.text}>没审过的代码，进不来</P></Appear>
  </Root>;
};

/* human — people set direction and guard the gates; one-line complaints become verifiable changes */
const Human: React.FC<SceneProps> = ({f, cue}) => {
  const pop = usePop();
  const [a, b, c, d] = [cue('a', 36), cue('b', 107), cue('c', 190), cue('d', 288)];
  const grow = ease.outCubic(prog(f, d, 50));
  return <Root f={f} beats={[0, a, b, c, d]} glow={color.amber}>
    <Appear p={pop(f, 0)}><H size={60}>人：管方向，守闸门</H></Appear>
    {[{t: '拍过板的产品决定，PR 不能推翻', s: 'Don\'t reverse deliberate decisions.', at: a}, {t: '风险检查命中，等维护者放行', s: '安全闸门', at: b}].map((g) => (
      <Appear key={g.t} p={pop(f, g.at)} dy={24} style={{marginTop: 20}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18, padding: '18px 22px', borderRadius: 20, background: '#121a2e', border: `3px solid ${color.amber}`}}>
          <svg width={58} height={58} viewBox="0 0 58 58"><rect x={6} y={8} width={46} height={10} rx={3} fill={color.amber} /><rect x={10} y={18} width={6} height={34} fill={color.amber} /><rect x={42} y={18} width={6} height={34} fill={color.amber} />
            <circle cx={29} cy={36} r={6} fill={Math.floor(f / 15) % 2 ? color.red : '#5a2a2a'} /></svg>
          <div>
            <div style={{fontFamily: font, fontSize: 36, fontWeight: 900, color: color.text}}>{g.t}</div>
            <div style={{fontFamily: mono, fontSize: 24, color: color.dim}}>{g.s}</div>
          </div>
        </div>
      </Appear>
    ))}
    <Appear p={pop(f, c)} dy={24} style={{marginTop: 30}}>
      <div style={{display: 'flex', justifyContent: 'flex-start'}}>
        <div style={{background: 'linear-gradient(135deg, #3a2a10, #2b2140)', border: `2px solid ${color.amber}88`, borderRadius: '28px 28px 28px 8px',
          padding: '18px 26px', fontFamily: mono, fontSize: 34, color: color.text}}>(the owner: 这个太丑了)</div>
      </div>
    </Appear>
    <Appear p={pop(f, d)} dy={24} style={{marginTop: 22}}>
      <Panel style={{padding: '18px 22px'}}>
        <div style={{fontFamily: font, fontSize: 30, color: color.cyan, marginBottom: 10}}>agent 补齐：一条能验证的改动</div>
        {Array.from({length: 7}, (_, i) => (
          <div key={i} style={{height: 16, borderRadius: 8, marginTop: 10, background: '#2a3352', width: `${(60 + ((i * 37) % 40)) * Math.min(1, Math.max(0, grow * 7 - i))}%`}} />
        ))}
      </Panel>
    </Appear>
  </Root>;
};

/* diy — the template, the daily review, three days → standards */
const Diy: React.FC<SceneProps> = ({f, cue}) => {
  const pop = usePop();
  const [a, b, c] = [cue('a', 83), cue('b', 195), cue('c', 334)];
  const tpl = ['**<一句话规则>**', '- <哪个 commit / issue 出的事，后果是什么>', '- <修复的 commit>', '- Done right: <做对的例子>', '- Seen N× (YYYY-MM-DD)'];
  const spin = (f - b) * 4;
  return <Root f={f} beats={[0, a, a + 50, b, c]} glow={A}>
    <Appear p={pop(f, 0)}><H size={60}>自己搭一套：抄这本错题本</H></Appear>
    <Appear p={pop(f, 6)} dy={30} style={{marginTop: 18}}>
      <Window title="LESSONS.md · 每条长这样" bodyStyle={{fontFamily: mono, fontSize: 32, lineHeight: 1.55, minHeight: 280}}>
        {tpl.map((l, i) => <div key={l} style={{color: i === 0 ? A : color.text, whiteSpace: 'pre'}}>{typed(l, f / 30, (a + i * 10) / 30, 40)}</div>)}
      </Window>
    </Appear>
    <div style={{display: 'flex', alignItems: 'center', gap: 22, marginTop: 30}}>
      <Appear p={pop(f, b)} scale>
        <svg width={170} height={170} viewBox="0 0 170 170" style={{transform: `rotate(${f >= b ? spin : 0}deg)`}}>
          <circle cx={85} cy={85} r={66} stroke={color.cyan} strokeWidth={8} fill="none" strokeDasharray="300 115" strokeLinecap="round" />
          <path d="M136 36 L152 52 L130 60" stroke={color.cyan} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Appear>
      <Appear p={pop(f, b)} dy={20}>
        <H size={44}>每天复盘一次</H>
        <div style={{display: 'flex', gap: 10, marginTop: 10}}>
          {['返工的', '不该合的', '验证太弱的'].map((t, i) => <Appear key={t} p={pop(f, b + 10 + i * 8)} scale><Chip c={[color.red, color.amber, color.violet][i]} style={{fontSize: 30}}>{t}</Chip></Appear>)}
        </div>
      </Appear>
    </div>
    <Appear p={pop(f, c)} dy={24} style={{marginTop: 30}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '20px 24px', borderRadius: 20, background: `${B}12`, border: `3px solid ${B}`}}>
        <span style={{fontFamily: mono, fontSize: 40, fontWeight: 900, color: B}}>Seen 3×</span>
        <span style={{fontFamily: font, fontSize: 40, color: color.text}}>→ 升进代码规范</span>
      </div>
    </Appear>
  </Root>;
};

/* outro — three strikes */
const Outro: React.FC<SceneProps & {credit: string}> = ({f, cue, credit}) => {
  const pop = usePop();
  const [a, b, c] = [cue('a', 110), cue('b', 224), cue('c', 287)];
  return <Root f={f} beats={[0, a, b, c]} glow={B}>
    <Appear p={pop(f, 0)} style={{textAlign: 'center'}}><H size={56}>犯过的错写下来</H></Appear>
    <Appear p={pop(f, 10)} style={{textAlign: 'center'}}><P size={36}>agent 下次启动一定会读到</P></Appear>
    <div style={{display: 'flex', justifyContent: 'center', gap: 28, marginTop: 36}}>
      {[0, 1, 2].map((i) => {
        const p = pop(f, 30 + i * 22);
        return <Appear key={i} p={p} scale>
          <div style={{width: 150, height: 150, borderRadius: 28, border: `4px solid ${i < 2 ? A : B}`, background: `${i < 2 ? A : B}1a`, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center'}}>
            <div style={{fontFamily: font, fontSize: 30, color: color.dim}}>第 {i + 1} 天</div>
            <div style={{fontFamily: mono, fontSize: 54, fontWeight: 900, color: i < 2 ? A : B}}>✗</div>
          </div>
        </Appear>;
      })}
    </div>
    <div style={{position: 'relative', height: 170, display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 20}}>
      <Stamp t={f / 30} at={a / 30} text="事不过三 → 硬规则" color={B} size={60} deg={-5} font={font} style={{position: 'relative'}} />
    </div>
    <Appear p={pop(f, b)} style={{textAlign: 'center', marginTop: 10}}><H size={52} c={color.amber}>你会让 AI 维护自己的项目吗？</H></Appear>
    <Appear p={pop(f, c)} style={{display: 'flex', justifyContent: 'center', gap: 16, marginTop: 26}}>
      <Chip c={color.cyan} style={{fontSize: 32}}>评论区聊聊</Chip><Chip c={color.pink} style={{fontSize: 32}}>点赞</Chip><Chip c={color.amber} style={{fontSize: 32}}>收藏</Chip>
    </Appear>
    <Appear p={pop(f, c + 10)} style={{marginTop: 26}}><P size={22} style={{textAlign: 'center'}}>{credit}</P></Appear>
  </Root>;
};

export const magpieLessonsScenes: Record<string, React.FC<SceneProps & {credit: string}>> = {
  'mg.hook': Hook,
  'mg.compare': Compare,
  'mg.files': Files,
  'mg.nightly': Nightly,
  'mg.entry': Entry,
  'mg.seen': Seen,
  'mg.promoted': Promoted,
  'mg.crash': Crash,
  'mg.brake': Brake,
  'mg.accept': Accept,
  'mg.pr': Pr,
  'mg.human': Human,
  'mg.diy': Diy,
  'mg.outro': Outro,
};
