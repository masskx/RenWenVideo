# 视频手艺（video-craft）

这里收着本项目做竖屏讲解视频的通用规则、动效知识，以及对应的代码和检查工具。两条流水线（长文讲解、操作教程）共用这一套。

**每次必读：[quick-reference.md](quick-reference.md)（速查页）、[导演方法.md](导演方法.md)（怎么把片子做好）、[经验.md](经验.md)（用户原话和做过的片）**，和根目录 `CLAUDE.md`。其余文档按需要查，和速查页冲突时以速查页为准。

| 文档 | 管什么（可选参考） |
| --- | --- |
| [quick-reference.md](quick-reference.md) | **必读**：观众 / 题材 / 平台、优先级、时长、手机可读、必填简报、提交前检查 |
| [导演方法.md](导演方法.md) | **必读**：输入是想法 + 素材；三种素材情况；让画面好看的六条（一句一画……）；一个点子、对标、三个结构、按题材选风格、颜色从素材里找、treatment、先证明画面、审片、复盘 |
| [经验.md](经验.md) | **必读**：用户原话、验证过的经验、每支片的分数 |
| [学习/](学习/README.md) | 8 个仓库 + huashu-motion + Xian 梵高做片法的学习笔记，以及每条学到的东西落在哪里 |
| [账号风格.md](账号风格.md) | 账号层：字体、字幕、批注、取色方法 |
| [平台与合规.md](平台与合规.md) | 抖音 / 视频号 / 小红书的画面习惯、遮挡区、发布前逐条查的隐性要求 |
| [评审表.md](评审表.md) | 独立评审的打分表和提示词（`scripts/qa/jury.mjs`） |
| [复盘-2026-10-23.md](复盘-2026-10-23.md) | 为什么片子越做越差，改了什么，校准风格帧 |
| [分镜模板.md](分镜模板.md) | 分镜模板：必填简报五项 + 导演十项，镜头表一句一行 |
| [配音.md](配音.md) | 本人音色：MiniMax `MashuaiDouyin01`（默认，§〇）、豆包复刻（保留）；edge-tts 仅作备用；整段合成 + 时间戳 → 字幕、语速档位、读音修正；§四 复刻音色“平、拖”的办法 |
| [抖音技巧.md](抖音技巧.md) | **必读**：抖音的开头三层、中段二次钩子、五种结尾、片尾留白、标题话题评论区；每条标了是我们的数据还是外部经验 |
| [hooks.md](hooks.md) | **必读**：第一句、第 0 帧、前 10 秒、片长和标题——来自我们自己的后台数据（[数据复盘-2026-10-26.md](数据复盘-2026-10-26.md)，每周的表在 [数据/](数据/)） |
| [文案.md](文案.md) | 口播写给耳朵、短视频节奏（§七）；需要自己写或改写脚本时的视角、选题卡、故事结构 |
| [封面.md](封面.md) | 封面：按内容选模板、一个锚点、封面标题单独写、80 px 缩略图测试、换比例重排（`scripts/qa/cover.mjs`） |
| [音效.md](音效.md) | 选音效：Openverse 上的 Freesound 录音（`scripts/fetch-sfx.mjs`），只用 CC0 / CC BY，README 里署名 |
| [发布与风格偏好.md](发布与风格偏好.md) | 用户过去的反馈：平台、科技题材要有科技感 |
| [讲解动画规则.md](讲解动画规则.md) | 字号、对比度、安全区、A/B 固定色、动效时长 |
| [动效与画面变化.md](动效与画面变化.md) | 变化频率、转场、丰富度自查、`src/fx` 速查 |
| [概念画法.md](概念画法.md) | 抽象概念怎么变成会动的画面 |
| [风格词典.md](风格词典.md) | 描述词 → 参数、27 种风格 |
| [风格卡模板.md](风格卡模板.md) | 新做一套风格时填的风格卡 |
| [审美参考库.md](审美参考库.md) | 去哪看好设计、静帧的减法自查 |
| [踩坑清单.md](踩坑清单.md) | 踩过的坑和扫片做法 |
| [prompt-library/](prompt-library/README.md) | 提示词库：8 个“用 Opus 5.5 写代码做视频”仓库的提示词、风格提示词和制作文档，原样存成固定版本；[选用指南.md](prompt-library/选用指南.md) 按脚本类型挑参考、改写成本仓库的做法 |
| [huashu-motion.md](huashu-motion.md) | huashu-motion（花叔）：导演方法、颜色是找来的、12 个模板怎么在本仓库直接用（`scripts/huashu-new.mjs`） |
| [../style-guide.md](../style-guide.md) | 从外部仓库学来的风格知识（每个仓库一节，注明来源）：mg-styles-15 的节奏、动效参数、转场、字幕版式、配色、提示词写法，以及哪些不适合知识类短视频、为什么 |
| [archive/](archive/) | 已归档的旧规则：导演层（禁止项、物理动作链、八项 Brief）、旧分镜模板、旧 CLAUDE.md 和 SKILL.md |

## 对应的代码和工具

| 位置 | 内容 |
| --- | --- |
| `src/fx/` | 共用动效库：转场（`CutStage`、`planCuts`）、闭式弹簧（`springTrack`、`twoEdge`）、抛出 / 下落 / 弹跳（`toss`、`drop`）、挤压拉伸（`squash`、`impulse`）、错相（`PHASE`、`ripple`）、相机跟随（`follow`）、光和接触影（`matte`、`ContactShadow`）、运动模糊（`Smear`）、印章、粒子、关键词上色、缓动、带种子的随机；旧片用的节拍推拉（`beatZoom`、`beatTour`） |
| `src/components/` | 学自 mg-styles-15 的可复用动效组件（重写，用法见 `src/components/README.md`）：逐字弹出标题 / 花字（`KineticTitle`）、爆炸框（`BurstCallout`）、锁定框（`LockOn`）、数字跳变和滚动（`ScrambleText`、`CountUp`）、贴纸拍下（`StickerSlap`）、大画布相机（`CameraRig`）、描线（`DrawPath`）、柱状图生长（`GrowBars`）、命名缓动曲线（`curve`） |
| `scripts/generate-sfx.py`、`public/audio/sfx/` | 合成的免版权音效库（呼啸、轻敲、闷撞、纸滑、确认、拒绝……），画面组件用 `sfx()` 把它们放到接触帧上 |
| `src/tutorial/props.tsx`、`src/tutorial/fonts.ts`、`public/fonts/` | 道具零件（一句一画用：盖章、删除线反转、数字落词、千里挑一、飞行、堆积、吊牌、批注、两种底……）；思源宋体、霞鹜文楷 |
| `src/lab/PropsLab.tsx` | 风格帧实验台（先证明画面） |
| `scripts/page-render.mjs`、`scripts/huashu-new.mjs` | 任意网页逐帧渲成视频（mg15 / lemo / huashu 三种约定）；从 huashu 模板起一个场景 |
| `scripts/qa/brief.mjs` | 简报检查：简报五项 + 导演十项是否填了、口播字数和成片时长是否超预算；其余只提醒 |
| `scripts/qa/echo.mjs` | 复述检查：上屏字超过三分之一在复述口播就不过；每秒上屏字数 |
| `scripts/qa/compare.mjs`、`scripts/qa/jury.mjs` | 和对标 / 最近几支并排；独立评审的评审包 |
| `scripts/qa/frames.mjs` | 逐帧查看页：把一段时间的每一帧做成可以左右键逐帧翻的 HTML，看预备、接触、错相 |
| `scripts/qa/richness.mjs` | 丰富度检查：每 2.5 秒一格，相邻格平均差 ≥ 10 且没有“几乎没变”才算过 |
| `scripts/qa/scan.mjs` | 扫片（每秒 3 帧拼图）、手机宽度可读性检查（`--phone`）、切点前后细看（`--around`） |
| `scripts/qa/marks.mjs` | 卡点检查：每个卡点前 0.1 秒、后 0.35 秒各一帧，看动作是不是卡在说出那个词的时刻 |
| `scripts/qa/clutter.mjs` | 画面减法检查：每秒一帧，量主体占舞台多少、内容停在多高（字幕上方空带）、同屏几个强调色；只提醒去看，不拦 |
| `scripts/qa/palette.mjs` | 取色：从素材图取主色和指定点颜色（颜色是找来的，导演方法 §三.4） |
| `scripts/prompts/find.mjs`、`snapshot.mjs` | 提示词库：按关键词搜、看全文（带来源 commit 和许可）；从上游抓新快照（不覆盖旧的） |
| `.claude/skills/video-craft/SKILL.md`、根目录 `CLAUDE.md` | 给 Claude 的做片流程和优先级；出片前要过的检查见速查页 §八 |

## 来源与许可

导演层（已归档：`archive/导演层.md`）整理自观默（X @guanmo_ai）的文章《全网首发！用 Codex 自动生成顶尖动效视频》和 twoclipping（X @twoclipping）公开的动效提示词模板，并参考了画廊 [awesome-ai-motion](https://github.com/guanmo-ai/awesome-ai-motion)；这些内容按本项目重写，没有复制原文配图和作品素材。

规则、动效参数和检查方法改编自 [chuspeeism/dashi-animationstyle](https://github.com/chuspeeism/dashi-animationstyle)（commit `aa620f3`，《大师的AI小灶》出品，MIT 许可，许可全文见 [LICENSE-dashi-animationstyle.txt](LICENSE-dashi-animationstyle.txt)）。原项目用 HTML/Canvas + 无头 Chrome 出 16:9 横屏；本项目改写成了 Remotion 组件，按 9:16 抖音竖屏重新换算了字号和安全区，并按本项目的实测补充了 `beatTour`、嵌套转场等做法。

[prompt-library/](prompt-library/) 里是 [@KinGao476942 推荐的 8 个仓库](prompt-library/来源帖.md) 的原样快照，各自的许可和复制范围见 [prompt-library/README.md](prompt-library/README.md)；没有许可证的 PDoomVideo 只记了版本。

风格词典、风格卡模板、分镜写法、卡点检查和取色工具按原项目改写成了本项目的版本；原项目的 HTML 风格模板、示例页和示例口播音频（作者本人声音，仅供试用该 skill）**没有**复制进本仓库。
