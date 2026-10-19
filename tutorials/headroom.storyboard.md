# Headroom：AI 读日志少烧 token · 分镜

## 简报

- 钩子台词：一万多 token 的报错日志，压到一千二，关键那行报错还在。（脚本自带，没换）
- 钩子画面：第 0 帧就是 176 px 琥珀计数「10,144」+ 日志示意块（灰线 + 一行 FATAL）；「压到」时计数滚到 1,260、日志收成细线；「还在」时 FATAL 加青框 +「报错还在 ✓」。标「官方数据 · README」「示意」
- 核心看点：官方 4 个场景省 21%–57%，排查故障最多；一条命令 headroom wrap claude，不用改代码；原文留在本机
- 结尾台词：天天让 AI 跑代码、看日志，这个值得装上。
- 标题·视频号：AI 编程太费 token？这个开源工具先帮你压一遍
- 标题·抖音：一万多 token 的日志压到一千二，报错还在
- 标题·小红书：Claude Code 省 token｜开源工具 Headroom 怎么用

## 计划

| 场景 | 时长 | 画面 | 语速 |
|---|---|---|---|
| hook | 0–5.0 秒 | 计数 10,144 → 1,260 + 日志示意收缩 + FATAL 保留 | brisk |
| pain | 5.0–11.6 秒 | 「日志」「搜索结果」「JSON」逐个飞进「模型」，token 计量条变长，「= 烧 token」 | brisk |
| what | 11.6–19.1 秒 | 「Headroom」+ 你的 AI 工具 → 本机压缩 → 模型（出来变细）+ 开源信息卡 | normal |
| how | 19.1–26.5 秒 | 官方演示录屏（wrap claude 片段）+ 命令卡打字 +「不用改代码」+ 支持列表滚动 | brisk |
| range | 26.5–35.0 秒 | 四条官方数据柱：57 / 42 / 30 / 21 %，57 琥珀、21 青；官方配图 hero.png | normal |
| who | 35.0–41.7 秒 | ✅ 长任务 · 工具输出多 / ✖ 聊天 · 写文章 | normal |
| safe | 41.7–47.2 秒 | 细的压缩块发给模型；虚线“本机”框里的原文被取回；GSM8K 0.870 → 0.870（官方数据） | calm |
| verdict | 47.2–52.4 秒 | 「天天跑 AI 写代码？」130 px +「Headroom · 开源」，语音后停 1 秒 | slow |

总长 52.4 秒；全屏 9:16，蓝图深底，A 琥珀、B 青。

## 素材和出处

- `inputs/headroom/demo.gif`（README 的 HeadroomDemo-Fast.gif）：41 秒里只有 `headroom wrap claude` 启动 Claude Code 和一个网页仪表盘，**没有** 10,144 → 1,260 的画面（这个数字只在 README 的图注里）。所以钩子用代码画的示意 + 「官方数据 · README」；GIF 只用 4.3–14.3 秒的终端片段（`public/video/headroom/wrap.mp4`，静音，裁剪），放在 how 场景，标「@headroomlabs-ai｜官方演示」。仪表盘部分不用（有真人头像、有脚本之外的数字）。
- `inputs/headroom/hero.png`：README 的 hero.svg 渲染图（55,957 → 24,340、57%、FATAL 保留），放在 range 场景 57% 旁。
- github.com 在本环境被代理拒绝（403），仓库页和 README 截图拍不到；开源信息卡用脚本里核实过的 7.5 万+ 星（2026-10-19）。
- `inputs/headroom/README.upstream.md`：抓取时的 README，用来核对全部数字和命令。

## 封面卡

- 模板：数字型
- 封面标题：“AI 读日志 少烧 token”
- 锚点：巨大数字 10144 → 1260（两行，1260 琥珀，约占封面高 35%）
- 辅助句：关键报错还在 · 官方数据
- 标签：左上 HEADROOM · 开源
- 颜色：字 #e8f0fa / 底 #0c1a2c，强调 #ffab40
