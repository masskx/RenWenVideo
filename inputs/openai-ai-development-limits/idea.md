# openai-ai-development-limits：AI 该不该踩刹车，谁来定这条线？

## 想法

- 让观众记住一个问题：如果要用分数决定前沿 AI 何时暂缓研发，谁出题、谁能参加、由谁验收？
- 为什么现在讲：OpenAI 首席科学家 Jakub Pachocki 公开自 GPT‑3.5 起的预训练趋势，并提议前沿实验室约定研发上限。微软 AI 负责人随后公开了同一评测集上的结果，也说明微软取得该评测集是特例。两件事放在一起，刚好能拍清这把尺的用途和门槛。
- 0–3 秒先猜「我把冰块放进＿＿」，随后跳到原文公开的分数摘要。封面只写一个问题「AI 该不该踩刹车？」
- 约 50–55 秒，抖音 9:16。观众面向泛科技用户。

## 事实和出处

| 核对项 | 上屏和口播口径 | 一手来源 |
| --- | --- | --- |
| 数字和指标 | 文章给出的对数困惑度约为 GPT‑3.5 0.99、GPT‑4 0.91，后来部分模型低于 0.80。分数越低，代表在这套题上预测下一个词元越准。猜词是类比，三个摘录数值不能做成风险分。 | [OpenAI 正文和脚注 2–3](https://openai.com/index/perplexity-and-intelligence/) |
| 测试题怎么来 | 本文图上的数字来自 OpenAI 内部代码库的固定快照。作者也指出跨公司比较、衡量具体任务和捕捉后训练进展都有困难。 | [OpenAI 原文](https://openai.com/index/perplexity-and-intelligence/) |
| 谁提议停在哪 | Pachocki 提议用困惑度和其他指标设计共同研发上限，等安全监测到达具体里程碑后再越过。报道时属于建议；他文中预测的数值区间并非已经约定的停训线。 | [OpenAI 原文](https://openai.com/index/perplexity-and-intelligence/) · [作者原帖](https://x.com/merettm/status/2124549218995949967) |
| 微软做了哪一步 | Mustafa Suleyman 公开 MAI‑2 Base 的 0.819，称使用同一评测集与分词器，并得到 OpenAI 许可。他说这次访问是特例，未来跨实验室比较可能需要按字节计量和不同评测集。发帖支持透明与协调，未给出已经执行的共同上限。 | [微软 AI 负责人原帖](https://x.com/mustafasuleyman/status/2124663594449318173) |
| 争议怎么讲 | 「先把安全监测做扎实」和「谁有权定这张考卷」是两条讨论线。关于规则是否抬高后来者门槛，只作为开放问题。 | [Hacker News 讨论](https://news.ycombinator.com/item?id=50601525) |

素材和取景点见 [README](README.md)，口播与时间在 [script.md](script.md)。
