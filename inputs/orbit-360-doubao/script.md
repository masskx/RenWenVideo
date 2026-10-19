# Script — "One photo + one prompt → 360° orbit video" (tutorial, ~90 s)

Slug: `orbit-360-doubao` · Put this folder at `inputs/orbit-360-doubao/` in the RenWenVideo repo.
Prepared 2026-10-19 (Asia/Taipei). Planning by growth; editing/rendering by cloud Claude Code.

## 0. Read this first (instructions for Claude Code)

- **Language rule:** everything in English is instruction. Every Chinese line marked **[VERBATIM]** (narration 口播 and on-screen text) is final copy: **verbatim, do not edit, do not translate, do not "improve"**. You may split a narration line into shorter subtitle chunks, but not change words.
- **Duration override:** this episode is a real hands-on tutorial and targets **~90 seconds (acceptable 80–100 s)**. This explicitly **overrides the repo's ≤60 s rule** for this episode only. Every other repo rule (CLAUDE.md, video-craft skill, QA) still applies.
- **Priority when things conflict:** hook > retention > readability > fidelity to this storyboard > polish. You may re-pace shots, swap which clip goes under which line, and change visual treatments to fit the material and the voice-over timing. You may not change narration/on-screen wording or add facts.
- **Reference look:** match the `deepseek-vs-opus55` episode (pacing, type scale, card style, how external footage is framed). Dark blueprint / tech style: deep navy-to-black background, thin cyan grid lines, glowing accent (cyan + one warm accent e.g. lemon yellow, taken from clip 01), monospace for "prompt" cards.
- **Canvas:** 9:16 full screen (1080×1920), use the whole height — no 6:7 "channels" letterboxing. All text **≥ 40 px** (body subtitles ~56–64 px, headline cards 96–140 px). Keep text out of the bottom ~15% and right-side UI zone of Douyin.
- **Frame 0 must already show the hook** (clip 01 playing + headline). No iris/fade-in from empty, no logo sting, no title card before the hook.
- **Voice:** only the user's **Volcengine / 豆包 personal cloned voice**. No other TTS. Speed natural-fast (the copy is ~415 Chinese characters ≈ 90 s at ~4.6 char/s; if the render runs long, speed the voice slightly rather than cutting words).
- **Music:** starts at frame 0, upbeat tech/electronic, ducked under the voice (voice clearly dominant; music ≈ −18 to −22 dB relative). Light whoosh/tick SFX on card changes are fine.
- **External footage:** all clips in `materials/` are AI-generated demo videos from a public X article. **Original audio is already stripped** (keep it muted). Every shot that shows external footage gets a small label **「案例展示」** in the bottom-right corner (no author name, no @handle). Do not put any X username, handle, display name, avatar or link on screen.
- **Do NOT:** add a next-episode teaser; mention 公众号; show any URL/QR code/external link; add any promotion ("关注我""进群""课程" etc.); use first person for testing ("我试了/我实测") — the user has not tested this; everything is phrased as explanation.
- Source clips are 810×1080 (3:4, re-encoded H.264 CRF 27 for upload size; originals 834×1112 kept off-package), 24 fps, 10.08 s each. For full-bleed shots, scale to cover 1080×1920 and center-crop (keep the subject in frame; check each clip, subjects are centered). For "card" shots, place the clip in a rounded frame on the blueprint background with labels above/below.
- Douyin: when publishing, the user should tick the AI-generated-content declaration (the demo clips are AI-generated).

## 1. One-line point (选题卡)

One photo + one instruction sent to 豆包 makes a "frozen-time, camera-orbits-around-the-subject" 360° video; the video teaches what it is, what it's good for, the exact prompt, 3 pitfalls, a 4-point check, and the advanced ComfyUI route.

Audience: people who use AI tools and want new, practical AI tricks (not only developers). Viewer benefit to emphasise: "turn the photos already on your phone (travel, food, makeup, product shots) into an eye-catching orbit clip — free tier, no install".

## 2. Hook

**Chosen hook (frame 0):** clip `01_product_lemon_can_clouds.mp4` full-bleed, already orbiting; headline slams in on frame 0.
- On-screen **[VERBATIM]**: 「一张图 + 一句话 = 360°环绕」
- Narration **[VERBATIM]**: 「一张照片，加一句话，镜头就能绕着它转一整圈。不用装软件，豆包里就能做。」
- Why: the result itself is the hook (strong parallax, floating lemons, reads instantly even muted); "一句话 / 不用装软件 / 豆包" removes the effort objection in the first 5 s, which is what drives saves for tool tutorials.

**Alternative A:** open on a 3-way rapid cut (01 → 02 → 03, ~1.2 s each) with 「这种视频，你手机里就能做」. Rationale: shows range (product / travel / beauty) immediately, good for viewers who think "this is only for pretty-girl videos". Risk: busier first second.

**Alternative B:** open on `02_travel_food_street_drink.mp4` with 「你随手拍的一杯饮料，也能变成子弹时间大片」. Rationale: most relatable everyday photo → "I can do this too". Risk: clip 02 is visually noisier (fisheye street), weaker as a thumbnail frame.

## 3. Storyboard (per shot)

Times are targets; re-time to the actual TTS. "Card" = clip framed on blueprint background; "Full" = full-bleed.

| # | Time | Narration 口播 [VERBATIM] | On-screen text [VERBATIM] | Visual / material |
|---|------|---------------------------|---------------------------|-------------------|
| 1 hook | 0–6.5 s | 一张照片，加一句话，镜头就能绕着它转一整圈。不用装软件，豆包里就能做。 | 「一张图 + 一句话 = 360°环绕」→ at "不用装软件" add tag chips 「免部署」「豆包可用」 | Full: `01_product_lemon_can_clouds.mp4` from its 0 s. Big headline top third, frame 0. 「案例展示」 bottom-right. |
| 2 what | 6.5–16.5 s | 这叫360度环绕，也叫子弹时间：画面全部定格，只有镜头在动。AI会根据照片里的空间线索，补出别的角度。 | 「360°环绕 / 子弹时间」 then two labels: 「主体：定格」「镜头：在动」 then 「AI 补出其他角度」 | Card: `02_travel_food_street_drink.mp4`. Overlay a top-down blueprint diagram (small, upper area): a dot = subject, a dashed circle = camera path, a camera icon moving along it in sync. 「案例展示」. |
| 3 uses | 16.5–30.5 s | 能干嘛？旅游美食随拍，多一个角度；美妆，从正面绕到侧面，眼影高光看得清；产品图，瓶身曲面和反光跟着视角变；拍好的模特图、穿搭图，也能再出一条动态素材。 | Chip per use, synced: 「旅游 / 美食」「美妆」「产品展示」「商拍 / 穿搭」 | Quick cuts, ~3.5 s each, full or card: 02 (旅游/美食) → `03_beauty_makeup_palette.mp4` (美妆) → `05_product_pink_bottle_flowers.mp4` (产品) → `04_beauty_portrait_mirror_shards.mp4` (商拍/穿搭). Optional extras only if you need more variety: 06/07 (see README cautions). 「案例展示」 on each. |
| 4 step 1 | 30.5–38 s | 做法就两步。第一步，打开豆包，上传一张主体清楚的照片。千问、元宝能图生视频，也能试。 | 「STEP 1  上传一张主体清楚的照片」 small line: 「豆包 / 千问 / 元宝 都可试」 | Build a simple animated chat-UI mock in Remotion (generic chat bubble + an image thumbnail using a still frame of clip 05 or 01 sliding in). Do not imitate any real app logo. |
| 5 step 2 (core) | 38–52 s | 第二步，把指令一起发过去。核心四句：主体和环境定格在原图瞬间；摄影机绕主体走水平圆弧，镜头始终对着主体；高度和距离不变；不切镜、不变焦、不加新东西。 | 「STEP 2  图片 + 指令 一起发」 then a monospace prompt card with the full short prompt (Section 4) typed in; highlight 4 key phrases as narration hits them: 「定格在原图瞬间」「水平圆弧环绕」「高度和距离不变」「不切镜 不变焦 不新增物体」. Corner tag: 「建议截图保存」 | Prompt card fills ~70% of screen; keep it on screen ≥ 4 s fully revealed so viewers can screenshot. Briefly (≈1.5 s) show `08_doubao_chat_prompt_seedance_mini.png` as proof the chat flow is real; zoom/highlight the line 「本次使用 Seedance 2.0 Mini 生成」. |
| 6 pitfalls | 52–66 s | 三个坑。一，主体和背景要有前后层次，视差才明显。二，写清楚是镜头在绕，不是人在转，不然人会自己转身。三，豆包免费额度用完会提示扣付费额度，看到再决定。 | 「坑1  要有前后层次」「坑2  镜头绕 ≠ 人转」「坑3  免费额度用完会扣费」 | 坑1: clip 01 (lemons in front/behind = parallax; add small arrows 前景/主体/背景). 坑2: split diagram — left "✗ 人转身" (subject icon rotating), right "✓ 镜头绕" (camera icon orbiting). 坑3: `08_...png` zoom on 「今日视频生成免费额度已用完，本次将消耗付费额度」. |
| 7 check | 66–74 s | 生成后检查四点：主体定没定格，镜头真没真绕，侧面背面变没变形，结尾能不能接回开头。 | Checklist ticking one by one: 「✓ 主体定格」「✓ 镜头真在绕」「✓ 侧面背面不变形」「✓ 结尾接回开头」 | Card: `03_beauty_makeup_palette.mp4` (or 05) playing behind the checklist. 「案例展示」. |
| 8 advanced | 74–87 s | 想自己控参数，可以用ComfyUI本地跑，加360度环绕LoRA。但模型几十个G，这个LoRA也主要拿人像训练。新手先用豆包就够了。 | 「进阶：ComfyUI 本地跑」 node chain: 「MiniMax H3 I2V 模板」→「360° Orbit LoRA」→「同一张图接首帧 + 尾帧」→「运行」 then warning chips 「模型几十 GB」「LoRA 以人像为主」 then 「新手：豆包就够」 | Draw the node chain yourself (blueprint nodes + wires). No URLs, no Hugging Face page screenshots. |
| 9 close | 87–91 s | 先拿你手机里最好看的那张照片，试一张。 | 「挑一张照片，试一张」 | Full: `04_beauty_portrait_mirror_shards.mp4` or loop back to 01 (orbit returning to start mirrors the "loop" idea). Hard end — no teaser, no follow CTA, no links. |

## 3b. Full narration for TTS — [VERBATIM], one paragraph per shot

```
一张照片，加一句话，镜头就能绕着它转一整圈。不用装软件，豆包里就能做。
这叫360度环绕，也叫子弹时间：画面全部定格，只有镜头在动。AI会根据照片里的空间线索，补出别的角度。
能干嘛？旅游美食随拍，多一个角度；美妆，从正面绕到侧面，眼影高光看得清；产品图，瓶身曲面和反光跟着视角变；拍好的模特图、穿搭图，也能再出一条动态素材。
做法就两步。第一步，打开豆包，上传一张主体清楚的照片。千问、元宝能图生视频，也能试。
第二步，把指令一起发过去。核心四句：主体和环境定格在原图瞬间；摄影机绕主体走水平圆弧，镜头始终对着主体；高度和距离不变；不切镜、不变焦、不加新东西。
三个坑。一，主体和背景要有前后层次，视差才明显。二，写清楚是镜头在绕，不是人在转，不然人会自己转身。三，豆包免费额度用完会提示扣付费额度，看到再决定。
生成后检查四点：主体定没定格，镜头真没真绕，侧面背面变没变形，结尾能不能接回开头。
想自己控参数，可以用ComfyUI本地跑，加360度环绕LoRA。但模型几十个G，这个LoRA也主要拿人像训练。新手先用豆包就够了。
先拿你手机里最好看的那张照片，试一张。
```

≈415 Chinese characters ≈ 90 s.

## 4. Prompt text for the on-screen card (shot 5) — [VERBATIM]

Display exactly (line breaks may be adjusted for layout):

```
以我上传的图片作为首帧和外观参考。生成6秒连续一镜到底视频：画面中的主体和环境定格在原图瞬间，摄影机向画面左侧移动，沿以主体为中心的水平圆弧轨道连续环绕，镜头始终朝向主体，保持基本相同的高度和距离，呈现清楚的前景、主体、背景视差。保持主体的外观、姿势、比例及原图光线；主体不自行转动，背景不重新排列，不切镜、不变焦、不新增物体。无字幕、无旁白。
```

(Source: the article's "通用短指令". Do NOT show the article's long 10-second portrait prompt — it describes a model's body/outfit in detail and is not needed.)

## 5. Fact sources (for QA; not for on-screen)

| Claim in video | Source |
|---|---|
| One photo + one instruction to 豆包/千问/元宝 creates the orbit; method 01 is web chat | The X article (see README internal sources) |
| AI uses spatial cues in the photo to generate other camera angles | The X article's own explanation |
| Use cases: travel/food, beauty, product, commercial/fashion | The X article sections 01–05 |
| The short prompt text | The X article "通用短指令" (verbatim) |
| 豆包 shows "免费额度已用完，本次将消耗付费额度" and uses Seedance 2.0 Mini | Screenshot in the article (material 08) |
| 元宝 supports image-to-video; 千问 has "AI生视频" | IT之家 2025-11-21 (元宝 HunyuanVideo 1.5 图生视频); third-party 千问 tutorial |
| ComfyUI template "MiniMax H3 I2V", first/last frame (FL2VA) | docs.comfy.org MiniMax H3 guide; MiniMax self-host docs |
| Models are tens of GB | docs.comfy.org MiniMax H3 guide ("tens of GB") |
| 360° Orbit LoRA, same image as first + last frame, trained on human-centric clips, other subjects untested | Hugging Face model card of the LoRA |
| 4-point check (定格 / 绕行 / 侧背面变形 / 接回开头) | The X article, ComfyUI step 4 |

Not claimed (do not add): exact daily free quota numbers, price per generation, generation time, GPU requirements, "完全免费", commercial-use rights.

## 6. Cover text

- **6:7 (视频号/feed):** main 「一张图 一句话」 second line 「360°环绕大片」 small chip 「豆包就能做｜附指令」. Background: still from clip 01 (lemon can) with a glowing orbit ring.
- **3:4 (小红书):** main 「万物皆可360°环绕」 second line 「豆包一句话出片」 chip 「附完整指令」. Background: 2×2 grid of stills from 01 / 02 / 03 / 05.
- No faces cropped awkwardly, no handles, text ≥ 40 px at export size.

## 7. Titles & captions (Chinese, [VERBATIM] suggestions — user may pick)

**视频号**
- 标题：一张照片+一句话，豆包做出360°环绕大片
- 文案：最近很火的“镜头绕一圈”视频，其实不用装软件。上传一张主体清楚的照片，把下面这段指令一起发给豆包就行。三个坑和检查方法视频里都讲了。#AI视频 #豆包 #AI工具 #子弹时间

**小红书**
- 标题：豆包一句话做360°环绕视频｜附指令
- 正文：
  一张照片＋一句话，镜头绕着主体转一圈🌀
  ✅ 旅游美食随拍、美妆、产品图、穿搭图都能做
  ✅ 不用装软件，豆包 / 千问 / 元宝都能试
  📌 指令（直接复制）：以我上传的图片作为首帧和外观参考。生成6秒连续一镜到底视频：画面中的主体和环境定格在原图瞬间，摄影机向画面左侧移动，沿以主体为中心的水平圆弧轨道连续环绕，镜头始终朝向主体，保持基本相同的高度和距离，呈现清楚的前景、主体、背景视差。保持主体的外观、姿势、比例及原图光线；主体不自行转动，背景不重新排列，不切镜、不变焦、不新增物体。无字幕、无旁白。
  ⚠️ 照片要有前后层次；写清是镜头绕不是人转；免费额度用完会扣费
  #AI视频 #豆包 #AI工具 #360度环绕 #子弹时间 #AI教程

**抖音**
- 标题/文案：一张照片让镜头绕一圈，豆包一句话就能做。完整指令在视频第2步，截图就能用👆 #AI视频 #豆包 #AI工具 #子弹时间 #360度环绕
- (Tick 「内容由AI生成」 when publishing.)

## 8. Deliverables & QA

Follow the normal video-craft flow: storyboard into the repo's tutorials/explainers location, 3 still-frame self-checks (frame 0, shot 5 prompt card, shot 8 node chain), full render, QA. Extra QA for this episode:
1. Frame 0 shows clip 01 + headline (not empty).
2. No X username/handle/display name/avatar/URL anywhere (also check stills of shot 5 and the 08 screenshot).
3. 「案例展示」 on every external-footage shot; no original audio.
4. All text ≥ 40 px; nothing in the bottom 15%.
5. Narration matches Section 3 word-for-word; duration 80–100 s.
6. No teaser / 公众号 / link / promo / first-person testing claims.
Report: final duration, resolution/fps, which QA passed, anything needing the user's manual check.
