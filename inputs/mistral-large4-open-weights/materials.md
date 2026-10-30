# materials.md — Mistral Large 4 开放权重（仅素材，不是脚本）

## 核实要点（均出自官方公告原文 announcement.txt）
- 10 月初预览，10-29 放出改进版权重；“又加三周强化学习”。1T 参数、原生多模态、MoE；HF 仓库名 Mistral-Large-4-1T-A52B（A52B=约 52B 激活，名称推断，待模型卡确认）。
- FrontierCode 2.0（Cognition 私有）19.7%，开源第一；对比 DeepSeek V4.1 Flash 19.3、GLM-5.3 17.8、Kimi K3 17.3、GLM-5.3 Flash 14.2（图中数值顺序对应，以截图为准）。
- AA Coding Agent Index 48%，与 GLM-5.3“基本持平”，平均少用 47% token。
- Terminal-Bench 4.0 41%，比预览 +13 个百分点，开源第一，输出 token -30%。
- Surge Code 人类盲评：胜 GLM-5.3 / Kimi K3（64%）、DeepSeek V4.1 Flash（56%）；输 Claude Opus 5.5（22%）。
- AA Cyber Index 51%（注意图中 DeepSeek-V4.1-Flash 57%、MiMo 56% 更高——不是第一）。恶意网安请求拒答 96.6%。
- Finch 73.3%（开源第二，Kimi K3 77.3 更高）；BrowseComp 84.5（Kimi K3 91.2 更高）；B3 抗攻击 97.1%。
- 三档推理 Low/Medium/High（默认 High）。
- 许可：Mistral Ecosystem Open-Weight license（改版 MIT），可免费用/改/微调/商用；**做 MaaS（模型即服务）的公司商用前须另签授权**。
- 价格 $0.70 输入 / $0.07 缓存 / $2.10 输出（每百万 token）；HN 评论称预览价为 $1.36/$4.18（社区说法，未核官方）。
- 渠道：Mistral Studio、API、OpenRouter、HF、vLLM/SGLang、NVIDIA NIM、Microsoft Foundry。

## 口径/注意
- 所有分数 = 官方自报；第三方榜单数字由 Mistral 转述，未逐一到 AA/Cognition 官网核。
- “开源编码第一”只限编码类；网安、金融、浏览并非全部第一——标题别说“全面第一”。
- HN 主流质疑：许可证不是 OSI 开源，应叫“权重可得”；1T 本地难跑（有人 4×H200 仍需 3–4bit 量化）；拒答率没配“误拒率”。
- 网安段只讲分数和政策，不讲攻击流程。

## 补充口径（08:45）
- 激活参数说法不一致：官方 10-06 预览帖写 52B 激活、AA 写 1.1T/52B、HF 博客写约 1T/49B → 建议说“约 1 万亿参数”，激活数不报或写“约 50B”。
- 第三方 AA 对比页（ML4 High vs GLM-5.3 Low）显示 Terminal-Bench 4.0 25%、FrontierCode 15%，**明显低于**官方自报的 41%/19.7%（可能是旧数据/不同设置，未核）→ 跑分一定要标“官方自报”。
- AA 对比页：ML4 输出速度 161 token/s，GLM-5.3 Low 74（Eko 10-30 08:50 核正）。同页 Terminal-Bench 4.0：ML4 High 25% vs GLM-5.3 Low 35%；FrontierCode 2.0：15% vs 13%；AA 智能指数 26 vs 23。AA 页未注明测的是不是 10-29 版权重。
- HF 博客：发布当天在 AA 智能指数里是开源第 5（不是第 1）。
- 国产三家没有官方回应或对比。
