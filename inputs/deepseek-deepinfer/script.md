# DeepSeek开源了什么？· 抖音短视频脚本

> Account: 学术小白 (马飞龙). Hot topic: 「DeepSeek才是真正的OpenAI」 (百度实时热搜 #10, 观察者网 2026-10-22).
> **Total duration: ~37s** (target 30–40s). Fast pace. 9:16, 1080×1920, 30fps Remotion, dark tech style (follow `deepseek-vs-opus55` reference episode), all on-screen fonts ≥40px (key captions 64–96px).
> Voice: user's Volcengine/豆包 cloned voice ONLY. Speed ~1.15x. Narration below is VERBATIM.
> **Hard rules:** no real X handles/avatars/screenshots, no OpenAI/DeepSeek/NVIDIA/Huawei logos (text names only), no photos of real people (no Altman). No cost numbers (source gives none) — cost framed qualitatively. 「Real OPEN AI」 always framed as 「被称为」.
> Ending: pure content. No CTA, no 资料包, no comment prompts, no 主页, no next-episode teaser, no links, no 公众号.

---

## Shot list

| # | Time | Visual (EN) | On-screen text (CN, verbatim) | Narration (CN, verbatim) |
|---|---|---|---|---|
| 1 | 0.0–3.0s | **Frame 0, no fade-in.** Big glitch title: the word "OPEN" lifts off a grey generic "closed box" icon and slams onto a glowing open-box icon. Alert ping. | 大字：「真正的 OPEN AI？」<br>小字(40px)：「海外网友这样称呼DeepSeek」 | 被海外网友称为“真正的OpenAI”，DeepSeek这次到底开源了什么？ |
| 2 | 3.0–7.0s | Date chip 「10月20日」 snaps in; a self-drawn repo card (no GitHub UI) labeled 「DeepInfer」 unlocks with a padlock opening. Sub-label 「内部生产级」. | 「10月20日 开源」<br>「DeepInfer：推理框架」 | 10月20日，它把自己内部生产级的推理框架DeepInfer开源了。 |
| 3 | 7.0–11.5s | Plain-words explainer: a "dispatcher" icon routes incoming request bubbles to a row of chip icons. Three gauges tick up: 「延迟」「吞吐量」「硬件」. | 「推理框架 = 调度员」<br>「决定：多快 · 多能扛 · 要多少硬件」 | 推理框架是什么？就像调度员，管模型怎么用算力处理你的请求，决定回答多快、能扛多少人、要多少硬件。 |
| 4 | 11.5–16.5s | Same brain/model icon in two lanes. Lane A: slow conveyor, coin stack growing tall. Lane B: fast conveyor, each request uses fewer compute blocks, coin stack small. Both labeled 「同一个模型」. | 「同一个模型 · 成本能差很多」<br>「每次请求省算力 → 省钱、省电」 | 同一个模型，换个框架，跑起来的成本可能差很多。框架越高效，每次请求用的算力越少，还可能更省电。 |
| 5 | 16.5–21.5s | Two tech chips fly in: 「分布式推理」 (workload splitting across several chip icons) and 「投机解码」 (draft tokens shooting ahead, then checked ✓). Then two generic chip tiles (text only, no logos): 「英伟达 SM100」「华为昇腾950」. | 「分布式推理 + 投机解码」<br>「已兼容 英伟达SM100 / 华为昇腾950」 | DeepInfer整合了分布式推理、投机解码，把活分到不同硬件上，已经兼容英伟达SM100和华为昇腾950。 |
| 6 | 21.5–25.5s | Cost arrow flows down a chain: 「推理成本↓」 → 「服务商利润空间↑」 → 「AI服务价格 可能↓」. | 「推理更便宜 → AI服务可能更便宜」 | 对AI服务商来说，推理成本低了，利润空间就大了，AI服务也有可能变便宜。 |
| 7 | 25.5–31.5s | A "full stack" tower of blocks; most blocks light cyan, including a big 「核心解耦功能」 block; three blocks stay grey/dashed: 「KV缓存系统」「Prefill/Decode解耦（未全放）」「负载均衡」. | 「没有全开」<br>灰块：「KV缓存系统」「预填充/解码解耦」「负载均衡」<br>亮块：「大部分核心解耦功能 ✓」 | 但它不是全套。KV缓存系统、预填充和解码的解耦、负载均衡，这些没有完全放出来，不过大部分核心的解耦功能已经在里面了。 |
| 8 | 31.5–37.0s | Pull back: the open box from Shot 1, light spilling out across many small developer-desk icons. Hold 1.5s on final text. No logo end card. | 「推理技术，很少有人公开」 | 推理技术，一直被AI公司当成核心竞争力，很少公开。这次，它摊开了一大半。 |

**Hook line (frame 0):** 「被海外网友称为“真正的OpenAI”，DeepSeek这次到底开源了什么？」

---

## Production notes (EN)
- Pacing: cut or text change every 1.5–2.5s; burned-in word-synced captions; no intro card before Shot 1.
- All visuals self-made Remotion animations (flat icons, conveyors, chip tiles). NO X/GitHub screenshots, NO real handles/avatars, NO company logos, NO Altman video/likeness.
- Our own explanation = Shots 3–4 (dispatcher analogy; same model → different cost) and Shot 8 framing.
- Cost is qualitative only (「可能差很多」); source gives no numbers.
- SFX: alert ping at 0.0s, unlock click in Shot 2, coin-drop in Shot 4, soft BGM ducked under voice.
- Douyin publish: tick 「内容由AI生成」 (cloned voice).
- Suggested title (CN): 「DeepSeek这次开源了什么？」  Tags: #DeepSeek #大模型 #开源 #AI
