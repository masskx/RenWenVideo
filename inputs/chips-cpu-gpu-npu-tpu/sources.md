# sources.md — chips-cpu-gpu-npu-tpu（查于 2026-11-04）

| # | 数字 / 说法 | 口径（必须这样说） | 来源 |
|---|---|---|---|
| 1 | H100 SXM：16,896 个 FP32 CUDA 核心 | NVIDIA 官方架构文章 | https://developer.nvidia.com/blog/nvidia-hopper-architecture-in-depth/ |
| 2 | H100 SXM：80 GB HBM3，显存带宽 3.35 TB/s | NVIDIA 官方数据表 | https://www.nvidia.com/en-us/data-center/h100/ ；https://resources.nvidia.com/en-us-gpu-resources/h100-datasheet-24306 |
| 3 | Copilot+ PC：NPU ≥ 40 TOPS（每秒 40 万亿次运算） | 微软的定义 | https://www.tweaktown.com/news/97159/ （转述）；微软 Copilot+ PC 官方页面 |
| 4 | TPU 的矩阵单元 MXU：128 × 128 个乘加器组成的脉动阵列（v6e 起 256 × 256），每周期 16K 次乘加；bf16 乘、fp32 累加 | Google Cloud 官方文档 | https://docs.cloud.google.com/tpu/docs/system-architecture |
| 5 | 推理时每个 token 约 2 × 参数量 次浮点运算 | Kaplan et al. 2020《Scaling Laws for Neural Language Models》的近似（C_forward ≈ 2N） | https://arxiv.org/abs/2001.08361 |
| 6 | 80 亿参数、FP16 → 权重约 16 GB；batch 1 时每出一个 token 要把权重读一遍 | 算术（8×10⁹ × 2 字节）；“每 token 读全部权重”是解码阶段的标准近似 | 自算 |
| 7 | 双通道 DDR5-6000 理论带宽 ≈ 96 GB/s | 算术：6000 MT/s × 8 字节 × 2 通道 | 自算 |
| 8 | 每秒字数上限：CPU 侧 96 / 16 ≈ 6；H100 3350 / 16 ≈ 209；带宽差 3350 / 96 ≈ 35 倍 | **估算的理论上限**（只看带宽，batch 1，FP16）；实际还受算力、软件影响 | 由 #2、#6、#7 算出 |
| 9 | 同容量 HBM3E 约需 DDR5 的 3 倍晶圆面积 | 美光（Hot Chips 2026）口径 | https://www.tomshardware.com/tech-industry/semiconductors/micron-says-the-silicon-gap-between-hbm-and-ddr5-is-widening-with-every-generation （PR #63 素材 text/toms-micron-3x.txt）|
| 10 | 双 GPU 封装里内存约占 90% 的硅面积 | 美光讲者在 Hot Chips 的说法，Tom's HW 转述 | 同 #9 |
| 11 | GDDR6 现货价从约 2.5 美元/GB 涨到约 7.5 美元/GB（约 3 倍）；AMD 给板卡厂的 GPU + GDDR 套件涨约 10%（2026-07 起） | **据 TrendForce 报道**（“reportedly”） | https://www.trendforce.com/news/2026/07/03/news-amd-reportedly-raises-gpu-gddr-kit-prices-by-10-for-aib-partners-effective-jul-2026/ |
| 12 | 4Q26 一般型 DRAM 合约价预计季增 10–15% | TrendForce 09-30 预测 | https://www.trendforce.com/presscenter/news/20260930-13258.html |

不用：RTX 5090 “5000 美元”（传闻）、NVIDIA 再涨 20–30%（台湾媒体传闻）、“显存占 80% BOM”（来源有争议）。
