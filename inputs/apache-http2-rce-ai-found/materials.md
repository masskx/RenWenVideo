# 抖音素材交付：apache-http2-rce-ai-found

采集时间：2026-11-12 13:31–13:52（台北时间）。只整理素材与证据，无脚本、无渲染、无 GitHub 操作。已核 board.csv 第175行与本目录 STATUS 首行：马飞龙于 2026-11-12 13:30（台北时间）原话「批准Apache漏洞，只做抖音」。

成片 30–40 秒，1.2–1.25 倍速，结尾纯内容：无站外引流、资料包或评论区领取。发布须勾选「内容由AI生成」。不要把他人视频或截图说成我们实测。

## 原文与关键结论（已逐字核对）

官方公告：https://httpd.apache.org/security/vulnerabilities_24.html  
条目标题：**CVE-2026-119618 (critical): mod_http2: heap corruption and RCE in assign_headers**

1. **CVE 编号、模块、级别（已核，与 Wiz 正文一致）**  
   官方、CVE.org、NVD、oss-security、Apache announce 邮件均为 **CVE-2026-119618**。级别官方标 **critical**。模块是 **mod_http2**，函数 `assign_headers()`。描述原话：Concurrent Execution using Shared Resource with Improper Synchronization vulnerability in Apache HTTP Server's mod_http2 in assign_headers() can lead to RCE。这段是 CWE-362 的长名称，但官方公告页本身没有印出「CWE-362」编号；该编号出现在 CVE.org 与 NVD（source: Apache Software Foundation / security@apache.org）。红帽页面写的是 CWE-20，不要混用。成片不必念 CWE 编号。

2. **受影响与修复版本（已核）**  
   Apache HTTP Server：**from 2.4.55 through 2.4.70**。  
   独立 GitHub mod_h2：**from 2.0.8 through 2.0.42**。  
   修复版：**2.4.71**，官方页写 Released **2026-11-11**。同一次 2.4.71 还修了另外两个漏洞（CVE-2026-106023 important / CVE-2026-109163 low），不要混进这条的故事，也不要把 106023 说成 RCE。

3. **致谢与日期（已核）**  
   - finder: Anthropic's OSS Scanner, as vulnerability ANT-2026-MAPKT6MZ；Reported to security team (Anthropic) **2026-10-26**  
   - finder: Anthony Weems and Simon Scannell of the Google Cloud Vulnerability Research；Reported to security team (Google) **2026-11-03**  
   - fixed in 2.4.x by 824beab9b9424d6cfb29595248fdbf6c3dddeab1，**2026-11-11**  
   - Update 2.4.71 released **2026-11-11**  
   红帽页面致谢未列 Anthropic，只提 Google 侧；成片致谢以 Apache 官方为准，写「Anthropic OSS Scanner 与 Google Cloud」。

4. **Wiz「64%云环境」原话（已核，厂商自报）**  
   博客：https://www.wiz.io/blog/cve-2026-119618-rce-apache-http-server-vulnerability ，页面日期 November 11, 2026，作者栏 Merav Bar。  
   导语：According to Wiz data, 64% of cloud environments have resources vulnerable to CVE-2026-119618.  
   正文原话：According to Wiz data 64% of cloud environments have resources vulnerable to CVE-2026-119618, and 51% of cloud environments have publicly exposed instances. Note that this does not take configuration into account.  
   口径只能说「Wiz 自称：64% 的云环境里有资源受此 CVE 影响，51% 的云环境有对外暴露的实例，且未把配置计算在内」。不要说成「64% 的云服务器」或「64% 的 Apache 实例」。样本、统计窗口页面未定义。

5. **Wiz 页有两处笔误，成片不要照抄**  
   - 小节标题写成 “What is **CVE-2026-111497**?”，正文讲的仍是 CVE-2026-119618。CVE-2026-111497 是另一件事（Google Brotli / Brotli2Shell），且已进入 CISA KEV（dateAdded 2026-10-27）。不要把两个编号混成同一个洞。  
   - 影响版本表把独立 mod_h2 的 Patched Versions 写成 “2.0.24 and newer”；同页正文写的是 “upgrade the module to a version **newer than 2.0.42**”，与官方「影响到 2.0.42」一致。用官方 + Wiz 正文，不用那一格。

6. **PoC / 在野利用：有分歧，不要说绝对「没有 PoC」，也不要说「已被广泛利用」**  
   - Apache 官方公告、announce 邮件、oss-security **没有**写公开 PoC 或在野利用。  
   - Wiz 原文（发表时）：“As of the time of this blog’s publication, no exploit is available and there are no reports of exploitation in the wild.”  
   - NVD 状态 **RECEIVED**，CVSS 为 N/A（NVD assessment not yet provided），页面无利用说明。Published Nov 11, 2026；页面 Last Modified Nov 12, 2026。  
   - CISA KEV 官方 JSON（catalogVersion **2026.11.10**，dateReleased 2026-11-10T19:03:29.8375Z = **2026-11-11 03:03:29 台北时间**，count 1779）**没有** CVE-2026-119618。此为截至该份 feed 的结论，不是「永远不会进 KEV」。  
   - 红帽客户门户 Statement 原话：public research has demonstrated a reliable exploit against a default-configured server with the mod_http2 module enabled。同时写明：Only servers that have HTTP/2 enabled are affected; servers configured to serve only HTTP/1.1 are not vulnerable。The Hacker News 官方账号转述红帽时也写了 “No in-the-wild exploitation has been reported.” 红帽未给出该「public research」的链接或名称。红帽 CVSS **9.8** 是红帽自己的分数，**不是** NVD 分数。RHEL 9/10 因独立分配器被标 Important 而非 Critical；RHEL 8 及更早因 mod_http2 低于 2.0.8 **不受影响**。  
   - 网上有被误标成 PoC 的扫描仓库，本包**未下载、不收录**。讨论触发条件的帖子已排除。  
   建议成片用语：官方与 Wiz 发表时均未报告公开利用和在野攻击；红帽称有公开研究在默认启用了 HTTP/2 的服务器上演示过可靠利用，但未公布该研究本身。HTTP/2 官方默认关闭。

7. **临时缓解与查版本（以 Apache 官方文档为准）**  
   官方漏洞公告本身**没有**写 workaround。  
   查版本：官方 `httpd` 手册写 `-v` Print the version of httpd, and then exit；`-V` 打印版本和编译参数；`-M` Dump a list of loaded Static and Shared Modules。官方 `apachectl` 手册写：When acting in pass-through mode, apachectl can take all the arguments available for the httpd binary。因此 `apachectl -v` 可以作为透传使用，但不要把 `apachectl -M | grep http2` 说成官方原文。  
   关 HTTP/2：官方 core 手册 **Protocols** 指令，Default 是 `Protocols http/1.1`；“By default, only the http/1.1 protocol … is allowed.” 官方 mod_http2 手册写：“You must enable HTTP/2 via Protocols”。示例是 `Protocols h2 http/1.1` 或 `Protocols h2 h2c http/1.1`。Wiz 建议的临时写法 `Protocols http/1.1`（去掉 h2 / h2c）与官方语法一致，但是 Wiz 的缓解建议，不是官方公告里的补丁替代方案。优先仍是升级到 2.4.71。

## 成片口径／合规提醒

- 不要把 Wiz 标题笔误 CVE-2026-111497 念成这个洞的编号。  
- 不要把红帽 9.8 说成「NVD 打了 9.8」。  
- 不要把同日修复的 CVE-2026-106023 说成 RCE。该洞官方标 important，是 mod_md 空指针导致子进程崩溃，不是 RCE。@Daily_CyberSec 可见正文是「fix CVE-2026-119618, a critical mod_http2 remote code execution flaw, alongside CVE-2026-106023」：语法上 RCE 修饰的是 119618，「alongside」只是并列提到 106023，并未把 106023 明确写成 RCE，但这种并列很容易被误读。文案不要照抄该帖。  
- 不要说「所有 Apache 都中招」：要同时满足版本在 2.4.55–2.4.70（或独立 mod_h2 2.0.8–2.0.42）**并且**启用了 h2 / h2c。  
- 不要演示、讲解或展示利用步骤；不要用扫描器/PoC 仓库画面。  
- 64%、51% 必须标「Wiz 自报」，并保留「未计入配置」。  
- 致谢写两家：Anthropic OSS Scanner + Google Cloud，不要只跟红帽走。  
- 他人视频、X 截图都不是我们实测。X 截图已裁掉带脸的回复；Wiz 作者头像、yousukezan 头像已打码。  
- 画面不要出现二维码、站外账号导流、资料包、评论领取或翻墙字样。SANS 片段不要整期搬，也不要把字幕当成官方原文。

## 素材清单与权利

下列时间均为 2026-11-12 台北时间获取。全部是真实网页截图或对真实截图的裁切／打码，不是代码画的示意图。授权不明的标「公开可见，商用授权未知」，不做已授权保证。

### 建议优先给成片用的画面

| 文件 | 内容 | 出处 | 授权与使用 |
|---|---|---|---|
| `assets/img/apache-vuln24-cve-2026-119618-crop.png` | 官方条目全文：critical、2.4.55–2.4.70、2.4.71、致谢、日期表 | 官方公告页真实截图裁切 | 官方安全公告页面，仅作必要短引用 |
| `assets/img/apache-vuln24-2.4.71-and-cve-crop.png` | 同上，略多「Fixed in 2.4.71 / Released 2026-11-11」上下文 | 同上 | 同上 |
| `assets/img/wiz-64-percent-paragraph-crop.png` | 「According to Wiz data 64%… 51%… does not take configuration into account」原话 | Wiz 博客真实截图裁切 | 厂商页面，公开可见、商用授权未知；数字标自报 |
| `assets/img/wiz-typo-heading-and-64-percent-crop.png` | 笔误标题 CVE-2026-111497、64%/51% 原话、表格「2.0.24 and newer」笔误 | 同上 | 用来核对，不要把笔误标题念进成片 |
| `assets/img/wiz-no-exploit-in-the-wild-crop.png` | Wiz「no exploit / no reports of exploitation in the wild」原句 | 同上 | 同上；这是发表时的表述 |
| `assets/img/wiz-mitigation-protocols-http11.png` | 升级 2.4.71、独立模块 newer than 2.0.42、临时 `Protocols http/1.1`；顶部表格仍有 2.0.24 笔误 | 同上 | 缓解句法可引用；优先仍用官方文档 |
| `assets/img/wiz-blog-top.png` | 标题、导语 64%、封面图编号正确、正文无 exploit 句；作者头像已打码 | 同上 | 头像已打码；未打码原图在 `_excluded/` |
| `assets/img/apache-httpd-v-option-crop.png` | 官方 `-v` / `-V` / `-M` 原话 | https://httpd.apache.org/docs/2.4/programs/httpd.html | 官方文档，可引用 |
| `assets/img/apache-apachectl-passthrough-crop.png` | 「pass-through mode… all the arguments available for the httpd binary」 | https://httpd.apache.org/docs/2.4/programs/apachectl.html | 官方文档 |
| `assets/img/apache-protocols-docs.png` | Protocols 默认 `http/1.1`、示例 `Protocols h2 http/1.1` | 见下「截图方法」 | 官方 CSS + 官方 HTML 摘录渲染，已裁掉自行添加的来源说明行 |
| `assets/img/apache-mod-http2-enable-via-protocols-crop.png` | “You must enable HTTP/2 via Protocols” 及官方示例 | https://httpd.apache.org/docs/2.4/mod/mod_http2.html | 官方文档 |
| `assets/img/nvd-cve-2026-119618.png` | NVD 状态 RECEIVED，CVSS N/A，Last Modified Nov 12, 2026 | https://nvd.nist.gov/vuln/detail/CVE-2026-119618 | 美国政府页面 |
| `assets/img/cve-org-cve-2026-119618.png` | CVE.org 编号、致谢、版本；已裁掉顶部 cookie 条 | https://www.cve.org/CVERecord?id=CVE-2026-119618 | 公开 CVE 记录 |
| `assets/img/redhat-cve-top-cvss.png` | 红帽 CVSS 9.8、Critical、Public / Last modified 2026-11-11 2:59:26 PM UTC | https://access.redhat.com/security/cve/cve-2026-119618 | 公开门户；9.8 是红帽自评分 |
| `assets/img/redhat-statement-reliable-exploit-crop.png` | 红帽 Statement「public research has demonstrated a reliable exploit…」及仅 HTTP/2 启用才受影响 | 同上 | 引用红帽原话即可，不要展开利用细节 |
| `assets/img/oss-security-2026-11-11-13.png` | Eric Covener 在 oss-security 的披露帖 | https://www.openwall.com/lists/oss-security/2026/11/11/13 | 公开邮件列表 |
| `assets/img/apache-announce-2.4.71.png` 与 `apache-announce-cve-2026-119618.png` | 2.4.71 发布说明与 CVE 公告（mail-archive 存档） | 见 sources.md | 公开邮件存档 |
| `assets/img/x-watchtowrcyber.png` | @watchtowrcyber：仅 h2 启用的主机暴露，升级或暂时去掉 h2 | https://x.com/watchtowrcyber/status/2120589618131124245 ，2026-11-12 02:48:58 台北，截图时 16.5K 次观看 | 公开可见，商用授权未知；已裁掉带脸回复 |
| `assets/img/x-thehackersnews-thread.png` | @TheHackersNews 主帖 + 跟帖转述红帽「可靠利用演示」且「尚无在野利用」 | https://x.com/TheHackersNews/status/2120746775455858849 ，2026-11-12 13:13:27 台北，截图时 6,639 次观看 | 公开可见，商用授权未知；官方账号 logo，无人脸 |
| `assets/img/x-daily-cybersec.png` | @Daily_CyberSec 升级提醒；正文把 CVE-2026-106023 与 119618 的 RCE 并列，容易被误读成两个都是 RCE（106023 官方是 important / 空指针崩溃） | https://x.com/Daily_CyberSec/status/2120525299267866772 ，2026-11-11 22:33:23 台北，截图时 23.7K 次观看 | 可作热度线索，文案不要照抄，也不要把 106023 说成 RCE |
| `assets/img/x-yousukezan.png` | 日文复述 Wiz：64%/51%、发表时无実証コード、无攻击报告；头像已打码 | https://x.com/yousukezan/status/2120727582752878721 ，2026-11-12 11:57:11 台北，截图时 958 次观看 | 公开可见，商用授权未知 |
| `assets/img/hn-item-50453368.png` | HN 讨论帖标题、28 points、9 条评论（高分辨率重截） | https://news.ycombinator.com/item?id=50453368 ，提交 2026-11-11 21:47:26 台北 | 公开讨论，评论不是官方事实 |
| `assets/video/sans-stormcast-2026-11-12-apache-segment-0038-0121.mp4` | SANS Stormcast 2026-11-12 中展示官方公告页的 43 秒片段（00:38–01:21），无主持人人脸，1280×720，约 2.4MB | YouTube `NWoM9JdTQ3I`，上传账号 SANS Internet Storm Center，上传日 2026-11-12，源片 6:09 | **公开可见，商用授权未知**；有英文字幕叠在官方页面上；不是我们实测；不要整期搬运 |

### 备查整页 / 原文摘录

- 官方公告较宽上下文（含同日另外两条 CVE，成片请用上面的条目裁切）：`assets/img/apache-vuln24-top.png`  
- 官方手册整页：`apache-httpd-v-docs.png`、`apache-apachectl-docs.png`、`apache-mod-http2-top.png`  
- GitHub Advisory GHSA-hjhf-gpg9-qqfj（Unreviewed）：`assets/img/github-advisory-GHSA-hjhf-gpg9-qqfj.png`  
- SANS 片头 logo（无人脸）与 00:45 官方页定格：`sans-stormcast-frame-0002-logo.jpg`、`sans-stormcast-frame-0045-official-advisory.jpg`  
- 原文摘录在 `assets/text/`：官方条目、announce、oss-security、Wiz 原话、Protocols 指令、NVD API JSON、CISA KEV feed 元数据、HN 评论、SANS 观看笔记。

### 截图方法说明（Protocols 文档）

在线 `core.html#protocols` 多次 hash 滚动失败（落到页首 AcceptFilter 或空白页）。后从已下载的官方 `core.html` 抽出 Protocols / ProtocolsHonorOrder 两节，套官方 `manual.css`，用 headless Chrome 打开本地 `file://` 再截图，并裁掉自行加在顶部的来源说明。成品 `apache-protocols-docs.png` 只含官方排版。带说明行的原图在 `assets/_excluded/apache-protocols-docs-with-excerpt-note.png`。文字已与官方文档核对。

### 不可直接使用 / 已隔离

| 文件 | 原因 |
|---|---|
| `assets/_excluded/wiz-blog-unblurred.png` | 含 Merav Bar 面部，成片用已打码的 `wiz-blog-top.png` |
| `assets/_excluded/x-yousukezan-unblurred.png` | 含账号头像面部 |
| `assets/_excluded/x-watchtowr-full-with-reply-faces.png`、`x-daily-cybersec-full-with-reply.png` | 回复区有人脸或无需使用的跟帖 |
| `assets/_excluded/redhat-cve-full-with-cookie.png`、`cve-org-with-cookie-banner.png` | 含 cookie 横幅；成片用已裁切版本 |
| `assets/_excluded/sans-stormcast-2026-11-12-full-369s-has-faces.mp4` | 完整 6:09，含主持人人脸及其他无关漏洞，不可整条使用 |
| `assets/_excluded/sans-stormcast-frame-face-*.jpg` | 主持人面部定格，仅供核对时间轴 |
| 讨论利用触发条件的 X 帖、被误标为 PoC 的扫描仓库 | 未下载、不收录 |
| The Hacker News 网站正文 | headless 遇到 Cloudflare 验证页，没有可用正文截图；改用其官方 X 帖 |

## 缺口（交 Eko 独立审前必须知道）

1. **没有我们自己的操作录屏**，也没有官方「从打开配置到关闭 HTTP/2」的完整演示视频。能用的活动影像主要是 SANS 展示官方公告页的 43 秒公开片段。  
2. **CISA KEV 目录网页搜索在无头浏览器里没有真正生效**，不能拿未过滤的目录首页当「不在 KEV」的证据。结论以官方 JSON feed catalogVersion 2026.11.10 为准。该 feed 发布于 11-11 03:03 台北时间，之后若有新版 feed，需要重核。  
3. **红帽所说的「public research / reliable exploit」没有给出链接**，本包也没有找到可引用的公开 PoC。不要把这句话说成「利用代码已经满天飞」，也不要说成「可以确认完全没有 PoC」。  
4. **The Hacker News 正文页未能突破验证码**，没有文章页截图。  
5. **Protocols 文档截图不是对在线 hash 定位的整页直截**，方法见上，文字已核对。  
6. **NVD 还没有给出 CVSS**；不要用红帽 9.8 顶替。  
7. 未收集 Anthropic / Apache 官方 logo 的单独授权文件；成片如需 logo，需另审品牌使用，默认不要暗示官方背书。

