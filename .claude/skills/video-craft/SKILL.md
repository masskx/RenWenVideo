---
name: video-craft
description: How every short video in this repo is made — AI tools / AI news videos for 微信视频号, 抖音 and 小红书 built from a script (usually from the "growth" planning agent) plus source material. Use whenever making, revising, re-rendering or packaging a video, or reviewing why one doesn't hook or hold viewers. Priority order (hook → retention → phone readability → fidelity → polish), the flexible 5-field brief, voicing with the user's cloned Doubao voice, render, QA gates and packaging.
---

# video-craft

Read `docs/video-craft/quick-reference.md` first (one page; it wins over every other doc). The workflow and hard rules are in the root `CLAUDE.md`. Everything else in `docs/video-craft/` is optional reference — open a file when the task needs it:

| File | Open it when |
| --- | --- |
| `quick-reference.md` | always — viewer / niche / platforms, priority order, length, readability, brief, QA, §十 technique checklist |
| `分镜模板.md` | writing `tutorials/<id>.storyboard.md` (required: 简报 + 参考提示词) |
| `配音.md` | voicing: cloned Doubao voice, timestamps → subtitles, pace presets, readings, edge-tts backup |
| `文案.md` | the script needs (re)writing for the ear, or there is no script |
| `封面.md` | designing the covers |
| `音效.md` | choosing sound effects (Freesound via Openverse, CC0 / CC BY, credits) |
| `动效与画面变化.md`, `概念画法.md`, `风格词典.md`, `风格卡模板.md`, `审美参考库.md` | polish: motion, `src/fx`, styles, references |
| `讲解动画规则.md` | layout numbers, font sizes, colours |
| `prompt-library/选用指南.md` | planning, every video: which stored prompts / style prompts fit this script type, how to rewrite them for 9:16 Remotion + Doubao; search with `node scripts/prompts/find.mjs <keywords>`; `--fit=<type> --min=2` lists the opus55 prompts worth borrowing for a script type |
| `prompt-library/opus55-研读.md` | planning, every video: what the 703 opus55 prompts teach — recurring families, practices mapped to the priority order, best picks per script type, what not to copy (CTA, fake data, 16:9) |
| `踩坑清单.md` | before the final check; add new failure modes here |
| `archive/` | old rules (director layer, physics chain, ban list) — optional reference only |

## Steps

1. Read `inputs/<id>/script.md` and the material. Use the script's hook; if weak or missing, pick from `hooks.md` and say which.
2. Plan scenes from the material actually available (no fixed count). Run `node scripts/prompts/find.mjs --fit=<script type> --min=2`, read `选用指南.md` §二 and `opus55-研读.md` §五, take 1–2 techniques and write them into the storyboard's `## 参考提示词` (id + technique → scene). Apply the `quick-reference.md` §十 checklist. Write the storyboard 简报 + `tutorials/<id>.json` + scene file. Print the plan (hook, scenes with durations, total, techniques used) and wait for the user's OK.
3. Voice, render, run the QA gates in `quick-reference.md` §八, look at the contact sheets and stills (0 s, 1 s, 3 s, payoff) yourself, do the §十 self-review (P0/P1/P2), fix, then show the user.
4. Package `douyin/<id>/` with per-platform titles / descriptions / hashtags and credits.
