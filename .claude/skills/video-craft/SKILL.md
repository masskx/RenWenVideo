---
name: video-craft
description: Quality rules and workflow for every Douyin video in this repo (long-form explainers in explainers/ and code-drawn tutorials in tutorials/). Use whenever making a new video, revising one, re-rendering, or reviewing why a video feels static or hard to read — storyboard change lists, A/B keyword colours, transition plans, the src/fx motion library, and the mandatory QA gates (richness check, scan sheets, phone-width readability, size and loudness) before anything is committed.
---

# video-craft: make every video readable and alive

Rules live in `docs/video-craft/` (Chinese). Read them before writing a new composition or scene:
- `讲解动画规则.md` — sizes, contrast, Douyin safe areas, A/B colours, one idea per shot, motion timing.
- `动效与画面变化.md` — change cadence, transitions, layering, beat push/pull, checklist, `src/fx` API table.
- `概念画法.md` — how to turn an abstract concept into a moving picture.

## Workflow

1. **Storyboard with a change list.** For every shot write: entrance → main action (on a keyword) → secondary action → exit/transition. A shot with no main action is a text slide — rethink it.
   - Explainers: each scene gets a `stamp: {line, phrase, text}` in `explainers/<id>.json`; `build-explainer.mjs` turns the phrase into a time.
   - Tutorials: put `{a}` cue marks in the narration and drive scene animations from `cue('a')`.
2. **Pick the two core nouns (A/B).** The two concepts viewers must remember, ideally in ≥ 2 caption lines each. Explainers: `highlights: [{text, role: 'A'}, {text, role: 'B'}]` plus `emphasis: [...]`. Keep every other accent out of the A/B hues.
3. **Plan transitions** with `planCuts`: big kinds for section/step changes, small kinds inside a section; at least 3 kinds, never the same kind 3× in a row. Small cuts inside a section wrap only the background so headlines stay put.
4. **Keep it moving**: ≥ 2 layers (background + particles/light), a new framing on every caption line (`beatZoom` for full-bleed photos, `beatTour` for sparse panels on a dark stage), `sway` on held cards, `shake` on stamps.
5. **Determinism**: everything is a function of `t = frame / fps`. No CSS animations/transitions, `Date.now()`, or `Math.random()` — use `hash(n)`.
6. **Respect the safe areas**: content in x 60–930, y 160–1290; captions only in y 1290–1500; nothing that matters below y 1560 or under the right-hand button column (x > 930).

## QA gates (all must pass before committing a video)

```bash
node scripts/render-explainer.mjs --composition=<Id> --still=… --out=qa/<id>/f.png   # or render-tutorial.mjs <id> --stills=…
node scripts/qa/richness.mjs douyin/<id>/video.mp4        # must say 判定：过 (avg ≥ 10, no near-static pair)
node scripts/qa/scan.mjs douyin/<id>/video.mp4            # look at every sheet: no clipped/overlapping text, ≥ 3 transition kinds
node scripts/qa/scan.mjs douyin/<id>/video.mp4 --phone=s1,s2,s3   # text readable at 360 px wide
ffprobe … / ebur128                                        # 1080×1920, 30 fps, h264+aac; about -15 LUFS; file < 100 MB
```

- If richness fails, look at the flagged 2.5 s windows and add a visible change there (new element, new framing, colour change) — don't just raise particle counts.
- Iterate with `render-tutorial.mjs <id> --draft --overwrite` (2/3 scale; pass `--band 860:1000` to richness for drafts) before a full render.
- More motion means more bits: explainers render well at `--crf=25`, tutorials at the default `--crf=22`/`23`.
- Read every still you render before showing or committing anything.

## Provenance

Adapted from chuspeeism/dashi-animationstyle (MIT, © 2026 Dashi AI Lab); see `docs/video-craft/README.md`.
