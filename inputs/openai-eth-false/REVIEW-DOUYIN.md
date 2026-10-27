# Eko 审稿 — openai-eth-false 抖音素材（2026-10-27 台北时间）
结论：**通过（剔除 4 图后）**。纯内容 30–40s，无资料包/引流。

## 图片（保留 6 张，均为真实截图/PDF 原页渲染，无代码图）
| 文件 | 内容 | 来源 |
|---|---|---|
| eth_paper_p-01.png | ETH 论文首页（标题+摘要） | github.com/openai/math preprints/…ETH…/paper.pdf |
| eth_paper_p-02.png | 定理 1.1 页 | 同上 |
| shot_github_eth_folder.png | GitHub 论文目录截图 | github.com/openai/math |
| shot_github_lean_378.png | Lean 范围说明 | github.com/openai/math/blob/main/lean/docs/378.md |
| openai_page_social.png | OpenAI 官方题图 | openai.com/index/building-scientific-understanding-with-academic-communities/ |
| smoothing_paper_p-01.png | 同批 local smoothing 论文首页（仅一句带过用） | github.com/openai/math preprints/Local-smoothing… |
排除 4 张见 assets/img/_excluded/README.md（TNW/Unsplash 头图、3 张 X 帖图：授权无法确认）。无视频素材。

## 事实口径（已核 raw/）
1. 核查≠认证：公开信原文 raw/letter.txt "Our involvement should not be taken as certification of the claim." —— 一手，可直接引用（不再只是 TNW 转述）。
2. 算法 2^{n/(log n)^{1/2+o(1)}}：次指数但仍超多项式（HN krackers: not even quasipolynomial）。≠ P=NP，不代表 SAT 求解器实际变快（Williams："we don't know yet"）。
3. Lean（raw/lean_378.md）只验证较弱界 2^{O(n(loglog n)^2/√log n)}；论文更紧的界未全进 Lean。但较弱界本身也是次指数，足以反驳 ETH（若无误）。
4. 722 篇、Navier-Stokes 不领奖、莱顿宣言：仅 TNW 单一来源 → **抖音不用**。
5. 千禧年：只说"Yang–Mills 存在性属千禧年问题一部分，物理原稿未公开"，不说拿奖/解决。可不提。
6. 说「OpenAI 声称」，不说「已被证明」。

## 提出者口径（与公众号冲突，需注意）
- OpenAI 官网原文："Impagliazzo and Paturi, along with Francis Zane, are the original proposers"——官网**把 Zane 算进提出者**，并非只指二人。
- 公众号 50 号写法：二人 CCC'99 提出、JCSS 2001 期刊版；Zane 为稀疏化引理论文（IPZ01）合作者。这是按论文引用的学术口径，比官网窄，不算错，但与官网表述不一致。
- 抖音建议：只说「ETH 的提出者本人参与牵头核查」（Impagliazzo、Paturi 两人都在核查组，两种口径都成立），不点 Zane。
- 另：公开信原文已找到，公众号「据 TNW 转述」可升级为直引公开信（可选）。
