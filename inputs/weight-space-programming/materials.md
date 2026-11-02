# weight-space-programming 素材包（只放素材，不写脚本）
批准：2026-11-03 07:13 马飞龙（原话见 STATUS.txt：「批准做公众号和抖音」）｜平台：抖音 30–40s｜整理：小晚 2026-11-03 Asia/Taipei

## 一、定性（先看）
- 原文是 MIT CSAIL 四人博客（Rikiya Takehi*、Jayden Teoh*、Alex Zhang、Omar Khattab；*共同一作），标题 *Sparks of Weight-Space Programming*，日期 2026-11-02。**博客帖，不是同行评审论文**；文中数字一律按「作者自报 + 未同行评审」口径。
- 核心主张：前沿 LLM（文中写 GPT-6 Astra）可以**原生读写另一套神经网络权重**——不写训练循环、主要靠推理改权重。作者称之为 Weight-Space Programming（权重空间编程）。
- 最抓眼球的 Qwen 结果：**不要说成「教会 Qwen 数学」**。博客与 HN 澄清一致：基线 Qwen3.5-0.8B 在开思考采样时大量陷入思考循环（前 96 道练习里 85 道打到 32,768 token 上限）；Astra 在 Python 权重会话里用前向预算找到层 15/19 MLP 的一个方向并减去，改了 131,072 个权重（0.016%）。修的是「循环障碍」，不是从零注入数学能力。同一方法在几乎不循环的 Gemma 3 270M 上几乎抬不动 MATH-500（约 6.8→最高约 7.7，作者自报增益未确立）。
- HN 标题偏营销：*Astra can read and write weights to improve Qwen*。口播建议用「直接改权重 / 修循环」，避免「无训练教会数学」。
- 博客里「读权重」与「改 Qwen」实验条件不完全相同：小网络读/写多强调无工具、权重当文本；Qwen 实验给了作用于权重的 Python 内核 + 练习题前向预算（仍无梯度、无训练循环）。HN 有评论指出这两块不宜混成同一能力叙事。

## 二、文字原文（assets/text/）
- `blog-en.txt`：博客正文清洗版（英文，约 30k）。
- `blog-zh.txt`：DeepSeek 全文中译（`ds.py --caller 赛博小晚`）；关键数字已 spot-check（7.9%/48.1%/0.016%/3.5%/1,024/100 million/IFEval 等），「1024」在译文写作「1,024」。后半长表与脚注未逐句人工校对，口播只用摘要与表格数字。
- `blog-raw.html`：博客页原始 HTML。
- `hn-50341174.json`：HN 帖元数据（截取时 score≈1594–1595，comments=511）。
- `hn-top-comments.txt` / `.json`：15 条高信息量评论，用户名已替换为 `[user]`；文首标注截取时间 **2026-11-03 07:16 Asia/Taipei**。
- `hf-model-readme.md`：HF 模型卡 `RikiyaT/Qwen3.5-0.8B-weight-space-programming`（编辑后权重 + 独立重跑 MATH-500 **51.0%**，仍属作者侧复现，非正式第三方评测）。
- `hf-mlintern-readme.md`：相关 ML Intern / Space 说明。
- `traces/*.json`：作者公开日志仓摘要痕迹（exp1/3/4/5/8 等），备用核对，不直接上屏。

## 三、图片（assets/img/）
**博客原素材（优先）：**
- `blog-og-hero.png`：博客 OG/题图。
- `shot-blog-widget-1.png`：博客页「READ / FIX / IMPROVE」总览图（含读游戏、Kinetix 改车、Qwen 7.9→48.1 三栏）——**博客自带配图**，非我方代码画图。
- `shot-blog-widget-9.png`：交互演示「只看 17,253 个权重文字 → 认出 Breakout、99% confident」界面截图。
- `shot-blog-widget-2/5/7.png`：博客页其他交互/演示区块截图（备用）。
- `shot-blog-table-1.png`：读权重认训练语料/copying heads 与 ground truth 对照表。
- `shot-blog-table-2.png`：MinAtar 一局生成 vs PPO 100M/500M（Breakout Astra 517.4 等）。
- `shot-blog-table-3.png`：Qwen3.5-0.8B 编辑前后 MATH-500/GSM8K/IFEval/触顶率（50 次前向：7.9→48.1，IFEval 21.0→62.3）。
- `shot-blog-table-4.png`：Gemma 3 270M 几乎无提升对照表（口径用这个打脸「教会数学」）。
- `carjump_scene.png`：由博客 `carjump_scene.svg` 转出的 Kinetix 场景静帧（小车/坡道）。
- `which_game-*-frame.png`：四款「which game」GIF 静帧（Breakout/Pong/Pac-Man/Freeway），分辨率低，作角标尚可。

**真页面截图：**
- `shot-blog-top.png` / `shot-blog-full.png`：博客页顶栏+TL;DR / 全页长截。
- `shot-hn-top.png` / `shot-hn-full.png`：HN 帖顶栏与长截；**用户名已显示为 `[user]`**。分数以截取时页面为准（见 sources；API 约 1594–1595）。
- `shot-hf-model.png`：编辑后 Qwen 模型卡页（真实 HF UI，与选题直接相关）。
- `shot-hf-demo.png`：Space「base vs edited」对照演示页（左侧基线循环、右侧编辑后；文案含重跑 51.0%）。
- `shot-logs-repo.png`：作者日志仓 `RikiyaT/lm_understand-logs` 页面。

原 GIF/SVG 在 `img/orig/`。

## 四、视频（assets/video/，均 <30MB，无声）
均由博客 `which_game-*.gif` 转 mp4，约 15s/条：
- `which_game-breakout.mp4` / `pong` / `pacman` / `freeway`：读权重认游戏相关的博客演示动图。
- **缺：** Qwen base vs edited 实时对打录屏（HF Space 可互动，本轮未跑通出片）；Kinetix 小车成功滚动演示（只有静帧 SVG/PNG）；MinAtar 一局生成对打视频。

## 四附、与公众号素材的边界
- 同目录 `images/00～03`、`prompts/`、`59-新闻-权重空间编程.md` 为暴龙神公众号稿与 **AI 生成配图**，**抖音禁用**（流水线禁止代码/AI画图当素材）。
- 数字来源见本包 `sources.md`（抖音整理）；公众号侧另存 `sources-wechat.md`（暴龙神），勿混用 AI 配图。

## 五、排除（assets/_excluded/）
- `shot-blog-widget-3/4/6/8.png`：裁切失败或几乎空白，不可用。
- `shot-hf-space-mlintern-dup.png`：与 `shot-hf-demo.png` 字节级重复。
- `orig-gif/`：原始 GIF 备份。
- 未用：百度热搜；任何引流/资料包文案；我方代码绘制的示意图（未制作）。
- 禁用：`images/00-封面-AI.png`、`02-读写修三能力-AI.png`、`03-Qwen改权重-AI.png`（公众号 AI 图）。`01-博客hero-原图.png` 可与 `assets/img/blog-og-hero.png` 同源使用。

## 六、风险与口播红线
- **数字口径**：全部核心涨幅 = 作者博客自报；未同行评审。HF 卡上「独立重跑 51.0%」是作者侧 checkpoint 复现，可作「作者公开权重可复核」旁证，仍非外部实验室评测。
- **叙事**：优先「改了 0.016% 权重，把思考循环压下去」；辅以「读权重认游戏」「一局写出小游戏网络打过 PPO 100M」「Kinetix 改 3.5% 权重、1024 局全过」。避免「AI 不用训练就能教会大模型数学」。
- **模型名**：口播按博客写 GPT-6 Astra / Qwen3.5-0.8B / Gemma 3 270M；不要自行升格成「已发表论文结论」。
- **HN 分数**：平台实时分，须带截取时间；会变。
- 博客总览图（widget-1）含作者自制信息图元素，可用但需标「博客配图」。
