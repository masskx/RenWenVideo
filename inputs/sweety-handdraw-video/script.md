# sweety-handdraw-video：开源手绘讲解视频 Skill，三步上手 (Douyin first)

> **Duration override:** this video targets **~90 s**. That **overrides the standing ≤60 s rule** for this job only, because the user asked for it explicitly. Pace about 4.7 Chinese characters per second; ~430 spoken units.

## 0. One-line summary (verified)
sweety-handdraw-video is an open-source (MIT) Agent Skill for Codex and Claude Code. It turns a topic, an article or a story into a hand-drawn explainer video with narration and subtitles. The Agent writes the script, plans the storyboard and generates the illustrations. Local tools then draw them stroke by stroke (outline first, then color), write Chinese characters in standard stroke order, align the voice and export the file. All facts come from the official repo README v1.3 (2026-10-17); see §8.

## 1. Hook (frame 0)
**Main hook (used):** 「这条手绘动画里，没有一笔是人画的。」
- Visual at frame 0: 01b (local 3.0 s): the line drawing of the snake coiled around the saw snaps into full color. Label 「案例展示」. Big on-screen text at frame 0: **没有一笔是人画的**.
- Rationale: it is a counter-intuitive claim, and the proof is on screen right away (a "hand" is drawing). It creates curiosity: who drew it?

**Alternative A:** 「不会画画，也能做手绘讲解视频。」 It speaks to the viewer's pain point and suits a knowledge/creator audience. It is less surprising.
**Alternative B:** 「改一句字幕，不用整片重做。」 This is a practical hook for people who already make videos. It is narrower, so use it if the main hook underperforms with creators.

## 2. Style & compliance
- 9:16, 1080×1920, dark blueprint/tech look (reference: deepseek-vs-opus55): navy background #09111F, faint grid, cyan accent #40C8FF, white headings, code in green mono. All on-screen text **≥40 px**.
- Chapter progress bar at top, always visible: **① 是什么 ② 怎么画 ③ 三步上手 ④ 拿到什么 ⑤ 避坑**. Highlight the current chapter.
- Voice: **Volcengine/豆包 cloned voice only**. Music from frame 0, ducked under the voice (about −18 dB under speech, −10 dB in gaps).
- Every film shot (01a–01d) carries the corner label **「案例展示」** only. Film audio is already removed; keep it muted.
- The film has the author's own title text at the top and burned-in subtitles at the bottom. **Crop them out**: on the 1080×608 clips use crop `1080×470` from y=68. Then only our subtitles are visible. Watermark text and the brush-shaft handle were already removed in pre-processing; do not use the raw film.
- No real X usernames, handles, display names or avatars anywhere. No links, no 公众号, no teaser, no promotion, no first-person "I tested it" claims.
- Do not repeat the post's promotional claims ("碾压级", "最佳", cost or time numbers, paid plans).
- Publish with the platform AI-generated content label switched on (the showcased film is AI-generated). Show a small 「案例展示 · AI 生成内容」 in the end card.

## 3. Long-clip editing plan
The source film is 49 s (1280×720, 30 fps, with audio). It was reviewed at 1 fps (contact sheets) and cut into four short segments. **Never play the film unedited.**
- **Excluded from the source:** 7–10 s (red blood drops) and 21–27 s (snake cut into red segments): Douyin-unsafe gore. Also excluded: 0–1 s (title card) and 46–49 s (end fade).
- **01a** (source 1.0–6.8 s, 5.8 s): the snake drawn as a line. Used in S2 at 0.9× with a 0.8 s freeze on the final outline.
- **01b** (source 10.0–17.5 s, 7.5 s): the coil outline, then color. S1 hook: local 3.0–7.5 at 1.3× (≈3.5 s). S5: split-screen with the top freeze at local 4.0 (outline only, label 「先描线」) and the bottom freeze at local 7.4 (colored, label 「后上色」), then a 2× zoom on the hand/brush tip at local 1.0–3.5.
- **01c** (source 27.5–31.6 s, 4.1 s): a match flame sketched, then colored. S3 second half, real time.
- **01d** (source 39.0–46.0 s, 7.0 s): a man sketched, then colored. S3 first half at local 0.0–3.5. S11 uses a picture-in-picture loop of local 3.0–7.0 as an "MP4 成片" thumbnail. S13 freezes local 6.5.
- Speed-ups never exceed 1.5× on drawing shots: the stroke-by-stroke motion is the selling point, so keep it readable.

## 4. Storyboard
Timings are targets. Re-align to the actual TTS. Every shot keeps the chapter bar.

| # | Time | Chapter | Visual / asset (in–out, treatment) | On-screen text (verbatim) | Narration (verbatim) |
|---|---|---|---|---|---|
| S1 | 0.0–3.5 | — | 01b local 3.0–7.5 @1.3×, full width centered, cropped as §2; 「案例展示」 | **没有一笔是人画的** | 这条手绘动画里，没有一笔是人画的。 |
| S2 | 3.5–10.0 | ① 是什么 | 01a local 0.3–5.8 @0.9× + freeze 0.8 s; 「案例展示」 | 写稿 → 分镜 → 插画 → 一笔一笔画 | 写稿、分镜、插画，再到一笔一笔画出来，都是 AI Agent 加本地工具自动完成的。 |
| S3 | 10.0–21.0 | ① 是什么 | 01d local 0.0–3.5 then 01c local 0.0–4.1; then name card (white title on navy) with 3 input chips flying into a "手绘视频" box | **sweety-handdraw-video** / 开源 Agent 技能 / 主题 · 文章 · 故事 → 配音+字幕的手绘视频 | 它叫 sweety-handdraw-video，是一个开源的 Agent 技能。给它一个主题、一篇文章或者一个故事，就能做成带配音和字幕的手绘讲解视频。 |
| S4 | 21.0–27.0 | ① 是什么 (**re-hook**) | Three use-case tiles pop in one by one, each with an icon: 知识科普 / 寓言故事 / 观点解读; background 01d freeze at local 6.5, blurred 20 px | **缺画手？它来画** | 做知识科普、寓言故事、观点解读的人，最缺的就是画手，这个正好能补上。 |
| S5 | 27.0–36.0 | ② 怎么画 | 01b split-screen freezes (local 4.0 / 7.4), then a 2× zoom on the brush at local 1.0–3.5; 「案例展示」 | 先描线 / 后上色 / 汉字按标准笔顺 | 它不是直接生成一段视频。插画由 Agent 生成，本地工具再先描线、后上色，汉字也按标准笔顺来写。 |
| S6 | 36.0–41.0 | ② 怎么画 | 03_style_wall_9x16.jpg, slow push-in 100→108 % (2.5 s); then 02_hand_presets_9x16.jpg (2.5 s) | 21 个库内画风 / 六款手臂 + 仅画笔 | 画风库有二十多种，手可以选六款预设，也可以只露一支笔。 |
| S7 | 41.0–43.0 | ③ 三步上手 (**re-hook**) | Full-screen text slam on navy, with a "3" counter | **想自己试？三步就够** | 想自己试？三步就够。 |
| S8 | 43.0–50.0 | ③ 三步上手 | 04_card_install.png at the vertical center; typewriter reveal of the command, 1.5 s | 第①步 安装 Skill | 第一步，在 Codex 或 Claude Code 里，用一条 npx 命令装上这个技能。 |
| S9 | 50.0–59.0 | ③ 三步上手 | 05_card_setup.png; highlight box moves from the first command to "检查 FFmpeg…" and then to the doctor line | 第②步 检查环境 / 不会自动下载语音大模型 | 第二步，运行自带的 setup 脚本，检查 FFmpeg、Python 和中文字体，它不会自动下载语音大模型。 |
| S10 | 59.0–66.5 | ③ 三步上手 (**re-hook**) | 06_card_first_prompt.png; the prompt text highlights phrase by phrase; small inset of 01a at local 2–5, 「案例展示」 | 第③步 先跑一条短的 | 第三步，先别上长文章，用官方示例跑一条一分钟左右的短主题，确认画风和声音再做长的。 |
| S11 | 66.5–76.0 | ④ 拿到什么 | 07_card_outputs.png; bullet items tick on; PiP of 01d local 3.0–7.0 looping, labeled 「案例展示」; at "改字幕" a strike-through over 「整片重做」 | 改字幕 ≠ 整片重做 | 做完你会拿到 MP4 成片、封面、SRT 字幕和口播稿。想改字幕，不用整片重做，已经通过的插画和配音可以直接复用。 |
| S12 | 76.0–89.0 | ⑤ 避坑 (**re-hook**) | 08_card_pitfalls.png; items ①–④ light up in sync with the narration, each with a warning icon | 上手前先看这 4 条 | 上手前记住四点：只支持 macOS 和 Linux；完整流程官方只在 Codex 上实测过；用 Claude Code 要自己配生图工具；还得准备一条配音路径，本机语音模型或者现成旁白都行。 |
| S13 | 89.0–92.0 | ⑤ 避坑 | 01d freeze at local 6.5, slow zoom-out; music swells and fades out | 发布记得标注 AI 生成 · 案例展示 · AI 生成内容 | 最后，发布的时候，记得标注 AI 生成。 |

## 5. Full narration (verbatim, for the 豆包 cloned voice)
这条手绘动画里，没有一笔是人画的。写稿、分镜、插画，再到一笔一笔画出来，都是 AI Agent 加本地工具自动完成的。

它叫 sweety-handdraw-video，是一个开源的 Agent 技能。给它一个主题、一篇文章或者一个故事，就能做成带配音和字幕的手绘讲解视频。做知识科普、寓言故事、观点解读的人，最缺的就是画手，这个正好能补上。

它不是直接生成一段视频。插画由 Agent 生成，本地工具再先描线、后上色，汉字也按标准笔顺来写。画风库有二十多种，手可以选六款预设，也可以只露一支笔。

想自己试？三步就够。第一步，在 Codex 或 Claude Code 里，用一条 npx 命令装上这个技能。第二步，运行自带的 setup 脚本，检查 FFmpeg、Python 和中文字体，它不会自动下载语音大模型。第三步，先别上长文章，用官方示例跑一条一分钟左右的短主题，确认画风和声音再做长的。

做完你会拿到 MP4 成片、封面、SRT 字幕和口播稿。想改字幕，不用整片重做，已经通过的插画和配音可以直接复用。

上手前记住四点：只支持 macOS 和 Linux；完整流程官方只在 Codex 上实测过；用 Claude Code 要自己配生图工具；还得准备一条配音路径，本机语音模型或者现成旁白都行。最后，发布的时候，记得标注 AI 生成。

Pronunciation notes for TTS: sweety-handdraw-video → "sweety hand-draw video"; npx → "N P X"; FFmpeg → "F F M peg"; SRT → "S R T"; macOS → "mac O S".

## 6. Verified facts used (see §8 for sources)
| Claim in video | Source statement |
|---|---|
| Agent writes the script, plans the storyboard and generates illustrations; local tools do the stroke-by-stroke drawing, fill, handwriting, voice alignment and export | README intro |
| Open source | Repo license: MIT |
| Topic, article or story → hand-drawn explainer with narration and subtitles | README intro / 全部制作选项 |
| Outline first, then color; Chinese characters in standard stroke order | README v1.3 note + "像人一样画" |
| 21 library style entries (20 numbered + 3.1). Styles 1/4/5/17/19/20 are drawn stroke by stroke; the rest use a brush "reveal" | README "21 个库内画风入口" |
| Six arm presets + pen only | README options table, 手部 |
| Install with an `npx skills add …` command; hosts are Codex and Claude Code | README install section |
| `setup.sh` checks FFmpeg, the Python venv and fonts; it downloads voice models only with `--voxcpm` | README environment section |
| Start with a short topic of tens of seconds; the official starter prompt | README "开始制作" |
| Outputs: MP4, cover PNG, SRT, narration script, check log; default 1920×1080, 30 fps | README |
| Changing subtitles reuses approved images and voice | README 修订 |
| macOS and Linux supported; Windows not promised; full flow tested only on Apple Silicon Mac + Codex; Claude Code needs an image-generation tool or user-supplied illustrations | README support section |
| A voice path is required (local VoxCPM2 / VoiceStudio / ready-made narration) | README voice section |
| The MP4 carries implicit AIGC metadata, but publishing still needs an AI-generated declaration | README |

## 7. Cover text
- **6:7 (Douyin feed cover):** main line 「没有一笔是人画的」 (≥120 px, white); subline 「开源手绘视频 Skill · 三步上手」 (≥56 px, cyan); background: the colored snake/saw freeze from 01b local 7.4 with the brush hand, darkened 40 %, plus a small 「案例展示」.
- **3:4 (profile grid / 小红书):** main line 「AI 一笔一笔画讲解视频」; subline 「Codex / Claude Code 可用」; same background, cropped to the colored man from 01d local 6.5.

## 8. Fact sources
See README.md → "Internal: sources" (URLs are kept only there).

## 9. Platform copy
**Douyin title:** 没有一笔是人画的：开源手绘讲解视频 Skill，三步上手
**Douyin caption:** 给 AI Agent 一个主题、一篇文章或一个故事，它写稿、分镜、出插画，再由本地工具先描线后上色，做成带配音和字幕的手绘讲解视频。安装、检查环境、先跑短主题，三步就能试。注意：只支持 macOS / Linux，完整流程官方在 Codex 上实测。
**Hashtags:** #AI工具 #手绘视频 #AIAgent #Codex #ClaudeCode #知识博主 #AI教程 #开源项目
**视频号:** same title; trim the caption to the first two sentences.
**小红书 title:** 不会画画也能做手绘讲解视频｜开源 Skill 三步上手

**AI label reminder:** before publishing, switch on the platform's 「AI 生成内容」 declaration (Douyin: 作品声明 → 内容由AI生成). The showcased film is AI-generated, and the README itself asks for the declaration.
