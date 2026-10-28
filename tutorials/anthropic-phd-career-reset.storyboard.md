# Anthropic 研究员给博士生的建议 · 分镜（模板：lemo/news-package）

> 用户 2026-10-28：用 `inputs/anthropic-phd-career-reset/`（PR #42，已在 main）做这支，先按情况优化脚本再做片，最后合并进 main；同日改要求：“以后先从模板库找最合适的模板，照它做”，并让这两支“题目不变，照这个做法重做”。第一版（白底年份尺 + 积木 + 小人）留在 git 历史里，这一版换成模板 `lemo/news-package`，口播和配音不变。
> 素材情况 B（讲者授权复用的幻灯 + 斯坦福 PAI26 录像的三段剪辑 + 视频帧）。事实来自 `materials.md` / `sources.md` / `transcript/key-segments-*.txt` / `asr_base.txt`。审稿（`REVIEW-DOUYIN.md`，Eko 10-27）照办：「一夜清零」「读博无意义」都不是原话，不出声、不上屏；writing is thinking 在 Q&A；10 million fold 是演讲原话（约 04:43），说「约」；2030×10000 是 Epoch 外推，不用；结尾纯内容、不引流。策划建议 30–40 秒、整体偏快：片长约 39.5 秒。
> 开头的调整（第一版就定了）：素材建议“前 2 秒算力冲击”，但算力是**理由**，那个研究生“信 AGI 三年就来、却按老路规划”才是**事**——hooks.md 第 5 种开法（一句原话 + 反转）；算力数字放第二场，第 10 秒左右说出。

## 简报

- 钩子台词：AGI 3年内就来。说完这句，这个博士生开始规划：读完博士、做博后、再申请教职。（hooks.md §一 第 5 种：一句原话 + 反转；原话来自讲者幻灯 "I think we're going to have AGI in 3 years. […] I'm planning to finish my PhD in 2 years, get a postdoc, and apply for faculty jobs after that."）
- 钩子画面：第 0 帧——news-package 的“冷开场在最大的图形上”：讲者录像压暗做底，引语卡 “I think we're going to have AGI in 3 years.” 的引号先落下、三行推上来，“3 years” 下划线扫过；说到“开始规划”，引语卡缩到上方，他的规划变成一份“节目单”三行翻进来：01 读完博士 / 02 做博后 / 03 申请教职。
- 核心看点：讲这件事的 Anthropic 研究员 Jascha Sohl-Dickstein（斯坦福 PAI26 演讲）说，过去十年训练最大模型的算力涨了约 1000 万倍；如果你真信 AGI 要来，就别假设现在的职业路径是稳定的——“稳妥的选项其实并不稳妥”，去做有意思的事；但写作别外包，因为写作就是思考。（“1000 万倍”在第 10 秒左右说出）
- 收藏点：不需要（知识快讯）
- 结尾台词：因为写作就是思考；把写作外包出去，你外包的是思考。（抖音技巧.md §三 第 3 种：一句翻转的判断；Q&A 原话上引语卡）
- 标题·视频号：Anthropic 研究员：信 AGI 三年就来，就别再按老路规划职业
- 标题·抖音：“AGI三年就来”，说完他规划了读博、博后、教职
- 标题·小红书：Anthropic研究员给博士生的职业建议｜AGI、读博、写作即思考

## 导演

- 模板：lemo/news-package（电视新闻包装）。为什么是它：这是一场演讲——一个人、他自己的话、一段录像、几张幻灯；news-package 的人物条、引语卡（官方原话 + 名字 / 场合 / 日期 + 关键词下划线）、节目单、翻牌板、规格卡、印章，正好把“谁说的、原话是什么、数字多大、判断是什么”分开放。照搬了：§1 一套包装贯穿（台标「AI 观点 · 斯坦福演讲」、下三分之一条整片不离场、换话题时竖向翻字 + 分类标签闪白：观点 / 人物 / 职业 / 风险 / 问答）；§3 部件（节目单三行翻入 + 扫光、引语卡、翻牌板“旧值 → 新值”、规格卡“同一把尺上的条”、印章 −6° 到 −10° 从 1.9 倍砸下 + 扩散圈，一个话题一个）；§3 转场（话题之间竖条擦除：强调色条 + 深色线 + 橙边；话题内部硬切）；§6 素材统一单色调（灰阶 + 淡暖）；§7 每张图都有日期眉题（等宽大写）、一屏一个事实；§8 声音（每行落下一声钟琴、翻牌咔哒、印章闷响、转折前一拍安静）；§12 开场变体“冷开场在最大的图形上”。不照搬：它的台标和片头动画、柠檬黄（换成讲者算力图的青）、片尾卡；它“不烧字幕”的规则——抖音静音看的人多，字幕保留成下三分之一条下面一条安静的字幕（`look.captions: "bar"`）。
- 点子：观众以为“相信 AI 要改变一切”和“按部就班规划人生”可以同时成立；讲者说，那是脑子的两半在各说各的——你真信，就该让另一半也信：稳的路不一定稳，但有一件事别交给 AI：写作，因为那就是思考。
- 对标：news-package 样片《本周 AI 四件事》（学：包装系统、引语卡、翻牌板、印章、竖条擦除；不拿：它的四条新闻结构、品牌板、柠檬黄）；caption-news 样片（学：数字先出；不拿：字幕卡——这支用安静的字幕条，两支片看起来不一样）。
- 结构候选：① 节目单式：先列“他讲了三件事”，逐条展开，最后打勾（模板 §12 第一种，太像 PPT 目录）；② 一条主稿：一句原话冷开场 → 人物条 + 算力数字 → 讲者原话 → 回到那份规划，盖章 → 规格卡讲风险 → 判断章 → 问答的一句话收尾（模板 §12 第二种“一条主稿”）；③ 倒计时：1000 万倍 → 10–20 年 → 3 年 → 1 件事（数字好看，但“那个研究生”的事被挤掉）。选 ②：节目单不当目录用，而是把“他的规划”本身做成节目单——开头翻进来，中段被 AGI 的虚线拦腰截断、盖章“可能不存在”。
- 风格：news-package 的系统 + 讲者幻灯的颜色。底 #121417（墨），卡片 #1B1E23，字 #F4F1E8（纸色）；强调色是算力图 2010–2025 那段线的青 #3A9AAD（AI 的新节奏：引语下划线、AGI 虚线、印章、标签）；第二色是 1950–2010 那段的橙 #D0705A（老节奏 = 他的规划：节目单的序号块、“稳妥”）。字：思源黑体 900、Barlow Condensed 800 / 600（引语、数字、英文）、IBM Plex Mono（眉题、日期）。录像统一灰阶 + 淡暖，压暗 55–72 % 垫引语卡；颗粒在合成时加。
- 底色：全片同一个墨色底（包装节目的“演播室”）；情绪靠录像亮 / 暗、印章、规格卡的灰显和青色点亮表达。
- 贯穿物件：那份“规划节目单”（01 读完博士 / 02 做博后 / 03 申请教职）——开头翻进来；中段回来，被「AGI · 3 YEARS」青色虚线拦在 01 和 02 之间，02、03 变灰、划掉、盖章；封面也是它。
- 招牌镜头：第 19.1–21 秒：节目单回到画面，青色虚线「AGI · 3 YEARS」横穿 01 和 02 之间，配乐停一拍，印章「可能不存在 MAY NOT EVEN EXIST」砸下，02、03 两行褪灰、被划掉。
- 第0帧：录像底 + 引语卡 “I think we're going to have AGI in 3 years.” + 台标。
- 高潮停留：印章落下后节目单停约 1.5 秒；片尾最后一句说完 0.5 秒结束。
- 配乐：news，120 BPM，climax = path（印章那一拍），lifts = safe、write；两次安静：path 场 3.15 秒（印章前一拍）、write 场 2.0 秒（“写作”之后、引语卡之前）。
- 和上一支不同：最近三支 openai-eth-false、anthropic-s1-ipo、claude-georgia-paywall，同批 ai-more-work-burnout（caption-news）。结构（一条主稿）、开场（冷开场引语卡）、招牌镜头（节目单被虚线截断 + 盖章）、镜头路线（录像 → 节目单 → 幻灯 + 翻牌 → 引语 → 节目单 → 规格卡 → 引语）、字幕（安静的字幕条）——五项不同。

## 镜头表

| 口播（一句） | 画面：具体东西 / 事件 | 景别 | 运镜 | reads | 上屏字（只放要“看”的） |
|---|---|---|---|---|---|
| AGI 3年内就来。 | 录像压暗，引语卡：引号先落、三行推上，“3 years.” 下划线 | 中 | 慢推 | 1. 一句原话 2. 3 年 | I think we're going to have AGI in 3 years.、A VERY CAPABLE GRAD STUDENT |
| 说完这句，这个博士生开始规划： | 引语卡缩到上方，眉题 HIS PLAN · A FEW MINUTES LATER | 全 | 静 | 1. 几分钟后 | HIS PLAN |
| 读完博士、做博后、再申请教职。 | 节目单三行依次翻进（各一声钟琴）+ 扫光 | 全 | 静 | 1. 规划很长 | 01 读完博士 IN 2 YEARS / 02 做博后 / 03 申请教职 |
| 讲这事的Anthropic研究员说： | 录像（灰阶）推近讲者；下三分之一条翻成「人物 PROFILE · Jascha Sohl-Dickstein · Anthropic」 | 中 | 推 | 1. 谁 | RESEARCHER · STANFORD PAI26 · JUNE 2026 |
| 十年里，最大模型的训练算力，涨了约1000万倍。 | 硬切：讲者幻灯的算力图；翻牌板从 1 一格格翻成 10,000,000 × | 全 | 慢推 | 1. 一千万倍 | 10,000,000 ×、SPEECH · 04:43、来源 讲者幻灯 |
| 他的意思是：脑子里一半信AGI要来， | 录像压暗，引语卡 "If you believe in one part of your brain …"，“one part” 下划线 | 中 | 慢推 | 1. 原话 | 原话、25:47 |
| 另一半也该信。 | 下划线扫过 "other parts of your brain." | 中 | 慢推 | 1. 另一半 | — |
| 十到二十年后，学者这份工作会很不一样； | 竖条擦除进新话题（职业 CAREER）；幻灯原文 "The job of an academic will be very different in 10–20 years." | 全 | 静 | 1. 10–20 年 | 原文 |
| 你现在走的路， | 节目单回来，青色虚线「AGI · 3 YEARS」横穿 01 和 02 之间 | 全 | 静 | 1. 3 年在这 | AGI · 3 YEARS |
| 可能根本不存在。 | 安静一拍，印章「可能不存在」砸下，02、03 褪灰、划掉（招牌） | 全 | 震 | 1. 后半段没了 | 可能不存在 MAY NOT EVEN EXIST |
| 更反直觉的是：稳妥的选项，其实并不稳妥。 | 竖条擦除（风险 RISK）；规格卡：稳妥（橙）/ 有意思（青）两组；「并不安全」印章落在稳妥的风险条上 | 全 | 静 | 1. 两条路 2. 稳的不稳 | 两条路、稳妥、有意思、并不安全、SCHEMATIC / 示意图 |
| 大变动来了，谁都躲不开那份风险； | 两组的“风险”条同时长到一样长（斜纹） | 全 | 静 | 1. 风险一样 | THERE IS AN UNAVOIDABLE BASELINE OF AGI RISK |
| 选稳的，只是放弃了上限。 | “上限”条：稳妥短、有意思长 | 全 | 静 | 1. 上限不一样 | 上限 UPSIDE |
| 所以他说：去做有意思的事，别只挑看起来安全的。 | 录像压暗，引语卡 "Do the interesting thing instead of the safe thing."；印章「上限最大的那条 BIGGEST UPSIDE」 | 中 | 慢推 | 1. 原话 2. 判断 | 原话、27:08 |
| 但有一件事，他劝你自己做：写作。 | 竖条擦除（问答 Q&A）；问答录像（灰阶），角标 Q&A · 40:45 | 中 | 推 | 1. 问答环节 | Q&A · 40:45 |
| 因为写作就是思考；把写作外包出去，你外包的是思考。 | 安静一拍后引语卡砸下："It's because writing is thinking. If you outsource your writing, you've outsourced your thinking."，两处下划线随口播扫过 | 中 | 慢推 | 1. 原话 | 原话 |

## 封面卡

- 模板：冲突型（conflict，封面.md）
- 封面标题：“AGI三年就来” / 他却规划读博、博后、教职
- 辅助句：Anthropic 研究员的斯坦福演讲
- 锚点：`phd.cover`——“AGI in 3 years.” + 规划节目单
- 颜色：字 #F4F1E8 / 底 #121417 / 强调 #3A9AAD（算力图的青）

## 素材和出处

- `public/images/tutorials/anthropic-phd-career-reset/compute-plot.jpg`（讲者 X 线程原图 `slide-compute-plot.jpg`，讲者授权复用 "Feel free to reuse them however you like."）→ who，来源标签「SPEAKER'S SLIDE · OUR WORLD IN DATA」。
- `public/video/anthropic-phd-career-reset/speaker.mp4`（`clip-writing-is-thinking.mp4` 约 30–55 秒：讲者在讲台上，静音）→ 全片录像底，角标「视频 @Stanford HAI｜案例展示」。
- 幻灯原文在代码里重排："I think we're going to have AGI in 3 years. […] finish my PhD in 2 years, get a postdoc, and apply for faculty jobs after that."、"The job of an academic will be very different in 10-20 years."、"There is an unavoidable baseline of AGI risk"、"Your current career trajectory may not even exist."、"Risk-reward career tradeoffs just sacrifice reward"。
- 演讲原话（ASR 时间）："about 10 million fold … in the last decade"（04:43）、"If you believe in like one part of your brain … you should also [believe it in other parts of your brain]"（25:47）、"the safe option is not actually the safe option"（26:40）、"Do the interesting thing instead of the safe thing"（27:08）、Q&A "writing is thinking … you've outsourced your thinking"（40:45）。
- 规格卡是示意（标 SCHEMATIC / 示意图）：讲者没给数值，只给“风险两边都有、稳的只放弃了上限”的判断。
- 不用：腾讯头图（AI 处理）、「一夜清零」「读博无意义」、2030×10000、METR 图。
- YouTube 链接、X 线程、腾讯报道写进发布包 README。
