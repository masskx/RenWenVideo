# awesome-seedance — Tutorial Video Script (≈2 min, Douyin first)

> **Length override:** this episode targets **110–125 s (aim ≈120 s)**. This deliberately **overrides the repo's ≤60 s rule** for this one video, because it is a hands-on tutorial (what it is → who it's for → 4 exact steps → 2 worked examples → pitfalls → template vs Skill). Keep retention high: hook at frame 0, a re-hook/payoff every 15–20 s, chapter progress markers on screen.

Language rule: everything for you (Claude Code) is in English. **Chinese narration and Chinese on-screen text below are VERBATIM** — do not rewrite, translate or "improve" them.

---

## 0. What this video is about (verified)

- **awesome-seedance** is an open-source GitHub repo (MIT for code, CC BY 4.0 for curation) that collects **Seedance 2.5 / 2.0 video prompts**. Each case is checked against its original post and many are **re-run on a second model** (cross-model retest) to show which prompts actually hold up.
- As of 2026-10-19 the README states: **851 verified cases, 495 cross-model retests, 27 category templates, 80 installable AI-video Skills** (numbers update daily; narration rounds to "800多条 / 27个 / 80个").
- Two ways to use it:
  1. **Templates (beginners, nothing to install):** pick a template → copy the block → replace the [brackets] with your product/person/scene → send to any AI chat with your reference images → paste the resulting prompt into Seedance (即梦/Dreamina) and generate.
  2. **Skills (for Claude Code / Codex users):** one install command, then just tell the agent what you want. Verified commands:
     - `npx seedance-prompt-library install` (npm package `seedance-prompt-library`, v0.3.0; drops the template-library Skill into Claude Code and Codex)
     - `npx skills add LearnPrompt/awesome-seedance --skill seedance-production-workflow` (optional; plans assets/shots and does timestamped video QA)
- Template pitfalls used in narration (verbatim from the repo's template docs):
  - Handheld UGC vlog: don't ask for handheld realism and 4K cinematic lighting in one prompt ("plastic"); cap tightest framing at chest-up, extreme close-ups expose AI faces.
  - Combat choreography: write **contact points** and **attack chains**; "beyond about four segments in a 7 to 10 second fight, the action stops being legible"; naming the discipline (Muay Thai vs Taekwondo biomechanics) changes the motion.

**Viewer use cases to emphasize:** e-commerce/带货 product clips, product showcase ads, everyday vlogs, action/fight shots — people who don't want to burn credits on trial and error.

---

## 1. Hook (frame 0) + 2 alternatives

**Chosen hook — A: split-screen "air punching vs real kick"**
- Frame 0: left = `01a_bad_fight_air_punching.mp4` (two fighters swinging at air), right = `01b_good_fight_muaythai_round_kick.mp4` landing a kick. Big red ✗ on left, green ✓ on right.
- On-screen (≥72px, top): **同样让AI拍打架**  / below each side: **对着空气打** vs **一脚踢实**
- Narration line 1. The "一样东西" is an open loop, paid off at ~70 s (contact points).
- Why: instantly visual, a curiosity gap ("what's the one thing?"), and it promises a concrete, copyable trick — strongest for a tutorial.

**Alt B — "someone already paid for your trial and error"**
- On-screen: **800多条AI视频提示词 全部实测 开源了**, over the template gallery scroll (03).
- Narration: 「抽卡烧积分最心疼？有人把800多条AI视频提示词挨个对过原帖、重跑一遍，全部开源了。」
- Why: speaks to cost pain; weaker visually than A, use if A tests poorly.

**Alt C — product-image to ad result**
- Start on the shampoo packshot (12c 8.0–10.0 s) then cut to washing (12b).
- On-screen: **一张产品图 → 一条带货视频**
- Narration: 「一张洗发水产品图，一段复制来的提示词，就出了这条带货视频。」
- Why: strongest for e-commerce viewers, but the result is someone else's case so must stay labeled 「案例展示」; less curiosity than A.

---

## 2. Global style & compliance

- 9:16, 1080×1920, 30 fps. Dark tech / blueprint look (deep navy background, faint grid, cyan + orange accents) — same visual language as the `deepseek-vs-opus55` episode.
- All text ≥40px (titles ≥72px, captions 48–56px). Burned-in Chinese subtitles synced to narration.
- **Chapter progress bar** at top, always visible: `01 是什么 · 02 模板四步 · 03 打斗秘诀 · 04 Skill进阶 · 05 总结`, current chapter highlighted.
- Voice: **Volcengine/豆包 cloned voice only**. Pronunciation: "awesome-seedance" → read as "奥森 西丹斯"; "Seedance" → "西丹斯"; "Skill" → English "skill"; "UGC" → letters U-G-C; "Claude Code" → English; "Codex" → English.
- Music: starts at frame 0, ducked under voice (−18 to −22 dB under VO).
- External footage: **all source clips/screenshots are someone else's AI cases → label 「案例展示」 small, bottom-right, every time they are on screen; original audio muted** (files already have no audio).
- No real X username/handle/display name/avatar anywhere. `11_skill_install_in_agent_blurred.jpg` is pre-blurred (a creator handle in the skill name) — do not un-blur or retype the name. Do not use any other screenshot that shows creator names.
- No URLs/links on screen; repo name "awesome-seedance" and the install command are OK as text. No 公众号, no next-episode teaser, no promotion, no first-person "I tested" claims (results are the original author's cases — say "原作者跑出来的").
- Douyin: when publishing, tick **"内容由AI生成"** label. Fight clips are sports sparring with protective gear/gloves, no blood — keep them short and don't add violent SFX or slogans.
- Priority: hook > retention > readability > fidelity > polish.

---

## 3. Long-clip editing plan

Original source clips were reviewed frame-by-frame (1 fps contact sheets in `materials/previews/`). The 20–25 s clips were **pre-trimmed** into a/b/c segments; never play any of them unedited.

| Source (original length) | Pre-trimmed file(s) | Source in–out | What to keep / how to treat |
|---|---|---|---|
| Headphones UGC vlog (20.1 s) | `06a_ugc_headphones_unbox.mp4` | 0.0–8.0 | use 0.0–3.5 (lift headphones from case, look to camera) at 1×; jump-cut to 5.5–7.5 (holds earcup to lens) |
| | `06b_ugc_headphones_wear.mp4` | 8.5–15.0 | use 0.5–4.0 (puts them on, smiles) at 1×. **Source 15–20 s (walking out, fisheye, blurry) dropped** |
| Template shampoo result (25.1 s) | `10a_template_shampoo_intro.mp4` | 0.0–3.0 | 1.5–3.0 freeze-frame of bottle held up (for split-screen left label) |
| | `10b_template_shampoo_wash.mp4` | 3.0–17.5 | **2× speed**: 1.0–2.5 pump into palm, 4.0–8.0 lather, 9.0–13.0 rinse (jump cuts between) |
| | `10c_template_shampoo_result.mp4` | 17.5–25.2 | 0.5–3.0 blow-dry, 4.5–7.5 talks holding bottle |
| Skill shampoo result (25.1 s) | `12a_skill_shampoo_intro.mp4` | 0.0–8.0 | 2.0–6.5 product held to camera (zoom-in 110% on bottle) |
| | `12b_skill_shampoo_wash.mp4` | 8.0–15.0 | **2× speed**: 0.0–2.0 pump/foam, 3.0–5.0 scalp lather, 5.0–7.0 rinse |
| | `12c_skill_shampoo_result_packshot.mp4` | 15.0–25.2 | 0.0–4.0 result hair, 5.0–7.5 talks holding bottle, 8.0–10.0 clean packshot (good end-card background) |
| Muay Thai (10.1 s) | `01b_good_fight_muaythai_round_kick.mp4` (full) | 0–10.1 | key contacts at **0.8–1.6** (round kick to leg) and **3.6–4.6** (kick to body); 0.5× slow-mo on 3.8–4.4 + freeze on impact |
| Taekwondo (10.1 s) | `01c_good_fight_taekwondo_kicks.mp4` (full) | 0–10.1 | key kicks at **0.8–1.6** and **3.6–4.6** (high kick onto chest protector); 0.5× slow-mo on 3.9–4.5 + freeze |
| Bad fight (5.0 s) | `01a_bad_fight_air_punching.mp4` | 0–5.0 | 0.0–3.0 at 1× is enough (they swing near each other, no contact) |
| Template gallery screen recording (6.2 s) | `03_template_gallery_scroll.mp4` | 0–6.2 | **1.5× speed**, crop to the left column (x 0–50%) and slow pan so thumbnails read in 9:16 |

Treatments used: speed-up (2× washing, 1.5× scroll), slow-mo + freeze on contact points, zoom/crop on the key UI block, split-screen before/after (fight A/B, shampoo template vs Skill), picture-in-picture (prompt screenshot over result), jump cuts.

---

## 4. Storyboard (≈120 s)

Times are target timeline seconds. "In/out" refers to the file in `materials/`.

| # | Time | Chapter | Visual (file, in–out, treatment) | Chinese on-screen text (verbatim) | Narration covered |
|---|---|---|---|---|---|
| 1 | 0.0–7.0 | Hook | Split-screen vertical stack: top `01a` 0.0–3.0 (red ✗), bottom `01b` 0.8–1.6 then 3.6–4.6 (green ✓, freeze on impact 0.3 s). 「案例展示」 on each | 同样让AI拍打架 / 对着空气打 ✗ / 一脚踢实 ✓ | L1 |
| 2 | 7.0–12.0 | 01 是什么 | `02_repo_hero_awesome_seedance.jpg` on a blueprint card, slow push-in; light orange scan line | awesome-seedance · 开源 | L2 first half |
| 3 | 12.0–18.5 | 01 | `04_cross_model_retest_table.jpg` crop to the table (top ~55%), highlight rows "复现" with green boxes | 对过原帖 + 换模型重跑 | L2 second half |
| 4 | 18.5–24.0 | 01 | `03_template_gallery_scroll.mp4` 0–6.2 at 1.5×, cropped/panned; big animated counters overlay | 800+ 案例 · 27 模板 · 80 Skill | L3 first half (numbers) |
| 5 | 24.0–29.5 | 01 | Three icon tiles (motion graphics, no footage): 带货 / 产品展示 / vlog | 适合：带货 · 产品展示 · vlog | L3 second half |
| 6 | 29.5–35.0 | 02 模板四步 | Step card ①; `05_ugc_vlog_template_pitfalls.jpg` top area (title 手持 UGC vlog) zoomed | ① 挑类型：手持UGC vlog | L4 "新手先用模板…第一步" |
| 7 | 35.0–40.5 | 02 | Step card ②; `06_prompt_to_agent_headphones.jpg`, zoom on the 【…】 bracket line, highlight "头戴式耳机" | ② 复制模板 换成你的产品 | L4 第二步 |
| 8 | 40.5–45.5 | 02 | Step card ③; same image, PiP the headphone product thumbnail (top-right of the screenshot) growing out | ③ 产品图+模板 发给AI | L4 第三步 |
| 9 | 45.5–49.5 | 02 | Step card ④; motion-graphic text box "粘贴 → 生成" (no app UI) | ④ 贴进即梦 Seedance 生成 | L4 第四步 |
| 10 | 49.5–57.0 | 02 payoff | `06a` 0.0–3.5 → jump-cut `06a` 5.5–7.5 → `06b` 0.5–4.0; small PiP of step-② screenshot top-left for 2 s | 手抖 · 对焦慢半拍 · 像真人拍 | L5 |
| 11 | 57.0–64.0 | 02 避坑 | `05_ugc_vlog_template_pitfalls.jpg` zoom to bottom "常见坑" block (≈ y 78–100%); red strike-through animation on "4K电影级打光" | ✗ 手持感 + 4K电影光 = 塑料感 | L6 first half |
| 12 | 64.0–70.0 | 02 避坑 | `06b` 0.5–3.0 freeze, overlay framing guide line at chest level | 最紧拍到胸口 | L6 second half |
| 13 | 70.0–77.0 | 03 打斗秘诀 | `07_combat_template_contact_points.jpg` zoom on 要点 "招式写成链" line; then `01a` 0.0–2.0 small with ✗ | 秘诀：写接触点 | L7 first half (payoff of hook) |
| 14 | 77.0–84.0 | 03 | Animated chain text: 直拳 → 勾拳 → 低扫 → 格挡 → 反击体踢; counter "≤4段" | 7–10秒 ≤ 4段动作 | L7 second half |
| 15 | 84.0–92.0 | 03 | Split-screen: top `01b` 3.6–4.6 slow-mo 0.5× + freeze (label 泰拳 · 大弧线, draw arc), bottom `01c` 3.9–4.5 slow-mo + freeze (label 跆拳道 · 直线弹出, draw straight arrow) | 泰拳：大弧线 / 跆拳道：直线 | L8 |
| 16 | 92.0–99.0 | 04 Skill进阶 | `08_template_vs_skill_table.jpg` crop top table; highlight 组织方式 / 主要交付 rows | 模板 = 单个镜头配方 / Skill = 整条短片拍摄手册 | L9 first half |
| 17 | 99.0–107.0 | 04 | Terminal-style card typing `npx seedance-prompt-library install`; then `11_skill_install_in_agent_blurred.jpg` slide-in (keep blur) | 一行命令装好 → 直接说需求 | L9 second half |
| 18 | 107.0–113.5 | 04 payoff | Side-by-side split: left `10b` 4.0–8.0 @2× + `10c` 4.5–7.5, right `12b` 3.0–5.0 @2× + `12c` 5.0–7.5. Labels on top. First 1.5 s: PiP `09_ugc_review_template_prompt.jpg` (crop to the black prompt bubble) over the left half | 模板版 \| Skill版 · 口播更多 卖点更多 | L10 |
| 19 | 113.5–120.0 | 05 总结 | `12c` 8.0–10.0 packshot as blurred background; three big words animate in; ends on 收藏 icon | 挑案例 → 复制换词 → 跑起来 | L11 |

`13_OPTIONAL_storyboard_sheet_broll.jpg` (storyboard sheet) can be used as background texture in shots 16–17 if needed.

---

## 5. Full narration (Chinese, verbatim) — ≈520 characters, ≈116–120 s

L1 左边对着空气打，右边一脚踢实。同一类模型，差的只是提示词里的一样东西。

L2 答案后面揭晓。先说工具：GitHub上有个开源项目叫awesome-seedance，专门整理Seedance视频提示词，每条都对过原帖，还换第二个模型重跑过。

L3 目前收了800多条案例、27个模板、80个视频Skill。做带货、产品展示、vlog，又不想烧积分试错的人，直接拿来用。

L4 新手先用模板，不用装任何东西。第一步，按画面挑类型，比如手持UGC vlog。第二步，复制模板，把方括号换成你的产品，比如头戴耳机。第三步，连产品图一起发给AI聊天助手，改成完整提示词。第四步，贴进即梦的Seedance生成。

L5 这是原作者用这个模板跑出来的耳机vlog，手抖、对焦慢半拍，很像真人随手拍。

L6 模板里最值钱的是常见坑。别在一条提示词里既要手持真实感，又要4K电影级打光，画面会发塑料；最紧拍到胸口，大特写容易露出AI脸。

L7 回到开头。打斗只写“激烈搏斗”没用，要写接触点：拳打中哪里，对方怎么格挡、怎么反击，再把招式串成一条链。7到10秒的打斗，超过4段动作就看不清了。

L8 还能指名流派。同样是踢腿，泰拳是全身旋转的大弧线，跆拳道是髋部弹出去的直线。

L9 每周都做同一类视频，就上Skill。模板是单个镜头的配方，Skill是整条短片的拍摄手册，帮你拆分镜、写提示词、列检查清单。在Claude Code或Codex里一行命令装好，直接说需求。

L10 同一瓶洗发水，左边模板版，右边Skill版，口播和卖点更多，更像测评。

L11 先挑一个喜欢的案例，复制、换词、跑起来。收藏这条，做视频时照着用。

Re-hook map: 0 s hook (open loop) → ~18 s numbers → ~30 s "四步" → ~50 s result payoff → ~57 s 避坑 → ~70 s hook payoff → ~84 s 泰拳 vs 跆拳道 → ~99 s one-line install → ~107 s template vs Skill comparison → ~114 s CTA.

---

## 6. Fact sources (for you; do not show on screen)

| Claim | Source |
|---|---|
| Repo, license, Seedance 2.5/2.0, 851 cases / 495 retests / 27 templates / 80 Skills, 5-step Start Here, template vs Skill table | awesome-seedance README (fetched 2026-10-19) |
| `npx seedance-prompt-library install` | README Skills section + npm registry (`seedance-prompt-library` 0.3.0) |
| `npx skills add LearnPrompt/awesome-seedance --skill seedance-production-workflow` | README Skills section (skills CLI = vercel-labs/skills) |
| UGC vlog pitfalls (4K lighting, chest-up, no digital zoom) | `docs/templates/en/handheld-ugc-vlog.md` |
| Contact points, attack chains, ≤4 segments in 7–10 s, discipline biomechanics | `docs/templates/en/combat-choreography.md` |
| Example results (headphones, Muay Thai/Taekwondo, shampoo template vs Skill) | original post (author's own runs) — shown only as 「案例展示」 |

---

## 7. Cover text

- **6:7 (视频号/抖音 grid):** main 「AI打架不再对着空气」 / sub 「800+实测提示词 开源」. Background: split freeze of 01a vs 01b impact frame.
- **3:4 (小红书):** main 「抄作业！800+条AI视频提示词」 / sub 「4步上手 · 避坑全写好」. Background: shampoo packshot (12c 9.0 s) + small fight freeze.

---

## 8. Publishing copy

**Douyin (primary)**
- Title: 「AI视频总抽废卡？这个开源提示词库直接抄作业」
- Caption: 「同样让AI拍打架，一个对着空气挥拳，一个一脚踢实，差的就是提示词里的“接触点”。awesome-seedance 整理了800多条实测案例和27个模板，新手复制换词就能用，进阶还能装Skill。」
- Hashtags: #AI视频 #Seedance #即梦 #AI工具 #提示词 #AI带货
- Reminder: tick **「内容由AI生成」** when publishing; footage is labeled 「案例展示」.

**视频号 (optional):** title 「800多条AI视频提示词，全部实测开源」, same caption, hashtags #AI视频 #AI工具 #Seedance.

**小红书 (optional):** title 「AI视频抄作业｜800+实测提示词库」; caption: 4 steps in bullet form (挑类型 / 复制换词 / 发给AI改写 / 贴进即梦生成) + two pitfalls; tags #AI视频 #即梦 #Seedance #AI工具 #提示词.

---

## 9. Materials index

See `README.md` for the full list, what was skipped and why, and file sizes.
