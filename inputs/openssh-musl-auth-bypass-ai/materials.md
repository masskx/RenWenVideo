# openssh-musl-auth-bypass-ai 抖音素材（小晚，2026-11-05 19:28 台北时间）
只有素材，不含脚本。所有截图都是 headless Chrome 截的真实网页，没有用代码画图。数字和来源见 sources.md。Eko 已审，剪辑口径与排除项见 `REVIEW-DOUYIN.md`。

## 图片 assets/img/
| 文件 | 内容 | 建议用途 | 注意 |
|---|---|---|---|
| openssh-releasenotes-10.6p2.png | OpenSSH 官方 release notes 10.6p2 段：AI 报告、"more frequent releases"、Security 条目 | 主证据：官方说收到大量 AI 漏洞报告、要更频繁发版 | 纯文字页，竖屏要放大或裁成局部 |
| damien-miller-post-blurred.png | Damien Miller 的 Hachyderm 帖子：「we learned of the problem yesterday」「AI agents… within hours」「set PasswordAuthentication=no」 | 主钩子：前一天才知道、AI 几小时就能重新挖出来 | 头像已模糊。原图在 _excluded/ |
| alpine-security-openssh.png | Alpine 安全追踪器的 openssh 页，edge-main 已到 10.6_p2-r0 | 说明 Alpine 已跟进 | 截图时只看到 edge 分支是 10.6_p2；3.19 到 3.24 稳定分支还是旧版本，不能说"Alpine 全部已修" |
| alpine-musl-about.png | Alpine 官网 About 页，写着基于 musl libc 和 busybox | 自查第 1 步：Alpine 用的就是 musl | — |
| man-sshd_config-man7-top.png | man7.org 的 sshd_config(5) 页顶部 | 自查第 2、3 步的出处画面 | 只截到页首，没截到 UsePAM / PasswordAuthentication 条目，原文在 text/man-sshd_config-excerpt.txt |
| media-rootcz.png | 捷克 Root.cz 的报道 | 【可选媒体佐证】 | 配图注明借助 Duck.ai；不能当官方画面，数字仍以一手原文为准 |
| ~~media-80aj.png~~ | 【已排除】 | 不用 | 已移至 `_excluded/`：聚合站带广告与工具入口，媒体推演不作依据 |

## 文本 assets/text/
- openssh-10.6p2-release-notes.txt：官方 release notes 10.6p2 段全文
- damien-miller-mastodon.txt：帖子全文，发帖时间 2026-11-05 09:03:46 UTC，即台北时间 17:03
- ncopa-fosstodon.txt：Alpine 的 Natanael Copa 说 Dropbear 不受影响
- man-sshd_config-excerpt.txt：UsePAM 和 PasswordAuthentication 两段 man 页原文
- media-www.root.cz.txt：可选媒体佐证原文；media-www.80aj.com.txt 已移至 `_excluded/`，不用

## _excluded/
- damien-miller-post-raw.png：未模糊的原图，含头像
- ncopa-alpine-dropbear.png：含头像，没有模糊
- media-80aj.png、media-www.80aj.com.txt：Eko 审后排除；聚合站广告/工具入口，且媒体推演不作依据

## 3 步自查的官方依据（只摘原文，不写利用细节）
1. 是不是 Alpine/musl：Alpine 官网写着基于 musl；Damien 原话是「Alpine Linux is one example」。
2. 有没有开 PAM：man 页写 UsePAM「The default is no」。Damien 在回复里确认：编译时带了 PAM，但运行时设成 UsePAM no，也受影响。
3. 关掉密码登录：man 页写 PasswordAuthentication「The default is yes」。Damien 建议立即设成 PasswordAuthentication=no，或者禁用 SSH，然后升级到 10.6p2。

## 影响范围（以官方原文为准）
- 受影响：Linux + musl libc + 未启用 PAM。官方用的词是 "some Linux systems"。
- 不受影响：非 Linux 系统、Linux/glibc 系统、用 PAM 做密码认证的 Linux。
- 官方认为根因在 sshd 之外，但可以通过 sshd 被利用。musl 维护者 dalias 不认为这是 musl 的漏洞。有争议，视频里不要说"musl 的漏洞"。
- Dropbear 不受影响，这是 Alpine 维护者的说法。
- Eko 审定：不要说「所有 Docker 都受影响」。说「先查容器里是否实际运行并暴露 sshd，再核对 musl、PAM 与密码认证的有效配置」。运行 sshd、开密码并暴露端口是排查入口，不单独构成受影响的充分条件；`UsePAM no` 仍需重点处理。多数/通常 Alpine 应用容器不跑 sshd 是运维判断，不是官方统计，不给比例。

## 缺口
- 还没有 CVE 编号和 oss-security 邮件：19:27 台北时间检索时都没找到。Alpine 追踪器里的 CVE-2026-106582 等条目是另外的问题，不要混用。
- 主流媒体还没报道：The Register、BleepingComputer、Ars、LWN、FreeBuf、IT之家都没搜到，只有 Root.cz 和 80aj。建议晚些再查一次。
- Alpine 没有找到正式安全公告。aports GitLab 截图被拦截了（"access blocked"），只有追踪器里的 edge 版本信息。
- 没有视频：没找到这件事的真实新闻视频。
- man 页的具体条目只有文本，没有对应截图。man.openbsd.org 连不上（ERR_CONNECTION_CLOSED）。
- 没有 OpenSSH 或 Alpine 的 logo 单独图片。Alpine 的 logo 只出现在追踪器和官网截图的页眉里。
