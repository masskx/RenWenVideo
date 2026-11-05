# OpenSSH 紧急修复：用 musl、没开 PAM 的 Linux（如 Alpine）可绕过密码验证——自查三步

- 成片：`video.mp4`（1080×1920，30 fps，H.264 + AAC，约 48 秒）
- 模板：`lemo/ascii-crt`（单色荧光终端）。整片是一台琥珀色终端：官方原文逐字打出（状态栏就是出处），影响范围画成用制表符搭的逻辑电路，由 sshd_config(5) 的两个默认值去拨开关、与门第一次变红「命中」（全片唯一一次红），自查三步打成命令；字幕是终端底部的 LOG 行，跟着口播逐字打出；主持人小窗被染成荧光色
- 封面：`cover-9x16.jpg`、`cover.jpg`（3:4）、`cover-6x7.jpg`；标题「OpenSSH紧急修复 / 别往下读了，先关密码登录」
- 字幕 `subtitles.srt`；静帧 `still-XXs.jpg`、总览 `stills-sheet.jpg`
- 分镜：`tutorials/openssh-musl-auth-bypass-ai.storyboard.md`；素材和审稿：`inputs/openssh-musl-auth-bypass-ai/`（Eko 审过；马飞龙「批准公众号+抖音」）
- 配音：用户本人的 MiniMax 音色（MashuaiDouyin01，1.12 倍）
- 口径（审稿全部照办）：只说官方范围（musl + 没开 PAM 的部分 Linux，官方定级 critical）；不说「musl 的漏洞」；不讲利用原理；不编 AI 报告数量（上屏「官方没有给出具体数量」）；「几小时」是维护者说的「有时」；不说「所有 Docker 都中招」；没有 CVE 编号；Alpine 只说截图时 edge 已到 10.6_p2-r0；自查三步照审稿原话，并提醒先确认密钥 / 控制台能登录
- 电路里的默认值是 **OpenSSH 上游默认**（sshd_config(5)：UsePAM 默认 no、PasswordAuthentication 默认 yes），上屏注明「发行版可能改过，以实际生效值为准」
- **发布时勾选「内容由AI生成」**；**不引流**

## 抖音

**标题**：OpenSSH维护者：别往下读了，先关掉密码登录

**文案**：OpenSSH 11 月 5 日紧急发布 10.6p2，修复一个能绕过密码验证的严重问题，影响用 musl libc、没开 PAM 的部分 Linux（维护者举的例子是 Alpine）。维护者说他们前一天才得知；因为最近看到 AI 智能体有时几小时就能把漏洞重新挖出来，长时间保密只对攻击者有利。官方也说最近收到大量漏洞报告，不少来自 AI，之后会更频繁发版。OpenSSH 上游默认 UsePAM no、PasswordAuthentication yes。自查：① 跑 sshd 的系统是不是 musl；② `sshd -T` 看 usepam 和 passwordauthentication 的实际值；③ 命中就先关密码登录或暂停 SSH（先确认密钥 / 控制台能登录），再按发行版渠道升级。

**话题**：#OpenSSH #网络安全 #Linux #AI #运维

## 公众号（已批准）/ 视频号

**标题**：OpenSSH 紧急修复：用 musl、没开 PAM 的 Linux（如 Alpine）先关密码登录

**文案**：同上，可展开三条原文：release notes 的 Security 条目、维护者 Damien Miller 的帖子（“stop reading and set PasswordAuthentication=no or disable SSH … IMMEDIATELY”）、sshd_config(5) 的两个默认值。不受影响：glibc 的 Linux、非 Linux 系统、用 PAM 做密码认证的 Linux。官方认为根因在 sshd 之外，目前细节未展开；暂无 CVE 编号。

## 小红书（备用，未批准）

**标题**：OpenSSH 10.6p2 紧急修复｜Alpine / musl 服务器自查三步（sshd -T）

**正文**：

🚨 OpenSSH 10.6p2：修复能绕过密码验证的严重问题
🐧 影响：用 musl、没开 PAM 的部分 Linux（如 Alpine）
⏱️ 维护者前一天才得知：AI 有时几小时就能把漏洞重挖出来
🧮 OpenSSH 默认：UsePAM no、PasswordAuthentication yes
✅ 不受影响：glibc Linux、非 Linux、用 PAM 验密码的
① 确认跑 sshd 的系统是不是 musl
② `sshd -T` 看 usepam / passwordauthentication
③ 命中先关密码登录或暂停 SSH（先留好密钥通道），再按发行版升级

#OpenSSH #网络安全 #Linux #运维 #AI

## 出处（只写在这里，不上屏）

- OpenSSH 10.6p2 release notes：https://www.openssh.com/releasenotes.html#10.6p2
- Damien Miller：https://hachyderm.io/@damienmiller/117563026759098135 ；回复 https://hachyderm.io/@damienmiller/117563136432970765
- sshd_config(5)：https://man7.org/linux/man-pages/man5/sshd_config.5.html
- Alpine：https://www.alpinelinux.org/about/ ；https://security.alpinelinux.org/srcpkg/openssh
