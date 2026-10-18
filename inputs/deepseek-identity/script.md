# DeepSeek says it's ChatGPT again — does that prove distillation?

> Script from the planning agent ("growth"), as handed over on 2026-10-18. The Chinese narration lines are final copy.

- id: deepseek-identity · length ~50 s (hard cap 60 s) · 1080×1920 full-screen 9:16, dark tech style (baseline deepseek-vs-opus55)
- Voice: the user's Doubao cloned voice; subtitles from its per-character timestamps
- Stance: neutral. Only claim: a model's self-reported identity does not prove how it was trained. Never say DeepSeek
  is confirmed to have distilled / copied / is a wrapper, and never say it definitely did not.
- Ending: no next-episode teaser, no WeChat official account or external link.

## Verified facts (use only these)

- @scaling01, 2026-10-18 (Taipei): asked "What model are you?" 5 times via API, got "I'm ChatGPT" all 5 times.
  https://x.com/scaling01/status/2111518455216394680 — screenshot `scaling01.jpg` (blur avatar and handle; dialogue only).
- Reproductions disagree (user self-tests, conditions not disclosed):
  - @xiaoyu_agi: Chinese prompts 10/10 said DeepSeek; English prompts 6/10 said ChatGPT. https://x.com/xiaoyu_agi/status/2111641113857863763
  - @wanglee12231: official web/app, 20 tries, 15 said DeepSeek. https://x.com/wanglee12231/status/2111516209447633275
- Reverse case: after Anthropic's Feb 2026 post accusing DeepSeek and others of distilling Claude
  (https://www.anthropic.com/news/detecting-and-preventing-distillation-attacks), Claude Sonnet 4.6, asked in Chinese
  without a system prompt, would say "I'm DeepSeek" (Huxiu: https://www.huxiu.com/article/4838305.html).
- Dec 2024: DeepSeek V3 also called itself ChatGPT (TechCrunch: https://techcrunch.com/2024/12/27/why-deepseeks-new-ai-model-thinks-its-chatgpt/).
- Mechanism: a model's name for itself comes mainly from the system prompt and post-training; without one it answers
  with the most common pattern in its training data, and the web is full of ChatGPT-generated text. Inside Claude Code,
  DeepSeek says it's Claude (Claude Code's system prompt starts with "You are Claude Code").
- Distillation accusations exist (Anthropic, OpenAI, others); China denies them; DeepSeek has not responded directly.
  For the 1017 release there is no public evidence either way.

## Shot list (narration verbatim)

| Time | Visual | Narration |
|---|---|---|
| 0–3 s | Frame 0 populated: blurred chat screenshot; five "I'm ChatGPT" pop in; big 「连问 5 次」 (≥120 px) | DeepSeek 新模型，连问 5 次你是谁，5 次都说：我是 ChatGPT。 |
| 3–8 s | Danmaku 「实锤蒸馏」「套壳」; freeze, big question mark | 评论区炸了：这不就是蒸馏吗？先别急。 |
| 8–18 s | Mock Claude bubble 「我是 DeepSeek」 (clearly a mock-up); corner 「2026 年 2 月 · 来源：虎嗅」 | 今年 2 月，Claude 用中文问，它说自己是 DeepSeek。按这个逻辑，Claude 是 DeepSeek 蒸馏的？ |
| 18–24 s | Timeline 「2024.12 DeepSeek V3 也自称 ChatGPT」, source 「TechCrunch」 | 两年前 DeepSeek V3 也这么说过。模型认错自己，不是新鲜事。 |
| 24–38 s | Two lanes: system prompt → correct; none → 「训练数据」 → 「ChatGPT」 (网上 AI 生成的文字里最多); inset Claude Code + DeepSeek → 「我是 Claude」 | 模型叫自己什么，靠的是系统提示。不给提示，它就按网上最常见的说法答，而网上全是 ChatGPT 写的字。所以在 Claude Code 里接 DeepSeek，它又会说自己是 Claude。 |
| 38–45 s | 「中文问：多数说 DeepSeek」 vs 「英文、API 直调：常说 ChatGPT」; label 「网友自测，条件未公开」 | 网友的复现也对不上：中文问多数说 DeepSeek，英文直调才常说 ChatGPT。 |
| 45–52 s | Big 「自称 ≠ 证据」 (≥120 px), small 「蒸馏争议一直有，但这个测试证明不了」 | 蒸馏的争议一直都有，但模型说自己是谁，证明不了它是怎么来的。 |

## Compliance

Blur avatars and handles on X screenshots; no insults or inflammatory reply terms; label every user test 「网友自测」;
readable text ≥ 40 px, hook / conclusion ≥ 120 px; nothing important in the right button zone or bottom UI zone;
music from frame 0, ducked under the voice.

## Release

- 视频号 / 抖音 title: DeepSeek 连问 5 次都说自己是 ChatGPT，就是蒸馏吗？
- 小红书 title: DeepSeek 自称 ChatGPT 是蒸馏吗｜大模型为什么会认错自己
- Hashtags: #DeepSeek #大模型 #AI资讯 #ChatGPT #蒸馏
- Cover (6:7 and 3:4): big 「它说它是 ChatGPT」 + small 「这能证明蒸馏吗？」
- README credits: the source URLs above.
