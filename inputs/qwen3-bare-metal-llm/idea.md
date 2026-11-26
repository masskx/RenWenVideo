# 裸机 Qwen3：开机直接进 AI，24 KB 装的是什么？

## 想法

- 标题：开机直接运行千问，24 KB 里装的是什么？
- 为什么现在拍：alesha-pro 的 llm.asm 初版在本轮窗口前公开。作者在 11 月 25 日 20:58 和 23:40（台北）提交多轮缓存与更小的权重格式等实质更新。Hacker News 当日早上 06:15 上帖，11 月 26 日 18:04 左右查到 151 分、39 条评论。[项目提交记录](https://github.com/alesha-pro/llm.asm/commits/main/02-baremetal-os) · [Hacker News 讨论](https://news.ycombinator.com/item?id=50648365) · [互动数据接口](https://hacker-news.firebaseio.com/v0/item/50648365.json)
- 谁会讨论：玩本地模型、旧电脑和虚拟机的观众。专用启动程序可以把启动路径做短；保留通用系统则更容易换模型、接工具和排查问题。

## 事实和出处

- 作者用 x86-64 汇编编写可引导的系统，在支持相关指令的硬件或虚拟机里运行 Qwen3-0.6B，弹出可交互的 asm-llm 提示符，支持多轮。它有自己的内核。[作者 Phase 2 README](https://raw.githubusercontent.com/alesha-pro/llm.asm/main/02-baremetal-os/README.md)
- 作者报告默认构建内核文件 24,252 字节（约 24 KB），另加载的 v2 权重为 614 MiB。权重体积与内核体积分别上屏。作者的可启动 ISO 示例另含引导程序、配置与 v1 649 MiB 权重，切勿把运行环境总量和内核大小混用。[Phase 2：Build / Running & Deploying](https://raw.githubusercontent.com/alesha-pro/llm.asm/main/02-baremetal-os/README.md)

## 素材与问题

- 优先录专用虚拟机启动；无法复刻时采用原创示意。未在本机复现实测，不引用启动速度或每秒生成量作为自己的结果。[素材清单](README.md) · [参考口播及分镜](script.md)
- 评论区：你手上有没有一台只跑一个任务的旧电脑？你给它留着通用系统，还是会愿意试专用启动？
