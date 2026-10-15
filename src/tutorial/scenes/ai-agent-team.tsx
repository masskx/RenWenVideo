import React from 'react';
import {color, font, mono} from '../theme';
import {Appear, Check, Chip, CueGlow, Panel, SceneProps, Window, ramp, usePop} from '../ui';
import {Stamp, ease, prog, shake, sway, typed} from '../../fx';

// 一个人带 AI 团队 (Rahul's article on running a team of AI agents in one group chat, Teamily AI).
// Storyboard: tutorials/ai-agent-team.storyboard.md. The chat UI is drawn from the article's description,
// not from screenshots. A = 交接 (pink: every agent-to-agent handoff), B = 拍板 (green: the human).
// Role colours avoid pink and green; ticks are cyan.

const A = color.keyA;
const B = color.keyB;
const ROLE = {
  res: {zh: '趋势调研员', short: '调研', en: 'Trend Researcher', c: color.cyan},
  wri: {zh: '文案', short: '文案', en: 'Content Creator', c: color.violet},
  dev: {zh: '网页开发', short: '开发', en: 'Webpage Developer', c: color.amber},
  rev: {zh: '审核编辑', short: '审核', en: 'Verification Editor', c: color.red},
};
type RoleKey = keyof typeof ROLE;
const ORDER: RoleKey[] = ['res', 'wri', 'dev', 'rev'];

const H: React.FC<{size?: number; c?: string; style?: React.CSSProperties; children: React.ReactNode}> = ({size = 60, c = color.text, style, children}) => (
  <div style={{fontFamily: font, fontWeight: 900, fontSize: size, color: c, lineHeight: 1.25, ...style}}>{children}</div>
);
const P: React.FC<{size?: number; c?: string; style?: React.CSSProperties; children: React.ReactNode}> = ({size = 36, c = color.dim, style, children}) => (
  <div style={{fontFamily: font, fontSize: size, color: c, lineHeight: 1.45, ...style}}>{children}</div>
);
/** Scene root: cue-following glow behind, optional shake (frames) on stamp hits. */
const Root: React.FC<{f: number; beats: number[]; glow?: string; hits?: number[]; children: React.ReactNode}> = ({f, beats, glow = color.violet, hits = [], children}) => {
  const k = shake(f / 30, hits.map((h) => h / 30), {amp: 10});
  return <div style={{position: 'relative', isolation: 'isolate', height: 960, transform: `translate(${k.dx}px, ${k.dy}px)`}}>
    <CueGlow f={f} beats={beats} c={glow} />{children}
  </div>;
};
const Abs: React.FC<{x: number; y: number; w?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({x, y, w, style, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, ...style}}>{children}</div>
);

/** Line-art robot: an agent. */
const Bot: React.FC<{size?: number; c?: string; on?: number}> = ({size = 64, c = color.cyan, on = 1}) => (
  <svg width={size} height={size} viewBox="0 0 64 64" style={{opacity: 0.35 + 0.65 * on, flex: 'none'}}>
    <line x1={32} y1={6} x2={32} y2={14} stroke={c} strokeWidth={3} strokeLinecap="round" />
    <circle cx={32} cy={6} r={3.5} fill={c} />
    <rect x={10} y={14} width={44} height={36} rx={10} fill={`${c}22`} stroke={c} strokeWidth={3} />
    <circle cx={24} cy={31} r={4.5} fill={c} /><circle cx={40} cy={31} r={4.5} fill={c} />
    <path d="M24 42 Q32 46 40 42" stroke={c} strokeWidth={3} fill="none" strokeLinecap="round" />
  </svg>
);
/** Line-art person: the human (always B green). */
const Person: React.FC<{size?: number; c?: string; on?: number}> = ({size = 64, c = B, on = 1}) => (
  <svg width={size} height={size} viewBox="0 0 64 64" style={{opacity: 0.35 + 0.65 * on, flex: 'none'}}>
    <circle cx={32} cy={21} r={11} fill={`${c}22`} stroke={c} strokeWidth={3} />
    <path d="M12 56 Q12 36 32 36 Q52 36 52 56 Z" fill={`${c}22`} stroke={c} strokeWidth={3} strokeLinejoin="round" />
  </svg>
);
/** Round avatar for a role or the human. */
const Av: React.FC<{who: RoleKey | 'me'; size?: number; on?: number; ring?: number}> = ({who, size = 96, on = 1, ring = 0}) => {
  const c = who === 'me' ? B : ROLE[who].c;
  return <div style={{width: size, height: size, borderRadius: size / 2, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: `${c}${on > 0.5 ? '22' : '08'}`, border: `3px solid ${on > 0.5 ? c : '#2a3352'}`, boxShadow: ring ? `0 0 ${30 * ring}px ${c}` : undefined}}>
    {who === 'me' ? <Person size={size * 0.68} on={on} /> : <Bot size={size * 0.68} c={ROLE[who].c} on={on} />}
  </div>;
};
/** Chat message: avatar, name, text (typed from `at` when `cps` is set). */
const Msg: React.FC<{f: number; at: number; who: RoleKey | 'me'; text: React.ReactNode | string; cps?: number; size?: number; style?: React.CSSProperties}> = ({f, at, who, text, cps, size = 36, style}) => {
  const pop = usePop();
  const c = who === 'me' ? B : ROLE[who].c;
  const name = who === 'me' ? 'Rahul（人）' : ROLE[who].zh;
  const body = typeof text === 'string' && cps ? typed(text, f / 30, at / 30, cps) : text;
  const typing = typeof text === 'string' && cps ? (body as string).length < text.length : false;
  return <Appear p={pop(f, at)} dy={24} style={{display: 'flex', gap: 16, alignItems: 'flex-start', ...style}}>
    <Av who={who} size={76} />
    <div style={{flex: 1}}>
      <div style={{fontFamily: font, fontSize: 26, fontWeight: 800, color: c}}>{name}</div>
      <div style={{marginTop: 4, display: 'inline-block', background: '#18213a', border: `2px solid ${c}66`, borderRadius: '6px 24px 24px 24px',
        padding: '14px 22px', fontFamily: font, fontSize: size, color: color.text, lineHeight: 1.4}}>
        {body}{typing && <span style={{opacity: Math.floor(f / 8) % 2 ? 1 : 0.2}}>▍</span>}
      </div>
    </div>
  </Appear>;
};
const At: React.FC<{who: RoleKey}> = ({who}) => <span style={{color: ROLE[who].c, fontWeight: 800}}>@{ROLE[who].zh}</span>;

/** Pink handoff arrow (A), drawn left→right with progress p. */
const Hand: React.FC<{p: number; w?: number; c?: string}> = ({p, w = 70, c = A}) => (
  <svg width={w} height={40} viewBox={`0 0 ${w} 40`} style={{flex: 'none', opacity: Math.min(1, p * 3)}}>
    <path d={`M4 20 L${w - 8} 20`} stroke={c} strokeWidth={6} strokeLinecap="round" strokeDasharray={w} strokeDashoffset={w * (1 - p)} />
    <path d={`M${w - 22} 8 L${w - 6} 20 L${w - 22} 32`} stroke={c} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={p > 0.8 ? 1 : 0} />
  </svg>
);
const Strike: React.FC<{p: number; c?: string; children: React.ReactNode; style?: React.CSSProperties}> = ({p, c = color.red, children, style}) => (
  <span style={{position: 'relative', display: 'inline-block', ...style}}>
    {children}
    <span style={{position: 'absolute', left: -4, right: -4, top: '52%', height: 5, borderRadius: 3, background: c, transform: `scaleX(${p})`, transformOrigin: 'left'}} />
  </span>
);
const Big: React.FC<{at: number; f: number; text: string; c: string; size?: number; deg?: number; h?: number; style?: React.CSSProperties}> = ({at, f, text, c, size = 56, deg = -5, h = 140, style}) => (
  <div style={{position: 'relative', height: h, display: 'flex', justifyContent: 'center', alignItems: 'center', ...style}}>
    <Stamp t={f / 30} at={at / 30} text={text} color={c} size={size} deg={deg} font={font} style={{position: 'relative'}} />
  </div>
);

/* hook — you are the glue between AI windows → one group that hands work on; you only make the call */
const Hook: React.FC<SceneProps> = ({f, cue}) => {
  const pop = usePop();
  const [a, b, c, d, e, g] = [cue('a', 75), cue('b', 115), cue('c', 155), cue('d', 242), cue('e', 334), cue('f', 359)];
  const merge = ease.inOutCubic(prog(f, d, 22));
  const wins = [{t: '查资料', at: a, x: 0, y: 40}, {t: '写稿', at: b, x: 560, y: 40}, {t: '检查', at: c, x: 290, y: 470}];
  const me = {x: 440, y: 300};
  // a document card shuttles between windows through "you" once window 2 is up
  const trip = f >= b ? ((f - b) % 50) / 50 : -1;
  const legs: [number, number][][] = f >= c ? [[[150, 120], [440, 300], [710, 120]], [[710, 120], [440, 300], [440, 550]], [[440, 550], [440, 300], [150, 120]]] : [[[150, 120], [440, 300], [710, 120]]];
  const leg = trip >= 0 ? legs[Math.floor((f - b) / 50) % legs.length] : null;
  const bz = (u: number, p: [number, number][]) => [(1 - u) ** 2 * p[0][0] + 2 * u * (1 - u) * p[1][0] + u * u * p[2][0], (1 - u) ** 2 * p[0][1] + 2 * u * (1 - u) * p[1][1] + u * u * p[2][1]];
  const doc = leg ? bz(ease.inOutCubic(trip), leg) : [0, 0];
  const copies = f < c ? 0 : Math.min(99, 3 + Math.floor((f - c) / 9));
  return <Root f={f} beats={[0, a, b, c, d, e]} glow={B} hits={[g]}>
    <Appear p={pop(f, 0)} style={{textAlign: 'center'}}><H size={68}>{f < d ? '你，是 AI 之间的胶水？' : '换个做法：组一个 AI 团队'}</H></Appear>
    <div style={{position: 'relative', height: 640, marginTop: 20}}>
      <div style={{opacity: 1 - merge, transform: `scale(${1 - 0.3 * merge})`, transformOrigin: '50% 45%', position: 'absolute', inset: 0}}>
        <svg width={880} height={640} style={{position: 'absolute', inset: 0}}>
          {wins.map((w) => <line key={w.t} x1={w.x + 150} y1={w.y + 80} x2={me.x} y2={me.y} stroke="#3a4466" strokeWidth={4} strokeDasharray="10 10"
            opacity={ramp(f, w.at, w.at + 8)} />)}
        </svg>
        {wins.map((w, i) => (
          <Abs key={w.t} x={w.x} y={w.y} w={300}>
            <Appear p={pop(f, w.at)} scale>
              <Window title={`AI 窗口 ${i + 1}`} bodyStyle={{padding: '18px 22px'}} style={{width: 300}}>
                <div style={{fontFamily: font, fontSize: 40, fontWeight: 900, color: color.text, textAlign: 'center'}}>{w.t}</div>
              </Window>
            </Appear>
          </Abs>
        ))}
        <Abs x={me.x - 70} y={me.y - 70}>
          <Appear p={pop(f, 4)} scale style={{textAlign: 'center'}}>
            <Av who="me" size={140} ring={0.4 + 0.3 * Math.sin(f / 6)} />
          </Appear>
        </Abs>
        <Abs x={me.x - 130} y={me.y + 80} w={260}><Appear p={pop(f, 8)}><P size={36} c={B} style={{textAlign: 'center', fontWeight: 900}}>你 = 胶水</P></Appear></Abs>
        {leg && <Abs x={doc[0] - 40} y={doc[1] - 30}>
          <div style={{width: 80, height: 60, borderRadius: 10, background: '#e8ecff', boxShadow: '0 8px 20px rgba(0,0,0,0.5)', padding: '10px 12px'}}>
            {[0, 1, 2].map((k) => <div key={k} style={{height: 6, borderRadius: 3, background: '#7c86a8', marginBottom: 7, width: `${90 - k * 22}%`}} />)}
          </div>
        </Abs>}
        <Abs x={600} y={400} w={280}>
          <Appear p={pop(f, c)} scale><Chip c={color.amber} style={{fontSize: 36}}>复制粘贴 ×{copies}</Chip></Appear>
        </Abs>
      </div>
      {f >= d && <div style={{position: 'absolute', left: 0, right: 0, top: 120, opacity: merge, transform: `scale(${0.8 + 0.2 * merge})`}}>
        <Panel style={{padding: '30px 26px'}}>
          <div style={{fontFamily: font, fontSize: 34, color: color.dim, marginBottom: 20, textAlign: 'center'}}>一个群：4 个 agent + 你</div>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            {ORDER.map((r, i) => <React.Fragment key={r}>
              {i > 0 && <Hand p={ease.outCubic(prog(f, e + (i - 1) * 6, 10))} w={60} />}
              <Av who={r} size={110} on={1} ring={f >= e + (i - 1) * 6 && f < e + i * 6 + 6 ? 0.8 : 0} />
            </React.Fragment>)}
          </div>
          <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20, marginTop: 26}}>
            <Av who="me" size={110} on={f >= g ? 1 : 0.4} ring={f >= g ? 0.6 : 0} />
            <div style={{fontFamily: font, fontSize: 40, fontWeight: 900, color: f >= g ? B : color.dim}}>你</div>
          </div>
        </Panel>
      </div>}
    </div>
    <Big f={f} at={g} text="你只管拍板" c={B} size={64} h={160} style={{marginTop: -30}} />
  </Root>;
};

/* idea — Teamily AI: a group chat where some members are agents; @ to assign, the next one picks up */
const Idea: React.FC<SceneProps> = ({f, cue}) => {
  const pop = usePop();
  const [a, b, c, d, e] = [cue('a', 79), cue('b', 129), cue('c', 176), cue('d', 230), cue('e', 314)];
  const glowWri = f >= c && f < d + 20 ? 1 : 0;
  return <Root f={f} beats={[0, a, b, c, d, e]} glow={color.cyan}>
    <Appear p={pop(f, 0)}><H size={60}>Teamily AI</H></Appear>
    <Appear p={pop(f, 8)}><P size={36} c={color.text}>说白了：一个有 agent 的群聊</P></Appear>
    <Appear p={pop(f, a)} dy={40} style={{marginTop: 22}}>
      <Window title="群聊 · 提示词库项目" bodyStyle={{padding: '20px 24px', minHeight: 600}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, paddingBottom: 16, borderBottom: '2px solid #1f2842'}}>
          <span style={{fontFamily: font, fontSize: 28, color: color.dim}}>成员</span>
          <Appear p={pop(f, a + 6)} scale><Av who="me" size={74} /></Appear>
          {ORDER.map((r, i) => <Appear key={r} p={pop(f, b + i * 7)} scale><Av who={r} size={74} ring={r === 'wri' ? glowWri : 0} /></Appear>)}
          <Appear p={pop(f, b + 30)} style={{marginLeft: 'auto'}}><Chip c={color.cyan} style={{fontSize: 28}}>4 个 agent</Chip></Appear>
        </div>
        <div style={{marginTop: 20, display: 'flex', flexDirection: 'column', gap: 16}}>
          {f >= c - 4 && <Msg f={f} at={c} who="me" text={<><At who="wri" /> 把页面文案写出来</>} />}
          {f >= d - 4 && <Msg f={f} at={d} who="wri" text={<>写好了 → <At who="dev" /> 接着建站</>} />}
          {f >= d + 24 && <Msg f={f} at={d + 28} who="dev" text="收到，读到上面的文案了" />}
        </div>
      </Window>
    </Appear>
    <div style={{display: 'flex', alignItems: 'center', gap: 20, marginTop: 24, justifyContent: 'center'}}>
      <Appear p={pop(f, d)} scale><Chip c={A} style={{fontSize: 36}}>做完就交接</Chip></Appear>
      <Appear p={pop(f, e)} scale><span style={{fontFamily: font, fontSize: 40, fontWeight: 900, color: color.text}}>
        <Strike p={ramp(f, e + 8, e + 18)}>复制粘贴</Strike></span></Appear>
    </div>
  </Root>;
};

/* task — scattered prompts → one copyable page; four jobs; normally four chat tabs and a human carrying */
const Task: React.FC<SceneProps> = ({f, cue}) => {
  const pop = usePop();
  const [a, b, c, d, e, g, h, k] = [cue('a', 54), cue('b', 120), cue('c', 191), cue('d', 228), cue('e', 249), cue('f', 269), cue('g', 289), cue('h', 314)];
  const gather = ease.inOutCubic(prog(f, b, 26));
  const jobs: {t: string; r: RoleKey; at: number}[] = [{t: '调研', r: 'res', at: d}, {t: '写稿', r: 'wri', at: e}, {t: '建站', r: 'dev', at: g}, {t: '审核', r: 'rev', at: h}];
  const run = f >= k ? Math.sin((f - k) / 9) : 0;
  return <Root f={f} beats={[0, a, b, c, d, h, k]} glow={color.amber}>
    <Appear p={pop(f, 0)}><H size={60}>真活：一页提示词库</H></Appear>
    <div style={{position: 'relative', height: 420, marginTop: 14}}>
      <Abs x={170} y={20} w={540}>
        <Appear p={pop(f, b)} scale>
          <Window url="prompts · 一页搞定" bodyStyle={{padding: '16px 22px', height: 280}}>
            {[0, 1, 2, 3].map((i) => <div key={i} style={{display: 'flex', alignItems: 'center', gap: 14, height: 62, opacity: ramp(f, b + 18 + i * 5, b + 26 + i * 5)}}>
              <span style={{fontFamily: mono, fontSize: 28, color: color.dim}}>#{i + 1}</span>
              <div style={{flex: 1, height: 12, borderRadius: 6, background: '#2a3352'}} />
              <span style={{fontFamily: font, fontSize: 26, fontWeight: 800, color: '#0a0e1a', background: color.amber, borderRadius: 10, padding: '2px 12px'}}>复制</span>
            </div>)}
          </Window>
        </Appear>
      </Abs>
      {Array.from({length: 8}, (_, i) => {
        const hx = [20, 640, 110, 560, 330, 720, 10, 450][i], hy = [10, 30, 230, 250, 0, 150, 330, 330][i];
        const tx = 300 + (i % 2) * 120, ty = 120 + Math.floor(i / 2) * 50;
        const fl = sway(f / 30, i * 1.1, {dy: 8, deg: 3});
        const x = hx + (tx - hx) * gather, y = hy + fl.dy + (ty - hy) * gather;
        return <Abs key={i} x={x} y={y}>
          <Appear p={pop(f, i * 3)} scale>
            <div style={{width: 150, padding: '10px 14px', borderRadius: 14, background: '#18213a', border: `2px solid ${color.panelBorder}`, opacity: 1 - gather,
              transform: `rotate(${fl.deg * (1 - gather)}deg) scale(${1 - 0.6 * gather})`}}>
              <div style={{fontFamily: font, fontSize: 24, color: color.dim}}>{['3 月', '5 月', '6 月', '7 月', '8 月', '9 月', '4 月', '10 月'][i]}的帖子</div>
              <div style={{height: 8, borderRadius: 4, background: '#3a4466', marginTop: 8}} /><div style={{height: 8, borderRadius: 4, background: '#3a4466', marginTop: 6, width: '70%'}} />
            </div>
          </Appear>
        </Abs>;
      })}
      <Abs x={0} y={0} w={880}>
        <div style={{opacity: 1 - ramp(f, b, b + 8)}}><Appear p={pop(f, a)}><Chip c={color.dim} style={{fontSize: 32}}>散在几个月的帖子里</Chip></Appear></div>
      </Abs>
    </div>
    <Appear p={pop(f, c)}><H size={48}>拆开是 4 件事</H></Appear>
    <div style={{display: 'flex', gap: 16, marginTop: 14}}>
      {jobs.map((j) => <Appear key={j.t} p={pop(f, j.at)} scale style={{flex: 1}}>
        <div style={{textAlign: 'center', padding: '16px 0', borderRadius: 20, border: `3px solid ${ROLE[j.r].c}`, background: `${ROLE[j.r].c}1c`}}>
          <Bot size={56} c={ROLE[j.r].c} />
          <div style={{fontFamily: font, fontSize: 42, fontWeight: 900, color: color.text}}>{j.t}</div>
        </div>
      </Appear>)}
    </div>
    <Appear p={pop(f, k)} dy={20} style={{marginTop: 24}}>
      <div style={{position: 'relative', height: 190, borderRadius: 20, border: '2px dashed #3a4466', padding: '18px 26px'}}>
        <span style={{fontFamily: font, fontSize: 36, color: color.text}}>平常：4 个聊天窗口，人在中间来回搬</span>
        <div style={{display: 'flex', gap: 120, marginTop: 14, paddingLeft: 30}}>{ORDER.map((r) => <Window key={r} title="" style={{width: 80}} bodyStyle={{padding: 8, height: 20}}><span /></Window>)}</div>
        <div style={{position: 'absolute', left: 390 + run * 330, top: 92}}><Person size={70} /></div>
      </div>
    </Appear>
  </Root>;
};

/* roles — four agents, each owns one job */
const DUTY: Record<RoleKey, string> = {res: '找粉丝真正收藏的内容', wri: '页面上每个字都归它', dev: '用 Website Builder 建站', rev: '检查一切，专门挑刺'};
const Roles: React.FC<SceneProps> = ({f, cue}) => {
  const pop = usePop();
  const at = {res: cue('a', 72), wri: cue('b', 162), dev: cue('c', 241), rev: cue('d', 312)};
  return <Root f={f} beats={[0, at.res, at.wri, at.dev, at.rev]} glow={color.violet}>
    <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
      <Appear p={pop(f, 0)}><H size={60}>建群，拉进 4 个 agent</H></Appear>
    </div>
    <Appear p={pop(f, 8)} style={{marginTop: 14, display: 'flex', alignItems: 'center', gap: 14}}>
      <Av who="me" size={70} /><P size={34} c={color.text}>群主：作者本人</P>
      <Chip c={color.dim} style={{fontSize: 26, marginLeft: 'auto'}}>Discover → Agents</Chip>
    </Appear>
    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 26}}>
      {ORDER.map((r, i) => {
        const p = pop(f, at[r]);
        const sw = sway(f / 30, i * 1.4, {dy: 3, deg: 0.6});
        return <div key={r} style={{height: 320, borderRadius: 24, border: `3px ${p > 0.1 ? 'solid' : 'dashed'} ${p > 0.1 ? ROLE[r].c : '#2a3352'}`,
          background: p > 0.1 ? `${ROLE[r].c}14` : 'transparent'}}>
          <Appear p={p} scale style={{padding: '22px 24px', transform: `translateY(${sw.dy}px) rotate(${sw.deg}deg) scale(${0.85 + 0.15 * p})`}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
              <Bot size={84} c={ROLE[r].c} />
              <div style={{fontFamily: mono, fontSize: 40, fontWeight: 900, color: ROLE[r].c}}>{i + 1}</div>
            </div>
            <div style={{fontFamily: font, fontSize: 48, fontWeight: 900, color: color.text, marginTop: 8}}>{ROLE[r].zh}</div>
            <div style={{fontFamily: mono, fontSize: 22, color: color.dim}}>{ROLE[r].en}</div>
            <div style={{fontFamily: font, fontSize: 30, color: color.text, marginTop: 10, lineHeight: 1.3, whiteSpace: 'nowrap'}}>{DUTY[r]}</div>
          </Appear>
        </div>;
      })}
    </div>
  </Root>;
};

/* rules — every agent: what it owns, where its input comes from, who's next; nothing ships until "ship it" */
const RULES: {r: RoleKey; own: string; input: string; next: string}[] = [
  {r: 'res', own: '调研', input: '我贴的数据', next: '文案'},
  {r: 'wri', own: '每个字', input: '调研报告', next: '开发'},
  {r: 'dev', own: '网站', input: '最新文案', next: '审核'},
  {r: 'rev', own: '质量', input: '整个页面', next: '作者'},
];
const Rules: React.FC<SceneProps> = ({f, cue}) => {
  const pop = usePop();
  const [a, b, c, d, e, g] = [cue('a', 52), cue('b', 102), cue('c', 119), cue('d', 152), cue('e', 196), cue('f', 334)];
  const cols = [{k: 'own', t: '管什么', at: b, c: color.cyan}, {k: 'input', t: '输入从哪来', at: c, c: color.violet}, {k: 'next', t: '交接给谁', at: d, c: A}] as const;
  const w = [210, 190, 260, 200];
  return <Root f={f} beats={[0, a, b, d, e, g]} glow={color.cyan} hits={[g]}>
    <Appear p={pop(f, 0)}><H size={60}>第一条消息：群规</H></Appear>
    <Appear p={pop(f, a - 10)} dy={30} style={{marginTop: 20}}>
      <Panel style={{padding: '18px 0 10px'}}>
        <div style={{display: 'flex', padding: '0 0 10px', borderBottom: '2px solid #1f2842'}}>
          <div style={{width: w[0], fontFamily: font, fontSize: 30, color: color.dim, paddingLeft: 24}}>谁</div>
          {cols.map((col, i) => {
            const on = ramp(f, col.at, col.at + 8);
            return <div key={col.k} style={{width: w[i + 1], textAlign: 'center'}}>
              <span style={{fontFamily: font, fontSize: 32, fontWeight: 900, color: on > 0.5 ? '#0a0e1a' : color.dim, background: on > 0.5 ? col.c : 'transparent',
                borderRadius: 12, padding: '4px 12px', display: 'inline-block', transform: `scale(${1 + 0.12 * Math.sin(Math.PI * on)})`}}>{col.t}</span>
            </div>;
          })}
        </div>
        {RULES.map((row, i) => {
          const shown = ramp(f, a + i * 8, a + i * 8 + 10);
          return <div key={row.r} style={{display: 'flex', alignItems: 'center', height: 86, borderBottom: i < 3 ? '1px solid #1f2842' : undefined, opacity: shown,
            transform: `translateX(${(1 - shown) * 30}px)`}}>
            <div style={{width: w[0], display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 20}}>
              <Bot size={50} c={ROLE[row.r].c} /><span style={{fontFamily: font, fontSize: 34, fontWeight: 800, color: ROLE[row.r].c, whiteSpace: 'nowrap'}}>{ROLE[row.r].short}</span>
            </div>
            {cols.map((col, k) => {
              const on = f >= col.at;
              const v = row[col.k];
              return <div key={col.k} style={{width: w[k + 1], textAlign: 'center', fontFamily: font, fontSize: 34, fontWeight: on ? 800 : 500,
                color: on ? (col.k === 'next' ? A : color.text) : color.dim}}>{col.k === 'next' ? `→ ${v}` : v}</div>;
            })}
          </div>;
        })}
      </Panel>
    </Appear>
    <Appear p={pop(f, e)} dy={30} style={{marginTop: 24}}>
      <div style={{padding: '20px 26px', borderRadius: 22, border: `3px solid ${B}`, background: `${B}14`}}>
        <div style={{fontFamily: font, fontSize: 28, color: B, fontWeight: 800}}>最后一句，留给自己</div>
        <div style={{fontFamily: font, fontSize: 42, fontWeight: 900, color: color.text, marginTop: 4}}>{typed('我说 “ship it” 之前，什么都不许上线', f / 30, (e + 8) / 30, 16)}</div>
        <div style={{fontFamily: mono, fontSize: 22, color: color.dim, marginTop: 6}}>Nothing goes public until I say “ship it”.</div>
      </div>
    </Appear>
    <Big f={f} at={g} text="4 个机器人 → 1 个团队" c={color.amber} size={54} h={150} style={{marginTop: 10}} />
  </Root>;
};

/* kickoff — real data, not a made-up task: 20 most-saved posts, one message, then stop typing */
const Kickoff: React.FC<SceneProps> = ({f, cue}) => {
  const pop = usePop();
  const [a, b, c, d] = [cue('a', 63), cue('b', 107), cue('c', 215), cue('d', 246)];
  const fold = ease.inOutCubic(prog(f, c, 20));
  const rows = [3120, 2740, 2610, 2290, 2105, 1980, 1760, 1540, 1310, 980];
  const sorted = ease.inOutCubic(prog(f, b, 20));
  return <Root f={f} beats={[0, a, b, c, d]} glow={color.cyan}>
    <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
      <Appear p={pop(f, 0)}><H size={60}>喂真数据</H></Appear>
      <Appear p={pop(f, 10)} scale><span style={{fontFamily: font, fontSize: 40, fontWeight: 800, color: color.dim}}><Strike p={ramp(f, 30, 44)}>编一个任务</Strike></span></Appear>
    </div>
    <div style={{position: 'relative', height: 640, marginTop: 20}}>
      <div style={{position: 'absolute', inset: 0, opacity: 1 - fold, transform: `scale(${1 - 0.5 * fold}) translateY(${fold * 300}px)`, transformOrigin: '80% 100%'}}>
        <Appear p={pop(f, a)} dy={40}>
          <Window title="X 后台 · 最近 60 天（示意）" bodyStyle={{padding: '10px 24px', height: 540, overflow: 'hidden'}}>
            <div style={{display: 'flex', fontFamily: font, fontSize: 26, color: color.dim, padding: '6px 0'}}>
              <span style={{flex: 1}}>帖子</span><span style={{width: 160, textAlign: 'right'}}>收藏 ↓</span>
            </div>
            <div style={{position: 'relative', height: 480}}>{rows.map((v, i) => {
              const rank = Math.round(i * sorted + ((i * 7) % 10) * (1 - sorted));
              const top = f >= b + 16;
              return <div key={i} style={{position: 'absolute', left: 0, right: 0, top: rank * 48, display: 'flex', alignItems: 'center', height: 44,
                borderRadius: 10, background: top ? `${color.cyan}18` : 'transparent'}}>
                <span style={{fontFamily: mono, fontSize: 24, color: color.dim, width: 54}}>{top ? rank + 1 : '·'}</span>
                <div style={{flex: 1, marginRight: 20}}><div style={{height: 10, borderRadius: 5, background: '#2a3352', width: 340 + ((i * 53) % 120)}} /></div>
                <span style={{fontFamily: mono, fontSize: 28, fontWeight: 800, color: top ? color.cyan : color.text, width: 120, textAlign: 'right'}}>{v.toLocaleString('en-US')}</span>
              </div>;
            })}</div>
          </Window>
        </Appear>
        <Abs x={520} y={-6}><Appear p={pop(f, b + 18)} scale><Chip c={color.cyan} style={{fontSize: 34}}>收藏前 20 条</Chip></Appear></Abs>
      </div>
      {f >= c && <div style={{position: 'absolute', left: 0, right: 0, top: 40, opacity: fold}}>
        <Msg f={f} at={c} who="me" size={34} text={<><At who="res" /> 这是我近 60 天收藏最多的 20 条帖子，附收藏、回复、浏览数。找出收藏最多的 3 个话题，写成报告，交接给 <At who="wri" />。</>} />
        <Appear p={pop(f, c + 14)} style={{marginTop: 16, display: 'flex', justifyContent: 'flex-end'}}><Chip c={color.cyan} style={{fontSize: 30}}>✓ 已发送 · 一条消息</Chip></Appear>
      </div>}
      {f >= d && <Abs x={0} y={420} w={880}>
        <Appear p={pop(f, d)} dy={20} style={{display: 'flex', alignItems: 'center', gap: 22, justifyContent: 'center'}}>
          <svg width={150} height={90} viewBox="0 0 150 90">
            <rect x={4} y={4} width={142} height={82} rx={12} fill="none" stroke="#3a4466" strokeWidth={4} />
            {Array.from({length: 12}, (_, i) => <rect key={i} x={16 + (i % 6) * 21} y={18 + Math.floor(i / 6) * 22} width={15} height={15} rx={3} fill="#3a4466" />)}
            <rect x={36} y={64} width={78} height={12} rx={4} fill="#3a4466" />
          </svg>
          <H size={48} c={color.dim}>然后，不打字了</H>
        </Appear>
      </Abs>}
    </div>
  </Root>;
};

/* pushback — the writer refuses to write without research, and asks the researcher by name */
const Pushback: React.FC<SceneProps> = ({f, cue}) => {
  const pop = usePop();
  const [a, b, c] = [cue('a', 43), cue('b', 158), cue('c', 224)];
  return <Root f={f} beats={[0, a, b, c]} glow={color.violet}>
    <Appear p={pop(f, 0)}><H size={60}>第一个惊喜：agent 会顶回来</H></Appear>
    <Appear p={pop(f, 6)} dy={30} style={{marginTop: 22}}>
      <Window title="群聊 · 提示词库项目" bodyStyle={{padding: '22px 24px', minHeight: 560, display: 'flex', flexDirection: 'column', gap: 22}}>
        <Msg f={f} at={8} who="me" size={32} text="（群规已发）" />
        {f >= a - 4 && <Msg f={f} at={a} who="wri" cps={9} size={40} text="没有调研，这需求写不了。" />}
        {f >= b - 4 && <Msg f={f} at={b} who="wri" size={40} text={<><At who="res" /> 先给我一份调研报告</>} />}
        {f >= b + 30 && <Msg f={f} at={b + 34} who="res" size={36} text="收到，这就去。" />}
      </Window>
    </Appear>
    <div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 20, justifyContent: 'center'}}>
      <Appear p={pop(f, b)} scale><Chip c={A} style={{fontSize: 34}}>点名要资料</Chip></Appear>
      <Appear p={pop(f, c)} scale><Chip c={color.violet} style={{fontSize: 40}}>这才像个同事</Chip></Appear>
    </div>
  </Root>;
};

/* chain — research note (top 3 topics by saves) → 15 prompts → plan + 3 flags sent back */
const TOPICS = [{t: '未来的工作和 AI 赚钱', v: 43060}, {t: 'AI agent 和自动化搭建', v: 34551}, {t: '微调定制模型', v: 32852}];
const Chain: React.FC<SceneProps> = ({f, cue}) => {
  const pop = usePop();
  const [a, b, c, d, e, g, h] = [cue('a', 49), cue('b', 127), cue('c', 149), cue('d', 172), cue('e', 215), cue('f', 314), cue('g', 372)];
  const lit: Record<RoleKey, number> = {res: a, wri: e, dev: g, rev: 99999};
  const phase = f < e ? 0 : f < g ? 1 : 2;
  const swap = (at: number) => ease.outCubic(prog(f, at, 14));
  const back = ease.inOutCubic(prog(f, h, 24));
  return <Root f={f} beats={[0, a, b, d, e, g, h]} glow={phase === 0 ? color.cyan : phase === 1 ? color.violet : color.amber}>
    <Appear p={pop(f, 0)}><H size={56}>接力开始</H></Appear>
    <div style={{position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 16}}>
      {ORDER.map((r, i) => <React.Fragment key={r}>
        {i > 0 && <Hand p={ease.outCubic(prog(f, lit[r] - 8, 10))} w={70} />}
        <div style={{textAlign: 'center'}}>
          <Av who={r} size={120} on={f >= lit[r] ? 1 : 0.3} ring={f >= lit[r] && f < lit[r] + 30 ? 0.8 : 0} />
          <div style={{fontFamily: font, fontSize: 32, fontWeight: 800, color: f >= lit[r] ? ROLE[r].c : color.dim, marginTop: 6}}>{ROLE[r].short}</div>
        </div>
      </React.Fragment>)}
      {back > 0 && <svg width={880} height={140} viewBox="0 0 880 140" style={{position: 'absolute', left: 0, top: -120, overflow: 'visible'}}>
        <path d="M535 120 Q440 -20 345 120" stroke={color.red} strokeWidth={5} fill="none" strokeDasharray="12 10" opacity={0.8 * Math.min(1, back * 3)} />
        {[0, 1, 2].map((k) => {
          const u = ease.inOutCubic(prog(f, h + k * 6, 22));
          const x = (1 - u) ** 2 * 535 + 2 * u * (1 - u) * 440 + u * u * 345, y = (1 - u) ** 2 * 120 + 2 * u * (1 - u) * -20 + u * u * 120 - 50;
          return <g key={k} transform={`translate(${x + k * 30 - 30} ${y})`} opacity={u > 0 ? 1 : 0}>
            <line x1={0} y1={0} x2={0} y2={36} stroke={color.text} strokeWidth={4} /><path d="M0 0 L26 8 L0 16 Z" fill={color.red} />
          </g>;
        })}
      </svg>}
    </div>
    <div style={{position: 'relative', height: 560, marginTop: 40}}>
      {phase === 0 && <Appear p={pop(f, a)} dy={30}>
        <Panel glow={color.cyan} style={{padding: '22px 26px'}}>
          <div style={{fontFamily: font, fontSize: 34, fontWeight: 900, color: color.cyan}}>调研报告 · 收藏最多的 3 个话题</div>
          {TOPICS.map((tp, i) => {
            const at = [b, c, d][i];
            const g2 = ease.outCubic(prog(f, at, 20));
            return <div key={tp.t} style={{marginTop: 22, opacity: Math.min(1, g2 * 2)}}>
              <div style={{display: 'flex', alignItems: 'baseline'}}>
                <span style={{fontFamily: font, fontSize: 36, color: color.text}}>{tp.t}</span>
                <span style={{marginLeft: 'auto', fontFamily: mono, fontSize: 40, fontWeight: 900, color: color.amber}}>{Math.round(tp.v * g2).toLocaleString('en-US')}</span>
              </div>
              <div style={{height: 26, borderRadius: 13, background: '#1b2238', marginTop: 8}}>
                <div style={{height: '100%', borderRadius: 13, width: `${tp.v / 43060 * 100 * g2}%`, background: color.cyan}} />
              </div>
            </div>;
          })}
          <Appear p={pop(f, d + 20)}><P size={30} style={{marginTop: 18}}>拿不准的 3 条帖子，标成 UNCONFIRMED 留给审核</P></Appear>
        </Panel>
      </Appear>}
      {phase === 1 && <div style={{opacity: swap(e), transform: `translateY(${(1 - swap(e)) * 40}px)`}}>
        <Panel glow={color.violet} style={{padding: '22px 26px'}}>
          <div style={{fontFamily: font, fontSize: 34, fontWeight: 900, color: color.violet}}>页面文案 · 照着报告写</div>
          <div style={{display: 'flex', alignItems: 'baseline', gap: 14, marginTop: 10}}>
            <span style={{fontFamily: mono, fontSize: 110, fontWeight: 900, color: color.text, lineHeight: 1}}>{Math.min(15, Math.max(0, Math.floor((f - e - 30) / 3)))}</span>
            <H size={44}>条提示词，按收藏排序</H>
          </div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginTop: 20}}>
            {Array.from({length: 15}, (_, i) => <div key={i} style={{height: 54, borderRadius: 12, background: f >= e + 30 + i * 3 ? `${color.violet}44` : '#1b2238',
              border: `2px solid ${f >= e + 30 + i * 3 ? color.violet : '#2a3352'}`}} />)}
          </div>
          <P size={30} style={{marginTop: 16}}>核实不了的，标出来，不瞎编</P>
        </Panel>
      </div>}
      {phase === 2 && <div style={{opacity: swap(g), transform: `translateY(${(1 - swap(g)) * 40}px)`}}>
        <Panel glow={color.amber} style={{padding: '22px 26px'}}>
          <div style={{fontFamily: font, fontSize: 34, fontWeight: 900, color: color.amber}}>开发：先发方案，再动手</div>
          {['版块和样式', '表单写进真数据库', '管理页看请求'].map((t, i) => (
            <Appear key={t} p={pop(f, g + 10 + i * 8)} dy={14} style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 16}}>
              <Check p={ramp(f, g + 10 + i * 8, g + 22 + i * 8)} size={44} c={color.cyan} /><span style={{fontFamily: font, fontSize: 38, color: color.text}}>{t}</span>
            </Appear>
          ))}
          <Appear p={pop(f, h)} dy={20} style={{marginTop: 22}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderRadius: 16, border: `2px solid ${color.red}`, background: `${color.red}14`}}>
              <span style={{fontFamily: mono, fontSize: 44, fontWeight: 900, color: color.red}}>3</span>
              <span style={{fontFamily: font, fontSize: 36, color: color.text}}>个问题，当众退回文案</span>
            </div>
          </Appear>
        </Panel>
      </div>}
    </div>
  </Root>;
};

/* insight — hype gets reach, guides get saves: 1.89% vs 0.17% */
const Insight: React.FC<SceneProps> = ({f, cue}) => {
  const pop = usePop();
  const [a, b, c, d, e] = [cue('a', 51), cue('b', 85), cue('c', 129), cue('d', 231), cue('e', 346)];
  const Col: React.FC<{t: string; sub: string; col: string; at: number; reach: number; save: number}> = ({t, sub, col, at, reach, save}) => {
    const g = ease.outCubic(prog(f, at, 20));
    return <Appear p={pop(f, at)} scale style={{flex: 1}}>
      <div style={{padding: '20px 22px', borderRadius: 22, border: `3px solid ${col}`, background: `${col}12`}}>
        <div style={{fontFamily: font, fontSize: 44, fontWeight: 900, color: col}}>{t}</div>
        <div style={{fontFamily: font, fontSize: 32, color: color.text, marginTop: 4}}>{sub}</div>
        {[['流量', reach], ['收藏', save]].map(([k, v]) => <div key={k as string} style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 14}}>
          <span style={{fontFamily: font, fontSize: 30, color: color.dim, width: 64}}>{k}</span>
          <div style={{flex: 1, height: 22, borderRadius: 11, background: '#1b2238'}}><div style={{height: '100%', borderRadius: 11, width: `${(v as number) * g}%`, background: col}} /></div>
        </div>)}
      </div>
    </Appear>;
  };
  const bar = (v: number, at: number) => v / 1.89 * 300 * ease.outCubic(prog(f, at, 22));
  return <Root f={f} beats={[0, a, b, c, d, e]} glow={color.cyan} hits={[e]}>
    <Appear p={pop(f, 0)}><H size={56}>报告里最值钱的一句</H></Appear>
    <div style={{display: 'flex', gap: 18, marginTop: 22}}>
      <Col t="炒作帖" sub="拿流量" col={color.amber} at={a} reach={95} save={12} />
      <Col t="教程帖" sub="拿收藏" col={color.cyan} at={b} reach={40} save={90} />
    </div>
    <Appear p={pop(f, c)} style={{marginTop: 26}}><P size={34} c={color.text}>收藏率（收藏 ÷ 浏览）</P></Appear>
    <div style={{display: 'flex', alignItems: 'flex-end', gap: 60, height: 360, padding: '0 90px', borderBottom: '3px solid #2a3352'}}>
      {[{v: 1.89, at: c, col: color.cyan, t: '免费学习资源'}, {v: 0.17, at: d, col: color.amber, t: '最火的炒作帖'}].map((x) => (
        <div key={x.t} style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%'}}>
          <div style={{fontFamily: mono, fontSize: 52, fontWeight: 900, color: x.col, opacity: f >= x.at ? 1 : 0}}>{(x.v * ease.outCubic(prog(f, x.at, 22))).toFixed(2)}%</div>
          <div style={{width: '100%', height: bar(x.v, x.at), borderRadius: '14px 14px 0 0', background: x.col}} />
        </div>
      ))}
    </div>
    <div style={{display: 'flex', gap: 60, padding: '10px 90px 0'}}>
      {['免费学习资源', '最火的炒作帖'].map((t) => <div key={t} style={{flex: 1, textAlign: 'center', fontFamily: font, fontSize: 32, color: color.text}}>{t}</div>)}
    </div>
    <div style={{position: 'absolute', right: 30, top: 470}}>
      <Stamp t={f / 30} at={e / 30} text="差 11 倍" color={color.cyan} size={56} deg={-8} font={font} style={{position: 'relative'}} />
    </div>
  </Root>;
};

/* block — the reviewer blocks v1: "Claude" quoted as "the model"; 16 vs 15 */
const Block: React.FC<SceneProps> = ({f, cue}) => {
  const pop = usePop();
  const [a, b, c, d, e] = [cue('a', 67), cue('b', 145), cue('c', 228), cue('d', 303), cue('e', 409)];
  const ring = ramp(f, d, d + 14);
  return <Root f={f} beats={[0, a, b, c, d, e]} glow={color.red} hits={[a]}>
    <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
      <Appear p={pop(f, 0)} scale>
        <div style={{padding: '14px 22px', borderRadius: 18, border: `2px solid ${color.amber}`, background: `${color.amber}14`, fontFamily: font, fontSize: 36, fontWeight: 900, color: color.text}}>第一版网页 v1</div>
      </Appear>
      <Hand p={ease.outCubic(prog(f, 10, 14))} w={90} />
      <Appear p={pop(f, 18)} scale><Av who="rev" size={96} /></Appear>
      <Appear p={pop(f, 22)}><H size={44} c={color.red}>审核编辑</H></Appear>
    </div>
    <div style={{position: 'relative', height: 190, marginTop: 14}}>
      {f >= a && <div style={{position: 'absolute', left: 0, right: 0, top: 10, display: 'flex', justifyContent: 'center'}}>
        <Stamp t={f / 30} at={a / 30} text="NOT READY TO SHIP" color={color.red} size={64} deg={-4} font={mono} style={{position: 'relative'}} />
      </div>}
      <Abs x={0} y={120} w={880}><Appear p={pop(f, a + 18)} style={{textAlign: 'center'}}><P size={38} c={color.text}>不能上线：2 个阻断问题</P></Appear></Abs>
    </div>
    <Appear p={pop(f, b)} dy={30} style={{marginTop: 16}}>
      <Panel style={{padding: '22px 28px'}}>
        <div style={{fontFamily: font, fontSize: 30, color: color.dim}}>页面引用：Anthropic 提示词指南</div>
        <div style={{position: 'relative', fontFamily: mono, fontSize: 46, fontWeight: 800, color: color.text, marginTop: 50, lineHeight: 1.3}}>
          <span style={{color: ring > 0.5 ? color.amber : color.text, fontSize: ring > 0.5 ? 54 : 46}}>“</span>
          …<span style={{position: 'relative', display: 'inline-block'}}>
            <Strike p={ramp(f, c, c + 10)}><span style={{color: f >= c ? color.red : color.text}}>the model</span></Strike>
            <span style={{position: 'absolute', left: 10, top: -50, fontSize: 44, color: color.cyan, opacity: ramp(f, c + 10, c + 18),
              transform: `translateY(${(1 - ramp(f, c + 10, c + 18)) * 16}px)`}}>Claude</span>
          </span> will be too.<span style={{color: ring > 0.5 ? color.amber : color.text, fontSize: ring > 0.5 ? 54 : 46}}>”</span>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 16}}>
          <span style={{fontFamily: mono, fontSize: 34, color: color.text, padding: '2px 12px', borderRadius: 12, border: `3px solid ${ring > 0.5 ? color.amber : 'transparent'}`}}>— Anthropic</span>
          <Appear p={pop(f, d + 6)} scale style={{marginLeft: 'auto'}}><Chip c={color.amber} style={{fontSize: 32}}>一个词 · 在引号里 · 署了名</Chip></Appear>
        </div>
      </Panel>
    </Appear>
    <Appear p={pop(f, e)} dy={24} style={{marginTop: 22}}>
      <Panel style={{padding: '20px 28px', display: 'flex', alignItems: 'center', gap: 22}}>
        <span style={{fontFamily: font, fontSize: 32, color: color.dim}}>页面写</span>
        <span style={{fontFamily: mono, fontSize: 44, fontWeight: 800, color: color.text}}><Strike p={ramp(f, e + 30, e + 40)}>“Sixteen prompts”</Strike></span>
        <span style={{marginLeft: 'auto', fontFamily: font, fontSize: 32, color: color.dim}}>实际</span>
        <span style={{fontFamily: mono, fontSize: 64, fontWeight: 900, color: color.cyan, opacity: ramp(f, e + 40, e + 48)}}>15</span>
      </Panel>
    </Appear>
  </Root>;
};

/* fix — before → after against the live guides; the developer fixes and debugs the form; checker ≠ author */
const Fix: React.FC<SceneProps> = ({f, cue}) => {
  const pop = usePop();
  const [a, b, c, d, e, g] = [cue('a', 102), cue('b', 146), cue('c', 200), cue('d', 272), cue('e', 340), cue('f', 429)];
  const pairs = [['the model will be too', 'Claude will be too'], ['Sixteen prompts', '15 prompts'], ['模型没有实时数据', '删掉：新模型已过时']];
  const rows = f < d + 40 ? 0 : 1;
  return <Root f={f} beats={[0, a, b, c, d, e, g]} glow={color.cyan}>
    <Appear p={pop(f, 0)}><H size={52}>对照线上指南，逐条给改法</H></Appear>
    <div style={{display: 'flex', gap: 12, marginTop: 12}}>
      <Appear p={pop(f, 10)} scale><Chip c={color.dim} style={{fontSize: 28}}>OpenAI 指南</Chip></Appear>
      <Appear p={pop(f, 16)} scale><Chip c={color.dim} style={{fontSize: 28}}>Anthropic 指南</Chip></Appear>
    </div>
    <Panel style={{marginTop: 16, padding: '14px 24px'}}>
      {pairs.map(([x, y], i) => <Appear key={x} p={pop(f, a + i * 12)} dy={14} style={{display: 'flex', alignItems: 'center', gap: 12, height: 66}}>
        <span style={{fontFamily: x.match(/[a-z]/) ? mono : font, fontSize: 28, color: color.dim, width: 400, whiteSpace: 'nowrap'}}><Strike p={ramp(f, a + i * 12 + 6, a + i * 12 + 14)} c={color.red}>{x}</Strike></span>
        <span style={{fontFamily: font, fontSize: 34, color: color.dim}}>→</span>
        <span style={{fontFamily: y.match(/[a-z]/) ? mono : font, fontSize: 32, fontWeight: 800, color: color.cyan}}>{y}</span>
      </Appear>)}
    </Panel>
    <div style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 20}}>
      <Appear p={pop(f, b)} scale><Av who="dev" size={86} /></Appear>
      <Appear p={pop(f, b + 4)}><H size={40}>开发：自己改、自己复查</H></Appear>
    </div>
    <Appear p={pop(f, c)} dy={20} style={{marginTop: 14}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 20, padding: '16px 22px', borderRadius: 20, background: '#121a2e', border: `2px solid ${rows ? color.cyan : color.red}`}}>
        <span style={{fontFamily: font, fontSize: 34, color: color.text}}>测试表单 → 数据库</span>
        {f >= d && f < d + 40 && <svg width={56} height={56} viewBox="0 0 56 56" style={{transform: `rotate(${(f - d) * 14}deg)`}}>
          <circle cx={28} cy={28} r={20} stroke={color.amber} strokeWidth={6} fill="none" strokeDasharray="90 40" strokeLinecap="round" /></svg>}
        <span style={{marginLeft: 'auto', fontFamily: mono, fontSize: 40, fontWeight: 900, color: rows ? color.cyan : color.red}}>{rows} 行 {rows ? '✓' : '✗'}</span>
      </div>
    </Appear>
    <div style={{display: 'flex', gap: 18, marginTop: 24}}>
      <Appear p={pop(f, e)} scale style={{flex: 1}}>
        <div style={{height: 230, padding: '16px 18px', borderRadius: 20, border: '2px solid #3a4466', textAlign: 'center'}}>
          <div style={{fontFamily: font, fontSize: 32, color: color.dim}}>单个聊天机器人</div>
          <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 10}}><Bot size={90} c={color.dim} /><Check p={ramp(f, e + 10, e + 22)} size={56} c={color.dim} /></div>
          <div style={{fontFamily: font, fontSize: 34, fontWeight: 800, color: color.text, marginTop: 6}}>自己批自己</div>
        </div>
      </Appear>
      <Appear p={pop(f, g)} scale style={{flex: 1}}>
        <div style={{height: 230, padding: '16px 18px', borderRadius: 20, border: `3px solid ${color.cyan}`, background: `${color.cyan}10`, textAlign: 'center'}}>
          <div style={{fontFamily: font, fontSize: 32, color: color.cyan}}>这个团队</div>
          <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4, marginTop: 10}}>
            <Bot size={80} c={color.amber} /><Hand p={ease.outCubic(prog(f, g + 8, 12))} w={60} /><Bot size={80} c={color.red} /></div>
          <div style={{fontFamily: font, fontSize: 34, fontWeight: 800, color: color.text, marginTop: 6}}>写的 ≠ 查的</div>
        </div>
      </Appear>
    </div>
  </Root>;
};

/* human — 8 rounds of polishing; a first-time visitor's view; one message from the human */
const Human: React.FC<SceneProps> = ({f, cue}) => {
  const pop = usePop();
  const [a, b, c, d, e, g, h, k] = [cue('a', 82), cue('b', 148), cue('c', 209), cue('d', 247), cue('e', 361), cue('f', 399), cue('g', 437), cue('h', 483)];
  const round = Math.min(8, 1 + Math.floor(f / 9));
  const wob = Math.sin(f / 5) * 6;
  return <Root f={f} beats={[0, a, b, c, d, e, h]} glow={B}>
    <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
      <Panel style={{padding: '12px 24px', textAlign: 'center'}}>
        <div style={{fontFamily: font, fontSize: 26, color: color.dim}}>打磨</div>
        <div style={{fontFamily: mono, fontSize: 64, fontWeight: 900, color: color.amber, lineHeight: 1}}>第 {round} 轮</div>
      </Panel>
      <div style={{display: 'flex', gap: 6}}>{ORDER.map((r, i) => <div key={r} style={{transform: `rotate(${f < a ? Math.sin(f / 4 + i) * 12 : 0}deg)`}}><Bot size={60} c={ROLE[r].c} /></div>)}</div>
      <Appear p={pop(f, a)} scale style={{marginLeft: 'auto'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '8px 18px 8px 8px', borderRadius: 50, border: `3px solid ${B}`, background: `${B}18`}}>
          <Av who="me" size={76} ring={0.5} /><span style={{fontFamily: font, fontSize: 40, fontWeight: 900, color: B}}>人来拍板</span>
        </div>
      </Appear>
    </div>
    <div style={{position: 'relative', marginTop: 22}}>
      <Appear p={pop(f, b)} dy={30}>
        <Window url="新访客视角 · 提示词库" bodyStyle={{padding: '20px 26px', height: 270}}>
          <div style={{fontFamily: font, fontSize: 38, fontWeight: 900, color: color.text}}>
            built from the 20 posts{' '}
            {f < d ? <span>you saved</span> : <><Strike p={ramp(f, d, d + 10)}><span style={{color: color.red}}>you saved</span></Strike>{' '}
              <span style={{color: color.cyan, opacity: ramp(f, d + 12, d + 20)}}>his followers saved</span></>} most
          </div>
          <div style={{fontFamily: font, fontSize: 30, color: color.dim, marginTop: 6}}>{f < d ? '“你收藏的帖子”' : '其实是：粉丝收藏的帖子'}</div>
          <div style={{display: 'flex', gap: 12, marginTop: 20}}>{[0, 1, 2].map((i) => <div key={i} style={{flex: 1, height: 70, borderRadius: 12, background: '#1b2238'}} />)}</div>
        </Window>
      </Appear>
      {f >= c && <div style={{position: 'absolute', right: 40, top: 180, transform: `rotate(${wob}deg) scale(${ease.outBack(prog(f, c, 12), 1.6)})`}}>
        <div style={{width: 120, height: 120, borderRadius: 60, background: color.amber, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: font, fontSize: 84, fontWeight: 900, color: '#0a0e1a'}}>?</div>
        <div style={{fontFamily: font, fontSize: 30, color: color.amber, textAlign: 'center', marginTop: 4, whiteSpace: 'nowrap', marginLeft: -60, width: 240}}>从哪看起？</div>
      </div>}
    </div>
    {f >= e - 4 && <Appear p={pop(f, e)} dy={30} style={{marginTop: 24}}>
      <div style={{display: 'flex', gap: 16}}>
        <Av who="me" size={80} />
        <div style={{flex: 1, padding: '18px 24px', borderRadius: '6px 26px 26px 26px', background: `${B}14`, border: `3px solid ${B}`}}>
          <div style={{fontFamily: font, fontSize: 28, color: B, fontWeight: 800}}>只发一条消息</div>
          {['照审核意见改', '顶上加个“从这里开始”', '然后发布'].map((t, i) => {
            const at = [g, h, k][i];
            return <div key={t} style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 12, opacity: f >= at - 4 ? 1 : 0.35}}>
              <Check p={ramp(f, at, at + 12)} size={44} c={color.cyan} />
              <span style={{fontFamily: font, fontSize: 38, fontWeight: 800, color: color.text}}>{t}</span>
            </div>;
          })}
        </div>
      </div>
    </Appear>}
  </Root>;
};

/* ship — the developer stops and hands the publish button to the human; reviewer's live-page PASS */
const Ship: React.FC<SceneProps> = ({f, cue}) => {
  const pop = usePop();
  const [a, b, c, d, e] = [cue('a', 54), cue('b', 124), cue('c', 184), cue('d', 256), cue('e', 339)];
  const u = ease.inOutCubic(prog(f, a, 26));
  const bx = 140 + u * 250, by = 30 - Math.sin(Math.PI * u) * 40;
  const press = f >= b && f < b + 8 ? 0.9 : 1;
  const checks = ['PASS', 'Hero', 'Start here', 'Copy 按钮', '表单'];
  return <Root f={f} beats={[0, a, b, c, d, e]} glow={B} hits={[d + 50]}>
    <div style={{position: 'relative', height: 250}}>
      <Abs x={0} y={0} w={130}><Appear p={pop(f, 0)} style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}><Av who="dev" size={110} /><P size={30} c={color.amber}>开发</P></Appear></Abs>
      <Abs x={740} y={0} w={130}><Appear p={pop(f, 6)} style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}><Av who="me" size={110} ring={f >= a + 26 ? 0.6 : 0} /><P size={30} c={B}>作者</P></Appear></Abs>
      <Abs x={bx} y={by}>
        <Appear p={pop(f, 4)} scale>
          <div style={{padding: '18px 36px', borderRadius: 40, background: f >= b ? B : color.text, color: '#0a0e1a', fontFamily: font, fontSize: 40, fontWeight: 900,
            transform: `scale(${press})`, boxShadow: `0 0 ${f >= b ? 40 : 0}px ${B}`, whiteSpace: 'nowrap'}}>发布 Publish</div>
        </Appear>
      </Abs>
      <Abs x={0} y={170} w={880}><Appear p={pop(f, b)} style={{textAlign: 'center'}}><Chip c={B} style={{fontSize: 38}}>发不发，是人的事</Chip></Appear></Abs>
    </div>
    <Appear p={pop(f, b + 10)} dy={20}>
      <div style={{textAlign: 'center', padding: '14px 0', borderRadius: 18, border: `2px solid ${B}88`, fontFamily: mono, fontSize: 40, fontWeight: 800, color: B}}>● Version 1 is live</div>
    </Appear>
    <Appear p={pop(f, c)} dy={30} style={{marginTop: 22}}>
      <div style={{display: 'flex', gap: 16}}>
        <Av who="rev" size={86} />
        <div style={{flex: 1}}>
          <div style={{fontFamily: font, fontSize: 30, color: color.red, fontWeight: 800}}>审核编辑 · 打开线上页面终审</div>
          <div style={{marginTop: 8, padding: '16px 24px', borderRadius: '6px 24px 24px 24px', background: '#18213a', border: `2px solid ${color.red}66`}}>
            {checks.map((t, i) => <div key={t} style={{display: 'flex', alignItems: 'center', gap: 14, height: 54, opacity: f >= d + i * 8 ? 1 : 0.15}}>
              <Check p={ramp(f, d + i * 8, d + i * 8 + 10)} size={40} c={color.cyan} />
              <span style={{fontFamily: i ? font : mono, fontSize: i ? 34 : 40, fontWeight: i ? 600 : 900, color: i ? color.text : color.cyan}}>{t}</span>
            </div>)}
          </div>
        </div>
      </div>
    </Appear>
    <div style={{position: 'absolute', right: 20, top: 560}}>
      <Stamp t={f / 30} at={(d + 50) / 30} text="PASS" color={color.cyan} size={72} deg={-10} font={mono} style={{position: 'relative'}} />
    </div>
    <Appear p={pop(f, e)} dy={20} style={{marginTop: 20}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '14px 22px', borderRadius: 18, background: '#121a2e', border: `2px solid ${color.cyan}66`}}>
        <span style={{fontFamily: font, fontSize: 34, color: color.text}}>真提交一次表单 → 数据库</span>
        <span style={{marginLeft: 'auto', fontFamily: mono, fontSize: 36, fontWeight: 900, color: color.cyan,
          transform: `scale(${1 + 0.3 * Math.sin(Math.PI * ramp(f, e + 20, e + 32))})`}}>{f >= e + 20 ? '+1 行 ✓' : '…'}</span>
      </div>
    </Appear>
  </Root>;
};

/* loop — save the chain as a weekly Loop; the human card only receives */
const LOOP: {who: RoleKey | 'me'; t: string}[] = [
  {who: 'res', t: '每周一：找收藏最多的 3 条'},
  {who: 'wri', t: '写成一张提示词卡'},
  {who: 'dev', t: '加到页面顶部，不发布'},
  {who: 'me', t: '作者批准，才上线'},
];
const Loop: React.FC<SceneProps> = ({f, cue}) => {
  const pop = usePop();
  const [a, b, c, d, e, g, h] = [cue('a', 86), cue('b', 151), cue('c', 172), cue('d', 188), cue('e', 208), cue('f', 254), cue('g', 319)];
  const ats = [b, c, d, e];
  return <Root f={f} beats={[0, a, b, e, g, h]} glow={A} hits={[h]}>
    <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
      <svg width={84} height={84} viewBox="0 0 84 84" style={{transform: `rotate(${f * 3}deg)`}}>
        <circle cx={42} cy={42} r={30} stroke={A} strokeWidth={7} fill="none" strokeDasharray="150 40" strokeLinecap="round" />
        <path d="M64 14 L72 26 L58 30" stroke={A} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <Appear p={pop(f, 0)}><H size={58}>存成 Loop，每周照跑</H></Appear>
    </div>
    <div style={{position: 'relative', marginTop: 20, height: 780, borderRadius: 24, border: '2px solid #1f2842',
      backgroundImage: 'radial-gradient(rgba(148,163,255,0.22) 2px, transparent 2px)', backgroundSize: '32px 32px', padding: '20px 26px'}}>
      <Appear p={pop(f, a)} scale style={{position: 'absolute', right: 20, top: 16}}>
        <Chip c={color.cyan} style={{fontSize: 30, transform: `scale(${f >= a && f < b ? 1 + 0.06 * Math.sin(f / 3) : 1})`}}>＋ 添加节点</Chip>
      </Appear>
      {LOOP.map((n, i) => {
        const p = ease.outBack(prog(f, ats[i] - 2, 12), 1.4);
        const c = n.who === 'me' ? B : ROLE[n.who].c;
        const y = 76 + i * 160;
        const line = ease.inOutCubic(prog(f, ats[i] - 10, 12));
        return <React.Fragment key={i}>
          {i > 0 && <svg width={60} height={44} viewBox="0 0 60 44" style={{position: 'absolute', left: 68, top: y - 43}}>
            <path d="M30 2 L30 36" stroke={A} strokeWidth={6} strokeDasharray={40} strokeDashoffset={40 * (1 - line)} strokeLinecap="round" />
            <path d="M18 28 L30 41 L42 28" stroke={A} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={line > 0.9 ? 1 : 0} />
            <circle cx={30} cy={2 + ((f * 1.5 + i * 13) % 30)} r={5} fill="#fff" opacity={line > 0.9 ? 0.8 : 0} />
          </svg>}
          <div style={{position: 'absolute', left: 26, top: y - (1 - p) * 60, opacity: Math.min(1, p * 2), width: 700, display: 'flex', alignItems: 'center', gap: 18,
            padding: '14px 20px', borderRadius: 20, background: '#121a2e', border: `3px solid ${c}`, boxShadow: `0 10px 24px rgba(0,0,0,0.4)`}}>
            <Av who={n.who} size={84} />
            <div>
              <div style={{fontFamily: font, fontSize: 30, fontWeight: 800, color: c}}>{i + 1} · {n.who === 'me' ? '作者（人）' : ROLE[n.who].zh}</div>
              <div style={{fontFamily: font, fontSize: 34, color: color.text}}>{n.t}</div>
            </div>
          </div>
        </React.Fragment>;
      })}
      {f >= g && <div style={{position: 'absolute', left: 40, top: 76 + 3 * 160 + 140, display: 'flex', alignItems: 'center', gap: 12, opacity: ramp(f, g, g + 8)}}>
        <svg width={56} height={56} viewBox="0 0 56 56"><path d="M10 10 L46 46 M46 10 L10 46" stroke={color.red} strokeWidth={8} strokeLinecap="round" /></svg>
        <span style={{fontFamily: font, fontSize: 38, fontWeight: 900, color: color.text}}>人的卡片：只收，不往下传</span>
      </div>}
      <div style={{position: 'absolute', right: 30, top: 680}}>
        <Stamp t={f / 30} at={h / 30} text="人拍板" color={B} size={64} deg={-8} font={font} style={{position: 'relative'}} />
      </div>
    </div>
  </Root>;
};

/* lessons — three things to do differently */
const Lessons: React.FC<SceneProps> = ({f, cue}) => {
  const pop = usePop();
  const [a, b, c, d, e] = [cue('a', 83), cue('b', 132), cue('c', 281), cue('d', 321), cue('e', 352)];
  const off = ramp(f, b + 30, b + 40);
  const fold = ease.inOutCubic(prog(f, d, 14));
  // the reviewer's verdict lands after the five lines (holds the scene's tail)
  const verdict = e + 54;
  const tint = ramp(f, verdict, verdict + 10);
  const items = [
    {at: a, t: '第一条消息就给真数据', s: '第一次调研用了网上的数据，只能重做', col: color.cyan},
    {at: b, t: '一开工就关掉自动插话', s: '开着时中途纠正一句，又起了一条链', col: color.violet},
    {at: c, t: '给审核员一个终点', s: '线上终审，5 行内给 PASS 或 FAIL', col: color.red},
  ];
  return <Root f={f} beats={[0, a, b, b + 60, c, d, e, verdict]} glow={tint > 0.5 ? color.cyan : color.violet} hits={[verdict]}>
    <Appear p={pop(f, 0)}><H size={60}>3 件事，作者会改着来</H></Appear>
    {items.map((it, i) => {
      const sw = sway(f / 30, i * 1.7, {dy: 2, deg: 0.3});
      const dim = i < 2 ? 1 - 0.45 * fold : 1;
      return <Appear key={it.t} p={pop(f, it.at)} dy={30} style={{marginTop: 24}}>
        <div style={{opacity: dim, transform: `translateY(${sw.dy}px)`, position: 'relative', display: 'flex', alignItems: 'center', gap: 20, padding: '22px 24px', borderRadius: 22,
          background: i === 2 && tint > 0 ? `rgba(34,211,238,${0.22 * tint})` : '#121a2e', border: `3px solid ${i === 2 && tint > 0.5 ? color.cyan : it.col}`}}>
          {i === 2 && <div style={{position: 'absolute', right: 30, bottom: 40}}>
            <Stamp t={f / 30} at={verdict / 30} text="PASS" color={color.cyan} size={80} deg={-10} font={mono} style={{position: 'relative'}} />
          </div>}
          <div style={{width: 84, height: 84, borderRadius: 22, background: `${it.col}26`, border: `2px solid ${it.col}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: mono, fontSize: 50, fontWeight: 900, color: it.col, flex: 'none'}}>{i + 1}</div>
          <div style={{flex: 1}}>
            <div style={{fontFamily: font, fontSize: 42, fontWeight: 900, color: color.text}}>{it.t}</div>
            <div style={{maxHeight: i < 2 ? 140 * (1 - fold) : undefined, overflow: 'hidden'}}>
            <div style={{fontFamily: font, fontSize: 32, color: color.text, opacity: 0.85, marginTop: 6}}>{it.s}</div>
            {i === 1 && <div style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 14}}>
              <div style={{width: 96, height: 52, borderRadius: 26, background: off > 0.5 ? '#3a4466' : color.violet, position: 'relative'}}>
                <div style={{position: 'absolute', top: 6, left: 6 + (1 - off) * 44, width: 40, height: 40, borderRadius: 20, background: '#fff'}} />
              </div>
              <span style={{fontFamily: mono, fontSize: 28, color: color.dim}}>Agent Proactivity · {off > 0.5 ? 'OFF' : 'ON'}</span>
            </div>}
            </div>
            {i === 2 && <div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 14}}>
              {['PASS', 'FAIL'].map((t, k) => <Appear key={t} p={pop(f, c + 20 + k * 8)} scale><Chip c={k ? color.red : color.cyan} style={{fontSize: 32, fontFamily: mono}}>{t}</Chip></Appear>)}
              <Appear p={pop(f, d)} scale style={{marginLeft: 'auto'}}>
                <svg width={90} height={90} viewBox="0 0 90 90" style={{transform: `rotate(${sway(f / 30, 2).deg * 4}deg)`}}>
                  <line x1={18} y1={8} x2={18} y2={86} stroke={color.text} strokeWidth={5} strokeLinecap="round" />
                  {[0, 1, 2, 3].map((k) => <rect key={k} x={20 + (k % 2) * 16} y={10 + Math.floor(k / 2) * 16} width={16} height={16} fill={k === 1 || k === 2 ? color.text : '#0a0e1a'} stroke={color.text} strokeWidth={2} />)}
                  <rect x={20} y={10} width={64} height={32} fill="none" stroke={color.text} strokeWidth={3} />
                </svg>
              </Appear>
            </div>}
            {i === 2 && f >= e - 2 && <div style={{marginTop: 14, padding: '12px 18px', borderRadius: 16, background: '#0d1220', border: `2px solid ${color.red}66`}}>
              <div style={{fontFamily: font, fontSize: 28, color: color.red, fontWeight: 800}}>线上终审 · 5 行</div>
              {Array.from({length: 5}, (_, k) => <div key={k} style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: 6, opacity: ramp(f, e + k * 8, e + k * 8 + 8)}}>
                <Check p={ramp(f, e + k * 8, e + k * 8 + 10)} size={28} c={color.cyan} />
                <div style={{height: 12, borderRadius: 6, background: '#3a4466', width: [180, 260, 220, 300, 150][k]}} />
              </div>)}
            </div>}
          </div>
        </div>
      </Appear>;
    })}
  </Root>;
};

/* outro — agents work, hand off and check each other; the human makes the call; disclosure */
const Outro: React.FC<SceneProps & {credit: string}> = ({f, cue}) => {
  const pop = usePop();
  const [a, b, c, d] = [cue('a', 96), cue('b', 159), cue('c', 231), cue('d', 263)];
  return <Root f={f} beats={[0, a, b, c, d]} glow={B} hits={[a + 37]}>
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 10}}>
      {ORDER.map((r, i) => <React.Fragment key={r}>
        {i > 0 && <Hand p={ease.outCubic(prog(f, 20 + i * 12, 10))} w={50} />}
        <Appear p={pop(f, i * 8)} scale><Av who={r} size={110} /></Appear>
      </React.Fragment>)}
      <Hand p={ease.outCubic(prog(f, a, 12))} w={50} c={B} />
      <Appear p={pop(f, a + 6)} scale><Av who="me" size={120} ring={f >= a ? 0.7 : 0} /></Appear>
    </div>
    <div style={{display: 'flex', justifyContent: 'center', gap: 14, marginTop: 24}}>
      {[['干活', color.cyan], ['交接', A], ['挑错', color.red]].map(([t, col], i) => <Appear key={t} p={pop(f, 14 + i * 12)} scale><Chip c={col} style={{fontSize: 38}}>{t}</Chip></Appear>)}
    </div>
    <Big f={f} at={a + 37} text="你只管拍板" c={B} size={72} h={190} style={{marginTop: 10}} />
    <Appear p={pop(f, b)} style={{textAlign: 'center', marginTop: 10}}><H size={52} c={color.amber}>你最想把哪份活交给 AI 团队？</H></Appear>
    <Appear p={pop(f, c)} style={{display: 'flex', justifyContent: 'center', gap: 16, marginTop: 24}}>
      <Chip c={color.cyan} style={{fontSize: 32}}>评论区聊聊</Chip><Chip c={color.violet} style={{fontSize: 32}}>点赞</Chip><Chip c={color.amber} style={{fontSize: 32}}>收藏</Chip>
    </Appear>
    <Appear p={pop(f, d)} style={{marginTop: 30, textAlign: 'center'}}>
      <P size={40} c={color.text}>内容参考：Rahul（X @sairahul1）</P>
      <P size={40} c={color.amber}>原文是 Teamily AI 的合作推广</P>
    </Appear>
  </Root>;
};

export const aiAgentTeamScenes: Record<string, React.FC<SceneProps & {credit: string}>> = {
  'at.hook': Hook,
  'at.idea': Idea,
  'at.task': Task,
  'at.roles': Roles,
  'at.rules': Rules,
  'at.kickoff': Kickoff,
  'at.pushback': Pushback,
  'at.chain': Chain,
  'at.insight': Insight,
  'at.block': Block,
  'at.fix': Fix,
  'at.human': Human,
  'at.ship': Ship,
  'at.loop': Loop,
  'at.lessons': Lessons,
  'at.outro': Outro,
};
