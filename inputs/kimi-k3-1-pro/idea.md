# kimi-k3-1-pro：Kimi K3.1 Pro 发布，讲几样它真能做的事

> 用户 2026-10-24：“Kimi 3.1 PRO 发布了，帮我做一条新视频介绍。时长约 30 秒；主要讲 Kimi 3.1 的一些能力；希望你帮我加一些视频素材。”
> 正式名字是 **Kimi K3.1 Pro**（月之暗面，K3.1 系列第一个模型）。素材是我从官方博客下载的演示视频（情况 B：视频）。

## 想法

- 想让观众记住的一件事：K3.1 Pro 不只是聊天写代码——它自己写脚本去开 Blender、CAD、虚幻引擎，把东西真的“搭”出来；编程分数贴着 Claude Opus 5.5。
- 为什么现在讲：2026-10-24 凌晨（北京时间）刚发布；权重 11 月 4 日前开源。
- 最反常识的地方（钩子）：官方演示里那条龙不是“AI 生成的视频”，是模型写代码、在 Blender 里程序化建模、在虚幻引擎里搭出的 3D 场景。
- 感觉：快、硬核、像一支能力展示片；不是参数表。

## 事实和出处

全部是月之暗面官方说法或官方自测，片子里标「据 Kimi 官方」「官方自测」。

- 发布：K3.1 系列第一个模型，官方称“迄今能力最强的 3 万亿级参数模型”，100 万上下文；同步出 Highspeed 版（同等智能，输出快 2–3 倍）。kimi.com、Kimi App、Kimi Work、Kimi Code、API（`kimi-k3.1-pro`）可用。— https://www.ithome.com/1/017/284.htm ；https://www.kimi.com/en/blog/kimi-k3-1-pro
- 权重：“Full model weights will be released by Nov 4, 2026”。— 官方博客；https://simonwillison.net/2026/Oct/23/kimi-k31-pro/
- 3D：不依赖 MCP 连接器，直接写并运行 Blender、CAD 等工具的脚本；擅长参数化建模。— 官方博客（“Without MCP connectors, it can write and run scripts for tools like Blender and CAD software”）
- 天宫（龙）：虚幻引擎 5.8，36 开间柱廊、半径 1750 米，巨龙在 Blender 里程序化建模；主角用 MetaHuman；场景 3600 万个源三角面；外部素材：Cloud Forge VDB 云、Poly Haven / ambientCG 材质、NASA 月面数据。— 官方博客 “Celestial Palace Battle Game in Unreal Engine”
- 科隆大教堂内景：Blender，约 330 万个三角面、8368 个构件动画；外部素材：Poly Haven 石材（CC0）、Mylius 彩窗照片（CC BY-SA 3.0）。— 官方博客 “Cathedral Modeled in Blender”
- 涡扇发动机：用 Python 在 FreeCAD 里建模，2100 个实体（风扇、减速齿轮箱、压气机、燃烧室、涡轮、外部管路），能分步装配、爆炸视图、旋转动画（风扇 / 低压轴 / 高压轴 2780 / 8590 / 12400 转每分）。— 官方博客 “Turbofan Model Built in FreeCAD”
- 台灯：用 trimesh 做了一个五件式、可 3D 打印的台灯，灵感来自福建土楼。— 官方博客 “3D-Printed Modular Lamp Built with Trimesh”
- 肌肉人走路：开源人体模型（296 个骨骼部件、402 个肌肉部件）；167 个任务、420 次独立审查，从“几秒内倒下”到“交替迈步连续走 11.2 秒”；奖励调不动手臂时，它去探测模拟器动力学，找出并改正肩部肌肉力臂计算里 36 处错误，再重训。演示片自带的表：v1 3.1 s 无步态 … v5 修好动力学 11.2 s。— 官方博客（walking simulator 一节）
- 编程：Terminal-Bench 4.0，K3.1 Pro 65.7，Claude Opus 5.5 66.4（差 0.7），GPT-6 Astra 58.2；max 推理强度，官方自测。— https://the-decoder.com/chinese-ai-model-kimi-k3-1-pro-is-closing-in-on-anthropics-claude-opus-5-5/ ；IT 之家
- 价格：输入 $2 / 输出 $10 每百万 token（Simon Willison：Claude Opus 5.5 的一半）。— Simon Willison（本片不用）
- 独立评测：Artificial Analysis 智能指数 55（Opus 5.5 58）。— Simon Willison、the-decoder（本片不用）

## 素材

- 情况：B（视频）。清单见 `README.md`。
- 颜色从素材里取（`frames/` 里的截帧，`scripts/qa/palette.mjs`）。

## 限制

- 时长约 30 秒（用户）。
- 所有能力都是官方演示 / 官方自测：上屏标「据 Kimi 官方」；不说“碾压”“最强”这类绝对词。
- 演示视频是月之暗面的：静音，右下角「@Kimi｜案例展示」，链接写进发布包。
