# sources — llm-same-prompt-diff-output（抓取于 2026-10-29 Asia/Taipei）

## 一手来源
1. Thinking Machines Lab, Horace He, "Defeating Nondeterminism in LLM Inference"（2025-09）
   https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference/
   页面版权 © Thinking Machines Lab；配图为原文 SVG，未标 CC 授权 → 当作引用/评论用途，片中注明出处。
2. Hugging Face Blog, Patrick von Platen, "How to generate text"（2020-03-01）
   https://huggingface.co/blog/how-to-generate ；图片目录 /blog/assets/02_how-to-generate/
   授权：HF blog 仓库（github.com/huggingface/blog）为 Apache-2.0（Eko 如需严格可再核）；片中注明出处。
3. SGLang 文档 Deterministic Inference（佐证）https://docs.sglang.io/docs/advanced_features/deterministic_inference
4. vLLM Discussion #17166（真实用户提问"temperature=0,top_p=1,seed=42 仍不一致"）https://github.com/vllm-project/vllm/discussions/17166

## 二手 / 中文
5. 阿里云开发者社区《同一个prompt重复多次输入进 LLM，为啥得到的输出都不一样？》https://developer.aliyun.com/article/1759731
   与知乎热榜问题同题；页面注明著作权归作者所有。⚠️ 文中"padding 零值扰动""固定 seed 可锁定大部分"等说法不在 TM 原文里，不当事实用；且它把原因归于"GPU 线程动态调度顺序"，正是 TM 原文**反驳**的"concurrency + floating point"假说。
6. 知乎问题：未能拿到 URL/截图（见 gaps）。

## 数字（全部来自来源 1，原文逐字）
| 数字 | 原文 |
|---|---|
| 1000 次、温度 0、80 种不同输出、最常见的出现 78 次 | "sample 1000 completions at temperature 0 with the prompt “Tell me about Richard Feynman” (non-thinking mode), generating 1000 tokens each. Surprisingly, we generate 80 unique completions, with the most common of these occuring 78 times." 模型 Qwen/Qwen3-235B-A22B-Instruct-2507 |
| 前 102 个 token 完全相同，第 103 个分叉 | "the completions are actually identical for the first 102 tokens! The first instance of diverging completions occurs at the 103rd token." |
| 992 vs 8 | "992 of the completions go on to generate “Queens, New York” whereas 8 of the completions generate “New York City”." |
| 开批不变内核后 1000 个全一致 | "when we enable our batch-invariant kernels, all of our 1000 completions are identical." |
| 性能代价 26s / 55s / 42s | 表格：vLLM default 26；Unoptimized Deterministic vLLM 55；+ Improved Attention Kernel 42（Qwen-3-8B，单卡，1000 条序列，输出长 90–110） |
| matmul 只慢约 20% | "we only lose about 20% performance compared to cuBLAS" |
| 浮点求和 10000 次 → 102 种结果 | 原文代码输出注释 "There are 102 unique results" |

## vLLM Discussion #17166 截图（抓取 2026-10-29 08:16 Asia/Taipei，headless Chrome 1000px 宽，仅裁剪）
URL: https://github.com/vllm-project/vllm/discussions/17166 （GitHub 公开讨论；内容版权归各发帖人，作引用用途）
- vllm-17166-title.png：标题 "Why temperature=0,top_p=1,seed=42 is still not enough to fix the llm's output!? #17166"（无头像/用户名）
- vllm-17166-question.png：提问正文（2025-04-25），Qwen2.5-14B-Instruct + vLLM，temperature=0,top_p=1,seed=42 仍因 serve/offline、卡数、vLLM 版本、H100/H200 而不同（无头像/用户名）
- vllm-17166-reply-floating-point.png：回复（"on Feb 23"，页面未显示年份）"Why identical params still vary"：浮点不结合、张量并行、硬件差异、vLLM 版本（无头像/用户名）
- vllm-17166-title-question-with-username.png：标题+提问整体，⚠️ 含发帖人用户名与头像，仅备用
- 文字：assets/text/vllm-17166-question-and-replies-verbatim.txt
注：回复是社区网友观点，非官方结论；动态批次是主因以 TM 原文为准（该帖回复未提 batch invariance 作为主因）。
