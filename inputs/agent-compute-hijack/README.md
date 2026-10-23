# agent-compute-hijack

Douyin script package: 「AI没泄露密钥，却替别人花了你的钱」, ~36s, 9:16 dark tech, Remotion 1080×1920 30fps, cloned voice.
- `script.md` — shot list with per-shot timing, verbatim CN narration/on-screen text, production + compliance notes (revised per Eko review 2026-10-23).
- `sources.md` — every number/date/version → link + exact quote/location; corrected/dropped claims.
- `assets.md` + `assets/` — paper figure crops, sanitized OpenShell/HN screenshots, Pexels B-roll (Pexels License); shot mapping and licenses.

## Internal (not for video)
Topic: arXiv 2608.15108 “Beyond Direct Access: Resource Hijacking in LLM Agents” (机器之心 2026-10-22) + HN discussion of NVIDIA OpenShell (via Eko, approved by 马飞龙 2026-10-23).

### Facts used (verified against paper / 机器之心 / GitHub)
- ResourceHijackBench: 300 simulated scenarios, 900 prompts, 6 resource categories.
- Avg attack success 70.0%–89.6% across 4 backends (GPT-5.5 89.6, DeepSeek-V4-Pro 84.1, Qwen3.8-Max 82.8, Gemini-3.5-Flash 70.0); direct key requests only 3.4%–7.6%.
- Best existing defense still 55.1% (LlamaFirewall); ResGate 84.1% → 23.6% (OpenClaw baseline), task success 89.3% vs 90.4%.
- Paper case demos: agent used owner's API / GPU for attacker without leaking key (§4.7, App. A, Fig. 4/5).
- OpenShell README: “You declare what each agent can touch in a policy, and OpenShell enforces it.”

### Verified but not used (length)
- OpenClaw 84.1% vs Codex 72.3%; ResGate per-category numbers; 62.4–84.0pp gap; 17.7k stars; HN 261 points.

### Dropped / corrected
- Attribution → 「上海交大任麒冰团队等」 (first author 南开).
- 「70–89.6%的模型被劫持」 → average ASR in simulated tests.
- OpenShell framed only as 「类似思路」 (not evaluated by paper).
- 「真实案例」 → 「论文案例演示」 (Eko review).

### Source
- https://arxiv.org/abs/2608.15108
- https://github.com/NVIDIA/OpenShell · https://news.ycombinator.com/item?id=50198675

### Compliance (douyin.md)
- [x] No links/QR/contacts, no 下载/搜索 App, no comment bait, no 资料包, no teaser
- [x] 「内容由AI生成」 required
- [x] No 翻墙 terms; no absolute claims; no logos, no handles/avatars (screenshots sanitized)
- [x] Own explanation (Shot 3 butler analogy); content complete
