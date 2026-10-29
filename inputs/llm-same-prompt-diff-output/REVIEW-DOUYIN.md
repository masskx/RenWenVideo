# REVIEW-DOUYIN · llm-same-prompt-diff-output（小晚抖音素材）｜Eko 独立审 2026-10-29 08:2x（台北时间）

## 结论：修改后通过。修改已由 Eko 在推送时完成（见第五节），可以进剪辑

## 一、数字核对（10-29 本人重新抓取 TM 原文 thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference/，Horace He，2025-09-10）
| 说法 | 结果 | 原文 |
|---|---|---|
| 温度 0 跑 1000 次，得到 80 种不同答案，最常见的一种出现 78 次 | ✅ | "sample 1000 completions at temperature 0 … 80 unique completions, with the most common of these occuring 78 times"。模型 Qwen3-235B-A22B-Instruct-2507，提示词 "Tell me about Richard Feynman" |
| 第 103 个 token 分叉：Queens 992 次，NYC 8 次 | ✅ | "identical for the first 102 tokens … 103rd token … 992 … 'Queens, New York' … 8 … 'New York City'" |
| 换成批不变内核后 1000 次完全一致 | ✅ | "when we enable our batch-invariant kernels, all of our 1000 completions are identical" |
| 主因是负载/batch size 变化 | ✅ | "the primary reason … is that the load (and thus batch-size) nondeterministically varies!" |
| 浮点求和打乱顺序 10000 次 → 102 种结果 | ✅ | 原文代码 range(10000)，输出 "There are 102 unique results" |
| 耗时 26s → 55s → 42s | ✅ | 性能表（Qwen-3-8B，单卡，1000 条，输出长 90–110） |
⚠️ 注意：
- 原文发表于 **2025-09**，不是新研究。现在的热度来自知乎，视频里别说"最新研究"。
- 80/1000 是 Qwen3-235B 在 TM 自建 vLLM 上的实验，不能说成"ChatGPT 问 1000 次有 80 种答案"。
- 26/55/42 是 Qwen-3-8B 的测试，模型和前面不一样，要分开讲。

## 二、HF 采样图版权 ❌ 不能用
- github.com/huggingface/blog 仓库**没有 LICENSE**（GitHub API license=null，/LICENSE 返回 404）。小晚说的 Apache-2.0 不成立，默认保留所有权利。
- 5 张 hf-*.png **不推送，视频里不用**。讲"温度/采样"可以用 TM 原文页面截图顶部的 token 概率图（tm-blog-page-screenshot，Liked 那段 72%/28% 的分叉）代替，或者用 skill 生成示意图（不能用代码画）。

## 三、图片（逐张看过）
- **tm-blog-page-screenshot.png**（1080×1920，原生 9:16，清晰）✅ 最佳开场图，顶部 token 概率分叉图正好讲"采样"。
- **tm-\*.png（13 张原文 SVG 渲染）**：小晚的 PNG 是按 SVG 原尺寸（约 600px）渲染后贴在 1600×900 白底的左上角，图只占画面约 1/4，竖屏放大就糊 ❌。**Eko 已用 headless Chrome 把原 SVG 按 4 倍重新渲染**（宽 1544–2400，内容占满画面，图形没改），已覆盖到 assets/img。这属于渲染原图，不算代码画图。最好用的是 tm-nondeterministic（User requests + Other user requests → Model → Output，正好讲"别人的请求影响你的答案"）和 tm-deterministic。matmul/rmsnorm/attention 太技术，只适合一闪而过。
- **vLLM #17166（3 张：title / question / reply-floating-point）** ✅ 真实 GitHub 页面。我用 GitHub API 核过：标题 "Why temperature=0,top_p=1,seed=42 is still not enough…"，2025-04-25 发布。图里没有头像和用户名，宽 710–1000，竖屏居中做卡片可读。**reply 只能当"社区网友的看法"**：它讲的是浮点、多卡并行、硬件和版本差异，没讲 TM 指出的 batch 主因。主结论只用 TM 的。
- **vllm-17166-title-question-with-username.png**（带用户名，标了不要用）→ 不推送。我没看到带广告的那张 reply，目录里也没有。
- **aliyun-same-title-article-screenshot.png** ❌ 只截到了没加载样式的导航栏，没截到正文，没有价值，不推送。按规则阿里云文章本来也不能当事实来源（它的"GPU 线程调度"说法正是 TM 反驳的观点）。
- **zhihu-blocked-verification-wall.png**：只是留证，不推送。

## 四、来源与红线
- 没有用百度 ✅；没有代码画图 ✅（SVG 是 TM 原图，只是重新渲染）。
- 阿里云文章只在 sources 里当"二手、不可信"记录，没当事实用 ✅。
- pollinations 同一问题跑 6 次结果完全一样（疑似服务端缓存），不能当"答案不同"的证据。可以弃用，或者当反例讲"有缓存时反而一样"。建议不用。

## 五、推送内容（Eko 处理后）
推送：materials.md、sources.md、本 REVIEW、TM 页面截图、13 张 tm 重新渲染的 PNG 和 SVG 原图、3 张 vLLM 截图，以及 text 下的 TM 全文、TM 要点和 TM 原网页。
不推送：hf-\*（没有授权）、aliyun 截图和 aliyun.html、zhihu 墙截图和 zhihu-hot.html、带用户名的 vLLM 图、pollinations 的 txt。

## 六、缺口（不影响通过）
- 知乎问题页截图：被验证墙挡住，需要飞龙用手机截。
- "同一个问题问两次答案不同"的真实录屏：建议飞龙用 ChatGPT 或豆包录一段，效果最好。
- 没有官方视频。

## 七、AI 封面
建议生成一张（用 skill，不能用代码画）：同一个问题气泡分出两个不同的回答气泡。TM 的图都是横版技术图，没有合适的竖版封面。
