# RenWenVideo · 文章转抖音讲解视频

把一篇文章（比如 X 长文、公众号文章）做成 9:16 竖屏知识讲解视频，基于 [Remotion](https://www.remotion.dev/) 渲染，目标平台是抖音。

流水线有三步：写文案配置 → 自动生成配图和配音 → 渲染成片。每条视频的成片、封面、字幕和发布文案统一放在 `douyin/<id>/`。

## 已发布内容

| 目录 | 内容 | 时长 |
| --- | --- | --- |
| [`douyin/ai-era-11-rules/`](douyin/ai-era-11-rules/) | 孙宇晨 × 邵艾伦 4 小时对谈：AI 时代年轻人的 11 条反常识 | 3:01 |

## 目录结构

```text
douyin/<id>/                 发布包：video.mp4、cover.jpg、subtitles.srt、README.md（标题/文案/话题/旁白稿）
explainers/<id>.json         视频配置：分场景旁白、标题、原话卡片、配图提示词、配音和底乐参数
explainers/<id>.timeline.json  build 生成的帧级时间轴（场景起止、字幕时间），渲染时读取
public/images/explainers/<id>/ AI 配图（JPEG）
public/audio/explainers/<id>/  分句配音、合成旁白 narration.mp3、底乐 music-bed.mp3
public/audio/music/          底乐素材
scripts/build-explainer.mjs  生成配图、配音、底乐和时间轴
scripts/render-explainer.mjs 渲染成片或单帧，并把响度统一到约 -15 LUFS
scripts/run.ps1              Windows 辅助脚本（项目放在 FAT32/移动盘时使用）
src/ArticleExplainer.tsx     Remotion 合成组件：章节标题、原话卡片、进度条、字幕
src/Root.tsx                 注册合成（例如 AiEra11Rules）
```

## 环境准备

- Node.js 22+ 和 ffmpeg/ffprobe（需要在 PATH 里）
- 中文字体：组件按顺序使用 Noto Sans CJK SC、Source Han Sans SC、PingFang SC、Microsoft YaHei，系统里装有其中一个就行
- 密钥：把 `.env.example` 复制为 `.env` 再填写（`.env` 不会被提交）

| 变量 | 用途 |
| --- | --- |
| `OPENAI_API_KEY` / `OPENAI_BASE_URL` / `OPENAI_IMAGE_MODEL` | Images2 生图，默认 `gpt-image-2`，输出 1024×1536 |
| `DASHSCOPE_API_KEY` | 百炼 CosyVoice 配音，音色、语速等参数在 `explainers/<id>.json` 里配置 |

```bash
npm ci
```

## 制作一条新视频

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
   默认使用 Remotion 自带的 Chrome。如果下载不了，可以用 `REMOTION_BROWSER` 指定本机 Chrome 或 headless-shell。
6. **整理发布包**：在 `douyin/<id>/` 里补上 `cover.jpg`（可以用 `--still` 抽标题帧）、`subtitles.srt`、`README.md`（标题、正文、话题、来源）。

## 命令一览

```bash
npm run dev                # Remotion Studio 预览
npm run lint               # ESLint + TypeScript 检查
npm run explainer:build -- --id=<id>      # 生成配图 + 配音 + 时间轴
npm run explainer:render -- --composition=<Id> --out=douyin/<id>/video.mp4
```

### Windows / FAT32 磁盘

项目放在 FAT32 移动盘上时，`node_modules` 没法正常安装。这时用 `scripts/run.ps1`：它会把项目同步到 `%LOCALAPPDATA%\renwen-video-runtime`，在那里安装依赖并运行，渲染完成后把 `douyin/` 复制回项目。

```powershell
./scripts/run.ps1 -Mode preview
./scripts/run.ps1 -Mode lint
./scripts/run.ps1 -Mode render --composition=AiEra11Rules --out=douyin/ai-era-11-rules/video.mp4
```

`build-explainer.mjs` 只依赖 Node 内置模块和 ffmpeg，可以直接在项目目录运行。

## 版式与发布规范

- 画布 1080×1920、30fps，H.264 + AAC 192k，响度约 -15 LUFS
- 关键信息放在 y≈200–1450 之间，右侧留出约 150px，避开抖音底部文案区和右侧按钮
- 配图只用象征性插画，不生成真实人物肖像；画面里标注“AI 配图”，并署名原文作者
- 涉及投资、医疗等内容时，用 `disclaimer` 加上提示
- 成片控制在 100MB 以内（GitHub 单文件上限），3 分钟视频用 crf 22 大约 50MB
