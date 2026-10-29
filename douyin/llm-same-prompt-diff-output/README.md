# 同一句话问AI一千遍，还是出了80种答案——温度调到 0 也会变的真正原因

- 成片：`video.mp4`（1080×1920，30 fps，H.264 + AAC，39.5 秒）
- 模板：`lemo/whiteboard`（白板讲解，lemo-opuscar；分镜里写了照搬了它哪些：一块有光泽的白板、按笔顺当面写出来、没有手、笔自己飘并带投影、磁铁是唯一能动的东西、橡皮擦倒带、墨水叠底和手抖、斜向反光、三种笔色各有一个意思、字幕是板上的米白标签）。模板改造：三种笔色换成原文图自己的颜色（墨黑 = 结构、TM 蓝 #009DE4 = 请求和批、TM 橙 #F78427 = 只给“分岔 / 不一样”），区域下面铺原文图的两种底色（淡黄 = 不确定、淡绿 = 确定）；原文的图和 vLLM 讨论截图用磁铁钉在板上；分岔画成一支笔在第 103 格分成两支、线的粗细按次数（992 / 8）；45 秒的快课，写字速度约模板的 2 倍；配乐用合成的 playful
- 封面：`cover-9x16.jpg`（抖音 / 视频号全屏）、`cover.jpg`（3:4，小红书）、`cover-6x7.jpg`（6:7，信息流）；标题「同一句话问AI一千遍 / 还是80种答案」，辅助句「温度关到 0 也没用」，锚点是白板上的提示词卡 + 扇形的回答线 + 圈起来的「80 种」
- 字幕：`subtitles.srt`；静帧 `still-XXs.jpg`，总览 `stills-sheet.jpg`
- 分镜：`tutorials/llm-same-prompt-diff-output.storyboard.md`；事实和出处：`inputs/llm-same-prompt-diff-output/sources.md`、`materials.md`、`transcript/`；审稿：`REVIEW-DOUYIN.md`（Eko 10-29）
- 配音：用户本人的 MiniMax 音色（MashuaiDouyin01，brisk 档 1.12）；配乐 `scripts/generate-score.py`（playful，高潮落在橡皮擦掉细枝、写下「1000 / 1000」那一拍，划掉“谁先算完”之前抽空一次，代码合成）。**发布时勾选「内容由AI生成」，不要勾「原创」**（解读 Thinking Machines 的文章，含原文图）
- 画面：全部代码画的白板 + 原文图 `tm-nondeterministic`（角标「原图：Thinking Machines」）+ vLLM Discussion #17166 的标题和提问截图（无头像、无用户名，角标「GitHub vLLM #17166 · 2025.04」）
- 口径（审稿红线，全部照办）：原文是 **2025 年 9 月** 的，不说“最新研究”（屏上写 2025.09）；1000 次 / 80 种是 Qwen3-235B 在 Thinking Machines 自己部署的 vLLM 上的实验，不说成 ChatGPT（屏上写 Qwen3-235B · 温度 0）；26 秒 → 42 秒是另一组测试（Qwen-3-8B），屏上写「另测 Qwen-3-8B · 单卡」；vLLM 帖子只当“网友也在问”，主结论只用原文的；不用 HF 采样图、阿里云文章、知乎截图、pollinations 测试
- **不引流**：片中、封面和文案都没有链接、二维码、资料包、评论区关键词、主页

## 抖音

**标题**：同一句话问AI一千遍，还是出了80种答案

**文案**：Thinking Machines 做过一个实验：同一句 “Tell me about Richard Feynman”，温度调到 0，让 Qwen3-235B 回答 1000 次，结果出了 80 种不同的答案。前 102 个词一模一样，到第 103 个分了岔：992 次说费曼生在纽约皇后区，8 次说纽约市。原因不是“GPU 谁先算完”，而是同一时刻别人也在问——服务器把很多人的请求拼成一批算，批的大小一变，加法的顺序就变，电脑里的小数换个顺序加，结果就差一点点。把计算改成“批多大都按同一个顺序”以后，1000 次完全一样，只是慢了一些。（原文 2025 年 9 月）

**话题**：#大模型 #AI科普 #人工智能 #ChatGPT #AI原理

## 视频号

**标题**：同一句话问AI一千遍，温度调到0，为什么还有80种答案？

**文案**：Thinking Machines Lab（Horace He）2025 年 9 月的文章《Defeating Nondeterminism in LLM Inference》：用 Qwen3-235B，温度 0，同一句提示词采样 1000 次，得到 80 种不同的结果，最常见的一种出现 78 次；前 102 个 token 完全相同，第 103 个分岔（992 次 “Queens, New York”，8 次 “New York City”）。文章认为，几乎所有推理服务不确定的主因是负载（也就是批大小）在变：计算没有做到“批不变”，同一个请求在不同大小的批里，加法顺序不同，而浮点数加法不满足结合律，比如 (0.1 + 1e20) − 1e20 = 0，0.1 + (1e20 − 1e20) = 0.1。换成批不变的内核后，1000 次结果完全一致；代价是更慢（另一组 Qwen-3-8B 测试：26 秒 → 42 秒）。

**话题**：#大模型 #AI科普 #人工智能

## 小红书

**标题**：AI同一个问题回答不一样？温度0也没用｜大模型推理不确定性的真正原因

**正文**：

🧪 一个实验（Thinking Machines，2025.09）
同一句 “Tell me about Richard Feynman”
温度 0，Qwen3-235B，跑 1000 次 → 80 种答案

🔀 分岔就在一个词
前 102 个词都一样
第 103 个：992 次 “Queens, New York” / 8 次 “New York City”

🙅 不是“GPU 谁先算完”
✅ 是同一时刻别人也在问
服务器把很多人的请求拼成一批算，批大小每次都不一样 → 加法顺序跟着变

🧮 小数换个顺序加，结果会变
(0.1 + 1e20) − 1e20 = 0
0.1 + (1e20 − 1e20) = 0.1

🔧 修法
改成“批多大都按同一个顺序算”：1000 次一模一样
代价：更慢（另测 Qwen-3-8B：26 秒 → 42 秒）

#大模型 #AI科普 #人工智能 #ChatGPT #AI原理 #程序员

## 出处和素材（只写在这里，不上屏）

- Thinking Machines Lab，Horace He《Defeating Nondeterminism in LLM Inference》（2025-09-10）：https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference/ （原文图 © Thinking Machines Lab，引用评论用途）
- vLLM Discussion #17166（2025-04-25）：https://github.com/vllm-project/vllm/discussions/17166 （截图不含头像和用户名）
- 字体：霞鹜文楷、思源宋体、思源黑体、IBM Plex Mono（OFL）；音效见 `public/audio/sfx/CREDITS.json`；配乐自己合成
