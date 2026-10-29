# REVIEW-DOUYIN · gemini4-carbon（小晚抖音素材）｜Eko 独立审 2026-10-29 08:1x（台北时间）

## 结论：通过（附剪辑注意事项，素材本身无需返工）

## 一、数字核对（10-29 本人重新抓取 Google 博客 + AA 10-28 文章）
| 说法 | 结果 | 依据 |
|---|---|---|
| AA 智能指数 v5 第 1，59 分 | ✅ | AA 10-28「Gemini 4 Carbon is the new #1…」；博客「ranks #1 … at 59」。Opus 5.5 58、GPT-6 Astra 57（博客表+aa_carbon_01）。10-27 的 v5 文章里没有 Carbon，别说「v5 一发布就是第一」 |
| SEC-bench Pro 88.2% / CWE-bench 71.0% | ✅ | 博客正文+总表；Google 自测，「evaluated without guardrails」 |
| ExploitGym 54.8%（10 小时）/ 53.5%（默认 6 小时） | ✅ | 博客 54.8%；方法说明 PDF 写明 6h 默认和 10h 放宽两种时限。视频若出 54.8% 要配字幕「放宽到 10 小时」 |
| $2/$10 首发价 → $4/$20 标准价 | ✅ | 博客「introductory price」+文末「After the introductory period expires… $4 / $20」；AA「50% launch discount, no confirmed end date」。**只说 $2/$10 不合格** |
| Terminal-Bench 4.0：Google 65.2% / AA 64% | ✅ | 博客总表「Terminal-Bench 4.0 (AA) 65.2%」；AA 文章 64%（排第二，Opus 5.5 第一）。二选一并注明出处，别混用 |
| 幻觉率 4%→11% | ✅ | AA：「hallucination rate rises from 4% to 11%」，但 AA 同句说仍是第二低（Opus/GPT-6 Astra 50%）。**不能讲成「幻觉暴涨、更不可靠」**，要带上「仍是第二低」 |
| 访问：本周只给一部分网安防御方 | ✅ | 「Starting this week… a subset of cyber defenders」，开发者/普通用户「as soon as possible」无日期 |
| 编程 Agent 指数 59 vs Opus 5.5 62 | ✅ | AA，可做「不是全面第一」的反差点 |

## 二、图片（逐张看过联系表 + 抽看原图）
- 全部是官方原图/AA 原图/X 官方帖原图/真实网页截图，无代码绘图、无 AI 图。✅
- 推荐用法：开场 x_Google_…jpg（2880×3840，天然 9:16）或 header（2200 宽，竖屏需上下留底/模糊延展）；钩子 aa_carbon_01（2360×1848，清晰，竖屏建议只裁上半「智能指数」图）；evals-table（1200 宽偏小，竖屏放大后可读但边缘略软，建议只裁 Cybersecurity 三行+AA Index 一行做局部特写）；四张基准柱图 1200×675 横版，竖屏放中间即可。
- screenshot_hn_50276792.png 文字太小，整张不可读：只适合 0.5 秒「HN 热议」闪过，或裁标题行放大。screenshot_blog_top 可用。
- aa_carbon_02–06 / aa_v5_* 是长图细节多，竖屏只适合局部裁切；dm_methodology_p-* 只做背景，**内容不要入画**（安全红线）。
- assets/ 根目录 01–04 是暴龙神公众号用图（与 img/ 内同源），不属于抖音包，不推送。

## 三、来源与红线
- 无百度来源（raw_aa_*.html 里出现的 "baidu" 只是 AA 榜单数据中百度模型的厂商字段，不是信息来源）。✅
- 无任何漏洞利用教程：素材只保留跑分与开放政策；ExploitGym 只讲分数，不讲做法。脚本里也不要展开「AI 怎么写 exploit」。✅
- 没有官方视频；aa_v5_banner.mp4 可做 1–2 秒转场。

## 四、剪辑注意（给写脚本/剪辑的人）
1. 价格必须写「首发价 $2/$10，之后 $4/$20」。
2. 54.8% 配「10 小时时限」；或改用 6 小时的 53.5%。
3. Terminal-Bench 只用一个数并标出处。
4. 幻觉率要带「仍是第二低」。
5. 「Google 不敢放出来」是解读，字幕写成「先只给网安防御方，普通人暂时用不上」，不说「不敢」「危险到封印」。
6. 跑分大多是 Google 自测，口播一句「Google 自己公布的成绩」。

## 五、AI 封面建议
不需要。官方竖版 X 图（x_Google_…jpg）本身就是 9:16 官方主视觉，加标题字即可当封面，比 AI 图更真实、无版权/误导风险。若要统一账号风格，可用 skill 生成一张「水晶+盾牌/锁」概念封面，但非必需。
