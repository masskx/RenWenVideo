# RenWenVideo

Remotion project that turns articles and posts into 9:16 Douyin videos. Two pipelines: long-form explainers (`explainers/`, `src/ArticleExplainer.tsx`) and code-drawn tutorials (`tutorials/`, `src/tutorial/`). Finished packages go in `douyin/<id>/`. See `README.md` for commands.

## Video production rules (mandatory)

Every time you make, revise or re-render a video in this repo, follow the production rules adapted from [chuspeeism/dashi-animationstyle](https://github.com/chuspeeism/dashi-animationstyle):

- **Invoke the `video-craft` skill first** (`.claude/skills/video-craft/SKILL.md`) and follow its workflow in order: source → reference → director brief → storyboard (subject layers, force & contact frames, phase offsets, SFX per shot) → A/B colours → build with `src/fx` → 3 stills + frame-by-frame look → full render → QA gates → package.
- **Read `docs/video-craft/发布与风格偏好.md` first of all.** The user publishes on **WeChat Channels (微信视频号), not Douyin**: verify the current size and cover specs before choosing the canvas (reportedly 6:7, 1080×1260 — unverified), and make the cover for it. For tech topics (products, AI, cars, space) the paper look was judged to lack a technological feel — pick a tech-family style (blueprint, dark tech) instead.
- **Read `docs/video-craft/导演层.md` first.** It is the director layer adapted from guanmo_ai's article and twoclipping's prompt template: our past videos looked AI-made (synchronized pops, whole-stage push/pull, glow, card stacks, no physics, no sound design). Its ban list and acceptance criteria are mandatory and override older rules where they conflict.
- The knowledge base is `docs/video-craft/` (director layer, rules, motion, storyboard template, style dictionary, style-card template, concept drawing, known pitfalls). Read the relevant files instead of working from memory.
- A video is not done, and must not be committed, until `scripts/qa/brief.mjs`, `scripts/qa/richness.mjs`, `scripts/qa/marks.mjs`, `scripts/qa/scan.mjs` (sheets and `--phone`) and the format/loudness/size checks all pass.
- Write the storyboard to `tutorials/<id>.storyboard.md` or `explainers/<id>.storyboard.md` before scene code.
- When a new failure mode turns up, add it to `docs/video-craft/踩坑清单.md`.

## Environment notes

- Narration: Alibaba Cloud Model Studio TTS via `DASHSCOPE_API_KEY` (explainers always; tutorials with `"tts": {"provider": "dashscope", ...}`). **Read `docs/video-craft/配音.md` before voicing**: synthesize each scene in one request (`"segment": "scene"`, the default — never the old phrase-by-phrase splicing, which made the voice choppy), use a high-quality model/voice (Qwen-Audio 3.1 or better; cost is not a concern), fix readings with `[显示|朗读]`. Needs `pip install dashscope`. Illustrations: `gpt-image-2` at `OPENAI_BASE_URL`.
- In the cloud container set `REMOTION_BROWSER_EXECUTABLE=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell` for tutorial renders, and `TTS_CA_BUNDLE=/root/.ccr/ca-bundle.crt` for edge-tts.
- `npm run lint` (ESLint + tsc) must pass. Keep each `douyin/<id>/video.mp4` under 100 MB.
