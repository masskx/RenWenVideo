# openssh-musl-auth-bypass-ai 数字与来源

- 10.6p2 发布日期 2026-11-05：https://www.openssh.com/releasenotes.html#10.6p2（官方）
- "large number of security bug reports, many … from AI"、"more frequent releases"：同上，官方原文。没有给具体数量，不要编数字
- 受影响范围是 "Linux systems that use the musl libc and PAM disabled"，"critical"：同上，官方定级
- 报告者 Özgün Kültekin（Wakefield）：同上
- 「we learned of the problem yesterday」、「AI agents, sometimes within hours」、「long embargo periods … primarily benefits attackers」：https://hachyderm.io/@damienmiller/117563026759098135 ，2026-11-05 09:03:46 UTC，即台北时间 17:03。这是维护者本人的说法
- 编译时带 PAM 但 UsePAM no 也受影响：Damien 的回复 https://hachyderm.io/@damienmiller/117563136432970765
- 截图时帖子数据是 181 boosts / 6 quotes / 85 favorites（19:24 台北时间，会变）
- Alpine edge-main 的 openssh 是 10.6_p2-r0：https://security.alpinelinux.org/srcpkg/openssh（19:25 台北时间）
- Dropbear 不受影响：https://fosstodon.org/@ncopa/117563341498491523 ，Alpine 的 Natanael Copa，2026-11-05 10:23 UTC，即台北时间 18:23
- UsePAM 默认 no，PasswordAuthentication 默认 yes：sshd_config(5)，https://man7.org/linux/man-pages/man5/sshd_config.5.html
- Alpine 基于 musl libc：https://www.alpinelinux.org/about/
- 媒体：https://www.root.cz/zpravicky/openssh-10-6p2-resi-kritickou-zranitelnost-systemu-s-musl-libc/ ；https://www.80aj.com/2026/11/05/openssh-vulnerability-ai-agent-reexploit/ 。80aj 说"不到两天"，这是媒体的说法，以 Damien 的"yesterday"为准
