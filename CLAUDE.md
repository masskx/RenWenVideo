# RenWenVideo

Remotion pipeline that turns a script plus source material into short vertical videos (1080×1920, 30 fps) about AI tools and AI news. The same video goes to 微信视频号, 抖音 and 小红书. Viewer, niche and platforms are defined in one place: `docs/video-craft/quick-reference.md` §〇. All on-screen text is Simplified Chinese.

The script usually comes from a separate planning agent ("growth"): use it and the material as given; adapt scenes, length and visuals to them. No fixed scene count, shot table or animation recipe.

## Priority order

1. Hook: the first 1–3 seconds must show and say the most interesting thing.
2. Retention: every few seconds something new happens (new number, new screen, new contrast); cut anything that doesn't earn its time.
3. Phone readability: big text, full-screen use, nothing important in platform UI zones.
4. Fidelity to the given script and material (don't invent facts; label creator claims as claims).
5. Polish (motion design, transitions, sound) — only after 1–4 are satisfied.

## Workflow

1. **Input** — `inputs/<id>/script.md` (hook, body, ending, titles; free-form is fine) plus material: screenshots, screen recordings, links, numbers (skeleton: `inputs/_template/`).
2. **Plan** — read script + material; write `tutorials/<id>.json`, `tutorials/<id>.storyboard.md` (brief: 5 required fields, `docs/video-craft/分镜模板.md`) and `src/tutorial/scenes/<id>.tsx`, choosing scenes that fit the material. Every new video uses the cinema look (see House style below; user, 2026-10-22: "from now on let's do videos this way"). For style, structure or a signature move, optionally pull 1–2 references from the prompt library that fit the script type (`docs/video-craft/prompt-library/选用指南.md`; `node scripts/prompts/find.mjs <keywords>`) and rewrite them for this pipeline. Print a short plan (hook, scenes with durations, total length) and wait for the user's OK. ≤ 60 s unless the script needs more and the user approves (`"maxSeconds"`).
3. **Voice** — `npm run tutorial:voice -- <id>`: the user's cloned Doubao voice; per-character timestamps drive cues and subtitles.
4. **Render** — `npm run tutorial:render -- <id> --overwrite` (1080×1920 H.264, covers).
5. **QA** — `node scripts/qa/brief.mjs <id>`, `cover.mjs <id>`, `richness.mjs` / `marks.mjs` / `scan.mjs` (+ `--phone`) on the mp4, `npm run lint`; look at the stills yourself before showing them.
6. **Package** — `douyin/<id>/`: mp4 (committed like every other artifact; keep it < 100 MB), covers, stills, README with separate title / description / hashtags for 视频号, 抖音, 小红书, and credits.

## Hard rules

- Narration: only the user's cloned voice on Doubao TTS (`DOUBAO_API_KEY`, `DOUBAO_VOICE_ZH`; never print or commit keys). edge-tts (`"tts": {"provider": "edge"}`) is a backup only when the user agrees — never a silent fallback. Details: `docs/video-craft/配音.md`.
- Don't invent facts or numbers; label creator claims (「据 @作者」); first person only for things that really happened.
- External footage: muted, bottom-right label 「@作者｜案例展示」, author link in the package README.
- If the script's hook is weak or missing, pick one from `docs/video-craft/hooks.md` and tell the user which.
- `npm run lint` must pass; each mp4 < 100 MB; record new failure modes in `docs/video-craft/踩坑清单.md`.
- Cloud container: `REMOTION_BROWSER_EXECUTABLE=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell` for renders; `TTS_CA_BUNDLE=/root/.ccr/ca-bundle.crt` for the edge-tts backup.

## Docs

- **Read every time:** `docs/video-craft/quick-reference.md` (one page).
- On demand (optional reference): `docs/video-craft/README.md` lists the rest — narration, cover, sound, motion, styles, pitfalls. Old rules live in `docs/video-craft/archive/`.
- Prompt library (optional): `docs/video-craft/prompt-library/` — pinned verbatim snapshots of 8 Opus-video prompt repos; never edit `vendor/`, refresh with `node scripts/prompts/snapshot.mjs` (adds a new snapshot; `--pin` to switch).
- House style (user, 2026-10-22): the early explainers `ai-era-11-rules` / `marketing-engineer` are the taste reference; later videos read as cluttered and cheap. Tutorials use the cinema look (`"theme": "cinema"`, `src/tutorial/cinema.tsx`); baselines `tutorials/claude-proactive-agent-cinema` and `tutorials/litellm-pypi-poison-cinema` (+ scene files). Rules: quick-reference §六 "高级感"; how to build and how to remake an older video: `.claude/skills/video-craft/SKILL.md`. Commands: `README.md`.
