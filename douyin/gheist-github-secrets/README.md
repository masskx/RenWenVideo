# 你的CI在打印你的密钥——Gheist 攻击（据 Wiz Research）

- 成片：`video.mp4`（1080×1920，30 fps，H.264 + AAC，60.0 秒，−15.1 LUFS，14 MB）
- 封面：`cover-9x16.jpg`（抖音 / 视频号全屏）、`cover.jpg`（3:4，小红书）、`cover-6x7.jpg`（6:7，信息流）；标题「你的CI / 在打印你的密钥」，辅助句「850+ 账号中招 · 据 Wiz Research」，锚点是红色 base32 日志 +「你的密钥」红章 + 粉色小幽灵
- 字幕：`subtitles.srt`；静帧 `still-XXs.jpg`，每 0.5 秒一帧的总览 `stills-sheet.jpg`
- 分镜：`tutorials/gheist-github-secrets.storyboard.md`；事实和出处：`inputs/gheist-github-secrets/materials.md`、`sources.md`；审稿：`review.md`（Eko 10-26，四条全部照办）
- 检查：简报 + 导演十项过；复述检查过（0 %；每秒 3.1 个上屏字，偏多的提醒——日志乱码和分支名）；丰富度过；封面过；lint 过
- 配音：用户本人的 MiniMax 音色（MashuaiDouyin01）。**发布时勾选「内容由AI生成」**
- 画面：Wiz 原文截图（右下「@Wiz Research｜案例展示」）、GitHub Changelog 截图（「@GitHub｜Changelog 2026-07-28」）+ 代码绘制的日志窗口、保险柜、遮罩条、管道、三条车道、分支列表、锁和 token 卡；粉色小幽灵是我们画的，不是 Wiz 的插画。日志里的 base32 是随机字符、分支后缀是随机的，片中标「示意」。**没有任何攻击工作流代码**（sync-check 只出现文件名）
- 事实：数字和时间全部出自 Wiz 原文；攻击“仍在进行”（截至 10-24）；分支数说“超过 13,500”；删除时间只说“几秒后”。结尾“30 天到期”是细粒度 token 的示例设置，不是来源里的数字
- 配乐：`scripts/generate-pulse-bed.py` 合成（无版权问题）：暗处低频脉冲，到“自查”换成一个敞开的和弦
- **不引流**：片中、封面和文案都没有链接、二维码、资料包、评论区关键词、主页

## 抖音

**标题**：850多个GitHub账号中招，你的CI可能正在打印你的密钥

**文案**：安全公司 Wiz 披露了一波还在进行的攻击 Gheist：用偷来的 GitHub token，往每个能碰到的仓库推一个 ci-sync- 开头的分支，塞进 sync-check 工作流，让你自己的 CI 把仓库密钥打印进日志。密钥先转成 base32，GitHub 的日志遮蔽对不上，整串就露出来；再用 GitHub 自己的 API 把日志下走，几秒后删掉运行。据 Wiz，已有超过 850 个账号、超过 13,500 个分支。自查：有没有 ci-sync- 分支、提交信息 ci: sync config。有的话，删分支不够——仓库、组织、环境密钥全部轮换，吊销 token。

**话题**：#GitHub #网络安全 #程序员 #AI编程 #供应链安全

## 视频号

**标题**：你的 CI 正在打印你的密钥：Gheist 攻击 850+ GitHub 账号

**文案**：Wiz Research 2026 年 10 月 25 日披露 Gheist：自 9 月 15 日起追踪到，攻击者用被盗的 GitHub token 在受害者能访问的每个仓库里提交 sync-check 工作流（分支 ci-sync- 加 6 位随机字符，提交信息 ci: sync config），让 CI 把密钥以 base32 编码打印进日志，绕过 GitHub 只遮蔽原样密钥的机制，经 GitHub API 下载日志后几秒内删除运行。截至 10 月 24 日攻击仍在进行，已发现超过 850 个账号、超过 13,500 个分支。GitHub 自 7 月 28 日起会扣下公开仓库里可疑的运行等待批准，但私有仓库和 GitHub Enterprise Server 不在保护范围内。建议：轮换受影响仓库能用到的全部仓库、组织、环境密钥；吊销 token；被扣下的 sync-check 运行不要批准；尽量用 GitHub App 或短期细粒度 token。

**话题**：#GitHub #网络安全 #程序员

## 小红书

**标题**：GitHub token被盗怎么自查｜Gheist攻击 ci-sync 分支 密钥泄露

**正文**：

⚠️ 安全公司 Wiz 披露的 Gheist 攻击还在进行
👻 用偷来的 GitHub token，往你的仓库推一个分支，让你自己的 CI 把密钥打印进日志
🔤 密钥先转成 base32 → GitHub 的日志遮蔽对不上 → 整串露出
🗑 用 GitHub 自己的 API 下走日志，几秒后删掉运行，没有可疑域名可拦
📊 据 Wiz：超过 850 个账号、超过 13,500 个分支
🚧 GitHub 7 月起会扣下可疑运行等批准——但只管公开仓库，私有仓库和企业服务器版不管

✅ 自查
1. 分支里有没有 ci-sync- 加 6 位字符的
2. 提交信息是不是 ci: sync config
3. 审计日志里有没有完成后 1 分钟内被删的运行

🔑 有的话
· 删分支不够，泄露已经发生
· 仓库 / 组织 / 环境密钥全部轮换
· 吊销 token，查电脑有没有中信息窃取木马
· 被扣下的 sync-check 运行别批准
· 以后用 GitHub App 或短期细粒度 token

#GitHub #网络安全 #程序员 #密钥泄露 #CICD #GitHubActions #AI编程

## 出处和素材（只写在这里，不上屏）

- 主源：Wiz Research，Rami McCarthy、Hila Ramati，「Gheist: Attempted Scaled Abuse of Stolen GitHub Tokens Stumbles」，2026-10-25 https://www.wiz.io/blog/gheist-attempted-scaled-abuse-of-stolen-github-tokens-stumbles
- GitHub Changelog 2026-07-28「GitHub Actions holds potentially malicious workflows for approval」https://github.blog/changelog/2026-07-28-github-actions-holds-potentially-malicious-workflows-for-approval/
- GitHub Docs：管理个人访问令牌 https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens ；Actions 密钥 https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions
- 截图：Wiz 原文标题与关键段、GitHub Changelog 标题与适用范围段（2026-10-26 截取，见 `inputs/gheist-github-secrets/sources.md`）
- 字体思源黑体 / 霞鹜文楷（OFL）；音效见 `public/audio/sfx/CREDITS.json`；底乐自己合成
