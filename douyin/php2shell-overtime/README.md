# PHP2Shell漏洞：一个漏洞，让全球程序员连夜升级PHP

- 成片：`video.mp4`（1080×1920，30 fps，H.264 + AAC，43.4 秒，约 −15 LUFS，20 MB）
- 封面：`cover.jpg`（3:4，小红书）、`cover-6x7.jpg`（6:7，视频号 / 抖音信息流）、`cover-9x16.jpg`；标题「一个漏洞 / 全球程序员连夜加班」，锚点是红点闪烁的地球 + 警报条 + 03:00
- 字幕：`subtitles.srt`；审片静帧 `still-XXs.jpg` + 拼图 `stills-sheet.jpg`
- 配音：本人复刻音色（豆包语音）。**发布时勾选「内容由AI生成」**
- 画面全部自绘：没有真实 logo（PHP、欧盟、各机构只写文字），没有利用代码 / payload / 攻击步骤 / 缓解配置，终端只有 `php -v` 和版本号
- **不引流**：片中、封面和发布文案都没有链接、资料包、评论区关键词、主页、公众号

## 抖音

**标题**：凌晨三点，全球程序员被同一个漏洞叫醒

**文案**：PHP2Shell，两个漏洞，危险评分 9.2（满分 10）：攻击者不用登录，远程就可能在服务器上执行代码。PHP 撑着大约七到八成的网站，常见跑法基本都在范围里。有网站的，升级到 8.5.12 / 8.4.27 / 8.3.36 / 8.2.35 之一，升级完记得重启服务；8.1 及更早官方不再更新，赶紧问服务商或直接升级。

**话题**：#网络安全 #程序员 #PHP #漏洞 #网站运维

## 视频号

**标题**：一个漏洞，让全球程序员连夜升级PHP

**文案**：PHP2Shell（CVE-2026-109618 / 109619），危险评分 9.2，无需登录即可能远程执行代码；细节提前泄露，官方 10 月 21 日 21:40（北京时间）紧急发布补丁。修复版本：8.5.12、8.4.27、8.3.36、8.2.35，升级后记得重启服务。8.1 及更早官方不再更新，请联系服务商或升级。有网站的朋友转给运维看看。

**话题**：#网络安全 #PHP #程序员

## 小红书

**标题**：PHP2Shell高危漏洞｜PHP升级到哪个版本？网站自查

**正文**：

🚨 PHP2Shell：两个高危漏洞（CVE-2026-109618 / 109619），危险评分 9.2/10
⚠️ 攻击者不用登录，远程就可能在服务器上执行代码
🌐 PHP 撑着约 75%~80% 的网站，PHP-FPM、mod_php、php-cgi、FrankenPHP、LiteSpeed 这些常见跑法基本都在范围内
📅 10 月 20 日细节提前泄露 → 10 月 21 日 21:40（北京时间）官方紧急补丁；欧盟多机构联合声明，英国国家网络安全中心要求立即更新
✅ 升级到：8.5.12 / 8.4.27 / 8.3.36 / 8.2.35 之一，升级完一定重启服务，不然可能还在跑旧代码
🕰️ 8.1 及更早官方不再更新：问服务商，或者直接升级新版
补丁打上，才算真的过夜 🌅
#网络安全 #PHP #程序员 #网站运维 #漏洞预警 #服务器

## 出处（不上屏、不进发布文案）

- 选题：Eko 转发，2026-10-22。
- BleepingComputer：https://www.bleepingcomputer.com/news/security/php-ships-emergency-patches-for-critical-php2shell-flaws/ （无需认证 RCE、影响 PHP-FPM / mod_php / php-cgi / FrankenPHP / LiteSpeed、修复版本、8.1 及更早不再官方更新、英国 NCSC 立即更新、PHP 约占 75–80% 网站）
- ENISA 联合声明：https://www.enisa.europa.eu/news/joint-statement-on-critical-php-vulnerabilities （补丁 2026-10-21 13:40 UTC = 北京时间 21:40；ENISA / 欧盟委员会 / CERT-EU / Europol EC3 / CSIRTs 网络）
- CVE 记录：https://www.cve.org/cverecord?id=CVE-2026-109618 （CVSS v4.0 9.2）
- NHS England Digital：https://digital.nhs.uk/cyber-alerts/2026/cc-4875
- Huntress：https://www.huntress.com/blog/php2shell-leaked-critical-php-vulnerabilities （10 月 20 日细节提前泄露、升级后重启所有 worker）
- Check Point：https://blog.checkpoint.com/security/php2shell-what-we-know-about-the-leaked-critical-php-vulnerabilities-cve-2026-109618-cve-2026-109619/
- 音效为仓库自带合成音效和 Freesound 录音（`public/audio/sfx/CREDITS.json`）；底乐为脚本生成，口播时压低约 18 dB。

## 和脚本不一样的地方

- 时长：用户要约 40 秒，脚本口播照读约 46 秒，所以删了几处不影响事实的字：「意思是，」「只好」「的安全机构」「朋友」，成片 43.4 秒。
- 「凌晨三点」只是风格化的时钟（03:00 → 07:00），脚本备注它不是事实陈述（补丁是北京时间 21:40 发布的）。
- 终端里旧版本写成「PHP 8.x 旧版本 ← 有风险」，不编具体的旧版本号。
