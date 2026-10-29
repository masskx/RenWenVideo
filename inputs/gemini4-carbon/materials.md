# gemini4-carbon 素材包（抖音 + 公众号复用）｜小晚 2026-10-29
只素材不写脚本。无任何代码绘制图。数字核对见 sources.md。

## 一、一手原文 assets/text/
- google_blog_fulltext.txt — Google 博客全文（Koray Kavukcuoglu，10-28）；raw_google_blog.html 原网页
- dm_evals_methodology_gemini-4-carbon.pdf + .txt — DeepMind 官方评测方法说明（**没找到独立 model card / 模型页**，/models/gemini/carbon 和 model-cards 均 404；博客链接的是 Gemini 4 安全报告 PDF https://storage.googleapis.com/deepmind-media/gemini/gemini_4_safety_report.pdf ，未下载）
- aa_v5_article.txt（10-27，v5 方法+榜单，当时 Opus 5.5 第一）、aa_gemini4carbon_article.txt（10-28，Carbon 新第一）
- hn_top_comments.txt — HN 前 15 条顶层评论原文（按页面排序），hn_item.json 实时分数
- x_official_posts.json — 8 条官方/高管帖原文和互动数

### HN 要点（原话见 hn_top_comments.txt）
- 质疑：只发跑分不放模型没意义（solarpunk_enthu）；Gemini App 里根本找不到 Argon/Carbon（827a、zarzavat）；命名混乱（MrOrelliOReilly、mattlondon）；提示注入 0.0% = "只补了已知漏洞"（orbital-decay）；卡在财报前两小时发布（cvladan）
- 肯定：Terminal-Bench 作弊率降到 0 是"让前沿模型可用的最重要一点"（eldenring）

### 官方原话可引用（英→中）
- "Carbon ranks #1 on the recently updated v5.0 of Artificial Analysis Intelligence Index at 59." — Carbon 在新版 AA 智能指数 v5 排第一，59 分。
- "Starting this week, we will make Carbon available to a subset of cyber defenders" — 本周起先开放给一部分网络安全防御方。
- Sundar："I did say we'd be releasing our models periodically…" — 我说过我们会定期发布模型。

## 二、图片 assets/img/（全为官方原图或真实网页截图）
- blog_gemini_carbon_102726_header.png — 官方头图（虹彩晶体+数字4），**最适合做封面/开场**
- blog_gemini_4_carbon__evals-table.png — 官方完整跑分表（1200 宽，官方只提供此尺寸）
- blog_..._secbench-pro / exploitgym / cwe-bench / grey_swan.png — 官方四张基准柱状图
- aa_carbon_01.png — AA 榜单柱图，Carbon 59 排第一+编程 Agent 指数（有紫色箭头，竖屏强钩子）；aa_carbon_02–06 其余 AA 图
- aa_v5_01–03.png — AA v5 文章原图
- x_GoogleDeepMind_…jpg（Sundar/Demis/Koray 帖同图）、x_Google_…jpg（竖版 2880×3840，适合 9:16）、x_OfficialLoganK_…jpg
- screenshot_hn_50276792.png、screenshot_blog_top.png — 无头浏览器真实网页截图
- dm_methodology_p-1…5.png — 官方方法 PDF 页面渲染

## 三、视频 assets/video/
- aa_v5_banner.mp4（3.4MB）— AA v5 官方横幅动画

## 缺口
- Google 博客**没有嵌入视频/YouTube**；官方 X 帖全是图片无视频。可用实拍视频缺失 → 建议用官方头图 + 跑分图做画面，或 Eko 决定是否 AI 生成封面一张（本次未生成）。
- 无独立 model card；无中文平台（抖音/微博/知乎/小红书）对应热点。
- 安全红线：只保留跑分和开放政策，方法 PDF 里的评测细节不要进视频。
