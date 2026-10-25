# sources.md · vibe-opus-video-tutorial
读取时间：2026-10-25 16:24–16:28（Asia/Taipei）。X 互动数为该时刻快照，发布后会变。X handle 仅内部留档，不上屏。

## 事实与数字来源
| # | 事实/数字 | 来源 |
|---|---|---|
| S1 | Opus 5.5 发布于 2026-09-22；“Fable 5.1 水平、比 Opus 5 便宜 40%”；$4/$20；比 Opus 5 低 20%；输出快 30%+ | Anthropic 官方公告 https://www.anthropic.com/claude-opus-5-5 |
| S2 | 模型 ID claude-opus-5-5；1M 上下文；128K 最大输出；发布日 2026-09-22 | https://platform.claude.com/docs/en/models/opus-5-5/overview |
| S3 | 第三方确认发布与定价 | Reuters 转载 https://www.investing.com/news/stock-market-news/anthropic-unveils-claude-opus-55-4911332 |
| S4 | 同上；Opus 5 发布于 7-24 | TechCrunch https://techcrunch.com/2026/09/22/anthropic-releases-opus-5-5-with-lower-prices-and-fable-level-performance/ |
| S5 | Claude Motion beta、纯代码无视频模型、导出 MP4、Team/Enterprise | X @claudeai https://x.com/claudeai/status/2108271552991252810 及 /2108271558170976743（2026-10-09 台北） |
| S6 | mg-styles-15：2,065 星/280 fork/创建 2026-10-02/MIT/15 支 10 秒片/103 个乐器采样/AI 评审 7.57–8.21 | GitHub API + README https://github.com/Vincentwei1021/mg-styles-15 |
| S7 | 「不到三周快 2000 星」、提示词三块、7 项打分、实测分数 5.4→7.0 等 | 人人都是产品经理 https://www.woshipm.com/ai/6483631.html（2026-10-24） |
| S8 | Remotion + 编码 agent 步骤与命令 | https://www.remotion.dev/docs/ai/claude-code |
| S9 | 「Vibe知识大赏」11.7 亿播放、5.1 万参与（今日线索中提及，本期未用） | https://www.21jingji.com/article/20261022/herald/fd33d9fcf3cef29800ddd927d2ad46ef.html （本次未重新打开核对） |

## X 帖子（内部留档，含 handle）
| 编号 | 作者 handle | 链接 | 日期（台北） |
|---|---|---|---|
| X1 | @VincentWei93 | https://x.com/VincentWei93/status/2104957548797604116 | 2026-09-29 |
| X2 | @VincentWei93 | https://x.com/VincentWei93/status/2105993562970337363 （重发 /2107028148881899763） | 2026-10-02 |
| X3 | @claudeai | https://x.com/claudeai/status/2108271552991252810 , /2108271558170976743 | 2026-10-09 |
| X4 | @claudeai | https://x.com/claudeai/status/2102471866635919731 | 2026-09-23 |
| X5 | @claudeskills101 | https://x.com/claudeskills101/status/2107170117243310471 , /2107170129377427701 | 2026-10-06 |
| X6 | @mablesjoseph | https://x.com/mablesjoseph/status/2105472483054735781 | 2026-10-01 |
| X7 | @TheViableEdge | https://x.com/TheViableEdge/status/2104207707980869918 | 2026-09-27 |
| X8 | @shreyamin_ | https://x.com/shreyamin_/status/2108494133262532882 | 2026-10-09 |
| X9 | @TawohAwa | https://x.com/TawohAwa/status/2111089503213703193 | 2026-10-16 |

## 素材清单（assets/）
授权口径：官方 = 官方发布方自己的素材；可引用 = 第三方作品/截图，评论引用、注明出处、不改变原意；MIT = 开源许可可再用（需署名并附许可）。本期没有 AI 生成素材。

### assets/img/
| 文件 | 内容 | 来源 | 授权 |
|---|---|---|---|
| shot_anthropic_opus55_announcement.png | Opus 5.5 官方公告页截图 | https://www.anthropic.com/claude-opus-5-5 | 官方（截图引用） |
| shot_anthropic_opus_page.png | Claude Opus 产品页，含 “Sep 22, 2026 Claude Opus 5.5” 公告条 | https://www.anthropic.com/claude/opus | 官方（截图引用） |
| shot_claude_code_page.png | Claude Code 产品页截图 | https://www.claude.com/product/claude-code | 官方（截图引用） |
| x_claude_motion_launch_still.png | Claude Motion 发布视频封面 | X3 主帖媒体 | 官方 |
| x_claude_motion_card.jpg | Claude Motion 说明配图 | X3 说明帖媒体 | 官方 |
| shot_remotion_home.png | Remotion 官网首页 | https://www.remotion.dev/ | 官方（截图引用） |
| shot_remotion_showcase.png | Remotion 作品展示页 | https://www.remotion.dev/showcase | 官方（截图引用） |
| shot_remotion_docs_claude_code.png | Remotion「用编码 agent 做视频」文档 | https://www.remotion.dev/docs/ai/claude-code | 官方（截图引用） |
| mg15_cover.webp | mg-styles-15 15 支片拼图封面（动图，5.7MB） | GitHub docs/readme/cover.webp | MIT（署名 Vincentwei1021） |
| mg15_flow_en.webp / mg15_flow_zh.webp | 提示词→网页→headless Chrome→audio.py→ffmpeg→AI 评审 流程图（中英） | GitHub docs/readme/ | MIT |
| mg15_showcase_en.jpg / mg15_showcase_zh.jpg | 作品展示页截图（片+说明+提示词） | GitHub docs/ | MIT |
| shot_mg15_site.png | 作品展示页实时截图 | https://vincentwei1021.github.io/mg-styles-15/ | MIT 项目页面（截图引用） |
| mg15_film_06-collage / 19-paperclip / 18-hanazi / 03-isometric / 22-hud / 10-synthwave .webp | 成片预览（与 woshipm 实测的拼贴/回形针/花字/等距对应 + HUD/Synthwave） | GitHub docs/readme/films/ | MIT |
| x_vincent_15styles_thumb.jpg | X1 视频封面 | X1 | 可引用 |
| x_vincent_repo_announce.jpg | X2 开源配图 | X2 | 可引用 |
| x_8prompts_card.jpg | 8 种风格提示词配图 | X5 | 可引用 |
| x_mablesjoseph_thumb.jpg | X6 讲解视频封面 | X6 | 可引用 |

### assets/video/（均 <30MB）
| 文件 | 时长/大小 | 来源 | 授权 |
|---|---|---|---|
| x_claude_motion_launch_640.mp4 | 82s / 2.9MB | X3 官方发布视频 | 官方 |
| x_claude_opus55_watermelon_540.mp4 | 29s / 1.7MB | X4 官方串首条（作品作者 kevin_t_ngo） | 官方转发（可引用，注明作品作者） |
| x_vincent_15styles_1080.mp4 | 179s / 26MB（原 69MB，已用 ffmpeg 重编码 ~1.2Mbps） | X1 | 可引用（同一作者仓库为 MIT） |
| mg15_01-flat-vector / 02-line-art / 08-morph / 09-bauhaus / 19-paperclip / 20-pixel .mp4 | 各 10s / 4–28MB | GitHub videos/ | MIT |
| x_mablesjoseph_explainer_640.mp4 | 313s / 8.2MB | X6 | 可引用（长，需剪） |
| x_theviableedge_15s_640.mp4 | 15s / 0.4MB | X7 | 可引用 |
未下载：mg-styles-15 其余 8 支（06 拼贴、18 花字、03 等距等）原文件 31–38MB 超 30MB 限制；需要可从 https://github.com/Vincentwei1021/mg-styles-15/tree/main/videos 取后压缩。
