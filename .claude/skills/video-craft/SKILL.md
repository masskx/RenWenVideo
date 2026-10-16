---
name: video-craft
description: Mandatory production rules for every video in this repo (long-form explainers in explainers/, code-drawn tutorials in tutorials/), adapted from chuspeeism/dashi-animationstyle plus the director-layer method from guanmo_ai / twoclipping. Use whenever turning a post/article into a Douyin video, making or revising a video, choosing a visual style, re-rendering, or reviewing why a video feels static, out of sync, hard to read or "AI-made" — director brief (8 items), references, storyboard with subject layers / force & contact frames / phase offsets / SFX per shot, closed-form springs and physics in src/fx, one key light and contact shadows, SFX on contact frames, the AI-feel ban list, 3-still approval, frame-by-frame review, and the QA gates (brief, richness, scan, beat check, phone-width readability, size, loudness) that must pass before anything is committed.
---

# video-craft: how every video in this repo is made

Knowledge lives in `docs/video-craft/` (Chinese) — read the relevant files, don't work from memory. **Start with `导演层.md`**: it is the director layer (taste, physics, light, sound, ban list) and overrides the older files where they conflict.

| File | Read it when |
| --- | --- |
| `发布与风格偏好.md` | always, before anything: user feedback — publish on WeChat Channels (verify size/cover specs first; reportedly 6:7 1080×1260), and tech topics need a tech-family look, not paper |
| `导演层.md` | always, first: why our videos look AI-made, the 8-item brief, order of work, subject / secondary / background and phase offsets, motion chain (anticipation → stretch → impact → squash → overshoot → settle → secondary), physics, one key light, SFX on contact frames, camera, references, ban list, acceptance |
| `讲解动画规则.md` | always: sizes, contrast, Douyin safe areas, A/B colours (≤ 2 accents on screen), one idea per shot, motion timing |
| `动效与画面变化.md` | storyboarding and writing scenes: change cadence, transitions, `src/fx` API (springs, toss/drop, squash, follow, ContactShadow, Smear, sfx) |
| `分镜模板.md` | before writing any scene code (brief + per-shot table) |
| `风格词典.md` | choosing or describing a style; working from a reference image or a vibe |
| `审美参考库.md` | picking references; the subtraction check on stills (is this element necessary? where does the eye land? enough size contrast?); judging the opening and cover like a landing-page hero |
| `风格卡模板.md` | creating a new style |
| `概念画法.md` | an abstract idea needs a moving picture |
| `踩坑清单.md` | before stills and before the final scan — known failure modes, including the AI-feel diagnosis of our own past videos |

## Workflow (do the steps in order)

1. **Source and pipeline.** Fetch the source (X posts: `api.fxtwitter.com`, articles come as blocks + entityMap; read the images too, they often carry the substance). Pick the pipeline: *explainer* (opinions, interviews, "N conclusions"; AI illustrations + CosyVoice) or *tutorial* (tools, prompts, steps; code-drawn visuals). Narration: CosyVoice via `DASHSCOPE_API_KEY`.
2. **Reference.** Pick 1–2 pieces from the gallery (https://guanmo-ai.github.io/awesome-ai-motion/, categories 知识讲解 / 短动效 / 产品宣传), look at real frames (fxtwitter gives the mp4 URL; `ffmpeg -vf fps=2,tile=…`), and write down the relations that make them work (subject, motion, light, sound). For static taste (whitespace, typography, hierarchy, palette, opening/cover, micro-interactions) pick from the 10 sites in `审美参考库.md` (Minimal Gallery, Typewolf, Lapa Ninja, Mobbin, Design Spells …). Understand *why* it works — collecting is not taste. Don't copy their assets.
3. **Director brief** — the 8 items in `导演层.md` §1 (goal, shots & hierarchy, trajectories & camera, motion & physics, material & light, beat & sound, bans, acceptance), at the top of the storyboard. Turn "make it better" into checkable constraints. Fewer freedoms, not more effects.
4. **Storyboard** → `tutorials/<id>.storyboard.md` / `explainers/<id>.storyboard.md` per `分镜模板.md`: per shot the narration with cue marks, what it must make clear, subject / secondary / background, force origin → contact frame (on which word) → recovery, phase offsets, SFX, and how the subject carries into the next shot. One main event at a time. At least one subject persists and morphs across shots.
5. **A/B core nouns** with fixed colours; no other accent on screen at the same time.
6. **Build** with `src/fx`: closed-form springs (`springTrack`, `twoEdge`), `toss`/`drop` for trajectories and contact times, `squash`/`impulse` for deformation, `PHASE`/`ripple` for staggered layers, `follow` for a lagging camera (scenes declare `camera(cue, dur)` keys that point at the subject of each moment), `matte` + `ContactShadow` under one key light, `Smear` on fast moves, `sfx()` events computed from the same physics. Tutorials: set `look` in the config (`theme`, `tour: false`, no particles). Everything is a function of `t` — no CSS animations, `Date.now()`, `Math.random()`.
7. **3 stills before the full render** (opening, middle, end; ~0.3 s after a keyword) **plus a frame-by-frame look** (`node scripts/qa/frames.mjs <video-or-draft> --from=s --to=s`) around one main event: anticipation, contact, squash, settle and phase offsets must be visible. Read them yourself (also at 360 px wide), run the subtraction check from `审美参考库.md` §3 (delete what the viewer wouldn't miss), then show the user and wait for a nod. With nobody to ask, write the judgement into the storyboard's "静帧判断" section and carry on.
8. **Full render, then the QA gates — all must pass before committing:**

```bash
node scripts/qa/brief.mjs <id>                            # brief has 8 items; shots list subject/force/phase/SFX; no banned patterns in scene code
node scripts/qa/richness.mjs douyin/<id>/video.mp4        # 判定：过 — avg ≥ 10, no near-static 2.5 s window
node scripts/qa/marks.mjs douyin/<id>/video.mp4           # every "前" frame lacks the action, every "后" frame shows it
node scripts/qa/scan.mjs douyin/<id>/video.mp4            # every sheet: no clipped/overlapping text, ≥ 3 transition kinds
node scripts/qa/scan.mjs douyin/<id>/video.mp4 --phone=s1,s2,s3   # text readable at 360 px wide
ffprobe … ; ffmpeg -af ebur128                            # 1080×1920, 30 fps, h264+aac; about −15 LUFS; < 100 MB; voice always clear over SFX
```

   - Richness fails → give the subject a process, let secondary layers respond, move the camera for a reason, morph into the next state — not particles, not whole-stage push/pull.
   - Iterate with drafts: `render-tutorial.mjs <id> --draft --overwrite` (richness with `--band 860:1000`).
   - Size: explainers `--crf=25`, tutorials `--crf=22`–`25`.
9. **Package** `douyin/<id>/`: video, cover (a settled frame from the hook — check it), SRT, `README.md` with titles, description, hashtags, pinned comment if the video promises links/commands, and sources (credit the original author; note sponsorship and what was not verified).
10. **Record lessons**: add any new failure to `踩坑清单.md` §二.

## Hard rules

- Safe areas: content x 60–930, y 160–1290; captions only y 1290–1500; nothing that matters below y 1560 or at x > 930.
- Sizes at 1080 wide: captions ≥ 60 px, labels ≥ 40 px, titles ≥ 80 px; contrast ≥ 4.5:1 for text.
- **Ban list** (`导演层.md` §9): synchronized fade/pop of many elements; glow without a light source (coloured outer `boxShadow`, neon strokes, text glow); gradient labels; whole-stage push/pull every caption (`beatTour`) and whole-frame shake; deformation without contact; centered big text + card stacks + screens full of words; > 2 accent colours on screen; confetti/particle bursts as "richness"; jelly bounce; every shot rebuilt from blank; SFX pasted on afterwards or louder than the voice.
- Motion chain for every main action: anticipation → (stretch) → contact on the keyword → squash → small overshoot → settle → secondary response a few frames later.
- ≤ 3 flashes per second; motion eases or springs — never linear.
- Never show the source's screenshots or a real person's likeness; credit the author on screen and in the README.
- Read every still you render before showing or committing it.
