# vibe-opus-video-tutorial · 素材汇总（仅素材，不含脚本）
整理：小晚 · 2026-10-25（Asia/Taipei）· 互动数为 2026-10-25 16:25 前后通过 X API 读取的快照
> 上屏注意：画面/口播不要出现 X 账号 handle（handle 只在 sources.md 内部留档）；避免任何 翻墙/代理/中转 相关内容；第 9 条原帖含付费工具/费用信息，只引方法，勿做推广。

## A. Opus 5.5 发布事实（已核实）
- 2026-09-22 Anthropic 发布 Claude Opus 5.5（官方公告 + 平台文档 + Reuters + TechCrunch 四方一致，见 sources.md S1–S4）。
- 官方原话：“performs at the level of Claude Fable 5.1 on most work and costs 40% less to run than Opus 5.”
- 定价 $4 / $20 每百万 input/output token（比 Opus 5 低 20%）；上下文 1M token，最大输出 128K；模型 ID `claude-opus-5-5`。
- 2026-10-08 Claude 官方推出 Claude Motion（beta）：“Claude writes each one as code, with no video model involved … then export an MP4.”（仅 Team/Enterprise 计划）

## B. X 帖子原文（9 条，按方法具体程度排序）

### X1 · Vincent（mg-styles-15 作者）· 15 种风格总览原帖
- 链接：https://x.com/VincentWei93/status/2104957548797604116 · 2026-09-29 23:32（台北）
- 互动：赞 2441 / 转 232 / 引用 26 / 回复 64 / 收藏 3075 / 曝光 206,362
> 最近尝试了非常多 opus5.5 制作视频的不同风格，有些效果实在是惊艳
> 这个视频盘点了我尝试的风格中，达到商业制作水准的 15 种风格，整个视频、音乐、音效全程由 opus5.5 写代码制作而成
> 后续会分享每一种风格的提示词
> 这下视频制作的门槛是真的被打下来了
- 附视频：assets/video/x_vincent_15styles_1080.mp4（179 秒，已压缩至 26MB）

### X2 · Vincent · 开源提示词+源码
- 链接：https://x.com/VincentWei93/status/2105993562970337363 · 2026-10-02 20:09（台北）
- 互动：赞 210 / 转 23 / 回复 23 / 收藏 375 / 曝光 22,465
> 很多人想让我分享下面每种风格怎么做出来的，提示词是什么
> 所以我把每种风格的提示词，以及每个片段的源码都开源出来放到了 GitHub，交给你们的 agent 尽情研究吧
> 期待看到更多风格百花齐放
- 补充：2026-10-05 16:40 重发（https://x.com/VincentWei93/status/2107028148881899763，赞 221/转 21/收藏 399），说明此前 GitHub 账号被临时风控、已恢复。（该插曲不建议上屏）

### X3 · Claude 官方 · Claude Motion 发布（主帖+说明）
- 主帖：https://x.com/claudeai/status/2108271552991252810 · 2026-10-09 03:01（台北）· 赞 60,549 / 转 4,600 / 引用 2,610 / 回复 1,236 / 收藏 39,775 / 曝光 11,428,143
> Claude Dashboards and Claude Motion are in beta today.
> Ask Claude to turn your data into live dashboards and your ideas into animated explainers.
- 说明帖：https://x.com/claudeai/status/2108271558170976743 · 赞 2,168 / 转 84
> Claude Motion turns reports, charts, or product walkthroughs into short animations. Claude writes each one as code, with no video model involved, so you can change any word, number, or timing, then export an MP4.
> In beta on Team and Enterprise plans.

### X4 · Claude 官方 · Opus 5.5 发布当天作品串
- https://x.com/claudeai/status/2102471866635919731 · 2026-09-23 02:55（台北）· 赞 11,358 / 转 578 / 回复 316 / 收藏 3,416 / 曝光 1,393,819
> A thread of early explorations with Claude Opus 5.5:
> A short story about a watermelon created by @kevin_t_ngo.
- 附视频：assets/video/x_claude_opus55_watermelon_540.mp4（29 秒）

### X5 · 「8 种风格提示词」使用步骤（Mr. Claude 账号）
- 主帖：https://x.com/claudeskills101/status/2107170117243310471 · 2026-10-06 02:04（台北）· 赞 2,079 / 转 188 / 收藏 8,150 / 曝光 449,777
> Anyone can make an explainer video with Claude Opus 5.5 now. These 8 prompts cover 8 different styles.
> They range from kinetic text to Manim math animations.
> Each one runs in Claude Code, so you don't need any editing software.
- 方法帖：https://x.com/claudeskills101/status/2107170129377427701 · 赞 45 / 收藏 118
> Here's how to use them.
> 1. Open Claude Code in an empty folder.
> 2. Pick Opus 5.5 as the model.
> 3. Paste a prompt and fill in the parts in brackets.
> 4. Attach any files the prompt asks for.
> 5. Let Claude install the tools it needs, like Remotion or FFmpeg.
> Every prompt ends with a "Done means" line, so Claude knows when the video is finished.

### X6 · 讲解型动画完整参数（Opus 5.5 Max + Remotion + 配音）
- https://x.com/mablesjoseph/status/2105472483054735781 · 2026-10-01 09:38（台北）· 赞 25 / 转 2 / 收藏 9 / 曝光 2,306
> Opus 5.5 on Max Effort made this video in one-shot. This opens a world of possibilities for educators and content creators.
> I am shocked how correct and ridiculously good Opus 5.5 is at making explainer motion graphic videos.
> First of all shout out to @cammy_wammy whose amazing video and sharing led me down this path. …
> Result Stats: Model : Opus 5.5 / Effort : Max / Voice : Eleven Labs / Motion Graphics : Remotion / Opus 5.5 / Total time : 2.5 hrs to build / Render Time : 35 mins, 5 framers per sec
> Prompt : "Can you generate a motion graphics explainer in the visual style of this post and using all its content? I will leave the details up to you. I want you to show off what you can do so you have full creative freedom within those styling constraints. I want to give this to my engineers at my company. I want you to be proud of the final product. Utilize the elevenlabs and remotion tools at your disposal and let me know if you don't see them for some reason. Use whatever you want in those tools to make the most polished product that you would be proud of. Source Article : Context Tax - X article from the article"
> Tools : Claude Desktop / Connectors : ElevenLabs (available in Connector library - need an account) / Skill : Remotion (available in skills library)
- 附视频：assets/video/x_mablesjoseph_explainer_640.mp4（313 秒，仅作参考，需剪片段）

### X7 · 一句话提示词 15 秒片
- https://x.com/TheViableEdge/status/2104207707980869918 · 2026-09-27 21:53（台北）· 赞 10 / 回复 1 / 收藏 13 / 曝光 748
> Getting in on the Opus 5.5 motion graphics fun, truly impressive outcome for a fun one-shot experiment.
> It used remotion (I also have hyperframe installed), which I think i'll try next.
> Prompt: make a dynamic 15-second motion graphics video that shows what an incredible motion designer you are, and can be the hero asset for the course landing page.
- 附视频：assets/video/x_theviableedge_15s_640.mp4（15 秒）

### X8 · 耗时与花费实例
- https://x.com/shreyamin_/status/2108494133262532882 · 2026-10-09 17:45（台北）· 赞 1 / 曝光 97（互动很低，仅作数据点）
> I can't believe Claude Opus 5.5 Made this Motion Graphics Video @claudeai @ClaudeDevs
> - Claude Opus 5.5 (Extra)
> - $16.41
> - 32 M 55 S
> #claude #remotion

### X9 · Claude Code + Remotion 五步法
- https://x.com/TawohAwa/status/2111089503213703193 · 2026-10-16 21:38（台北）· 赞 3 / 回复 1 / 收藏 9 / 曝光 797
> How to use it:
> - Install @Remotion in Claude Code.
> - Select Claude Opus 5.5.
> - Paste your animation prompt.
> - Upload your photos, logos, or other assets.
> - Let Claude Code create your video.
> Best part: Turn on Remote Control and manage everything from your phone.

（未收录：大量「20 GitHub repos that turn Opus 5.5 into a motion empire」类搬运帖，例如赞 5,957 的一条，内容互相抄写、自称“Netflix/Anthropic 工程师发布”无法核实，不建议使用。）

## C. 网页文章摘录

### W1 · 人人都是产品经理《这些动画，都是 AI 写代码画出来的：我实测了 4 种风格》（作者 月鹿造物，2026-10-24）
https://www.woshipm.com/ai/6483631.html
- 「他用 Claude 的 Opus 5.5模型，一种风格写一段提示词，做出了 15 种风格的动画短片……这个项目 10 月 2 日才发出来，不到三周就有快 2000 个星。仓库名是 Vincentwei1021/mg-styles-15。」
- 提示词三块：①角色+标准（原文开头：“You are the director, motion designer, engineer and sound designer of ONE 10-second motion-design film. … A clean, template-looking result is a fail.”）②创意种子（选题、配色、画面）③风格招牌特征（“这一段决定了做出来像不像这种风格，不要删”）。
- 方法二：只改「创意种子」，招牌特征原样保留；开工前先让 AI 把配音稿和画面写成表格确认。
- 方法三：另一个 AI 只看成品，每半秒截一张图，按 7 项（风格、惊艳、动效、排版、质感、声音、技术）打分，低于 7.5 的项照意见改；“6 分大概是剪映模板的水平，8 分是广告公司的水平”。
- 作者实测分数：拼贴 5.4 → 6.1 → 7.0；回形针 6.0 → 6.6 → 6.86；等距 3D 6.43 → 6.86；综艺花字 6.0 → 6.36。
- 翻车案例：字卡说「用手掌打」配图却拿拍子；「1435—2026」写成 600 年（实为 591 年）；白字白描边糊死；字压字；回形针镜头太快像卡片硬切；等距塔尖被裁。
- 工具：配音用 Edge 免费朗读（Xiaoxiao 女声），图片去 Wikimedia 找可免费使用的老照片并记授权，音乐音效代码合成。
- 建议：「先挑 1 种风格，只做 10 秒，交给另一个 AI 挑毛病，改两轮，再考虑做长。」

### W2 · GitHub Vincentwei1021/mg-styles-15 README（MIT 许可）
https://github.com/Vincentwei1021/mg-styles-15
- 截至 2026-10-25 16:25（台北）：2,065 星 / 280 fork；仓库创建于 2026-10-02 17:43（台北）。
- “Fifteen styles, one 10-second film each, all made by Claude Opus 5.5 writing code.”
- “No image or video generation. The picture is code: SVG, Canvas, WebGL and Three.js, with Blender for the 3D film.” / “Each film's audio.py synthesises its music and sound effects; the 15 soundtracks draw on 103 recorded instrument samples.”
- 流程：每支片是一个网页 `window.renderAt(t)` → headless Chrome 逐帧截取 → audio.py 合成音频 → ffmpeg 合成精确 10 秒 MP4 → 第二个 AI 用 rubric.md 评审两轮。“Final scores from the AI jury run from 7.57 to 8.21 out of 10.”
- 注意：mg-styles-15 本身不是 Remotion，而是「网页 + headless Chrome + ffmpeg」的同类代码出片思路。
- 用法 5 步：在空文件夹打开 Claude Code（需 Node、Chrome、ffmpeg）→ 发送 prompts/ 中完整提示词 → 只改 Creative seed、保留 Signature features → 用 rubric.md 让第二个 AI 评审再改 → 用 template.md 写新风格。

### W3 · Remotion 官方文档《Prompting videos with coding agents》
https://www.remotion.dev/docs/ai/claude-code
- “Remotion works well with coding agents such as Claude Code, Codex, Kimi Code and OpenCode.”
- 步骤：`npx create-video --yes --blank my-video` → `cd my-video` → `npx remotion skills add` → `npm run dev` → 另开终端 `claude`，然后直接用提示词做视频。

### W4 · Anthropic 官方公告 Introducing Claude Opus 5.5（2026-09-22）
https://www.anthropic.com/claude-opus-5-5 —— 见 A 部分；另：“A different tester had several Claude models build a game from a single prompt; Opus 5.5 scored higher than any other model on the strength of its graphics and polish.”
