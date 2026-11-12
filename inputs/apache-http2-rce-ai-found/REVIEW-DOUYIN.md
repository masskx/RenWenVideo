# REVIEW-DOUYIN — apache-http2-rce-ai-found（Eko 独立审，2026-11-12 13:57 Asia/Taipei）

批准：马飞龙于 2026-11-12 13:30（台北时间）原话「批准Apache漏洞，只做抖音」。本审只审素材，不写脚本，不联系任何人，不推 GitHub，不改 board.csv。成片规格：30–40 秒，1.2–1.25 倍速，纯内容收尾。

## 结论：有条件通过

核心事实已对照一手来源当场重核，与小晚交付口径一致。无代码绘制的示意图或数据图，无百度热搜，推荐画面无二维码、站外引流、资料包或评论诱导。数字均有出处。PoC / 在野利用、Wiz 64%/51%、默认不启用 HTTP/2 等关键边界，材料里已经写清，必须带进成片。缺少「关 HTTP/2 实操录屏」是已写明的缺口，可用本包已有的官方文档截图代替，不构成退回。

本条件通过不等于发布许可，也不等于成片已就绪。

## 独立核查方法

- 当场重新获取并阅读：Apache 官方公告 https://httpd.apache.org/security/vulnerabilities_24.html ；Wiz 博客 https://www.wiz.io/blog/cve-2026-119618-rce-apache-http-server-vulnerability ；官方文档 httpd / apachectl / core.html#protocols（从已下载的 core.html 抽出 Protocols 节） / mod_http2.html ；红帽 https://access.redhat.com/security/cve/cve-2026-119618 ；NVD API 2.0（CVE-2026-119618，状态 Received，与本地 `assets/text/nvd-api-cve-2026-119618.json` 的 published / lastModified / 状态一致）；CISA KEV 官方 JSON https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json （审稿当场仍为 catalogVersion 2026.11.10，dateReleased 2026-11-10T19:03:29.8375Z = 2026-11-11 03:03:29 台北时间，count 1779，未收录本 CVE；CVE-2026-111497 在目录，dateAdded 2026-10-27）。
- 目视全部建议上片截图与 SANS 定格，核对文字与官方原文；查看视频探针：可用片段 43 秒、1280×720、2,412,034 字节，与材料一致。
- 审稿对 materials.md / sources.md 做了两处必要小修，见文末。

## 核实表

| 事实 | 结论 | 一手来源 |
|---|---|---|
| CVE-2026-119618，mod_http2，`assign_headers()`，官方标 critical，可导致 RCE | 已核，正确 | 官方公告页；oss-security / announce 邮件 |
| 受影响：HTTP Server 2.4.55–2.4.70；独立 GitHub mod_h2 2.0.8–2.0.42 | 已核，正确 | 官方公告页 |
| 修复版 2.4.71，Released 2026-11-11 | 已核，正确 | 官方公告页「Fixed in Apache HTTP Server 2.4.71 / Released 2026-11-11」 |
| 致谢：Anthropic's OSS Scanner（ANT-2026-MAPKT6MZ，报告 2026-10-26）；Anthony Weems 与 Simon Scannell（Google Cloud Vulnerability Research，报告 2026-11-03） | 已核，正确。成片致谢以官方为准，写两家 | 官方公告页。红帽致谢页只提 Google 侧，未列 Anthropic |
| 同日另两条：CVE-2026-106023 important（mod_md 空指针，子进程崩溃）；CVE-2026-109163 low。不要混进本条，更不要把 106023 说成 RCE | 已核，正确 | 同一官方公告页 |
| 官方默认 Protocols 为 `http/1.1`；「By default, only the http/1.1 protocol … is allowed。」必须经 Protocols 启用 HTTP/2 | 已核，正确 | https://httpd.apache.org/docs/2.4/mod/core.html#protocols ；https://httpd.apache.org/docs/2.4/mod/mod_http2.html 「You must enable HTTP/2 via Protocols」；示例 `Protocols h2 http/1.1` 或 `Protocols h2 h2c http/1.1` |
| 查版本：`httpd -v` / `-V` / `-M` 为官方选项；`apachectl -v` 可作为透传，不要把 `apachectl -M \| grep http2` 说成官方原文 | 已核，正确 | https://httpd.apache.org/docs/2.4/programs/httpd.html ；https://httpd.apache.org/docs/2.4/programs/apachectl.html 「pass-through mode… all the arguments available for the httpd binary」 |
| 官方公告本身没有写 workaround；临时写 `Protocols http/1.1` 是 Wiz 建议，句法与官方默认值一致，优先仍是升级到 2.4.71 | 已核，正确 | 官方公告无 workaround 段；Wiz「Implement Temporary Mitigations」 |
| Wiz 64% / 51% 原话与「does not take configuration into account」 | 已核，正确。厂商自报，样本与窗口未定义 | 导语：「According to Wiz data, 64% of cloud environments have resources vulnerable to CVE-2026-119618。」正文：「According to Wiz data 64% of cloud environments have resources vulnerable to CVE-2026-119618, and 51% of cloud environments have publicly exposed instances. Note that this does not take configuration into account.」页面日期 November 11, 2026，作者栏 Merav Bar |
| Wiz 两处笔误：小节标题 “What is CVE-2026-111497?”；表格独立 mod_h2 Patched Versions「2.0.24 and newer」 | 已核，属实。正文写「newer than 2.0.42」，与官方一致。CVE-2026-111497 是 Google Brotli，已进 KEV，与本洞无关 | 当场阅读直播客；截图 `wiz-typo-heading-and-64-percent-crop.png`、`wiz-mitigation-protocols-http11.png` |
| 发表时无公开利用 / 无在野报告（Wiz 原话） | 已核。这是发表时点的表述 | 「As of the time of this blog’s publication, no exploit is available and there are no reports of exploitation in the wild.」官方公告与 oss-security 也未写公开 PoC 或在野利用 |
| CISA KEV 未收录本 CVE | 已核。以官方 JSON 为准，且只代表该份 feed 发布时的状态，不是「永远不会进 KEV」 | 审稿当场重拉 feed，仍为 2026.11.10 / 1779 条 / 无 CVE-2026-119618 |
| 红帽 CVSS 9.8 Critical 是红帽自评分；NVD 状态 RECEIVED，CVSS N/A | 已核，正确 | 红帽门户卡片与 CVSS 对照表（NVD 列为 N/A）；NVD 页面与 API：vulnStatus Received，metrics 为空，「NVD assessment not yet provided。」页面 Last Modified: Nov 12, 2026（API lastModified 2026-11-11T19:17:30.313Z = 2026-11-12 03:17:30 台北时间） |
| 红帽 Statement：public research has demonstrated a reliable exploit against a default-configured server with the mod_http2 module enabled；仅启用 HTTP/2 的服务器受影响；RHEL 9/10 因独立分配器标 Important；RHEL 8 及更早（mod_http2 < 2.0.8）不受影响；未给该研究链接 | 已核，正确。不要说成「利用代码已经满天飞」，也不要说成「可以确认完全没有 PoC」 | 红帽 Description / Statement；The Hacker News 官方账号跟帖同时转述了「可靠利用演示」和 “No in-the-wild exploitation has been reported.” |
| CWE-362 | 编号已核在 CVE.org 与 NVD，不在官方公告页的印刷编号里 | 官方公告只用了该 CWE 的长名称，没有印出「CWE-362」。CVE.org 列出 CWE-362；NVD Weakness Enumeration 同，Source 为 Apache Software Foundation。红帽写 CWE-20。成片不必念此编号。此条为审稿小修，见文末 |

## 必须遵守的条件（剪辑必须遵守，不是再退回小晚补材料）

1. **64%、51% 必须标「Wiz 自报」**，对象是「云环境里有资源受影响 / 有对外暴露的实例」，并保留「未计入配置」。禁止说成「64% 的云服务器」或「64% 的 Apache 实例」。
2. **利用情况不要说绝对。** 用：官方与 Wiz 发表时均未报告公开利用和在野攻击；红帽称有公开研究在默认启用了 HTTP/2 的服务器上演示过可靠利用，但未公布该研究本身。禁止说「已有公开 PoC / 已被广泛利用」，也禁止说「可以确认完全没有 PoC」。禁止演示、讲解或展示利用步骤，不用扫描器或 PoC 仓库画面。
3. **不要照抄 Wiz 两处笔误**：不要念 CVE-2026-111497；独立 mod_h2 修复版本用官方与 Wiz 正文「newer than 2.0.42」，不用表格「2.0.24 and newer」。
4. **不要把 CVE-2026-106023 说成 RCE**，也不要照抄 @Daily_CyberSec 的并列措辞（详见小修）。不要把红帽 9.8 说成 NVD 分数。
5. **不要说「所有 Apache 都中招」。** 须同时满足版本在 2.4.55–2.4.70（或独立 mod_h2 2.0.8–2.0.42）并且启用了 h2 / h2c。HTTP/2 官方默认关闭。临时关 HTTP/2 可引用 Wiz 的 `Protocols http/1.1`，但须标明这是临时缓解、不是官方公告里的补丁替代；优先升级到 2.4.71。
6. **致谢写两家：Anthropic OSS Scanner 与 Google Cloud**，不要只跟红帽走。不要暗示 Apache / Anthropic / Wiz / 红帽官方背书。默认不要单独使用未经授权的官方 logo。
7. **SANS Stormcast 片段（00:38–01:21，43 秒，商用授权未知）：建议只用极短镜头（约数秒）展示官方公告页，并口头或字幕标注出处「SANS Internet Storm Center Stormcast，2026-11-12」；或直接改用定格 `sans-stormcast-frame-0045-official-advisory.jpg`。不要把 43 秒整段当作成片主体（长度已相当于整支 30–40 秒视频），不要整期搬运 6:09 全片（含主持人人脸与其他漏洞），不要把烧录英文字幕当成官方原文。该片段不是我们实测。**
8. **缺「关 HTTP/2 实操录屏」：用本包已有的官方文档截图代替即可**——`apache-protocols-docs.png`（默认 `Protocols http/1.1`）、`apache-mod-http2-enable-via-protocols-crop.png`（须经 Protocols 启用）、`wiz-mitigation-protocols-http11.png`（临时写法）、`apache-httpd-v-option-crop.png` / `apache-apachectl-passthrough-crop.png`（查版本）。若之后要补操作画面，只能用真实终端或真实配置文件的截图／录屏，禁止用代码绘图示意。
9. **他人视频与 X 截图都不是我们实测**；公开可见、商用授权未知。已打码／裁掉人脸的版本才可上片，`_excluded/` 里带脸、带 cookie 条、完整 6:09 的文件不可用。画面不要出现二维码、站外导流、资料包、评论领取。发布须勾选「内容由AI生成」。

## 可用素材清单

优先：

- 官方条目裁切：`apache-vuln24-cve-2026-119618-crop.png`、`apache-vuln24-2.4.71-and-cve-crop.png`（仅作必要短引用）
- 查版本与关 HTTP/2 官方文档：`apache-httpd-v-option-crop.png`、`apache-apachectl-passthrough-crop.png`、`apache-protocols-docs.png`、`apache-mod-http2-enable-via-protocols-crop.png`
- Wiz 原话裁切（数字标自报；笔误标题不要念进成片）：`wiz-64-percent-paragraph-crop.png`、`wiz-no-exploit-in-the-wild-crop.png`、`wiz-mitigation-protocols-http11.png`；核对用 `wiz-typo-heading-and-64-percent-crop.png`
- 红帽原话（9.8 须标红帽自评分）：`redhat-cve-top-cvss.png`、`redhat-statement-reliable-exploit-crop.png`
- NVD / CVE.org 状态页：`nvd-cve-2026-119618.png`、`cve-org-cve-2026-119618.png`
- 披露邮件：`oss-security-2026-11-11-13.png`、`apache-announce-2.4.71.png`、`apache-announce-cve-2026-119618.png`

可选、须标注出处且不作实测：

- `wiz-blog-top.png`（作者头像已打码）
- `x-watchtowrcyber.png`（已裁回复）、`x-thehackersnews-thread.png`（主帖写了 CVSS 9.8，应标红帽）、`x-yousukezan.png`（头像已打码）、`hn-item-50453368.png`（评论不是官方事实）
- `x-daily-cybersec.png` 仅作热度线索，文案不要照抄
- SANS：按上面第 7 条使用短镜头或定格 `sans-stormcast-frame-0045-official-advisory.jpg`、片头 `sans-stormcast-frame-0002-logo.jpg`；视频文件为 `assets/video/sans-stormcast-2026-11-12-apache-segment-0038-0121.mp4`

备查整页与原文在 `assets/img/` 其余文件和 `assets/text/`。`apache-protocols-docs.png` 不是对在线 hash 定位的整页直截，而是用已下载的官方 HTML 抽出 Protocols 节、套官方 CSS、在本地 `file://` 渲染后再裁掉自行添加的来源说明；文字已与官方文档核对，可作为官方排版引用，不是代码画的示意图。

不可用：`assets/_excluded/` 全部文件；被误标为 PoC 的扫描仓库（本包未收录）。

## 审稿对材料的小修

1. **CWE-362 出处写精确了。** 原稿把该编号一并记在「官方公告」下。当场检索官方 `vulnerabilities_24.html` 本条，只有 CWE-362 的长名称，没有印刷编号。已改为：编号以 CVE.org / NVD 为准；红帽是 CWE-20；成片不必念编号。
2. **@Daily_CyberSec 的问题改成「并列易误读」，不再写成「该帖把 106023 明确写成了 RCE」。** 可见原文是 “fix CVE-2026-119618, a critical mod_http2 remote code execution flaw, alongside CVE-2026-106023”：RCE 语法上修饰 119618。同时把 sources.md 里 @watchtowrcyber 的赞数按截图改为 175（原稿写 176）。

未改脚本（本来就没有脚本），未改画面文件，未推仓库。
