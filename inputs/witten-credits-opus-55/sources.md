# 来源与核验

采集：2026-11-12 10:01–10:11（台北时间）。已核 board.csv 第168行「马飞龙批准」，以及本目录 STATUS.txt 首行马飞龙本人「回复『1』批准」。仅素材，不写脚本、不渲染、不推 GitHub。禁止使用百度热搜。

页码约定：印刷页码以 PDF 页脚为准；题名摘要页、目录页无页脚。并注明对应的 PDF 页（从 1 起算）。全文摘自本地保存的 PDF，用 pdftotext 提取，页码经逐页文本与页脚交叉核对。

## A 论文原文

- 题名：*A Note On Lattice Definition of Gauge Theories With Chiral Fermions*
- 作者栏唯一作者：Edward Witten（School of Natural Sciences, Institute for Advanced Study）。全文检索 Claude / Opus / Anthropic，均不出现在作者栏。
- 识别号：arXiv:2611.05051；当前版本 v1。摘要页写 `[Submitted on 3 Nov 2026]`；Submission history：`[v1] Tue, 3 Nov 2026 15:17:23 UTC (65 KB)`，换算为 2026-11-03 23:17:23（台北时间）。科目：hep-lat（主）、hep-ph、hep-th。DOI：https://doi.org/10.48550/arXiv.2611.05051
- 摘要页：https://arxiv.org/abs/2611.05051 ；PDF：https://arxiv.org/pdf/2611.05051 。本地副本：`assets/text/arxiv-2611.05051.pdf`（517547 字节）；摘要页 HTML：`assets/text/arxiv-2611.05051-abs.html`。
- 摘要页 Comments 栏原文为「33 pp」（作者自报）。本地 `pdfinfo` 计 36 页。二者不同，不以截图误读或互相替换。
- 许可：摘要页「view license」指向 http://arxiv.org/licenses/nonexclusive-distrib/1.0/ （arXiv 非独占分发许可：作者授权 arXiv 永久、非独占分发，版权仍归作者）。成片对论文页的使用只应作必要短引用，不可整页铺满，也不能当作已获商用授权。
- 全文文本：`assets/text/arxiv-2611.05051-layout.txt`（保留版面）、`assets/text/arxiv-2611.05051-full.txt`。

同文提及、但非本期核验对象的论文：Craig, arXiv:2610.09093（参考文献 [16]）；Hsu, *The Standard Model On A Finite Bosonic Lattice With Continuum Weyl Fermions*, arXiv:2610.29019（参考文献 [17]）。未把 Hsu 预印本当作已核原文。

## B 逐字核实（已核／待核／不支持）

### 1. suggested a likely variant：已核（印刷第29页／PDF 第30页）

原话（完整段落，含前后文，说明建议的是哪一种光滑插值）：

> Anthropic’s Claude Opus 5.5 suggested a likely variant that gives a smooth interpolation with link holonomies that equal precisely the corresponding lattice link variables and such that the interpolated gauge field in a hypercube depend only on the link variables on the boundary of that hypercube. Pick coordinates on \(\mathbb{R}^4\) so that the lattice consists of the points with integer coordinates. Fix a small \(\delta > 0\), and let \(s(t)\) be a smooth nondecreasing function, with \(s(t + 1) = s(t) + 1\), that is equal to \(n\) for \(|t - n| < \delta\), \(n \in \mathbb{Z}\), and maps each interval \([n, n+1]\) onto itself. The map \(\Phi(x) = (s(x_1), \ldots, s(x_4))\) maps every cell of the lattice onto itself; it collapses the \(\delta\)-neighborhood of the boundary of the cell onto the boundary, and maps the rest of the cell onto its interior. After defining \(A\) on the cells of dimension \(k\), and before going on to dimension \(k + 1\) by solving a Dirichlet problem, replace \(A\) on each \(k\)-cell by \(\Phi^* A\). This squeezes the gauge field on each cell into its interior and, near each face, replaces it by its value on the face, continued without change in the normal directions. Since \(\Phi\) acts on each link only by reparametrization, the link holonomies are unchanged. Gauge fields on adjacent cells now match smoothly across their common faces. The end result is a smooth continuum interpolation procedure that is gauge-invariant, preserves all lattice symmetries, reproduces the link variables exactly, and on each cell depends only on the lattice data of that cell.

中文释义（翻译，不是原话）：Anthropic 的 Claude Opus 5.5 建议了一种很可能可行的变体，能给出光滑插值，且链变量的和乐与格点链变量精确相等，超立方体内的插值规范场只依赖于该超立方体边界上的链变量。后文描述了用重参数化映射 \(\Phi\) 把场挤进格子内部、使相邻格子在公共面上光滑衔接的步骤。最终得到的是光滑、规范不变、保持全部格子对称、精确复现链变量、并且在每个格子上只依赖该格子数据的连续插值程序。

同页另有线性插值变体原话：

> There are many possible variants of this construction, some with possibly desirable properties. For example, Opus 5.5 also described a variant in which the inductive step is made by a sort of linear interpolation rather than by solving a Dirichlet problem.

中文释义（翻译）：这种构造还有许多可能的变体。例如，Opus 5.5 还描述了一种变体，其归纳步骤用某种线性插值，而不是解 Dirichlet 问题。

截图：`assets/img/crop-p30-opus-suggested-variant.png`、`crop-p30-opus-linear-interpolation.png`、`crop-p30-opus-both-variants.png`；整页 `arxiv-pdf-p30-opus-variant.png`。均为 pdftoppm 真实页面渲染后按文字坐标裁切，不是代码画图。

### 2. 作者栏与致谢：已核

作者栏（PDF 第1页，题名摘要页，无印刷页码）原话：

> Edward Witten  
> School of Natural Sciences, Institute for Advanced Study,  
> 1 Einstein Drive, Princeton, NJ 08540 USA

致谢（印刷第32页／PDF 第33页）原话：

> Acknowledgements Research supported in part by NSF Grant PHY-2514611. I thank T. Hartman for pointing out Craig’s paper, and K. Yonekura for helpful comments on the manuscript. Assistance on many details was provided by Claude Opus 5.5.

中文释义（翻译）：致谢。研究部分由 NSF Grant PHY-2514611 资助。感谢 T. Hartman 指出 Craig 的论文，以及 K. Yonekura 对稿件的有益意见。许多细节上的协助由 Claude Opus 5.5 提供。

结论：Opus 5.5 只出现在致谢，不是共同作者。不要写成「AI 共同作者」。截图：`crop-p01-author-block.png`、`crop-p33-acknowledgements.png`。

### 3. Hsu 独立提出：已核，但所指「同一变体」不是 Opus 5.5 那套插值

摘要（PDF 第1页）原话：

> Here we describe a variant of this algorithm, based on interpolating a lattice gauge field over the continuum (as in Craig’s work) and coupling the interpolated gauge field to continuum chiral fermions. The same variant was also proposed recently by Hsu.

这里的 “a variant of this algorithm” / “The same variant” 指的是相对 Craig 算法的进路：把格点规范场插值到连续统，再与连续手征费米子耦合。不是第29页 Opus 5.5 建议的那种光滑插值技巧。

引言（印刷第2页／PDF 第3页）原话：

> Actually, following the appearance of Craig’s paper and while the present one was being written, another paper appeared by Hsu [17] also describing a lattice regularization of chiral fermions and using the same key facts that the present article is based on. We will say more about Hsu’s paper and the background to it in section 1.2.

第1.2节（印刷第6页／PDF 第7页）原话：

> Alternatively, and as described independently of the present work by Hsu [17], once one knows that lattice gauge theory can be restricted to admissible lattice gauge fields and that admissible lattice gauge fields have a continuum interpolation, one can construct a lattice regularization of chiral gauge theories by directly using the fact that the continuum path integral of anomaly-free chiral fermions is always well-defined.

因此：「Hsu 也独立提出了同一变体」——已核，但仅支持「同一条总体进路」（可容许格点场 + 连续插值 + 直接使用连续手征费米子路径积分）。**不支持**把这句话说成「Hsu 也提出了 Opus 5.5 建议的那种光滑插值 / 线性插值变体」。正文未把 Hsu 与第29页的 Opus 5.5 建议写成同一件事。

截图：`crop-p01-abstract-variant-hsu-montecarlo.png`、`crop-p03-intro-hsu-paper.png`、`crop-p07-hsu-independently.png`。

### 4. 路径积分不正定／不能用蒙特卡洛实际计算：已核

摘要（PDF 第1页）原话：

> In any dimension and for any anomaly-free representation, this approach can be implemented on a computer in principle, but not in practice by Monte Carlo methods because the chiral fermion path integral is not positive.

第4节（印刷第31页／PDF 第32页）原话：

> There will certainly be no straightforward lattice Monte Carlo implementation, because the chiral fermion path integral, even when anomaly-free, lacks the positivity needed in Monte Carlo procedures. So an implementation, at least with known methods, may be impracticably slow. But is such an implementation possible in principle? In lattice gauge theory with a finite volume and a positive lattice spacing, and therefore only finitely many link variables, the lattice path integral is an integral over a compact space of finite dimension. So if the chiral fermion integral can be effectively computed, then the whole lattice path integral can be effectively computed as well, in principle.

中文释义（翻译）：原则上可在计算机上实现，但实践中不能用蒙特卡洛，因为手征费米子路径积分不是正的／即使无反常也缺乏蒙特卡洛所需的正定性。用已知方法实现可能会慢到不现实；但在有限体积、正的格距下，若费米子积分能有效计算，则整个格点路径积分原则上也能有效计算。不要写成「已经算出来」或「已经解决问题」。

截图：`crop-p01-abstract.png`、`crop-p01-abstract-variant-hsu-montecarlo.png`、`crop-p32-section4-montecarlo.png`。

### 5. 预印本未同行评议：已核

来源为 arXiv 摘要页本身：这是 arXiv 预印本 v1，页面未显示已发表期刊或同行评议通过。不夸成已发表定论。

## C 知乎热帖

- URL：https://www.zhihu.com/question/2102036999985276179
- 2026-11-12 10:09（台北时间）真实网页截图（headless Chromium + CDP）：标题为「如何看待理论物理学家 Edward Witten 在最新论文中公开致谢 Opus 5.5？」。页面当时显示：关注者 142、被浏览 137,568、22 个回答。以上为该次页面快照，非热榜热度，也非独立审计。
- 完整整页 `assets/img/zhihu-question-attempt1.png` 带登录弹窗和「下载知乎客户端」二维码，**不可整图上成片**（抖音禁止二维码／导流）。已另裁不含二维码、弹窗和回答区的标题区：`zhihu-crop-title-stats.png`、`zhihu-crop-question-header.png`。
- 标题区可见知乎话题卡片「Claude 87% 知友推荐 · 5154 人评价」，这是平台话题组件，不是论文数据，不进文案。
- 第一次截图后再次用脚本关弹窗，知乎返回风控 JSON（「登录异常……」），该失败页已放入 `assets/_excluded/zhihu-question-no-modal-blocked.png`，不作可用截图。
- board / brief 上报线索：知乎热榜第28、约107万、豚榜 11-11 12:00。**待核**：本日未截到热榜原页，不得把 107 万或第 28 名写入文案，也不得与本日「被浏览 137,568」混为一谈。

未使用百度热搜。

## D 威滕公开影像

优先采用 Wikimedia Commons 上权利人已明确放弃版权的照片（Public domain）：

1. File:Edward Witten.jpg — 作者 Ojan；2008-04-29 摄于瑞典哥德堡 Chalmers tekniska högskola 演讲现场；Commons 标注 Public domain（权利人声明全球进入公有领域；部分法域若不能放弃，则授予无条件使用）。署名非强制（AttributionRequired: false）。本地：`assets/img/witten-chalmers-portrait-pd.jpg`（1796×2292，1323518 字节）。许可页：https://commons.wikimedia.org/wiki/File:Edward_Witten.jpg 。该图为单人近景，未见其他人脸，可作为成片人物画面候选（仍建议署名摄影师 Ojan 以示来源）。
2. File:Witten Blackboard.jpg — 同一作者、同一场合；Public domain。本地：`assets/img/witten-chalmers-blackboard-pd.jpg`（2880×2631，2729958 字节）。单人侧面写板书，略有运动模糊。许可页：https://commons.wikimedia.org/wiki/File:Witten_Blackboard.jpg 。

同批 File:Witten at Chalmers.jpg 亦为 Ojan、2008-04-29、Public domain，但画面含另外两人面部，已移至 `assets/_excluded/witten-chalmers-speech-pd-other-faces.jpg`，**不可直接使用**（除非另行打码他人面部后再审）。

Commons 分类中其余合影（如与 Chiara Nappi、Hawking、Segal、Mori、Higgs 等）即便有 CC 许可，因含他人面部，本期不下载、不建议使用。

IAS 学者页 https://www.ias.edu/scholars/witten 本次 curl 返回 Cloudflare 403，未能取得官方肖像；即使日后取得，官方页照片亦应标「授权未知，不可直接使用」，除非另有许可。

视频：Wikimedia Commons 检索 Edward Witten 视频文件，结果为 0。IAS 公开讲座页存在（如 2024-09-10、2025-10-20、2026-03-16、2026-04-09 等），版权应属机构，授权未知，**未下载**，不可直接使用。本期无已清权且小于 30MB 的可用视频。这是明确缺口。

## E Anthropic / Claude 官方图标

- 官方入口：https://www.anthropic.com/news 页面「Media assets / Download press kit」指向 https://www.anthropic.com/press-kit ，本次解析为 ZIP：`https://www-cdn.anthropic.com/ae59ca4ca194dac9c9dc3bc78c5829468cb0e8af.zip`。本地存档：`assets/text/anthropic-official-press-kit.zip`（约 26MB）；清单：`assets/text/anthropic-press-kit-listing.txt`。压缩包内无单独授权函或品牌使用说明书，只有 logo 文件与高管头像（头像与本期无关，未复制到 img）。
- 已从官方包复制到 `assets/img/`：Anthropic logo / symbol（Slate PNG+SVG）、Claude logo（Slate PNG+SVG）、Claude Spark Clay PNG、Claude icon rounded PNG。来源为官方 press kit 原件，不是第三方重绘。
- 官方商标指南：https://assets.claude.com/f7874b435aabdaee5f836e888b4439b9b56a934b.pdf ，标题 *Anthropic Trademark Guidelines*，文内写明 Effective—Aug 1, 2024。本地：`assets/text/anthropic-trademark-guidelines.pdf` 与 `.txt`。关键条款原话：
  - “You may only use our trademarks as specifically permitted by us and only in materials we approve beforehand.”
  - “You may not use our trademarks in a manner that implies Anthropic’s sponsorship or endorsement, or a relationship or affiliation with Anthropic, except as we expressly authorize.”
  - 不得改颜色、字体、比例；须留出空隙；不要加商标符号。
  - 既有商业关系要使用商标，须发邮件至 marketing@anthropic.com。
- 因此：文件是官方原件，但**不能默认已获成本期成片授权**。标「待按其商标指南事先获准，不可直接使用」。不得暗示 Anthropic 背书本期视频。Wikimedia 上亦有被标为 public domain 的词标复制件，版权与商标是两回事，本期不以 Commons 复制件替代官方包，也不把 PD 标注写成可任意商用商标。

## F 其他数字与日期

- NSF Grant PHY-2514611：仅见于论文致谢，属作者自报资助号。
- 2026-11-03：arXiv 提交日（见摘要页）。
- 最终成片 30–40 秒、单条视频小于 30MB：为本地交付约束，不是论文数据。
- 知乎「好问题 7」「2 条评论」「22 个回答」等为 10:09 快照上的页面显示，不进文案。
