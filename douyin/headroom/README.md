# Headroom：AI 读日志少烧 token

- 成片：`video.mp4`（1080×1920，30 fps，H.264 + AAC，52.5 秒，约 −15 LUFS）
- 封面：`cover.jpg`（3:4，小红书）、`cover-6x7.jpg`（6:7，视频号主页）、`cover-9x16.jpg`
- 字幕：`subtitles.srt`；审片静帧：`still-00s.jpg`、`still-01s.jpg`、`still-03s.jpg`、`still-33s.jpg`、`still-50s.jpg`
- 配音：本人复刻音色（豆包语音）

## 视频号

**标题**：AI 编程太费 token？这个开源工具先帮你压一遍

**描述**：用 Claude Code、Codex 跑长任务，日志和搜索结果最烧 token。Headroom 在发给模型前先在本机压缩，官方 4 个场景省 21%–57%。适合跑长任务的人，纯聊天基本省不了。

#AI工具 #ClaudeCode #AI编程 #开源 #token

## 抖音

**标题**：一万多 token 的日志压到一千二，报错还在

**描述**：Headroom：开源，一条命令接上 Claude Code，不用改代码。省多少看内容，官方数据 21%–57%。

#AI工具 #ClaudeCode #程序员 #AI编程 #开源项目

## 小红书

**标题**：Claude Code 省 token｜开源工具 Headroom 怎么用

**正文**：

① 它做什么：AI 读日志、搜索结果、JSON 之前，先在你电脑上压一遍
② 怎么用：装好后 headroom wrap claude，一条命令
③ 省多少：官方 4 个场景 21%–57%，排查故障最多
④ 谁别用：只聊天、写文章的基本省不下来

#ClaudeCode #AI工具推荐 #AI编程 #开源工具 #省token

## 出处与署名（只放在这里，视频里不出现链接）

- Headroom by headroomlabs-ai：https://github.com/headroomlabs-ai/headroom （Apache-2.0）
- 官方演示 GIF（HeadroomDemo-Fast.gif，片中只用了 `headroom wrap claude` 终端片段，静音）和 hero 配图均来自上面的 README
- 文档：https://docs.headroomlabs.ai/docs
- 所有数字都是项目自己的数据（README §Proof、demo 图注），不是独立测试；作者本人没有安装或实测
- 音效为仓库自带的合成音效（无第三方素材）；底乐为脚本生成

## 和脚本不一样的地方

- 钩子：README 的 demo GIF 里其实没有 10,144 → 1,260 的画面（这个数字只在图注里），所以钩子用代码画的日志示意，标「官方数据 · README」「示意」，没有用「官方演示」。GIF 的终端片段改放在“一条命令”那一段。
- github.com 在制作环境里打不开（403），没有仓库页和 README 截图；“开源 · GitHub 7.5 万+ ⭐”用信息卡呈现，星数来自脚本里 2026-10-19 核实的数据。
- 3:4 封面辅助句「关键报错还在 · 官方演示」改成「· 官方数据」，理由同上。
- 「10,144 → 1,260」整行 140 px 放不进 900 px 宽，改成 176 px 滚动计数 + 100 px 整行。
