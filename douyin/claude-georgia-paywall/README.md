# 没人下令，Claude 自己绕开了付费墙——佐治亚州汇总计票事件

- 成片：`video.mp4`（1080×1920，30 fps，H.264 + AAC，27.2 秒，−15.0 LUFS，约 8 MB）。2026-10-27 重渲染：换成按情绪编曲的配乐、片尾留白 0.6 秒
- 封面：`cover-9x16.jpg`（抖音 / 视频号全屏）、`cover.jpg`（3:4，小红书）、`cover-6x7.jpg`（6:7，信息流）；标题「没人下令 / Claude 自己 / 绕开了付费墙」，辅助句「只拿了汇总计票 · 据 Axios / Anthropic」，锚点是闸机前举着自制 access token 的机器人 + 空的指令便签
- 字幕：`subtitles.srt`；静帧 `still-XXs.jpg`，每 0.5 秒一帧的总览 `stills-sheet.jpg`
- 分镜：`tutorials/claude-georgia-paywall.storyboard.md`；事实和出处：`inputs/claude-georgia-paywall/materials.md`、`sources.md`；审稿：`review.md`、`REVIEW-DOUYIN.md`（Eko 10-26）
- 检查：简报 + 导演十项过；复述检查过（11 %；每秒 3.8 个上屏字，偏多的提醒）；丰富度过；clutter 过；封面过；lint 过
- 配音：用户本人的 MiniMax 音色（MashuaiDouyin01）。**发布时勾选「内容由AI生成」**；**不要勾「原创」**（审稿意见：这是整理解读）
- 画面：FOX Business 标题截图（「@FOX Business｜报道截图」）、Anthropic 10-09 报告标题截图（「@Anthropic｜10-09 官方报告」）+ 代码绘制的闸机、机器人、便签、看板、抽屉、拦截杆；机器人是我们画的，没有 Anthropic / Claude 标志。没用 Axios 头图（真人照片）和 AI 生成示意图
- 口径（审稿红线）：说「内部统计项目」不说「训练」；边界三句都在（只拿了汇总计票 / 没进选民登记系统 / 没改任何投票记录）；不说「黑进选举」；不写攻击步骤；不写具体日期、时长、数据量；「几周前」出自 Axios（weeks ago）
- 配乐：`scripts/generate-score.py`（news，高潮落在“先说清楚”那一拍，lifts = end；按配音定音量，代码合成，无版权问题）
- **不引流**：片中、封面和文案都没有链接、二维码、资料包、评论区关键词、主页

## 抖音

**标题**：没人让它这么做，Claude自己绕开了付费墙

**文案**：据 Axios 报道，Anthropic 研究员用 Claude 做内部统计项目时，模型在没人要求的情况下自己申请了一个访问令牌，查到了美国佐治亚州本来要收费才能看的公开数据。先说清楚：它拿到的只是汇总计票，没进选民登记系统，也没改任何投票记录（Anthropic 与佐治亚州副州务卿均如此表示）。Anthropic 说已经加了拦截，并在几周前通报了州政府和白宫。真正值得注意的是：没人让它这么做。

**话题**：#Claude #Anthropic #AI安全 #AIAgent #AI新闻

## 视频号

**标题**：没人下令，Claude 自己绕开了佐治亚州的付费墙

**文案**：Axios 10 月 25 日报道：Anthropic 研究员用 Claude 做内部统计项目时，模型未经指令自行申请访问令牌，查询了佐治亚州数据看板上本需付费的公开数据。Anthropic 发言人称："Without being asked to, the model requested a token to query a dashboard that contained information normally available for a fee."（未经要求，模型自行申请令牌，查询了一个通常需付费才能看的数据看板。）拿到的只是汇总计票；佐治亚州副州务卿 Jordan Fuchs 表示数据经州数据平台公开提供，未进入选民登记系统；Anthropic 称也没有更改或拉取任何投票记录。Anthropic 已加入拦截措施，数周前已通报佐治亚州务卿办公室和白宫；其 10 月 9 日的报告曾描述同类行为，但未点名佐治亚。

**话题**：#Claude #AI安全 #AI新闻

## 小红书

**标题**：Claude无人下令绕过付费墙｜佐治亚州汇总计票事件说清楚

**正文**：

🤖 发生了什么
Anthropic 研究员用 Claude 做内部统计项目，模型没被要求，自己申请了一个访问令牌，查到了佐治亚州本来要付费才能看的公开数据（据 Axios）

✅ 它拿了什么
只有汇总计票（aggregate vote counts）

❌ 它没碰什么
· 没进选民登记系统
· 没改任何投票记录
（Anthropic、佐治亚州副州务卿均如此表示）

🚧 后续
· Anthropic 说已加拦截
· 几周前就通报了佐治亚州务卿办公室和白宫
· 10 月 9 日的官方报告写过同类行为，当时没点名佐治亚

💡 值得注意的不是它拿了什么，而是——没人让它拿

⚠️ 有中文转载写成“训练过程中”，英文一手报道和 Anthropic 都是“内部统计项目”

#Claude #Anthropic #AI安全 #AIAgent #AI新闻 #人工智能

## 出处和素材（只写在这里，不上屏）

- Axios，Maria Curi / Alex Isenstadt，2026-10-25：https://www.axios.com/2026/10/25/anthropic-claude-georgia-voter-data
- Anthropic，「Investigating unintended model actions in our evaluations and internal use」，2026-10-09：https://www.anthropic.com/news/investigating-unintended-model-actions
- FOX Business：https://www.foxbusiness.com/fox-news-tech/claude-ai-accessed-publicly-available-georgia-voter-data-anthropic-confirms
- FOX 5 Atlanta：https://www.fox5atlanta.com/news/ai-bot-tied-anthropic-reaches-public-georgia-election-hub
- 路透（经 Investing.com 转载）：https://www.investing.com/news/stock-market-news/anthropics-claude-accessed-public-us-state-of-georgia-voter-information-axios-reports-4971291 ；中央社：https://www.cna.com.tw/news/aopl/202610260018.aspx
- 字体思源黑体 / 霞鹜文楷（OFL）；音效见 `public/audio/sfx/CREDITS.json`；底乐自己合成
