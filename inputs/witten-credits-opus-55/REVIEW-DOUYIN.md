# REVIEW-DOUYIN — witten-credits-opus-55（Eko 独立审，2026-11-12 10:18 Asia/Taipei）

批准：马飞龙于 2026-11-12 09:59（台北时间）在夜凌云聊天回复「1」，批准只做抖音。本审只审素材，不写脚本，不联系任何 bot，不推 GitHub，不改 board.csv。

## 结论：有条件通过

核心事实全部经独立核对，与原文一致。小晚交的口径 ①–⑤ **没有说错**。论文页裁切是官方 PDF 的真实渲染，威滕两张单人照片经 Wikimedia 原始授权页与原图哈希核认为公有领域，可用于成片。无代码画图，无百度热搜，推荐画面无二维码、站外引流、资料包或评论诱导。无视频是已写清的缺口，不构成退回。

通过条件（剪辑必须遵守，不是再退回小晚补材料）：

1. **Anthropic / Claude 官方图标不默认上片。** 文件来自官方 press kit，但《Anthropic Trademark Guidelines》（2024-08-01）写明商标只能用在对方事先批准的材料中，且不得暗示赞助或背书。压缩包内无授权函。本包已排除全部官方 logo 与 press kit ZIP。
2. **「知乎热榜第 28 / 约 107 万」不进文案。** 本日未截到热榜原页；本日只核到问题页标题，以及 10:09（台北时间）快照上的关注者 142、被浏览 137,568。两类数字不可互换。
3. **知乎整页 `zhihu-question-attempt1.png` 不上片**（登录弹窗 +「打开知乎 App / 下载客户端」二维码）。只用已去弹窗和二维码的标题裁切。标题区「Claude 87% 知友推荐 · 5154 人评价」是平台话题组件，不是论文数据。标题裁切因原页弹窗遮罩而偏暗，但仍可读。
4. **论文页只作必要短引用**，不整页铺满。版权仍归作者；arXiv 仅为非独占分发许可（nonexclusive-distrib/1.0），不视为已获商用授权。
5. **口播必须守住下面「口径表」**：预印本未同行评议；Opus 5.5 不是共同作者；Hsu 的「同一变体」不是 Opus 那一步；原则上可上机 ≠ 已经算出来；Comments「33 pp」与 PDF 实有 36 页不要混用。

本条件通过不等于发布许可，也不等于成片已就绪。

## 独立核查方法

- 当场重新下载 https://arxiv.org/abs/2611.05051 摘要页 HTML 与 https://arxiv.org/pdf/2611.05051 。本地 PDF（517547 字节）与官方 PDF 的 SHA256 完全相同：`a49010dacb71dbb7307725678bd2d2cc81934d0f955e5d2d8ebecdab9826fe92`。摘要 HTML 亦逐字节相同。`pdfinfo` 计 36 页。
- 用 `pdftotext -layout` 逐页提取原文，用页脚印刷页码与 PDF 页交叉对照；用 `pdftoppm -r 200` 自行渲染第 1、2、3、6、7、30–33 页，与小晚交付的整页 PNG **逐字节相同**。全部 11 张论文裁切用模板匹配核为对应整页的像素级子图（差值 max=0），不是代码画的示意图、摘录卡或数据图。
- 当场拉取 Wikimedia Commons 文件页与 API，并下载原图做哈希对照。当场目视致谢、作者栏、摘要、Opus 段、第 4 节、知乎裁切与威滕照片。

## 对小晚口径 ①–⑤ 的独立结论（全部已核，无误）

### ① 作者栏只有 Witten，致谢在印刷第 32 页：已核，说法正确

- 作者栏（PDF 第 1 页，无印刷页码）只有 Edward Witten，单位为 IAS School of Natural Sciences。全文检索 Claude / Opus / Anthropic，均不出现在作者栏。
- 致谢在印刷第 32 页（PDF 第 33 页，页脚「– 32 –」）。原话与小晚所引一致：

> Assistance on many details was provided by Claude Opus 5.5.

完整致谢段还含 NSF Grant PHY-2514611、感谢 T. Hartman 指出 Craig 的论文、K. Yonekura 对稿件的意见。Opus 5.5 只出现在致谢，**不是共同作者**。截图 `crop-p01-author-block.png`、`crop-p33-acknowledgements.png` 与原文一致、清晰可读。

### ② Opus 5.5 建议的是印刷第 29 页的光滑插值变体；线性插值也是 Opus 提的：已核，说法正确

印刷第 29 页（PDF 第 30 页，页脚「– 29 –」）原话：

> Anthropic’s Claude Opus 5.5 suggested a likely variant that gives a smooth interpolation with link holonomies that equal precisely the corresponding lattice link variables and such that the interpolated gauge field in a hypercube depend only on the link variables on the boundary of that hypercube.

后文描述用映射 \(\Phi^*A\) 在进入更高维 Dirichlet 问题之前把场挤进格子内部，最终是光滑、规范不变、保持格子对称、精确复现链变量、且每个格子只依赖该格子数据的连续插值程序。原文用的是 “suggested a likely variant”（一种很可能可行的变体），不要说成「写出了整篇论文」或「解决了手征费米子问题」。

同页另有：

> For example, Opus 5.5 also described a variant in which the inductive step is made by a sort of linear interpolation rather than by solving a Dirichlet problem.

**线性插值变体同样是 Opus 5.5 描述的**，不是第三人提出。小晚已分开表述，没有张冠李戴。截图 `crop-p30-opus-suggested-variant.png`、`crop-p30-opus-linear-interpolation.png`、`crop-p30-opus-both-variants.png` 与原文一致。

### ③ 摘要里 Hsu「同一变体」指相对 Craig 的总体进路，不是 Opus 那一步：已核，说法正确

摘要原话：

> Here we describe a variant of this algorithm, based on interpolating a lattice gauge field over the continuum (as in Craig’s work) and coupling the interpolated gauge field to continuum chiral fermions. The same variant was also proposed recently by Hsu.

“The same variant” 的先行词是「把格点规范场插值到连续统、再与连续手征费米子耦合」这条相对 Craig 算法的进路。第 1.2 节（印刷第 6 页／PDF 第 7 页）写 “as described independently of the present work by Hsu [17]”，说的是可容许格点场 + 连续插值 + 直接使用连续手征费米子路径积分。引言（印刷第 2 页／PDF 第 3 页）也只说 Hsu 用了「与本文相同的关键事实」。正文从未把 Hsu 与第 29 页的 Opus 插值技巧写成同一件事。**不能说「Hsu 也独立提出了 Opus 5.5 的那一步」。** 小晚此条正确，且主动划清了界限。

本审未另核 Hsu 预印本 arXiv:2610.29019 原文（参考文献 [17]）。若文案要转述 Hsu 自己怎么说，还需另核；只转述威滕论文里怎么写 Hsu，现有材料足够。

### ④ 「原则上可上机，路径积分不正定、实际不能用蒙特卡洛」在摘要和第 4 节：已核，说法正确

摘要：

> this approach can be implemented on a computer in principle, but not in practice by Monte Carlo methods because the chiral fermion path integral is not positive.

第 4 节（印刷第 31 页／PDF 第 32 页，标题 “Can This Regularization Be Implemented on a Computer?”）：

> There will certainly be no straightforward lattice Monte Carlo implementation, because the chiral fermion path integral, even when anomaly-free, lacks the positivity needed in Monte Carlo procedures. So an implementation, at least with known methods, may be impracticably slow. … So if the chiral fermion integral can be effectively computed, then the whole lattice path integral can be effectively computed as well, in principle.

不要写成「已经算出来」或「已经解决问题」。截图 `crop-p01-abstract-variant-hsu-montecarlo.png`、`crop-p32-section4-montecarlo.png` 与原文一致。

### ⑤ 预印本未同行评议；Comments 自报 33 pp，PDF 实有 36 页：已核，说法正确

摘要页：`[Submitted on 3 Nov 2026]`；Submission history `[v1] Tue, 3 Nov 2026 15:17:23 UTC (65 KB)`，合 2026-11-03 23:17:23（台北时间）。Comments 栏原文为「33 pp」。页面未显示已发表期刊或同行评议通过。当场下载的官方 PDF 与本地副本均为 36 页（题名页无页脚，其后印刷页脚从 –1– 到 –35–）。作者自报页数与实有页数不同，不要混用，也不要把「33 pp」说成审稿人点数。截图 `arxiv-abs-page-top.png` 可见 Comments「33 pp」、唯一作者、v1 与提交时间，文字与官方 HTML 一致。页面样式偏素，但不影响文字核验。

## 图片与授权

| 类别 | 结论 |
|---|---|
| 论文整页与裁切 | 真实 pdftoppm 渲染，与本审当场渲染逐字节相同；裁切为原页像素级子图，清晰可读，无代码画图 |
| arXiv 摘要页截图 | 真实网页截图，关键字段与官方 HTML 一致，可作来源指认；不视为整页商用授权 |
| 知乎标题裁切 | 标题「如何看待理论物理学家 Edward Witten 在最新论文中公开致谢 Opus 5.5？」已核。可用标题裁切；整页因二维码/弹窗已从本包排除；「107 万 / 热榜#28」待核，不进文案 |
| `witten-chalmers-portrait-pd.jpg` | 与 Wikimedia File:Edward Witten.jpg 原图 SHA256 相同（`593411daeee752a39116766384a4ea9bba189fb571f3982d99c44f5300f7a194`）。作者 Ojan，2008-04-29 摄于瑞典哥德堡 Chalmers。Commons 与 API 均标 **Public domain**；权利人模板原文为 “I, the copyright holder of this work, release this work into the public domain. This applies worldwide.” 部分法域若不能放弃版权，则授予无条件使用。AttributionRequired: false。单人近景，成片可用。建议注明摄影师 Ojan / Commons 来源 |
| `witten-chalmers-blackboard-pd.jpg` | 与 File:Witten Blackboard.jpg 原图 SHA256 相同（`1fcdea5649498e8bd2eda7a213ac77ac51d43d4bbd3e13d18d607bd3f2dff527`）。同一作者、场合、PD 模板。单人写板书，略有运动模糊，成片可用 |
| 合影 `witten-chalmers-speech-pd-other-faces.jpg` | 虽为同一批 PD，但含另外两人面部，已在 `_excluded/`，本包不收 |
| Anthropic / Claude 图标 | 官方原件，未获事先批准，不默认上片，本包不收 |

## 剪辑必须遵守（口径表）

| 主题 | 可说 | 不可说 |
|---|---|---|
| 作者 | 威滕是唯一作者；致谢写明 Opus 5.5 提供了许多细节上的协助 | 「AI 共同作者」；「Opus 写了这篇论文」 |
| AI 做了哪一步 | Opus 5.5 建议了一种很可能可行的光滑插值变体（链和乐与格点链变量精确相等，超立方体内的场只依赖该立方体边界上的链变量）；同页还描述了一种线性插值变体，也是 Opus 5.5 提的 | 「AI 解决了手征费米子问题」；把线性插值说成别人提的；把 “likely variant” 说成已证明的唯一正确方法 |
| Hsu | 「威滕摘要写：同一条总体进路 Hsu 最近也提出过」（相对 Craig：连续插值 + 连续手征费米子） | 「Hsu 也独立提出了 Opus 5.5 的那一步光滑/线性插值」；转述 Hsu 自己的话却不另核其预印本 |
| 计算 | 「原则上可上机，但路径积分不正定，实际不能用蒙特卡洛」；「用已知方法可能慢到不现实」 | 「已经算出来」；「已经解决问题」；「不能上机」 |
| 发表状态 | 2026-11-03 挂上 arXiv 的预印本 v1，尚未同行评议 | 「发表在顶刊」；「已经定论」；把 Comments「33 pp」说成 PDF 页数，或把 36 页说成作者自报 |
| 知乎 | 可用问题标题作国内讨论线索；若提浏览量，只用已截到的「被浏览 137,568」（10:09 台北时间快照），并标明是当时页面显示 | 「热榜第 28」「约 107 万」；把「Claude 87% 知友推荐」写成论文事实；把知乎回答里的议论写成事实 |
| 画面 | 论文必要句段、arXiv 摘要页、知乎标题裁切、两张 PD 单人照片 | 官方 Anthropic/Claude logo；知乎整页、二维码、登录弹窗、下载客户端；含他人面部的合影；代码重画的公式或示意图；整页论文铺满画面 |
| 结尾 | 纯内容；发布勾选「内容由AI生成」 | 站外引流、资料包、评论区领取或互动诱导 |

## 缺口（已写清，不必补也能按条件通过）

1. **无已清权短视频。** `assets/video/` 为空。成片目前只能靠论文截图、知乎标题裁切和公有领域静止照片，足以支撑 30–40 秒解说，不因此退回。
2. 知乎热榜第 28 / 约 107 万仍待核，不进文案即可。
3. Anthropic / Claude 图标未获书面授权，不使用即可。
4. IAS 官方肖像本次 403，不需要用授权不明的机构照片替换已有的 PD 照片。
5. 未核 Hsu 预印本原文；只引威滕论文即可。

## 本包收录范围

可用素材已打包为 `/workspace/pipeline/witten-credits-opus-55-douyin-20261112.tar.gz`，含 `materials.md`、`sources.md`、`REVIEW-DOUYIN.md`、sha256 清单，以及论文页/裁切、arXiv 摘要页截图、知乎标题裁切、两张 PD 照片、论文 PDF 与全文、Commons 许可页存档、商标指南文本（仅作「不可默认上片」的证据）。

**不收入本包：** `_excluded/` 全部；`zhihu-question-attempt1.png`（二维码与登录弹窗）；全部 `official-anthropic-*`、`official-claude-*` 图标；`anthropic-official-press-kit.zip`。
