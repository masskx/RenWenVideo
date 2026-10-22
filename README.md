# RenWenVideo · AI 工具短视频工作流

基于 [Remotion](https://www.remotion.dev/) 把内容做成 9:16 竖屏视频（1080×1920，30fps），同一条视频发微信视频号、抖音和小红书，题材是 AI 工具和 AI 新闻。项目有两条流水线：

| 流水线 | 适合的内容 | 画面来源 | 配音 |
| --- | --- | --- | --- |
| **长文讲解（Explainer）** | 把文章、对谈稿提炼成“N 条结论” | Images2 AI 配图 + 章节标题、原话卡片 | 本人复刻音色（豆包语音） |
| **操作教程（Tutorial）** | 工具上手、AI 新闻拆解、开源项目介绍 | 代码绘制的字卡、终端、流程图 + 素材包里的录屏、截图、案例片（标「案例展示」） | 本人复刻音色（豆包语音） |

每条视频的成片、三种比例封面、字幕、审片静帧和三个平台的发布文案统一放在 `douyin/<id>/`，和代码一样用 git 管理（成片也提交，单个 < 100 MB）。新片从 `inputs/<id>/`（脚本 + 素材包）开始，流程见下文“制作操作教程视频”和根目录 `CLAUDE.md`。

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
| [`douyin/anatomy-explain/`](douyin/anatomy-explain/) | 讲解：会动，不等于看懂——AI 做科普视频的一条规矩 | 2:32 |
| [`douyin/deepseek-vs-opus55/`](douyin/deepseek-vs-opus55/) | 实测：同一句提示词，DeepSeek V4.1 Flash 1017 vs Opus 5.5 写代码做视频。**画面基准片**（蓝图深底 + 全屏 9:16） | 0:53 |
| [`douyin/deepseek-identity/`](douyin/deepseek-identity/) | 新闻拆解：DeepSeek 连问 5 次都说自己是 ChatGPT，就是蒸馏吗？（中立：自称 ≠ 证据） | 0:47 |
| [`douyin/headroom/`](douyin/headroom/) | 开源工具：Headroom，AI 读日志之前先压一遍，少烧 token | 0:52 |
| [`douyin/orbit-360-doubao/`](douyin/orbit-360-doubao/) | 教程：一张图 + 一句话，用豆包做 360° 环绕（子弹时间） | 1:32 |
| [`douyin/huashu-motion-skill/`](douyin/huashu-motion-skill/) | 开源 Skill：huashu-motion，一句话让 AI 给你的产品拍发布片 | 0:54 |
| [`douyin/awesome-seedance/`](douyin/awesome-seedance/) | 开源项目：awesome-seedance，800+ 条实测 AI 视频提示词；模板四步、打斗写接触点、模板 vs Skill。顶部章节条 | 1:52 |
| [`douyin/sticker-alpha-method/`](douyin/sticker-alpha-method/) | 教程：一个角色 → 一整套透明表情包（定角色、换动作、Alpha 透明底、验收）；画面全是按方法现做的 AI 示例 | 1:25 |
| [`douyin/sweety-handdraw-video/`](douyin/sweety-handdraw-video/) | 开源 Skill：sweety-handdraw-video，没有一笔是人画的手绘讲解视频，三步上手 | 1:33 |
| [`douyin/ai-digital-cleanup-cn/`](douyin/ai-digital-cleanup-cn/) | 教程：用 AI 清理网上的个人信息（中国版）——一证通查 / 一键查卡、AI 排风险、注销前检查、个保法第 47 条删除权、12321 投诉；手机界面全自绘示意、个人信息全打码；不引流 | 1:25 |
| [`douyin/ai-faceswap-scam/`](douyin/ai-faceswap-scam/) | 防骗：视频里的“妈妈”找你要5万——3招识破AI实时换脸（挥手 / 侧脸、按鼻子、挂断回拨 + 家庭暗号）；人物全是剪影、界面全自绘 | 0:45 |
| [`douyin/literal-web-crawler/`](douyin/literal-web-crawler/) | 开源小项目：字面意义上的“网络爬虫”，一只会撕网页链接的蜘蛛；录屏特写按追踪轨迹跟拍 | 0:46 |

## 目录结构

```text
douyin/<id>/                     发布包：video.mp4、cover.jpg（3:4）/ cover-6x7.jpg / cover-9x16.jpg、subtitles.srt、still-XXs.jpg + stills-sheet.jpg、README.md（三个平台的标题/描述/话题、出处）
inputs/<id>/                     每期的输入：script.md（策划 agent “growth” 给的脚本）+ materials/（录屏、截图、案例片）+ README.md（素材说明）；空白模板 inputs/_template/

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
tutorials/<id>.storyboard.md     分镜：必填简报五项 + 封面卡（模板 docs/video-craft/分镜模板.md）
tutorials/<id>.timeline.json     配音脚本生成的字幕和动画时间轴
public/audio/tutorials/<id>/     分场景配音、逐字时间戳和底乐
public/video/<id>/、public/images/tutorials/<id>/   从素材包整理出来的工作素材（短文件名、裁切过的截图、定格帧）
scripts/generate-tutorial-voice.py / generate-tutorial-music.py / render-tutorial.mjs
src/tutorial/                    TutorialVideo 合成、通用 UI、每期画面 scenes/<id>.tsx

# 公共
src/fx/                          共用动效库：闭式弹簧、抛出/下落/弹跳、挤压拉伸、错相、相机跟随、主光/接触影/运动残影、转场、印章、关键词上色（见 docs/video-craft/）
public/audio/sfx/                音效：fs-* 是从 Freesound（经 Openverse）下载的真实录音，来源在 CREDITS.json；其余是合成的（scripts/generate-sfx.py）。画面组件用 sfx() 放到接触帧上
scripts/qa/                      出片检查：brief.mjs（简报和时长）、richness.mjs（丰富度）、scan.mjs（扫片、手机宽度）、marks.mjs（卡点）、frames.mjs（逐帧查看页）、palette.mjs（取色）、cover.mjs（封面卡 + 缩略图）
docs/video-craft/                quick-reference.md（必读，一页）；其余为可选参考；archive/ 是归档的旧规则
docs/video-craft/prompt-library/ 提示词库：8 个 Opus 视频提示词仓库的原样快照（vendor/<仓库>/<commit>/）+ 选用指南；scripts/prompts/ 搜索和更新
.claude/skills/video-craft/      给 Claude 的做片流程（指向速查页）
src/Root.tsx                     注册合成：AiEra11Rules、MarketingEngineer、Tutorial、TutorialCover
scripts/run.ps1                  Windows 辅助脚本（项目放在 FAT32/移动盘时使用）
```

## 环境准备

- Node.js 22+ 和 ffmpeg/ffprobe（需要在 PATH 里）；配音、底乐还需要 Python 3 和 `pip install numpy`（豆包配音只用标准库；备用的 edge-tts 另装 `pip install edge-tts`）
- 中文字体：组件按顺序使用 Noto Sans CJK SC、Source Han Sans SC、PingFang SC、Microsoft YaHei，系统里装有其中一个就行
- 密钥：把 `.env.example` 复制为 `.env` 再填写（`.env` 不会被提交）

| 变量 | 用途 |
| --- | --- |
| `OPENAI_API_KEY` / `OPENAI_BASE_URL` / `OPENAI_IMAGE_MODEL` | Images2 生图，默认 `gpt-image-2`，输出 1024×1536 |
| `DOUBAO_API_KEY`（或 `DOUBAO_APP_ID` + `DOUBAO_ACCESS_TOKEN`） | 配音：用户本人的复刻音色（火山引擎豆包语音），本仓库唯一的 TTS |
| `DOUBAO_VOICE_ZH` / `DOUBAO_VOICE_EN` | 复刻音色 id（`S_` 开头）；可选 `DOUBAO_VOICE_ZH_ENERGY`，场景里用 `"voiceEnv"` 选择 |
| `TTS_CA_BUNDLE` | 可选。备用 edge-tts 在 TLS 代理环境里用的 CA 证书 |
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
   - `voice` / `music`：配音语速（`{"provider": "doubao", "rate": 1.16}`）和底乐素材
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

字卡、终端、流程图由 Remotion 代码绘制，素材包里的录屏、截图、案例片原样嵌进画面（静音、右下角标「案例展示」或「AI 生成示例」）。旁白里的 `{a}` 标记会换算成画面动画的触发时间；`[显示|朗读]` 可以让字幕和读音不同，例如 `[9222|九二二二]`、`[Alpha|阿尔法]`。

1. **输入**：`inputs/<id>/script.md`（钩子、口播、结尾、标题，格式随意）+ `materials/`。先看一遍素材：账号、网址、品牌、血腥画面要避开或打码，记进分镜的“素材和出处”。
2. **计划**：写 `tutorials/<id>.json`、`tutorials/<id>.storyboard.md`（简报五项 + 封面卡）和 `src/tutorial/scenes/<id>.tsx`（在 `scenes/index.ts` 里登记）。新片照 `tutorials/awesome-seedance.json` 这类全屏片改：
   - 配音只用本人的复刻音色：`"tts": {"provider": "doubao"}`，语速按场景写 `"pace"`。复刻音色不可用且用户同意时，可临时改用免费的 edge-tts 备用声音：`"tts": {"provider": "edge"}`。每个场景整段一次合成，卡点和字幕时间来自服务端的逐字时间戳；语速、读音修正见 `docs/video-craft/配音.md`。
   - 默认 ≤ 60 秒；脚本要求更长且用户同意时写 `"maxSeconds"`。
   - `"look": {"theme": "blueprint", "frame": "full", "header": false, "tour": false}`：全屏 9:16，舞台 900×1080 在 (60, 200)，字幕在 y 1390。`"header": "chapters"` 加顶部章节条（章节名来自 `"steps"`，场景的 `"step"` 决定高亮哪一章）。
   - `"musicVolume"` + `"musicDuckDb"`：底乐从第 0 帧开始，口播时压低（一般 14–18 dB）。
   - `"coverCard"`：封面标题、辅助句、锚点画面；`layouts["3:4"]` 可以单独换文字（`text` / `supportText`）和锚点（`anchorId`），小红书封面常用。
   - 画面文件里，场景组件可以带 `sfx`（音效卡点）和 `backdrop`（铺满 1080×1920 的底层画面，例如全屏素材）。
3. **配音、底乐、渲染**：
   ```bash
   npm run tutorial:voice -- <id>                  # 分场景配音 + 字幕/动画时间轴 → tutorials/<id>.timeline.json
   npm run tutorial:music -- <id>                  # 合成无版权底乐
   npm run tutorial:render -- <id> --stills=0,300,1200   # 抽帧检查 → qa/<id>/frame-N.png
   npm run tutorial:render -- <id> --overwrite     # → douyin/<id>/video.mp4、三种封面、subtitles.srt
   node scripts/render-tutorial.mjs <id> --cover-only   # 只重出封面
   ```
   云端容器里渲染要设 `REMOTION_BROWSER_EXECUTABLE`（见 `CLAUDE.md`）。
4. **检查**：跑下文“出片检查”的全部命令，自己看第 0 / 1 / 3 秒和高潮处的静帧。
5. **发布包**：`douyin/<id>/` 里补审片静帧和 `README.md`（视频号、抖音、小红书分开写标题、描述、话题；出处链接只写在这里，不上屏）。素材是 AI 生成的，提醒发布时勾选「内容由AI生成」。

`TutorialVideo` 外层统一处理转场（步骤号变化时用大转场）、字幕、配音、音效和底乐压低；第 0 帧直接是钩子，没有开场遮罩。`look.tour` 为 true 的老片会每句字幕换一次构图（`beatTour`），新片一般关掉，由画面文件自己安排镜头。

## 做片规则：先抓住人，再打磨

2026-10-18 起，规则只剩一页必读的 [`docs/video-craft/quick-reference.md`](docs/video-craft/quick-reference.md)（观众、优先级、时长、手机可读、必填简报、检查）和根目录 `CLAUDE.md`（端到端流程）。优先级：**钩子 → 留人 → 手机看得清 → 忠于脚本和素材 → 打磨**。旧的导演层规则（禁止项、物理动作链、八项 Brief）已归档到 `docs/video-craft/archive/`，只作可选参考；发光、粒子、整幅推拉不再禁止，按素材决定用不用。

```bash
node scripts/fetch-sfx.mjs search "paper slide"                  # 在 Openverse 里找 Freesound 音效（CC0 / CC BY）
node scripts/fetch-sfx.mjs get <openverse-id> paper-slide       # 下载 → public/audio/sfx/fs-paper-slide.wav，来源记进 CREDITS.json
node scripts/fetch-sfx.mjs credits src/tutorial/scenes/<file>.tsx  # 发布包要贴的署名
python scripts/generate-sfx.py                                   # 合成音效库（兜底）→ public/audio/sfx/
node scripts/qa/frames.mjs douyin/<id>/video.mp4 --at=秒          # 逐帧查看页（← → 翻帧）
node scripts/prompts/find.mjs '发布|launch' 数字                   # 在提示词库里按脚本类型找参考（选用指南：docs/video-craft/prompt-library/选用指南.md）
node scripts/prompts/find.mjs --show=lemo/dark-keynote           # 看全文（带来源 commit 和许可）
node scripts/prompts/snapshot.mjs                                # 从上游抓新快照，旧版本不动；--pin 才改用新版本
```

## 出片检查（每条视频提交前都要过）

动效知识和规则在 [`docs/video-craft/`](docs/video-craft/)。改编自 [dashi-animationstyle](https://github.com/chuspeeism/dashi-animationstyle)（MIT），按竖屏抖音重新换算过。

```bash
node scripts/qa/brief.mjs <id>                                 # 简报五项（钩子台词 / 钩子画面 / 核心看点 / 结尾 / 平台标题）、时长和口播字数
node scripts/qa/richness.mjs douyin/<id>/video.mp4             # 丰富度：要显示“判定：过”（相邻 2.5 秒平均变化 ≥ 10，没有几乎不变的段）
node scripts/qa/scan.mjs douyin/<id>/video.mp4                 # 扫片：每秒 3 帧拼图，查截断、叠字、空白，转场至少 3 种
node scripts/qa/scan.mjs douyin/<id>/video.mp4 --phone=5,60,120  # 缩到 360 宽（手机屏宽），要读的字必须读得清
node scripts/qa/marks.mjs douyin/<id>/video.mp4                # 卡点：每个卡点前 0.1 秒没有动作、后 0.35 秒已经出现
node scripts/qa/cover.mjs <id>                                 # 封面：封面卡、标题字数、对比度；看 cover-thumbs.png 按十条打分（docs/video-craft/封面.md）
```

做片流程写在根目录 `CLAUDE.md`（输入 → 计划 → 配音 → 渲染 → 检查 → 发布包）。分镜写在 `tutorials/<id>.storyboard.md`（模板：`docs/video-craft/分镜模板.md`，必填只有简报五项；画面基准：`tutorials/deepseek-vs-opus55`）。想换风格时查 `docs/video-craft/风格词典.md`（27 种风格），照参考图做时用 `node scripts/qa/palette.mjs <参考图>` 取色。

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
| anatomy-explain | 10.2 过 |
| deepseek-vs-opus55 | 29.4 过（画面基准片） |
| deepseek-identity | 10.4 过 |
| headroom | 10.3 过 |
| orbit-360-doubao | 24.8 过 |
| huashu-motion-skill | 32.7 过 |
| awesome-seedance | 29.7 过（第一版 4 段几乎不变，补推镜、计数、动态缩略图后过） |
| sticker-alpha-method | 31.1 过（第一版开头 3 秒和提示词卡太静，补表情晃动、提示词逐字打出后过） |
| sweety-handdraw-video | 30.3 过（第一版 5 段几乎不变：命令打字太快、小窗是画完的静态画面；换成随口播切换的素材和配音波形后过） |

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
- 第 0 帧就要有钩子画面和大字；`--stills=0` 渲一张看看（元素用弹入动画时，第 0 帧该在的东西把触发时间设成负数）
- 关键信息放在 x 60–930、y 160–1290 之内；字幕带 y 1290–1500 只放字幕；避开抖音底部文案区（y > 1560）和右侧按钮列（x > 930）
- 配图只用象征性插画，不生成真实人物肖像；画面里标注“AI 配图”，并署名原文作者
- 外部素材静音，右下角「案例展示」（按方法现做的 AI 图标「AI 生成示例」）；画面里不出现账号、头像、网址，出处链接只写进发布包 README
- 片中有 AI 生成内容时，发布时打开平台的「内容由AI生成」声明
- 涉及投资、医疗等内容时，用 `disclaimer` 加上提示
- 成片控制在 100MB 以内（GitHub 单文件上限）。画面一直在动会让码率变高：3 分钟左右的视频，长文讲解用 `--crf=25`（约 50MB），教程用 `--crf=23`（约 65MB）
