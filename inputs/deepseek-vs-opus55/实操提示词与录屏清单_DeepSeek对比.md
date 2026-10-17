# 实操提示词与录屏清单｜DeepSeek 1017 vs Opus 5.5 同题对比

供你拍第 07 段“我自己跑了一遍”使用，同时附一份交给云端 Claude Code 剪辑智能体的成片指令。本轮没有替你跑任何模型、没有产生任何 API 费用，也没有生成对比成片。

## 公平对比的五条规矩（先读）

1. **同一个工具**：两边都在 Claude Code 里跑，只换模型，不换工具、不换项目模板。
2. **同一句提示词**：一字不改，见“提示词 1”。不给任何一边追加提示。
3. **同一档推理**：Opus 5.5 用 max（或你账号可选的最高档）；DeepSeek 用 `CLAUDE_CODE_EFFORT_LEVEL=max`。
4. **只用第一次结果**：不挑好的那次。若某一边报错需人工介入，记录次数，并在视频里说出来。
5. **记录三样数字**：开始到 MP4 落地的实际耗时、token 用量、账单金额（从官方控制台截图）。只跑一次时，视频里说“我只测了一次”。

## 拍摄前准备

1. 建两个干净目录，分别给两边用，避免互相读到对方产物：

```powershell
npx create-video --yes --blank showreel-opus
npx create-video --yes --blank showreel-deepseek
cd showreel-opus; npx remotion skills add; cd ..
cd showreel-deepseek; npx remotion skills add; cd ..
```

2. **Opus 5.5 这一侧**：在 `showreel-opus` 里运行 `claude`，`/model` 选 Opus 5.5，录下确认画面。账号是否可用 Opus 5.5、按订阅额度还是 API 计费，以你的账号实际为准（待核实）；按订阅额度跑时没有直接金额，视频里说明“用的是订阅额度”，金额引用官方单价估算或作者数据。
3. **DeepSeek 这一侧**：在**新开的** PowerShell 窗口里设置环境变量（只对这个窗口生效，不影响你平时的 Claude 登录），再进 `showreel-deepseek` 运行 `claude`。以下来自 [DeepSeek 官方接入文档](https://api-docs.deepseek.com/guides/coding_agents)：

```powershell
$env:ANTHROPIC_BASE_URL="https://api.deepseek.com/anthropic"
$env:ANTHROPIC_AUTH_TOKEN="<你的 DeepSeek API Key>"
$env:ANTHROPIC_MODEL="deepseek-flash[1m]"
$env:ANTHROPIC_DEFAULT_OPUS_MODEL="deepseek-flash[1m]"
$env:ANTHROPIC_DEFAULT_SONNET_MODEL="deepseek-flash[1m]"
$env:ANTHROPIC_DEFAULT_HAIKU_MODEL="deepseek-flash"
$env:CLAUDE_CODE_SUBAGENT_MODEL="deepseek-flash"
$env:CLAUDE_CODE_EFFORT_LEVEL="max"
cd showreel-deepseek
claude
```

   - **一定要设 `ANTHROPIC_MODEL=deepseek-flash`**。DeepSeek 的兼容层会把 `claude-opus*` 开头的模型名映射到 `deepseek-v4-pro`（更贵、不是今天的新模型），只有 `deepseek-flash` 才是 V4.1-Flash-1017。依据：[DeepSeek Anthropic API 说明](https://api-docs.deepseek.com/guides/anthropic_api)。
   - 录屏时 Key 不入镜：先设好变量、清屏，再开始录。
   - 今天是周六，DeepSeek 全天按非高峰价计费；工作日北京时间 09:00—12:00、14:00—18:00 为高峰（双倍价）。想拍“最便宜”就避开高峰，想拍“公平”就两边都在同一时段跑并说明。
4. DeepSeek 控制台余额先截一张图，跑完再截一张，差额就是本次花费。Opus 走 API 时同样处理。

## 提示词 1｜同题 showreel（与素材 A、F 同一句）

两边都发这一句。英文原版来自素材 A 作者 @stephanlivera 的原帖；F 作者用的是它的中文译版。为与 A 可比，建议用英文原版：

```text
make a dynamic 15-second motion graphics video that shows what an incredible motion designer you are, like it's your showreel for a résumé. go all out.
```

拍到：发送提示词 → 开始计时 → 过程加速（标“过程加速”）→ MP4 落地 → 记录卡。等待可加速，不能把加速后的时长说成实际耗时。

补充一句交付约束（两边都加，或都不加；建议都加，便于后面拼接）：

```text
Render the final video to out/showreel.mp4 at 1920x1080, 60fps. Tell me the exact output path and duration when done.
```

## 记录表（拍完填，填进口播第 07 段）

| 项目 | Opus 5.5 | DeepSeek V4.1 Flash 1017 |
| --- | --- | --- |
| 开始时间（台北时间） | 待实测 | 待实测 |
| MP4 落地时间 | 待实测 | 待实测 |
| 实际耗时 | 待实测 | 待实测 |
| token 用量 | 待实测 | 待实测 |
| 花费（控制台差额） | 待实测 | 待实测 |
| 人工介入次数 | 待实测 | 待实测 |
| 明显错误（穿帮、文字溢出、黑帧、音画） | 待实测 | 待实测 |
| 计费时段（高峰／非高峰／订阅额度） | 待实测 | 待实测 |

## 提示词 2｜交给云端 Claude Code 剪辑智能体：拼出对比成片

把整个素材包上传后发这一段（沿用 RenWenVideo 项目的 CLAUDE.md 与 video-craft 技能约定）：

```text
请按项目 CLAUDE.md 和 video-craft 技能的约定，用 Remotion 制作一条 9:16 竖屏对比视频，口播脚本见“口播脚本_DeepSeek对比.md”，素材与作者信息见“素材清单_DeepSeek对比.md”。

画布 1080×1920、30fps。所有文字与关键画面在 6:7 安全区内（居中 1080×1260 区域），底部与右侧为平台文案和按钮留空。
视觉：白底、黑字、微软雅黑，极简卡片；强调色只用一种。分屏时 Opus 5.5 固定在上方、DeepSeek 固定在下方（横屏素材上下排布、完整保留主体，不裁左右），全片不换位置。每块画面左上角标模型名，右下角标“@作者账号｜案例展示”。

素材使用：
- 开场：上 A（素材/A_2103315748496302080.mp4，约 8—11 秒段），下 F（deepseek_materials/F_2111449639216103424.mp4，自行选动态最强的 3 秒）。
- 第 03 段：G 原视频本身已是上下对比，整块居中放入，保留作者原标注，不再额外分屏。
- 第 04 段：H 原视频按段落交替，挑一组同一界面元素的 Opus 段与 DeepSeek 段，上下并排各停 1 秒以上。
- 第 06 段：J1、J2 为竖屏，左右并排缩小放置，各约 4 秒；不要标出哪条是哪个模型。
- 第 07 段：使用我实拍的录屏与两支自测成片（文件名以我上传为准）；若未上传，跳过本段，不要用其他素材顶替。
- E、I、K 仅作备用 B-roll，K 是旧版 V4.1 Flash 作品，不能标成 1017。

数字卡只使用口播稿中已写明的数字；凡写“待实测”“待核实”的位置，如我没有提供实际值，就删去对应句子与卡片，不要估算或补写。
原素材声音全部静音，只保留我的旁白；不要使用原视频配乐。

完成后渲染关键帧检查遮挡、溢出和安全区，实际导出 out/deepseek-vs-opus55.mp4，并报告时长、分辨率、帧率、音轨，以及仍需我人工确认的地方。
```

## 提示词 3｜（可选）下一期预告用：DeepSeek 出草稿、Opus 精修

只有当你真的想做下一期时再跑，本期不需要。

```text
第一轮（DeepSeek 环境）：读取我的口播文案，只输出分镜表和动画方案，并做一版低成本预览，不追求细节。
第二轮（Opus 5.5 环境）：读取上一轮的分镜表与预览代码，只修改节奏、细节和视觉质感，不改分镜结构，最后导出 MP4。
```

记录两轮各自的耗时与花费，和“全程 Opus”对比，才能说这套组合到底省了多少。
