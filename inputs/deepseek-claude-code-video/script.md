# Episode: deepseek-claude-code-video — 「DeepSeek 接入 Claude Code，一句话做出动画视频」

**Target length: ~120 s. This episode explicitly OVERRIDES the default ≤60 s rule (requested 2-minute tutorial).**

## Global spec (for Claude Code)
- 1080×1920, 30 fps, 9:16, dark tech style; follow reference episode `deepseek-vs-opus55` (palette, title bar, subtitle style, transitions).
- All on-screen text ≥ 40 px (code cards are pre-rendered at 40 px on 1080 width — place them at 100 % width, never downscale below 1080 px wide).
- Voice: user's Volcengine / 豆包 **cloned voice** only. Narration Chinese, verbatim below. Burn-in Chinese subtitles = narration.
- External footage (`footage/case*.mp4`): **muted**, top-left label 「案例展示」 for its whole duration. No creator names/handles/avatars anywhere.
- Never show a real API key; cards already use `sk-xxxx`.
- No next-episode teaser, no 公众号, no links/URLs spoken or as CTA (the install/base URLs inside code cards are instructional content, keep them).
- Hook at frame 0 — no logo intro, no silence.

## Storyboard (times are targets; adjust to TTS length, keep total 115–125 s)

| # | Time | Visual (English instructions) | Narration (Chinese, verbatim) | On-screen text (Chinese, verbatim) |
|---|---|---|---|---|
| 1 | 0–6 s | Frame 0: `footage/caseA_cc_deepseek_intro_60s.mp4` **in 6.0 → out 12.0 s** (the "289,000 / 1,000,000" number shots), 1.0×, scaled to fit width, centered on dark bg, slow 1.00→1.06 zoom. Big title above. Label 「案例展示」. | 这条动画，是 Claude Code 接上 DeepSeek 做的，一分钱 Claude 会员都没花。 | DeepSeek + Claude Code<br>一句话出动画 |
| 2 | 6–14 s | Split screen top/bottom: top = caseB **in 4.0 → out 10.0 s** (许愿式编程 title); bottom = caseC **in 0 → out 6.0 s**, center-crop to 1080×860 each. Then bold stamp. | DeepSeek V4.1 刚更新，网上一堆人在用它做动画视频。今天两分钟，手把手教你把这套流程搭起来。 | 4 步搭好<br>安装 → 配置 → 验证 → 出片 |
| 3 | 14–28 s | `assets/01_install.png` slides up; highlight PowerShell line, then mac line, then `claude --version` result (green). | 第一步，装 Claude Code。Windows 打开 PowerShell，粘贴这一行；苹果和 Linux 用终端粘贴下面这行。装完输入 claude 杠杠 version，能看到版本号就成功了。 | 第一步：安装 |
| 4 | 28–34 s | Mock DeepSeek platform card (build in Remotion: dark card, text "API Keys → 创建 API Key", key shown as `sk-xxxx••••`). | 第二步，去 DeepSeek 开放平台，充几块钱，创建一个 API Key，复制下来。 | 第二步：拿 API Key<br>别把 Key 发给任何人 |
| 5 | 34–56 s | `assets/02_env_ps.png` full width. Highlight rows sequentially in sync: BASE_URL (yellow box) → AUTH_TOKEN → the 4 MODEL lines (bracket them together) → EFFORT_LEVEL. Then cut to `assets/03_env_mac.png` full width for ~3 s on the "export" line (no PiP — would drop below 40 px). | 第三步，最关键：设置环境变量。地址填 DeepSeek 的 Anthropic 兼容接口；Token 填你刚才的 Key；下面四个模型全部换成 deepseek-flash，后面的方括号 1m 代表开一百万上下文；最后把思考强度拉到 max。苹果用户把前缀换成 export 就行。 | 第三步：配置环境变量<br>BASE_URL / TOKEN / MODEL |
| 6 | 56–66 s | `assets/04_verify.png`; type-on animation for `claude` and the question, then green answer line pops. Small corner note 「界面示意」. | 进到一个空文件夹，输入 claude 启动，先问一句：你现在用的是什么模型？回答里出现 deepseek-flash，就说明接通了。 | 第四步：验证接通 |
| 7 | 66–82 s | `assets/05_prompt.png`, typewriter effect on the prompt text (~10 s), keyword highlight on 「Remotion」「1080×1920」「5 个镜头」「48px」. | 接下来就是做视频。直接跟它说：用 Remotion 新建项目，做一条三十秒竖屏科普动画，写清主题、风格、镜头数和字号。说得越具体，出来的东西越像样。 | 一句话需求<br>主题 · 风格 · 镜头数 · 字号 |
| 8 | 82–96 s | Left→right wipe to caseA **in 24.0 → out 38.0 s** played at **1.0×** (多模态 + 把想法交给它 screens), full width, label 「案例展示」; overlay lower-third 「Claude Code + DeepSeek V4.1 Flash 成片」. | 它会自己装依赖、写代码、调动画。这是别人用同样流程做出来的成片，镜头、转场、数字动画都是自动生成的。 | 案例展示：全自动生成 |
| 9 | 96–106 s | `assets/06_render.png`; highlight `npx remotion studio`, then the feedback lines, then `npx remotion render` + green mp4 line. | 先用 remotion studio 在浏览器里预览，哪里不满意直接用中文说，比如“第三个镜头太挤，拆两行”。满意了再 render，导出 mp4。 | 预览 → 改 → 导出 |
| 10 | 106–114 s | `assets/07_cost.png`; pulse the green line 「晚上、周末做视频 = 半价」. Background: caseC **in 18.0 → out 26.0 s** at 30 % opacity, blurred 12 px. | 成本也说清楚：输出一百万 token 高峰八块、空闲四块，工作日白天之外都是半价，做一条视频通常几块钱。 | 一条视频 ≈ 几块钱 |
| 11 | 114–120 s | Quick 3-shot montage (2 s each, 1.0×, muted, label 「案例展示」): caseB **40.0→42.0**, caseA **48.0→50.0**, caseC **44.0→46.0**. End on a hold frame with the 4-step checklist. | 安装、配置、验证、出片，四步搞定。效果比 Opus 还差一点，但胜在便宜，先收藏，今晚就能跑起来。 | ✅ 安装 ✅ 配置 ✅ 验证 ✅ 出片 |

Notes for long clips: caseA (60 s), caseB (48 s), caseC (64 s) — use only the in/out windows above; never play any clip longer than 14 s; never let the clip's own embedded text sit under our subtitles (move subtitles to the top band when a clip is on screen).

## Fact sources (verified 2026-10-20 from official docs)
- DeepSeek Anthropic-compatible base URL `https://api.deepseek.com/anthropic`; Claude Code env vars exactly as in `assets/02_env_ps.png` (DeepSeek "Integrate with AI Tools" guide).
- Model `deepseek-flash` is now served by DeepSeek-V4.1-Flash-1017; 1M context; `deepseek-v4-pro` also available. `claude-opus*` names map to v4-pro, other `claude*` to flash.
- CNY pricing per 1M tokens (deepseek-flash): input cache hit 0.02 / 0.04, cache miss 1 / 2, output 4 / 8 (off-peak / peak). Peak = Beijing time Mon–Fri 9:00–12:00 & 14:00–18:00; everything else off-peak (half price).
- Claude Code install: PowerShell `irm https://claude.ai/install.ps1 | iex`; mac/Linux `curl -fsSL https://claude.ai/install.sh | bash`; verify `claude --version` (Anthropic docs). npm `npm install -g @anthropic-ai/claude-code` also valid (DeepSeek guide).
- Claim "比 Opus 差一点" reflects multiple creators' own tests; keep it as opinion, not a benchmark.

## Compliance
- No real X usernames/handles/avatars. caseC was cropped to remove the creator's burned-in subtitles. caseA/caseB contain no personal identity (DeepSeek-branded fan-made animations only).
- Verify card (#6) and platform card (#4) are mock-ups — mark 「界面示意」.
- Footage is non-promotional; no third-party API reseller / discount content used.
