# 每一帧都是AI写代码画的——Opus 5.5 做视频教程

- 成片：`video.mp4`（1080×1920，30 fps，H.264 + AAC，2 分 51.6 秒，−15.1 LUFS，55 MB）
- 封面：`cover-9x16.jpg`（抖音 / 视频号全屏）、`cover.jpg`（3:4，小红书）、`cover-6x7.jpg`（6:7，信息流）；标题「没开剪辑软件 / 每帧都是代码画的」，辅助句「Opus 5.5 做视频 · 四步上手」
- 字幕：`subtitles.srt`；静帧 `still-XXs.jpg`、总览 `stills-sheet.jpg`、和最近几支并排 `compare.jpg`
- 分镜：`tutorials/vibe-opus-video-tutorial.storyboard.md`；事实和出处：`inputs/vibe-opus-video-tutorial/`（materials / sources / review）
- 检查：简报 + 导演十项过；复述检查过（1 %，每秒 2.1 个上屏字）；丰富度过（平均 46.4，0 段几乎不变）；封面过；lint 过；clutter 在片尾作品墙提醒“强调色多”，是 15 种风格作品本身的颜色；时长经用户同意超过 60 秒（`maxSeconds` 185）
- 配音：本人音色（MiniMax `MashuaiDouyin01`）。**发布时勾选「内容由AI生成」**
- 画面：创作者公开作品（静音，右下「作者｜案例展示」，不显示账号 handle）+ 代码绘制的窗口、终端、提示词文件、帧卡和扫描线；提示词文件里的「示意」内容、评分条的分数片中都标了「示意」
- 用户要求的委婉口径：不说“最强”“只能用 Opus”；“DeepSeek 这些模型也能写同样的代码……便宜很多，细节稍弱一点，还得自己挑错”，对比数字标「据作者自述」
- **不引流**：片中、封面和文案没有链接、二维码、仓库名口播、资料包、评论区关键词、主页；不提付费工具和花费截图

## 抖音

**标题**：每一帧都是AI写代码画的：Opus 5.5 做视频，四步上手+提示词三块

**文案**：#Vibe知识大赏 里那些好看的动画，很多不是“生成视频”，而是模型写代码：写一个网页，一帧一帧截图，再用 ffmpeg 拼成视频。四步上手：空文件夹里打开 Claude Code 选 Opus 5.5；装 Remotion 和官方技能；贴提示词、拖素材；等它渲染。提示词分三块：角色和标准、创意种子（只改这块）、风格招牌特征（别删），结尾加一句 Done means。第一版通常会翻车，让另一个 AI 每半秒截图打分，改两轮再做长片。DeepSeek 等模型也能写同样的代码，便宜很多，细节可能稍弱一些。

**话题**：#Vibe知识大赏 #AI做视频 #ClaudeCode #AI工具 #Remotion

## 视频号

**标题**：没开剪辑软件，这条视频每一帧都是 AI 写代码画的｜Opus 5.5 做视频四步上手

**文案**：抖音 #Vibe知识大赏 话题据报道播放已超 11.7 亿。很多爆款动画是这样做的：模型写网页、逐帧截图、ffmpeg 合成。Anthropic 9 月 22 日发布 Claude Opus 5.5（官方：大多数工作达到 Fable 5.1 水平、运行成本比 Opus 5 低 40%）；开发者 Vincent 用它一种风格一段提示词做了 15 种风格的短片并开源（MIT）；Claude 官方的 Claude Motion（团队版 beta）也说“没有任何视频模型，每一支都是代码”。片中讲：四步上手、提示词三块 + Done means、用第二个 AI 评审改两轮、我自己做片常用的四招，以及换别的模型怎么选。

**话题**：#Vibe知识大赏 #AI做视频 #AI工具

## 小红书

**标题**：Claude Opus 5.5 做视频教程｜Remotion + Claude Code 四步上手，提示词结构拆解

**正文**：

这条视频没开剪辑软件，每一帧都是 AI 写代码画的 🎬
原理：写一个网页 → 一帧一帧截图 → ffmpeg 拼成视频（不是“生成视频”）

🧰 四步上手
1️⃣ 空文件夹里打开 Claude Code，/model 选 Opus 5.5
2️⃣ npx create-video --yes --blank my-video，再 npx remotion skills add
3️⃣ 贴一段提示词，把素材拖进去，缺什么工具让它自己装
4️⃣ 等它渲染

✍️ 提示词三块
① 角色和标准：你是导演、动效师、工程师和音效师；像模板就算失败
② 创意种子：讲什么、配色、画面——只改这一块
③ 风格招牌特征：决定像不像这种风格，别删
➕ 结尾加一句 Done means，写清楚什么算完成

🔁 返工：另一个 AI 每 0.5 秒截一张图，按风格、惊艳、动效、排版、质感、声音、技术七项打分，低于 7.5 的照意见改（作者实测拼贴风 5.4 → 7.0）

🙋 我自己做片常用的四招：先写分镜表（一句一画）｜颜色从素材里取｜上屏字不复述口播｜配音逐字时间戳卡点

💡 DeepSeek 等模型也能写同样的代码，便宜很多，细节可能稍弱；预算紧先练手，交作品再换 Opus
建议：先挑一种风格，只做 10 秒，改两轮再做长片

#Vibe知识大赏 #AI做视频 #ClaudeCode #Opus5.5 #Remotion #AI工具 #AI教程

## 出处和素材（只写在这里，不上屏）

- Opus 5.5 发布、官方原话、$4 / $20、−40%：Anthropic https://www.anthropic.com/claude-opus-5-5 、https://www.anthropic.com/claude/opus（截图）
- Claude Motion：Claude 官方 X https://x.com/claudeai/status/2108271552991252810 、https://x.com/claudeai/status/2108271558170976743（官方发布片片段，静音）
- 15 种风格：开发者 Vincent（@VincentWei93）https://x.com/VincentWei93/status/2104957548797604116 ；开源项目 mg-styles-15（MIT）https://github.com/Vincentwei1021/mg-styles-15 ——合集片段与六支 10 秒成片（静音），星标数 2,065 为 2026-10-25 GitHub API 快照
- 一句话 15 秒片头：@TheViableEdge https://x.com/TheViableEdge/status/2104207707980869918（静音片段 + 原文提示词）
- 提示词三块、翻车案例、七项评分、5.4 → 6.1 → 7.0、“6 分剪映模板 / 8 分广告公司”：人人都是产品经理《这些动画，都是 AI 写代码画出来的：我实测了 4 种风格》（月鹿造物）https://www.woshipm.com/ai/6483631.html
- 「Done means」：@claudeskills101 https://x.com/claudeskills101/status/2107170129377427701
- 四步命令：Remotion 文档 https://www.remotion.dev/docs/ai/claude-code（截图）
- 话题播放 11.7 亿（据报道）：21 世纪经济报道 https://www.21jingji.com/article/20261022/herald/fd33d9fcf3cef29800ddd927d2ad46ef.html ；人人都是产品经理 https://www.woshipm.com/ai/6481514.html
- DeepSeek 同题对比（$6 / 约 20 分钟 vs $0.23 / 约 1 小时，“细节更好 / 接近但有几处错误”，作者自述）：Marcel（@marcthecreatorr）https://x.com/marcthecreatorr/status/2111427716142571554
- 本号作品片段：`douyin/kimi-k3-1-pro`、`douyin/agent-compute-hijack-v3`
- 字体思源黑体 / 霞鹜文楷（OFL）；音效见 `public/audio/sfx/CREDITS.json`；没有底乐
