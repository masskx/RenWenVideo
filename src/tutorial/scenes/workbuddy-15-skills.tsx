import React from 'react';
import {color, font, mono} from '../theme';
import {Appear, Arrow, ChatPrompt, Check, Chip, CueGlow, Panel, SceneProps, Window, ramp, usePop} from '../ui';
import {Stamp, ease, prog, sway} from '../../fx';

// WorkBuddy 15 skills (程序员小灰, Oct edition). Prompts, numbers and test results come from the article.

const CAT = [
  {name: '写作', c: color.cyan},
  {name: '设计', c: color.violet},
  {name: '职场', c: color.amber},
  {name: '开发', c: color.green},
  {name: '信息', c: color.pink},
];

type Result =
  | {kind: 'stats'; items: {k: string; t: string}[]}
  | {kind: 'checks'; items: string[]}
  | {kind: 'flow'; items: string[]};

type Skill = {no: number; cat: number; name: string; pain: string; prompt: string; repo: string; result: Result; verdict: string};

const SKILLS: Skill[] = [
  {no: 1, cat: 0, name: 'Humanizer-zh', pain: 'AI 写的稿子，一读就是“AI 味”',
    prompt: '/humanizer-zh 请帮我改写 test-article.md 这篇文章，去除里面的 AI 写作痕迹，核心观点保持不变',
    repo: 'op7418/Humanizer-zh',
    result: {kind: 'stats', items: [{k: '24', t: '种 AI 痕迹规则'}, {k: '逐句', t: '改写 · 观点不变'}, {k: '4→0', t: '处破折号滥用'}]}, verdict: '去 AI 味'},
  {no: 2, cat: 0, name: '写作蒸馏器 Writing DNA', pain: '让 AI 模仿文风，总是形似神不似',
    prompt: '/writing-dna-skill 请分析 khazix-articles 文件夹里的所有文章，蒸馏出写作风格，生成完整的 Writing DNA 文档',
    repo: 'larashero3-dotcom/writing-dna-skill',
    result: {kind: 'flow', items: ['约 20 篇文章', '拆出用词 · 句式 · 结构', 'Writing-DNA.md']}, verdict: '复刻文风'},
  {no: 3, cat: 0, name: '中文小说创作', pain: '写到第三章，主角名字都变了',
    prompt: '使用 chinese-novelist 帮我写一部 20 章的都市悬疑小说，先生成大纲和第一章。',
    repo: 'PenglongHuang/chinese-novelist-skill',
    result: {kind: 'checks', items: ['人物 · 伏笔 · 章节摘要存成文件', '每写一章，先回顾再动笔', '支持 10–50 章长篇']}, verdict: '不再失忆'},
  {no: 4, cat: 0, name: '仓颉技能 cangjie', pain: '书看了不少，遇到问题却用不上',
    prompt: '/cangjie-skill 帮我把 zhangxiaolong-speeches 文件夹里的演讲内容蒸馏成可调用的结构化技能包',
    repo: 'kangarooking/cangjie-skill',
    result: {kind: 'stats', items: [{k: '书', t: '演讲 · 播客'}, {k: '23', t: '分钟跑完实测'}, {k: '13', t: '张能力卡'}]}, verdict: '方法论入库'},
  {no: 5, cat: 1, name: 'UI UX Pro Max', pain: '自己做的页面，总有一股“土味”',
    prompt: '/ui-ux-pro-max 给我生成一套「读书笔记 App」的设计系统，包含配色、字体和组件规范。',
    repo: 'nextlevelbuilder/ui-ux-pro-max-skill',
    result: {kind: 'stats', items: [{k: '79', t: '种设计风格'}, {k: '192', t: '套配色方案'}, {k: '74', t: '组字体搭配'}]}, verdict: '设计规范'},
  {no: 6, cat: 1, name: '归藏社交媒体卡片', pain: '一套配图卡片，要做一两个小时',
    prompt: '/guizang-social-card-skill 把 test-article.md 生成 3 张小红书封面图：电子杂志风、瑞士风和暗色 Midnight Ink。',
    repo: 'op7418/guizang-social-card-skill',
    result: {kind: 'checks', items: ['小红书图组 · 公众号封面 · 金句卡', '先 HTML 排版再渲染，不靠生图', '同一篇文章，三套视觉体系']}, verdict: '图卡一键出'},
  {no: 7, cat: 2, name: '面试准备助手', pain: '拿到面试，不知道从哪准备',
    prompt: '帮我做面试准备，我 3 天后要面增长产品经理岗位，简历是 resume.md，岗位 JD 是 jd.md。',
    repo: 'lan1177/interview-prep',
    result: {kind: 'flow', items: ['JD + 简历', '拆解要求 · 找匹配点', '21 道高频题 + 3 天冲刺']}, verdict: '面试冲刺'},
  {no: 8, cat: 2, name: 'PM Skills', pain: '框架知道名字，却不会用',
    prompt: '/create-prd 针对「小区团购小程序」这个产品想法，写一份简版 PRD。',
    repo: 'phuryn/pm-skills',
    result: {kind: 'stats', items: [{k: '68', t: '个产品技能'}, {k: '42', t: '个工作流'}, {k: 'PRD', t: 'OKR · 实验'}]}, verdict: 'PM 工作流'},
  {no: 9, cat: 2, name: 'AI 共读拆书', pain: '自己读坚持不下来，AI 总结又太干',
    prompt: '/human-agent-reading 我的阅读经历在 reading-profile.md 里，帮我生成 100 本跨领域书单，开启长期共读。',
    repo: '563323549-boop/human-agent-reading',
    result: {kind: 'checks', items: ['100 本跨领域书单，分十个章程', '每天陪你拆一本', '表面论点 → 核心机制 → 和你的关系']}, verdict: '百日共读'},
  {no: 10, cat: 2, name: '小红书选品助手', pain: '想做虚拟产品副业，不知道卖什么',
    prompt: '/xhs-product-picker 我的 HR 背景都在 hr-experience.md 里，帮我找一个小红书虚拟产品方向，直接给完整方案。',
    repo: 'chensongyue10-design/xhs-product-picker',
    result: {kind: 'flow', items: ['挖你的经验', '对照真实案例', '方案 + 7 天启动计划']}, verdict: '选品方案'},
  {no: 11, cat: 3, name: 'README 美化', pain: 'README 干巴巴，访客三秒就关',
    prompt: '/beautify-github-readme 帮我美化 demo-cli 的 README，设计一个 SVG 开头横幅，只改视觉和排版。',
    repo: 'oil-oil/beautify-github-readme',
    result: {kind: 'checks', items: ['先核对项目真实代码', '提炼受众和一句话价值', '生成贴合主题的 SVG 横幅']}, verdict: '门面升级'},
  {no: 12, cat: 3, name: 'Waza（Tw93）', pain: 'AI 上来就写代码，返工好几轮',
    prompt: '/think 帮我梳理「给博客加一个评论系统」的开发需求，输出完整可执行的开发计划。',
    repo: 'tw93/Waza',
    result: {kind: 'stats', items: [{k: '8', t: '个子技能'}, {k: '/think', t: '先出开发计划'}, {k: '/hunt', t: '定位 Bug 根因'}]}, verdict: '先想后做'},
  {no: 13, cat: 3, name: '横木 hengmu', pain: 'AI 审代码，只会说正确的废话',
    prompt: '/project-architecture-audit 帮我审计 demo-repo 的整体架构，输出经过验证的风险清单和修复方案。',
    repo: 'qingye-lab/hengmu',
    result: {kind: 'checks', items: ['每个问题都要仓库里的证据', '问题在哪 · 证据是什么', '怎么修 · 先修哪个']}, verdict: '有证据'},
  {no: 14, cat: 4, name: '乔木 SEO', pain: '网站上线了，搜索引擎就是不收录',
    prompt: '/qiaomu-seo 抓取并渲染阮一峰的博客，做一遍完整的 SEO 审计，按影响排序输出问题清单。',
    repo: 'joeseesun/qiaomu-seo',
    result: {kind: 'flow', items: ['渲染网页', '查索引 · 结构 · 代码', '按影响排序的修复清单']}, verdict: '网站体检'},
  {no: 15, cat: 4, name: 'Follow Builders', pain: 'AI 圈信息太多，追不过来',
    prompt: '/follow-builders 把最近一周顶级 AI builder 的观点整理成 5 条可执行的产品启发。',
    repo: 'zarazhangrui/follow-builders',
    result: {kind: 'checks', items: ['盯着二十多位一线 AI 创作者', '播客 · X · 博客 → 一份简报', '可设成每周一自动推送']}, verdict: '信息简报'},
];

const H: React.FC<{size?: number; c?: string; style?: React.CSSProperties; children: React.ReactNode}> = ({size = 56, c = color.text, style, children}) => (
  <div style={{fontFamily: font, fontWeight: 900, fontSize: size, color: c, lineHeight: 1.25, ...style}}>{children}</div>
);
const P: React.FC<{size?: number; c?: string; style?: React.CSSProperties; children: React.ReactNode}> = ({size = 34, c = color.dim, style, children}) => (
  <div style={{fontFamily: font, fontSize: size, color: c, lineHeight: 1.45, ...style}}>{children}</div>
);

/** WorkBuddy-style assistant reply bubble. */
const Reply: React.FC<{p: number; c?: string; children: React.ReactNode}> = ({p, c = color.cyan, children}) => (
  <Appear p={p} dy={16} style={{display: 'flex', gap: 14, alignItems: 'flex-start', marginTop: 18}}>
    <div style={{width: 52, height: 52, borderRadius: 16, flex: 'none', background: `linear-gradient(135deg, ${color.cyan}, ${color.violet})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font, fontWeight: 900, fontSize: 26, color: '#0a0e1a'}}>W</div>
    <div style={{background: '#141c31', border: `2px solid ${c}55`, borderRadius: '8px 26px 26px 26px', padding: '16px 22px',
      fontFamily: font, fontSize: 30, color: color.text, lineHeight: 1.45}}>{children}</div>
  </Appear>
);

const ResultView: React.FC<{f: number; r: Result; at: number[]; c: string}> = ({f, r, at, c}) => {
  const pop = usePop();
  if (r.kind === 'stats') {
    return <div style={{display: 'flex', gap: 18}}>
      {r.items.map((it, i) => {
        const p = pop(f, at[i]);
        const sw = sway(f / 30, i * 1.4, {dy: 3, deg: 0.6});
        return <Appear key={it.t} p={p} scale style={{flex: 1}}>
          <Panel glow={i === r.items.length - 1 ? c : undefined} style={{padding: '40px 12px', textAlign: 'center', transform: `translateY(${sw.dy}px)`}}>
            <div style={{fontFamily: mono, fontWeight: 800, fontSize: it.k.length > 4 ? 54 : 82, color: c, lineHeight: 1.1, whiteSpace: 'nowrap'}}>{it.k}</div>
            <div style={{fontFamily: font, fontSize: 31, color: color.text, marginTop: 14}}>{it.t}</div>
          </Panel>
        </Appear>;
      })}
    </div>;
  }
  if (r.kind === 'checks') {
    return <Panel style={{padding: '34px 30px'}}>
      {r.items.map((t, i) => {
        const p = pop(f, at[i]);
        return <Appear key={t} p={p} dy={16} style={{display: 'flex', alignItems: 'center', gap: 20, marginBottom: i < r.items.length - 1 ? 30 : 0}}>
          <Check p={ramp(f, at[i], at[i] + 12)} size={52} c={c} />
          <span style={{fontFamily: font, fontSize: 37, color: color.text}}>{t}</span>
        </Appear>;
      })}
    </Panel>;
  }
  return <div>
    {r.items.map((t, i) => {
      const p = pop(f, at[i]);
      const last = i === r.items.length - 1;
      return <React.Fragment key={t}>
        {i > 0 && <Arrow p={ramp(f, at[i] - 8, at[i] + 4)} length={46} c={c} />}
        <Appear p={p} scale style={{display: 'flex', justifyContent: 'center'}}>
          <div style={{padding: '16px 38px', borderRadius: 22, fontFamily: font, fontSize: 36, fontWeight: last ? 900 : 700,
            color: last ? '#0a0e1a' : color.text, background: last ? c : `${c}1c`, border: `2px solid ${c}`, whiteSpace: 'nowrap'}}>{t}</div>
        </Appear>
      </React.Fragment>;
    })}
  </div>;
};

const makeSkillScene = (s: Skill): React.FC<SceneProps> => {
  const SkillScene: React.FC<SceneProps> = ({f, dur, cue}) => {
    const pop = usePop();
    const {c, name: catName} = CAT[s.cat];
    const [a, b, cc] = [cue('a', 70), cue('b', 150), cue('c', 230)];
    const typeAt = 14;
    // Spread the closing beats over whatever time is left after the last result, so the tail never sits still.
    const tail = Math.max(60, dur - cc);
    const installAt = Math.min(cc + Math.round(tail * 0.3), dur - 75);
    const stampAt = Math.min(cc + Math.round(tail * 0.62), dur - 40);
    // Main action on cue a: the prompt is "sent" — the chat window slides away into a one-line receipt and the
    // results rise into its space (a large, readable layout change instead of a static hold).
    const promptLines = Math.ceil([...s.prompt].reduce((w, ch) => w + (ch.charCodeAt(0) < 128 ? 17 : 31), 0) / 700);
    const winH = 64 + 48 + promptLines * 46.5 + 46;
    const receiptH = 72;
    const sent = ease.inOutCubic(prog(f, a - 12, 16));
    const command = s.prompt.startsWith('/') ? s.prompt.split(' ')[0] : s.name;
    return <div style={{position: 'relative', isolation: 'isolate'}}>
      <CueGlow f={f} beats={[0, a, b, cc, installAt, stampAt, stampAt + 40]} c={c} />
      <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
        <Appear p={pop(f, 0)} scale>
          <div style={{width: 116, height: 116, borderRadius: 30, background: `linear-gradient(135deg, ${c}, ${color.violet})`, flex: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: mono, fontSize: 52, fontWeight: 900, color: '#0a0e1a'}}>
            {String(s.no).padStart(2, '0')}</div>
        </Appear>
        <Appear p={pop(f, 4)} dy={-20} style={{minWidth: 0}}>
          <Chip c={c} style={{fontSize: 24, padding: '4px 16px'}}>{catName} · {s.no}/15</Chip>
          <H size={s.name.length > 14 ? 50 : 60} style={{marginTop: 8, whiteSpace: 'nowrap'}}>{s.name}</H>
        </Appear>
      </div>
      <Appear p={pop(f, 8)} dy={14}><P size={35} c={color.amber} style={{marginTop: 24}}>痛点：{s.pain}</P></Appear>
      <div style={{position: 'relative', marginTop: 26, height: winH + (receiptH - winH) * sent}}>
        <Appear p={pop(f, 10)} dy={30} style={{position: 'absolute', left: 0, right: 0, top: 0, opacity: 1 - sent, transform: `translateX(${-sent * 160}px) scale(${1 - 0.1 * sent})`}}>
          <Window title="WorkBuddy" bodyStyle={{padding: 24}}>
            <ChatPrompt f={f} at={typeAt} text={s.prompt} cps={2.4} fontSize={31} />
          </Window>
        </Appear>
        {sent > 0 && <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: receiptH, opacity: sent, transform: `translateX(${(1 - sent) * 160}px)`,
          display: 'flex', alignItems: 'center', gap: 16, padding: '0 24px', borderRadius: 20, background: '#121a2e', border: `2px solid ${c}66`}}>
          <Check p={sent} size={42} c={c} />
          <span style={{fontFamily: font, fontSize: 30, color: color.dim, whiteSpace: 'nowrap'}}>WorkBuddy 已执行</span>
          <span style={{fontFamily: mono, fontSize: 30, color: c, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{command}</span>
        </div>}
      </div>
      <div style={{marginTop: 44}}><ResultView f={f} r={s.result} at={[a, b, cc]} c={c} /></div>
      <Appear p={pop(f, installAt)} dy={20} style={{marginTop: 44, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'nowrap'}}>
        <span style={{fontFamily: font, fontSize: 30, color: color.dim, whiteSpace: 'nowrap'}}>安装</span>
        <span style={{fontFamily: mono, fontSize: 28, color: color.text, background: '#121a2e', border: `2px solid ${color.panelBorder}`,
          borderRadius: 14, padding: '8px 16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 560}}>github.com/{s.repo}</span>
      </Appear>
      <div style={{position: 'absolute', right: 10, bottom: 40}}>
        <Stamp t={f / 30} at={stampAt / 30} text={s.verdict} color={c} size={46} deg={-8} font={font} style={{position: 'relative'}} />
      </div>
    </div>;
  };
  return SkillScene;
};

/* hook — 15 skill tiles fly into a grid, grouped by category */
const Hook: React.FC<SceneProps> = ({f, cue}) => {
  const pop = usePop();
  const [a, b, c] = [cue('a', 88), cue('b', 150), cue('c', 239)];
  return <div>
    <Appear p={pop(f, 0)} style={{textAlign: 'center'}}><Chip c={color.cyan}>腾讯 WorkBuddy · 技能市场</Chip></Appear>
    <Appear p={pop(f, 6)} style={{textAlign: 'center', marginTop: 22}}><H size={72}>技能越来越多</H></Appear>
    <Appear p={pop(f, a)} style={{textAlign: 'center'}}><H size={72} c={color.amber}>好用的却难找</H></Appear>
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginTop: 40}}>
      {SKILLS.map((s, i) => {
        const p = pop(f, b + i * 3);
        const {c: col} = CAT[s.cat];
        const lit = f >= c ? 1 : 0.55;
        return <div key={s.no} style={{opacity: Math.min(1, p * 1.4), transform: `translateY(${(1 - p) * 160}px) rotate(${(1 - p) * (i % 2 ? 12 : -12)}deg) scale(${0.6 + 0.4 * p})`}}>
          <div style={{height: 132, borderRadius: 22, background: `${col}${lit === 1 ? '33' : '18'}`, border: `3px solid ${col}${lit === 1 ? '' : '77'}`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{fontFamily: mono, fontSize: 40, fontWeight: 900, color: col}}>{String(s.no).padStart(2, '0')}</div>
            <div style={{fontFamily: font, fontSize: 22, color: color.text, marginTop: 4}}>{CAT[s.cat].name}</div>
          </div>
        </div>;
      })}
    </div>
    <div style={{display: 'flex', justifyContent: 'center', gap: 12, marginTop: 34}}>
      {CAT.map((k, i) => <Appear key={k.name} p={pop(f, c + i * 5)} dy={20}><Chip c={k.c} style={{fontSize: 32}}>{k.name}</Chip></Appear>)}
    </div>
    <div style={{position: 'relative', height: 120, display: 'flex', justifyContent: 'center', marginTop: 20}}>
      <Stamp t={f / 30} at={(c + 26) / 30} text="建议先收藏" color={color.amber} size={54} deg={-6} font={font} style={{position: 'relative'}} />
    </div>
  </div>;
};

/* install — one sentence + a GitHub link, then call it with a slash command */
const Install: React.FC<SceneProps> = ({f, cue}) => {
  const pop = usePop();
  const [a, b, c] = [cue('a', 84), cue('b', 156), cue('c', 220)];
  const menu = ['/humanizer-zh', '/writing-dna-skill', '/cangjie-skill', '/ui-ux-pro-max'];
  return <div style={{position: 'relative', isolation: 'isolate'}}>
    <CueGlow f={f} beats={[0, a, b, b + 30, c, c + 40]} c={color.cyan} />
    <Appear p={pop(f, 0)}><H size={64}>安装：一句话 + 一个地址</H></Appear>
    <Appear p={pop(f, 6)} dy={30} style={{marginTop: 30}}>
      <Window title="WorkBuddy" bodyStyle={{padding: 24}}>
        <ChatPrompt f={f} at={a} text={'帮我安装这个技能：\nhttps://github.com/op7418/Humanizer-zh'} cps={1.6} fontSize={32} />
        <Reply p={pop(f, b + 10)}><span style={{color: color.green}}>✓ 已安装</span> Humanizer-zh，输入 /humanizer-zh 即可调用</Reply>
      </Window>
    </Appear>
    <Appear p={pop(f, c)} dy={30} style={{marginTop: 30}}>
      <Panel style={{padding: '20px 26px'}}>
        <div style={{fontFamily: mono, fontSize: 36, color: color.text}}>
          /<span style={{color: color.cyan}}>{'humanizer'.slice(0, Math.max(0, Math.floor((f - c - 6) / 3)))}</span>
          <span style={{opacity: Math.floor(f / 8) % 2 ? 1 : 0.2}}>▍</span>
        </div>
        {menu.map((m, i) => {
          const p = pop(f, c + 10 + i * 4);
          const active = i === 0 && f >= c + 30;
          return <Appear key={m} p={p} dy={10} style={{marginTop: 12, padding: '10px 16px', borderRadius: 12, fontFamily: mono, fontSize: 30,
            color: active ? '#0a0e1a' : color.dim, background: active ? color.cyan : 'rgba(255,255,255,0.04)'}}>{m}</Appear>;
        })}
      </Panel>
    </Appear>
  </div>;
};

/* summary — the 15 skills grouped by category */
const Summary: React.FC<SceneProps> = ({f, cue}) => {
  const pop = usePop();
  const [a, b, c] = [cue('a', 39), cue('b', 181), cue('c', 245)];
  return <div style={{position: 'relative', isolation: 'isolate'}}>
    <CueGlow f={f} beats={[0, a, a + 36, a + 72, b, c]} c={color.green} />
    <Appear p={pop(f, 0)}><H size={64}>15 个技能汇总</H></Appear>
    <div style={{marginTop: 24}}>
      {CAT.map((k, ci) => {
        const p = pop(f, a + ci * 18);
        return <Appear key={k.name} p={p} dy={24} style={{display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16}}>
          <div style={{width: 96, flex: 'none', textAlign: 'center', padding: '8px 0', borderRadius: 14, background: `${k.c}26`, border: `2px solid ${k.c}`,
            fontFamily: font, fontSize: 30, fontWeight: 800, color: k.c}}>{k.name}</div>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: 10}}>
            {SKILLS.filter((s) => s.cat === ci).map((s) => <span key={s.no} style={{fontFamily: font, fontSize: 27, color: color.text,
              background: '#141c31', border: `1.5px solid ${k.c}66`, borderRadius: 12, padding: '6px 14px', whiteSpace: 'nowrap'}}>{s.name}</span>)}
          </div>
        </Appear>;
      })}
    </div>
    <div style={{position: 'relative', display: 'flex', justifyContent: 'center', height: 110, marginTop: 10}}>
      <Stamp t={f / 30} at={b / 30} text="全部开源 · GitHub" color={color.green} size={50} deg={-5} font={font} style={{position: 'relative'}} />
    </div>
    <Appear p={pop(f, c)} dy={16} style={{textAlign: 'center'}}><P size={32} c={color.text}>复制地址 → 对 WorkBuddy 说“帮我安装这个技能”</P></Appear>
  </div>;
};

/* outro — which one first? */
const Outro: React.FC<SceneProps & {credit: string}> = ({f, cue, credit}) => {
  const pop = usePop();
  const [a, b, c] = [cue('a', 39), cue('b', 101), cue('c', 147)];
  const pick = Math.floor(f / 9) % SKILLS.length;
  return <div>
    <Appear p={pop(f, 0)} style={{textAlign: 'center'}}><H size={68}>这 15 个里</H></Appear>
    <Appear p={pop(f, a)} style={{textAlign: 'center'}}><H size={68} c={color.amber}>你最想先试哪一个？</H></Appear>
    <div style={{display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginTop: 36}}>
      {SKILLS.map((s, i) => {
        const on = i === pick && f >= a;
        const {c: col} = CAT[s.cat];
        return <Appear key={s.no} p={pop(f, 6 + i * 2)} dy={14}>
          <span style={{display: 'inline-block', fontFamily: font, fontSize: 28, padding: '8px 16px', borderRadius: 14, whiteSpace: 'nowrap',
            color: on ? '#0a0e1a' : color.text, background: on ? col : '#141c31', border: `2px solid ${col}${on ? '' : '66'}`,
            transform: `scale(${on ? 1.08 : 1})`}}>{s.name}</span>
        </Appear>;
      })}
    </div>
    <Appear p={pop(f, b)} dy={20} style={{marginTop: 34}}>
      <Reply p={1} c={color.amber}>💬 评论区告诉我，你选第几个</Reply>
    </Appear>
    <Appear p={pop(f, c)} dy={20} style={{display: 'flex', justifyContent: 'center', gap: 16, marginTop: 28}}>
      <Chip c={color.pink} style={{fontSize: 32}}>点赞</Chip><Chip c={color.amber} style={{fontSize: 32}}>收藏</Chip>
    </Appear>
    <Appear p={pop(f, c + 10)} style={{marginTop: 28}}><P size={22} style={{textAlign: 'center'}}>{credit}</P></Appear>
  </div>;
};

export const workbuddySkillsScenes: Record<string, React.FC<SceneProps & {credit: string}>> = {
  'wb.hook': Hook,
  'wb.install': Install,
  ...Object.fromEntries(SKILLS.map((s) => [`wb.s${String(s.no).padStart(2, '0')}`, makeSkillScene(s)])),
  'wb.summary': Summary,
  'wb.outro': Outro,
};
