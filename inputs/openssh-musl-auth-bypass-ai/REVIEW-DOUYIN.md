# REVIEW-DOUYIN — openssh-musl-auth-bypass-ai（Eko 独立审，2026-11-05 19:31 Asia/Taipei）

批准：马飞龙 2026-11-05 19:23 原话「批准公众号+抖音」。本审只审素材，不写脚本。

## 结论：通过（小修后）

可推送 `materials.md + sources.md + assets/` 给剪辑；以下为必须遵守的口播与画面口径。

## 独立核查
- 官方原文确认 critical、musl + PAM disabled 的部分 Linux，以及根因在 sshd 之外；官方 AI 报告与重挖案例均无具体数量。
- Damien 原帖确认：非 Linux、Linux/glibc、用 PAM 做密码认证的 Linux 不受影响；昨天才得知；AI Agent 有时数小时重挖；临时设 `PasswordAuthentication=no` 或关闭 SSH。
- Damien 回复确认：编译时带 PAM、运行时 `UsePAM no` 仍受影响。
- Alpine Tracker 复核：edge-main 为 10.6_p2-r0；3.19–3.24 稳定分支仍是旧版本，不能说「Alpine 全部已修」。截图中其他 CVE 不是本次编号，禁止拿来套用。
- 7 张可用网页截图逐张查看；Damien 图内头像已模糊，无可辨真人脸。原始头像图与未模糊 ncopa 图均留在 `_excluded/`，不推送。其余可用图未见可辨真人脸；Root.cz 为河豚插画。
- 素材只有网页截图和原文文本，无代码出图、无视频、无真人演示；无引流/资料包/评论区领取；未用百度热搜。

## 小修与素材取舍
1. `materials.md`：把「装了 openssh-server + 开密码 + 对外端口」的小晚推断改成审定的「排查入口」口径，不再写成充分受影响条件。
2. `media-80aj.png` → `_excluded/`：聚合站带广告和「体验 AI 工具」入口，且「不到两天」等表述无需采用，主证据已有官方与 Damien 原帖。
3. `assets/text/media-www.80aj.com.txt` → `_excluded/`：与上图配套，避免剪辑误用媒体推演。
4. `assets/img/media-rootcz.png`、`assets/text/media-www.root.cz.txt` 保留但标为【可选媒体佐证】：其配图注明 Duck.ai，不能当官方画面；报道仅辅助，数字仍以一手原文为准。

## 剪辑必须遵守
- **自查三步只说：** ① 在真正运行 sshd 的环境确认发行版/libc；② 看 `sshd -T` 的有效 `usepam` 与 `passwordauthentication`（编译带 PAM 但 `UsePAM no` 仍要排查）；③ 确认或怀疑命中组合，先按发行版方式设 `PasswordAuthentication=no` 或暂关 SSH，再走该发行版安全更新渠道。操作前确认密钥/控制台等管理通道，避免远程锁死。
- 不把「开放密码登录」说成唯一风险条件，也不展开利用原理、 payload、探测/绕过教学。
- Docker 可说：**「别按镜像名一刀切，先查容器里是否实际运行并暴露 sshd，再核对 musl、PAM 与密码认证的有效配置。」** 不说「所有 Docker 都中招」；「大多数 Alpine 容器不跑 sshd」是合理运维判断，不是官方统计，若使用须说「很多/通常的 Alpine 应用容器并不运行 sshd」，不要给比例。
- 不说「musl 的漏洞」；说「OpenSSH 认为根因在 sshd 之外，目前细节未展开」。
- 不编 AI 报告数量，不把「数小时重挖」说成所有漏洞必然如此，也不声称本次已由 AI 重挖。
- Alpine 只可说「截图时 edge 已到 10.6_p2-r0，稳定分支仍未显示该版本，按各自分支官方渠道处理」。
- 无 CVE、无 oss-security、无本次主流媒体集中报道、无真实新闻视频、无独立 logo；不要补造或移用其他 CVE。
- `man-sshd_config-man7-top.png` 只是手册页首，不能当 `UsePAM` 条目截图；要展示具体条目只能另取真实手册截图，不能用文本伪造截图。
- Damien 帖中的 boosts/favorites 是截图时动态数据，不必口播。
