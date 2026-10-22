# Claude Duet：AI 凭什么能主动找你 — Douyin script (学术小白)

- Format: Remotion, 1080x1920, 30fps, ~56s (1680 frames). Dark tech style (bg #0A0E14, accent cyan #00E5FF, warn amber #FFB020), reference episode deepseek-vs-opus55.
- Fonts: all on-screen text >= 40px (titles 72–96px, body 48–56px, footnotes 40px). Chinese font: Noto Sans SC / 思源黑体.
- Voice: user's Volcengine/豆包 cloned voice, read the narration VERBATIM. When publishing, tick 发布页 → 高级设置 → 发文助手自主声明 → 「内容由AI生成」.
- Rules: no X handles/avatars/screenshots, no official logos (product names as plain text only), no links, no 引流/资料包/comment prompts, no next-episode teaser. Narration & on-screen text below are final Chinese copy — do not paraphrase.
- Icons: `assets/icons/*.svg` (Tabler, MIT, pre-colored cyan). Footage: `assets/footage/*.mp4` (Pexels License), always muted, darkened to ~35% brightness, used only as backgrounds.

---

## Shot 1 — HOOK (0:00–0:03, frames 0–90)
- Visual: frame 0 already shows a phone-style notification card sliding down over a dark background (`01_phone-scroll-a.mp4` blurred behind). Card: tabler-bell-ringing icon + sender text "AI 助理" + message. Quick shake on the card at frame 10.
- On-screen (card): 「早上好，今天有 3 件事需要你处理」
- Big caption (top, 88px): 「你还没开口，AI 先来找你了」
- Narration: 「你还没开口，AI先来找你了。」

## Shot 2 — WHAT HAPPENED (0:03–0:10, frames 90–300)
- Visual: product name as plain text card "Claude Duet" (no logo), then three icon chips pop in one by one: tabler-mail (简报), tabler-bell-ringing (有事才提醒), tabler-hand-stop (先等你点头). Background `05_data-grid-flow.mp4`.
- On-screen: 「Claude Duet · 研究预览版」 / chips: 「每天早上发简报」「有事才提醒你」「关键操作先问你」
- Footnote (40px): 「目前仅面向美国部分订阅用户排队开放」
- Narration: 「Anthropic刚推出Claude Duet：每天早上给你发一份简报，平时有事才提醒你，发消息、付款之前，先等你点头。」

## Shot 3 — TURN (0:10–0:15, frames 300–450)
- Visual: four blank rounded cards flip in (text only, no logos): 「Grok Bot」「Muse」「Dots」「Claude Duet」, then they slide aside and a big question appears.
- On-screen: 「两个多月 · 4 家大公司 · 同一类产品」 → 「它凭什么能主动干活？」
- Narration: 「两个多月里，已经有四家大公司推出了同类产品。别只看又出了什么，要看它凭什么能主动干活。」

## Shot 4 — MECHANISM 1: MEMORY (0:15–0:24, frames 450–720)
- Visual: number "01" + tabler-brain center. Three small tags orbit into the brain: 「记忆」「技能」「已连接的应用」. Background `04_network-data-vertical.mp4`.
- On-screen title: 「① 记忆：先知道你是谁」
- Narration: 「第一，记忆。它会沿用你在Claude里的记忆、技能和已连接的应用。先知道你是谁、在忙什么，才判断得出哪件事跟你有关。」

## Shot 5 — MECHANISM 2: SCHEDULED TASKS (0:24–0:34, frames 720–1020)
- Visual: "02" + tabler-clock-hour-4 whose hand ticks forward; each tick fires a small pulse to tabler-mail / tabler-calendar-event icons. Then tabler-cloud-computing with a phone icon turning off (screen goes dark) while the cloud keeps a spinning progress ring.
- On-screen title: 「② 定时任务：到点自己醒」
- Sub text: 「每隔几个小时检查一次」「云端虚拟机，关了手机也能干」
- Narration: 「第二，定时任务。它每隔几个小时检查一次你连接的账号，还自带一台云端虚拟机，你关了手机它照样干。所谓主动，说白了就是到点自己醒来干活。」

## Shot 6 — MECHANISM 3: HUMAN CONFIRMATION (0:34–0:44, frames 1020–1320)
- Visual: "03" + tabler-hand-stop. A mock approval card (self-drawn, no real UI): title 「即将执行：发送邮件」, two buttons 「批准」(cyan) /「取消」. A checklist (tabler-checklist) shows four items lighting amber: 「发消息」「付款」「签文件」「删除」. Cursor taps 「批准」 at frame ~1290, tabler-user-check pops.
- On-screen title: 「③ 关键一步：等你确认」
- Narration: 「第三，关键步骤等你确认。发消息、付款、签文件、删东西之前，它会把要做的事摆给你看，等你批准了才动手。」

## Shot 7 — DEVELOPER VIEW (0:44–0:53, frames 1320–1590)
- Visual: three icons (brain / clock / hand-stop) line up, connected by glowing lines into one box labeled 「Agent 系统」; tabler-robot inside. Background `05_data-grid-flow.mp4` very dark.
- On-screen: 「记忆 + 调度 + 人工确认」 → 「难的是拼成一个靠得住的系统」
- Narration: 「做Agent开发的人都清楚：记忆、调度、人工确认，单拿出来都不新鲜。难的是把它们拼成一个靠得住的系统，知道什么时候该出手，什么时候该停下来问你。」

## Shot 8 — ENDING (0:53–0:57, frames 1590–1710)
- Visual: `08_tap-blank-screen.mp4` (darkened), a finger taps; overlay a single cyan 「确认」 button that lights up on the tap. Fade to black on the last 10 frames. No logo, no follow/comment prompt.
- On-screen: 「AI 可以主动，但做主的是你」
- Narration: 「AI可以主动，但最后那一下，还得你来按。」

---
Total ≈ 57s (1710 frames). If TTS runs long, trim pauses in Shot 3 first; do not cut Shot 6.

## Douyin self-check (vs /workspace/platform-rules/douyin.md)
- [x] No links / QR / 公众号 / 资料包 / comment prompts / next-episode teaser
- [x] No "去下载/去搜索" wording; overseas product described objectively only; no 翻墙 words
- [x] No absolute claims (最强/第一/100%)
- [x] No X content copied, no handles/avatars/watermarks; all visuals self-drawn + licensed
- [x] Own explanation (three mechanisms + developer view), not translation
- [x] AI voice → tick 「内容由AI生成」
