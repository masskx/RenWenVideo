# DeepSeek 自称 ChatGPT，就是蒸馏吗？ · 分镜

## 简报

- 钩子台词：DeepSeek 新模型，连问 5 次你是谁，5 次都说：我是 ChatGPT。（脚本自带，没换）
- 钩子画面：第 0 帧就有「连问 5 次」150 px 大字 + 打码的 API 实测截图；5 个「I'm ChatGPT」逐个弹出，计数 0/5 → 5/5
- 核心看点：自称 ≠ 证据——Claude 会说自己是 DeepSeek，DeepSeek 在 Claude Code 里会说自己是 Claude；模型叫自己什么靠系统提示
- 结尾台词：蒸馏的争议一直都有，但模型说自己是谁，证明不了它是怎么来的。
- 标题·视频号：DeepSeek 连问 5 次都说自己是 ChatGPT，就是蒸馏吗？
- 标题·抖音：DeepSeek 连问 5 次都说自己是 ChatGPT，就是蒸馏吗？
- 标题·小红书：DeepSeek 自称 ChatGPT 是蒸馏吗｜大模型为什么会认错自己

## 计划

| 场景 | 时长 | 画面 | 语速 |
|---|---|---|---|
| hook | 0–5.9 秒 | 「连问 5 次」+ 截图 + 5 个 I'm ChatGPT 逐个弹出 | brisk |
| comments | 5.9–9.3 秒 | 弹幕「实锤蒸馏」「套壳」飞过 → 定格 + 大问号 | brisk |
| twist | 9.3–16.6 秒 | Claude 回答「我是 DeepSeek」的**示意图**（虚线框 + “示意图”标签）；按这个逻辑…… | normal |
| history | 16.6–22.3 秒 | 竖时间轴：2024.12 V3（新）、2026.02、2026.10；「不是新鲜事」 | normal |
| mechanism | 22.3–34.6 秒 | 两条通道：有系统提示 → 我是 XX；没有 → 训练数据 → ChatGPT；Claude Code 小窗 → 我是 Claude | normal |
| repro | 34.6–40.8 秒 | 中文 10/10 DeepSeek vs 英文 6/10、API 5/5 ChatGPT；「网友自测，条件未公开」 | brisk |
| verdict | 40.8–46.7 秒 | 「自称 ≠ 证据」150 px +「蒸馏争议一直有，但这个测试证明不了」 | calm |

总长 46.7 秒。布局：全屏 9:16（`look.frame: "full"`），蓝图深底，A 琥珀 = ChatGPT，B 青 = DeepSeek，Claude 用中性色。

## 素材和出处

- `inputs/deepseek-identity/scaling01.jpg`：X @scaling01 帖子配图（经 fxtwitter 取原图）；右上角头像已打码，截图里没有账号名；画面只标「X 网友 API 实测截图」。
- 其余画面全部代码绘制；Claude 的回答是示意图，不是截图。
- 未上屏：@wanglee12231 的官网 / App 20 次 15 次 DeepSeek（语言未说明，不放进“中文问”一栏），写进 README 出处。

## 封面卡

- 模板：冲突型（模型自称 vs 证据）
- 封面标题：“它说它是 ChatGPT”
- 锚点：一句 What model are you? + 5 个琥珀色 I'm ChatGPT，右下「×5」
- 辅助句：这能证明蒸馏吗？
- 标签：左上 DEEPSEEK · 连问 5 次
- 颜色：字 #e8f0fa / 底 #0c1a2c，强调 #ffab40
