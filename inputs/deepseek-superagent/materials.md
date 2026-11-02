# deepseek-superagent 抖音素材（小晚，只素材不写脚本）

## 一句话
DeepSeek Harness 团队 10-31 晚在公众号发《Super-agent 设计探索》：把 Agent 从「一个会话一个任务」变成常驻、跨渠道、并行干活的协作者；核心是 Router（对外沟通+派活）+ Worker（隔离会话并发执行）双层架构。附开源研究原型 dsh-superagent-prototype（MIT），官方明说**不是正式产品**。

## 已核实要点（官方原文 assets/text/official-wechat-fulltext.txt）
1. 痛点：单任务上限看模型，多任务上限看人的注意力；「据我们观察」一人只能同时跟进 3–5 个活跃 Session（观察，不是实验数据）。
2. 四特征：连续、高效、主动、持久。
3. 五模块：双层架构 / 事件驱动（Trigger、两级过滤、订阅直通、Inline & Spill、链式召回、投机执行）/ 面向人的交互（异步 ReAct：start()/stop()）/ 计算-状态-环境分离（BYOM，本机只跑轻量 daemon）/ Watchdog。
4. Router 不直接干活，甚至可以不带 Bash，可用较轻量模型；Worker 用最强模型、不直接回复用户。
5. 演示（官方静态图）：同一任务在 IM 群聊和 GitHub PR 之间连续推进；群聊里**没人 @** 它，也主动识别缺陷、提交修复 PR。
6. 实验（合成负载、简化环境，只评调度协作，不衡量单任务能力；时长按 1/4 缩放）：Super-agent P50/P95 = 12.4/15.7 分钟；单 Session+Subagent 中性提示 20.4/29.5；提示优先委派 13.8/29.0。
7. 代价：Super-agent 读缓存 token 2323 万，单 Session 中性提示仅 605 万（约 3.8 倍）——口播若讲「更快」，建议同时知道「更费 token」。
8. Router 压测：事件从 ~1 到 ~40 条/分，batch 1.0→2.8，分摊每个决定推理 6.4→1.6 秒。
9. 内部实例已持续运行（复现修 bug、回代码审查、迭代 DSH 自身）——这是官方自述，外部无法验证。
10. 异步任务机制已在 DSH 实现但**尚未默认开启**。
11. 未解决：Router 扩展、长程记忆、A2A、安全隐私（提示词注入、端侧凭据泄露、跨设备权限）。
12. 原型：1.3k stars / 97 forks / 仅 1 个 commit / MIT（截图 2026-11-01 00:25 台北）；README：研究原型、非正式产品，与内部版本和文章描述不完全一致，文中部分设计未实现；只监听 GitHub（可选飞书）。
13. DSH dsh-v0.2.2-alpha.2（10-28）新增实验性「subagent_oar 工具」插件：把独立任务交给本机 Codex 或 Claude CLI。与 Super-agent 文章是相邻动作，**官方没说二者是同一功能**，别画等号。

## 口径提醒 / IT之家 vs 官方
- 官方开头：「本文是一篇面向工程实践的架构思路探讨，**并非**对 DeepSeek Harness 现有产品功能的介绍」。IT之家标题「DeepSeek 提出 Super-agent 架构设计」没错，但正文没放这句免责；口播别说成「DeepSeek 发布新产品/新 Agent」。
- 发布方是「DeepSeek Harness 团队」公众号（署名 DeepSeek 产品部），不是 DeepSeek 主模型发布。
- IT之家只给了中性提示的 29.5，没提「提示优先委派」13.8/29.0（P50 已接近 Super-agent）和 token 代价；要比快慢请用官方表原图。
- 「对标 Cursor Projects / Claude」「Phase 0」「永远站在开源最前端」等都是网友观点，非官方。
- 推理/训练模型无关，别联想成新模型。
- 不涉及翻墙；GitHub/公众号都可直接访问。

## 可用素材清单
| 文件 | 用途 | 来源/授权 |
|---|---|---|
| img/official-07-双层架构Router+Worker.png | **核心图** | 官方原图 |
| img/official-05-整体系统架构.png | 整体架构 | 官方原图 |
| img/official-01-IM到GitHub连续推进.png | 演示：跨渠道 | 官方原图 |
| img/official-03-群聊无人@主动修复PR.png | 演示：主动修 bug（钩子） | 官方原图 |
| img/official-09/11/13/15/17/19/21 | 两级过滤/Thread/直通/召回/投机执行/异步ReAct/BYOM | 官方原图 |
| img/official-23-累计完成曲线.png、official-24-实验结果表.png、official-25-Router压力测试.png | 数据（带「官方自测·合成负载」角标） | 官方原图 |
| img/wechat-official-header.png | 官方原文标题页 | 真实截图 |
| img/repo-dsh-superagent-prototype.png | 仓库+「not an official DeepSeek product」 | 真实截图 |
| img/release-dsh-v0.2.2-alpha.2.png | subagent_oar | 真实截图 |
| img/ithome-page-615.png | 中文媒体报道画面 | 真实截图 |
| img/x/x-post-*-匿名.png（4） | 网友反应 | X embed 截图，已模糊用户名 |
| img/ithome-0*.jpg | 官方图的 IT之家转载版，备份 | IT之家 |
| text/* | 官方全文、IT之家全文、README、release notes | — |

不用：img/_dup_jpg/、img/x/_raw_未匿名_勿用/、img/x/_media_转发官方图_勿用/。

## 缺口
- 无视频：官方文章只有静态图；X 帖子也都是截图转发，没有演示视频。如需动态画面，只能对官方图做推拉（剪辑层面），或等飞龙手机录屏公众号原文滚动。
- 知乎（403）/微博（跳登录）不可达，未取到反应；中文媒体只有 IT之家、第一财经/财联社快讯、PANews（转 IT之家）、linux.do。
- X 热度一般：最高帖 45 赞；DeepSeek 官方 X 号本周没发相关帖。
