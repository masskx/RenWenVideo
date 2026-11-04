# CPU、GPU、NPU、TPU 到底差在哪？3D 拆开看：大模型为什么要 GPU、为什么越来越贵

- 成片：`video.mp4`（1080×1920，30 fps，H.264 + AAC，约 58 秒）
- 模板：`lemo/teardown`（拆解），**第一支用我们自己的 3D**（three.js，`src/tutorial/three-kit.tsx`，`docs/video-craft/3D.md`）。照搬：物理材质 + 棚拍光 + 石墨底只留接触阴影、落在零件上的标签（强调色编号 + 名称 + 等宽规格）、透视里的尺寸线、分层分离、相机一直在走。模板改造：实物 CAD → 按公开数字建的示意模型（每镜标「示意」）；强调色 → SK 海力士 HBM 堆叠的金 #E0B84D；一个产品 → 四颗芯片 + 一条内存总线（沿数据走一遍）；原生招式换成波浪抬起（TPU 数据波、HBM 16 层）；借 lemo/dataviz 的同一比例（128 根线 vs 5,120 根）
- 账号主持人（IP 形象 v2，画中画小窗）出现在钩子、“真正卡住它的是搬数据”、结尾三场
- 封面：`cover-9x16.jpg`、`cover.jpg`（3:4）、`cover-6x7.jpg`；标题「同一个模型 / CPU 6字 · GPU 200字」
- 字幕 `subtitles.srt`；静帧 `still-XXs.jpg`、总览 `stills-sheet.jpg`
- 分镜：`tutorials/chips-cpu-gpu-npu-tpu.storyboard.md`；数字和出处：`inputs/chips-cpu-gpu-npu-tpu/sources.md`
- 配音：用户本人的 MiniMax 音色（MashuaiDouyin01，1.12 倍）
- 口径：「每秒 6 / 200 个字」是**只看内存带宽的理论上限估算**（80 亿参数、FP16、batch 1），上屏标「估算」；芯片模型都是**示意**（按公开数字建，不是实物 CAD）；3 倍晶圆是美光口径；显存价格「据 TrendForce」；不用 RTX 5090 “5000 美元”、NVIDIA 再涨 20–30% 之类传闻
- **发布时勾选「内容由AI生成」**（画面全部是代码生成的 3D 示意）
- **不引流**

## 抖音

**标题**：同一个模型，CPU每秒6个字，GPU 200个

**文案**：CPU、GPU、NPU、TPU 到底差在哪？3D 拆开看：CPU 是几个大核，GPU 是上万个小核（H100：132 × 128 = 16,896），NPU 是手机电脑里只做乘加的省电专区，TPU 是 128 × 128 乘加器排成的方阵。大模型几乎全是矩阵乘法，但真正卡住它的是搬数据：每出一个字，16GB 权重都要读一遍——电脑内存 128 根线，HBM 5,120 根，带宽差 35 倍。线太多只能把内存叠起来贴着 GPU 放，同容量约吃 3 倍晶圆（美光）；AI 把内存抢光，显存现货价涨了约 3 倍（据 TrendForce）。每秒字数是只看带宽的理论估算。

**话题**：#GPU #芯片 #大模型 #AI科普 #显卡涨价

## 视频号

**标题**：CPU、GPU、NPU、TPU 到底差在哪？大模型为什么非要 GPU，又为什么越来越贵

**文案**：同一个 80 亿参数的模型，只看内存带宽估算，放在电脑 CPU 上每秒约出 6 个字，放在 H100 GPU 上可到 200 多个。差别在结构：CPU 是几个大核，擅长一步步的复杂逻辑；GPU 是上万个小核（H100 有 132 组 × 128 = 16,896 个），一条指令同时算一大片数；NPU 是手机和电脑里专做 AI 乘加的省电单元（微软 Copilot+ PC 要求每秒 40 万亿次以上）；TPU 是谷歌的 AI 芯片，乘加器排成 128 × 128 的脉动阵列。大模型几乎全是矩阵乘法，但真正的瓶颈是搬数据：每生成一个字要把全部权重从内存读一遍。普通电脑双通道内存 128 根数据线、约 96 GB/s，H100 的 HBM 有 5,120 根、3,350 GB/s。线这么多，只能把内存一层层叠起来贴在 GPU 旁边，据美光，同样容量 HBM 约要 3 倍晶圆；AI 数据中心把内存产能抢走，据 TrendForce，显存现货价从每 GB 约 2.5 美元涨到 7.5 美元。画面为按公开数据制作的 3D 示意。

**话题**：#GPU #芯片 #人工智能

## 小红书

**标题**：CPU / GPU / NPU / TPU 区别｜3D 拆给你看：大模型为什么要 GPU、显卡为什么涨价

**正文**：

🧠 CPU：几个大核，擅长一步步的复杂逻辑
🟦 GPU：上万个小核，H100 有 132 × 128 = 16,896 个，一条指令同时算一大片
📱 NPU：手机 / 电脑里只做 AI 乘加的省电专区（Copilot+ PC 要求 ≥ 40 TOPS）
🔲 TPU：谷歌的 AI 芯片，128 × 128 个乘加器排成方阵，数据一拍走一格
🧮 大模型几乎全是矩阵乘法：每个字 ≈ 2 × 参数量 次运算
🚚 真正的瓶颈是搬数据：每个字都要把 16GB 权重读一遍
🔌 电脑内存 128 根线（≈96 GB/s）vs HBM 5,120 根（3,350 GB/s）：差 35 倍
🧱 HBM 只能叠起来贴着 GPU 放：同容量约 3 倍晶圆（美光）
💸 AI 把内存抢光：显存现货价约涨 3 倍（据 TrendForce）

每秒字数是只看带宽的理论估算；画面为 3D 示意。

#GPU #CPU #NPU #TPU #显卡 #AI科普 #大模型 #芯片

## 出处（只写在这里，不上屏）

见 `inputs/chips-cpu-gpu-npu-tpu/sources.md`：
- NVIDIA H100：https://www.nvidia.com/en-us/data-center/h100/ ；https://developer.nvidia.com/blog/nvidia-hopper-architecture-in-depth/
- Google Cloud TPU 架构：https://docs.cloud.google.com/tpu/docs/system-architecture
- Copilot+ PC 40 TOPS：微软定义（转述 https://www.tweaktown.com/news/97159/ ）
- Kaplan et al. 2020：https://arxiv.org/abs/2001.08361
- 美光 / Tom's Hardware：https://www.tomshardware.com/tech-industry/semiconductors/micron-says-the-silicon-gap-between-hbm-and-ddr5-is-widening-with-every-generation
- TrendForce：https://www.trendforce.com/news/2026/07/03/news-amd-reportedly-raises-gpu-gddr-kit-prices-by-10-for-aib-partners-effective-jul-2026/
