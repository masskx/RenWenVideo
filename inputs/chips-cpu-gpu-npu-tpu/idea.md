# chips-cpu-gpu-npu-tpu · 想法（用户 2026-11-04）

用户原话：“Create a science-based video explaining what CPUs, GPUs, NPUs, and TPUs are. Then, explain why large models require GPUs and why their prices are increasing.”

- 科普：CPU / GPU / NPU / TPU 各是什么，差在哪（结构，不是只打比方——用户 2026-11-04 嫌之前的技术讲解“quite basic”）。
- 为什么大模型要 GPU：算得多（矩阵乘法，每个字 ≈ 2 × 参数量次运算），更要搬得快（每出一个字要把全部权重从内存读一遍——内存带宽才是瓶颈）。
- 为什么 GPU / 显卡在涨价：AI 的 HBM 吃晶圆（同容量约 3 倍），内存被 AI 数据中心抢走，显存（GDDR）现货价涨了约 3 倍，AMD 给板卡厂的 GPU + 显存套件涨约 10%。
- 素材情况 C（用户没给素材）：画面全部用代码画（芯片版图、管线、方阵）；一张真东西：SK 海力士官方的 GPU + HBM 结构模型照片（已随 PR #63 入库、审过）。
- 数字全部见 sources.md；估算（每秒几个字）在画面上标「估算 · 理论上限」。
