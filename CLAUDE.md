# RenWenVideo

Pipeline (Remotion, plus any web page rendered frame by frame) that turns an idea plus source material into short vertical videos (1080×1920, 30 fps) about AI tools and AI news. The same video goes to 微信视频号, 抖音 and 小红书. Viewer, niche and platforms are defined in one place: `docs/video-craft/quick-reference.md` §〇. All on-screen text is Simplified Chinese.

Input is **an idea plus material** (user, 2026-10-23: "from now on I'll only provide materials and ideas; you arrange the production script yourself"). I write the script, treatment and shots; a planner's ("growth") script or shot list is reference, not a spec — keep its facts, compliance notes and emphasis. Material may be images, images + video, or nothing: `docs/video-craft/导演方法.md` §一 says how to handle each.

## Priority order

1. Hook: the first 1–3 seconds must show and say the most interesting thing.
2. Retention: every few seconds something new happens (new number, new screen, new contrast); cut anything that doesn't earn its time.
3. Phone readability: big text, full-screen use, nothing important in platform UI zones.
4. Fidelity to the material and its sources (don't invent facts; label creator claims as claims).
5. Polish (motion design, transitions, sound) — only after 1–4 are satisfied.

## Workflow

**New session or container: run `npm run doctor` first** (dependencies, render browser, voice keys present, repo fonts, branch up to date with `main`); fix what it lists, then read the docs below. Everything learned so far lives in the repo (docs, `经验.md`, components), not in any session's memory.

**Where we are (2026-10-23):** baseline film `douyin/agent-compute-hijack-v3` (user score 7, "及格了，之后做片再慢慢优化"); v2 scored 6 ("still too flat"). Knowledge videos are **2D first** (user: "像我这种只是分享知识的，还是优先在 2D 层面优化比较好"; no 3D engine unless asked). Start every new film from the v3 approach: props (`src/tutorial/props.tsx`) plus the 2D depth kit — lit drawings, floor line and grain (`Ground horizon/grain`), `ContactShadow`, a 2D camera (`camAt`) and parallax `Layer`s; see `src/tutorial/scenes/agent-compute-hijack-v3.tsx`. Next thing to improve: the characters act (v3's robot only floats).

Method: `docs/video-craft/导演方法.md` (built from the eight Opus-video repos, huashu-motion and Xian's 梵高 explainer; notes and "where each lesson is enforced" in `docs/video-craft/学习/README.md`). Read `docs/video-craft/经验.md` before each video. The six rules for every shot: one sentence one picture (no static text > 2 s), concrete props instead of abstractions, ground colour by emotion, visuals grown from the subject, one hero per frame, hold the climax ≥ 1.5 s.

1. **Input** — `inputs/<id>/`: `idea.md` (what to say, why now, facts with sources) plus material (screenshots, recordings, photos, links, numbers); skeleton `inputs/_template/`.
2. **Plan** — one idea (not a list of points), a motif, 1–2 benchmarks from the library (`docs/video-craft/prompt-library/`, `node scripts/prompts/find.mjs`), three candidate structures, a style chosen **for this topic** from lemo / mg-styles-15 / huashu / Xian plus the account layer (`docs/video-craft/账号风格.md`), colours **found in the material** (`scripts/qa/palette.mjs`; never an invented house look), a medium (Remotion with `src/tutorial/props.tsx`, or a web page rendered with `scripts/page-render.mjs`, e.g. from a huashu template via `scripts/huashu-new.mjs`), and a storyboard `tutorials/<id>.storyboard.md` with `## 简报`, `## 导演` (ten required decisions) and `## 镜头表` (one row per sentence: the prop and what it does, framing, camera, reads, on-screen text). `node scripts/qa/brief.mjs <id>` must pass. **Prove the look first**: 3 style frames + frame 0 in real code (bench: `src/lab/PropsLab.tsx`), compared with the benchmark (`scripts/qa/compare.mjs`). Print the plan with the frames and wait for the user's OK. ≤ 60 s unless the user approves more (`"maxSeconds"`).
3. **Voice** — `npm run tutorial:voice -- <id>`: the user's MiniMax voice (default); word timestamps drive cues and subtitles.
4. **Render** — `npm run tutorial:render -- <id> --overwrite` (1080×1920 H.264, covers); page scenes via `node scripts/page-render.mjs pages/<id>/<scene>`.
5. **Review** — machine checks (`node scripts/qa/brief.mjs <id>`, `echo.mjs <id>` (on-screen text echoing the narration > ⅓ fails), `cover.mjs <id>`, `richness.mjs` / `marks.mjs` / `scan.mjs --phone` / `clutter.mjs` on the mp4, `npm run lint`) are the floor, not the goal. Then: contact sheets, 0.1–0.2 s strips of key moves, crops; side by side with the benchmark and our last three films (`compare.mjs` — at least four of structure / opening / signature shot / camera path / score shape / ending must differ); an independent jury pass (`node scripts/qa/jury.mjs <id>`, rubric `docs/video-craft/评审表.md`; a subagent only when the user allows, else a self-review marked as such); fix the top three issues and look again.
6. **Package** — `douyin/<id>/`: mp4 (committed; < 100 MB), covers, stills, README with separate title / description / hashtags for 视频号, 抖音, 小红书, and credits. Then add a line to `docs/video-craft/经验.md` and ask the user for a 1–10 score and one sentence.

## Hard rules

- Narration (user, 2026-10-24: "from now on, when you help me make videos, always use this new MiniMax voice"): the user's MiniMax voice `MashuaiDouyin01` (T2A v2, `speech-2.8-hd`, key `MINIMAX_API_KEY`; reads Chinese with English nouns mixed in). It is the default (`"tts": {"provider": "minimax"}`, or no `tts` at all). The earlier cloned Doubao voice stays available (`"provider": "doubao"`, `DOUBAO_API_KEY`, `DOUBAO_VOICE_ZH`) for older films or when the user asks for it. Never print or commit keys. edge-tts (`"provider": "edge"`) is a backup only when the user agrees — never a silent fallback. Details: `docs/video-craft/配音.md`.
- Don't invent facts or numbers; label creator claims (「据 @作者」); first person only for things that really happened.
- External footage: muted, bottom-right label 「@作者｜案例展示」, author link in the package README.
- The hook is mine to design from the material (references: `docs/video-craft/hooks.md`); say in the plan what it is and why.
- `npm run lint` must pass; each mp4 < 100 MB; record new failure modes in `docs/video-craft/踩坑清单.md`.
- Cloud container: renders find the installed headless shell themselves (`chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell`, older images `chromium_headless_shell-1194/chrome-linux/headless_shell`; override with `REMOTION_BROWSER_EXECUTABLE`); `TTS_CA_BUNDLE=/root/.ccr/ca-bundle.crt` for the edge-tts backup.

## Docs

- **Read every time:** `docs/video-craft/quick-reference.md` (one page), `docs/video-craft/导演方法.md` (the method), `docs/video-craft/经验.md` (what past films taught, the user's own words).
- On demand (optional reference): `docs/video-craft/README.md` lists the rest — narration, cover, sound, motion, styles, pitfalls. Old rules live in `docs/video-craft/archive/`.
- huashu-motion (user, 2026-10-23: refer to it for every video and put it into practice): `docs/video-craft/huashu-motion.md` — its directing, colour method and templates; docs and code pinned in the prompt library.
- Xian's 梵高 explainer (user, 2026-10-23: "must be used to actually optimize our videos"): `docs/video-craft/学习/xian-梵高做片法.md`; its props rewritten in `src/tutorial/props.tsx` (the skill repo has no licence — nothing copied).
- The eight Opus-video repos (user, 2026-10-23: absorb them, don't just keep them): study notes `docs/video-craft/学习/`; pinned verbatim snapshots in `docs/video-craft/prompt-library/` — never edit `vendor/` or `code/`, refresh with `node scripts/prompts/snapshot.mjs [--set=code]` (adds a new snapshot; `--pin` to switch).
- Style (user, 2026-10-23): the recent cinema-template videos read as "a PowerPoint with animations that you read aloud" and the colours as dull — no fixed template any more. Each film picks its style for the topic; what stays the same across the account is in `docs/video-craft/账号风格.md` (type, captions, annotation hand, colour method; awaiting the user's confirmation). Chinese platform conventions and implicit rules (originality, watermarks, AI labelling, extreme words, maps, font and music licences, safe zones): `docs/video-craft/平台与合规.md`. Why and what changed: `docs/video-craft/复盘-2026-10-23.md`. The cinema look (`src/tutorial/cinema.tsx`) remains available as one possible world. Commands: `README.md`.
- Generated images (`npm run tutorial:images -- <id>`, `<Plate>`) are an aid when material is missing (user, 2026-10-23), never the backbone.
