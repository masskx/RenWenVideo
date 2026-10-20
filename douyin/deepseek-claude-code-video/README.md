# deepseek-claude-code-video：DeepSeek 接入 Claude Code，一句话做出动画视频

- 成片：`video.mp4`（1080×1920，30 fps，H.264 + AAC，112.3 秒，−15.2 LUFS，38 MB）。时长按脚本要求放宽到约 2 分钟（脚本目标 115–125 秒，配音按原文合成后 112 秒）。
- 封面：`cover.jpg`（3:4，小红书）、`cover-6x7.jpg`（6:7，视频号 / 抖音）、`cover-9x16.jpg`——「不开 Claude 会员 / 一句话出动画」+ 案例 A 的 1,000,000 数字镜头
- 字幕：`subtitles.srt`；审片静帧：`still-00s.jpg`（钩子，第 0 帧就是数字镜头）、`still-01s.jpg`、`still-03s.jpg`（“出动画”琥珀底）、`still-08s.jpg`（四步搭好）、`still-16s.jpg` / `still-24s.jpg`（① 安装）、`still-30s.jpg`（② 拿 Key）、`still-40s.jpg` / `still-50s.jpg`（③ 环境变量 / export）、`still-56s.jpg`（④ 验证）、`still-66s.jpg`（一句话需求）、`still-76s.jpg`（案例展示）、`still-86s.jpg`（预览 → 改 → 导出）、`still-96s.jpg`（成本）、`still-106s.jpg` / `still-110s.jpg`（结尾），拼图 `stills-sheet.jpg`
- 配音：本人复刻音色（豆包语音），口播与脚本逐字一致
- 片中出现的 Key 只有 `sk-xxxx`；第二步平台卡、第四步验证卡是示意图，片中标「界面示意」。

## 抖音（主发）

**标题**：一分钱 Claude 会员不花，DeepSeek + Claude Code 一句话出动画

**文案**：DeepSeek V4.1 刚更新，很多人在用它接 Claude Code 做动画视频。四步搭好：装 Claude Code → 拿 DeepSeek API Key → 配环境变量 → 问一句验证接通。然后一句话需求，让它用 Remotion 写代码、出动画，预览、用中文改、导出 mp4。输出每百万 token 高峰 8 元、空闲 4 元，晚上和周末半价。效果比 Opus 差一点，胜在便宜。

**话题**：#DeepSeek #ClaudeCode #AI工具 #AI教程 #AI做视频 #Remotion #AI编程

## 视频号

**标题**：DeepSeek 接入 Claude Code，一句话做出动画视频｜四步搭好

**文案**：装 Claude Code、拿 API Key、配环境变量、验证接通，四步搭好。之后一句话需求就能让它写 Remotion 代码出动画，做一条视频通常几块钱。

**话题**：#DeepSeek #ClaudeCode #AI教程

## 小红书

**标题**：DeepSeek接入Claude Code教程｜一句话做动画视频，一条几块钱

**正文**：

不开 Claude 会员，也能用 Claude Code 做动画视频 🎬
1️⃣ 安装：PowerShell / 终端一行命令，claude --version 看到版本号就成功
2️⃣ 拿 Key：DeepSeek 开放平台充几块钱，创建 API Key（别发给任何人）
3️⃣ 配置：BASE_URL 填 DeepSeek 的 Anthropic 兼容接口，Token 填 Key，模型换成 deepseek-flash，[1m] = 100 万上下文，思考强度 max（Mac 用 export）
4️⃣ 验证：问它“你现在用的是什么模型”，回答里有 deepseek-flash 就通了
然后一句话：用 Remotion 新建项目，写清主题、风格、镜头数、字号 → studio 预览 → 中文改 → render 导出 mp4
💰 输出每百万 token 高峰 8 元 / 空闲 4 元，晚上、周末半价
效果比 Opus 差一点，但便宜
#DeepSeek #ClaudeCode #AI工具 #AI教程 #AI做视频 #Remotion

## 出处（不上屏、不进发布文案）

- 案例 A（DeepSeek 介绍动画，Claude Code + V4.1-Flash-1017 制作）：https://x.com/i/status/2111657889568117025
- 案例 B（V4.1 Flash 发布动画）：https://x.com/i/status/2111471505037222258
- 案例 C（竖屏讲解，V4.1-Flash-1017 + Claude Code 制作）：https://x.com/i/status/2111475912504189083
- 文档：https://api-docs.deepseek.com/guides/coding_agents · https://api-docs.deepseek.com/zh-cn/quick_start/pricing · https://code.claude.com/docs/en/setup
- 片中外部素材一律静音、左上角只标「案例展示」，不出现作者账号、头像（脚本合规要求）。

## 素材说明

- 卡片 01–07 来自素材包，片中以不小于 1:1 的比例显示（镜头推近到 1.2–1.3 倍跟着讲解走），从不缩小。07 的标题行在原图里超出卡片右边框，片中用同字号重画为「官方价 · 人民币 / 百万 tokens」。
- 案例素材都按脚本的入点 / 出点预先剪好，每段不超过 14 秒。结尾蒙太奇里案例 A 的「¥0.15」是原片自带画面，不是本片的价格说法。
- 音效为仓库自带合成音效；底乐为脚本生成的电子垫音，口播时压低约 18 dB。

## 和脚本不一样的地方

- 案例 A 的时间码按实际画面修正：脚本写的 6–12 秒是 Logo 白屏，数字镜头实际在 12–18 秒（12.0–12.4 秒仍是黑场，所以从 12.4 秒起用，保证第 0 帧就有数字）；场景 8 的“看见 / 把想法，交给它”实际在 30–44 秒。案例 B、C 与脚本一致。
- 字幕没有移到顶部：本片字幕固定在画面下方（y ≈ 1390），素材和卡片都在它上方，不会互相遮挡。
- 环境变量一镜按脚本框住四行 ANTHROPIC_*_MODEL；第五行 CLAUDE_CODE_SUBAGENT_MODEL 同样是 deepseek-flash，口播没提，片中可见。
