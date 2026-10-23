# Vibe知识片：先学会代码出片，别急着堆知识点 · 抖音短视频脚本

> Account: 学术小白 (马飞龙). Topic: 观默 @guanmo_ai X Article 改写——本片讲「怎么用代码流水线做出 vibe 知识片」，**不是**再讲一个知识点本身；与公众号长文（工具表/四套路/提示词）不重复。
> **Total duration: ~37s** (target 30–40s). Fast pace ~1.2–1.25x. 9:16, 1080×1920, 30fps Remotion.
> Style: dark tech / knowledge-MV vibe (near-black, soft gold/cyan accents — NOT flashy entertainment glitch). All on-screen fonts ≥40px (key numbers 96–140px).
> Voice: user's 豆包 cloned voice ONLY. Narration below is VERBATIM.
> **Hard rules:** 未独立核验数字口播用「据称」；话题播放/涨粉写「据观默称」或「话题页显示」；不讲翻墙/代理/Claude·Notion 绕路账号；模型说「强模型（如 Claude Opus 一类）」即可，不贴提示词全文；不夸最强/第一；纯内容收尾。
> **Judgment (赛博小晚重写):** 口播要有自己的判断句，别只复述观默步骤——火的是产线、抽参数拦 PPT 味、样片拦返工、「一支一个」是约束提示词。
> Ending: pure content. No CTA, no 资料包, no comment prompts, no 主页, no next-episode teaser, no links, no 公众号/小红书.

---

## Shot list

| # | Time | Visual (EN) | On-screen text (CN, verbatim) | Narration (CN, verbatim) |
|---|---|---|---|---|
| 1 | 0.0–4.0s | **Frame 0, no fade-in.** Dark slate. Giant 「近80万」 slams in; chip 「据称 · 20天」. Soft topic chip 「#vibe知识大赏」. Optional blurred crop of `ref_topic_page_grid.jpg` behind (blur handles/UI chrome; no readable personal profiles). | 大字：「据称 · 20天近80万粉」<br>小字(40px)：「#vibe知识大赏」 | 据称有人靠「Vibe知识大赏」二十天涨粉近八十万。 |
| 2 | 4.0–10.0s | Self-drawn: glowing formula lines + beat pulse on near-black, then a code bracket `{ }` morphs into play ▶. Overlay chip 「先别急着学知识点」 then flip to 「画面是写出来的」. | 「先别急着学知识点」<br>「画面是代码写出来的」 | 先别急着学知识点本身。这类片火，是因为画面用代码写出来，能跟节拍动。 |
| 3 | 10.0–16.0s | Sanitize + crop `ref_topic_page_grid.jpg` (blur like counts / wipe watermarks) OR Remotion grid of abstract dark cards. Number badge 「①」. Arrow picks one 「涨得猛」 card; small chip 「先看它怎么动」. | 「① 先对标」<br>「话题页 · 看画面怎么动」 | 第一步先别开写：去话题页找近期涨得猛的对标，看它画面怎么动。 |
| 4 | 16.0–23.0s | Explainer: three swatches + type scale + contrast slider peel off a blurred keyframe. Overlay chips 「配色」「字号」「明暗」. Red-X flicker on a generic 「旧PPT」 card. Do **not** dump prompt text. | 「② 先抽参数」<br>「配色 · 字号 · 明暗」<br>小字(40px)：「跳过 → 易成旧PPT」 | 第二步先抽视觉参数——配色、字号、明暗。跳过这步，模型很容易写成旧PPT。 |
| 5 | 23.0–31.5s | Pipeline icons: Canvas → Playwright → ffmpeg → mp4. Timeline marker stops at 「15s 样片」, then unlocks 「全片」. Chip 「样片拦返工」. Small text-only 「强模型（如 Claude Opus 一类）」, no logo. | 「③ 样片 → 全片」<br>「Canvas · Playwright · ffmpeg」<br>小字(40px)：「样片拦返工」 | 第三步交给强模型，用Canvas、Playwright、ffmpeg出片；先渲十五秒样片，过了再全片。样片是拦返工。 |
| 6 | 31.5–37.5s | Pull back to calm slate. One large centered line holds ~2s; soft second line under it. Soft fade. No logo end card. No 观默 watermark. | 「一支片子 · 一个知识点」<br>小字(40px)：「约束提示词不发散」 | 一支片子，只讲透一个知识点。这是约束提示词不发散。 |

**Hook line (frame 0):** 「据称有人靠「Vibe知识大赏」二十天涨粉近八十万。」

**Ending line:** 「一支片子，只讲透一个知识点。这是约束提示词不发散。」

**核心判断（本片自己的，非观默原句复述）：** 这期教的是产线，不是又一个知识点；抽参数拦 PPT 味；样片拦返工；「一支一个」是提示词约束。

---

## Production notes (EN)

- Pacing: cut or text change every 1.5–2.5s; burned-in word-synced captions; no intro card before Shot 1.
- Angle vs wechat: 公众号讲工具表/五步/四套路/长流程；本抖音只压「代码出片产线 + 三条判断」。勿复述标题四套路、勿贴提示词、勿导流公众号。
- Numbers: 「近80万」 / 「二十天」 are **据观默称** (比特新语约 B站66.2万 + 抖音12.7万 ≈78万，约10/1起20天). Do not harden into 「已核实78万」. Topic play 「约12亿」 keep out of narration.
- Toolchain: HTML Canvas (+Three.js if 3D), Playwright frame capture, ffmpeg mux, Python SFX optional, 剪映 **BGM only** — never imply the cut is done in CapCut.
- Model: on-screen/narration 「强模型（如 Claude Opus 一类）」; **no** Claude/Notion account bypass, no 翻墙/代理, no pasted full prompts.
- Assets from 观默: `ref_topic_page_grid.jpg`, `ref_topic_rules_12yi.jpg`, `ref_jianying_bgm.jpg`, `ref_guanmo_cover_banner.jpg` — **脱敏** or redraw. Prefer self-drawn pipeline for Shots 2/4/5.
- `ref_jianying_bgm.jpg`: optional B-roll under Shot 5 only as 「剪映找BGM」 cue; do not promote a specific track title.
- SFX: soft whoosh 0.0s, light tick on ①②③, render-complete chime at sample unlock. Soft electronic BGM ducked under voice.
- Douyin publish: tick 「内容由AI生成」.
- Suggested title (CN): 「Vibe知识片先别堆知识点，学会代码出片」 Tags: #vibe知识大赏 #代码出片 #AI短视频 #知识科普
- Reminder: do **not** promise 10/31 流量扶持.

## Preferred stills

When no suitable live B-roll exists, use these as the **optimal choice**:
- Shot 3: `assets/ref_topic_page_grid.jpg` (blur metrics / sanitize)
- Shot 5 optional: `assets/ref_jianying_bgm.jpg` (crop to music-library chrome only)
- Prefer Remotion drawings for pipeline (Canvas→Playwright→ffmpeg) over raw screenshots
- Cover: `assets/cover_1x1.jpg`（自绘；勿原样搬观默水印封面）

## Cover (1:1)

- File: `assets/cover_1x1.jpg`
- **无合适素材时封面用此图为最优选择**
- Suggested cover copy: 「先别急着学知识点」+「代码出片」；副行「对标 → 抽参数 → 样片再全片」；勿原样搬「20天涨粉78万保姆级教程」与「观默 @guanmo_ai」水印
