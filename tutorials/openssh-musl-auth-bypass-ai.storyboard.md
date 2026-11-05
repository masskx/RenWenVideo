# OpenSSH 紧急修复：musl 系统可绕过密码验证 · 分镜（模板：lemo/ascii-crt）

> 素材包 PR #69（`inputs/openssh-musl-auth-bypass-ai/`：materials.md、sources.md、REVIEW-DOUYIN.md（Eko 审过；马飞龙「批准公众号+抖音」））。素材情况 A：网页截图 + 原文文本，没有视频。审稿口径全部照办：只说官方范围（musl + 没开 PAM 的部分 Linux，官方定级 critical）；不说「musl 的漏洞」；不讲利用原理和细节；不编 AI 报告数量；「几小时重挖」是维护者说的「有时」，不说本次已被 AI 重挖；不说「所有 Docker 都中招」；Alpine 只说截图时 edge 已到 10.6_p2-r0、稳定分支未显示；没有 CVE 编号，不补造；自查三步照审稿原话，并提醒先留好密钥通道。
> 用户 2026-11-05 打 6 分：“nothing about them that makes it obvious they were made by you, and your model's capabilities aren't reflected”。这支整片是一台终端：官方原文逐字“打”出来（文件名就是出处），影响范围画成一个用制表符搭的逻辑电路，由 sshd_config(5) 里的默认值去拨开关，算出结果——推理过程本身就是画面。

## 简报

- 钩子台词：OpenSSH维护者原话：用musl、没开PAM的Linux，比如Alpine，别往下读了，立刻关掉密码登录。（hooks.md §一 第 5 种：一句原话 + 紧急；第 4 种：和观众有关的风险）
- 钩子画面：第 0 帧——琥珀色荧光终端，顶部一行反白「CRITICAL · OpenSSH 10.6p2 · 2026-11-05」，下面正在打出维护者原话的英文「stop reading and set PasswordAuthentication=no」，光标闪；中文译文逐行出。
- 核心看点：OpenSSH 10.6p2（2026-11-05）紧急修复一个能绕过密码验证的严重问题，影响用 musl、没开 PAM 的部分 Linux（如 Alpine）；维护者前一天才得知，因为 AI 智能体有时几小时就能重挖漏洞，长时间保密只对攻击者有利；官方说近来大量漏洞报告来自 AI、会更频繁发版；OpenSSH 默认 UsePAM no、PasswordAuthentication yes；自查三步。
- 收藏点：结尾自查三步的终端清单（命令 + 判断 + 处置），停约 2 秒，可截图。
- 结尾台词：命中就先关密码登录或暂停SSH，留好密钥通道，再按发行版渠道升级。（抖音技巧.md §三 第 1 种：一个马上能做的动作——风险题）
- 标题·视频号：OpenSSH 紧急修复：用 musl、没开 PAM 的 Linux（如 Alpine）先关密码登录
- 标题·抖音：OpenSSH维护者：别往下读了，先关掉密码登录
- 标题·小红书：OpenSSH 10.6p2 紧急修复｜Alpine / musl 服务器自查三步（sshd -T）

## 导演

- 模板：lemo/ascii-crt（单色荧光终端）。为什么是它：选用指南 §〇 把“开发者工具 / 终端”给到 ascii-crt；这条新闻本身就发生在终端里（sshd、配置项、命令）。照搬了：§1 整屏是一台单色琥珀荧光终端，所有字都在等宽网格上；§2 辉光、扫描线、暖黑玻璃、暗角、轻微闪烁；§3 一种荧光色 + 一个只用一次的第二色；§4 字幕是终端底部的 LOG 行，跟着口播逐字打出；§5 字只在格子上跳、打字节奏就是剪辑节奏、光标闪烁当悬念；§6 唯一的“镜头”是字号（推近 = 字变大）、清屏重绘当转场。不照搬：ASCII 画人像 / 风景、样片故事、机器人声处理。
- 模板改造：画面 = 用制表符（┌─┐ ═ ▶）搭的**逻辑电路**：四个开关接一个与门，开关由 sshd_config(5) 的默认值去拨，与门输出亮起——推理过程本身当画面（替换“文字变图像”这一招）；第二色定为警示红 #FF5A4E，只在与门输出「命中」那一下出现一次；中文在等宽网格里占两格（思源黑体），英文原文用 JetBrains Mono；官方原文逐字打出、文件名就是出处（`openssh.com/releasenotes.html#10.6p2`、`hachyderm.io/@damienmiller/…`），不放网页截图；配乐 → 合成 tension（低频脉冲 + 长音），高潮落在默认值把开关拨到“命中”
- 点子：观众以为这是“又一个漏洞”，其实关键在于 OpenSSH 自己的默认值——UsePAM 默认关、密码登录默认开——在 musl 系统上正好凑成风险组合；而维护者赶在一天内发版，是因为 AI 几小时就能重挖漏洞。
- 对标：ascii-crt 样片（`code/lemomo-ai__lemo-opuscar/3961ddb/styles/ascii-crt/demo`；学：荧光、LOG 字幕行、字号当镜头；不拿：ASCII 人像、样片故事）；我们的 php2shell-overtime（10 月，安全题，分享最多；学：风险题结尾给一个马上能做的动作；不拿：那支的画面）。
- 结构候选：① 原话钩子 → 是什么 → 为什么急（AI）→ 官方说 AI 报告变多 → 四个开关 → 默认值拨到命中 → 谁不受影响 → 自查 → 处置；② 先讲 AI 重挖漏洞再讲漏洞——钩子不如原话紧急；③ 只做自查教程——丢了 AI 这条线（账号是 AI 号）。选 ①：紧急原话开场，AI 是“为什么”，电路是“懂了”，自查是“能做”。
- 风格：ascii-crt 系统，琥珀荧光 #FFB547（暗 #8A5A1E、亮 #FFE2A8），暖黑玻璃 #0D0905，警示红 #FF5A4E 只用一次；JetBrains Mono + 思源黑体；扫描线、辉光、暗角、1% 闪烁。
- 底色：全片同一块暖黑玻璃；情绪靠亮度（暗 / 正常 / 粗 / 反白）和那一次红。
- 贯穿物件：闪烁的光标——钩子里停在“IMMEDIATELY”后面，电路里是与门的输出端，结尾停在 `PasswordAuthentication no` 后面。
- 招牌镜头：第 27–31 秒（defaults 场）：两份 man 页原文「UsePAM … The default is no.」「PasswordAuthentication … The default is yes.」逐字打出，两个开关随之拨动，与门输出端第一次变红「命中」——配乐高潮落在这一拍。
- 第0帧：反白标题行「CRITICAL · OpenSSH 10.6p2」+ 维护者原话前半句已打出 + 光标。
- 高潮停留：与门变红后停约 1.6 秒；最后一句说完 0.3 秒内结束。
- 配乐：tension（96 BPM），climax = defaults，lifts = check；gate 场开头静 0.4 秒。
- 和上一支不同：最近三支 openai-images-2-6-gif（dark-keynote）、chips-cpu-gpu-npu-tpu（teardown 3D）、altman-dram-pc-waste（news-package）。结构（紧急原话 → 原因 → 推演 → 自查，不是演示 → 原理 / 四颗芯片 / 原话核实）、开场（终端里打字，不是草图光扫 / 3D 芯片 / 真人原片）、招牌（默认值拨动逻辑电路，不是 6 格循环 / 总线 35× / 晶圆卡）、镜头路线（字号推拉 + 清屏重绘，不是界面展开 / 3D 环绕 / 条带擦除）、配乐形状（tension 低频脉冲）、结尾（可截图的自查清单 + 动作）——六项都不同。

## 镜头表

| 口播（一句） | 画面：具体东西 / 事件 | 景别 | 运镜 | reads | 上屏字（只放要“看”的） |
|---|---|---|---|---|---|
| OpenSSH维护者原话：用musl、没开PAM的Linux， | 终端打出维护者原话英文 + 中文 | 中 | 不动 | 1. 原话 | CRITICAL · OpenSSH 10.6p2、Damien Miller |
| 比如Alpine， | “Alpine Linux is one example”反白 | 中 | 推（字变大） | 1. Alpine | Alpine |
| 别往下读了，立刻关掉密码登录。 | “stop reading … IMMEDIATELY”加粗，光标闪 | 近 | 推 | 1. 立刻 | PasswordAuthentication=no |
| 这个漏洞能绕过密码验证， | 清屏；release notes 原文 Security 条目打出 | 中 | 不动 | 1. 绕过 | password authentication bypass |
| 他们前一天才知道， | 时间线：11-04 得知 | 中 | 不动 | 1. 前一天 | we learned of the problem yesterday |
| 当天就发了修复版。 | 11-05 09:03 UTC 10.6p2 发布 | 中 | 不动 | 1. 当天 | 10.6p2 |
| 为什么这么急？ | 清屏，光标闪 | 近 | 推 | 1. 问题 | ? |
| 他说AI有时几小时就能把漏洞重挖出来， | 原话打出，“within hours”反白 | 中 | 不动 | 1. 几小时 | AI agents, sometimes within hours |
| 拖着保密只对攻击者有利。 | “primarily benefits attackers”加粗 | 中 | 不动 | 1. 攻击者 | long embargo periods … |
| 官方也说：最近的漏洞报告很多， | release notes 段落打出 | 中 | 不动 | 1. 很多 | a large number of security bug reports |
| 不少是AI找出来的。 | “findings from AI models”反白；“more frequent releases” | 中 | 不动 | 1. AI | 更频繁发版 |
| 要同时看四个开关： | 静 0.4 秒；制表符电路：四个开关 + 与门 | 全 | 拉（字变小） | 1. 电路 | — |
| Linux、musl、没开PAM， | 前三个开关依次拨到 ON | 全 | 不动 | 1. 三个 | LINUX · MUSL · UsePAM no |
| 密码登录也开着。 | 第四个开关 PasswordAuthentication yes | 全 | 不动 | 1. 四个 | — |
| 麻烦在默认值： | man 页原文开始打出 | 中 | 推 | 1. 默认值 | sshd_config(5) |
| UsePAM默认关， | “The default is no.” → 开关拨动 | 中 | 不动 | 1. no | The default is no. |
| 密码登录默认开。 | “The default is yes.” → 开关拨动；与门输出第一次变红「命中」（高潮） | 全 | 不动 | 1. 命中 | The default is yes.、命中 |
| glibc的Linux、非Linux、用PAM验密码的， | 三行“✓ 不受影响” | 中 | 不动 | 1. 安全名单 | glibc · 非 Linux · PAM |
| 都不受影响。 | ✓ 依次亮 | 中 | 不动 | 1. ✓ | — |
| 自查： | 清屏，提示符 `$` | 中 | 推 | 1. 自查 | — |
| 确认跑sshd的系统是不是musl， | 打出 `cat /etc/os-release` | 中 | 不动 | 1. 第 1 步 | ① 发行版 / libc |
| 再用sshd -T看这两项实际值。 | 打出 `sshd -T \| grep -Ei 'usepam\|passwordauthentication'` | 中 | 不动 | 1. 第 2 步 | ② 实际生效值 |
| 命中就先关密码登录或暂停SSH， | 打出 `PasswordAuthentication no` | 中 | 不动 | 1. 第 3 步 | ③ 先关密码登录 |
| 留好密钥通道， | 一行提醒：先确认密钥 / 控制台能进 | 中 | 不动 | 1. 别锁死 | 先确认密钥登录 |
| 再按发行版渠道升级。 | `→ 10.6p2`；完整三步清单停 2 秒（收藏点） | 全 | 拉 | 1. 清单 | 按发行版渠道升级 |

## 封面卡

- 模板：冲突型（“别往下读了” + 紧急动作）
- 封面标题：OpenSSH紧急修复 / 别往下读了，先关密码登录
- 辅助句：musl + 没开 PAM 的 Linux（如 Alpine）
- 锚点：`ssh.cover`——终端里的原话
- 颜色：字 #FFB547 / 底 #0D0905 / 强调 #FF5A4E

## 素材和出处

- OpenSSH 10.6p2 release notes（2026-11-05）https://www.openssh.com/releasenotes.html#10.6p2
- Damien Miller 帖子（2026-11-05 09:03 UTC）https://hachyderm.io/@damienmiller/117563026759098135 ；回复（编译带 PAM 但 UsePAM no 也受影响）https://hachyderm.io/@damienmiller/117563136432970765
- sshd_config(5)：UsePAM 默认 no、PasswordAuthentication 默认 yes https://man7.org/linux/man-pages/man5/sshd_config.5.html
- Alpine 基于 musl：https://www.alpinelinux.org/about/ ；Alpine 安全追踪器 edge-main 10.6_p2-r0（截图时）
- 不用：CVE 编号（还没有）、80aj 的“不到两天”、任何利用细节、“所有 Docker 都中招”。
