# sources — openai-eth-false
时间均已标注；X 时间为 UTC 原值，括号内换算台北时间。

| 事实 | 值 | 来源 | 级别 |
|---|---|---|---|
| 公告日期 | 2026-10-26 | https://openai.com/index/building-scientific-understanding-with-academic-communities/ | 一手 |
| ETH 自然语言反证得出 | 2026-10-16 | OpenAI 页 | 一手 |
| ETH Lean 形式化 | 2026-10-17 | OpenAI 页 | 一手 |
| 论文日期 | 17 Oct 2026, revised 25 Oct 2026；67页；作者 OpenAI | https://github.com/openai/math/blob/main/preprints/The-Exponential-Time-Hypothesis-is-False-October-25-2026/paper.pdf | 一手 |
| 运行时间 | (n+m)^{O_k(1)} 2^{n/(log n)^{1/2+o(1)}}，多项式空间，确定性，精确计数 #k-SAT, k≥2 | 论文摘要 | 一手 |
| Lean 证明的界（较弱） | 2^{O_k(n(loglog n)^2/√log n)} | https://github.com/openai/math/blob/main/lean/docs/378.md | 一手 |
| ETH 用于"hundreds of papers" | OpenAI 原话；HN 有人估"thousands"（猜测） | OpenAI 页 / HN | 一手 / 评论 |
| 核查组 | Russell Impagliazzo (UCSD), Ramamohan Paturi (UCSD), Ryan Williams (MIT) | OpenAI 页；Williams X 1/4 | 一手 |
| ETH 提出者 | Impagliazzo, Paturi, Francis Zane | OpenAI 页；论文引用 [IP01, IPZ01] | 一手 |
| 非背书 | "should not be taken as certification of the claim" | 公开信 https://docs.google.com/document/d/1adB0IhJgLzsmbfCgoLrtoJTjnlPf74UnyjMo35P5JHo/edit | 一手 |
| 无NDA、无报酬、要求公开原始数据+会议，OpenAI 同意 | — | https://x.com/rrwilliams/status/2114833321675112826 , https://x.com/rrwilliams/status/2114833324107759983 ; OpenAI 页 | 一手 |
| Local smoothing 提出 | Sogge 1991 | OpenAI 页 | 一手 |
| 2D local smoothing | Guth, Wang, Zhang 2019 | OpenAI 页 | 一手 |
| 3D Kakeya | Wang & Zahl 2025 | OpenAI 页 | 一手 |
| AI 得 local smoothing 输出 / Lean | 2026-10-18 / 次日(10-19) | OpenAI 页 | 一手 |
| Local smoothing 论文 | 2026-10-25，59页 | https://github.com/openai/math/tree/main/preprints/Local-smoothing-for-the-Euclidean-wave-equation-October-25-2026 | 一手 |
| Yang–Mills 自然语言证明 / QCD | 2026-09-09 / 2026-09-18 | OpenAI 页 | 一手 |
| Yang–Mills Lean 形式化完成 | 2026-10-16 | OpenAI 页 | 一手 |
| 物理组 | David Gross（领衔）, Michael Douglas, Arthur Jaffe, Igor Klebanov, Nikita Nekrasov；AI原稿暂不公开 | OpenAI 页 | 一手 |
| Gross 诺奖 | 2004 物理 | OpenAI 页 | 一手 |
| Nekrasov Heineman 奖 | 2023 | OpenAI 页 | 一手 |
| Simons 基金会 | $5 million | OpenAI 页 | 一手 |
| 10-06 发布 722 篇数学论文 | 722 | TNW | **仅二手** |
| 9月不领 Navier-Stokes 奖 | — | TNW | **仅二手** |
| Leiden declaration（6月） | — | TNW | **仅二手** |
| "SETH 也为假" | 逻辑推论（ETH假⇒SETH假） | HN pavitheran | 评论，逻辑上正确 |
| "缺 mass gap" | 推测 | HN levocardia | **推测，勿当事实** |
| Bubeck 帖 | 2026-10-26 21:55 UTC（10-27 05:55 台北） | https://x.com/SebastienBubeck/status/2114838293330420187 | 一手（OpenAI 员工） |
| Williams 1/4 | 2026-10-26 21:35 UTC（10-27 05:35 台北）；1,216赞/140,611曝光（抓取时） | https://x.com/rrwilliams/status/2114833319431209352 | 一手 |
| Dan Roberts 发布帖 | 21:36 UTC；2,331赞 | https://x.com/danintheory/status/2114833682469122314 | 一手 |
| O'Donnell 纠偏 | 23:23 UTC | https://x.com/BooleanAnalysis/status/2114860617924243776 | 一手 |
| TNW | 2026-10-26 | https://thenextweb.com/news/openai-exponential-time-hypothesis-false-kakeya-yang-mills | 二手 |
| HN | 200分/76评（抓取于 10-27 07:2x 台北） | https://news.ycombinator.com/item?id=50251344 | 社区 |

X 用户名（仅记录，勿上屏）：rrwilliams, SebastienBubeck, danintheory, lreyzin, BooleanAnalysis, btaylor, FirstSquawk, chocockc, thefusioncube, cscec21, Dr_Singularity, WarisHymii。

## 红线/口径
- 说"OpenAI 声称/宣布"，不说"已被证明"；同行核查未完成。
- 三位学者是"组织独立核查"，**不是背书**。
- ETH 假 ≠ P=NP；算法超多项式，非实用加速。
- Yang–Mills 只是千禧年问题"一部分"，物理原稿未公开，不可说"拿下千禧年大奖"。
- Lean 已形式化的界比论文最紧的界弱。
