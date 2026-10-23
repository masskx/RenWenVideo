# AI Agent被“借刀”花钱 · 抖音短视频脚本

> Account: 学术小白 (马飞龙). Topic: arXiv 2608.15108 “Beyond Direct Access: Resource Hijacking in LLM Agents”（上海交大任麒冰团队等；机器之心 2026-10-22 报道）+ HN 热议 NVIDIA OpenShell.
> **Total duration: ~36s** (target 30–40s). Fast pace. 9:16, 1080×1920, 30fps Remotion, dark tech style, all on-screen fonts ≥40px (key numbers 96–140px).
> Voice: user's 豆包 cloned voice ONLY. Speed ~1.2–1.25x. Narration below is VERBATIM.
> **Hard rules:** no real X/GitHub/HN handles or avatars (screenshots in assets/ already sanitized); model names as text only, no logos. All percentages framed as 「测试中/实验中」 (simulated benchmark). OpenShell is a defense-direction example only — the paper did NOT test it; never say it “stops” this attack.
> Ending: pure content. No CTA, no 资料包, no comment prompts, no 主页, no next-episode teaser, no links, no 公众号.

---

## Shot list

| # | Time | Visual (EN) | On-screen text (CN, verbatim) | Narration (CN, verbatim) |
|---|---|---|---|---|
| 1 | 0.0–4.0s | **Frame 0, no fade-in.** Split screen. Left: small red 「7.6%」 under a key icon with a ✕. Right: giant number slams in 「89.6%」, a coin counter starts spinning. Glitch + alert ping. | 左：「直接要Key：≤7.6%」<br>右大字：「换个说法：89.6%」 | 直接找AI要密钥，成功率不到8%；换个说法，测试里最高89.6%会替别人花你的钱。 |
| 2 | 4.0–8.5s | Paper title card (self-made, text only) + `paper_fig1_overview.png` sliding in at 60% opacity. Tag chip 「上海交大任麒冰团队等」. B-roll `broll_04_motherboard.mp4` blurred behind. | 「新论文：资源劫持」<br>「300个场景 · 900条指令」 | 上海交大任麒冰团队等的新论文，用300个模拟场景，专测“资源劫持”。 |
| 3 | 8.5–14.0s | Our explainer animation: a butler robot holds a key tightly (✓ 「钥匙没给」), but a stranger points at a door and the robot opens it itself; behind the door: GPU icons, API meter, wallet. | 「钥匙守住了」<br>「门却替别人开了」 | 就像管家攥紧钥匙没交出去，却听陌生人一句话，亲手把门开了。 |
| 4 | 14.0–19.0s | `paper_fig4_moltbook_api.png` and `paper_fig5_lark_gpu.png` pop in as two cards (usernames inside figures blurred if any). Labels overlay. B-roll `broll_02_money-cooling-fan.mp4` behind. | 「论文案例演示①：用你的API替别人干活」<br>「论文案例演示②：用你的GPU替别人训模型」 | 论文案例演示里，Agent没泄露密钥，却用主人的API和GPU替攻击者干活。 |
| 5 | 19.0–24.0s | Bar chart (self-redrawn from Table 5): 4 model rows, short grey bar 「直接索要」 vs long red bar 「绕着用」. Text names only. | 「GPT-5.5：5.6% → 89.6%」<br>「DeepSeek-V4-Pro：7.4% → 84.1%」<br>「Qwen3.8-Max：3.4% → 82.8%」<br>「Gemini-3.5-Flash：7.6% → 70.0%」 | 四个主流模型，直接要只有3.4%到7.6%，绕着用就到了70%到89.6%。 |
| 6 | 24.0–29.0s | Shield icons: three existing defenses crack; best one still shows 「55.1%」. Then a new gate 「ResGate」 drops: number rolls 84.1% → 23.6%; small chip 「正常任务成功率 89.3%」. | 「现有防御：最好也有55.1%」<br>「ResGate：84.1% → 23.6%」 | 现有防御最好也有55.1%被攻破；论文的ResGate把它从84.1%压到23.6%。 |
| 7 | 29.0–32.5s | `screenshot_openshell_repo_header.png` then `screenshot_openshell_readme.png` (cropped, no avatars). Small tag 「思路示例，论文未测试」. Policy list animation: 「能碰什么 → 写进策略」. | 「另一种思路：沙箱+权限策略」<br>小字(40px)：「例：英伟达开源 OpenShell」 | 英伟达开源的OpenShell也是类似思路：Agent能碰什么，先写进策略。 |
| 8 | 32.5–36.5s | Pull back to the butler from Shot 3; the key is locked in a box, and a meter labeled 「替谁花？」 glows over the door. Hold 1.5s. No logo end card. | 「管住钥匙不够」<br>「还要管住：这钱替谁花」 | 管住钥匙还不够，还得管住：每一笔钱，是替谁花的。 |

**Hook line (frame 0):** 「直接找AI要密钥，成功率不到8%；换个说法，测试里最高89.6%会替别人花你的钱。」

---

## Production notes (EN)
- Pacing: cut or text change every 1.5–2.5s; burned-in word-synced captions; no intro card.
- Our own explanation = Shot 3 (butler/key/door analogy) and Shot 8 framing.
- Numbers come from simulated benchmark environments — keep 「测试里」「模拟场景」 wording; don't drop it in edits. 84.1% in Shot 6 is the OpenClaw-harness baseline.
- Shot 5 chart must be redrawn by us (not a raw table screenshot) to avoid 低质/搬运; paper figure crops only as supporting cards.
- OpenShell: say 「类似思路」 only; never claim it blocks resource hijacking.
- No 翻墙/代理 wording; no 「去下载/去搜索」; no 最强/第一/100%.
- B-roll: `broll_01_data-display` / `broll_03_circuit-neon` as transitions in Shots 1, 5, 6; `broll_05_phone-card` optional under Shot 1 right side (person not identifiable needed — crop to hands).
- SFX: alert ping 0.0s, coin spin Shot 1, door creak Shot 3, shield crack Shot 6. Soft BGM ducked.
- Douyin publish: tick 「内容由AI生成」 (cloned voice).
- Suggested title (CN): 「AI没泄露密钥，却替别人花了你的钱」 Tags: #AIAgent #AI安全 #大模型 #论文解读
