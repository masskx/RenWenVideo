# RenWenVideo · 中式慢生活哲理视频工作台

基于 Remotion 的配置驱动短视频生产系统。目标平台：抖音（9:16 竖屏）。

## 快速开始

### 普通用户：单页预览

双击 `启动工作台.cmd`，或直接打开 `workbench.html`。页面不启动 Node 服务；点击“选择 out 文件夹”，选择当前项目的 `zen-video\out`，即可预览已有 MP4。也可以直接选择多个视频文件。

### 自动化/高级模式：服务版工作台

### 启动工作台

```powershell
npm run workbench
```

或双击 `启动工作台-服务版.cmd`。浏览器自动打开 `http://localhost:3210`。

### 工作台功能

- **视频列表**：查看所有视频配置、渲染状态、发布状态
- **编辑器**：修改标题、字幕文案、镜头时长
- **素材库**：浏览所有图片和视频素材
- **渲染**：一键触发正式渲染（1080×1920）或快速预览（720×1280）
- **发布追踪**：标记已发布到抖音的视频
- **使用指南**：内置操作说明和 API 文档

### Remotion Studio 预览

```powershell
npm run dev
```

F 盘是 FAT32 可移动磁盘，本项目启动脚本会把运行文件同步到 `%LOCALAPPDATA%/zen-video-runtime-20260912` 并在那里安装依赖、执行渲染，最后把成片复制回项目的 `out/`。

正式成片会保留在 `out/` 并纳入版本库；本机密钥、依赖目录、QA 截图、草稿/静音中间文件和字体文件不会上传。

## 命令一览

```powershell
npm run workbench    # 启动工作台 Web UI（端口 3210）
npm run dev          # Remotion Studio 预览
npm run check        # 验证所有配置
npm run render       # 渲染默认视频
npm run batch        # 批量渲染所有视频
npm run lint         # ESLint + TypeScript 检查
npm run generate:images2  # 用现有 Images2 链路批量生成图片
npm run generate:doubao   # 用豆包 Seedream 批量生成图片（当前仅作静帧备选）
npm run series:prepare    # 准备七主题 episode JSON 与 Images2 prompts
npm run series:images     # 按七主题批量调用 Images2（需要 OPENAI_API_KEY）
npm run series:tts        # 用统一哲理旁白声线生成七条配音
npm run music:plan        # 查看 MiniMax 纯音乐计划，不调用接口
npm run music:generate    # 调用 MiniMax 生成底乐并自动挂到七条视频
npm run video:prepare     # 导入已下载的 Gemini Omni 动态片段并更新镜头配置
npm run tts:plan          # 查看 TTS 计划，不调用接口
npm run tts:generate      # 生成百炼 CosyVoice 配音并适配成片时长
node scripts/generate-segmented-voice.mjs --episodes=slow-life --generate --apply  # 分句生成并回写字幕时间轴
```

## 提供商与密钥

项目将 Images2、豆包 Seedream、百炼 CosyVoice TTS 统一登记在 `config/providers.json`。本机凭据放在 `zen-video/.env`（已被 `.gitignore` 忽略），可以从 `.env.example` 复制模板。工作台的“生产中心”只显示提供商是否已配置，不显示密钥值。

生成图片时可以选择：

```powershell
./scripts/generate.ps1 -Provider images2 -PromptFile prompts/solitude.jsonl
./scripts/generate.ps1 -Provider doubao -PromptFile prompts/solitude.jsonl -Concurrency 2
node scripts/generate-voice.mjs --episode=slow-life
node scripts/generate-voice.mjs --episode=slow-life --generate
# 哲理旁白默认使用 longxiu_v3；试听候选可加 --suffix=xxx --no-update
node scripts/generate-voice.mjs --episode=slow-life --generate --voice=longsanshu_v3 --rate=0.92 --pitch=0.95 --suffix=longsanshu-sample --no-update
node scripts/generate-music.mjs --generate  # 需要 MINIMAX_API_KEY，默认生成纯音乐并挂载到七条 episode
```

也可以使用 MiniMax 在线音乐平台批量生成无水印 MP3。下载后放入 `public/audio/music/`，按 `config/music-library.json` 的文件名整理，再运行 `npm run series:prepare`。当前库按“沉静哲理、伤感后悔、孤独夜行、雨后回忆、温柔治愈、重新出发”六类情绪映射到七个固定主题；Remotion 会以低音量独立混入并在视频结尾前淡出，不会改写旁白。

默认跳过已有文件；确需覆盖时加 `-Force`。外部生成会消耗额度，应先用本地素材和提示词完成检查。

## 复刻规范

`config/replication-spec.json` 固化了参考视频的 1080×1920、25fps、837 帧、14 镜头切点、12 帧缓入缓出叠化、标题和字幕安全区。当前生产 profile 支持 Images2 静态图、百炼 Wan I2V 动态片段与 Gemini Omni 动态片段混合；动态片段下载后放入对应的 `public/video/` 目录，再用 `npm run video:prepare` 导入。配音通过百炼 CosyVoice 生成，MiniMax 纯音乐作为独立底乐轨道并自动压低、淡入淡出后裁到固定片长。动态片段原生声默认静音；只有雨、水、火等自然声镜头建议使用 `--audio=ambience`。`npm run check` 与正式渲染都会执行规范检查；偏离切点、镜头数量、画布或字幕布局时会直接报错，避免误把不符合参考结构的版本导出成片。

视频动态化策略见 `config/video-profile.json`：只优先把倒茶、火焰、锦鲤、流水、竹林和开场桥水等运动价值高的镜头交给 Gemini，其余镜头保留 Images2 静帧和 Remotion 慢推，控制额度并保留真实感。

## 新增一条视频

### 方式一：工作台 UI

1. 点击"新建视频"，输入标题（2～4字），选择模板
2. 在编辑器中修改字幕文案
3. 点击"保存并渲染"

### 方式二：手动复制 JSON

复制 `episodes/slow-life.json` 为新 JSON，设置唯一英文 `id`、中文 `title`。

### 方式三：API 调用（供 Skill 使用）

```bash
# 创建
curl -X POST http://localhost:3210/api/episodes \
  -H "Content-Type: application/json" \
  -d '{"title":"静心","template":"slow-life"}'

# 更新字幕
curl -X PUT http://localhost:3210/api/episodes/xxx \
  -H "Content-Type: application/json" \
  -d @episode.json

# 渲染
curl -X POST http://localhost:3210/api/render \
  -H "Content-Type: application/json" \
  -d '{"episodeId":"xxx","draft":false}'
```

完整 API 文档见 `workbench/API.md`。

## Episode 配置说明

- `shots[].start` / `duration`：帧为单位，镜头必须连续排列
- `shots[].src`：相对 `public/` 的素材路径
- `shots[].kind`：`image` 或 `video`；视频素材建议使用 `video/gemini-omni/<episode>/` 下的 9:16 无字幕片段
- `zoomFrom` / `zoomTo`：缩放倍数，建议 1.025～1.065
- `panX`：水平位移像素，建议 ±8
- `transitionFrames`：叠化帧数，默认 12（约 0.48 秒）
- `videoAudioMode`：`mute`、`ambience` 或 `keep`；episode 默认 `mute`
- `videoAudioVolume`：动态片段原生声混入音量，默认氛围声约 `0.08`
- `captions`：字幕数组，`startMs` / `endMs` 毫秒
- `subtitleY`：字幕中心纵向比例，默认 0.66
- `audioSrc`：旁白音频路径
- `musicId` / `musicSrc`：由 `config/music-library.json` 按主题自动选择的背景音乐

## 生图

实际已验证模型：`gpt-image-2`。七主题提示词由 `config/series-themes.json` 与 `scripts/create-series.mjs` 生成，分别位于 `prompts/listen-rain.jsonl` 等文件。

```powershell
$env:OPENAI_API_KEY = 'your-key'
./scripts/generate.ps1 -PromptFile prompts/solitude.jsonl -OutDir public/images -Concurrency 2
```

## 字体

从 Windows 字体目录复制了宋体（simsun.ttc）和楷体（simkai.ttf）到 `public/fonts/`。换机器后需准备合法字体文件。

## 后续计划

- [x] 工作台 Web UI
- [x] Episode CRUD API
- [x] 渲染触发与状态查询
- [x] 素材库浏览
- [x] 发布状态追踪
- [x] 百炼 CosyVoice TTS 配音接入
- [x] MiniMax 纯音乐独立音轨接入
- [x] 静态图片 + TTS 生产 profile
- [x] Gemini Omni 图生视频混合镜头支持（Chrome 会话生成，下载后导入）
- [x] Codex Skill 封装（七主题→Images2 生图→CosyVoice→配置→渲染）
- [ ] 自动发布平台接入

完整拆解见上级目录《视频拆解与批量制作方案.md》。
