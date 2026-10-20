# Script — huashu-motion: "say one sentence, your coding agent makes a launch film" (~60 s, Douyin first)

Slug: `huashu-motion-skill` · Put this folder at `inputs/huashu-motion-skill/` in the RenWenVideo repo.
Prepared 2026-10-19 (Asia/Taipei). Planning by growth; editing/rendering by cloud Claude Code.

## 0. Read this first (instructions for Claude Code)

- **Language rule:** English = instructions. Every Chinese line marked **[VERBATIM]** (narration 口播 and on-screen text) is final copy: **verbatim, do not edit, do not translate**. You may split narration into shorter subtitle chunks, but not change words.
- **Duration:** target **55–60 s** (repo ≤60 s rule applies). Narration is ~295 characters incl. English terms; if TTS runs long, speed the voice slightly rather than cutting words. If still > 60 s, you may drop shot 8's final sentence only.
- **Priority when things conflict:** hook > retention > readability > fidelity to this storyboard > polish. You may re-pace shots and swap which clip sits under which line. You may not change narration/on-screen wording or add facts.
- **Reference look:** match the `deepseek-vs-opus55` episode. Dark blueprint / tech style: deep navy-to-black background, thin cyan grid, cyan + one warm accent (orange, matching the skill's orange icon), monospace for command/prompt cards.
- **Canvas:** 9:16 full screen 1080×1920, use the whole height (no 6:7 letterboxing). All text **≥ 40 px** (subtitles ~56–64 px, headline 96–140 px, command card ≥ 48 px monospace). Keep text out of the bottom ~15% and the right-side Douyin UI column.
- **Frame 0 = the hook** (clip 01 already playing + headline). No fade/iris from empty, no logo sting.
- **Voice:** only the user's **Volcengine / 豆包 personal cloned voice**; no other TTS. "huashu-motion" is read as written ("huashu motion"); do not substitute Chinese characters for it in subtitles.
- **Music:** from frame 0, punchy electronic/tech, ducked under voice (≈ −18 to −22 dB relative). SFX ticks/whooshes on card changes OK.
- **External footage:** all clips in `materials/` are launch films / demos made with the skill, taken from the developer's public post and GitHub README. **Original audio already stripped — keep muted.** Every external-footage shot gets a small 「案例展示」 label bottom-right (if the clip's own small "Fan-made · 非 DeepSeek 官方" corner label is visible, keep it visible and place 「案例展示」 just above it — that label helps compliance). Landscape 16:9 clips: show them as a large card (full width, ~608 px tall) on the blueprint background, or scale-to-cover + crop only when the key content stays in frame.
- **Identity rule:** never show or say the developer's real name, X handle, display name, avatar, cartoon mascot, QR codes or social accounts. The skill's own name "huashu-motion" and the install command are product/tool names and are allowed (see README §5 about this tradeoff). Do not say 「花叔」.
- **Do NOT:** next-episode teaser; 公众号; URLs, QR codes, "link in bio", GitHub page screenshots with URL bar; promotion ("关注我""进群""课程"); first-person testing claims ("我试了/我实测") — the user has not tested it. Results come from the developer's own statements → phrase as 「据开发者说」.
- Douyin: tick the AI-generated-content declaration when publishing (the demo films are AI/code-generated).

## 1. One-line point (选题卡)

huashu-motion is an open-source Agent Skill (MIT) for coding agents like Claude Code / Codex: one sentence in → it reads your product, offers three directions, writes the film as code, composes its own music + SFX, and opens a browser editor where you press C, click the frame and say what to change. Audience: AI-tool users who make apps / side projects / open-source and need a launch or demo video but can't edit.

## 2. Hook

**Chosen (frame 0):** clip `01_hook_deepseek_fanmade_launch_film.mp4` from ~0 s (the 「探索未至之境」 search-box opening) cutting fast to its benchmark-number shot (~20–24 s) within the first 4 s.
- On-screen **[VERBATIM]**: 「这不是官方发布片」 → at "AI写代码" swap to 「AI 写代码做的」
- Narration **[VERBATIM]**: 「这支DeepSeek发布片，不是官方做的，是AI写代码做出来的。」
- Why: DeepSeek is the hottest AI topic this week (the user's last two videos rode it); "looks official but isn't" creates instant curiosity, and the visual quality itself is the proof.

**Alternative A:** open on `04_point_to_edit_press_C.mp4` at the comment popup (~4–6 s into the clip) with 「点一下画面，AI 就只改这一处」. Rationale: the most novel interaction, strong for tool-savvy viewers; weaker for broad audience because UI is small on a phone.

**Alternative B:** open on `02_skill_intro_wall_and_typing_trigger.mp4` (wall of films → typing the command) with 「一句话，让 AI 给你的产品拍发布片」. Rationale: states the benefit directly, cleanest for cold viewers; less surprising than the chosen hook.

## 3. Storyboard

| # | Time | Narration 口播 [VERBATIM] | On-screen text [VERBATIM] | Visual / material |
|---|------|---------------------------|---------------------------|-------------------|
| 1 hook | 0–5.5 s | 这支DeepSeek发布片，不是官方做的，是AI写代码做出来的。 | 「这不是官方发布片」→「AI 写代码做的」 | `01_hook_deepseek_fanmade_launch_film.mp4`, big card or cover-crop; fast cuts between its strongest moments (search box, 77.0 / 68.2 number shots, whale logo). 「案例展示」. |
| 2 what | 5.5–17 s | 靠的是一个开源skill，叫huashu-motion。装进Claude Code这类编程agent，说一句：给我的产品做个30秒发布片。 | 「开源 Skill：huashu-motion」 then a monospace prompt card: 「用huashu-motion给我的产品做一支30秒的发布片，官网是xxx.com」 small chips 「Claude Code」「Codex」 | `02_skill_intro_wall_and_typing_trigger.mp4` (wall of films → `/huashu-motion 给我的产品做一支发布片` being typed). Then the prompt card, built by you. 「案例展示」 on the clip. |
| 3 how it works | 17–22.5 s | 它会先读你的产品，出三个方向让你挑，再写片、作曲、配音效。 | Step chips appearing in sync: 「读产品」→「3 个方向」→「写片」→「作曲 + 音效」 | `06_three_directions_keyframes.jpg` (A/B/C keyframes + palettes; slow push-in) then `03_workflow_read_score_build_export.mp4` (读产品 / 写谱 / 搭画面 / 导出) and/or `09_score_first_music_sync.mp4`. 「案例展示」. |
| 4 point-to-edit | 22.5–28.5 s | 不满意？在编辑器里按C，点一下画面，写要改什么，它只改那一处。 | 「按 C → 点画面 → 写意见」 then 「只改这一处」 | `04_point_to_edit_press_C.mp4`: zoom into the comment popup (frame ~4–6 s of the clip) so the UI is readable on a phone; add a pulsing "C" keycap graphic. 「案例展示」. |
| 5 who | 28.5–33.5 s | 做App、独立产品、开源项目，又不会剪片的人，最该试。 | Three persona chips: 「App 上架预览」「独立产品发布」「开源项目演示」 | `05_features_montage_no_endcard.mp4` (GLITCH / 竖屏 phone / 幻灯片 / 评审) behind the chips. 「案例展示」. |
| 6 install | 33.5–45 s | 安装一行命令，或者跟agent说：帮我装huashu-motion。要Node 22以上、Chrome和FFmpeg。 | Command card (monospace, hold ≥ 3 s fully visible): `npx skills add alchaincyf/huashu-motion` · second card: 「帮我安装huashu-motion这个skill，装好后跑一遍demo」 · requirement chips: 「Node 22+」「Chrome」「FFmpeg」 · corner tag 「建议截图」 | Build cards yourself on blueprint background (terminal-style window, no URL bar). No GitHub page screenshot. |
| 7 result | 45–52 s | 据开发者说，换成DeepSeek做一支22秒动效片，不到半小时，花了1块9毛5。 | 「22 秒动效片」「< 半小时」「¥1.95」 small grey line 「据开发者自述」 | `08_deepseek_flash_22s_motion_demo.mp4` (MOTION / MASK / GLITCH / whale). Number counters animate in. 「案例展示」. |
| 8 caveats + close | 52–60 s | 注意两点：目前只在苹果电脑上实测过；它听不见，配乐最后得你自己听。有产品缺宣传片，装上试一支。 | 「⚠ 目前只在 macOS 实测」「⚠ 它听不见，配乐要你把关」 then 「有产品，就能有发布片」 | Warning cards on blueprint bg; end on a strong frame from `07_selfcheck_keyframes.jpg` or clip 01's whale logo. Hard end: no teaser, no follow CTA, no links. |

## 3b. Full narration for TTS — [VERBATIM]

```
这支DeepSeek发布片，不是官方做的，是AI写代码做出来的。
靠的是一个开源skill，叫huashu-motion。装进Claude Code这类编程agent，说一句：给我的产品做个30秒发布片。
它会先读你的产品，出三个方向让你挑，再写片、作曲、配音效。
不满意？在编辑器里按C，点一下画面，写要改什么，它只改那一处。
做App、独立产品、开源项目，又不会剪片的人，最该试。
安装一行命令，或者跟agent说：帮我装huashu-motion。要Node 22以上、Chrome和FFmpeg。
据开发者说，换成DeepSeek做一支22秒动效片，不到半小时，花了1块9毛5。
注意两点：目前只在苹果电脑上实测过；它听不见，配乐最后得你自己听。有产品缺宣传片，装上试一支。
```

## 4. Fact sources (QA only; not on screen)

| Claim | Source |
|---|---|
| Open-source skill "huashu-motion", MIT license, Agent Skills standard; runs in Claude Code, Codex etc. | GitHub repo README + LICENSE (repo created 2026-10-18; v0.1.0 released 2026-10-18) |
| Install `npx skills add alchaincyf/huashu-motion`, or tell the agent 「帮我安装huashu-motion这个skill（…），装好后跑一遍demo」 | README §安装 (方式一/二); `npx skills` = vercel-labs/skills CLI |
| Reads product → 3 directions → writes film → composes music → opens browser editor; press C, click, comment, only that spot changes | README intro + §指着画面改; X article |
| 23 sound effects, composer mode, music generated locally | README §声音 |
| Needs Node 22+, Chrome/Chromium/Edge, FFmpeg; only tested on macOS | README §需要什么 |
| "It can't hear" — final listen is yours; doesn't generate real people / live footage | README §诚实边界 |
| DeepSeek V4.1 Flash (1017) 22 s film, < half an hour, ¥1.95, cache hit 99.4% | Developer's own statement (README §不依赖Opus + X article) — self-reported, not independently verified |
| The DeepSeek launch film is fan-made, not official | The film's own corner label 「Fan-made · 非 DeepSeek 官方」 and the developer's post |

Do not add: star counts, "比 Claude Motion 强", "Apple 级别", Windows support, prices beyond ¥1.95, render speed numbers.

## 5. Cover text

- **6:7:** main 「一句话 让AI拍发布片」, chip 「开源 Skill · 指着画面改」. Background: whale-logo / big-number frame from clip 01, blueprint grid overlay.
- **3:4:** main 「AI 给你的产品拍宣传片」, second line 「按C点一下 只改这一处」, chip 「附安装命令」. Background: 2×2 stills from clips 01 / 03 / 04 / 08.
- No developer name/avatar/mascot. Text ≥ 40 px at export size.

## 6. Titles & captions — Douyin first [VERBATIM suggestions]

**抖音（主发）**
- 标题/文案：这支DeepSeek发布片不是官方做的，是AI写代码拍的。开源skill huashu-motion，装进Claude Code说一句就出片，安装命令在视频里，截图就能用。#AI工具 #ClaudeCode #AI视频 #DeepSeek #独立开发
- 发布时勾选「内容由AI生成」。
- 置顶评论建议（可选，不放链接）：「安装命令：npx skills add alchaincyf/huashu-motion　需要 Node 22+、Chrome、FFmpeg，目前只在 macOS 实测过」

**视频号（可选）**
- 标题：一句话，让AI给你的产品拍发布片
- 文案：开源skill huashu-motion：读产品、出三个方向、自己作曲配乐，还能指着画面改。适合做App、独立产品、开源项目的人。#AI工具 #ClaudeCode #AI视频

**小红书（可选）**
- 标题：AI给产品拍宣传片｜一句话出片
- 正文：装进Claude Code / Codex的开源skill：huashu-motion 🎬
  ✅ 说一句「给我的产品做个30秒发布片」
  ✅ 先出3个方向让你挑，再写片、作曲、配音效
  ✅ 不满意按C点画面，只改那一处
  📌 安装：npx skills add alchaincyf/huashu-motion
  ⚠️ 要Node 22+、Chrome、FFmpeg；目前只在macOS实测
  #AI工具 #ClaudeCode #AI视频 #独立开发

## 7. QA for this episode

1. Frame 0 = clip 01 + headline.
2. No developer name/handle/avatar/mascot/QR/URL anywhere (check 01's ending, 02's wall thumbnails, 05).
3. 「案例展示」 on every external shot; all original audio muted.
4. Text ≥ 40 px; command card readable on a phone; nothing in bottom 15%.
5. Narration word-for-word; 55–60 s.
6. No teaser / 公众号 / link / promo / first-person testing; ¥1.95 labelled 「据开发者自述」.
Report duration, spec, QA results, and anything needing the user's manual check.
