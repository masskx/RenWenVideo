# sources.md — weight-space-programming
凡博客数字：**作者自报 + 博客未同行评审**。截取时间未另注者均为整理当日 Asia/Taipei。

| 数字/事实 | 口径 | 来源 |
|---|---|---|
| 博客标题 Sparks of Weight-Space Programming；作者 Takehi*/Teoh*/Zhang/Khattab，MIT CSAIL；日期 2026-11-02 | 原文元数据 | https://rikiyat.github.io/blog/weight-space-programming/ ；本地 `assets/text/blog-en.txt`、`shot-blog-top.png` |
| 概念名 Weight-Space Programming | 作者命名 | 同上 TL;DR |
| 只看原始权重即可判断网络训练目标；无环境反馈写出小游戏网络，胜过 PPO 训练 100 million 步 | 作者自报，未同行评审 | 博客 TL;DR |
| Qwen3.5-0.8B：无梯度编辑 0.016% 权重（131,072 / ~0.8B）；MATH-500 7.9%→48.1%；IFEval 21.0%→62.3%（约 3×）；GSM8K 13.8%→67.1%；触顶率 93.0%→33.1%（50 次前向） | 作者自报，未同行评审；采样见博客（temp 0.6 等） | 博客 Experiment 8 / 表；`shot-blog-table-3.png`；HF 模型卡复述 |
| 循环定位：层 15 与 19 的 MLP 一个方向；各减 64 个 output columns | 作者自报 | 博客正文；`hf-model-readme.md` |
| 前 96 道练习中 85 道打到 32,768 token 上限 | 作者自报 | 博客 |
| Gemma 3 270M：同设定几乎无提升（Base 6.8；编辑后最高约 7.7；作者称增益未确立） | 作者自报；用于「修循环≠教会数学」 | 博客；`shot-blog-table-4.png` |
| Kinetix 小车：单次无工具编辑 3.5% 权重；1,024 局全部成功（自 0%） | 作者自报 | 博客；widget-1 / carjump |
| MinAtar：Astra 一局生成 vs PPO 100M/500M；Breakout 15.8 / 25.3 / **517.4**；Seaquest 5.6 / 88.9 / 53.1；Asterix 25.8 / 55.2 / 53.2 | 作者自报；「约 20×」仅对 Breakout vs 500M PPO | 博客；`shot-blog-table-2.png` |
| 读权重认游戏（如 Breakout 99% confident，17,253 weights，无工具） | 作者自报 + 博客交互演示 | 博客；`shot-blog-widget-9.png`；`assets/video/which_game-*.mp4` |
| HN 帖 id 50341174；截取时约 **1595** 分 / **511** 评（API 另见 1594） | **平台实时分**，非固定成绩 | https://news.ycombinator.com/item?id=50341174 ；`hn-50341174.json`；`hn-top-comments.txt` 文首 **2026-11-03 07:16 Asia/Taipei**；截图 `shot-hn-top.png` |
| HN 高赞澄清：更像修循环而非教会数学；Gemma 对照；读小网络 vs 改 Qwen 条件不同 | 社区评论，非作者结论 | `hn-top-comments.txt` Comment 2/3 等 |
| HF 编辑权重仓与 demo | 作者/合作方公开物 | https://huggingface.co/RikiyaT/Qwen3.5-0.8B-weight-space-programming ；Space demo（截图 `shot-hf-demo.png`） |
| HF 卡「独立重跑」MATH-500 **51.0%**（编辑后）、触顶 31.6%；基线 smoke 5.0%/触顶 95% | 作者侧公开 checkpoint 复现（akhaliq / ML Intern Jobs），**非**外部实验室盲测；与博客 48.1% 同方向 | `hf-model-readme.md` |
| 编辑 diff / 日志 | 作者 GitHub | https://github.com/RikiyaT/lm_understand-logs ；`shot-logs-repo.png` |

## 未使用
- 百度热搜：未使用。
- 任何引流、资料包、站外加微信话术：未写。
- 我方代码绘制的示意图：未制作（禁止）。
