---
name: video-craft
description: Mandatory production rules for every video in this repo (long-form explainers in explainers/, code-drawn tutorials in tutorials/), adapted from chuspeeism/dashi-animationstyle. Use whenever turning a post/article into a Douyin video, making or revising a video, choosing a visual style, re-rendering, or reviewing why a video feels static, out of sync or hard to read — storyboard with per-shot change lists, style dictionary, A/B keyword colours, transition plans, the src/fx motion library, 3-still approval, and the QA gates (richness, scan, beat check, phone-width readability, size, loudness) that must pass before anything is committed.
---

# video-craft: how every video in this repo is made

The rules come from [dashi-animationstyle](https://github.com/chuspeeism/dashi-animationstyle) (MIT), adapted to Remotion and 9:16 Douyin. Knowledge lives in `docs/video-craft/` (Chinese) — read the relevant files, don't work from memory:

| File | Read it when |
| --- | --- |
| `讲解动画规则.md` | always: sizes, contrast, Douyin safe areas, A/B colours, one idea per shot, motion timing |
| `动效与画面变化.md` | storyboarding and writing scenes: change cadence, transitions, layering, beat push/pull, checklist, `src/fx` API |
| `分镜模板.md` | before writing any scene code |
| `风格词典.md` | choosing or describing a style; working from a reference image or a vibe |
| `风格卡模板.md` | creating a new style |
| `概念画法.md` | an abstract idea needs a moving picture |
| `踩坑清单.md` | before stills and before the final scan — known failure modes from both projects |

## Workflow (do the steps in order)

1. **Source and pipeline.** Fetch the source (X posts: `api.fxtwitter.com`, articles come as blocks + entityMap with code blocks). Pick the pipeline: *explainer* (opinions, interviews, "N conclusions"; AI illustrations + CosyVoice) or *tutorial* (tools, prompts, steps; code-drawn UI). Narration: CosyVoice via `DASHSCOPE_API_KEY` (explainers always; tutorials with `"tts": {"provider": "dashscope", …}`).
2. **Style.** Default is the existing dark-tech look of each pipeline. If the user names a feeling, a reference image or a style, use `风格词典.md` (descriptor table, 27 styles, the 7-question brief, `scripts/qa/palette.mjs` for reference colours) and write a style card from `风格卡模板.md`.
3. **Storyboard first** → `tutorials/<id>.storyboard.md` / `explainers/<id>.storyboard.md` per `分镜模板.md`: per shot the narration with cue marks, what it must make clear, keywords, entrance → **main action on a keyword** → secondary action → transition. A shot without a main action is a text slide — rethink it. Put cue marks on phrase boundaries and one cue before each item that is named in the same sentence.
4. **A/B core nouns.** The two concepts viewers must remember (≥ 2 caption lines each) get fixed colours everywhere; other accents avoid their hues. List content without such a pair: say so in the storyboard.
5. **Build** with `src/fx`: `planCuts` (≥ 3 kinds, big for topic/step changes, small inside — small cuts wrap only the background), a new framing per caption line (`beatZoom` full-bleed / `beatTour` sparse panels; tune `motion` for full-width layouts), `sway` on held cards, `Stamp` + `shake` for conclusions, background that always moves. Everything is a function of `t` — no CSS animations, `Date.now()`, `Math.random()`.
6. **3 stills before the full render** (opening, middle, end; ~0.3 s after a keyword). Read them yourself (also at 360 px wide), then show the user and wait for a nod. With nobody to ask, write the judgement into the storyboard's "静帧判断" section and carry on.
7. **Full render, then the QA gates — all must pass before committing:**

```bash
node scripts/qa/richness.mjs douyin/<id>/video.mp4        # 判定：过 — avg ≥ 10, no near-static 2.5 s window
node scripts/qa/marks.mjs douyin/<id>/video.mp4           # every "前" frame lacks the action, every "后" frame shows it
node scripts/qa/scan.mjs douyin/<id>/video.mp4            # every sheet: no clipped/overlapping text, ≥ 3 transition kinds
node scripts/qa/scan.mjs douyin/<id>/video.mp4 --phone=s1,s2,s3   # text readable at 360 px wide
ffprobe … ; ffmpeg -af ebur128                            # 1080×1920, 30 fps, h264+aac; about −15 LUFS; < 100 MB
```

   - Richness fails → add a visible change in the flagged windows (new element, layout change, new framing, colour shift) — not more particles.
   - Iterate with drafts: `render-tutorial.mjs <id> --draft --overwrite` (richness with `--band 860:1000`).
   - Size: explainers `--crf=25`, tutorials `--crf=22`–`25`.
8. **Package** `douyin/<id>/`: video, cover (a settled frame from the hook — check it), SRT, `README.md` with titles, description, hashtags, pinned comment if the video promises links/commands, and sources (credit the original author; note what was not verified).
9. **Record lessons**: add any new failure to `踩坑清单.md` §二.

## Hard rules

- Safe areas: content x 60–930, y 160–1290; captions only y 1290–1500; nothing that matters below y 1560 or at x > 930.
- Sizes at 1080 wide: captions ≥ 60 px, labels ≥ 40 px, titles ≥ 80 px; contrast ≥ 4.5:1 for text.
- ≤ 3 flashes per second; motion eases (outCubic/outBack in, inCubic out, inOutCubic camera).
- Never show the source's screenshots or a real person's likeness; credit the author on screen and in the README.
- Read every still you render before showing or committing it.
