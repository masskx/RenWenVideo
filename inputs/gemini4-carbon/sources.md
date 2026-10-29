# gemini4-carbon · sources（数字核对表）
抓取时间 2026-10-29 07:57–08:00（Asia/Taipei）。✅=一手原文一致；⚠️=有出入/需注意；🔸=仅二手

| 数字/说法 | 结果 | 一手来源 |
|---|---|---|
| AA Intelligence Index v5 第 1，59 分 | ✅ Google 博客 + AA 官方 10-28 文章都写 59、#1（Argon 50，+9） | https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-carbon/ ；https://artificialanalysis.ai/articles/gemini-4-carbon-new-number-1 |
| ⚠️ AA v5 那篇文章（10-27）本身**没有** Carbon | 那篇写的是 Claude Opus 5.5 以 58 分领先；Carbon 是 10-28 另一篇 AA 文章才列入。别说"AA v5 发布时 Carbon 就是第一" | https://artificialanalysis.ai/articles/artificial-analysis-intelligence-index-v5 |
| 第 2 名 Claude Opus 5.5 58，GPT-6 Astra 57 | ✅ AA 图表 + 博客表格 | 同上；assets/img/aa_carbon_01.png |
| SEC-bench Pro 88.2% | ✅ 博客正文 + 表格（Argon 83.4%，GPT-6 Astra 85.4%）；Google 自测，183 题 JS 引擎子集 | https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-carbon/ ；DeepMind 方法说明 PDF https://deepmind.google/models/evals-methodology/gemini-4-carbon |
| ExploitGym 54.8% | ✅ 但⚠️是 **10 小时**时限成绩；6 小时默认时限为 53.5%。Google 自测 | 博客图表 blog_gemini_4_carbon_exploitgym.png；方法 PDF |
| CWE-bench 71.0% | ✅ Collinear 官方公开榜单（Argon 68.0%，GPT-6 Astra 68.0%） | https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-carbon/ ；方法 PDF |
| "无护栏评测" | ✅ 博客原话 "evaluated without guardrails"；方法 PDF 对 ExploitGym 写 "mitigations off" | https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-carbon/ |
| 本周只给部分网安防御方 | ✅ "Starting this week… available to a subset of cyber defenders"，再通过 Fairwind Program 逐步扩给可信伙伴 | https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-carbon/ |
| 开发者/企业/普通用户"尽快" | ✅ "as soon as possible" / "soon"，**无具体日期** | https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-carbon/ |
| 定价 $2/$10 每百万 token | ⚠️ 博客说这是**首发优惠价**（introductory price，同 Argon）；AA 写标准价 $4/$20，现打 5 折、无确定结束日期。缓存输入 95% off | https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-carbon/ ；AA Carbon 文章 |
| WebDev Arena +89 elo，#4（1768） | ✅ 博客 | https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-carbon/ |
| Terminal-Bench 4.0 作弊成功率 0.0%，尝试 0.4% | ✅ 博客（Google 自报） | https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-carbon/ |
| Gray Swan 提示注入攻击成功率 0.0%（Argon 0.7%） | ✅ 博客（Google 自报；HN 有人质疑） | https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-carbon/ |
| Terminal-Bench 4.0 成绩 | ⚠️ 博客表格 65.2%，AA 文章写 64%（口径不同，别混用） | 两处 |
| AA 编程 Agent 指数 59，仅次 Claude Code+Opus 5.5（62） | ✅ AA | AA Carbon 文章 |
| AA 每任务成本 $7.76（按标准价） | ✅ AA | AA Carbon 文章 |
| 幻觉率 4%→11%（比 Argon 上升） | ✅ AA（可做反差点） | AA Carbon 文章 |
| HN 热度 | 760 points / 625 comments（2026-10-29 ~07:58 Asia/Taipei，HN API 实时；看板记的 736 已过时） | https://news.ycombinator.com/item?id=50276792 |
| X 官方帖热度 | Sundar 23.6k 赞/303 万曝光；GoogleDeepMind 10.6k 赞/79.6 万曝光（抓取时） | assets/text/x_official_posts.json |

二手来源：无（全部来自 Google/DeepMind/AA/HN/X 一手）。
