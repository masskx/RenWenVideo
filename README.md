# RenWenVideo · 抖音竖屏视频工作流

基于 [Remotion](https://www.remotion.dev/) 把内容做成 9:16 竖屏视频（1080×1920，30fps），目标平台是抖音。项目有两条流水线：

| 流水线 | 适合的内容 | 画面来源 | 配音 |
| --- | --- | --- | --- |
| **长文讲解（Explainer）** | 把文章、对谈稿提炼成“N 条结论” | Images2 AI 配图 + 章节标题、原话卡片 | 百炼 CosyVoice |
| **操作教程（Tutorial）** | 软件、工具的操作步骤 | 代码绘制的终端、聊天窗口、流程图（不生图） | edge-tts |

每条视频的成片、封面、字幕和发布文案统一放在 `douyin/<id>/`。

## 已发布内容

| 目录 | 内容 | 时长 |
| --- | --- | --- |
| [`douyin/ai-era-11-rules/`](douyin/ai-era-11-rules/) | 长文讲解：孙宇晨 × 邵艾伦 4 小时对谈，AI 时代年轻人的 11 条反常识 | 3:01 |
| [`douyin/rea-quickstart/`](douyin/rea-quickstart/) | 教程：REA 保姆级上手（用恐龙小游戏跑通官方案例） | 3:26 |
| [`douyin/ochiai-claude-code/`](douyin/ochiai-claude-code/) | 教程：落合阳一 × Claude Code，6 个 AI 习惯 | 3:31 |
| [`douyin/marketing-engineer/`](douyin/marketing-engineer/) | 长文讲解：Greg Isenberg《Marketing Engineers》，用 AI Agent 做营销的 8 步 | 3:10 |
| [`douyin/workbuddy-15-skills/`](douyin/workbuddy-15-skills/) | 教程：WorkBuddy 最值得装的 15 个技能（10 月版） | 3:50 |
| [`douyin/magpie-lessons/`](douyin/magpie-lessons/) | 教程：magpie 的错题本，AI 怎么自己维护项目 | 3:10 |
| [`douyin/ai-agent-team/`](douyin/ai-agent-team/) | 教程：一个人带 AI 团队，4 个 agent 自己交接、互相挑错（Rahul，原文为 Teamily AI 合作推广）。第一部按导演层做的片子：纸面风格、物理、音效 | 3:48 |
| [`douyin/tesla-roadster-flight/`](douyin/tesla-roadster-flight/) | 新闻拆解：特斯拉“会飞的车”——新 Roadster 发布会，演示（坡道倒挂翻身、越过车队、0.81 秒）和承诺（2028 投产）分开看。线稿车贯穿全片，标题走 HUD 层 | 2:06 |
| [`douyin/agent-engineer-roadmap/`](douyin/agent-engineer-roadmap/) | 教程：Agent 工程师路线图（Chasen 面试后拿到的入门指南：五个阶段、五个项目）。第一部按视频号做：9:16 + 中间 6:7 安全带，另出 6:7 版和 3:4 封面；蓝图科技风 | 2:55 |

## 目录结构

```text
douyin/<id>/                     发布包：video.mp4、cover.jpg、subtitles.srt、README.md（标题/文案/话题/旁白稿）

# 长文讲解
explainers/<id>.json             配置：分场景旁白、标题、原话卡片、配图提示词、配音和底乐参数
explainers/<id>.timeline.json    build 生成的帧级时间轴，渲染时读取
public/images/explainers/<id>/   AI 配图（JPEG）
public/audio/explainers/<id>/    分句配音、合成旁白 narration.mp3、底乐 music-bed.mp3
public/audio/music/              长文讲解用的底乐素材
scripts/build-explainer.mjs      生成配图、配音、底乐和时间轴
scripts/render-explainer.mjs     渲染成片或单帧，并把响度统一到约 -15 LUFS
src/ArticleExplainer.tsx         合成组件：章节标题、原话卡片、进度条、字幕

# 操作教程
tutorials/<id>.json              配置：分场景旁白（含动画触发标记）和画面类型
tutorials/<id>.timeline.json     配音脚本生成的字幕和动画时间轴
public/audio/tutorials/<id>/     分场景配音和底乐
scripts/generate-tutorial-voice.py / generate-tutorial-music.py / render-tutorial.mjs
src/tutorial/                    TutorialVideo 合成、通用 UI、每期画面 scenes/<id>.tsx

# 公共
src/fx/                          共用动效库：闭式弹簧、抛出/下落/弹跳、挤压拉伸、错相、相机跟随、主光/接触影/运动残影、转场、印章、关键词上色（见 docs/video-craft/）
public/audio/sfx/                音效：fs-* 是从 Freesound（经 Openverse）下载的真实录音，来源在 CREDITS.json；其余是合成的（scripts/generate-sfx.py）。画面组件用 sfx() 放到接触帧上
scripts/qa/                      出片检查：brief.mjs（导演层）、richness.mjs（丰富度）、scan.mjs（扫片、手机宽度）、marks.mjs（卡点）、frames.mjs（逐帧查看页）、palette.mjs（取色）
docs/video-craft/                导演层（先读）、讲解动画规则、动效与画面变化、分镜模板、风格词典、风格卡模板、概念画法、踩坑清单
.claude/skills/video-craft/      给 Claude 的做片工作流和出片检查门槛
src/Root.tsx                     注册合成：AiEra11Rules、MarketingEngineer、Tutorial、TutorialCover
scripts/run.ps1                  Windows 辅助脚本（项目放在 FAT32/移动盘时使用）
```

## 环境准备

- Node.js 22+ 和 ffmpeg/ffprobe（需要在 PATH 里）；做教程还需要 Python 3 和 `pip install edge-tts numpy dashscope`
- 中文字体：组件按顺序使用 Noto Sans CJK SC、Source Han Sans SC、PingFang SC、Microsoft YaHei，系统里装有其中一个就行
- 密钥：把 `.env.example` 复制为 `.env` 再填写（`.env` 不会被提交）

| 变量 | 用途 |
| --- | --- |
| `OPENAI_API_KEY` / `OPENAI_BASE_URL` / `OPENAI_IMAGE_MODEL` | Images2 生图，默认 `gpt-image-2`，输出 1024×1536 |
| `DASHSCOPE_API_KEY` | 百炼 CosyVoice 配音：长文讲解的参数在 `explainers/<id>.json`；教程在 `tutorials/<id>.json` 里加 `tts` 也可以改用它 |
| `TTS_CA_BUNDLE` | 可选。在使用 TLS 代理的环境里给 edge-tts 指定 CA 证书（教程配音） |
| `REMOTION_BROWSER_EXECUTABLE` | 可选。Remotion 下载不了 Chrome 时，指定本机 Chrome 或 headless-shell |

```bash
npm ci
```

## 制作长文讲解视频

1. **写配置**：参照 `explainers/ai-era-11-rules.json` 新建 `explainers/<id>.json`。
   - `scenes[]`：`hook`（开场）、`intro`、`chapter`（带 `no` 编号）、`outro`
   - `lines`：逐句旁白，每句就是一条字幕，建议 20 字以内
   - `headline`：两行大标题，第二行会加高亮
   - `quote`：原话卡片；`disclaimer`：底部提示（例如投资类免责声明）
   - `stamp`：`{line, phrase, text}`，第 `line` 句念到 `phrase` 时盖下印章 `text` 并震屏（每个场景的主动作）
   - `highlights` / `emphasis`：全片两个核心名词的 A/B 固定色，以及字幕里要强调的词（规则见 `docs/video-craft/讲解动画规则.md` 第四节）
   - `images`：配图提示词（`imageStyle` 是全片统一的画风）；场景有两张图时，`split` 指定从第几句开始切到第二张
   - `voice` / `music`：配音参数和底乐素材
2. **生成素材和时间轴**（已有的文件会跳过，加 `--force` 全部重做）：
   ```bash
   node scripts/build-explainer.mjs --id=<id> --images --voice
   ```
   不带 `--images` / `--voice` 时，只用已有音频重建时间轴、旁白和底乐。
3. **注册合成**：在 `src/Root.tsx` 里 import 新的 `<id>.timeline.json`，并加一个合成 ID。
4. **预览和抽帧检查**：
   ```bash
   npm run dev                                   # Remotion Studio
   node scripts/render-explainer.mjs --composition=<Id> --still=60,900 --out=qa/frame.png
   ```
5. **渲染成片**：
   ```bash
   node scripts/render-explainer.mjs --composition=<Id> --out=douyin/<id>/video.mp4 --crf=25
   ```
   转场按场景自动分配（换场景用大转场，场景内换图用小转场），每句字幕换一次构图，不用手写。
6. **整理发布包**：在 `douyin/<id>/` 里补上 `cover.jpg`（可以用 `--still` 抽标题帧）、`subtitles.srt`、`README.md`（标题、正文、话题、来源）。

## 制作操作教程视频

教程画面全部由 Remotion 代码绘制，不需要生图。旁白里的 `{a}` 标记会换算成画面动画的触发时间；`[显示|朗读]` 可以让字幕和读音不同，例如 `[9222|九二二二]`。

1. 复制一份 `tutorials/<id>.json`，修改 `id` 和旁白。
   - 配音用百炼 TTS：`"tts": {"provider": "dashscope", "model": "qwen-audio-3.1-tts-flash", "voice": "anmingyuan_v3.1", "rate": 1.1}`。每个场景整段一次合成，卡点和字幕时间来自服务端的逐字时间戳；模型、音色、语气指令和读音修正见 `docs/video-craft/配音.md`。（旧的逐句拼接 `"segment": "phrase"` 只留给旧片子；不写 `tts` 时用 edge-tts。）
   - 画面整宽排满的教程，可以用 `"motion": {"amp": 0.05, "drift": 12}` 调小每句换构图的幅度，避免内容碰到画面边缘。
2. 在 `src/tutorial/scenes/` 新建画面文件 `<id>.tsx`，并在 `scenes/index.ts` 里登记。
3. 生成配音、底乐，再渲染：
   ```bash
   npm run tutorial:voice -- <id>                  # 分场景配音 + 字幕/动画时间轴 → tutorials/<id>.timeline.json
   npm run tutorial:music -- <id>                  # 合成无版权底乐
   npm run tutorial:render -- <id> --stills=300,1200   # 抽帧检查 → qa/<id>/
   npm run tutorial:render -- <id> --overwrite     # → douyin/<id>/video.mp4、cover.jpg、subtitles.srt
   ```
4. 补写 `douyin/<id>/README.md`（标题、作品描述、话题）。

`TutorialVideo` 外层统一加了转场（步骤号变化时用大转场）、开场圆形遮罩、每句字幕换一次构图（`beatTour`）、光点粒子和背景流动，每期的画面文件只管自己的内容和卡点动画。

## 导演层：先定观感，再写代码

2026-10-15 起，每条视频都先过 [`docs/video-craft/导演层.md`](docs/video-craft/导演层.md)（整理自观默 @guanmo_ai《用 Codex 自动生成顶尖动效视频》和 twoclipping 公开的动效提示词模板）。以前的片子检查都过了，但“AI 味”很重：元素一起弹出、每句整幅推拉、到处发光、卡片堆字、没有物理、没有音效。现在的要求：

- 平时多“浸泡”好设计，做片前按 [`docs/video-craft/审美参考库.md`](docs/video-craft/审美参考库.md) 挑参考（10 个设计灵感网站 + 动效画廊），出静帧时做一次减法自查：这个元素真的有必要吗？
- 分镜前先写**导演 Brief 八项**（目标、分镜与主次、轨迹与相机、运动与物理、材质与光、节拍与声音、禁止项、验收标准），先在[参考画廊](https://guanmo-ai.github.io/awesome-ai-motion/)里找 1–2 个参考拆关系。
- 每个主动作写清**受力起点 → 接触帧 → 恢复**，各层按错相晚几帧；至少一个主体贯穿多镜、变形成下一个状态。
- 一盏主光（左上）、哑光材质、接触影；一屏强调色 ≤ 2；不发光、不渐变、不整幅推拉。
- 音效从运动里长出来，落在接触帧上，比人声低 12–18 dB。
- 教程配置里用 `look` 切换：`{"theme": "paper", "tour": false, "particles": false}`（旧片不写 `look`，保持原样）。

```bash
node scripts/fetch-sfx.mjs search "paper slide"                  # 在 Openverse 里找 Freesound 音效（CC0 / CC BY）
node scripts/fetch-sfx.mjs get <openverse-id> paper-slide       # 下载 → public/audio/sfx/fs-paper-slide.wav，来源记进 CREDITS.json
node scripts/fetch-sfx.mjs credits src/tutorial/scenes/<file>.tsx  # 发布包要贴的署名
python scripts/generate-sfx.py                                   # 合成音效库（兜底）→ public/audio/sfx/
node scripts/qa/brief.mjs <id>                                   # 导演层检查：Brief 八项、逐镜主体/受力/错相/音效、禁止项
node scripts/qa/frames.mjs douyin/<id>/video.mp4 --at=秒          # 逐帧查看页（← → 翻帧），看预备、接触、压扁、回稳、错相
```

## 出片检查（每条视频提交前都要过）

动效知识和规则在 [`docs/video-craft/`](docs/video-craft/)。改编自 [dashi-animationstyle](https://github.com/chuspeeism/dashi-animationstyle)（MIT），按竖屏抖音重新换算过。

```bash
node scripts/qa/brief.mjs <id>                                 # 导演层：Brief 八项、禁止项（发光、渐变、整幅推拉……）
node scripts/qa/richness.mjs douyin/<id>/video.mp4             # 丰富度：要显示“判定：过”（相邻 2.5 秒平均变化 ≥ 10，没有几乎不变的段）
node scripts/qa/scan.mjs douyin/<id>/video.mp4                 # 扫片：每秒 3 帧拼图，查截断、叠字、空白，转场至少 3 种
node scripts/qa/scan.mjs douyin/<id>/video.mp4 --phone=5,60,120  # 缩到 360 宽（手机屏宽），要读的字必须读得清
node scripts/qa/marks.mjs douyin/<id>/video.mp4                # 卡点：每个卡点前 0.1 秒没有动作、后 0.35 秒已经出现
```

做片流程（分镜 → 风格 → A/B 固定色 → 写画面 → 3 张静帧 → 出片 → 检查 → 发布包）写在 `.claude/skills/video-craft/SKILL.md`，根目录 `CLAUDE.md` 要求每次做片都按它走。分镜写在 `tutorials/<id>.storyboard.md` 或 `explainers/<id>.storyboard.md`（模板：`docs/video-craft/分镜模板.md`，例子：`tutorials/workbuddy-15-skills.storyboard.md`）。想换风格时查 `docs/video-craft/风格词典.md`（27 种风格），照参考图做时用 `node scripts/qa/palette.mjs <参考图>` 取色。

| 视频 | 丰富度（加入 `src/fx` 前 → 后） |
| --- | --- |
| ai-era-11-rules | 12.7 不过 → 17.3 过 |
| rea-quickstart | 4.4 不过 → 12.8 过 |
| ochiai-claude-code | 3.4 不过 → 10.6 过 |
| marketing-engineer | 10.2 不过（25 段几乎不变）→ 16.4 过 |
| workbuddy-15-skills | 新片，15.9 过 |
| magpie-lessons | 新片，12.5 过（卡点 50 个全部对上） |
| ai-agent-team | 第一版 13.2 过但“AI 味”重；第二版按导演层重做 11.3 过（卡点 92 个对上，导演层检查过） |
| agent-engineer-roadmap | 新片；深色蓝图第一稿 7 左右（一次整屏转场把平均数撑到 10），中性块改浅钢 + 有理由的相机后 10.3 过 |
| tesla-roadster-flight | 新片；纸面线稿第一次只有 5.5，给主体分量（实心轮胎、路面）+ 每镜尾巴补真实事件后 10.3 过（卡点 40 个对上） |

## 命令一览

```bash
npm run dev                # Remotion Studio 预览
npm run lint               # ESLint + TypeScript 检查
npm run explainer:build -- --id=<id>      # 生成配图 + 配音 + 时间轴
npm run explainer:render -- --composition=<Id> --out=douyin/<id>/video.mp4
npm run tutorial:voice -- <id>             # 教程配音 + 时间轴
npm run tutorial:music -- <id>             # 教程底乐
npm run tutorial:render -- <id> --overwrite  # 渲染教程到 douyin/<id>/（默认 --crf=22）
npm run qa:richness -- douyin/<id>/video.mp4  # 丰富度检查
npm run qa:scan -- douyin/<id>/video.mp4      # 扫片
npm run qa:marks -- douyin/<id>/video.mp4     # 卡点检查
npm run qa:palette -- <参考图>                 # 取色
```

### Windows / FAT32 磁盘

项目放在 FAT32 移动盘上时，`node_modules` 没法正常安装。这时用 `scripts/run.ps1`：它会把项目同步到 `%LOCALAPPDATA%\renwen-video-runtime`，在那里安装依赖并运行，渲染完成后把 `douyin/` 复制回项目。

```powershell
./scripts/run.ps1 -Mode preview
./scripts/run.ps1 -Mode lint
./scripts/run.ps1 -Mode render --composition=AiEra11Rules --out=douyin/ai-era-11-rules/video.mp4
./scripts/run.ps1 -Mode tutorial rea-quickstart --overwrite
```

`build-explainer.mjs` 和教程的 Python 配音、底乐脚本不依赖 `node_modules`，可以直接在项目目录运行。

## 版式与发布规范

- 画布 1080×1920、30fps，H.264 + AAC，响度 -15～-16 LUFS
- 关键信息放在 x 60–930、y 160–1290 之内；字幕带 y 1290–1500 只放字幕；避开抖音底部文案区（y > 1560）和右侧按钮列（x > 930）
- 配图只用象征性插画，不生成真实人物肖像；画面里标注“AI 配图”，并署名原文作者
- 涉及投资、医疗等内容时，用 `disclaimer` 加上提示
- 成片控制在 100MB 以内（GitHub 单文件上限）。画面一直在动会让码率变高：3 分钟左右的视频，长文讲解用 `--crf=25`（约 50MB），教程用 `--crf=23`（约 65MB）
