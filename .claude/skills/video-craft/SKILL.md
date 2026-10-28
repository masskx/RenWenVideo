---
name: video-craft
description: How every short video in this repo is made — AI tools / AI news videos for 微信视频号, 抖音 and 小红书 built from the user's idea plus source material (the script and storyboard are ours to write). Use whenever making, revising, re-rendering or packaging a video, or reviewing why one doesn't hook or hold viewers. Priority order (hook → retention → phone readability → fidelity → polish), the directing method learned from eight code-video repos + huashu-motion + Xian's 梵高 explainer (one idea, one sentence one picture, found colours, props), the required brief + directing section, voicing with the user's MiniMax voice (MashuaiDouyin01; the Doubao clone kept as an option), render, QA gates (brief, echo, jury) and packaging.
---

# video-craft

In a new session run `npm run doctor` first. Read every time: `docs/video-craft/quick-reference.md` (one page; it wins over every other doc), `docs/video-craft/导演方法.md` (how to make a film good), and `docs/video-craft/经验.md` (the user's words and what worked, before each film). The workflow and hard rules are in the root `CLAUDE.md`.

| File | Open it when |
| --- | --- |
| `导演方法.md` | always — input = idea + material, the three asset cases, the six rules (一句一画 …), one idea, benchmark, three structures, style + found colours, treatment, prove the look, review, retro |
| `学习/README.md` | what the eight repos + huashu-motion + Xian teach, and where each lesson is enforced; per-repo notes beside it |
| `分镜模板.md` | writing `tutorials/<id>.storyboard.md`: `## 简报` (5) + `## 导演` (10) are required, `## 镜头表` one row per sentence |
| `账号风格.md` | the account layer (type, captions, annotation hand, colour *method*) |
| `平台与合规.md` | Douyin / 视频号 / 小红书 habits, safe zones, the implicit rules (§三) before publishing |
| `评审表.md` | the jury rubric; `node scripts/qa/jury.mjs <id>` builds the packet |
| `huashu-motion.md` | huashu's directing, colour and its templates (`scripts/huashu-new.mjs`) |
| `配音.md` | voicing: the MiniMax voice (default) or the Doubao clone, timestamps → subtitles, pace presets, readings |
| `抖音技巧.md` | always — opening layers, the second hook at 15–20 s, the five endings, tail ≤ 1 s, titles / tags / comments on 抖音 |
| `hooks.md` | always — the first line, frame 0, the first 10 s and film length, from our own platform data (`数据复盘-2026-10-26.md`) |
| `文案.md` | writing the narration for the ear |
| `封面.md`, `音效.md` | covers; sound effects (CC0 / CC BY, credits) |
| `prompt-library/` | the pinned docs (`vendor/`) and code (`code/`) of the reference repos; `node scripts/prompts/find.mjs <words>` |
| `踩坑清单.md` | before the final check; add new failure modes here |

## Steps

1. **Read** `inputs/<id>/` (idea.md or script.md, sources, material). A planner's script or shot list is reference, not a spec: keep its facts and compliance notes, write the narration and shots yourself. Note which asset case it is (导演方法 §一: images / images + video / none).
2. **Pick the template, then direct.** First the best-fitting template from the library (user, 2026-10-28: every new topic → the most suitable template from the repository, applied): `docs/video-craft/prompt-library/选用指南.md` §〇 maps the topic to a lemo-opuscar style or an OPUSCAR 98 prompt; read its whole `STYLE.md` and follow its system in 9:16 (captions, package, type, grade, cutting, sound, native move; `src/lab/PackageLab.tsx`); write `- 模板：lemo/<style>` in `## 导演`, then customise it to the content (user, 2026-10-28: so the films don't all look the same) — `- 模板改造：` 3–5 changes (palette from this film's material, type, tempo, sound, one native move swapped, borrowed moves), essence and engine kept (`选用指南.md` §〇.3, lemo `MY-STYLES.md`); check `docs/video-craft/模板记录.md` for what the last films used. Then (导演方法 §三.1–5): one idea; a benchmark (what to learn / not take); three structures, pick one; a style that grows from the subject (`find.mjs`, lemo / mg15 / huashu / Xian's 11) and colours **found in the material** (`node scripts/qa/palette.mjs <image> 8 x:y`; never navy + gold, dark + one warm accent, or cream + serif + orange by default); ground by emotion; one object carried through; a signature shot; poster frame 0; a held climax; how it differs from the last three films. Write `## 简报` + `## 导演` + `## 镜头表` (one row per sentence: the concrete prop and what it does, framing, camera, reads, on-screen text that is *seen*, not narrated). `node scripts/qa/brief.mjs <id>` must pass.
3. **Prove the look** before the full build (2D first; start from `agent-compute-hijack-v3`'s depth kit — lit drawings, floor, grain, `ContactShadow`, `camAt` camera, parallax `Layer`): 3 style frames + frame 0 in real code (Remotion scenes with `src/tutorial/props.tsx`, or a page via `scripts/page-render.mjs` / `scripts/huashu-new.mjs`; `src/lab/PropsLab.tsx` is the bench), put beside the benchmark with `node scripts/qa/compare.mjs`. Print the plan (hook, scenes with durations, total, the style frames) and wait for the user's OK.
4. **Voice** (`npm run tutorial:voice -- <id>`), **music** (every film: `"score"` in the config, `npm run tutorial:score -- <id> --preview`; the render composes it if missing or stale; `音效.md` §六), **build** scene by scene (key poses first), **render** (`npm run tutorial:render -- <id> --overwrite`).
5. **Review**: `brief.mjs`, `echo.mjs` (on-screen text echoing the narration > ⅓ fails), richness / marks / clutter / scan `--phone`, `cover.mjs`, `npm run lint`; look at the frames at three zooms; `node scripts/qa/jury.mjs <id> --with=<benchmark>` and have an independent reviewer score it with `评审表.md` (a subagent only when the user allows; otherwise self-review marked "自评，非独立"); fix the top three, review again.
6. **Package** `douyin/<id>/` (per-platform titles / descriptions / hashtags, credits, AI-content label), then add a row to `经验.md` and ask the user for a 1–10 score.
7. **Platform data**: when the user shares a 抖音 export, run `python scripts/stats/douyin-export.py <xlsx> --since=<date> --out=docs/video-craft/数据/<date>.md` and fold what it shows into `hooks.md`, `经验.md` and the checks (the export itself is never committed).

The cinema look (`src/tutorial/cinema.tsx`, `"theme": "cinema"`) is one optional world now, not the default (user, 2026-10-23: "像加了动画的 PPT""配色很屎").
