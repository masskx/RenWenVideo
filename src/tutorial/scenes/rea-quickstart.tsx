import React from 'react';
import {interpolate} from 'remotion';
import {color, font, mono} from '../theme';
import {
  Appear, Arrow, Chip, ChatPrompt, Check, Code, DinoGame, Dino, Key, Panel, SceneProps, Slider, StepTitle, Terminal,
  Toggle, ToolCall, Window, ramp, usePop,
} from '../ui';

const H: React.FC<{size?: number; c?: string; style?: React.CSSProperties; children: React.ReactNode}> = ({size = 56, c = color.text, style, children}) => (
  <div style={{fontFamily: font, fontWeight: 900, fontSize: size, color: c, lineHeight: 1.25, ...style}}>{children}</div>
);
const P: React.FC<{size?: number; c?: string; style?: React.CSSProperties; children: React.ReactNode}> = ({size = 34, c = color.dim, style, children}) => (
  <div style={{fontFamily: font, fontSize: size, color: c, lineHeight: 1.45, ...style}}>{children}</div>
);
const Gradient: React.FC<{size: number; children: React.ReactNode}> = ({size, children}) => (
  <span style={{fontFamily: font, fontWeight: 900, fontSize: size, background: `linear-gradient(90deg, ${color.cyan}, ${color.violet} 60%, ${color.pink})`,
    WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', lineHeight: 1.1}}>{children}</span>
);

/* 01 — hook */
export const Hook: React.FC<SceneProps> = ({f, cue}) => {
  const pop = usePop();
  const stars = Math.round(interpolate(f, [6, 70], [0, 25599], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  const a = cue('a', 90);
  const b = cue('b', 175);
  return <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingTop: 20}}>
    <Appear p={pop(f, 0)}><Chip c={color.amber}>GitHub 日榜 · 单日新增</Chip></Appear>
    <Appear p={pop(f, 4)} style={{marginTop: 26}}>
      <span style={{fontFamily: mono, fontWeight: 800, fontSize: 150, color: color.amber, textShadow: `0 0 40px ${color.amber}66`}}>
        +{stars.toLocaleString('en-US')}</span>
      <span style={{fontSize: 110, color: color.amber, marginLeft: 12}}>★</span>
    </Appear>
    <Appear p={pop(f, 30)}><P size={34}>累计 12 万+ Star · 开源 · MIT 许可</P></Appear>
    <Appear p={pop(f, a, 11)} scale style={{marginTop: 60}}>
      <Gradient size={240}>REA</Gradient>
      <div style={{fontFamily: mono, fontSize: 46, color: color.text, letterSpacing: 2, marginTop: 6}}>Reverse Engineer Anything</div>
    </Appear>
    <Appear p={pop(f, b)} style={{marginTop: 64}}>
      <Panel glow={color.violet} style={{padding: '30px 46px'}}>
        <H size={62}>保姆级上手 · 5 步跑通</H>
        <div style={{display: 'flex', gap: 14, marginTop: 22, justifyContent: 'center'}}>
          {['玩一局', '接工具', '问规则', '做新版', '做核对'].map((s, i) => <Appear key={s} p={pop(f, b + 8 + i * 5)} dy={16}><Chip c={i % 2 ? color.violet : color.cyan} style={{fontSize: 28, padding: '6px 16px'}}>{s}</Chip></Appear>)}
        </div>
      </Panel>
    </Appear>
  </div>;
};

/* 02 — what is REA */
export const What: React.FC<SceneProps> = ({f, cue}) => {
  const pop = usePop();
  const [a, b, c, d] = [cue('a', 95), cue('b', 250), cue('c', 359), cue('d', 416)];
  const flow = [
    {at: b, t: '看到喜欢的功能', s: '网页 · 桌面应用 · 二进制程序', c: color.amber},
    {at: b + 40, t: 'REA 读取背后的程序', s: '追踪处理过程', c: color.cyan},
    {at: c, t: 'AI 讲清原理', s: '每条结论附出处 · 记录依据和限制', c: color.violet},
    {at: d, t: '做出你自己的版本', s: '看懂 → 动手，在同一次对话里', c: color.green},
  ];
  return <div>
    <Appear p={pop(f, 0)}><H size={64}>REA 是什么？</H></Appear>
    <Appear p={pop(f, 10)} style={{marginTop: 18}}><P size={38} c={color.text}>开源<b style={{color: color.cyan}}>逆向分析工具</b> · 通过 MCP 给 AI 调用</P></Appear>
    <Appear p={pop(f, a)} style={{display: 'flex', gap: 16, marginTop: 22}}>
      <Chip c={color.cyan}>Codex</Chip><Chip c={color.violet}>Claude Code</Chip><Chip c={color.dim}>其他 Agent</Chip>
    </Appear>
    <div style={{marginTop: 30}}>
      {flow.map((n, i) => <React.Fragment key={n.t}>
        {i > 0 && <Arrow p={ramp(f, n.at - 10, n.at + 6)} length={34} />}
        <Appear p={pop(f, n.at)} dy={30}>
          <Panel glow={f >= n.at ? n.c : undefined} style={{display: 'flex', alignItems: 'center', gap: 26, padding: '16px 30px'}}>
            <div style={{width: 74, height: 74, borderRadius: 37, background: `${n.c}26`, border: `3px solid ${n.c}`, color: n.c, fontFamily: font,
              fontSize: 40, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none'}}>{i + 1}</div>
            <div><H size={44}>{n.t}</H><P size={30}>{n.s}</P></div>
          </Panel>
        </Appear>
      </React.Fragment>)}
    </div>
  </div>;
};

/* 03 — official examples */
export const Examples: React.FC<SceneProps> = ({f, cue}) => {
  const pop = usePop();
  const [a, b] = [cue('a', 50), cue('b', 146)];
  const copyT = ramp(f, a + 20, a + 60);
  const typed = '200 + 10%'.slice(0, Math.max(0, Math.floor((f - b - 10) / 3)));
  const showEq = f > b + 70;
  return <div>
    <Appear p={pop(f, 0)}><H size={60}>官方案例，看看它能查什么</H></Appear>
    <Appear p={pop(f, a)} style={{marginTop: 40}}>
      <Panel glow={color.cyan}>
        <Chip c={color.cyan}>案例 · Notion</Chip>
        <H size={44} style={{marginTop: 18}}>复制的内容，怎样进入系统剪贴板？</H>
        <div style={{display: 'flex', alignItems: 'center', gap: 22, marginTop: 28}}>
          <div style={{flex: 1, height: 120, borderRadius: 18, background: '#1b2238', padding: 18}}>
            {[0.9, 0.7, 0.8].map((w, i) => <div key={i} style={{height: 18, width: `${w * 100}%`, borderRadius: 9, marginBottom: 12, background: i === 1 ? `${color.cyan}aa` : '#39446a'}} />)}
          </div>
          <div style={{width: 160, position: 'relative', height: 40}}>
            <div style={{position: 'absolute', left: copyT * 120, top: 0, width: 40, height: 40, borderRadius: 10, background: color.cyan, opacity: 1 - Math.abs(copyT - 0.5) * 0.8}} />
            <div style={{position: 'absolute', top: 18, left: 0, right: 0, height: 4, background: '#39446a'}} />
          </div>
          <div style={{width: 170, height: 120, borderRadius: 18, border: `3px dashed ${color.cyan}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font, fontSize: 30, color: color.cyan}}>剪贴板</div>
        </div>
      </Panel>
    </Appear>
    <Appear p={pop(f, b)} style={{marginTop: 34}}>
      <Panel glow={color.amber}>
        <Chip c={color.amber}>案例 · Windows 计算器</Chip>
        <H size={44} style={{marginTop: 18}}>百分号按钮的计算规则</H>
        <div style={{marginTop: 24, borderRadius: 18, background: '#0d1220', padding: '26px 34px', textAlign: 'right'}}>
          <div style={{fontFamily: mono, fontSize: 44, color: color.dim, minHeight: 56}}>{typed}</div>
          <div style={{fontFamily: mono, fontSize: 100, fontWeight: 800, color: showEq ? color.amber : color.text}}>{showEq ? '= 220' : '0'}</div>
        </div>
        <P size={30} style={{marginTop: 14}}>10% 先按 200 的一成算成 20，再相加</P>
      </Panel>
    </Appear>
  </div>;
};

/* 04 — today's practice */
export const Task: React.FC<SceneProps> = ({f, cue}) => {
  const pop = usePop();
  const [a, b] = [cue('a', 74), cue('b', 126)];
  const slider = 6 + Math.sin(Math.max(0, f - b) / 14) * 5;
  return <div>
    <Appear p={pop(f, 0)}><Chip c={color.green}>今日练手</Chip></Appear>
    <Appear p={pop(f, 4)} style={{marginTop: 18}}><H size={72}>恐龙跑酷小游戏</H></Appear>
    <Appear p={pop(f, 10)} style={{marginTop: 36}}>
      <Window url="原版恐龙游戏" bodyStyle={{padding: 0}}>
        <DinoGame f={f} speedAt={(i) => Math.min(13, 6 + i * 0.03)} width={876} height={330} />
      </Window>
    </Appear>
    <Appear p={pop(f, a)} style={{marginTop: 40}}>
      <Panel glow={color.amber} style={{display: 'flex', alignItems: 'center', gap: 24}}>
        <div style={{width: 74, height: 74, borderRadius: 37, background: color.amber, color: '#0a0e1a', fontFamily: font, fontSize: 52, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>?</div>
        <H size={48}>它为什么越跑越快？</H>
      </Panel>
    </Appear>
    <Appear p={pop(f, b)} style={{marginTop: 28}}>
      <Panel glow={color.cyan}>
        <H size={44} style={{marginBottom: 22}}>做一个能调速度的自己的版本</H>
        <Slider value={slider} min={2} max={18} label="速度" width={460} />
      </Panel>
    </Appear>
  </div>;
};

/* 05 — who does what */
export const Roles: React.FC<SceneProps> = ({f, cue}) => {
  const pop = usePop();
  const roles = [
    {at: cue('a', 44), who: '你', job: '提问题 · 试玩结果', c: color.amber, icon: '你'},
    {at: cue('b', 95), who: 'Codex', job: '解释规则 · 写新游戏', c: color.violet, icon: 'C'},
    {at: cue('c', 164), who: 'REA', job: '读取游戏背后的程序', c: color.cyan, icon: 'R'},
    {at: cue('d', 230), who: 'Chrome', job: '把原游戏跑起来', c: color.green, icon: 'G'},
  ];
  return <div>
    <Appear p={pop(f, 0)}><H size={64}>先认清分工</H></Appear>
    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 26, marginTop: 50}}>
      {roles.map((r) => <Appear key={r.who} p={pop(f, r.at)} scale>
        <Panel glow={r.c} style={{height: 330, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>
          <div style={{width: 120, height: 120, borderRadius: 60, background: `${r.c}2a`, border: `4px solid ${r.c}`, color: r.c,
            fontFamily: font, fontSize: 56, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{r.icon}</div>
          <H size={52} style={{marginTop: 22}}>{r.who}</H>
          <P size={32} style={{marginTop: 8}}>{r.job}</P>
        </Panel>
      </Appear>)}
    </div>
    <Appear p={pop(f, roles[3].at + 30)} style={{marginTop: 40, textAlign: 'center'}}>
      <P size={34} c={color.text}>你 → <span style={{color: color.violet}}>Codex</span> → <span style={{color: color.cyan}}>REA</span> → <span style={{color: color.green}}>Chrome</span></P>
    </Appear>
  </div>;
};

/* 06 — the five steps */
export const STEPS = [
  {t: '玩一局', s: '看原版，再看最终效果'},
  {t: '接工具', s: '接入 REA + 调试版 Chrome'},
  {t: '问规则', s: '为什么越跑越快？'},
  {t: '做新版', s: '带速度滑块的网页游戏'},
  {t: '做核对', s: '让 Codex 验算加速规则'},
];
export const Roadmap: React.FC<SceneProps> = ({f, cue}) => {
  const pop = usePop();
  const at = [cue('a', 42), cue('b', 68), cue('c', 94), cue('d', 123), cue('e', 149)];
  const fin = cue('f', 178);
  return <div>
    <Appear p={pop(f, 0)}><H size={64}>整个流程，就 5 步</H></Appear>
    <div style={{marginTop: 40, position: 'relative'}}>
      <div style={{position: 'absolute', left: 48, top: 40, width: 4, height: ramp(f, at[0], at[4]) * 560, background: `linear-gradient(${color.cyan}, ${color.violet})`}} />
      {STEPS.map((s, i) => <Appear key={s.t} p={pop(f, at[i])} dy={0} style={{display: 'flex', alignItems: 'center', gap: 30, marginBottom: 34,
        transform: `translateX(${(1 - pop(f, at[i])) * -60}px)`}}>
        <div style={{width: 100, height: 100, borderRadius: 50, background: `linear-gradient(135deg, ${color.cyan}, ${color.violet})`, color: '#0a0e1a',
          fontFamily: font, fontSize: 52, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none', zIndex: 1}}>{i + 1}</div>
        <div><H size={52}>{s.t}</H><P size={32}>{s.s}</P></div>
      </Appear>)}
    </div>
    <Appear p={pop(f, fin)} style={{display: 'flex', gap: 18, marginTop: 10}}>
      <Chip c={color.green}>全程不手写代码</Chip><Chip c={color.amber}>命令以 Mac 为例</Chip>
    </Appear>
  </div>;
};

/* 07 — step 1 */
export const Step1: React.FC<SceneProps> = ({f, cue}) => {
  const pop = usePop();
  const [a, b, c] = [cue('a', 65), cue('b', 168), cue('c', 244)];
  const press = [a + 20, a + 50, a + 80].some((t) => f >= t && f < t + 8);
  const lab = pop(f, c);
  const labSpeed = 6 + Math.max(0, f - c - 30) * 0.02;
  return <div>
    <StepTitle n={1} title="先玩一局" p={pop(f, 0)} />
    <Appear p={pop(f, 8)}>
      <Window url="wayou.github.io/t-rex-runner" bodyStyle={{padding: 0}}>
        <DinoGame f={f} speedAt={(i) => Math.min(13, 6 + Math.max(0, i - a) * 0.025)} startAt={a} width={876} height={300} />
      </Window>
    </Appear>
    <div style={{display: 'flex', alignItems: 'center', gap: 24, marginTop: 26, height: 100}}>
      <Appear p={pop(f, a)} style={{display: 'flex', alignItems: 'center', gap: 20}}><Key label="空格 Space" w={260} down={press} /><P size={32}>开始 / 起跳</P></Appear>
      <Appear p={pop(f, b)} style={{marginLeft: 'auto'}}><Chip c={color.amber}>越来越快？</Chip></Appear>
    </div>
    <div style={{opacity: lab, transform: `translateY(${(1 - lab) * 120}px)`, marginTop: 20}}>
      <Window url="rea.tools/examples/dino-lab  ·  官方恐龙实验室">
        <div style={{display: 'flex', gap: 16}}>
          {['Play', 'Jump ↑', 'Restart'].map((t) => <div key={t} style={{padding: '12px 28px', borderRadius: 14, background: '#262f4d', color: color.text, fontFamily: mono, fontSize: 30}}>{t}</div>)}
        </div>
        <div style={{marginTop: 26}}><Slider value={Math.min(13, labSpeed)} min={2} max={18} label="Speed" width={480} /></div>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 24}}>
          <Check p={ramp(f, c + 30, c + 45)} size={40} c={color.cyan} />
          <span style={{fontFamily: mono, fontSize: 26, color: color.text}}>Use the recovered acceleration rule</span>
        </div>
        <P size={28} style={{marginTop: 8}}>勾选 = 使用原游戏的加速规则；拖滑块 = 固定速度</P>
      </Window>
    </div>
  </div>;
};

/* 08 — step 2: connect REA to Codex */
export const Step2Setup: React.FC<SceneProps> = ({f, cue}) => {
  const pop = usePop();
  const [a, b, c, d] = [cue('a', 63), cue('b', 201), cue('c', 324), cue('d', 407)];
  return <div>
    <StepTitle n={2} title="接好工具" p={pop(f, 0)} />
    <Appear p={pop(f, a - 6)}>
      <Terminal f={f} fontSize={27} lines={[
        {at: a, kind: 'cmd', text: 'node --version'},
        {at: a + 14, kind: 'out', text: 'v24.11.0      ← 需 24 系列，且 ≥ 24.11'},
        {at: a + 26, kind: 'cmd', text: 'npm --version'},
        {at: a + 38, kind: 'out', text: '11.x.x        ← 显示版本号即可'},
        {at: b, kind: 'cmd', text: 'npx -y rea-agents@6.4.0 setup --client codex --dry-run --json', speed: 3, highlight: '--dry-run'},
        {at: b + 34, kind: 'note', text: '# 预览接入计划（MCP 工具 + Skill 说明），不改配置'},
        {at: c, kind: 'cmd', text: 'npx -y rea-agents@6.4.0 setup --client codex --yes --json', speed: 3, highlight: '--yes'},
        {at: c + 30, kind: 'ok', text: '… ready ✓   接入完成'},
      ]} />
    </Appear>
    <Appear p={pop(f, d)} style={{marginTop: 30}}>
      <Panel glow={color.violet} style={{display: 'flex', alignItems: 'center', gap: 22}}>
        <Key label="⌘" down={f > d + 14 && f < d + 26} w={90} /><span style={{fontFamily: font, fontSize: 40, color: color.text}}>+</span>
        <Key label="Q" down={f > d + 14 && f < d + 26} w={90} />
        <div style={{marginLeft: 10}}><H size={40}>退出并重开 Codex</H><P size={28}>让它加载新接入的 REA 工具</P></div>
      </Panel>
    </Appear>
  </div>;
};

/* 09 — step 2: debug Chrome */
export const Step2Chrome: React.FC<SceneProps> = ({f, cue}) => {
  const pop = usePop();
  const [a, b] = [cue('a', 125), cue('b', 238)];
  return <div>
    <StepTitle n={2} title="启动调试版 Chrome" p={pop(f, 0)} />
    <Appear p={pop(f, 6)}>
      <Terminal f={f} fontSize={24} lines={[
        {at: 12, kind: 'cmd', speed: 6, text: 'REA_BROWSER_DIR=$(mktemp -d /tmp/rea-dino-browser.XXXXXX)'},
        {at: 24, kind: 'cmd', speed: 7, text: '"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \\\n  --remote-debugging-address=127.0.0.1 \\\n  --remote-debugging-port=9222 \\\n  --user-data-dir="$REA_BROWSER_DIR" \\\n  --no-first-run --no-default-browser-check \\\n  "https://wayou.github.io/t-rex-runner/"', highlight: '--remote-debugging-port=9222'},
      ]} />
    </Appear>
    <Appear p={pop(f, a)} style={{marginTop: 22}}><P size={30}>完整命令见置顶评论 · 弹出一个独立的新 Chrome 窗口，里面就是恐龙游戏</P></Appear>
    <Appear p={pop(f, b)} scale style={{marginTop: 30}}>
      <Panel glow={color.amber} style={{textAlign: 'center'}}>
        <P size={30}>调试地址（第 3 步要用）</P>
        <div style={{fontFamily: mono, fontSize: 64, fontWeight: 800, color: color.amber, marginTop: 8}}>http://127.0.0.1:9222</div>
        <div style={{display: 'flex', justifyContent: 'center', gap: 18, marginTop: 18}}>
          <Chip c={color.cyan}>127.0.0.1 = 你的电脑</Chip><Chip c={color.violet}>9222 = 调试端口</Chip>
        </div>
      </Panel>
    </Appear>
  </div>;
};

/* 10 — step 3: ask */
export const Step3Ask: React.FC<SceneProps> = ({f, cue}) => {
  const pop = usePop();
  const [a, b] = [cue('a', 83), cue('b', 267)];
  const prompt = '用 REA 调查这个恐龙游戏：\nhttps://wayou.github.io/t-rex-runner/\n浏览器调试地址：http://127.0.0.1:9222\n\n先找到页面，读取它加载的 index.js，再用不懂编程也能听懂的话讲清加速规则，并标出代码出处。先别写新游戏。';
  return <div>
    <StepTitle n={3} title="问清规则" p={pop(f, 0)} />
    <Appear p={pop(f, 6)}>
      <Window title="Codex · rea-dino-practice">
        <ChatPrompt f={f} at={10} text={prompt} cps={2.4} fontSize={30} />
        <ToolCall p={pop(f, a + 40)} name="list_browser_targets" detail="找到游戏页面" />
        <ToolCall p={pop(f, a + 90)} name="inspect_web_page" detail="include_script_sources" />
        <ToolCall p={pop(f, a + 140)} name="index.js" detail="读取游戏程序" />
      </Window>
    </Appear>
    <Appear p={pop(f, b)} style={{display: 'flex', gap: 16, marginTop: 30, justifyContent: 'center'}}>
      {['从多快开始？', '怎么加速？', '何时停止？'].map((q, i) => <Appear key={q} p={pop(f, b + i * 12)} dy={14}><Chip c={color.amber} style={{fontSize: 34}}>{q}</Chip></Appear>)}
    </Appear>
  </div>;
};

/* 11 — step 3: answer */
export const Step3Answer: React.FC<SceneProps> = ({f, cue}) => {
  const pop = usePop();
  const [a, b, c, d] = [cue('a', 49), cue('b', 84), cue('c', 175), cue('d', 274)];
  const facts = [
    {at: a, k: '初始速度', v: '6', code: 'SPEED: 6', c: color.cyan},
    {at: b, k: '每次无碰撞更新', v: '+0.001', code: 'ACCELERATION: 0.001', c: color.violet},
    {at: c, k: '加之前先判断', v: '< 13', code: 'MAX_SPEED: 13', c: color.amber},
  ];
  return <div>
    <StepTitle n={3} title="规则查到了" p={pop(f, 0)} />
    {facts.map((x) => <Appear key={x.k} p={pop(f, x.at)} style={{marginBottom: 20}}>
      <Panel glow={x.c} style={{display: 'flex', alignItems: 'center', padding: '22px 30px'}}>
        <div><P size={32} c={color.text}>{x.k}</P><div style={{fontFamily: mono, fontSize: 26, color: color.dim}}>{x.code}</div></div>
        <div style={{marginLeft: 'auto', fontFamily: mono, fontSize: 76, fontWeight: 800, color: x.c}}>{x.v}</div>
      </Panel>
    </Appear>)}
    <Appear p={pop(f, d)} style={{marginTop: 14}}>
      <Code header="index.js · 第 566–571 行（出处）" fontSize={25} lines={[
        {text: 'if (!collision) {'},
        {text: '  …'},
        {text: '  if (this.currentSpeed < this.config.MAX_SPEED) {', hl: color.amber},
        {text: '    this.currentSpeed += this.config.ACCELERATION;', hl: color.violet},
        {text: '  }'},
        {text: '}'},
      ]} />
      <P size={22} style={{marginTop: 10}}>源码：wayou/t-rex-runner（Chromium Authors · BSD 许可）</P>
    </Appear>
  </div>;
};

/* 12 — step 4: build */
export const Step4Build: React.FC<SceneProps> = ({f, cue}) => {
  const pop = usePop();
  const [a, b, c] = [cue('a', 123), cue('b', 181), cue('c', 299)];
  const prompt = '按刚才查到的规则，在练习文件夹里做一个 dino-demo.html：单个文件、浏览器直接打开。要有“开始 / 跳跃 / 重开”按钮，空格也能跳；2–18 的速度滑块；“自动加速”从 6 开始，速度 < 13 时每次 +0.001。';
  return <div>
    <StepTitle n={4} title="做自己的版本" p={pop(f, 0)} />
    <Appear p={pop(f, 6)}>
      <Window title="Codex · 同一个对话">
        <ChatPrompt f={f} at={10} text={prompt} cps={2.2} fontSize={30} />
      </Window>
    </Appear>
    <div style={{display: 'flex', gap: 26, marginTop: 30, alignItems: 'stretch'}}>
      <Appear p={pop(f, a)} scale>
        <Panel glow={color.cyan} style={{width: 300, height: 300, padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
          <svg width={110} height={130} viewBox="0 0 110 130"><path d="M8 8 H72 L102 38 V122 H8 Z" fill="#1b2238" stroke={color.cyan} strokeWidth={5} strokeLinejoin="round" /><path d="M72 8 V38 H102" fill="none" stroke={color.cyan} strokeWidth={5} /><text x={55} y={92} textAnchor="middle" fontFamily={mono} fontSize={22} fill={color.cyan}>HTML</text></svg>
          <div style={{fontFamily: mono, fontSize: 25, color: color.text, marginTop: 14, whiteSpace: 'nowrap'}}>dino-demo.html</div>
          <P size={24}>单文件 · 双击即开</P>
        </Panel>
      </Appear>
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 18}}>
        <Appear p={pop(f, b)} style={{display: 'flex', gap: 12, flexWrap: 'wrap'}}>
          {['开始', '跳跃', '重开', '空格跳'].map((t, i) => <Appear key={t} p={pop(f, b + i * 6)} dy={12}><Chip c={color.violet}>{t}</Chip></Appear>)}
        </Appear>
        <Appear p={pop(f, b + 40)}><Panel style={{padding: 22}}><Slider value={2 + ramp(f, b + 50, c) * 16} min={2} max={18} label="速度" width={200} /></Panel></Appear>
        <Appear p={pop(f, c)}><Panel glow={color.green} style={{padding: 22}}><Toggle on={ramp(f, c + 14, c + 24)} label="自动加速（原规则）" /></Panel></Appear>
      </div>
    </div>
  </div>;
};

/* 13 — step 4: play test */
export const Step4Play: React.FC<SceneProps> = ({f, cue}) => {
  const pop = usePop();
  const [a, b, c, d, e] = [cue('a', 83), cue('b', 107), cue('c', 134), cue('d', 164), cue('e', 200)];
  const crashAt = d - 6;
  const restartAt = d + 16;
  const speedAt = (i: number) => (i >= restartAt ? 6 : i < c ? 6 : 3 + ramp(i, c, c + 26) * 9);
  const sliderValue = f >= restartAt ? 6 : f < c ? 6 : 3 + ramp(f, c, c + 26) * 9;
  const checks = [{at: a, t: '点“开始”，仙人掌动起来'}, {at: b, t: '按空格，恐龙起跳'}, {at: c, t: '滑块 3 → 12，明显变快'}, {at: d, t: '撞上后点“重开”，能再玩'}];
  const btn = (t: string, on: boolean) => <div style={{padding: '10px 26px', borderRadius: 14, background: on ? color.cyan : '#262f4d', color: on ? '#0a0e1a' : color.text, fontFamily: font, fontSize: 30, fontWeight: 700}}>{t}</div>;
  return <div>
    <StepTitle n={4} title="打开试玩" p={pop(f, 0)} />
    <Appear p={pop(f, 6)}>
      <Window url="file:///…/rea-dino-practice/dino-demo.html" bodyStyle={{padding: 20}}>
        <DinoGame f={f} speedAt={speedAt} startAt={a} crashAt={crashAt} restartAt={restartAt} jumpAt={b} width={832} height={270} />
        <div style={{display: 'flex', gap: 14, marginTop: 18}}>
          {btn('开始', f >= a && f < a + 10)}{btn('跳跃', f >= b && f < b + 10)}{btn('重开', f >= restartAt - 6 && f < restartAt + 4)}
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 24, marginTop: 18}}>
          <Slider value={sliderValue} min={2} max={18} label="速度" width={300} />
          <Toggle on={0} label="自动加速" />
        </div>
      </Window>
    </Appear>
    <div style={{marginTop: 24}}>
      {checks.map((x) => <Appear key={x.t} p={pop(f, x.at)} dy={14} style={{display: 'flex', alignItems: 'center', gap: 18, marginBottom: 12}}>
        <Check p={ramp(f, x.at + 4, x.at + 16)} size={44} /><P size={34} c={color.text}>{x.t}</P>
      </Appear>)}
    </div>
    <Appear p={pop(f, e, 10)} scale style={{position: 'absolute', right: 0, top: 0}}>
      <Chip c={color.green} style={{fontSize: 40, padding: '12px 30px'}}>第一版完成</Chip>
    </Appear>
  </div>;
};

/* 14 — step 5: verification table */
const advance = (n: number) => {
  let s = 6;
  for (let i = 0; i < n; i++) if (s < 13) s += 0.001;
  return s;
};
export const Step5Check: React.FC<SceneProps> = ({f, cue}) => {
  const pop = usePop();
  const [a, b, c, d, e] = [cue('a', 94), cue('b', 239), cue('c', 286), cue('d', 302), cue('e', 321)];
  const rows = [{n: 0, at: b}, {n: 1000, at: c}, {n: 4000, at: d}, {n: 10000, at: e}];
  const prompt = '检查 dino-demo.html 实际用的加速函数：从 6 开始，跑 0 / 1000 / 4000 / 10000 次更新，保留三位小数，和参考值逐项对比，列成表格。';
  const chartW = 820;
  const chartH = 130;
  const pts = Array.from({length: 41}, (_, i) => i * 250).map((n) => [n / 10000 * chartW, chartH - (advance(n) - 5) / 9 * chartH]);
  const drawn = ramp(f, a, b + 40);
  return <div>
    <StepTitle n={5} title="核对有没有算对" p={pop(f, 0)} />
    <Appear p={pop(f, 6)}>
      <Window title="Codex · 同一个对话" bodyStyle={{padding: 22}}><ChatPrompt f={f} at={10} text={prompt} cps={2.4} fontSize={29} /></Window>
    </Appear>
    <Appear p={pop(f, a)} style={{marginTop: 24}}>
      <Panel style={{padding: '18px 30px'}}>
        <div style={{display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 0.5fr', fontFamily: font, fontSize: 30, color: color.dim, paddingBottom: 10, borderBottom: '2px solid #2a3352'}}>
          <span>更新次数</span><span>参考值</span><span>你的版本</span><span />
        </div>
        {rows.map((r) => {
          const v = advance(r.n).toFixed(3);
          const shown = f >= r.at;
          return <div key={r.n} style={{display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 0.5fr', alignItems: 'center', fontFamily: mono, fontSize: 38, padding: '4px 0',
            color: color.text, background: shown && f < r.at + 20 ? `${color.green}14` : undefined}}>
            <span>{r.n.toLocaleString('en-US')}</span><span style={{color: color.dim}}>{v}</span>
            <span style={{color: r.n === 10000 ? color.amber : color.green, opacity: shown ? 1 : 0}}>{v}</span>
            <span>{shown && <Check p={ramp(f, r.at, r.at + 12)} size={42} />}</span>
          </div>;
        })}
      </Panel>
    </Appear>
    <Appear p={pop(f, a + 20)} style={{marginTop: 22}}>
      <svg width={chartW + 60} height={chartH + 50} style={{overflow: 'visible'}}>
        <g transform="translate(50,10)">
          <line x1={0} y1={chartH - (13 - 5) / 9 * chartH} x2={chartW} y2={chartH - (13 - 5) / 9 * chartH} stroke={color.red} strokeDasharray="8 8" strokeWidth={2} />
          <text x={chartW} y={chartH - (13 - 5) / 9 * chartH - 10} textAnchor="end" fontFamily={font} fontSize={24} fill={color.red}>上限判断 13</text>
          <polyline points={pts.slice(0, Math.max(2, Math.ceil(drawn * pts.length))).map((p) => p.join(',')).join(' ')} fill="none" stroke={color.cyan} strokeWidth={5} strokeLinejoin="round" />
          <line x1={0} y1={chartH} x2={chartW} y2={chartH} stroke="#4b5680" strokeWidth={2} />
          <text x={0} y={chartH + 34} fontFamily={mono} fontSize={22} fill={color.dim}>0</text>
          <text x={chartW} y={chartH + 34} textAnchor="end" fontFamily={mono} fontSize={22} fill={color.dim}>10,000 次更新</text>
          <text x={-12} y={chartH - (6 - 5) / 9 * chartH + 8} textAnchor="end" fontFamily={mono} fontSize={22} fill={color.dim}>6</text>
        </g>
      </svg>
    </Appear>
  </div>;
};

/* 15 — step 5: why 13.001 */
export const Step5Why: React.FC<SceneProps> = ({f, cue}) => {
  const pop = usePop();
  const [a, b, c] = [cue('a', 85), cue('b', 165), cue('c', 225)];
  const pos = interpolate(f, [c, c + 30], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const x = (v: number) => 60 + (v - 12.997) / 0.005 * 700;
  const value = pos < 0.5 ? '12.999999999997897' : '13.000999999997896';
  return <div>
    <Appear p={pop(f, 0)}><H size={64}>为什么最后是 <span style={{color: color.amber}}>13.001</span>？</H></Appear>
    <div style={{display: 'flex', gap: 22, marginTop: 40}}>
      <Appear p={pop(f, a)} style={{flex: 1}}><Panel glow={color.amber}><H size={40} c={color.amber}>① 先判断</H><P size={30} c={color.text} style={{marginTop: 10, fontFamily: mono}}>speed &lt; 13 ?</P></Panel></Appear>
      <Appear p={pop(f, a + 26)} style={{flex: 1}}><Panel glow={color.violet}><H size={40} c={color.violet}>② 后相加</H><P size={30} c={color.text} style={{marginTop: 10, fontFamily: mono}}>speed += 0.001</P></Panel></Appear>
    </div>
    <Appear p={pop(f, b)} style={{marginTop: 30}}>
      <Panel>
        <H size={38}>小数计算有微小误差</H>
        <P size={30} style={{marginTop: 10}}>第 7000 次更新后，速度并不是整整的 13：</P>
        <div style={{fontFamily: mono, fontSize: 44, color: color.cyan, marginTop: 12}}>12.999999999997897</div>
        <P size={30} style={{marginTop: 6}}>仍然 &lt; 13，于是又加了一次 0.001</P>
      </Panel>
    </Appear>
    <Appear p={pop(f, c - 10)} style={{marginTop: 30}}>
      <svg width={880} height={220}>
        <line x1={40} y1={120} x2={840} y2={120} stroke="#4b5680" strokeWidth={4} />
        {[12.997, 12.998, 12.999, 13, 13.001, 13.002].map((v) => <g key={v}>
          <line x1={x(v)} y1={106} x2={x(v)} y2={134} stroke={v === 13 ? color.red : '#4b5680'} strokeWidth={v === 13 ? 5 : 3} />
          <text x={x(v)} y={172} textAnchor="middle" fontFamily={mono} fontSize={24} fill={v === 13 ? color.red : color.dim}>{v.toFixed(3)}</text>
        </g>)}
        <circle cx={interpolate(pos, [0, 1], [x(12.999999999997897), x(13.000999999997896)])} cy={120} r={20} fill={pos > 0.5 ? color.amber : color.cyan} />
        <text x={440} y={60} textAnchor="middle" fontFamily={mono} fontSize={36} fontWeight={800} fill={pos > 0.5 ? color.amber : color.cyan}>{value}</text>
      </svg>
      <P size={32} c={color.text} style={{textAlign: 'center'}}>保留三位小数 → <b style={{color: color.amber}}>13.001</b>，之后不再加速</P>
    </Appear>
  </div>;
};

/* 16 — troubleshooting */
export const Tips: React.FC<SceneProps> = ({f, cue}) => {
  const pop = usePop();
  const [a, b, c] = [cue('a', 42), cue('b', 150), cue('c', 235)];
  const fixes = [
    ['command not found', '装好 Node.js，重开终端'],
    ['9222 端口被占用', '让 Codex 换个端口再试'],
    ['找不到 REA 工具', '退出并重开 Codex，再查接入配置'],
    ['连不上游戏页面', '确认调试版 Chrome 还开着'],
  ];
  return <div>
    <Appear p={pop(f, 0)}><H size={64}>卡住了？这样问 Codex</H></Appear>
    <Appear p={pop(f, a)} style={{marginTop: 34}}>
      <Panel glow={color.violet}>
        <H size={36} c={color.violet}>发给 Codex 时带上 3 样东西</H>
        {['刚才做到哪一步', '在终端还是浏览器里', '报错原文，直接粘贴'].map((t, i) => <P key={t} size={32} c={color.text} style={{marginTop: 8}}>{i + 1}. {t}</P>)}
        <Appear p={pop(f, b)} dy={10}><P size={32} c={color.cyan} style={{marginTop: 14}}>→ 让它说原因、给下一步，并说明在哪个窗口操作</P></Appear>
      </Panel>
    </Appear>
    <div style={{marginTop: 30}}>
      {fixes.map(([k, v], i) => <Appear key={k} p={pop(f, c + i * 8)} dy={16} style={{display: 'flex', alignItems: 'center', gap: 18, marginBottom: 16,
        background: '#121a2e', borderRadius: 18, padding: '16px 22px', border: `2px solid ${i === 1 ? color.amber : color.panelBorder}`}}>
        <span style={{fontFamily: mono, fontSize: 28, color: color.amber, width: 330, flex: 'none'}}>{k}</span>
        <span style={{fontFamily: font, fontSize: 30, color: color.text}}>{v}</span>
      </Appear>)}
    </div>
  </div>;
};

/* 17 — outro */
export const Outro: React.FC<SceneProps & {credit: string}> = ({f, cue, credit}) => {
  const pop = usePop();
  const [a, b] = [cue('a', 53), cue('b', 210)];
  const pressed = f > a + 40 && f < a + 56;
  return <div style={{textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
    <Appear p={pop(f, 0)}><Dino size={210} run={f} /></Appear>
    <Appear p={pop(f, a)} style={{marginTop: 10}}>
      <div style={{display: 'inline-block', padding: '26px 70px', borderRadius: 26, background: `linear-gradient(135deg, ${color.cyan}, ${color.violet})`,
        color: '#0a0e1a', fontFamily: font, fontSize: 52, fontWeight: 900, boxShadow: pressed ? '0 2px 0 #12182a' : '0 12px 0 #12182a',
        transform: `translateY(${pressed ? 10 : 0}px)`}}>任意一个按钮</div>
    </Appear>
    <Appear p={pop(f, a + 50)} style={{marginTop: 40}}><H size={58}>按下它，背后到底发生了什么？</H></Appear>
    <Appear p={pop(f, a + 80)} style={{display: 'flex', gap: 16, marginTop: 34, justifyContent: 'center'}}>
      <Chip c={color.cyan}>rea.tools</Chip><Chip c={color.violet}>github.com/morluto/rea</Chip>
    </Appear>
    <Appear p={pop(f, b)} style={{display: 'flex', gap: 30, marginTop: 50, justifyContent: 'center'}}>
      {[['♥', '点赞', color.pink], ['★', '收藏', color.amber], ['+', '关注', color.cyan]].map(([i, t, c]) => <div key={t} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8}}>
        <div style={{width: 110, height: 110, borderRadius: 55, background: `${c}26`, border: `3px solid ${c}`, color: c, fontSize: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font}}>{i}</div>
        <P size={30} c={color.text}>{t}</P>
      </div>)}
    </Appear>
    <Appear p={pop(f, b + 20)} style={{marginTop: 40}}><P size={24}>{credit}</P></Appear>
  </div>;
};

export const reaQuickstartScenes: Record<string, React.FC<SceneProps & {credit: string}>> = {
  hook: Hook, what: What, examples: Examples, task: Task, roles: Roles, roadmap: Roadmap, step1: Step1,
  step2Setup: Step2Setup, step2Chrome: Step2Chrome, step3Ask: Step3Ask, step3Answer: Step3Answer, step4Build: Step4Build,
  step4Play: Step4Play, step5Check: Step5Check, step5Why: Step5Why, tips: Tips, outro: Outro,
};
