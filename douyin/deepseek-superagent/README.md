# 群里没人 @ 它，它自己修了 bug——DeepSeek Harness 团队的 Super-agent 设计探索

- 成片：`video.mp4`（1080×1920，30 fps，H.264 + AAC，37.6 秒，约 −15 LUFS，8 MB）
- 模板：`lemo/living-screencast`（活的录屏）。照搬：界面用代码重画（群聊逐句转录自官方演示图）、窗口浮在壁纸上、蓝色像素精灵代表软件（Router）、新会话分屏分裂出 Worker 精灵（Cell division）、聚光暗角（原文第一句、实验表、README 第一句）、章节胶囊、底部磨砂字幕胶囊。模板改造：精灵和强调色用官方架构图的 DeepSeek 蓝 #2460EA；窗口里放进官方结果表和 README 截图当证据；借 lemo/dataviz 的同一把尺（12.4 vs 20.4 分钟、2323 万 vs 605 万 token）；合成 playful 配乐，高潮在 3.8×
- 账号主持人（IP 形象）出现在钩子、“是什么”、结尾三场
- 封面：`cover-9x16.jpg`、`cover.jpg`（3:4）、`cover-6x7.jpg`；标题「群里没人@它 / 它自己修了bug」，辅助句「DeepSeek Super-agent 设计探索（非正式产品）」
- 字幕 `subtitles.srt`；静帧 `still-XXs.jpg`、总览 `stills-sheet.jpg`
- 分镜：`tutorials/deepseek-superagent.storyboard.md`；素材和审稿：`inputs/deepseek-superagent/`（Eko 审稿通过）
- 配音：用户本人的 MiniMax 音色（MashuaiDouyin01，1.12 倍）
- 口径（审稿全部照办）：是“架构思路探讨 / 研究原型”，不是新产品（片中聚光原文第一句和 README 第一句）；“没人 @ 它”的修复来自官方配置的“静默复现并修复”策略（上屏注明）；“3 到 5 个会话”是官方观察、不是实验；实验是官方自测、合成负载、时长按 1/4 缩放、只评调度协作；快慢比的是 P50（12.4 vs 20.4，单 Session 中性提示），并且紧接着说 token 多用约 3.8 倍；不提 subagent_oar、不用网友观点和 X 截图
- **发布时勾选「内容由AI生成」，不要勾「原创」**（含官方图表和截图）
- **不引流**：没有链接、二维码、评论区关键词

## 抖音

**标题**：群里没人@它，它自己修了bug还提了PR

**文案**：DeepSeek Harness 团队发了一篇《Super-agent 设计探索》（官方说明：是架构思路探讨，不是产品介绍）。演示里，群里没人 @ 它，它自己识别出缺陷、后台复现、提交了修复 PR。思路是分两层：Router 只管沟通和派活，Worker 各开隔离会话干活、向 Router 汇报。官方自测（合成负载）中位数 12.4 分钟做完，单会话方案 20.4 分钟；但读缓存 token 用了 2323 万，约 3.8 倍。原型已开源，README 写明不是 DeepSeek 正式产品。

**话题**：#DeepSeek #AIAgent #AI编程 #智能体 #AI新闻

## 视频号

**标题**：群里没人 @ 它，它自己修了 bug：DeepSeek 的 Super-agent 设计探索

**文案**：10 月 31 日，DeepSeek Harness 团队发布《Super-agent 设计探索：迈向更自主的 Agent 系统》。文章开头写明，这是面向工程实践的架构思路探讨，并非现有产品功能介绍。他们观察到一个人通常只能同时跟进 3 到 5 个活跃会话，于是提出双层架构：常驻的 Router 承接所有沟通和派活、自己不执行任务；多个 Worker 在隔离的会话里并发干活，向 Router 汇报，由 Router 统一回复。官方初步实验（合成负载、时长按 1/4 缩放）里，Super-agent 任务完成时间中位数 12.4 分钟，单会话加子代理（中性提示）20.4 分钟；代价是读缓存 token 约为后者的 3.8 倍。研究原型以 MIT 开源，README 写明不是 DeepSeek 正式产品。

**话题**：#DeepSeek #AIAgent #智能体

## 小红书

**标题**：DeepSeek Super-agent 是什么｜Router + Worker 双层架构，快了但更费 token

**正文**：

🤖 演示：群里没人 @ 它，它自己发现 bug、后台复现、提了修复 PR（官方配置了“静默复现并修复”策略）
📄 是什么：DeepSeek Harness 团队的设计探索——架构思路，不是新产品
🧠 痛点：一个人同时只能盯 3–5 个会话（官方观察）
🏗 双层架构
· Router：只管沟通和派活，自己不干活（甚至可以不配 Bash）
· Worker：各开隔离会话干活，向 Router 汇报
📊 官方自测（合成负载）
· 中位数 12.4 分钟 vs 单会话 20.4 分钟
· 但读缓存 token 2323 万 vs 605 万，约 3.8 倍
🔓 原型 MIT 开源，README：不是 DeepSeek 正式产品

它省的是你的注意力，花的是更多 token。

#DeepSeek #AIAgent #智能体 #AI编程 #程序员 #AI工具

## 出处（只写在这里，不上屏）

- 官方原文：https://mp.weixin.qq.com/s/zoS7GlReWPhfCjENGxXCdg
- 原型仓库（MIT）：https://github.com/deepseek-ai/dsh-superagent-prototype
