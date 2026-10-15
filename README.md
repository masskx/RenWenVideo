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
src/Root.tsx                     注册合成：AiEra11Rules、Tutorial、TutorialCover
scripts/run.ps1                  Windows 辅助脚本（项目放在 FAT32/移动盘时使用）
```

## 环境准备

- Node.js 22+ 和 ffmpeg/ffprobe（需要在 PATH 里）；做教程还需要 Python 3 和 `pip install edge-tts numpy`
- 中文字体：组件按顺序使用 Noto Sans CJK SC、Source Han Sans SC、PingFang SC、Microsoft YaHei，系统里装有其中一个就行
- 密钥：把 `.env.example` 复制为 `.env` 再填写（`.env` 不会被提交）

| 变量 | 用途 |
| --- | --- |
| `OPENAI_API_KEY` / `OPENAI_BASE_URL` / `OPENAI_IMAGE_MODEL` | Images2 生图，默认 `gpt-image-2`，输出 1024×1536 |
| `DASHSCOPE_API_KEY` | 百炼 CosyVoice 配音（长文讲解），音色、语速等参数在 `explainers/<id>.json` 里配置 |
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
   node scripts/render-explainer.mjs --composition=<Id> --out=douyin/<id>/video.mp4 --crf=22
   ```
6. **整理发布包**：在 `douyin/<id>/` 里补上 `cover.jpg`（可以用 `--still` 抽标题帧）、`subtitles.srt`、`README.md`（标题、正文、话题、来源）。

## 制作操作教程视频

教程画面全部由 Remotion 代码绘制，不需要生图。旁白里的 `{a}` 标记会换算成画面动画的触发时间；`[显示|朗读]` 可以让字幕和读音不同，例如 `[9222|九二二二]`。

1. 复制一份 `tutorials/<id>.json`，修改 `id` 和旁白。
2. 在 `src/tutorial/scenes/` 新建画面文件 `<id>.tsx`，并在 `scenes/index.ts` 里登记。
3. 生成配音、底乐，再渲染：
   ```bash
   npm run tutorial:voice -- <id>                  # 分场景配音 + 字幕/动画时间轴 → tutorials/<id>.timeline.json
   npm run tutorial:music -- <id>                  # 合成无版权底乐
   npm run tutorial:render -- <id> --stills=300,1200   # 抽帧检查 → qa/<id>/
   npm run tutorial:render -- <id> --overwrite     # → douyin/<id>/video.mp4、cover.jpg、subtitles.srt
   ```
4. 补写 `douyin/<id>/README.md`（标题、作品描述、话题）。

## 命令一览

```bash
npm run dev                # Remotion Studio 预览
npm run lint               # ESLint + TypeScript 检查
npm run explainer:build -- --id=<id>      # 生成配图 + 配音 + 时间轴
npm run explainer:render -- --composition=<Id> --out=douyin/<id>/video.mp4
npm run tutorial:voice -- <id>             # 教程配音 + 时间轴
npm run tutorial:music -- <id>             # 教程底乐
npm run tutorial:render -- <id> --overwrite  # 渲染教程到 douyin/<id>/
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
- 关键信息放在 y≈200–1450 之间，右侧留出约 150px，避开抖音底部文案区和右侧按钮
- 配图只用象征性插画，不生成真实人物肖像；画面里标注“AI 配图”，并署名原文作者
- 涉及投资、医疗等内容时，用 `disclaimer` 加上提示
- 成片控制在 100MB 以内（GitHub 单文件上限），3 分钟左右的视频一般在 45～55MB
