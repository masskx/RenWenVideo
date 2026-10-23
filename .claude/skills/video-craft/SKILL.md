---
name: video-craft
description: How every short video in this repo is made — AI tools / AI news videos for 微信视频号, 抖音 and 小红书 built from a script (usually from the "growth" planning agent) plus source material. Use whenever making, revising, re-rendering or packaging a video, or reviewing why one doesn't hook or hold viewers. Priority order (hook → retention → phone readability → fidelity → polish), the flexible 5-field brief, voicing with the user's cloned Doubao voice, render, QA gates and packaging.
---

# video-craft

Read `docs/video-craft/quick-reference.md` first (one page; it wins over every other doc). The workflow and hard rules are in the root `CLAUDE.md`. Everything else in `docs/video-craft/` is optional reference — open a file when the task needs it:

| File | Open it when |
| --- | --- |
| `quick-reference.md` | always — viewer / niche / platforms, priority order, length, readability, brief, QA |
| `分镜模板.md` | writing `tutorials/<id>.storyboard.md` (only the 简报 is required) |
| `配音.md` | voicing: cloned Doubao voice, timestamps → subtitles, pace presets, readings, edge-tts backup |
| `文案.md` | the script needs (re)writing for the ear, or there is no script |
| `封面.md` | designing the covers |
| `音效.md` | choosing sound effects (Freesound via Openverse, CC0 / CC BY, credits) |
| `动效与画面变化.md`, `概念画法.md`, `风格词典.md`, `风格卡模板.md`, `审美参考库.md` | polish: motion, `src/fx`, styles, references |
| `讲解动画规则.md` | layout numbers, font sizes, colours |
| `prompt-library/选用指南.md` | planning: which stored prompts / style prompts fit this script type, how to rewrite them for 9:16 Remotion + Doubao; search with `node scripts/prompts/find.mjs <keywords>` |
| `huashu-motion.md` | every video (user, 2026-10-23, "apply as fits"): huashu-motion's directing method for this pipeline — poster frame 0, continuity chain, a dense stretch at 30–60 %, count-ups landing on the word, emphasis by dimming, self-review notes |
| `踩坑清单.md` | before the final check; add new failure modes here |
| `archive/` | old rules (director layer, physics chain, ban list) — optional reference only |

## Steps

1. Read `inputs/<id>/script.md` and the material. Use the script's hook; if weak or missing, pick from `hooks.md` and say which.
2. Plan scenes from the material actually available (no fixed count). **Visuals: the cinema look** (user, 2026-10-22 — "from now on let's do videos this way"): copy the `look` block from `tutorials/claude-proactive-agent-cinema.json` (`"theme": "cinema"`, `"header": "label"`) and build scenes from `src/tutorial/cinema.tsx` (`Headline`, `Surface`, `Terminal`, `Reveal`, `Pool`); per scene one headline that states the point (never the caption's words) and one hero on one panel; gold is the only accent, red only for danger; no chapter or progress bars, chips, outlined boxes, grids or per-element "示意" tags (one credit line at the top). Every cue needs a large visible change, not a small highlight. Scene files to copy from: `claude-proactive-agent-cinema.tsx`, `litellm-pypi-poison-cinema.tsx`. Optionally pick 1–2 references from the prompt library by script type (`prompt-library/选用指南.md` §二) and note them in the storyboard. Apply `huashu-motion.md` where it fits and add its §三 self-check lines to the storyboard. Write the storyboard 简报 + `tutorials/<id>.json` + scene file. Print the plan (hook, scenes with durations, total) and wait for the user's OK.
3. Voice, render, run the QA gates in `quick-reference.md` §八, look at the stills (0 s, 1 s, 3 s, payoff) yourself, then show the user.
4. Package `douyin/<id>/` with per-platform titles / descriptions / hashtags and credits.

**Remaking an older video in the cinema look** (no new voice needed): keep its narration, cues and facts; copy `tutorials/<id>.json` → `<id>-cinema.json` (new `look`, `series`, one `credit` line, `visual` keys renamed) and the timeline with the new `id`; write `src/tutorial/scenes/<id>-cinema.tsx`; render to `douyin/<id>-cinema/` with `compare.jpg` (original vs remake at the same moments) and the original's publish copy. Leave the original package untouched.
