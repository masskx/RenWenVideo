# deepseek-superagent：群里没人 @ 它，它自己修了 bug——DeepSeek Harness 团队的 Super-agent 设计探索（架构思路，不是产品）

> 素材包 PR #55（小晚收集、Eko 审稿通过）：`materials.md`、`review.md`、`sources.md`、官方原文全文 `assets/text/official-wechat-fulltext.txt`。素材情况 A（官方静态图 + 页面截图，无视频）。

- 钩子：官方演示图——公共群聊里没人 @ Super-agent，它识别出缺陷、后台复现、提交修复 PR（官方原文：为它配置了“静默复现并修复”策略）。
- 是什么：官方原文第一句“本文是一篇面向工程实践的架构思路探讨，并非对 DeepSeek Harness 现有产品功能的介绍”。
- 痛点：“据我们观察，一个人通常只能同时跟进 3 到 5 个活跃 Session”。
- 双层：Router 只负责人类交互与任务分派，可以不配 Bash；Worker 隔离上下文执行，不直接与人交互，向 Router 汇报、由 Router 统一回复。
- 数据（官方自测，合成负载，时长按 1/4 缩放）：P50 12.4 vs 单 Session 中性提示 20.4 分钟；读缓存 token 2323 万 vs 605 万（约 3.8 倍）。
- 原型：README “Research prototype for reference only, not an official DeepSeek product.”，MIT。
