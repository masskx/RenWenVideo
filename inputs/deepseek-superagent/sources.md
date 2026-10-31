# sources
- IT之家 10-31 Super-agent 设计探索 https://www.ithome.com/1/020/615.htm
- 原型 https://github.com/deepseek-ai/dsh-superagent-prototype （官方说明：验证路线，非正式产品）
- DSH releases https://github.com/deepseek-ai/deepseek-harness/releases （v0.2.2-alpha.2 10-28 subagent_oar）
- 实验数字：p50 12.4min/p95 15.7min vs 单Session p95 29.5min；合成负载，不衡量单任务能力

## 暴龙神核对（2026-11-01，公众号57）
一手：DeepSeek 原文《Super-agent 设计探索》公众号 mp.weixin.qq.com/s/zoS7GlReWPhfCjENGxXCdg（box 抓取被验证页挡，未直接读到）；全文转载 https://www.uied.cn/posts/922127（已读）；IT之家 https://www.ithome.com/1/020/615.htm（已读）
- 发布日 10-31；"非现有产品功能介绍" —— uied 原文开头 / IT之家
- 原型"Research prototype... not an official DeepSeek product"、MIT —— 仓库 README
- 一人同时跟进 3–5 个活跃 Session —— uied 原文第1节 / IT之家
- 四特征 连续/高效/主动/持久；五模块 —— uied / IT之家
- Router 不执行、可不配 Bash、轻量模型；Worker 用最强模型 —— uied 2.1/2.2
- 异步 ReAct start()/stop()，已实现未默认开启 —— IT之家
- BYOM、间歇在线设备、轻量 daemon —— uied 5.2 / IT之家
- Watchdog Session 定时消息驱动 —— uied 第6节
- 实验：~300 消息/~20 工作请求/4 方案/各 5 次；合成负载，编码工作用只耗时工具代替 —— uied 7.1 / IT之家
- p50 12.4min、p95 15.7min；中性提示单Session 5次0次调用Subagent，p95 29.5min；优先委派 5次4次委派 —— uied 7.1 / IT之家
- 去掉直通：Router 决定 +约30%，读缓存 token 2323万→3177万（约37%）—— uied 7.1
- Router 压测：~1→~40 条/分钟；batch 1.0→2.8；单次请求 2.5→3.9s；单决定分摊 6.4→1.6s —— uied 7.2 / IT之家
- 曲线图注"消息间隔与工作时长按 1/4 缩放" —— IT之家图注
- dsh-v0.2.2-alpha.2 发布 2026-10-28T02:50:54Z（台北 10-28 10:50）；实验性 subagent_oar 插件"将独立任务交给本机 Codex 或 Claude CLI"；实验性「变更请求与工作树」—— GitHub releases API
- 内部实例持续运行，参与复现修复/代码审查/Harness 迭代 —— uied 结语 / IT之家
配图：01–04 为 DeepSeek 原文图（经 IT之家 img.ithome.com 下载），00 封面与 05 为 GenerateImage AI 图

---
## 小晚补充（2026-11-01 00:30 Asia/Taipei 抓取）

### 一手原文
- 官方原文：《Super-agent 设计探索：迈向更自主的 Agent 系统》，微信公众号「DeepSeek Harness 团队」，作者署名「DeepSeek 产品部」，发布于 2026-10-31 20:29（页面所示）。https://mp.weixin.qq.com/s/zoS7GlReWPhfCjENGxXCdg （链接出处：linux.do 帖 https://linux.do/t/topic/3101782 ；原型 README 引用英文标题 *Exploring Super-agent Design: Towards a More Autonomous Agent System*）
  - 全文：assets/text/official-wechat-fulltext.txt；原始 HTML：assets/text/wechat-official.html
- 原型仓库 README：assets/text/prototype-README.md（https://github.com/deepseek-ai/dsh-superagent-prototype ）
- DSH dsh-v0.2.2-alpha.2 release notes：assets/text/dsh-v0.2.2-alpha.2-notes.md（https://github.com/deepseek-ai/deepseek-harness/releases/tag/dsh-v0.2.2-alpha.2 ，发布 2026-10-28T02:50:54Z = 10-28 10:50 台北）
- 二手：IT之家 问舟 2026-10-31 21:36 https://www.ithome.com/1/020/615.htm → assets/text/ithome-615-fulltext.txt

### 数字（全部出自官方原文，IT之家同引）
| 数字 | 出处 |
|---|---|
| 一个人通常只能同时跟进 3 到 5 个活跃 Session（「据我们观察」，非实验） | 官方原文 §1 |
| 实验：每次约 300 条消息、约 20 条工作请求、每方案 5 次；消息间隔与工作时长按 1/4 缩放，模型调用耗时为真实值 | 官方原文实验节 + 图 official-23 图注 |
| P50/P95（分钟）：Super-Agent 12.4/15.7；去掉直通 12.6/15.5；单Session+Subagent 中性提示 20.4/29.5；单Session+Subagent 提示优先委派 13.8/29.0 | 官方表 official-24 |
| 单次实验读缓存 Token：2323万 / 3177万 / 605万 / 1082万（同上顺序）——Super-agent 消耗更多缓存 token，IT之家未提 | 官方表 official-24 |
| Router 压测：Trigger 速率 ~1→~40 条/分；平均 batch 1.0→2.8；单次请求 2.5→3.9 秒；单决定分摊推理 6.4→1.6 秒 | 官方原文 + official-25 |
| 原型仓库 1.3k stars / 97 forks / 1 commit / MIT（截图时 2026-11-01 00:25 台北；API 读 1290 stars）；创建 2026-10-31T09:32Z（=17:32 台北） | GitHub API + repo 截图 |
| deepseek-harness 主仓库 MIT，267,292 stars（API，2026-11-01 00:25 台北） | https://api.github.com/repos/deepseek-ai/deepseek-harness |

### 授权/使用说明（逐素材）
- assets/img/official-*.png（14 张）：从官方公众号原文下载的原图（mmbiz.qpic.cn），版权归 DeepSeek；新闻报道引用、需标「图源：DeepSeek Harness 团队公众号」。_dup_jpg/ 为同图的 jpg 重复版本，不用。
- assets/img/ithome-0*.jpg（9 张）：IT之家转载的同一批官方图（带 IT之家处理），优先用 official-*，这批仅备份。
- assets/img/wechat-official-header.png：官方公众号页真实截图（无关注者信息）。
- assets/img/ithome-page-615.png：IT之家页面真实截图，版权 IT之家，仅作「媒体报道」画面。
- assets/img/repo-dsh-superagent-prototype.png：GitHub 真实页面截图（MIT 代码，截图属页面引用）。
- assets/img/release-dsh-v0.2.2-alpha.2.png：GitHub release 页真实截图；含 DSH 贡献者 GitHub handle（官方公开 release notes），如嫌杂可只取 subagent_oar 那一行区域。
- assets/img/x/x-post-*-匿名.png（4 张）：X 官方 embed 渲染截图，已模糊头像/用户名（含 teortaxes 帖中被引用者名）；版权归原作者，仅作「网友反应」引用。_raw_未匿名_勿用/、_media_转发官方图_勿用/ 不用。
  - 2116539453002899880（aigclink，45赞）https://x.com/aigclink/status/2116539453002899880
  - 2116541149443698968（shao__meng，22赞）https://x.com/shao__meng/status/2116541149443698968
  - 2116545243508039888（teortaxesTex，19赞，「DSH-Superagent is Phase 0」）https://x.com/teortaxesTex/status/2116545243508039888
  - 2116542467671756897（xueyu1125，11赞）https://x.com/xueyu1125/status/2116542467671756897
  - 赞数为 2026-11-01 00:26 台北 X API 读数。
- 中文媒体（文字，仅引用）：第一财经/财联社快讯（via 火星财经 https://news.marsbit.co/flash/20261031224304449579.html ）；PANews 转 IT之家；linux.do 帖。
- 视频：官方原文页面有一个 vid 标记（wx0clsqxat6lzly601），未能确认是正文视频，未下载；原文两张 IM/GitHub 演示为静态图。

## 更正（2026-11-01 暴龙神，据 Eko 审稿）
- 官方公众号原文 mp.weixin.qq.com/s/zoS7GlReWPhfCjENGxXCdg 已由 Eko 核对。上文「去掉直通 Router决定+约30%、读缓存token 2323万→3177万（约37%）」与「提示优先委派 5次4次」来源更正为：官方原文 7.1 节（uied 为转载）。
- 配图 05 已用 GenerateImage 重生成（汇报箭头指回总管，共享文件夹仅实线读写交接）。
