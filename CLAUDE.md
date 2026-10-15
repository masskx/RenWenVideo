# RenWenVideo

Remotion project that turns articles and posts into 9:16 Douyin videos. Two pipelines: long-form explainers (`explainers/`, `src/ArticleExplainer.tsx`) and code-drawn tutorials (`tutorials/`, `src/tutorial/`). Finished packages go in `douyin/<id>/`. See `README.md` for commands.

## Video production rules (mandatory)

Every time you make, revise or re-render a video in this repo, follow the production rules adapted from [chuspeeism/dashi-animationstyle](https://github.com/chuspeeism/dashi-animationstyle):

- **Invoke the `video-craft` skill first** (`.claude/skills/video-craft/SKILL.md`) and follow its workflow in order: source → style → storyboard with per-shot change lists → A/B colours → build with `src/fx` → 3 stills → full render → QA gates → package.
- The knowledge base is `docs/video-craft/` (rules, motion, storyboard template, style dictionary, style-card template, concept drawing, known pitfalls). Read the relevant files instead of working from memory.
- A video is not done, and must not be committed, until `scripts/qa/richness.mjs`, `scripts/qa/marks.mjs`, `scripts/qa/scan.mjs` (sheets and `--phone`) and the format/loudness/size checks all pass.
- Write the storyboard to `tutorials/<id>.storyboard.md` or `explainers/<id>.storyboard.md` before scene code.
- When a new failure mode turns up, add it to `docs/video-craft/踩坑清单.md`.

## Environment notes

- Narration: Alibaba Cloud CosyVoice via `DASHSCOPE_API_KEY` (explainers always; tutorials with `"tts": {"provider": "dashscope"}`); illustrations: `gpt-image-2` at `OPENAI_BASE_URL`.
- In the cloud container set `REMOTION_BROWSER_EXECUTABLE=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell` for tutorial renders, and `TTS_CA_BUNDLE=/root/.ccr/ca-bundle.crt` for edge-tts.
- `npm run lint` (ESLint + tsc) must pass. Keep each `douyin/<id>/video.mp4` under 100 MB.
