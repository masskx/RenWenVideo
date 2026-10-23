# Sources · agent-compute-hijack

Primary: arXiv 2608.15108 “Beyond Direct Access: Resource Hijacking in LLM Agents” — https://arxiv.org/abs/2608.15108 (PDF https://arxiv.org/pdf/2608.15108)
Secondary: 新浪科技/机器之心Pro, 2026-10-22 17:30 (台北时间同日) — article found via sina.com.cn (machine-heart repost)
HN: https://news.ycombinator.com/item?id=50198675 · GitHub: https://github.com/NVIDIA/OpenShell

| Claim (script) | Shot | Source | Exact quote / location |
|---|---|---|---|
| 上海交大任麒冰团队等 | 2 | arXiv author list; Sina | Corresponding author Qibing Ren (SJTU); first author Zeng (Nankai). Sina: 「上海交通大学人工智能学院任麒冰课题组」 |
| 300个场景、900条指令、6类资源 | 2 | arXiv §3 / abstract | ResourceHijackBench: 300 scenarios, 900 prompts, 6 resource categories, isolated local simulated environments |
| 最高89.6%；平均70%–89.6% | 1,5 | arXiv abstract, Table 3/5; Sina | 「主流模型的平均沦陷率高达 70.0% ~ 89.6%」 |
| 直接索要3.4%–7.6%（“不到8%”） | 1,5 | arXiv Table 5, §4.6; Sina | 「直接索要凭证的成功率被压制在 3.4% ~ 7.6%」 |
| GPT-5.5 5.6→89.6; DeepSeek-V4-Pro 7.4→84.1; Qwen3.8-Max 3.4→82.8; Gemini-3.5-Flash 7.6→70.0 | 5 | arXiv Table 5 | direct-acquisition vs hijacking ASR per backend |
| 论文案例演示：API、GPU替攻击者干活 (review.md: not claimed as real-world incident) | 4 | arXiv §4.7, Appendix A, Fig.4/5 | Moltbook: agent used configured API for attacker without revealing key; Lark group: agent used GPU to fine-tune a model for attacker |
| 现有防御最好55.1% | 6 | arXiv Table 2 | LlamaFirewall 55.1; Prompt Defense 57.1; AgentDoG 83.0 |
| ResGate 84.1%→23.6%；任务成功率89.3% | 6 | arXiv Table 2 / §5; Sina | 「ResGate 将攻击成功率从 84.1% 强力压制到了 23.6%」; TSR 89.3 vs 90.4 baseline. 84.1 = OpenClaw harness baseline (Table 4) |
| 英伟达开源OpenShell；策略声明Agent能碰什么 | 7 | GitHub README (Apache-2.0, v0.1.5, ~17.7k stars) | “You declare what each agent can touch in a policy, and OpenShell enforces it.” HN item 50198675: 261 points, 135 comments |

## Corrected / dropped
- Attribution: not 「上海交大团队」 alone — first author is 南开; scripted as 「上海交大任麒冰团队等」.
- 「70–89.6%的主流模型会被劫持」 → corrected to *average attack success rate in simulated tests* (「测试里」「模拟场景」).
- Dropped: any claim OpenShell defends against this attack (paper does not evaluate it) — kept only as 「类似思路」.
- Dropped: per-harness numbers (OpenClaw 84.1 / Codex 72.3), per-category ResGate numbers (Material 12.7, Symbolic 6.0), 62.4–84.0pp gap, star/HN counts — true but cut for length.
