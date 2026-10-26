# openai-eth-false — 抖音素材包（仅素材，无脚本）
整理：小晚 2026-10-27（Asia/Taipei）。所有英文均为原文摘录。
附件原文全文：raw/eth.pdf（67页）、raw/smoothing.pdf（59页）、raw/letter.txt（三位学者公开信全文）、raw/lean_378.md、raw/*_README.md

## 1. OpenAI 官方页原文（2026-10-26）
URL: https://openai.com/index/building-scientific-understanding-with-academic-communities/

> We are announcing three new discoveries in mathematics, computer science, and physics about harmonic analysis, complexity theory, and quantum field theory.

> In our view, these manuscripts are best understood as a form of raw research data. ... We reached out to external experts and asked them to act as shepherds, organizing groups to understand the new results. They advised three different release strategies:
> - For the math result, release the AI output, leaving researchers free to organize their own efforts to explain the result.
> - For the computer science result, form an external group of collaborators to explain the result, while making the AI output publicly available for anyone to examine and build on.
> - For the physics result, form an external group of collaborators and defer to them on the release of materials.

四原则：Transparency（无NDA）/ No Academic Credit（"We do not seek academic credit for the discoveries produced by our internal models."）/ Recognition / Independence（"Participation is voluntary and unpaid... They do not speak on behalf of OpenAI"）。

**ETH 段：**
> The ETH has been widely believed to be true, and has been used in hundreds of papers to derive conditional computational hardness results across a wide variety of fields including graph theory, computational biology, databases, computational geometry, and more. Surprisingly, our system has recently proved that the ETH is false, a result that was subsequently verified in Lean. The refutation of the ETH reopens questions about how much faster these tasks could become, and may help guide the search for better algorithms. Finding such algorithms, and turning theoretical advances into practical improvements, will require significant further research.

> This work will be verified and shepherded by a group led by Russell Impagliazzo (UC San Diego), Ramamohan Paturi (UC San Diego), and Ryan Williams (MIT). ... Impagliazzo and Paturi, along with Francis Zane, are the original proposers of the Exponential Time Hypothesis...

> We have agreed to the group's requests that all raw data of the results be made public to facilitate independent verification by the community, and that OpenAI commit to funding a conference...

> Our AI found its natural language disproof for the ETH on October 16th, 2026 and then subsequently we formalized the result in Lean on October 17th, 2026...

**数学段（local smoothing → Kakeya）：**
> In 1991, Sogge proposed the local smoothing conjecture... it implies the Kakeya conjecture and Stein's restriction conjecture.
> In 2019, Guth, Wang, and Zhang proved the local smoothing conjecture in two spatial dimensions. In 2025, Wang and Zahl proved the Kakeya conjecture in three dimensions. Our models produced a proof of the local smoothing conjecture in every dimension and therefore also resolve the Kakeya conjecture and Stein's restriction conjecture in all dimensions. The new proof is based on a novel auxiliary partial differential equation.
> We obtained our AI output on October 18th, 2026, which was formalized in Lean the following day...

**物理段（QCD / Yang–Mills 存在性，AI原稿暂不公开）：**
> ...a mathematically rigorous existence proof of certain interacting quantum field theories containing gauge fields and fermions in four dimensions, including Quantum Chromodynamics (QCD) and a unified completion of the Standard Model... As a subproblem, this work also includes a proof of the existence of pure Yang–Mills theory, which is part of the Quantum Yang–Mills Theory Clay Mathematics Institute Millennium Prize problem.
> David Gross will lead a group including Michael Douglas, Arthur Jaffe, Igor Klebanov, and Nikita Nekrasov...
> Our models produced a natural language proof for Yang–Mills existence on September 9th, 2026, and then subsequently produced a proof for QCD on September 18th, 2026. ... We finished our formalization of Yang–Mills' existence on October 16th, 2026...
> For the physics collaboration, the group has decided to hold off on releasing the AI-produced artifacts and instead work on writing it up themselves.

注意：原文说"part of"千禧年问题——**没有说解决了千禧年大奖问题**（HN 指出可能不含 mass gap）。

**资金：** "$5 million contribution to the Simons Foundation"

## 2. 论文 / 仓库
仓库：https://github.com/openai/math （preprints/The-Exponential-Time-Hypothesis-is-False-October-25-2026/paper.pdf；Lean 范围说明 lean/docs/378.md）
论文标注：Author: OpenAI；Date: 17 October 2026, revised 25 October 2026。

ETH 论文摘要（原文）：
> We give a deterministic algorithm for exactly counting the satisfying assignments of an arbitrary k-CNF formula. For every fixed k ⩾ 2, on a formula with n variables and m clauses, our algorithm uses poly_k(n, m) space and runs in time (n + m)^{O_k(1)} 2^{n/(log n)^{1/2+o(1)}}. Our algorithm refutes the Exponential Time Hypothesis (ETH), which postulates that deciding 3-SAT on n variables requires 2^{Ω(n)} time in the worst case.

Theorem 1.1：时间 (n+m)^{O_k(1)} 2^{O_k(n log log n/√log n)}，多项式空间；m ≤ Dn 时 2^{O(n/√log n)}。
Lean 范围（lean/docs/378.md 原文）：
> For fixed k≥2, Lean proves that a deterministic machine exactly counts satisfying assignments of a canonically encoded k-CNF on n variables in time (L+1)^{O_k(1)}2^{O_k(n(log log n)^2/√log n)} ... For m clauses, the October 25 manuscript gives the sharper time bound ...
→ **Lean 形式化的是稍弱的界**，论文里更紧的界未必全部进 Lean。都仍是亚指数，足以推翻 ETH（若成立）。

Local smoothing 论文摘要：
> We prove Sogge's local smoothing conjecture for the Euclidean wave equation in every spatial dimension at least two. We deduce the Bochner–Riesz conjecture... We also prove the Kakeya and Nikodym maximal conjectures; in particular, every Euclidean Kakeya set has full Hausdorff dimension.

可讲解的通俗点：算法是"亚指数但超多项式"——**不等于 P=NP**，离实用 SAT 求解也远。

## 3. 三位学者公开信（核查≠背书）
Google Doc（Williams 在 X 发布）：https://docs.google.com/document/d/1adB0IhJgLzsmbfCgoLrtoJTjnlPf74UnyjMo35P5JHo/edit
> Our involvement should not be taken as certification of the claim. A result of this significance requires careful, independent scrutiny and an understanding that others can reconstruct, question, and build upon.
> If the claim is correct, it will change an important part of theoretical computer science.
> As discoveries come faster, recognition may go mainly to those who publish first or have the most powerful tools, while the work of checking, explaining, and building on results receives less credit.

## 4. X 帖子原文
- Ryan Williams 1/4 https://x.com/rrwilliams/status/2114833319431209352 —"An internal model at OpenAI has produced a claimed refutation of ETH! Russell Impagliazzo, Mohan Paturi, and I have been asked to help organize an open and independent examination of this claim. 1/4"（1.2k赞/14万曝光）
- 2/4 https://x.com/rrwilliams/status/2114833321675112826 —"We've signed no NDAs and will receive no compensation... We've asked OpenAI to publicly release ASAP all their raw data regarding ETH, including PDFs and Lean source. 2/4"
- 3/4 https://x.com/rrwilliams/status/2114833324107759983 —"We have also asked OpenAI to commit to sponsoring a conference... They agreed to both. 3/4"
- 4/4 https://x.com/rrwilliams/status/2114833326272049342 —公开信与公告链接
- https://x.com/rrwilliams/status/2114835554177261953 —"...it's claimed that 3SAT on n variables is in about exp(n/(log n)^{1/2+o(1)}) time"
- https://x.com/rrwilliams/status/2114860103207911484 —"Honest answer: we don't know yet. ... plausible we could see a serious update on practical SAT solving within the next 12 months. Or we might not see anything like that. I really don't know."（冷静信号，好用）
- Sebastien Bubeck https://x.com/SebastienBubeck/status/2114838293330420187 —"3SAT in subexponential time (2^{n / log^eps(n)}) is maybe the biggest surprise I have seen during my 20 years following theoretical computer science"（注：Bubeck 为 OpenAI 员工，非中立）
- Dan Roberts（OpenAI）发布帖 https://x.com/danintheory/status/2114833682469122314 —公告首句（2.3k赞/32万曝光）
- Lev Reyzin https://x.com/lreyzin/status/2114836430262247827 —"So many results that assume the ETH will fall if this checks out, including multiple of my own!"
- Ryan O'Donnell 反驳上条 https://x.com/BooleanAnalysis/status/2114860617924243776 —"No results assuming ETH fall, per se. All these results are of the form 'there is a very efficient algorithm reducing 3SAT to problem X'. And these algorithms continue to work correctly."（重要纠偏：归约本身仍成立，变的是"条件下界"的结论）
- Bret Taylor https://x.com/btaylor/status/2114860863324848131 —"I was and am shocked the exponential time hypothesis is false..."（注：OpenAI 董事会主席，非中立）
- 快讯 FirstSquawk https://x.com/FirstSquawk/status/2114835043122348281
- 搞笑误读（ETH≠以太坊）：https://x.com/chocockc/status/2114860710383751440 、https://x.com/thefusioncube/status/2114859815524765984 —可作"ETH不是以太坊"梗
X 视频：本话题相关帖无视频（OpenAI 当日视频均为 GPT-6.1 Terra 发布，无关，未下载）。

## 5. TNW 关键引语（2026-10-26）
https://thenextweb.com/news/openai-exponential-time-hypothesis-false-kakeya-yang-mills
> Hundreds of computer science papers rest on a conjecture that an internal OpenAI model now claims to have refuted...
> In an open letter to their field, the three researchers said their role is not an endorsement.
> OpenAI released the model's write-up and a Lean proof, as it did with the 722 maths papers it published on 6 October.（722篇仅TNW来源）
> OpenAI said in September it would not claim the prize for its Navier-Stokes proof.（仅TNW）
> Mathematicians raised similar concerns in the Leiden declaration in June.（仅TNW）

## 6. HN 热评（https://news.ycombinator.com/item?id=50251344 ，抓取时 200 分/76 评）
正面/解释：
- emil-lp: "I would guess ETH has been assumed in thousands of papers. I have several myself. On the positive side, suddenly there's a whole bunch of open problems!"
- krackers: "It's only slightly subexponential, not even quasipolynomial, but it is a very surprising result. And that too a constructive algorithm."
- dooglius: "The proof appears to be a sub-exponential algorithm for #3-SAT not just 3-SAT"
- pavitheran: "Yes it means both SETH and ETH are false."
- levocardia: "And presumably they are just missing the 'mass gap' part of it."
质疑/怀疑：
- JonChesterfield: Lean 文件末尾有 sorry →  sebzim4500 解释："They do that to make it easier for readers to verify the statement (which is entirely contained in that file) separately from the proof (which is spread over thousands of files...)"（好素材：看似漏洞、实为题面文件）
- titzer: "Our results are too important to wait for the pesky peer review, so we are dumping a whole ton of money in a fund and giving some elites a breathless first look so our buzz keeps getting jacked up."
- esalman: "$5 million might sustain 5-10 PhD students for 5 years."
- 1ahsgt: "Proud to funnel money through the Simons Foundation, which is an AI booster itself..."
- Insimwytim: "Let's throw in more of that stuff, so they wouldn't look at the financials."
- karmasimida: "Well, they are also not fully sure they got it right."
- adverbly（转正面）: "I was highly critical of their approach with the earlier mathematical publications, but this is much improved."

## 7. 视觉素材 assets/img（均为真实图片/截图/PDF页面渲染，无代码绘图）
- eth_paper_p-01.png / eth_paper_p-02.png — ETH 论文 PDF 第1–2页（标题、摘要、Theorem 1.1）
- smoothing_paper_p-01.png — local smoothing 论文第1页
- shot_github_eth_folder.png — GitHub 仓库 ETH 目录截图
- shot_github_lean_378.png — Lean 范围说明页截图
- openai_page_social.png — OpenAI 页官方题图（1600×900）
- tnw_header_unsplash.jpg — TNW 头图（Unsplash, Vitaly Gariev；黑板写公式，版权需核）
- x_HVl-0p9aoAAFkl1.jpg — X 帖配图：OpenAI 大楼外观（来源帖 cscec21，原始版权不明）
- x_HVl-76JX0AATgcS.jpg — X 帖配图（Dr_Singularity 的文字卡，第三方制作，慎用）
- x_HVl-HltXgAAsGPo.jpg — X 帖配图（WarisHymii，未核内容，慎用）
assets/video：空（无相关真实视频）。
截图失败：OpenAI 官网（headless 只出白屏 logo，已删）、HN、TNW、公开信 Google Doc（超时）。如需，用浏览器手动截。
