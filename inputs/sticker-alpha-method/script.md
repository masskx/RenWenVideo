# 一个角色 → 一整套透明表情包 — Tutorial Video Script (≈90 s)

> **Length override:** this episode targets **≈88–92 s**, deliberately **overriding the repo's ≤60 s rule**, because it teaches a 4-step hands-on method (lock character → vary actions → transparent background → QA) and every step needs a visible before/after.

Language rule: everything for you (Claude Code) is in English. **Chinese narration and Chinese on-screen text are VERBATIM** — do not rewrite them.

All visuals in `materials/` were **generated for this video by AI using the method itself** (prompts in README §3) plus local compositing (text, cut-outs, test backgrounds). No post media is used. Label generated imagery 「AI 生成示例」 (small, bottom-right) where it is shown full-screen; no 「案例展示」 label is needed.

---

## 0. The combined idea (what to teach)

Two posts, one method — **"one locked character → a consistent set of transparent sticker assets"**:

- **Post A (sticker pack):** don't plan dozens of sets; one character, a few short phrases. Generate **one text-free master** first (front half-body, plain background, bold flat lines, space reserved at the bottom for text). Check it **shrunk down** — if glasses/mouth turn to mush, reduce detail. Then **reuse the same master as the reference every time**, repeat the fixed features, change only the action line; **don't chain from the latest image** (drift accumulates). If one image drifts, redo only that one; if hands keep failing, switch to a simpler action. Add text afterwards: bold dark text, ≤2 lines, same font/size/position, phrases ≤6 characters. Check at ~¼ size; check transparent versions on dark and light backgrounds for white fringes.
- **Post B (transparent assets):** "transparent" means an **Alpha channel** (8-bit: 0 = fully transparent, 255 = fully opaque, in between = semi-transparent). A white-background image carries a white box when placed on a new background. **A checkerboard painted into the pixels is just an ordinary background.** Test assets on dark / light / colored backgrounds to catch white edges and leftover background. Transparent assets are reusable: stickers, posters, video overlays, UI, slides.
- **Generalization (say it explicitly):** any image-generation model can do steps 1–2. For step 3, some models output real transparent PNG directly; others don't — then generate on a plain background and remove it with any background-removal tool. (Our own run: the prompt asked for a transparent PNG, the model still returned a white-background JPG → `A07` / `V07`.)

Do **not** mention specific apps, pricing, selling stickers, or platform upload rules.

---

## 1. Hook (frame 0) + 2 alternatives

**Chosen — A: "one character → a whole set, already transparent"**
- Frame 0: `E02_chat_mock_9x16.jpg` (dark chat UI) with the three stickers popping in one by one (scale 0→110%→100%, 0.15 s each), then `V05_xiabankuaile_cheer.mp4` 0.0–2.0 s as a big PiP bounce.
- On-screen (≥72 px): **一张图 → 一整套表情包**  sub: **还是透明底**
- Why: shows the payoff in the first second, relatable (everyone sends stickers at work), and "transparent" is a mini open loop paid off in chapter 3.

**Alt B — "this 'transparent' image is fake"**
- Frame 0: `D03_fake_checkerboard_vs_real_alpha_on_blue.jpg` left half only, then wipe to reveal the right half.
- On-screen: **这张"透明图"是假的**  Narration: 「这张图看着是透明的，其实是假的。做透明表情包，先躲开这个坑。」
- Why: strong curiosity/contrarian hook; less broad than A.

**Alt C — "five actions, same face"**
- Frame 0: fast 0.4 s cuts V02 → V03 → V04 → V05 → V06.
- On-screen: **5 个动作 脸一点没变**  Narration: 「五个动作，脸一点没变。秘诀就一句：每次都用同一张图当参考。」
- Why: proves consistency instantly; good for creators who struggle with character drift.

---

## 2. Global style & compliance

- 9:16, 1080×1920, 30 fps. Dark tech / blueprint (deep navy, faint grid, cyan + orange accents), same visual language as `deepseek-vs-opus55`.
- Fonts ≥40 px (titles ≥72 px, captions 48–56 px). Burned-in Chinese subtitles synced to VO.
- **Chapter bar** at top, always visible: `01 定角色 · 02 换动作 · 03 透明底 · 04 验收 · 05 用起来`.
- Re-hook every 15–20 s (see map in §5).
- Voice: **Volcengine / 豆包 cloned voice only**. "Alpha" read as English "阿尔法"; "PNG" as letters P-N-G; "PPT" as letters.
- Music from frame 0, ducked under VO (−18 to −22 dB).
- All character art is an original AI cartoon — no real person, no brand/logo. The chat mock is a generic UI, title 「工作群（示范对话）」, no real contacts.
- `A00_bad_too_detailed.jpg` / `V00` is a deliberately over-detailed counter-example (painterly, semi-realistic); show it small (≤50 % width) and only in the ¼-size comparison.
- No links, no 公众号, no teaser, no promotion, no first-person "I tested". OK to say 「下面的示例都是用这套方法让AI生成的」.
- Douyin: tick **「内容由AI生成」** when publishing.
- Priority: hook > retention > readability > fidelity > polish.

---

## 3. Material treatment notes

- `A0x_*.png` (720×720, white bg) are the generated stills; `V0x_*.mp4` (1080×608, 3 s, no audio) are the same stills brought to life (blink, nod, small gesture). Character sits in the centre third — crop to a centred square (x ≈ 300–780 of 1080) for 9:16 layouts.
- `B0x_*_alpha.png` = real RGBA cut-outs (transparent PNG). `C0x_*_sticker_white.png` / `_alpha.png` = 512×512 finished stickers with text (white-bg and transparent versions).
- `D0x` = test/comparison boards already composed (1440 wide or 1280 wide) — pan/zoom on them.
- Clips are 3 s; use 0.0–2.5 s typically; loop or freeze last frame if a beat runs longer. Never play a clip slower than 0.8×.
- `previews/` has 4 fps contact sheets with timecodes.

---

## 4. Storyboard (≈90 s)

| # | Time | Chapter | Visual (asset, in–out, treatment) | Chinese on-screen text (verbatim) | Narration |
|---|---|---|---|---|---|
| 1 | 0.0–4.5 | Hook | `E02_chat_mock_9x16.jpg` full-frame; stickers pop in sequentially (they are baked in — reveal them with 3 animated masks top→bottom) | 一张图 → 一整套表情包 | L1 first sentence |
| 2 | 4.5–8.5 | Hook | `V05_xiabankuaile_cheer.mp4` 0.0–2.5, centred square crop, scale-bounce; small tag 「AI 生成示例」 | 还是透明底 · 任何生图模型都能用 | L1 second sentence |
| 3 | 8.5–14.0 | 01 定角色 | `V01_master_blink_nod.mp4` 0.0–3.0 square crop on left 55 %; right side text card of the master prompt (Chinese version, README §3 P1), key phrases highlighted cyan: 正面半身 / 纯色背景 / 粗线条平涂 / 下方留字 | 先出一张不带字的定稿 | L2 to 「…写字的位置」 |
| 4 | 14.0–22.0 | 01 | `D05_quarter_size_check_simple_vs_detailed.jpg`: start zoomed on the big detailed portrait (right half), animate it shrinking to the small thumbnail, then pan left to the simple sticker + its small version; red ✗ on detailed, green ✓ on simple | 缩小看：糊了就减细节 | L2 second sentence |
| 5 | 22.0–26.0 | 02 换动作 | `A01_master.png` pinned top-left as a card labelled 「定稿·参考图」; arrows fan out to 4 slots | 每次都用同一张定稿当参考 | L3 first sentence part 1 |
| 6 | 26.0–31.0 | 02 | Slots fill with `V02` 0.0–1.2, `V03` 0.0–1.2, `V04` 0.0–1.2, `V06` 0.0–1.2 (jump cuts), each slot shows its action line: 举手比OK / 举着手机看 / 双手合十 / 竖食指 | 固定特征不变 · 只换最后一句动作 | L3 「重复发型…只换最后一句动作」 |
| 7 | 31.0–37.0 | 02 | Motion-graphic diagram: chain 定稿→图1→图2→图3 with growing red "偏差" bar ✗ vs star 定稿→each ✓ | 别拿新图当参考 · 跑偏只重做那张 | L3 rest |
| 8 | 37.0–43.0 | 03 透明底 | Motion graphic: pixel grid zoom, each pixel shows RGB + A; A=0 transparent, A=255 opaque, middle = semi | Alpha = 0 透明 · 255 不透明 | L4 first sentence |
| 9 | 43.0–49.0 | 03 | Split: left text card 「提示词：…透明背景，PNG」 (README P7), right `V07_asked_transparent_got_white.mp4` 0.0–2.0 → freeze; stamp 「返回：白底 JPG」 | 说了透明 ≠ 真透明 | L4 「有的模型…给了白底」 |
| 10 | 49.0–53.0 | 03 | `D04_white_box_vs_alpha_on_blue.jpg` before/after wipe left→right (white box vs clean cut-out on blue) | 纯色底 → 去背景 | L4 「那就先出纯色底，再去掉背景」 |
| 11 | 53.0–56.5 | 03 | `D03_fake_checkerboard_vs_real_alpha_on_blue.jpg` zoom on left (checkerboard baked in, on blue), red ✗; then right ✓ | 棋盘格画进图里 = 假透明 | L4 last sentence |
| 12 | 56.5–62.0 | 04 验收 | `D01_alpha_on_dark_light_color.jpg`: reveal row by row (dark → light → orange), slow push-in | 深色 · 浅色 · 彩色 底都试一遍 | L5 first sentence |
| 13 | 62.0–66.5 | 04 | `D02_naive_delete_white_vs_edge_cutout_on_dark.jpg` split-screen; circle the teeth/eye highlights on the left (they are punched through) | 一键删白色 ✗ 牙齿眼睛被抠穿 / 从边缘抠背景 ✓ | L5 second sentence |
| 14 | 66.5–71.5 | 04 | `C03_mashangkan_sticker_white.png` full → animate shrink to 25 % inside a phone-chat frame; text stays readable ✓ | 缩到 1/4 还认得出字 | L5 third sentence |
| 15 | 71.5–77.0 | 05 用起来 | `E01_overview_grid.jpg` slow pan; overlay rules card | ≤6个字 · 粗黑字 · 位置统一 | L6 first sentence |
| 16 | 77.0–83.0 | 05 | Three quick mock-ups made by you from `B01_master_alpha.png` / `B05_xiabankuaile_alpha.png`: (a) dropped onto a simple poster background with a title, (b) as a corner overlay on a video frame, (c) on a slide | 海报 · 视频贴图 · PPT | L6 second sentence |
| 17 | 83.0–90.0 | 05 | Back to `E02_chat_mock_9x16.jpg`, then `V02_shoudao_ok.mp4` 0.0–2.5 as final PiP; end on 「收到」 sticker | 先做四张 发进聊天试试 | L6 last sentence |

---

## 5. Full narration (Chinese, verbatim) — ≈380 characters, ≈85–90 s

L1 一张角色图，变成一整套能直接发的表情包，还是透明底的。这套方法，任何一个生图模型都能用。

L2 第一步，定角色。先只出一张不带字的定稿：正面半身、纯色背景、粗线条平涂，下方留出写字的位置。选图时缩小看，眼镜和嘴巴糊成一团，就让模型减少细节。

L3 第二步，换动作。每次都附上同一张定稿当参考，重复发型、眼镜、衣服这些固定特征，只换最后一句动作。别拿上一张新图当参考，偏差会越传越大。哪张跑偏了，只重做那一张。

L4 第三步，做透明底。透明靠的是Alpha通道，文件里存着每个像素的透明度。有的模型能直接输出透明PNG；不支持的，比如这张，说了透明还是给了白底，那就先出纯色底，再去掉背景。棋盘格要是画进了图里，那只是普通背景。

L5 第四步，验收。把透明图放到深色、浅色、彩色底上，看有没有白边。别一键删掉所有白色，牙齿和眼睛高光会被一起抠穿。再缩到四分之一大小，字认不出来，就把人缩小、把字放大。

L6 每句话六个字以内，粗黑字、位置统一。做好的透明角色，还能接着用在海报、视频贴图和PPT里。先做四张，发进聊天里试试。

Re-hook map: 0 s payoff hook → ~14 s shrink test (✗/✓) → ~26 s five consistent actions → ~43 s "说了透明 ≠ 真透明" → ~53 s fake checkerboard → ~62 s punched-through teeth → ~77 s reuse in poster/video/PPT → ~83 s chat payoff.

---

## 6. Fact sources (for you; not on screen)

| Claim | Source |
|---|---|
| Master first (front half-body, plain bg, bold flat lines, text area), shrink check, same reference every time, don't chain, redo only the drifted one, simpler actions, ≤6 chars, bold text ≤2 lines, same position, ¼-size check, dark/light background check | Post A (README §6) |
| Alpha channel; 8-bit 0 = transparent / 255 = opaque; white bg = white box; painted checkerboard = ordinary background; test on dark/light/colored backgrounds; transparent assets reusable for stickers, posters, video overlays, UI | Post B (README §6); 8-bit alpha range is the standard PNG definition |
| "Some models output transparent PNG directly, some don't" | OpenAI image API docs: `background: "transparent"` is supported only on some GPT Image models and some models explicitly don't support it; our own test with the generator used here returned a white-bg JPG (`A07`) |
| "Naive delete-all-white punches holes in teeth/eye highlights" | Demonstrated on our own asset (`D02`, local processing) |

---

## 7. Cover text

- **6:7:** main 「一张图 做一整套表情包」 / sub 「透明底 · 4步」. Visual: `E01_overview_grid.jpg` 2×3 on navy.
- **3:4:** main 「AI做专属表情包｜透明底不翻车」 / sub 「定角色→换动作→抠透明→验收」. Visual: `C05_xiabankuaile_sticker_alpha.png` large + `D03` checkerboard ✗ small.

---

## 8. Publishing copy

**Douyin (primary)**
- Title: 「一张角色图，做出一整套透明表情包」
- Caption: 「4步：先定一张角色稿→每次用同一张图当参考换动作→做真透明底（棋盘格画进图里是假的）→深浅底+缩小验收。任何生图模型都能用。」
- Hashtags: #AI绘画 #表情包 #AI工具 #透明图 #AI教程
- Reminder: tick **「内容由AI生成」**; all images in the video are AI-generated examples.

**视频号 (optional):** title 「AI做专属表情包，4步搞定透明底」, same caption.
**小红书 (optional):** title 「AI做表情包｜角色不跑偏+真透明底」; caption = the 4 steps as bullets + the two pitfalls (chain referencing, fake checkerboard); tags #AI绘画 #表情包 #透明PNG #AI教程.
