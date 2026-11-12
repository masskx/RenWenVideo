# 抖音素材交付：witten-credits-opus-55

采集时间：2026-11-12 10:01–10:11（台北时间）。只整理素材与证据，无脚本、无渲染、无 GitHub 操作。已核 board.csv 第168行与 STATUS 首行：马飞龙于 2026-11-12 09:59（台北时间）回复「1」批准。

成片只服务三件事：AI 具体建议了哪一步；威滕自己仍是作者；现在还不能拿去大规模计算。最终 30–40 秒，结尾纯内容，无站外引流、资料包或评论区领取；发布须勾选「内容由AI生成」。

## 原文与关键结论

论文：Edward Witten，*A Note On Lattice Definition of Gauge Theories With Chiral Fermions*，arXiv:2611.05051v1，[Submitted on 3 Nov 2026]（15:17:23 UTC = 2026-11-03 23:17:23 台北时间）。预印本，未见同行评议通过。完整 PDF、摘录与页码见 sources.md。

1. **AI 具体建议了哪一步（已核，印刷第29页／PDF 第30页）**  
   原话是 “Anthropic’s Claude Opus 5.5 suggested a likely variant…”。建议的是一种**光滑连续插值程序**：链变量的和乐与格点链变量精确相等，超立方体内的插值场只依赖该立方体边界上的链变量；做法是在解 Dirichlet 问题进入更高维之前，用映射 \(\Phi^*A\) 把场挤进格子内部。同页另写：Opus 5.5 also described a variant，归纳步骤用某种**线性插值**而不是解 Dirichlet 问题。不要把「建议了一种变体」说成「写出了整篇论文」或「解决了手征费米子问题」。

2. **威滕自己仍是作者（已核）**  
   作者栏只有 Edward Witten（IAS）。致谢原话：“Assistance on many details was provided by Claude Opus 5.5.”（印刷第32页／PDF 第33页）。Opus 5.5 **不是共同作者**。

3. **现在还不能拿去大规模计算（已核）**  
   摘要原话：this approach can be implemented on a computer in principle, but not in practice by Monte Carlo methods because the chiral fermion path integral is not positive.  
   第4节（印刷第31页／PDF 第32页）补充：即使无反常，也缺乏蒙特卡洛所需的正定性；用已知方法可能慢到不现实；只是原则上，若费米子积分能有效计算，则整个格点积分也能有效计算。不要写成「已经算出来」或「已经解决问题」。

4. **Hsu「同一变体」（已核，但要分清指什么）**  
   摘要 “The same variant was also proposed recently by Hsu.” 以及第1.2节 “as described independently of the present work by Hsu [17]”，指的是相对 Craig 的**总体进路**（可容许格点场 + 连续插值 + 直接使用连续手征费米子路径积分），**不是**第29页 Opus 5.5 建议的那种光滑／线性插值技巧。不能说「Hsu 也独立提出了 Opus 5.5 的那一步」。

## 素材清单与权利

下列时间均为 2026-11-12 台北时间获取。论文页截图是 pdftoppm 真实渲染 + 按文字坐标裁切，不是代码画的示意图或卡片。

### 建议优先给成片用的画面

| 文件 | 内容 | 出处 | 授权与使用 |
|---|---|---|---|
| `assets/img/crop-p01-author-block.png` | 作者栏：仅 Edward Witten / IAS | 论文 PDF 第1页渲染裁切 | 论文版权仍归作者；arXiv 非独占分发许可。仅作必要短引用，不可整页铺满 |
| `assets/img/crop-p01-title.png` | 论文题名 | 同上 | 同上 |
| `assets/img/crop-p01-abstract.png` 与 `crop-p01-abstract-variant-hsu-montecarlo.png` | 摘要中总体变体、Hsu、以及不能用蒙特卡洛的原话 | 同上 | 同上 |
| `assets/img/crop-p03-intro-hsu-paper.png` | 引言：Hsu [17] 在本文写作期间出现 | 印刷第2页／PDF 第3页 | 同上 |
| `assets/img/crop-p07-hsu-independently.png` | “independently of the present work by Hsu [17]” | 印刷第6页／PDF 第7页 | 同上 |
| `assets/img/crop-p30-opus-suggested-variant.png` 与 `crop-p30-opus-linear-interpolation.png`、`crop-p30-opus-both-variants.png` | Opus 5.5 建议的光滑插值及线性插值变体 | 印刷第29页／PDF 第30页 | 同上 |
| `assets/img/crop-p32-section4-montecarlo.png` | 第4节：无直接蒙特卡洛实现 | 印刷第31页／PDF 第32页 | 同上 |
| `assets/img/crop-p33-acknowledgements.png` | 致谢段含 Opus 5.5 | 印刷第32页／PDF 第33页 | 同上 |
| `assets/img/arxiv-abs-page-top.png`（整页另有 `arxiv-abs-page.png`、`arxiv-abs-page-v2.png`） | arXiv 摘要页真实网页截图：题名、唯一作者、提交日、v1、摘要原文、Comments「33 pp」 | https://arxiv.org/abs/2611.05051 ，10:09 左右 | 真实页面；本次 headless 截图样式偏素（CSS 未完全成形），但文字与官方 HTML 一致。页面本身可引用，不视为已获整页商用授权 |
| `assets/img/zhihu-crop-title-stats.png` 与 `zhihu-crop-question-header.png` | 知乎问题标题及当时显示的关注者 142、被浏览 137,568 | 自 10:09 真实整页裁切，已去掉弹窗、二维码和回答区 | 平台页面截图，仅作标题／热度线索展示；页面数字是当时显示值。成片勿留知乎水印式导流，也勿把话题卡「Claude 87% 知友推荐」写成论文事实 |
| `assets/img/witten-chalmers-portrait-pd.jpg` | 威滕近景，单人，无人脸干扰 | Wikimedia Commons File:Edward Witten.jpg；Ojan，2008-04-29，Chalmers 演讲 | **Public domain**，成片可用。建议注明摄影师 Ojan / Commons 来源 |
| `assets/img/witten-chalmers-blackboard-pd.jpg` | 威滕单人写板书（略有运动模糊） | Commons File:Witten Blackboard.jpg；同一作者与场合 | **Public domain**，成片可用 |

整页 PDF 渲染（备查，不一定上成片）：`arxiv-pdf-p01-…` 至 `arxiv-pdf-p33-…`。PDF 与全文在 `assets/text/`。

### 官方图标（文件已拿到，但不能默认上成片）

`assets/img/official-anthropic-logo-slate.png/.svg`、`official-anthropic-symbol-slate.png`、`official-claude-logo-slate.png/.svg`、`official-claude-spark-clay.png`、`official-claude-icon-rounded.png` 均复制自 Anthropic 官方 press kit（https://www.anthropic.com/press-kit ，10:03 下载，ZIP 存于 `assets/text/anthropic-official-press-kit.zip`），不是第三方重绘。

但官方《Anthropic Trademark Guidelines》（2024-08-01 生效）写明：商标只能在对方事先批准的材料中使用，且不得暗示赞助或背书。压缩包内无授权函。**标「待按其指南事先获准，不可直接使用」**，交 Eko 审是否作必要指认，不做已授权保证。不得改色、变形或做成「Anthropic 官方合作」印象。

### 不可直接使用 / 已隔离

| 文件 | 原因 |
|---|---|
| `assets/img/zhihu-question-attempt1.png` | 真实整页，但含登录弹窗和客户端下载二维码；抖音禁止二维码／导流。只作存档，用上面的裁切 |
| `assets/_excluded/zhihu-question-no-modal-blocked.png` | 第二次截图触发知乎风控，几乎空白，不可用 |
| `assets/_excluded/witten-chalmers-speech-pd-other-faces.jpg` | 虽为 Public domain，但含另外两人面部 |
| Commons 其他合影、IAS 官方肖像、IAS 讲座视频 | 未下载或授权未知；IAS 学者页本次 403 |

`assets/video/` 为空。

## 成片口径／合规提醒

- 预印本未同行评议；不要说「发表在顶刊」或「已经定论」。
- Opus 5.5 不是共同作者；致谢是 “assistance on many details”，正文是 “suggested a likely variant”。
- Hsu 的「同一变体」≠ Opus 5.5 的插值技巧，必须分开讲。
- 原则上可上机 ≠ 已经大规模算出来；关键词是 path integral is not positive / lacks the positivity needed in Monte Carlo。
- 不要用「最强」「第一」等绝对化用语；不要把知乎回答（例如关于「是否该把 AI 列为作者」的个人议论）写成事实。
- 画面不要出现二维码、站外账号、资料包、评论领取或翻墙字样。引用论文页只截必要句段。人物只用已核为公有领域的单人照片。若使用官方 logo，须先过商标指南，且不得暗示官方背书。
- 发布勾选「内容由AI生成」。

## 缺口（交 Eko 独立审前必须知道）

1. **无已清权短视频**：Commons 无 Witten 视频文件；IAS 讲座授权未知，未下载。成片目前只能靠论文截图、知乎标题裁切和公有领域静止照片。
2. **知乎热榜第28／约107万仍待核**：那是 11-11 12:00 豚榜上报线索，本日未截到热榜原页。本日只核到问题页标题，以及 10:09 快照上的关注者 142、被浏览 137,568。这两类数字不可互换，107 万不进文案。
3. **知乎整页有登录弹窗和二维码**：可用标题裁切；不要用整页。
4. **arXiv 网页截图样式偏素**：是真实页面，但 CSS 未完全成形；文字已与官方 HTML 核对（含 Comments「33 pp」、v1、提交时间）。作者自报 33 pp，本地 PDF 为 36 页，不要混用。
5. **Anthropic／Claude 图标未获书面授权**：官方原件已保存，按商标指南不能默认上片。
6. **IAS 官方肖像未取得**（页面 403）；不需要用授权不明的机构照片去替代已有的 PD 照片。
7. 未核 Hsu 预印本 arXiv:2610.29019 的原文，只核了威滕论文里怎么写 Hsu。若文案要转述 Hsu 自己怎么说，还需另核。

本包是素材证据阶段交付，不是成片素材全部就绪，也不是审稿通过。`review.md` 未改，交由 Eko 独立审核。
