# huashu-motion：一句话，让 AI 给你的产品拍发布片

- 成片：`video.mp4`（1080×1920，30 fps，H.264 + AAC，54.2 秒，约 −15 LUFS，21 MB）
- 封面：`cover.jpg`（3:4，小红书：四宫格）、`cover-6x7.jpg`（6:7，视频号：77.0 跑分画面）、`cover-9x16.jpg`
- 字幕：`subtitles.srt`；审片静帧：`still-00s.jpg`、`still-01s.jpg`、`still-03s.jpg`、`still-22s.jpg`（按 C 改）、`still-33s.jpg`（安装命令）、`still-52s.jpg`（结尾）
- 配音：本人复刻音色（豆包语音）
- ⚠️ 发抖音时勾选「内容由AI生成」（片中演示片都是 AI / 代码生成的）

## 抖音（主发）

**标题 / 文案**：这支DeepSeek发布片不是官方做的，是AI写代码拍的。开源skill huashu-motion，装进Claude Code说一句就出片，安装命令在视频里，截图就能用。#AI工具 #ClaudeCode #AI视频 #DeepSeek #独立开发

（发布时勾选「内容由AI生成」。）

**置顶评论建议（可选，不放链接）**：安装命令：npx skills add alchaincyf/huashu-motion　需要 Node 22+、Chrome、FFmpeg，目前只在 macOS 实测过

## 视频号（可选）

**标题**：一句话，让AI给你的产品拍发布片

**文案**：开源skill huashu-motion：读产品、出三个方向、自己作曲配乐，还能指着画面改。适合做App、独立产品、开源项目的人。#AI工具 #ClaudeCode #AI视频

## 小红书（可选）

**标题**：AI给产品拍宣传片｜一句话出片

**正文**：

装进Claude Code / Codex的开源skill：huashu-motion 🎬
✅ 说一句「给我的产品做个30秒发布片」
✅ 先出3个方向让你挑，再写片、作曲、配音效
✅ 不满意按C点画面，只改那一处
📌 安装：npx skills add alchaincyf/huashu-motion
⚠️ 要Node 22+、Chrome、FFmpeg；目前只在macOS实测
#AI工具 #ClaudeCode #AI视频 #独立开发

## 素材说明（不上屏）

- 01–05、08 是开发者公开帖和 README 里的演示片，已去原声；片中只标「案例展示」，不出现开发者名字、账号、头像、卡通形象。01 自带的「Fan-made · 非 DeepSeek 官方」角标保留，「案例展示」放在它上方。
- 03 只用齿轮和写谱两段（避开开发者自己的付费 App 画面）；04 只用按 C、评论框和「指着画面改」卡，并裁掉编辑器顶栏（顶栏和终端里有 grok-bot 项目路径）。
- 「22 秒、不到半小时、¥1.95」为开发者自述，片中标「据开发者自述」。
- 安装命令、跟 agent 说的那句、ComfyUI 之类内容都是自做字卡；没有 GitHub 网址、二维码。
- 出处链接见 `inputs/huashu-motion-skill/README.md`，按要求不进视频和发布文案。
- 音效为仓库自带合成音效；底乐为脚本生成的电子垫音（不是脚本要的“punchy electronic”，有可商用的曲子可以替换）。

## 和脚本不一样的地方

- 时长 54.2 秒，略短于脚本的 55–60 秒目标（口播一字未删，按档位语速自然配出来就是这个长度）。
- 03 / 04 只用了部分片段（见上），原因是素材包说明里排除的内容出现在这两段的其他时间点。
