# 素材包说明：huashu-motion（让编程 agent 一句话做产品发布片的 skill）

整理时间：2026-10-19（台北时间）。用法：整个文件夹放进 RenWenVideo 仓库 `inputs/huashu-motion-skill/`，让云端 Claude Code 读 `script.md`。主发抖音，目标 55–60 秒。

## 一、素材清单（materials/）

视频原声已全部去掉。上屏一律只标「案例展示」，不署开发者名字。预览图在 `materials/previews/`。

| 文件 | 画面内容 | 建议用途 | 规格/时长 |
|---|---|---|---|
| 01_hook_deepseek_fanmade_launch_film.mp4 | 粉丝自制的 DeepSeek V4.1 Flash 1017 发布片：搜索框「探索未至之境」、夜赛/测试室/故宫 3D 演示、跑分大数字、鲸鱼 logo；角落自带「Fan-made · 非 DeepSeek 官方」 | **开头钩子**、封面 | 1920×1080，38.0 s |
| 02_skill_intro_wall_and_typing_trigger.mp4 | skill 自己的发布片开头：一整面墙的样片 →「说一句，出一支片」→ 终端里敲 `/huashu-motion 给我的产品做一支发布片` | 第 2 段“是什么/怎么触发” | 1920×1080，8.0 s（原片 0–8 s） |
| 03_workflow_read_score_build_export.mp4 | 机械结构动画 + 「读产品 / 写谱 / 搭画面 / 导出」流程，含 `om render` | 第 3 段工作流程 | 1920×1080，16.0 s（原片 8–24 s） |
| 04_point_to_edit_press_C.mp4 | 编辑器里按 C、点画面、弹出评论框「第一帧开场的效果我觉得很差…」→ 发给 Agent → 只改那一处 | 第 4 段“指着画面改”（要放大评论框） | 1920×1080，14.0 s（原片 24–38 s） |
| 05_features_montage_no_endcard.mp4 | 「20种动画语言」「23种音效」「每一帧都能指着改」「评审 Claude Code·Codex·Cursor·Gemini CLI」「经验写回去」 | 第 5 段适合谁的背景 | 1920×1080，11.5 s（原片 38–49.5 s，**已剪掉片尾的 GitHub 网址卡**） |
| 06_three_directions_keyframes.jpg | 三个方向 A/B/C 的真渲染关键帧 + 色板卡 | 第 3 段“出三个方向” | 1950×1110 静图 |
| 07_selfcheck_keyframes.jpg | 自检时截的 9 张关键帧（带时间点），角落有「Fan-made · 非 DeepSeek 官方」 | 第 8 段收尾画面 / 备用 | 1816×1108 静图 |
| 08_deepseek_flash_22s_motion_demo.mp4 | 用 DeepSeek V4.1 Flash 做的 22 秒动效片：MOTION / MASK / GLITCH / 鲸鱼 logo / 柱状图 | 第 7 段结果（¥1.95 那支） | 1920×1080，22.3 s |
| 09_score_first_music_sync.mp4 | README 动图转的 MP4：ABC 乐谱变五线谱，场景标记落在哪一拍画面就在哪切 | 第 3 段“作曲”备用 | 720×406，9.2 s（分辨率低，只适合小窗） |

## 二、没下载/没用的素材及原因

| 原文素材 | 原因 |
|---|---|
| 文末二维码图（公众号/B站/小红书） | 纯推广，带开发者名字 |
| 文章封面图 | 有开发者本人的卡通形象 |
| 小猫补光灯 Pro 竖屏样片 | 开发者自己的付费 App，等于替它打广告 |
| Grok Bot 粉丝片（30 秒） | 品牌广告片，且是境外产品（X/Grok），抖音有风险 |
| huashu-design 宣传片 | 开发者自己的另一个产品 |
| skill 发布片最后约 4 秒（GitHub 网址 + 安装命令卡） | 带外链网址，已剪掉；安装命令让 Claude Code 自己做字卡 |
| README 里的 hero / point-to-edit / sixteen-cuts / deepseek-flash 动图 | 和上面 1080p 视频内容重复且分辨率低，不另放 |
| 文中引用的开发者另一条“实测 DeepSeek”帖子的文字 | 含“仅次于 Claude、GPT-6 没做出来”等比较说法，无法核实，不用 |

## 三、补充资料（给你看，不上屏）

- 原文给的三句触发示例：「用huashu-motion给我的产品做一支30秒的发布片，官网是xxx.com」「用huashu-motion把{数据图表/PPT}做成30秒的解说，讲清楚为什么我们的注册率翻倍了」「用huashu-motion做一支发布片，要口播，用我自己的录音：{视频/音频文件}」
- 克隆安装（方式三）：`git clone` 后软链到 `~/.claude/skills/huashu-motion`（Codex 用 `~/.codex/skills/`）。
- 真乐器音色可选：让 agent 跑 `om samples build`，下载约 55MB 免费采样（CC0/CC-BY）；缺什么跑 `om doctor`。
- Codex 的沙箱会拦本地预览和浏览器，遇到时手动批准。
- 它不会凭空生成真人和实拍，要真人用自己的素材；不调用视频生成模型，片子就是一个 `index.html`（GSAP/Canvas/Three.js/SVG）。
- 仓库里有 20 种运动语言、10 个起步模板、23 种音效、3 份示范谱。

## 四、内部来源（⚠️ 仅供你核对，禁止上屏、禁止出现在视频和文案里）

- 原帖（X 文章）：https://x.com/AlchainHust/status/2111811721471897618（2026-10-18 21:28 台北时间发布）
- 文中嵌入帖：DeepSeek 粉丝发布片 https://x.com/AlchainHust/status/2111396576123830528 ；DeepSeek 动效片 https://x.com/AlchainHust/status/2111416302149505270
- skill 仓库：https://github.com/alchaincyf/huashu-motion（README、LICENSE=MIT、skills/huashu-motion/SKILL.md；v0.1.0 发布于 2026-10-18 20:26 台北时间）
- skill 自己的 53 秒发布片（02–05 的来源）：X 媒体 2111810166442033152，也在仓库 Releases v0.1.0（huashu-motion-launch.mp4）
- `npx skills` 工具：https://github.com/vercel-labs/skills
- 媒体 ID：01=2111396018277212160，08=2111415982069518338，06=图片 2111809257641279488，07=图片 2111809556338642944，09=README docs/media/score-first.gif

## 五、需要你拍板/注意的

1. **skill 名字里带开发者的称呼**：「huashu」就是开发者网名「花叔」的拼音，安装命令里的 `alchaincyf` 是他的 GitHub 用户名（不是 X 账号）。教程没法不说工具名和安装命令，所以脚本里保留了这两个，但口播和画面都不说「花叔」、不出现 X 账号。如果你觉得这也算暴露身份，可以把安装命令改成只在置顶评论里写，画面只留「搜 huashu-motion」。
2. **安装命令算不算“外链”**：命令不是网址，脚本里当字卡放；没放 GitHub 网址。
3. 01 号钩子片是粉丝自制、非官方，片子角落自带「非 DeepSeek 官方」字样，建议保留。

## 六、未核实

- 「22 秒、不到半小时、1 块 9 毛 5、缓存命中率 99.4%」都是开发者自述，没人独立复现，视频里标了「据开发者自述」。
- 01 号发布片“很多人以为是官方的”是开发者说法，脚本没用这句。
- Windows/Linux 能不能跑没写：README 只说目前只在 macOS 实测过。
- GitHub 星数（抓取时 419 星、42 fork，仓库 10-18 才创建）变化快，脚本没写星数。

## 七、文件大小说明

为了整包能一次上传云端 Claude Code（单次附件上限 30 MB），2026-10-19 把全部视频重新压缩成 H.264 CRF 27，分辨率不变（1920×1080；09 号仍是 720×406），无音轨，faststart，文件名不变。原片移到包外的 `G:\剪辑\_大文件原片\huashu-motion-skill\materials\`，需要更高画质时再用。
