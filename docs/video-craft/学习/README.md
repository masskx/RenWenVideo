# 学习笔记：8 个“用代码做视频”的仓库 + huashu-motion + Xian 的梵高做片法

> 用户 2026-10-23：“把这些优秀的内容整合进自己的仓库，方便以后参考……现在做视频基本是自欺欺人，几乎没有积累，每次都翻车。”
> 这一页是读完 8 个仓库（[来源帖](../prompt-library/来源帖.md)）后的总结；每个仓库一份笔记，原文和源码都固定在 [prompt-library](../prompt-library/README.md)（`vendor/` 文档、`code/` 引擎和样片源码），以后照着查。做片的流程在 [导演方法.md](../导演方法.md)。

| 笔记 | 仓库 | 一句话 |
|---|---|---|
| [lemo-opuscar.md](lemo-opuscar.md) | lemomo-ai/lemo-opuscar | 59 种风格圣经 + 导演方法（对标、三个结构、镜头表、先证明画面、不要又做成样片）；2026-10-28 补「精修」：剪辑与纪实 / 实证影像 16 种新风格、字幕即画面、包装系统、字体分工、统一调色和颗粒、OPUSCAR 98 提示词的精度 |
| [pdoom-video.md](pdoom-video.md) | mexicat/pdoom-video | 一个统一设定 + 一条变形的母题 + 每句一个视觉双关 + 字是画面的一部分 |
| [PDoomVideo.md](PDoomVideo.md) | JohnHeibel/PDoomVideo | 字要少、每个镜头都有事发生、布景不是卡片、主角占画面 40 % |
| [ClaudeAnimationBase.md](ClaudeAnimationBase.md) | JohnHeibel/ClaudeAnimationBase | 替观众建模的时间（reads）、动画原理在代码里的样子、三档审片 |
| [mg-styles-15.md](mg-styles-15.md) | Vincentwei1021/mg-styles-15 | 风格特征写成可检验的技法、关键帧都要能当海报、独立 AI 评委打分再改一轮；回形针式知识区包装 |
| [案例和提示词合集.md](案例和提示词合集.md) | yihui-dev/awesome-opus5-5-videos、athemeroy/awesome-claude-5-5-videos、joeseesun/opus-video-prompts | 703 条对标片索引、七类制作路径（按素材情况选）、写法经验 |
| [../huashu-motion.md](../huashu-motion.md) | alchaincyf/huashu-motion | 第 0 帧即海报、节奏是对比、贯穿物件、**颜色是找来的不是编的**；文档和代码（引擎、12 个模板）都固定在库里 |
| [xian-梵高做片法.md](xian-梵高做片法.md) | Xian 的长文 + xianxie6/landscape-explainer-video | 一句一画、具体代替抽象、底色就是情绪、一个画面一个主角、高潮多停 2 秒；道具招式库（仓库无许可，只记笔记、零件自己重写） |

参考图：[lemo-知识类风格.jpg](lemo-知识类风格.jpg)（18 种适合知识类的风格 poster，CC BY 4.0 LemoLab）、[mg15-成片抽帧.jpg](mg15-成片抽帧.jpg)（12 支样片各 4 帧，MIT）。

## 它们都同意的事（按对我们片子的影响排）

1. **一支片一个点子，不是一串要点。** 一个主体、一个目标、一个转折（lemo）；一个统一设定（pdoom 的“插图论文”）；“Clawd 想要 ___，但 ___，所以 ___”（cab）。我们以前每支片都是“标题 + 三条要点”。
2. **画面讲故事，字不复述口播。** “牌子复述剧情是经典失败”（cab）；“字多的画面更难看”（PDoomVideo）；“每句词一个视觉双关，从不做字面插图”（pdoom）。我们每个场景都是“大标题 + 面板里的字”，这正是它们说的失败形态。
3. **对标作品比任何规则都管用。** 先为这个题目挑 1–2 部参考作品，写学什么 / 不拿什么（lemo）；“给参考视频比堆形容词有效”（ovp）。我们从没有为某支片挑过对标。
4. **风格要有深度，并且每支片按题材选。** lemo 一份风格圣经有材质、配色逻辑、字体、两条缓动曲线、入场方式、镜头语法表、声音调色板、原生招式菜单、坑。我们的“cinema”只有一个配色 + 一种淡入 + ±5 % 推近，而且每支片都用它——五支片看起来一模一样。
5. **贯穿的物件 / 母题，用“图形匹配”转场串起来。** 火花（pdoom）、徽章变成周期表格子（mg15 回形针）、同一个舞台每次升级（PDoomVideo）。
6. **镜头和景别是有理由的。** 至少四种运镜、真实的景别变化、一个招牌镜头、关键时刻主体 ≥ 画面高度 1/3（lemo）；每个镜头都有运镜（PDoomVideo）。我们的场景是一个固定的 900×1080 框，主体常常只占画面上半部的一小块。
7. **时间按观众算。** 写 reads，一次一件，动作快、意义慢（cab）；上屏字停留 ≈ 字数 ÷ 4.5 + 1.5 s（lemo）。
8. **先证明画面，再做全片。** 3 张风格帧（lemo）、6–10 张能当海报的关键帧（mg15）、5 秒样片（ac55），都用真代码。
9. **声音是一半。** 三层声音、安静、声音转场、每个动作有声音（lemo）；配乐和画面读同一张卡点表（mg15、lemo、pdoom）。
10. **独立评审 + 再改一轮。** 另一个 AI 当评委、严格打分、给带时间码和具体数字的修改（mg15）；三档放大审片（cab）；全速看一遍（lemo）。
11. **媒介按片选。** Canvas 2D、SVG、WebGL / 着色器、three.js、p5.brush、Blender，都是“一个能画任意时刻的网页 + 无头浏览器逐帧截图 + ffmpeg”。本仓库现在两条路都能走：Remotion，或 `scripts/page-render.mjs`。

## 学了 ≠ 用了：每条落在哪里（2026-10-23）

> 用户 2026-10-23：“这 8 个仓库你吸收了吗？”“我给你的内容你要学习、内化，用来改进我们的出片。”
> 上面 11 条以前只写在纸上，做片时没有任何东西逼我照做。现在每一条都落到了**做片必经的地方**：分镜模板的必填项、会判“不过”的检查、能直接用的零件和工具。

| 学到的 | 来源 | 现在落在哪里（做片时绕不过去的地方） |
|---|---|---|
| 一个点子，不是一串要点 | lemo、pdoom、cab | `## 导演`「点子」必填（`brief.mjs` 不过） |
| 对标；三个结构选一个 | lemo、ovp | 「对标」「结构候选」必填；`node scripts/prompts/find.mjs` 查库（含 huashu 的 20 种视觉语言） |
| 风格有深度、按题材选；视觉从题材长出来 | lemo、mg15、Xian | 「风格」必填（写库里哪份 STYLE + 3 条技法）；lemo / mg15 / huashu 的样片源码能直接跑（`page-render.mjs` 认三种约定），huashu 模板一条命令起步（`scripts/huashu-new.mjs`） |
| 贯穿物件 / 母题 | pdoom、huashu、mg15 | 「贯穿物件」必填 |
| 招牌镜头；原生招式 | lemo | 「招牌镜头」必填 |
| 第 0 帧即海报；高潮多停 | huashu、Xian | 「第0帧」「高潮停留」必填 |
| 不要又做成上一支 | lemo | 「和上一支不同」必填（六项至少四项）；`compare.mjs` 并排 |
| 画面讲故事，字不复述口播；字要少 | cab、PDoomVideo、pdoom | `scripts/qa/echo.mjs`：复述超过三分之一判不过，> 3 字/秒提醒（量了旧片：ai-same-take-on-humans 45 %、claude-proactive-agent-cinema 36 % 都不过） |
| 一句一画；具体代替抽象 | Xian、pdoom | `## 镜头表` 一句一行（缺了提醒）；道具零件 `src/tutorial/props.tsx` |
| 颜色是找来的，不是编的；避开 AI 通用样子 | huashu colour.md | 导演方法 §三.4、账号风格「配色」：每支片从素材取色（`scripts/qa/palette.mjs`），写“— 来自：” |
| 底色就是情绪 | Xian、huashu §7 | 「底色」必填；`<Ground a b k>` 在转折处翻底 |
| 时间按观众算（reads） | cab、lemo | 镜头表的 reads 一列 |
| 先证明画面 | lemo、mg15、ac55 | `src/lab/PropsLab.tsx` 风格帧 + `compare.mjs`；第一次校准：[../assets/校准-agent-compute-hijack-前后.jpg](../assets/校准-agent-compute-hijack-前后.jpg) |
| 独立评审 + 再改一轮；三档放大；截帧拼总览 | mg15、cab、Xian | [../评审表.md](../评审表.md) + `scripts/qa/jury.mjs`（评审包：总览、并排、关键帧、手机帧、提示词） |
| 声音是一半 | lemo、mg15、pdoom | 还没有新工具（现有 sfx / 配乐）；导演方法 §三.5 的声音表 |
| 媒介按片选 | 全部 | `page-render.mjs`（mg15 / lemo / huashu 三种约定都能渲，lemo dataviz、mg15 hanazi、huashu kinetic-type 实测能出帧） |
