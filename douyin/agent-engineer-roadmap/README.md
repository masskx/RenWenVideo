# 视频号发布包 · Agent 工程师路线图：面试没过，拿到一份入门指南

Chasen 面试一家做 AI + Web3 的公司没过，面试官的评价是“AI 这块没问题，工程能力不太行”，然后给了他一份《Agent 工程师入门指南》。他整理公开后，是一条五段路线：LLM 基础 → Prompt → RAG → Agent → 后端，每段配一个项目和验收标准，最后是四个方向的综合项目。这条片子把它画成一台“上下文机器”：一排有容量的槽位（上下文窗口）、右边的模型芯片、上方由系统操控的龙门吊——一路往里放 Token、消息、资料片段和工具结果，最后整台机器被装进服务箱。

**这是第一部按微信视频号做的片子**：画布 1080×1920，但页眉、画面和字幕全部在中间 6:7 的带里（y 330–1590）。

| 文件 | 说明 |
| --- | --- |
| `video.mp4` | 9:16 完整版：1080×1920，30fps，H.264 + AAC，175 秒（2:55），响度约 -15 LUFS |
| `video-6x7.mp4` | 6:7 版（1080×1260，从 9:16 版中间裁出，内容完整）——信息流按 6:7 显示时用这一版 |
| `cover.jpg` | 视频号封面 3:4（1080×1440） |
| `cover-6x7.jpg` / `cover-9x16.jpg` | 6:7 和 9:16 的同一封面，后台要求别的比例时用 |
| `subtitles.srt` | 逐句字幕，画面里已经烧录了一份 |

源配置：`tutorials/agent-engineer-roadmap.json` · 分镜：`tutorials/agent-engineer-roadmap.storyboard.md` · 重新渲染：`npm run tutorial:render -- agent-engineer-roadmap --overwrite --crf=23`
配音：阿里云百炼 CosyVoice（`cosyvoice-v3-flash` / `longsanshu_v3`，语速 1.2）；音效：`scripts/generate-sfx.py` 合成，落在接触帧上
画面：蓝图科技风（`look.theme: "blueprint"`）；琥珀 = 模型，青 = 系统 / 工程。

> 上传前在视频号助手里预览一次：看 9:16 版在信息流里是否被裁成 6:7、封面在主页九宫格里是否完整；规格以当期后台为准（`docs/video-craft/发布与风格偏好.md`）。

## 标题（任选其一）

1. 面试没过，面试官给了我一份 Agent 工程师路线图
2. 想做 Agent 开发？先做完这五个项目
3. Agent 工程师 = 看懂模型调用 + 工程能力：一份入门路线

## 作品描述

“AI 这块没问题，工程能力不太行。”
一份面试官给的《Agent 工程师入门指南》：从看懂一次模型调用开始，到 RAG、Agent 循环、状态与安全，再到把 Agent 做成能一条命令启动、一条命令测试的服务。五个阶段，每段一个项目、一条验收标准。
你现在卡在哪一站？原文链接见评论区 👇

#Agent #AI开发 #大模型 #RAG #程序员 #学习路线 #后端开发 #AI工程师

## 置顶评论

```
原文：Chasen（X @chasen_liao）《「万字总结」- 我偷来了一份成为 Agent 工程师的学习线路》
https://x.com/chasen_liao/status/2109081301819310578

五个项目：
① 大模型 API Playground（对话、流式、结构化输出、工具调用、Embedding、调用记录与 API 对比）
② RAG + Tool Calling Agent（文档处理、来源引用、≥2 个工具、≥20 条测试问题与失败分析）
③ 简化 Coding Agent（读 learn-claude-code，再从零实现：核心循环、工具执行、权限与上下文管理）
④ AI 服务后端（FastAPI + Pydantic、PostgreSQL、Redis、队列、Docker Compose、测试与基础 CI）
⑤ 综合个人 Agent（Coding：Pi / Codex CLI；办公：WorkBuddy / OpenWork；常驻：nanobot → OpenClaw；个人：OpenBot / OpenDots）
```

## 来源与说明

- 内容来自 Chasen（X @chasen_liao）2026-10-11 的 X 长文：https://x.com/chasen_liao/status/2109081301819310578 。知识点和项目要求来自面试官给他的材料，例子、入门取舍和四个方向的开源项目推荐是作者自己补充的（原文如此说明）。旁白和画面都是重写、重画的，没有用原文截图和原文配图，也没有画作者本人。
- 原文提到的许可提醒，转述在这里：OpenWork 的 `ee/` 目录用另一份受限许可证，不是整仓库 MIT；OpenBot / OpenDots 源码是 MIT，但运行还依赖 CopilotKit Intelligence 等服务。
- 画面里的机器、日志、终端输出都是示意：没有真实的模型名、Token 数或测试数量。
- 用于商业推广前，建议先联系原作者取得转载 / 改编许可。
