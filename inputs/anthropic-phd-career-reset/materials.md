# anthropic-phd-career-reset · 抖音素材包（仅素材，无脚本）

> 小晚 · 2026-10-27 · Eko 审稿 **通过**（见 `REVIEW-DOUYIN.md`）· **禁止代码绘图** · 本包不含 `full.mp4`

## 一句话
Anthropic 研究员 Jascha Sohl-Dickstein 在斯坦福 PAI26（2026-06，Paul Brest Hall）演讲《Advice for a (young) investigator in the first and last days of the Anthropocene》：算力约 10 年 ×1000 万、METR 任务时长指数涨、若认真相信 AGI 数年到来就不要仍按「博士→博后→教职」老剧本规划；Q&A 原话 **「writing is thinking」**（写作即思考）。

## 红线 / 措辞
| 说法 | 状态 |
|------|------|
| 「一夜清零」 | **媒体二次传播夸张标题，非原话**（STATUS 已注明）。本包腾讯文实际标题是「如果AGI三年内到来，读博士和终身教职规划还有意义吗？」；SMZDM/知乎等澄清「读博无意义」亦非原话。 |
| 「读博无意义」 | **非原话**。他批评的是：嘴上信 AGI 三年、几分钟后又按旧学术路径规划 → 信念与行动不一致。 |
| Writing is thinking | **有原话**，在 **Q&A**（非主讲幻灯片段），约 `40:45`。 |
| 过去十年训练算力 ~10 million fold | **有原话**，约 `04:43`。 |
| 2030 算力 ~10000× vs 2025 | 来自讲者 X 笔记 / Epoch 外推幻灯（主视频后段）；腾讯文有转述。抖音若用须标来源。 |

## 一手来源
1. **YouTube（斯坦福 PAI26 官方录像）**  
   https://www.youtube.com/watch?v=3LZN2UUxDos  
   时长约 **45:14**（2713.8s），720p60+opus。完整录像 `full.mp4`（~164MB）只留在本地，**不进本包**。
2. **讲者本人幻灯+讲稿笔记（X 线程，授权复用）**  
   https://x.com/jaschasd/status/1972360405885637021（2025-09-28）  
   原话：「Actual slides here. Feel free to reuse them however you like.」  
   Google Slides：https://docs.google.com/presentation/d/1qVFDW8qT4CC4E_2TSVevrDbZ_Z9Utu_I1z0-ISLwZts/edit?usp=sharing
3. **腾讯新闻（中文二次，2026-10-20）**  
   https://news.qq.com/rain/a/20261020A034MC00  
   含删减实录；配图注明「经由AI处理」。数字与英文主源交叉核对。
4. **会场**  
   PAI26 · 2026-06-10–12 · Stanford Paul Brest Hall（Munger Complex, 555 Salvatierra Walk）  
   https://datascience.stanford.edu/events/center-decoding-universe/c4du-annual-conference/2026-conference-physics-and-ai-pai26  
   https://hai.stanford.edu/events/conference-on-physics-and-ai-pai26

## 关键片段（时间戳 = 本地 ASR / 剪辑入点）

### A. 算力增长 · `clip-compute-10Mfold.mp4`
- **剪辑**：`04:07`–`06:12`（ss=247, t=125）
- **金句 EN（约 04:42）**：  
  > The compute used to train the biggest models has increased about **10 million fold** in the last decade.
- **中文**：过去十年，训练最大模型的算力大约增长了约 **1000 万倍**。
- 配套图：`img/frame-compute-slide.jpg`（现场屏）、`img/slide-compute-plot.jpg`（讲者 X 幻灯原图）

### B. 博士/职业规划 · `clip-phd-career-advice.mp4`
- **剪辑**：`25:25`–`27:15`（ss=1525, t=110）
- **金句 EN**：  
  > This talk was motivated by a conversation I had with a very capable grad student… they thought we were gonna have AGI in three years, and then a few minutes later… finish my PhD… get a postdoc… faculty jobs.  
  > If you believe in one part of your brain that this world-changing technology is coming, you should also believe [it] in other parts of your brain.  
  > …you should [not] be planning with an assumption that your current career path is a stable one.  
  > …the safe option is not actually the safe option… Do the interesting thing instead of the safe thing.
- **中文**：见 `transcript/key-segments-zh.txt`。
- 配套图：`img/frame-career-slide-speaker.jpg`、`img/slide-career-grad-student.jpg`

### C. 写作即思考（Q&A）· `clip-writing-is-thinking.mp4`
- **剪辑**：`40:05`–`41:00`（ss=2405, t=55）；金句约 **`40:45`**
- **金句 EN（verbatim-ish ASR）**：  
  > It's because like **writing is thinking** and if you outsource your writing then what you've actually done is you've **outsourced your thinking**.
- **中文（腾讯常用译）**：写作即思考。如果你将写作外包出去，你实际上也将思考外包了。
- 配套图：`img/frame-writing-qa.jpg`

全文时间轴 ASR：`transcript/asr_base.txt`（faster-whisper `base`，YouTube 自动字幕持续 429 故本地转写）。`asr_base.json` 未随包提交。

## 素材清单
### video/（三段均 <4MB；完整录像不进本包）
| 文件 | 大小 | 说明 |
|------|------|------|
| full.mp4 | — | **不在本包**。完整录像仅本地存档（~164MB），勿上传抖音、勿提交 |
| clip-compute-10Mfold.mp4 | ~3.0MB / 125s | 算力图 + 10 million fold（约 04:07–06:12） |
| clip-phd-career-advice.mp4 | ~3.0MB / 110s | 研究生对话 / 职业建议（约 25:25–27:15） |
| clip-writing-is-thinking.mp4 | ~3.8MB / 55s | Q&A writing is thinking（约 40:05–41:00） |

### img/（全部真实截图/网上原图；无代码绘制）
| 文件 | 来源 |
|------|------|
| frame-speaker-opening.jpg | 视频帧 · 讲者+Stanford HAI 会场 |
| frame-venue-wide.jpg | 视频帧 · 会场广角 |
| frame-title-gdp-slide.jpg | 视频帧 · 开场 GDP 幻灯 |
| frame-compute-slide.jpg | 视频帧 · 算力曲线屏显 |
| frame-metr-slide.jpg | 视频帧 · METR 任务时长 |
| frame-career-slide-speaker.jpg | 视频帧 · 职业建议段 |
| frame-writing-qa.jpg | 视频帧 · Q&A |
| slide-*.jpg/png | @jaschasd 线程原图（授权复用） |
| slides-preview.jpg | Google Slides 链接预览图 |
| jascha-sohl-dickstein-x-avatar-400.jpg | X 头像 |
| tencent-hero.jpg | 腾讯文头图（文中注明 AI 处理） |

### transcript/
| 文件 | 说明 |
|------|------|
| asr_base.txt | 全场英文 ASR（本包有；`.json` 未随包） |
| key-segments-en.txt / zh.txt | 三段金句 EN+ZH |
| tencent-article-zh.txt | 腾讯正文（本包有 `.txt`；`.html` 未随包） |
| audio16k.wav | ASR 中间件，**未随包提交** |
| pai26-event-page.html | 斯坦福活动页存档，**未随包提交** |

## 建议抖音用法（仅材料提示，非脚本）
- 前 2s：现场讲者帧或算力屏 + 「10 million fold / 1000万倍」数字冲击。
- 中段：研究生「三年 AGI → 仍规划博后教职」矛盾。
- 收束：writing is thinking（纯内容，无资料包/外链引流）。
- 避免用「一夜清零」「读博无意义」当钩子原话。

## 未做 / 缺口
- YouTube 官方自动字幕多次 HTTP 429，时间戳依赖本地 ASR（base 模型，有误听：如 METR→beta、AGI→GI）；成片口播以原视频为准。
- 未拿到独立高清 Paul Brest Hall 静物图（外链 403/HTML）；会场以视频帧为准。
- 腾讯页无完整浏览器整页截图；有 hero 图 + HTML/正文提取。
- **未写 script.md。** Eko 已通过（`REVIEW-DOUYIN.md`）。`full.mp4` 与 ASR 中间件不进本包。
