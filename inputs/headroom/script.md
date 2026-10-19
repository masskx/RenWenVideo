# Headroom: tool-intro short. Script for cloud Claude Code (RenWenVideo)

> Script from the planning agent ("growth"), 2026-10-19 (Asia/Taipei).
> Put this file in the repo at `inputs/headroom/script.md` and follow `CLAUDE.md` plus `docs/video-craft/quick-reference.md`.
> Instructions are in English. **Narration (口播) and on-screen text (屏幕字) are Chinese and verbatim; do not edit them.**
> The only exceptions: you may add `{a}` cue marks and `[显示|朗读]` pronunciation fixes without changing the visible words.

## 0. Job summary

- **id:** `headroom`. **Type:** TOOL INTRO (工具介绍).
- **Length:** about 48–55 s, hard cap 60 s. **Canvas:** 1080×1920 full-screen 9:16, 30 fps.
- **Look:** blueprint / dark tech. The baseline is `tutorials/deepseek-vs-opus55` (scene file, storyboard, json):
  - deep blueprint background with a fine grid;
  - small monospace labels plus big 黑体 headline text;
  - A = amber, B = cyan;
  - one big subject per screen;
  - external footage embedded as-is, with attribution.
  - Not paper style.
- **Voice:** only the user's Volcengine/豆包 cloned voice (`"tts": {"provider": "doubao"}`). No silent fallback. If Doubao fails, stop and ask; edge-tts is allowed only with the user's OK.
- **Music:** from frame 0, ducked under the voice (copy deepseek-identity: `musicVolume` about 0.14, `musicDuckDb` 10).
- **Ending:** no next-episode teaser. No 公众号 / WeChat official account mention. No URLs, QR codes or "link in bio" anywhere in the video.
- **First person:** the user has NOT installed or tested Headroom. This is an introduction based on the official README, docs and demo.
  - Never say or show 「我试了」「我实测」, and no first-person usage claims.
  - Every number on screen is labelled 「官方数据」 or 「官方演示」.

### What the video must do (priority order, as in CLAUDE.md)

1. **Hook** > 2. **Retention** > 3. **Phone readability** > 4. **Fidelity** > 5. **Polish**.

You may adapt pacing, scene splits, durations and visuals to the material you actually capture. That includes merging or splitting scenes, swapping a mock for a real screenshot, or reordering the two use-case beats. Two things are fixed:
- the narration words;
- the facts, which must match §2.

If something here conflicts with the repo's priority order, the priority order wins. Tell the user what you changed.

## 1. Why this structure (read before planning)

The core of a tool-intro is **the viewer's use case**, not the feature list. The video answers four questions in this order:

| Viewer question | Where it is answered | Scene |
|---|---|---|
| "Why should I care?" (proof it works) | Hook: a 10,144-token log shrinks to 1,260 and the error line survives | S1 (0–4 s) |
| "Is this my problem?" (pain) | Claude Code / Codex reading logs, search results and JSON burns tokens | S2 |
| "What is it, how hard is it?" | Compresses on your machine before the model sees it; one command, no code changes | S3, S4 |
| "Will it help *me*?" (who should use, who shouldn't) | Honest range: 57% on incident debugging, only 21% on code search; good for long agent runs, useless for chit-chat | S5, S6 |
| "Is it safe?" | Originals stay on your machine and can be pulled back | S7 |
| "So?" | One-line verdict for the target user | S8 |

The use cases are in **S2** (who: people running coding agents), **S4** (how: one command), **S5–S6** (where it pays off and where it doesn't) and **S7** (the objection).

Feature names (CCR, SmartCrusher, MCP server, cross-agent memory, `headroom learn`) are deliberately **not** narrated. At most, show them as small monospace labels.

### Hook: chosen + 2 alternatives

| | Hook (narration / big on-screen text) | Why |
|---|---|---|
| **Chosen** | 「一万多 token 的报错日志，压到一千二，关键那行报错还在。」 + giant counter 「10,144 → 1,260」 | It is proof first: a concrete number collapsing on screen is the "new thing" eyes lock onto. 「关键那行报错还在」 removes the first objection ("compression loses stuff") in the same breath. It is backed by real footage, the official demo GIF, so frame 0 is not empty. |
| Alt B (pain) | 「Claude Code 额度老是不够用？」 | Very relatable and searchable. But the visual is weaker (no proof), and it promises a fix before showing one. Use it if S1 footage can't be captured cleanly. |
| Alt C (authority) | 「GitHub 七万五千多星的省 token 工具。」 | Social proof works for AI-news viewers. But stars don't say what it does for *you*, so it is weaker on retention. Better as a cover tag or S3 detail. |

**Frame 0 rule:** frame 0 already shows the counter at 「10,144」 over the demo footage, plus the label 「官方演示」.
- No iris or fade-in from empty. Disable the iris on the first scene.
- The first narration syllable starts within 0.5 s.
- The counter starts rolling down on the word 「压到」 (`{a}`) and lands on 「1,260」 by about 2.5 s. A small stamp 「报错还在 ✓」 pops on 「还在」.

## 2. Fact sources (verified 2026-10-19, Asia/Taipei). Use only these

| Fact | Source |
|---|---|
| Headroom = open-source tool that compresses what an AI agent reads (tool outputs, logs, RAG chunks, files, history) before it reaches the LLM. "Same answers, fraction of the tokens" is the project's claim. | README: https://github.com/headroomlabs-ai/headroom |
| Compression runs on your machine; README: "no prompt or file content is sent anywhere to be compressed". An anonymous telemetry beacon (counters only, no prompts or code) is **on by default** and can be turned off with `HEADROOM_TELEMETRY=off`. So do NOT say 「完全不联网」. | README §Telemetry |
| Demo: 10,144 → 1,260 tokens, "the same FATAL found" | README demo GIF `HeadroomDemo-Fast.gif` |
| Official benchmark (4 scenarios, seeded/offline): code search 17,199→13,597 (**21%**); SRE incident debugging 55,957→24,340 (**57%**); codebase exploration 58,801→33,895 (**42%**); GitHub issue triage 46,067→32,429 (**30%**) | README §Proof |
| Savings scale with repetitiveness. Short chats, prose and already-dense payloads see little or no reduction. | README §When to use · when to skip |
| Accuracy (official): GSM8K 0.870 → 0.870 (N=100); the README itself says the small TruthfulQA delta is noise | README §Proof |
| One command for coding agents: `headroom wrap claude` (also codex, copilot, aider, grok, …; Cursor needs manual setup). Proxy mode needs zero code changes. Undo: `headroom unwrap <tool>`. | README §What it does, §Agent compatibility |
| Install: `uv tool install --python 3.13 "headroom-ai[all]"` or `pip install "headroom-ai[all]"` (Python 3.10+). The PyPI package is `headroom-ai`; the package named `headroom` is a different project. | README §Install; https://docs.headroomlabs.ai/docs/installation |
| Reversible: originals cached locally, the model retrieves them on demand (CCR) | README §What it does |
| License Apache-2.0; open source is free. A paid **Headroom Enterprise** for teams also exists. | README §Headroom for teams |
| GitHub stars 75,903 · forks 5,900 (GitHub API, 2026-10-19 08:45 Taipei). Repo created 2026-01-07. | https://api.github.com/repos/headroomlabs-ai/headroom |
| Latest release v0.41.0, published 2026-10-15 06:46 Taipei (PyPI `headroom-ai` 0.41.0) | https://github.com/headroomlabs-ai/headroom/releases |
| Docs | https://docs.headroomlabs.ai/docs |

Name clash: other projects are also called "Headroom" (e.g. the PyPI package `headroom`, unrelated plugins). This video is **only** about `headroomlabs-ai/headroom`.

## 3. Material to capture (Claude Code captures all of it; the user doesn't need to drop anything)

Save everything under `inputs/headroom/`. Every external visual is muted, with a bottom-right label 「@headroomlabs-ai｜案例展示」 (or 「官方演示」 / 「官方数据」 where noted). Put the author link in the package README.

| File | How to get it | Used in |
|---|---|---|
| `demo.gif` → `demo.mp4` | `curl -L https://raw.githubusercontent.com/headroomlabs-ai/headroom/main/HeadroomDemo-Fast.gif`, then ffmpeg to mp4 (no audio track). About 4.6 MB. | S1 (main), S7 (brief reprise) |
| `hero.png` | Render `https://raw.githubusercontent.com/headroomlabs-ai/headroom/main/.github/assets/hero.svg` to PNG (resvg / headless Chromium). It shows 55,957 → 24,340 with the FATAL line surviving. | S5 accent |
| `repo-header.png` | Headless Chromium screenshot of https://github.com/headroomlabs-ai/headroom (top of page: repo name, description, star count), cropped and readable at phone width. Use a desktop viewport ≥ 1280 px, then crop and scale so the text is ≥ 40 px. | S3 |
| `readme-getstarted.png` | Screenshot of the README "Get started (60 seconds)" code block | S4 (or rebuild it as a code card with the exact same commands; never invent output) |
| `readme-agents.png` | Screenshot of the README "Agent compatibility" table | S4 strip |
| `readme-proof.png` | Screenshot of the README "Proof" table | S5 (redraw as bars; keep the screenshot as a corner inset for credibility) |

Optional. Skip it if it isn't there; don't block on it:
- `inputs/headroom/user-*.mp4`. Only if the user later drops in his own screen recording. Then add 「本人录屏」 and nothing else changes.

Do NOT fake a terminal session with savings output or a dashboard with numbers. Command text copied from the README is fine as a code card.

## 4. Storyboard (narration verbatim, do not edit)

Paces: S1 brisk · S2 brisk · S3 normal · S4 brisk · S5 normal · S6 normal · S7 calm · S8 slow. Times are estimates; let the Doubao timestamps decide.

| # / time | Narration 口播 (verbatim, do not edit) | On-screen text 屏幕字 (verbatim, do not edit) | Visual direction |
|---|---|---|---|
| **S1 hook** 0–4.5 s | 一万多 token 的报错日志，压到一千二，关键那行报错还在。 | Big: 「10,144 → 1,260」 (≥ 140 px, number in A amber) · stamp 「报错还在 ✓」 (B cyan) · small 「官方演示」 | Frame 0: demo.mp4 fills the upper ~60%, the counter is already on screen. The counter rolls down on 「压到」. The FATAL line in the footage gets a cyan highlight box on 「还在」. |
| **S2 pain** 4.5–10.5 s | 用 Claude Code 干活，AI 每读一次日志、搜索结果、一大坨 JSON，都在烧你的 token。 | 「日志」「搜索结果」「JSON」 (three chips, ≥ 64 px) · 「= 烧 token」 | Three chips fly into a "model" box one after another, on each noun. A token meter ticks up in amber. No real price numbers. |
| **S3 what** 10.5–17 s | Headroom 就干一件事：在发给模型之前，先在你电脑上把它们压一遍。开源，七万五千多星。 | Title 「Headroom」 · flow 「你的 AI 工具 → 本机压缩 → 模型」 · 「开源 · GitHub 7.5 万+ ⭐」 | Blueprint pipeline: the chips from S2 pass through a box labelled 「本机压缩」 and come out thinner. On 「开源」, repo-header.png slides in (credit 「@headroomlabs-ai｜案例展示」). |
| **S4 how** 17–23.5 s | 用起来很省事：装好以后一条命令，headroom wrap claude，不用改代码。Codex、Copilot 也能接。 | Code card 「headroom wrap claude」 (monospace, ≥ 56 px) · 「不用改代码」 · logos-free text strip 「Claude Code · Codex · Copilot · Aider …」 | The code card types itself in. Then a strip of agent names scrolls (from the README table; plain text, no fake logos). Optional corner: readme-agents.png. |
| **S5 range** 23.5–31.5 s | 省多少看内容。官方测了四个场景：排查线上故障，省了百分之五十七；搜代码只省百分之二十一。 | Bars: 「排查故障 57%」「代码库探索 42%」「Issue 整理 30%」「搜代码 21%」 · small 「官方数据 · 4 个场景」 · small 「55,957 → 24,340」 next to the 57% bar | Four horizontal bars grow in turn. 57% (A amber) flashes on 「五十七」, 21% (B cyan) on 「二十一」. Inset: readme-proof.png, or hero.png in a corner. |
| **S6 who** 31.5–38 s | 所以它最适合跑长任务、工具输出多的人。只是聊聊天、写写文章，基本省不下来。 | Left ✅ 「长任务 · 工具输出多」 / right ✖ 「聊天 · 写文章」 | Split screen with A/B colours. This is the "is it for me" beat; make both sides huge (≥ 72 px). |
| **S7 objection** 38–44 s | 怕压掉重要信息？原文存在你本地，模型需要的时候能取回来。 | 「原文留在本机」 · 「需要时取回」 · small 「官方测数学题：准确率 0.870 → 0.870」 | A thin compressed block. A dashed arrow pulls the full original back out of a local "vault" box. The GSM8K line stays small and labelled 「官方数据」. |
| **S8 verdict** 44–48 s | 天天让 AI 跑代码、看日志，这个值得装上。 | Big: 「天天跑 AI 写代码？」 (≥ 120 px) + 「Headroom · 开源」 | Clean end card. Hold 1 s after the voice ends. No teaser, no links, no 公众号. |

Pronunciation (listen once; fix only with `[显示|朗读]`, keeping the displayed text):
- 「headroom wrap claude」, 「Headroom」, 「Codex」, 「Copilot」, 「JSON」 [JSON|杰森]: fix only if misread.
- 「token」: leave as is.

## 5. Compliance (no exaggerated claims)

- Never say 「省一半」「省 90%」 or 「所有场景都省」. The range is 21%–57% on the official four scenarios. The 90%+ figure is only for highly repetitive JSON/log micro-benchmarks, so don't use it in narration.
- Label all numbers 「官方数据」 / 「官方演示」. They are the project's own benchmarks, not independent tests.
- 「答案不变」 is the project's claim. If shown at all, write 「官方称」 before it. The narration avoids it on purpose.
- Don't say 「完全不联网」「数据零外传」: anonymous telemetry is on by default. 「在你电脑上压」 is accurate.
- 「开源」 is fine. Don't say 「完全免费」 as a blanket claim, because there is a paid Enterprise tier.
- Not 「神器」「封神」「颠覆」. No fake logos, fake dashboards, fake terminal output, or real people's faces.
- Text ≥ 40 px everywhere it carries information; hook and verdict ≥ 120 px; subtitles ≥ 60 px. Keep the right-side button column and the bottom caption zone free of key text.

## 6. Cover

Template: 数字型 (numeric), single anchor = the giant number.

| Ratio | Headline | Anchor | Support | Tag (top-left, small) |
|---|---|---|---|---|
| **6:7** (1080×1260) | 「AI 读日志」/「少烧 token」 (last line amber) | 「10144→1260」 (30–40% height) | (optional, may drop) 「报错还在」 | 「HEADROOM · 开源」 |
| **3:4** (1080×1440) | 「AI 读日志」/「少烧 token」 | 「10144→1260」 | 「关键报错还在 · 官方演示」 | 「HEADROOM · 开源」 |

Alternative cover (if the number reads poorly at 80 px): headline 「给 Claude Code」/「省 token」 + anchor code card 「headroom wrap claude」.

Lay out each ratio separately (`coverCard.layouts`) and run `node scripts/qa/cover.mjs headroom`.

## 7. Release package (`douyin/headroom/README.md`)

- **视频号:**
  - 标题：「AI 编程太费 token？这个开源工具先帮你压一遍」
  - 描述：「用 Claude Code、Codex 跑长任务，日志和搜索结果最烧 token。Headroom 在发给模型前先在本机压缩，官方 4 个场景省 21%–57%。适合跑长任务的人，纯聊天基本省不了。」
  - #AI工具 #ClaudeCode #AI编程 #开源 #token
- **抖音:**
  - 标题：「一万多 token 的日志压到一千二，报错还在」
  - 描述：「Headroom：开源，一条命令接上 Claude Code，不用改代码。省多少看内容，官方数据 21%–57%。」
  - #AI工具 #ClaudeCode #程序员 #AI编程 #开源项目
- **小红书:**
  - 标题：「Claude Code 省 token｜开源工具 Headroom 怎么用」
  - 正文：
    - 「① 它做什么：AI 读日志、搜索结果、JSON 之前，先在你电脑上压一遍
    - ② 怎么用：装好后 headroom wrap claude，一条命令
    - ③ 省多少：官方 4 个场景 21%–57%，排查故障最多
    - ④ 谁别用：只聊天、写文章的基本省不下来」
  - #ClaudeCode #AI工具推荐 #AI编程 #开源工具 #省token
- **Credits (README only, never in the video):**
  - Headroom by headroomlabs-ai, https://github.com/headroomlabs-ai/headroom (Apache-2.0)
  - demo GIF and hero image from the README
  - docs: https://docs.headroomlabs.ai/docs

## 8. Workflow reminder

1. Plan.
2. Print the plan (hook, scenes, durations, total) and wait for the user's OK.
3. `npm run tutorial:voice -- headroom`
4. `npm run tutorial:render -- headroom --overwrite`
5. QA: `brief.mjs`, `cover.mjs`, `richness.mjs`, `marks.mjs`, `scan.mjs --phone`, `npm run lint`. Look at 3 stills yourself, frame 0 included.
6. Package `douyin/headroom/`.
7. Report back:
   - duration and spec;
   - QA results;
   - anything you changed from this script and why.

Don't modify or delete existing videos or rule files.

Note: `CLAUDE.md` / `quick-reference.md` link to `docs/video-craft/hooks.md`, but that file is not in the repo tree (checked 2026-10-19). The hook is already chosen here, so you don't need it.
