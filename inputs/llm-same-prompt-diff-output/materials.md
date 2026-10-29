# materials — 同一句话问 AI 两次，答案为啥不一样？（只素材，无脚本，无代码画图）

## A. 核心原文（TM 博客，逐字，全文见 assets/text/thinkingmachines-fulltext.txt，要点见 tm-key-passages-verbatim.txt）
- "asking ChatGPT the same question multiple times provides different results. This by itself is not surprising, since getting a result from a language model involves “sampling”…"
- "even when we adjust the temperature down to 0 … LLM APIs are still not deterministic in practice"
- 浮点不结合："(a + b) + c ≠ a + (b + c)" ；"The original sin: floating-point non-associativity"
- 关键反转："the primary reason nearly all LLM inference endpoints are nondeterministic is that the load (and thus batch-size) nondeterministically varies!"
- "our request’s output does depend on the parallel user requests. Not because we’re somehow leaking information across batches — instead, it’s because our forward pass lacks “batch invariance”"
- 实验数字见 sources.md（80/1000、78、第103 token、992 vs 8、开启后 1000 全一致）。

## B. 图片 assets/img/
- tm-*.svg（原图 13 张）+ 同名 .png（headless Chrome 直接渲染原 SVG 文件，未改动内容）：cover、deterministic、nondeterministic、matmul-01~03、rmsnorm-01~03、attention-01~04
- tm-blog-page-screenshot.png：原文页面真实截图（1080×1920）
- hf-greedy_search / sampling_search / sampling_search_with_temp / top_k_sampling / top_p_sampling.png：HF 官方教学图（温度/采样）。sampling_search_with_temp 最适合讲"温度"。
- ❌ NOT TO USE（不要使用）：aliyun-same-title-article-screenshot.png 及阿里云文章 https://developer.aliyun.com/article/1759731 —— 二手，原因解释与 TM 原文冲突
- zhihu-blocked-verification-wall.png：知乎访问被"进入知乎-开始验证"墙拦截的真实截图（仅留证，不当素材）

## C. 同问两次的真实输出 assets/text/same-prompt-3runs-pollinations.txt
- 免费无 key 接口 text.pollinations.ai（模型 gpt-oss-20b），同一 prompt 6 次 → **6 次完全一样**（疑似服务端缓存）。不能当"不同答案"素材；可作反例或弃用。

## C2. 真实用户提问：vLLM Discussion #17166（截图 2026-10-29 08:16 Asia/Taipei）
https://github.com/vllm-project/vllm/discussions/17166
- img/vllm-17166-title.png：标题 "Why temperature=0,top_p=1,seed=42 is still not enough to fix the llm's output!?"
- img/vllm-17166-question.png：提问正文，温度0+固定seed，换 serve/卡数/版本/GPU 仍不一致
- img/vllm-17166-reply-floating-point.png：网友回复，"(a+b)+c != a+(b+c)"、并行改变求和顺序
- img/vllm-17166-title-question-with-username.png：⚠️含用户名/头像，仅备用
- 逐字文本：text/vllm-17166-question-and-replies-verbatim.txt（其余回复含推广，不选用）

## D. Gaps
1. 知乎问题页/热榜 #27 截图：知乎验证墙（2026-10-29 08:05–08:11 多次尝试），问题 URL 也未搜到；未找到第三方热榜镜像截图。需人工手机截图。
2. "问两次答案不同"的真实截图/录屏：未拿到（无登录聊天产品、免费 API 被缓存）。建议飞龙/Eko 用 ChatGPT/豆包手机录屏同一问题两次；vLLM Discussion #17166 截图已补（见 C2），但那是工程师提问，不是聊天产品里同问两次的对比。
3. 无官方视频。
