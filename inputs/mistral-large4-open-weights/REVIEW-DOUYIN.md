# Eko 审：Mistral Large 4 开放权重 · 抖音素材（2026-10-30 08:50 台北时间）

**结论：通过**。page-* 六张截图不推（理由见下）；materials.md 里一处 AA 数字已核正。

## 来源与授权
- official-chart-01…09：headless 实拍官方公告页里的图表元素，不是重绘；按新闻引用处理，注明「来源：Mistral 官网」。每张都要上屏「官方自报」 ✅
- demo-*（3 张）：官方公告内嵌演示页（ml4-blog-widgets）的静帧。漏洞分诊那张只当画面，不讲流程 ✅
- x-mistralai 两张：@MistralAI 发布帖和回复帖的配图（像素猫 / ABSOLUTE CHONK 梗图），引用注明「来源：Mistral X」。梗图只适合当氛围镜头 ✅
- hn-thread.png：用户名已在 DOM 里换成 [user]，评论正文没改。已目检：标题行和评论行都显示 [user] ✅
- **page-hero / page-01…05：不推**。截图上都盖着 Google cookie 同意弹窗（「Decide how Google uses your data」），正文被挡；page-04 和 page-03 的 md5 完全一样，是重复文件。要用的话请重拍，先关掉弹窗。
- 公众号的三张 AI 图（01/02/03-*-AI.png）不进抖音、不推 ✅
- 代码画的图：无 ✅；引流、资料包、诱导评论：无 ✅

## 口径
- 所有分数都标「官方自报」，第三方榜单数字是 Mistral 转述 ✅
- 「开源第一」只限编码类；网安（DeepSeek-V4.1-Flash 57%、MiMo 56% 更高）、Finch、BrowseComp 都不是第一 ✅
- 参数只说「约 1 万亿」，因为激活参数 52B 和 49B 两种说法并存 ✅。materials 第一段的「A52B=约52B激活」以补充口径为准，不上屏。
- **AA 数字已亲自核实**（https://artificialanalysis.ai/models/comparisons/mistral-large-4-vs-glm-5-3-low，10-30 08:48 台北时间抓取）：
  - Mistral Large 4 (High) 的 Terminal-Bench 4.0 是 **25%**（GLM-5.3 Low 35%），FrontierCode 2.0 是 **15%**（GLM-5.3 Low 13%）。官方自报分别是 41% 和 19.7%，确实明显更低。
  - AA 智能指数 26 vs 23；输出速度 161 vs **74** token/s（materials 原来写 73，已改成 74）。
  - AA 列出的参数是 1.1T 总参、52B 激活，发布时间 2026-10。页面没注明测的是不是 10-29 版权重，所以差距原因只能说「设置或版本可能不同」，不要下结论。
  - 注意：在 AA 的实测里，Terminal-Bench 上 Mistral 落后于 **GLM-5.3 Low**（25 vs 35）。所以抖音不能说「Terminal-Bench 开源第一」而不加限定；要说也只能说「官方自报开源第一，第三方 AA 实测只有 25%，还低于 GLM-5.3」。

## 必改（剪辑时执行，不阻塞推送）
1. 跑分画面一律叠「官方自报」；只要出现 41% 或 19.7%，就同屏或紧接着给出「第三方 AA 实测 25% / 15%」。
2. page-* 不用，或者去掉 cookie 弹窗后重拍。
3. 不说「全面第一」「最强开源」，只说「编码类、官方自报」。
