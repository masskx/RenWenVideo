# AI写的免费Photoshop，菜单全齐，能干活的只有45%——PhotoCraft

- 成片：`video.mp4`（1080×1920，30 fps，H.264 + AAC，43.5 秒）
- 模板：`lemo/blueprint`（晒图纸工程图，lemo-opuscar；照搬：全片一张晒图纸、蓝白两色、隐藏线 = 没做出来的、尺寸线和编号气球、图签当故事、FIG. 编号划掉改写当转场、剖切线、注释框式字幕、全片只用一次的非蓝色印章）。模板改造：纸的蓝换成素材里北斋《神奈川冲浪里》本身的普鲁士蓝（#14233B / #1C3762 / #25649E），线用浪里的纸色米白 #EEE8D1；借 opuscar98/70「蓝图显影成实景」——做好的部分显影成官方截图的真像素，没做好的留在线稿（线稿是从同一张截图算出来的，像素对齐）；章的颜色换成 README「early alpha」徽章的琥珀 #D69E2E；字体换成霞鹜文楷 + JetBrains Mono；配乐用合成的 wonder
- 封面：`cover-9x16.jpg`（抖音 / 视频号全屏）、`cover.jpg`（3:4，小红书）、`cover-6x7.jpg`（6:7）；标题「AI写的免费Photoshop / 能干活的只有45%」，辅助句「PhotoCraft · 路线图自评」
- 字幕：`subtitles.srt`；静帧 `still-XXs.jpg`，总览 `stills-sheet.jpg`；开工前的风格帧在 `plan/`
- 分镜：`tutorials/photocraft-ai-photoshop.storyboard.md`；事实和出处：`inputs/photocraft-ai-photoshop/idea.md`、`sources.md`
- 配音：用户本人的 MiniMax 音色（MashuaiDouyin01）；配乐 `scripts/generate-score.py`（wonder，高潮落在“只有45%”的尺寸线量完那一拍，前面抽空 0.4 秒）。**发布时勾选「内容由AI生成」，不要勾「原创」**（新闻整理解读，含官方截图）
- 画面：PhotoCraft 仓库里的官方截图（MIT / Apache-2.0；画面里的《神奈川冲浪里》是公有领域），标「@ArtCraft｜案例展示」；线稿版由它计算得出。没用 Adobe 或 ArtCraft 的 logo（ArtCraft 商标不在开源许可里）
- 口径：路线图的数字一律标「自评 / 估算」；“用 Claude Opus 5.5 写”是媒体报道，口播和上屏都带「据报道」；不说“Adobe 完了”“完全替代”“一个人几天写完”
- 机器检查：brief 过、echo 过（复述 8%）、richness 过（平均 16.0）、承接分 0.81（裸切 0）、冻结时间每 30 秒 4.0 秒（主要是设计好的停：45% 高潮、3/25 判决）
- **不引流**：片中、封面和文案都没有链接、二维码、资料包、评论区关键词、主页

## 抖音

**标题**：AI写的免费Photoshop，菜单全齐，能干活的只有45%

**文案**：开源项目 PhotoCraft 把 Photoshop 用 Rust 重写了一遍，免费、开源，GitHub 上 7.5 万星；据报道是用 Claude Opus 5.5 写的。菜单 628 个一个不少，但它自己的路线图写着：能真干活的只有约 45%——工具 68 个做了 56 个，面板 35 个做了 30 个，性能指标 25 项只达标 3 项，存的 PSD 还不能稳定被 Photoshop 打开，还有 953 个问题没关。想试可以装来玩，干活的文件先别换过去。

**话题**：#Photoshop #开源 #AI编程 #Claude #AI新闻

## 视频号

**标题**：用 AI 写的免费 Photoshop 火了，它自己说：能干活的只有 45%

**文案**：PhotoCraft 是一个开源的 Photoshop“净室”重写版，纯 Rust，MIT / Apache-2.0 双许可，免费，目前是早期 alpha；GitHub 7.5 万星（10 月 30 日）。媒体报道它是用 Claude Opus 5.5 写的。它自己的路线图（10 月 17 日，对照 Photoshop 2026）：菜单 628/628、工具 56/68、面板 30/35；“能真干活”约 45%（估算 40–50%）；性能指标 25 项达标 3 项；953 个未关问题；写出的 PSD 还不能稳定被 Photoshop 接受（自己存自己开，309 个测试文件里 307 个不变）；到测试版还要约 1,100–1,800 小时，按 Opus 5.5 智能体的工时估算。可以装来试，正式干活的文件先别迁移。

**话题**：#Photoshop #开源 #AI编程

## 小红书

**标题**：免费开源 Photoshop 平替 PhotoCraft｜AI 写的，路线图自评能干活 45%

**正文**：

🎨 PhotoCraft 是什么
Photoshop 的开源重写版，纯 Rust，免费，MIT / Apache-2.0
早期 alpha · GitHub 7.5 万星
据报道：用 Claude Opus 5.5 写的

📐 它自己的路线图（对照 Photoshop 2026）
菜单 628 / 628 ✅
工具 56 / 68
面板 30 / 35
能真干活：约 45%（自评，估算 40–50%）

⚠️ 还差在哪
性能指标 25 项只达标 3 项
存的 PSD，Photoshop 还不能稳定打开
953 个问题没关
到测试版：约 1,100–1,800 小时（按 AI 工时估算）

👉 想试可以装来玩，干活的文件先别换过去

#Photoshop #PS平替 #开源软件 #AI编程 #修图软件 #Claude

## 出处和素材（只写在这里，不上屏）

- PhotoCraft 仓库（README、ROADMAP.md，2026-10-17 版；截图 MIT / Apache-2.0）：https://github.com/storytold/photocraft
- 星数：GitHub 仓库页面，2026-10-30 查看（75.1k）
- “用 Claude Opus 5.5 写”的报道：https://pasqualepillitteri.it/en/news/21619/free-adobe-clones-artcraft-claude-opus-5-5 、https://www.phoronix.com/news/Photocraft-Filmcraft-AI
- 截图里的画：葛饰北斋《神奈川冲浪里》（约 1831，公有领域）
- 字体：思源黑体、霞鹜文楷、JetBrains Mono（OFL）；音效见 `public/audio/sfx/CREDITS.json`；配乐自己合成
