# 几百篇论文的前提，OpenAI 说被 AI 推翻了——ETH（指数时间假设）

- 成片：`video.mp4`（1080×1920，30 fps，H.264 + AAC，37.5 秒，−15.1 LUFS，约 6.5 MB）
- 封面：`cover-9x16.jpg`（抖音 / 视频号全屏）、`cover.jpg`（3:4，小红书）、`cover-6x7.jpg`（6:7，信息流）；标题「几百篇论文的前提 / OpenAI说被AI推翻了」，辅助句「不等于 P=NP · 核查还没完成」，锚点是裂开的 ETH 基石和上面的纸塔
- 字幕：`subtitles.srt`；静帧 `still-XXs.jpg`，每 0.5 秒一帧的总览 `stills-sheet.jpg`
- 分镜：`tutorials/openai-eth-false.storyboard.md`；事实和出处：`inputs/openai-eth-false/materials.md`、`sources.md`、`raw/letter.txt`；审稿：`REVIEW-DOUYIN.md`、`review.md`（Eko 10-27）
- 检查：简报 + 导演十项过；复述检查过（4 %；每秒 3.4 个上屏字，偏多的提醒）；丰富度过；封面过；lint 过；clutter 提醒算法一场同屏颜色多（OpenAI 题图的渐变是素材自带的颜色）
- 配音：用户本人的 MiniMax 音色（MashuaiDouyin01）；配乐 `scripts/generate-score.py`（news，高潮落在新曲线压下来那一拍，代码合成）。**发布时勾选「内容由AI生成」，不要勾「原创」**（整理解读）
- 画面：ETH 论文首页原文截图（「@OpenAI｜论文原文」）+ 代码画的纸塔、基石、曲线图（标「示意：形状对，刻度不精确」）、名片、公开信原句；颜色取自 OpenAI 题图（暖渐变 = OpenAI 的说法）、论文的黑白、GitHub 链接蓝（Lean）
- 口径（审稿红线）：一律“OpenAI 声称 / OpenAI 说”，不说“已被证明”；三位学者是组织独立核查，公开信原文写明 "should not be taken as certification"；≠ P=NP，实际软件会不会变快“还不知道”（据 Williams）；Lean 验证的是稍弱的界；不提 722 篇、Navier-Stokes、莱顿宣言（只有 TNW 一个来源）、千禧年问题；只说“ETH 的提出者本人”，不点 Zane
- **不引流**：片中、封面和文案都没有链接、二维码、资料包、评论区关键词、主页

## 抖音

**标题**：几百篇论文的前提，OpenAI说被AI推翻了

**文案**：OpenAI 10 月 26 日宣布，它的内部模型给出了一个 3-SAT 的次指数时间算法，推翻了计算机理论里的“指数时间假设”（ETH，不是以太坊），并用 Lean 做了机器验证。几百篇论文的结论以 ETH 为前提。但先别激动：这个算法仍比多项式慢得多，不等于 P=NP，实际软件会不会变快，核查人自己也说“还不知道”。带头核查的三位学者里就有 ETH 的提出者本人，他们在公开信里写明：参与核查，不等于认证。

**话题**：#OpenAI #AI新闻 #计算机科学 #算法 #人工智能

## 视频号

**标题**：OpenAI 称其 AI 推翻 ETH：几百篇论文的前提要变了？

**文案**：据 OpenAI 2026 年 10 月 26 日公告，其内部模型于 10 月 16 日给出“指数时间假设”（ETH）的反证、10 月 17 日完成 Lean 形式化：一个确定性算法，对任意 k-CNF 精确计数满足赋值，运行时间约为 2^{n/(log n)^{1/2+o(1)}}（多项式空间）。ETH 假设 3-SAT 在最坏情况下需要 2^{Ω(n)} 时间，被用于几百篇论文的条件下界。需要注意：新算法是次指数但仍超多项式，不等于 P=NP；Lean 验证的是比论文稍弱的界（仍足以反驳 ETH，若无误）；实际 SAT 求解会不会更快尚无结论。核查由 Russell Impagliazzo、Ramamohan Paturi（UC San Diego）和 Ryan Williams（MIT）牵头组织，三人在公开信中写道：“Our involvement should not be taken as certification of the claim.”

**话题**：#OpenAI #AI新闻 #计算机科学

## 小红书

**标题**：OpenAI称AI推翻指数时间假设ETH｜不等于P=NP，核查还没完成

**正文**：

🧱 ETH 是什么
指数时间假设：3-SAT 这类问题，最坏情况下不可能比指数时间快太多。几百篇论文的结论以它为前提。（不是以太坊😂）

🤖 OpenAI 说了什么
它的模型给出了一个更快的算法（次指数时间），推翻了 ETH，还用 Lean 做了机器验证（验证的是稍弱的界）

🧊 先别激动
· 仍比多项式慢得多
· 不等于 P=NP
· 实际软件会不会变快：核查人说“还不知道”

🔍 谁在核查
Impagliazzo、Paturi（ETH 的提出者）和 Williams 牵头组织独立核查
公开信原话：参与核查，不等于认证

📌 在核查完成之前，它还只是 OpenAI 的说法

#OpenAI #ETH #指数时间假设 #计算机科学 #算法 #AI新闻 #人工智能

## 出处和素材（只写在这里，不上屏）

- OpenAI 公告：https://openai.com/index/building-scientific-understanding-with-academic-communities/
- 论文与 Lean：https://github.com/openai/math （preprints/The-Exponential-Time-Hypothesis-is-False-October-25-2026/paper.pdf；lean/docs/378.md）
- 三人公开信：https://docs.google.com/document/d/1adB0IhJgLzsmbfCgoLrtoJTjnlPf74UnyjMo35P5JHo/edit
- Ryan Williams 帖子（"we don't know yet"）：https://x.com/rrwilliams/status/2114860103207911484
- 字体思源黑体 / 霞鹜文楷（OFL）；音效见 `public/audio/sfx/CREDITS.json`；配乐自己合成
