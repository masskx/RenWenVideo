import React from 'react';
import {interpolate} from 'remotion';
import {color, font, mono} from '../theme';
import {Appear, Arrow, Chip, ChatPrompt, Check, Dino, Panel, SceneProps, StepTitle, Window, ramp, usePop} from '../ui';

const H: React.FC<{size?: number; c?: string; style?: React.CSSProperties; children: React.ReactNode}> = ({size = 56, c = color.text, style, children}) => (
  <div style={{fontFamily: font, fontWeight: 900, fontSize: size, color: c, lineHeight: 1.25, ...style}}>{children}</div>
);
const P: React.FC<{size?: number; c?: string; style?: React.CSSProperties; children: React.ReactNode}> = ({size = 34, c = color.dim, style, children}) => (
  <div style={{fontFamily: font, fontSize: size, color: c, lineHeight: 1.45, ...style}}>{children}</div>
);
const Dot: React.FC<{c: string; children: React.ReactNode; size?: number}> = ({c, children, size = 74}) => (
  <div style={{width: size, height: size, borderRadius: size / 2, background: `${c}26`, border: `3px solid ${c}`, color: c, fontFamily: font,
    fontSize: size * 0.48, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none'}}>{children}</div>
);
const Tag: React.FC<{c: string; children: React.ReactNode}> = ({c, children}) => (
  <span style={{fontFamily: font, fontSize: 22, fontWeight: 700, color: c, background: `${c}1f`, border: `1.5px solid ${c}77`, borderRadius: 8, padding: '2px 10px', whiteSpace: 'nowrap'}}>{children}</span>
);
const Source: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{fontFamily: font, fontSize: 22, color: color.dim, marginTop: 14}}>出处：{children}</div>
);

const DOMAINS = ['null² 展馆', '展览', '学术', '企业', '著作 · 媒体', '公职'];
const PALETTE = [color.cyan, color.violet, color.amber, color.green, color.pink, '#60a5fa'];

/* 01 — hook: one Claude Code session fans out into six research agents */
const Hook: React.FC<SceneProps> = ({f, cue}) => {
  const pop = usePop();
  const [a, b, c] = [cue('a', 75), cue('b', 127), cue('c', 230)];
  const cx = 440;
  const cy = 300;
  return <div>
    <Appear p={pop(f, 0)} style={{textAlign: 'center'}}><Chip c={color.amber}>日本媒体艺术家 · 落合阳一</Chip></Appear>
    <Appear p={pop(f, a)} style={{textAlign: 'center', marginTop: 20}}><H size={52}>为了写一篇“介绍自己”的文章</H></Appear>
    <div style={{position: 'relative', height: 640, marginTop: 20}}>
      {DOMAINS.map((d, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const x = 40 + col * 280;
        const y = row === 0 ? 10 : 480;
        const p = pop(f, b + i * 6);
        return <div key={d} style={{position: 'absolute', left: x + (cx - 120 - x) * (1 - p), top: y + (cy - 60 - y) * (1 - p), width: 240, opacity: Math.min(1, p * 1.5)}}>
          <Panel glow={PALETTE[i]} style={{padding: '18px 14px', textAlign: 'center'}}>
            <div style={{fontFamily: mono, fontSize: 24, color: PALETTE[i]}}>Agent {i + 1}</div>
            <div style={{fontFamily: font, fontSize: 32, fontWeight: 800, color: color.text, marginTop: 6, whiteSpace: 'nowrap'}}>{d}</div>
          </Panel>
        </div>;
      })}
      <Appear p={pop(f, a + 20)} scale style={{position: 'absolute', left: cx - 230, top: cy - 70, width: 460}}>
        <Panel glow={color.violet} style={{textAlign: 'center', padding: '24px 20px'}}>
          <div style={{fontFamily: mono, fontSize: 40, fontWeight: 800, color: color.text}}>Claude Code</div>
          <div style={{fontFamily: font, fontSize: 30, color: color.violet, marginTop: 6, whiteSpace: 'nowrap'}}>并行派出 <b style={{fontSize: 44}}>6</b> 个调查 Agent</div>
        </Panel>
      </Appear>
    </div>
    <Appear p={pop(f, c)} style={{display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginTop: 6}}>
      {['分工调查', '换读者写', '先做原型', '自造工具', '留下记录', '改成规则'].map((t, i) => <Appear key={t} p={pop(f, c + i * 4)} dy={14}><Chip c={PALETTE[i]} style={{fontSize: 28, padding: '6px 16px'}}>{t}</Chip></Appear>)}
    </Appear>
  </div>;
};

/* 02 — premise: time saved, and the "effort RPM" loop */
const Premise: React.FC<SceneProps> = ({f, cue}) => {
  const pop = usePop();
  const [a, b, c] = [cue('a', 104), cue('b', 193), cue('c', 325)];
  const shrink = ramp(f, 10, a);
  const tasks = ['写稿', '查资料', '写代码'];
  const loop = ['核对', '改写', '造工具', '下一轮'];
  const spin = interpolate(f, [c, c + 120], [0, 360], {extrapolateLeft: 'clamp', extrapolateRight: 'extend'});
  return <div>
    <Appear p={pop(f, 0)}><H size={60}>AI 省下来的时间，拿去做什么？</H></Appear>
    <Panel style={{marginTop: 34}}>
      {tasks.map((t, i) => <div key={t} style={{display: 'flex', alignItems: 'center', gap: 20, marginBottom: i < 2 ? 18 : 0}}>
        <span style={{fontFamily: font, fontSize: 34, color: color.text, width: 130}}>{t}</span>
        <div style={{flex: 1, height: 34, borderRadius: 17, background: '#1b2238', position: 'relative'}}>
          <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 17, width: `${100 - shrink * (55 + i * 8)}%`, background: `linear-gradient(90deg, ${color.cyan}, ${color.violet})`}} />
        </div>
      </div>)}
      <Appear p={pop(f, a)} dy={10}><P size={30} c={color.amber} style={{marginTop: 18, textAlign: 'right'}}>省下的时间 → ？</P></Appear>
    </Panel>
    <Appear p={pop(f, b)} style={{marginTop: 34, textAlign: 'center'}}>
      <H size={64} c={color.amber}>“提高努力的转速”</H>
      <P size={26}>原文作者对落合做法的概括，不是他本人提出的方法名</P>
    </Appear>
    <Appear p={pop(f, c)} style={{position: 'relative', height: 360, marginTop: 20}}>
      <svg width={880} height={360} style={{position: 'absolute', inset: 0}}>
        <g transform={`translate(440,180) rotate(${spin})`}>
          <circle r={130} fill="none" stroke={`${color.violet}88`} strokeWidth={4} strokeDasharray="14 12" />
          <path d="M 128 -20 L 140 6 L 116 4 Z" fill={color.violet} />
        </g>
      </svg>
      {loop.map((t, i) => {
        const ang = -Math.PI / 2 + i * Math.PI / 2;
        return <div key={t} style={{position: 'absolute', left: 440 + Math.cos(ang) * 175 - 80, top: 180 + Math.sin(ang) * 140 - 30, width: 160, textAlign: 'center'}}>
          <Appear p={pop(f, c + i * 10)} scale><Chip c={PALETTE[i]} style={{fontSize: 32}}>{t}</Chip></Appear>
        </div>;
      })}
    </Appear>
  </div>;
};

/* 03 — habit 1: six agents, claims with evidence, cross-check, verifier */
const Agents: React.FC<SceneProps> = ({f, cue}) => {
  const pop = usePop();
  const [a, b, c, d] = [cue('a', 105), cue('b', 316), cue('c', 417), cue('d', 487)];
  return <div>
    <StepTitle n={1} title="拆开调查，带证据交回" p={pop(f, 0)} />
    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14}}>
      {DOMAINS.map((t, i) => <Appear key={t} p={pop(f, a + i * 7)} dy={20}>
        <div style={{background: '#121a2e', border: `2px solid ${PALETTE[i]}88`, borderRadius: 16, padding: '14px 10px', textAlign: 'center'}}>
          <div style={{fontFamily: mono, fontSize: 20, color: PALETTE[i]}}>Agent {i + 1}</div>
          <div style={{fontFamily: font, fontSize: 30, fontWeight: 800, color: color.text, whiteSpace: 'nowrap'}}>{t}</div>
        </div>
      </Appear>)}
    </div>
    <Appear p={pop(f, b)} style={{marginTop: 24}}>
      <Panel style={{padding: '16px 22px'}}>
        <div style={{display: 'grid', gridTemplateColumns: '2.2fr 1.2fr 1.2fr 1fr', fontFamily: font, fontSize: 24, color: color.dim, paddingBottom: 8, borderBottom: '2px solid #2a3352'}}>
          <span>结论</span><span>网址</span><span>确认日期</span><span>状态</span>
        </div>
        {[['某年参加某展览', '已核实', color.green], ['现任某职务', '待确认', color.amber]].map(([claim, st, c2], i) => <Appear key={claim} p={pop(f, b + 12 + i * 10)} dy={10}>
          <div style={{display: 'grid', gridTemplateColumns: '2.2fr 1.2fr 1.2fr 1fr', alignItems: 'center', padding: '10px 0', fontFamily: font, fontSize: 26, color: color.text}}>
            <span>{claim}</span><span style={{fontFamily: mono, fontSize: 22, color: color.cyan}}>https://…</span><span style={{fontFamily: mono, fontSize: 22}}>2026-09</span><span><Tag c={c2}>{st}</Tag></span>
          </div>
        </Appear>)}
        <P size={20} style={{marginTop: 4}}>示意行，非原始数据</P>
      </Panel>
    </Appear>
    <div style={{display: 'flex', gap: 18, marginTop: 22, alignItems: 'stretch'}}>
      <Appear p={pop(f, c)} style={{flex: 1}}>
        <Panel style={{padding: '18px 20px', height: '100%'}}>
          <P size={26} c={color.text}>对照本人资料</P>
          <div style={{display: 'flex', gap: 10, marginTop: 10}}><Chip c={color.cyan} style={{fontSize: 24}}>履历</Chip><Chip c={color.violet} style={{fontSize: 24}}>作品台账</Chip></div>
        </Panel>
      </Appear>
      <Appear p={pop(f, d)} style={{flex: 1}}>
        <Panel glow={color.green} style={{padding: '18px 20px', height: '100%', display: 'flex', alignItems: 'center', gap: 16}}>
          <Check p={ramp(f, d + 6, d + 20)} size={56} />
          <div><P size={26} c={color.text}>核查 Agent 复核</P><H size={40} c={color.green}>14 个关键项</H></div>
        </Panel>
      </Appear>
    </div>
    <Appear p={pop(f, d + 20)}><Source>落合阳一 note（2026-09-07），经原文整理</Source></Appear>
  </div>;
};

/* 04 — habit 1 applied: split by domain, fix the return format; role-play ≠ real agents */
const Split: React.FC<SceneProps> = ({f, cue}) => {
  const pop = usePop();
  const [a, b, c, d] = [cue('a', 46), cue('b', 82), cue('c', 198), cue('d', 299)];
  return <div>
    <StepTitle n={1} title="用到你的工作里" p={pop(f, 0)} />
    <Appear p={pop(f, a)}>
      <Panel>
        <P size={30} c={color.text}>例：更新公司介绍</P>
        <div style={{display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 14}}>
          {['基本信息', '产品服务', '客户案例', '创始人经历'].map((t, i) => <Appear key={t} p={pop(f, a + 6 + i * 5)} dy={12}><Chip c={PALETTE[i]}>{t}</Chip></Appear>)}
        </div>
      </Panel>
    </Appear>
    <Appear p={pop(f, b)} style={{marginTop: 22}}>
      <Panel glow={color.cyan}>
        <P size={30} c={color.text}>每一路交回同一种格式</P>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 14, fontFamily: font, fontSize: 32}}>
          <div style={{flex: 1, padding: '14px 18px', borderRadius: 14, background: '#1b2238', color: color.text}}>事实</div>
          <span style={{color: color.cyan, fontSize: 40}}>⇄</span>
          <div style={{flex: 1, padding: '14px 18px', borderRadius: 14, background: '#1b2238', color: color.text}}>出处</div>
        </div>
      </Panel>
    </Appear>
    <div style={{display: 'flex', gap: 18, marginTop: 26}}>
      <Appear p={pop(f, c)} style={{flex: 1}}>
        <Panel glow={color.red} style={{height: 250}}>
          <div style={{fontFamily: font, fontSize: 30, color: color.red, fontWeight: 800}}>✗ 普通聊天</div>
          <P size={28} c={color.text} style={{marginTop: 10}}>“请扮演 6 位专家回答”</P>
          <P size={24} style={{marginTop: 6}}>仍是一次回答</P>
        </Panel>
      </Appear>
      <Appear p={pop(f, d)} style={{flex: 1}}>
        <Panel glow={color.green} style={{height: 250}}>
          <div style={{fontFamily: font, fontSize: 30, color: color.green, fontWeight: 800}}>✓ 真正分工</div>
          <P size={28} c={color.text} style={{marginTop: 10}}>Claude Code 子 Agent 各自执行</P>
          <P size={24} style={{marginTop: 6}}>要看执行记录和各自的产出</P>
        </Panel>
      </Appear>
    </div>
  </div>;
};

/* 05 — your own source material decides conflicts */
const Sources: React.FC<SceneProps> = ({f, cue}) => {
  const pop = usePop();
  const [a, b, c] = [cue('a', 107), cue('b', 229), cue('c', 286)];
  const doc = (title: string, value: string, c2: string, at: number) => <Appear p={pop(f, at)} style={{flex: 1}}>
    <Panel glow={c2} style={{textAlign: 'center', padding: '26px 16px'}}>
      <P size={28}>{title}</P>
      <div style={{fontFamily: font, fontSize: 30, color: color.text, marginTop: 10}}>服务过</div>
      <div style={{fontFamily: mono, fontSize: 96, fontWeight: 800, color: c2, lineHeight: 1.1}}>{value}</div>
      <div style={{fontFamily: font, fontSize: 30, color: color.text}}>所学校</div>
    </Panel>
  </Appear>;
  return <div>
    <Appear p={pop(f, 0)}><H size={56}>AI 派得越多<br />你手里的原始资料越重要</H></Appear>
    <div style={{display: 'flex', gap: 20, marginTop: 40, alignItems: 'center'}}>
      {doc('旧简介', '30', color.cyan, a)}
      <Appear p={pop(f, a + 30)}><div style={{fontFamily: font, fontSize: 60, color: color.red, fontWeight: 900}}>≠</div></Appear>
      {doc('新海报', '45', color.violet, a + 30)}
    </div>
    <Appear p={pop(f, b)} style={{marginTop: 34}}>
      <Panel glow={color.red} style={{display: 'flex', alignItems: 'center', gap: 18, padding: '20px 26px'}}>
        <span style={{fontSize: 40, color: color.red, fontFamily: font, fontWeight: 900}}>✗</span>
        <P size={32} c={color.text}>“哪个数字对？挑一个用”</P>
      </Panel>
    </Appear>
    <Appear p={pop(f, c)} style={{marginTop: 18}}>
      <Panel glow={color.green} style={{display: 'flex', alignItems: 'center', gap: 18, padding: '20px 26px'}}>
        <span style={{fontSize: 40, color: color.green, fontFamily: font, fontWeight: 900}}>✓</span>
        <P size={32} c={color.text}>“两个数字各统计什么？以原始记录为准”</P>
      </Panel>
    </Appear>
  </div>;
};

/* 06 — habit 2: one piece of knowledge, rewritten per reader */
const Rewrite: React.FC<SceneProps> = ({f, cue}) => {
  const pop = usePop();
  const [a, b, c] = [cue('a', 104), cue('b', 306), cue('c', 419)];
  const readers = [
    {who: '第一次接触的人', first: '这是什么、和我有什么关系', c: color.cyan},
    {who: '一线执行者', first: '我每天的工作哪里会变', c: color.violet},
    {who: '拍板的老板', first: '要多久、谁来维护', c: color.amber},
  ];
  return <div>
    <StepTitle n={2} title="换读者重写" p={pop(f, 0)} />
    <Appear p={pop(f, a)}>
      <Panel glow={color.violet} style={{display: 'flex', alignItems: 'center', gap: 20}}>
        <Chip c={color.violet}>Claude 3 · 2024</Chip>
        <P size={30} c={color.text}>“数字自然”：专业版 → 高中生版</P>
      </Panel>
      <Source>落合阳一 note「Claude3，文章が上手い．」（2024-03-05）</Source>
    </Appear>
    <div style={{marginTop: 26}}>
      {readers.map((r, i) => <Appear key={r.who} p={pop(f, b + i * 14)} dy={18} style={{marginBottom: 14}}>
        <Panel glow={r.c} style={{padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 20}}>
          <Dot c={r.c} size={60}>{i + 1}</Dot>
          <div><H size={36}>{r.who}</H><P size={26}>先讲：{r.first}</P></div>
        </Panel>
      </Appear>)}
    </div>
    <Appear p={pop(f, c)} style={{display: 'flex', gap: 14, marginTop: 10, flexWrap: 'wrap'}}>
      <Chip c={color.green}>术语可以减</Chip><Chip c={color.amber}>条件和例外不删</Chip><Chip c={color.red}>没有的数据不加</Chip>
    </Appear>
  </div>;
};

/* 07 — habit 3: prototypes expose missing conditions */
const Prototype: React.FC<SceneProps> = ({f, cue}) => {
  const pop = usePop();
  const [a, b, c, d, e] = [cue('a', 94), cue('b', 253), cue('c', 330), cue('d', 394), cue('e', 520)];
  const uses = ['网站开发', '仪表盘 / 展示终端试做', '长论文翻译', '研究声明结构整理'];
  const questions = [{t: '要填什么？', at: d}, {t: '填错了怎么办？', at: d + 26}, {t: '提交后看到什么？', at: d + 52}];
  return <div>
    <StepTitle n={3} title="先做一个能动的小原型" p={pop(f, 0)} />
    <Appear p={pop(f, a)}>
      <Panel>
        <P size={28} c={color.text}>落合研究室用 Claude 做的事</P>
        <div style={{display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12}}>
          {uses.map((u, i) => <Appear key={u} p={pop(f, (i < 2 ? a : b) + (i % 2) * 8)} dy={10}><Chip c={PALETTE[i]} style={{fontSize: 28}}>{u}</Chip></Appear>)}
        </div>
        <Source>落合研究室官网 · 研究室整体实践，非本人独做</Source>
      </Panel>
    </Appear>
    <div style={{display: 'flex', gap: 22, marginTop: 26, alignItems: 'flex-start'}}>
      <Appear p={pop(f, c)} style={{width: 400}}>
        <Window title="报名页原型" bodyStyle={{padding: 22}}>
          {['姓名', '邮箱', '参加场次'].map((l) => <div key={l} style={{marginBottom: 14}}>
            <div style={{fontFamily: font, fontSize: 24, color: color.dim}}>{l}</div>
            <div style={{height: 44, borderRadius: 10, background: '#1b2238', border: '2px solid #2a3352'}} />
          </div>)}
          <div style={{height: 54, borderRadius: 12, background: color.cyan, color: '#0a0e1a', fontFamily: font, fontSize: 28, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>提交</div>
        </Window>
      </Appear>
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 16}}>
        <Appear p={pop(f, c)}><P size={30} c={color.text}>文字可以含糊，原型不行</P></Appear>
        {questions.map((q) => <Appear key={q.t} p={pop(f, q.at)} dy={14}><Chip c={color.amber} style={{fontSize: 30}}>{q.t}</Chip></Appear>)}
      </div>
    </div>
    <Appear p={pop(f, e)} style={{marginTop: 22}}><Chip c={color.green} style={{fontSize: 34}}>一次只验证一个动作</Chip></Appear>
  </div>;
};

/* 08 — habit 4: an overnight build of his own tool */
const Overnight: React.FC<SceneProps> = ({f, cue}) => {
  const pop = usePop();
  const [a, b, c] = [cue('a', 105), cue('b', 268), cue('c', 339)];
  const night = ramp(f, b, b + 40) - ramp(f, c, c + 30);
  return <div>
    <StepTitle n={4} title="自己造工具" p={pop(f, 0)} />
    <Appear p={pop(f, a)}><Chip c={color.amber}>2026 年 2 月 · 起因</Chip></Appear>
    <div style={{display: 'flex', gap: 18, marginTop: 16}}>
      {[['工作坊', '每个人的付费情况不同'], ['研究室', 'Claude API 费用不低']].map(([k, v], i) => <Appear key={k} p={pop(f, a + 10 + i * 20)} style={{flex: 1}}>
        <Panel glow={i ? color.pink : color.amber} style={{padding: '20px 22px'}}><H size={36}>{k}</H><P size={28}>{v}</P></Panel>
      </Appear>)}
    </div>
    <Appear p={pop(f, b)} style={{marginTop: 30}}>
      <Panel style={{position: 'relative', overflow: 'hidden', padding: 0, height: 360, background: `linear-gradient(180deg, rgba(10,14,40,${0.4 + night * 0.5}), rgba(30,40,80,${0.9 - night * 0.4}))`}}>
        <svg width={876} height={360} style={{position: 'absolute', inset: 0}}>
          <circle cx={160 + ramp(f, b, c + 30) * 560} cy={120 + Math.sin(ramp(f, b, c + 30) * Math.PI) * -60} r={44} fill={f < c ? '#e2e8f0' : color.amber} opacity={0.9} />
          {f < c && <circle cx={178 + ramp(f, b, c + 30) * 560} cy={108 + Math.sin(ramp(f, b, c + 30) * Math.PI) * -60} r={40} fill="#141c35" />}
        </svg>
        <div style={{position: 'absolute', left: 30, bottom: 26, right: 30, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between'}}>
          <div>
            <div style={{fontFamily: mono, fontSize: 26, color: color.cyan}}>Claude Code · 连夜继续开发…</div>
            <div style={{height: 10, width: 460, borderRadius: 5, background: '#2a3352', marginTop: 12}}>
              <div style={{height: 10, width: `${ramp(f, b, c) * 100}%`, borderRadius: 5, background: `linear-gradient(90deg, ${color.cyan}, ${color.violet})`}} />
            </div>
          </div>
          <Dino size={130} run={f} />
        </div>
      </Panel>
    </Appear>
    <Appear p={pop(f, c)} style={{marginTop: 24}}>
      <Panel glow={color.green} style={{display: 'flex', alignItems: 'center', gap: 18}}>
        <Check p={ramp(f, c + 6, c + 20)} size={52} />
        <div><H size={36}>第二天早上：本地编程环境可用</H><P size={26}>不依赖 Claude Code 也能运行 · 落合阳一 note（2026-02-23）</P></div>
      </Panel>
    </Appear>
  </div>;
};

/* 09 — vibe-local: built with Claude Code, runs on local models */
const VibeLocal: React.FC<SceneProps> = ({f, cue}) => {
  const pop = usePop();
  const [a, b, c, d] = [cue('a', 73), cue('b', 198), cue('c', 315), cue('d', 461)];
  const spec = [['输入', '收到什么'], ['输出', '交出什么'], ['出错', '怎么处理'], ['交还给人', '哪一步停下']];
  const box = (t: string, sub: string, c2: string) => <div style={{flex: 1, textAlign: 'center', padding: '16px 8px', borderRadius: 16, background: '#121a2e', border: `2px solid ${c2}88`}}>
    <div style={{fontFamily: mono, fontSize: 28, fontWeight: 800, color: c2}}>{t}</div><div style={{fontFamily: font, fontSize: 22, color: color.dim}}>{sub}</div>
  </div>;
  return <div>
    <StepTitle n={4} title="开源项目 vibe-local" p={pop(f, 0)} />
    <Appear p={pop(f, a)}>
      <Panel glow={color.cyan}>
        <P size={26}>运行时（默认）</P>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 10}}>
          {box('OpenCode', '界面', color.violet)}<span style={{color: color.dim, fontSize: 36}}>→</span>
          {box('Ollama', '本机运行', color.cyan)}<span style={{color: color.dim, fontSize: 36}}>→</span>
          {box('开源模型', '本地 LLM', color.green)}
        </div>
      </Panel>
    </Appear>
    <Appear p={pop(f, b)} style={{marginTop: 20}}>
      <Panel glow={color.amber} style={{display: 'flex', alignItems: 'center', gap: 18}}>
        <div style={{flex: 1}}><P size={26}>开发时</P><H size={38}>Claude Code 写的</H></div>
        <div style={{fontFamily: font, fontSize: 52, color: color.amber, fontWeight: 900}}>≠</div>
        <div style={{flex: 1}}><P size={26}>运行时</P><H size={38}>不一定用 Claude</H></div>
      </Panel>
      <Source>github.com/ochyai/vibe-local README（2026-10 查阅）</Source>
    </Appear>
    <Appear p={pop(f, c)} style={{marginTop: 24}}>
      <Panel>
        <H size={34}>给 AI 提工具需求，写清 4 件事</H>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14}}>
          {spec.map(([k, v], i) => <Appear key={k} p={pop(f, (i < 3 ? c : d) + (i < 3 ? i * 18 : 0))} dy={10}>
            <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 14, background: '#121a2e'}}>
              <Check p={ramp(f, (i < 3 ? c : d) + i * 18, (i < 3 ? c : d) + i * 18 + 12)} size={34} c={PALETTE[i]} />
              <span style={{fontFamily: font, fontSize: 30, fontWeight: 800, color: color.text}}>{k}</span>
              <span style={{fontFamily: font, fontSize: 24, color: color.dim}}>{v}</span>
            </div>
          </Appear>)}
        </div>
      </Panel>
    </Appear>
  </div>;
};

/* 10 — habit 5: co-vibe routing and the four-line work log */
const Covibe: React.FC<SceneProps> = ({f, cue}) => {
  const pop = usePop();
  const [a, b, c, d] = [cue('a', 94), cue('b', 282), cue('c', 347), cue('d', 449)];
  const providers = ['Anthropic', 'OpenAI', 'Groq', 'Ollama'];
  const active = Math.floor(Math.max(0, f - a - 40) / 24) % 4;
  const log = [['参考了什么', '依据哪些资料'], ['改了什么', '改动和理由'], ['验证了什么', '实际确认过的'], ['卡在哪里', '下一步需要什么']];
  return <div>
    <StepTitle n={5} title="让 AI 留下工作记录" p={pop(f, 0)} />
    <Appear p={pop(f, a)}>
      <Panel glow={color.violet}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
          <div style={{padding: '14px 20px', borderRadius: 16, background: '#1b2238', fontFamily: mono, fontSize: 30, color: color.text}}>co-vibe</div>
          <span style={{fontFamily: font, fontSize: 26, color: color.dim}}>按任务分配模型 →</span>
        </div>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10, marginTop: 16}}>
          {providers.map((p, i) => <Appear key={p} p={pop(f, a + 10 + i * 8)} dy={10}>
            <div style={{textAlign: 'center', padding: '14px 4px', borderRadius: 14, fontFamily: mono, fontSize: 24, fontWeight: 700,
              color: f > a + 40 && i === active ? '#0a0e1a' : PALETTE[i], background: f > a + 40 && i === active ? PALETTE[i] : '#121a2e', border: `2px solid ${PALETTE[i]}88`}}>{p}</div>
          </Appear>)}
        </div>
        <Appear p={pop(f, b)} dy={10} style={{display: 'flex', gap: 12, marginTop: 16}}>
          <Chip c={color.amber} style={{fontSize: 26}}>/cost 显示花费</Chip><Chip c={color.cyan} style={{fontSize: 26}}>--debug 可调试</Chip>
        </Appear>
        <Source>github.com/ochyai/co-vibe README · 落合阳一 note（2026-02-26）</Source>
      </Panel>
    </Appear>
    <Appear p={pop(f, c)} style={{marginTop: 26}}><H size={38}>做完让 AI 交代 4 件事</H></Appear>
    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14}}>
      {log.map(([k, v], i) => <Appear key={k} p={pop(f, d + i * 14)} dy={14}>
        <Panel glow={PALETTE[i]} style={{padding: '18px 20px'}}><H size={34} c={PALETTE[i]}>{k}</H><P size={24}>{v}</P></Panel>
      </Appear>)}
    </div>
  </div>;
};

/* 11 — habit 6 (author's suggestion): turn repeated fixes into a pruned rules file */
const Rules: React.FC<SceneProps> = ({f, cue}) => {
  const pop = usePop();
  const [a, b, c] = [cue('a', 140), cue('b', 229), cue('c', 348)];
  const rules = [
    {t: '读者是第一次接触这个主题的人', at: b + 8},
    {t: '资料里没有的数字和成绩，不要加', at: b + 22},
    {t: '事实和观点分开写', at: b + 36},
    {t: '每次写 800 字以内', at: b + 50, stale: true},
    {t: '改完写一行：改了哪里、以后怎么避免', at: b + 64},
  ];
  return <div>
    <StepTitle n={6} title="把改过的地方变成规则" p={pop(f, 0)} />
    <Appear p={pop(f, 4)}><Chip c={color.dim} style={{fontSize: 26}}>原文作者的延伸建议 · 非落合本人模板</Chip></Appear>
    <Appear p={pop(f, a)} style={{display: 'flex', gap: 14, marginTop: 24, flexWrap: 'wrap'}}>
      {['“别乱加数据”', '“先说给谁看”', '“别那么生硬”'].map((t, i) => <Appear key={t} p={pop(f, a + i * 8)} dy={12}><Chip c={color.amber} style={{fontSize: 30}}>{t} ×{3 + i}</Chip></Appear>)}
    </Appear>
    <Appear p={pop(f, b)} style={{marginTop: 26}}>
      <Window title="rules.md · 每次开工先读" bodyStyle={{fontFamily: font, fontSize: 30, lineHeight: 1.6}}>
        {rules.map((r) => {
          const struck = r.stale && f > c + 20;
          return <Appear key={r.t} p={pop(f, r.at)} dy={8}>
            <div style={{color: struck ? color.dim : color.text, textDecoration: struck ? 'line-through' : 'none', opacity: struck ? 0.55 : 1}}>
              <span style={{color: color.cyan, fontFamily: mono}}>- </span>{r.t}{struck && <span style={{color: color.red, fontSize: 24, marginLeft: 12}}>过时，删掉</span>}
            </div>
          </Appear>;
        })}
      </Window>
    </Appear>
    <Appear p={pop(f, c)} style={{display: 'flex', gap: 14, marginTop: 22}}>
      <Chip c={color.violet}>定期清理</Chip><Chip c={color.cyan}>矛盾的合并</Chip><Chip c={color.red}>过时的删掉</Chip>
    </Appear>
  </div>;
};

/* 12 — five steps to start */
const Start: React.FC<SceneProps> = ({f, cue}) => {
  const pop = usePop();
  const at = [cue('a', 84), cue('b', 174), cue('c', 244), cue('d', 319), cue('e', 413)];
  const steps = [
    {t: '交出真实素材', s: '旧稿、真实提问、现有资料，标明时间和来源'},
    {t: '只确认一件事', s: '这次要验证的问题写成一句话'},
    {t: '拆开调查、留证据', s: '调查、写作、制作、检查分开做'},
    {t: '亲手用，说具体哪里别扭', s: '在哪个场景、发生了什么、希望怎样'},
    {t: '把经验留给下一次', s: '资料、失败原因、要遵守的条件'},
  ];
  return <div>
    <Appear p={pop(f, 0)}><H size={62}>今天就能开始的 5 步</H></Appear>
    <div style={{marginTop: 34}}>
      {steps.map((s, i) => <Appear key={s.t} p={pop(f, at[i])} dy={0} style={{display: 'flex', alignItems: 'center', gap: 26, marginBottom: 24,
        transform: `translateX(${(1 - pop(f, at[i])) * -60}px)`}}>
        <div style={{width: 92, height: 92, borderRadius: 46, background: `linear-gradient(135deg, ${color.cyan}, ${color.violet})`, color: '#0a0e1a',
          fontFamily: font, fontSize: 48, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none'}}>{i + 1}</div>
        <div><H size={44}>{s.t}</H><P size={28}>{s.s}</P></div>
      </Appear>)}
    </div>
    <Appear p={pop(f, at[4] + 40)}>
      <Window title="开场可以这样说（示例）" bodyStyle={{padding: 20}}>
        <ChatPrompt f={f} at={at[4] + 40} cps={3} fontSize={28} text="这次我只想确认：新人读完能不能自己报名。先把我给的资料分成事实、我的推测和待确认，再开始写。" />
      </Window>
    </Appear>
  </div>;
};

/* 13 — outro */
const Outro: React.FC<SceneProps & {credit: string}> = ({f, cue, credit}) => {
  const pop = usePop();
  const [a, b, c] = [cue('a', 50), cue('b', 111), cue('c', 164)];
  return <div style={{textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
    <Appear p={pop(f, 0)}><H size={60}>AI 省下的时间</H></Appear>
    <Arrow p={ramp(f, a - 10, a + 10)} length={70} c={color.violet} />
    <Appear p={pop(f, a)} style={{display: 'flex', gap: 16, justifyContent: 'center'}}>
      <Chip c={color.cyan} style={{fontSize: 38, padding: '10px 28px'}}>去试错</Chip><Chip c={color.amber} style={{fontSize: 38, padding: '10px 28px'}}>听反馈</Chip>
    </Appear>
    <Arrow p={ramp(f, b - 10, b + 10)} length={70} c={color.violet} />
    <Appear p={pop(f, b)}><H size={64} c={color.green}>变成真正的进步</H></Appear>
    <Appear p={pop(f, c)} style={{display: 'flex', gap: 30, marginTop: 50, justifyContent: 'center'}}>
      {[['♥', '点赞', color.pink], ['★', '收藏', color.amber], ['…', '评论区聊聊', color.cyan]].map(([i, t, c2]) => <div key={t} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8}}>
        <div style={{width: 110, height: 110, borderRadius: 55, background: `${c2}26`, border: `3px solid ${c2}`, color: c2, fontSize: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font}}>{i}</div>
        <P size={30} c={color.text}>{t}</P>
      </div>)}
    </Appear>
    <Appear p={pop(f, c + 20)} style={{marginTop: 40, maxWidth: 840}}><P size={23}>{credit}</P></Appear>
  </div>;
};

export const ochiaiClaudeCodeScenes: Record<string, React.FC<SceneProps & {credit: string}>> = {
  'oc.hook': Hook, 'oc.premise': Premise, 'oc.agents': Agents, 'oc.split': Split, 'oc.sources': Sources, 'oc.rewrite': Rewrite,
  'oc.prototype': Prototype, 'oc.overnight': Overnight, 'oc.vibeLocal': VibeLocal, 'oc.covibe': Covibe, 'oc.rules': Rules,
  'oc.start': Start, 'oc.outro': Outro,
};
