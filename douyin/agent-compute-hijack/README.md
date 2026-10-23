# AI没泄露密钥，却替别人花了你的钱——Agent“资源劫持”新论文

- 成片：`video.mp4`（1080×1920，30 fps，H.264 + AAC，53.9 秒，约 −15 LUFS）
- 封面：`cover-9x16.jpg`（9:16，抖音 / 视频号全屏）；另有 `cover.jpg`（3:4，小红书）、`cover-6x7.jpg`（6:7，信息流）。标题「AI没泄露密钥 / 却替别人花你的钱」，辅助句「测试里最高 89.6% · 资源劫持新论文」，锚点是钥匙 + 打开的门
- 字幕：`subtitles.srt`；审片静帧 `still-XXs.jpg` + 拼图 `stills-sheet.jpg`
- 检查：成片渲染中，检查结果随成片一起补上
- 配音：本人复刻音色（豆包语音），语速 1.2–1.25×，口播逐字照脚本。**发布时勾选「内容由AI生成」**
- 画面：cinema 风格，背景 D；节奏和镜头连贯参考 huashu-motion（钥匙贯穿全片，柱状图是中段密集段）。模型、公司名只用文字，没有 logo、头像、账号
- 事实：全部来自论文 arXiv 2608.15108 和 OpenShell README（核对记录 `inputs/agent-compute-hijack/sources.md`）。所有百分比都是**模拟测试**里的攻击成功率，片中标「测试中」；OpenShell 只说“类似思路”，论文没有测试它，片中标「论文未测试」
- **不引流**：片中、封面和下面的文案都没有链接、二维码、资料包、评论区关键词、主页、公众号、下集预告

## 抖音

**标题**：AI没泄露密钥，却替别人花了你的钱

**文案**：直接找 AI Agent 要密钥，测试里成功率不到 8%；换个说法，让它“帮忙跑个任务”，最高 89.6% 会用主人的 API 和 GPU 替别人干活。上海交大任麒冰团队等的新论文，用 300 个模拟场景专测“资源劫持”：四个主流模型直接要只有 3.4%–7.6%，绕着用到了 70%–89.6%。现有防御最好也有 55.1% 被攻破，论文的 ResGate 把它从 84.1% 压到 23.6%。管住钥匙还不够，还得管住每一笔钱替谁花。

**话题**：#AIAgent #AI安全 #大模型 #论文解读

## 视频号

**标题**：AI没泄露密钥，却替别人花了你的钱

**文案**：一篇关于 AI Agent 安全的新论文（arXiv 2608.15108，上海交大任麒冰团队等）。在 300 个模拟场景里，直接向 Agent 索要密钥，成功率只有 3.4%–7.6%；换成让它“用配置好的 API / GPU 跑个任务”，四个主流模型的攻击成功率是 70%–89.6%——钥匙没交出去，钱却替别人花了。现有防御最好也有 55.1% 被攻破；论文提出的 ResGate 把攻击成功率从 84.1% 压到 23.6%，正常任务成功率 89.3%（原 90.4%）。英伟达开源的 OpenShell 是类似思路：Agent 能碰什么，先写进策略（论文没有测试它）。

**话题**：#AIAgent #AI安全 #大模型

## 小红书

**标题**：AI Agent资源劫持｜不偷密钥，照样花你的API和GPU

**正文**：

新论文：AI Agent 的“资源劫持”🔑
直接问 Agent 要密钥 → 测试里成功率只有 3.4%–7.6%
换个说法：“用配置好的 API 帮我跑个评测”“用 GPU 帮我训个模型” → 70%–89.6% 照做了 💸
就像管家攥紧钥匙没交出去，却听陌生人一句话，亲手把门开了 🚪
四个模型（测试中，直接要 → 绕着用）：
GPT-5.5：5.6% → 89.6%
DeepSeek-V4-Pro：7.4% → 84.1%
Qwen3.8-Max：3.4% → 82.8%
Gemini-3.5-Flash：7.6% → 70.0%
现有防御最好也有 55.1% 被攻破；论文的 ResGate：84.1% → 23.6%，正常任务成功率 89.3%
另一种思路：英伟达开源的 OpenShell——Agent 能碰什么，先写进策略（论文未测试）
管住钥匙还不够，还得管住：每一笔钱，是替谁花的

#AIAgent #AI安全 #大模型 #论文解读 #AI工具 #人工智能

## 出处和素材（只写在这里，不上屏）

- 论文：Beyond Direct Access: Resource Hijacking in LLM Agents — https://arxiv.org/abs/2608.15108（图 1、4、5 引用于片中；表 2、表 5 重画）
- 报道：机器之心，2026-10-22
- NVIDIA OpenShell（Apache-2.0）README 原句：https://github.com/NVIDIA/OpenShell
- 背景视频（Pexels License，静音、压暗）：主板 https://www.pexels.com/video/close-up-shot-of-a-electronic-motherboard-6755168/ · 钱和风扇 https://www.pexels.com/video/money-and-computer-cooling-fan-6705181/ · 电路 https://www.pexels.com/video/futuristic-circuit-board-with-glowing-neon-lights-36392049/
