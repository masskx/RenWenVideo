# 视频手艺（video-craft）

这里收着本项目做竖屏讲解视频的通用规则、动效知识，以及对应的代码和检查工具。两条流水线（长文讲解、操作教程）共用这一套。

| 文档 | 管什么 |
| --- | --- |
| [审美参考库.md](审美参考库.md) | 去哪看、怎么看：10 个设计灵感网站（极简、排版、首屏、微动效、真实产品界面……）和它们在做片里的用法；静帧的“减法自查”；开场按首屏标准看 |
| [发布与风格偏好.md](发布与风格偏好.md) | **最先读**。用户反馈：发微信视频号（先核实尺寸和封面规格），科技题材要有科技感（不用纸面） |
| [音效.md](音效.md) | 选音效：从 Openverse 找 Freesound 的真实录音（`scripts/fetch-sfx.mjs`），只用 CC0 / CC BY，README 里署名 |
| [配音.md](配音.md) | 配音前读：百炼 TTS 模型与音色、整段合成 + 逐字时间戳（不要再逐句拼接）、语气指令、读音修正 |
| [导演层.md](导演层.md) | **先读这份**。观感：导演 Brief 八项、整片顺序、主次与错相、运动语言（预备→冲击→回稳）、物理、光、音效、相机、参考、禁止项（AI 味清单）、验收；和旧规则冲突时以它为准 |
| [讲解动画规则.md](讲解动画规则.md) | 看得清、卡得准：字号、对比度、抖音安全区、A/B 固定色、一镜一事、动效时长 |
| [动效与画面变化.md](动效与画面变化.md) | 画面一直有新东西：每镜头四件事、变化频率、转场轮换、分层和节拍推拉、丰富度自查表、`src/fx` 速查 |
| [概念画法.md](概念画法.md) | 抽象概念怎么变成会动的画面 |
| [分镜模板.md](分镜模板.md) | 写画面代码之前的分镜：每个镜头的进场、主动作（卡在哪个词）、次要动作、转场；3 张静帧确认 |
| [风格词典.md](风格词典.md) | 描述词 → 参数、27 种风格的配色 / 适合 / 翻车 / 转场、照参考图做、用一句话描述做 |
| [风格卡模板.md](风格卡模板.md) | 新做一套风格时填的风格卡 |
| [踩坑清单.md](踩坑清单.md) | 原项目和本项目扫片时踩过的坑、扫片做法 |

## 对应的代码和工具

| 位置 | 内容 |
| --- | --- |
| `src/fx/` | 共用动效库：转场（`CutStage`、`planCuts`）、闭式弹簧（`springTrack`、`twoEdge`）、抛出 / 下落 / 弹跳（`toss`、`drop`）、挤压拉伸（`squash`、`impulse`）、错相（`PHASE`、`ripple`）、相机跟随（`follow`）、光和接触影（`matte`、`ContactShadow`）、运动模糊（`Smear`）、印章、粒子、关键词上色、缓动、带种子的随机；旧片用的节拍推拉（`beatZoom`、`beatTour`） |
| `scripts/generate-sfx.py`、`public/audio/sfx/` | 合成的免版权音效库（呼啸、轻敲、闷撞、纸滑、确认、拒绝……），画面组件用 `sfx()` 把它们放到接触帧上 |
| `scripts/qa/brief.mjs` | 导演层检查：分镜里有没有八项 Brief 和逐镜的主体 / 受力 / 错相 / 音效；画面代码里有没有发光、渐变标签、整幅推拉这些禁止项 |
| `scripts/qa/frames.mjs` | 逐帧查看页：把一段时间的每一帧做成可以左右键逐帧翻的 HTML，看预备、接触、错相 |
| `scripts/qa/richness.mjs` | 丰富度检查：每 2.5 秒一格，相邻格平均差 ≥ 10 且没有“几乎没变”才算过 |
| `scripts/qa/scan.mjs` | 扫片（每秒 3 帧拼图）、手机宽度可读性检查（`--phone`）、切点前后细看（`--around`） |
| `scripts/qa/marks.mjs` | 卡点检查：每个卡点前 0.1 秒、后 0.35 秒各一帧，看动作是不是卡在说出那个词的时刻 |
| `scripts/qa/palette.mjs` | 取色：参考图的主色和指定点颜色，做新风格时用 |
| `.claude/skills/video-craft/SKILL.md`、根目录 `CLAUDE.md` | 给 Claude 的强制工作流：做新视频或改视频时按这套规则走，出片前必须过检查 |

## 来源与许可

导演层（`导演层.md`）整理自观默（X @guanmo_ai）的文章《全网首发！用 Codex 自动生成顶尖动效视频》和 twoclipping（X @twoclipping）公开的动效提示词模板，并参考了画廊 [awesome-ai-motion](https://github.com/guanmo-ai/awesome-ai-motion)；这些内容按本项目重写，没有复制原文配图和作品素材。

规则、动效参数和检查方法改编自 [chuspeeism/dashi-animationstyle](https://github.com/chuspeeism/dashi-animationstyle)（commit `aa620f3`，《大师的AI小灶》出品，MIT 许可，许可全文见 [LICENSE-dashi-animationstyle.txt](LICENSE-dashi-animationstyle.txt)）。原项目用 HTML/Canvas + 无头 Chrome 出 16:9 横屏；本项目改写成了 Remotion 组件，按 9:16 抖音竖屏重新换算了字号和安全区，并按本项目的实测补充了 `beatTour`、嵌套转场等做法。

风格词典、风格卡模板、分镜写法、卡点检查和取色工具按原项目改写成了本项目的版本；原项目的 HTML 风格模板、示例页和示例口播音频（作者本人声音，仅供试用该 skill）**没有**复制进本仓库。
