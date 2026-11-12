# 来源与数字核对：apache-http2-rce-ai-found

采集：2026-11-12 13:31–13:52（台北时间）。凡写入成片的数字、日期、版本、致谢，均应能在下表找到出处。厂商自报已标明。

## 官方 Apache

| 事实 | 原话／取值 | 来源 | 备注 |
|---|---|---|---|
| CVE 编号 | CVE-2026-119618 | https://httpd.apache.org/security/vulnerabilities_24.html ；截图 `assets/img/apache-vuln24-cve-2026-119618-crop.png`；摘录 `assets/text/apache-official-cve-2026-119618.txt` | 与 CVE.org、NVD、Wiz 正文一致 |
| 标题与级别 | mod_http2: heap corruption and RCE in assign_headers；（critical） | 同上 | 官方用 critical，不是 CVSS 数字 |
| 受影响 HTTP Server | from 2.4.55 through 2.4.70 | 同上 | |
| 受影响独立模块 | Affected releases of mod_h2 from GitHub: from 2.0.8 through 2.0.42 | 同上 | |
| 修复版本与发布日 | Fixed in Apache HTTP Server 2.4.71；Released 2026-11-11 | 同上 | 同日共 3 条 CVE：1 critical, 1 important, 1 low |
| 同日另外两条（勿混） | CVE-2026-106023 (important) mod_md；CVE-2026-109163 (low) | 同一公告页，见 `apache-vuln24-top.png` | 不要把 106023 写成 RCE |
| 致谢 1 | Anthropic's OSS Scanner, as vulnerability ANT-2026-MAPKT6MZ | 官方公告 | 报告日 2026-10-26 |
| 致谢 2 | Anthony Weems and Simon Scannell of the Google Cloud Vulnerability Research | 官方公告 | 报告日 2026-11-03 |
| 修复提交 | 824beab9b9424d6cfb29595248fdbf6c3dddeab1，2026-11-11 | 官方公告日期表 | |
| 2.4.71 发布邮件 | Wed, 11 Nov 2026 04:19:06 -0800 = 2026-11-11 20:19:06 台北时间 | https://www.mail-archive.com/announce@httpd.apache.org/msg00203.html ；`assets/text/apache-announce-2.4.71.txt`、`assets/img/apache-announce-2.4.71.png` | lists.apache.org 页面有引导层，改用 mail-archive |
| CVE 公告邮件 | Wed, 11 Nov 2026 04:30:56 -0800 = 2026-11-11 20:30:56 台北时间 | https://www.mail-archive.com/announce@httpd.apache.org/msg00206.html ；`assets/text/apache-announce-cve-2026-119618.txt` | |
| oss-security | Eric Covener，2026-11-11 12:19:30 +0000 = 2026-11-11 20:19:30 台北时间 | https://www.openwall.com/lists/oss-security/2026/11/11/13 ；`assets/text/oss-security-2026-11-11-13.txt`、`assets/img/oss-security-2026-11-11-13.png` | 未写公开 PoC / 在野利用 |
| CVE.org | Published / Updated 2026-11-11；致谢与版本同上；CNA: Apache Software Foundation | https://www.cve.org/CVERecord?id=CVE-2026-119618 ；`assets/img/cve-org-cve-2026-119618.png` | 截图已裁 cookie 条 |
| CWE | CWE-362 Concurrent Execution using Shared Resource with Improper Synchronization | CVE.org（CWE-362）；NVD Weakness Enumeration（CWE-362，Source: Apache Software Foundation）；NVD API weaknesses.source=security@apache.org | 官方公告页只用了该 CWE 的长名称，没有印出「CWE-362」编号。红帽写的是 CWE-20，不要混用。成片不必念此编号 |

官方公告本身未列出临时缓解步骤。

## 查版本与关 HTTP/2（官方文档）

| 事实 | 原话／取值 | 来源 | 备注 |
|---|---|---|---|
| httpd -v | “-v  Print the version of httpd, and then exit.” | https://httpd.apache.org/docs/2.4/programs/httpd.html ；`assets/img/apache-httpd-v-option-crop.png` | |
| httpd -V | “Print the version and build parameters of httpd, and then exit.” | 同上 | |
| httpd -M | “Dump a list of loaded Static and Shared Modules.” | 同上 | 不要把 `apachectl -M \| grep http2` 说成官方原文 |
| apachectl 透传 | “When acting in pass-through mode, apachectl can take all the arguments available for the httpd binary.” | https://httpd.apache.org/docs/2.4/programs/apachectl.html ；`assets/img/apache-apachectl-passthrough-crop.png` | 因此 apachectl -v 可作为透传，不是 apachectl 自己单独列出的选项 |
| Protocols 默认 | Default: `Protocols http/1.1`。“By default, only the http/1.1 protocol (which includes the compatibility with 1.0 and 0.9 clients) is allowed.” | https://httpd.apache.org/docs/2.4/mod/core.html#protocols ；摘录 `assets/text/apache-protocols-directive.txt`；截图 `assets/img/apache-protocols-docs.png` | 截图方法见 materials.md（官方 HTML + 官方 CSS 摘录） |
| 启用 HTTP/2 示例 | `Protocols h2 http/1.1` | 同上 | |
| 必须经 Protocols 启用 | “You must enable HTTP/2 via Protocols in order to use the functionality described in this document.” 示例另有 `Protocols h2 h2c http/1.1` | https://httpd.apache.org/docs/2.4/mod/mod_http2.html ；`assets/img/apache-mod-http2-enable-via-protocols-crop.png` | HTTP/2 不是默认开启 |

## Wiz 博客（厂商自报）

页面：https://www.wiz.io/blog/cve-2026-119618-rce-apache-http-server-vulnerability  
页面日期：November 11, 2026；作者栏：Merav Bar；摘录：`assets/text/wiz-blog-excerpts.txt`。

| 事实 | 原话／取值 | 来源 | 备注 |
|---|---|---|---|
| 64% | “According to Wiz data, 64% of cloud environments have resources vulnerable to CVE-2026-119618.”（导语） | 页面导语；`assets/img/wiz-blog-top.png` | **厂商自报**。对象是 cloud environments 里「有资源受影响」，不是 64% 的云服务器 / Apache 实例。样本与窗口未定义 |
| 64% + 51% | “According to Wiz data 64% of cloud environments have resources vulnerable to CVE-2026-119618, and 51% of cloud environments have publicly exposed instances. Note that this does not take configuration into account.” | 正文 “Wiz Research data…” 节；`assets/img/wiz-64-percent-paragraph-crop.png` | **厂商自报**。必须保留「未计入配置」 |
| 发表时无 exploit / 在野 | “As of the time of this blog’s publication, no exploit is available and there are no reports of exploitation in the wild.” | 正文；`assets/img/wiz-no-exploit-in-the-wild-crop.png` | 这是发表时点的表述 |
| 标题笔误 | 小节标题 “What is CVE-2026-111497?”；目录同样写错 | `assets/img/wiz-typo-heading-and-64-percent-crop.png`、`wiz-blog-top.png` 目录 | CVE-2026-111497 ≠ 本洞 |
| 表格笔误 | 独立 mod_h2 Patched Versions 写成 “2.0.24 and newer” | 同上，以及 `wiz-mitigation-protocols-http11.png` 顶部表格 | 正文写 “newer than 2.0.42”，以正文和官方为准 |
| 临时缓解句法 | `Protocols http/1.1`（去掉 h2 和 h2c） | `assets/img/wiz-mitigation-protocols-http11.png` | 句法与官方 Protocols 默认值一致，但是 Wiz 建议，不是官方公告里的 workaround |

## NVD、CISA KEV、红帽

| 事实 | 原话／取值 | 来源 | 备注 |
|---|---|---|---|
| NVD 状态 | RECEIVED；“NVD assessment not yet provided.” CVSS N/A | https://nvd.nist.gov/vuln/detail/CVE-2026-119618 ；`assets/img/nvd-cve-2026-119618.png` | 不要编造 NVD 分数 |
| NVD 发布 | NVD Published Date: Nov 11, 2026；API published 2026-11-11T15:17:15.900Z = 2026-11-11 23:17:15 台北时间 | 页面 Quick Info；API 2.0 JSON 存于 `assets/text/nvd-api-cve-2026-119618.json` | |
| NVD 最后修改 | 页面 Last Modified: Nov 12, 2026；API lastModified 2026-11-11T19:17:30.313Z = 2026-11-12 03:17:30 台北时间 | 同上 | 页面只显示到日 |
| CISA KEV 未收录本 CVE | catalogVersion 2026.11.10；dateReleased 2026-11-10T19:03:29.8375Z = 2026-11-11 03:03:29 台北时间；count 1779；CVE-2026-119618 不在目录 | https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json ；`assets/text/cisa-kev-feed-meta.txt` | 以官方 JSON 为准，不用未过滤的目录 UI 截图。这是该份 feed 发布时的状态 |
| CVE-2026-111497 在 KEV | dateAdded 2026-10-27 | 同一份 KEV JSON | 与本洞无关，只为纠正 Wiz 笔误 |
| 红帽 CVSS 9.8 / Critical | 页面卡片 “9.8 CVSS v3 Score Breakdown”；Severity Critical | https://access.redhat.com/security/cve/cve-2026-119618 ；`assets/img/redhat-cve-top-cvss.png` | **红帽自评分**，不是 NVD |
| 红帽公开与修改时间 | Public on November 11, 2026；Last modified on November 11, 2026, 2:59:26 PM UTC = 2026-11-11 22:59:26 台北时间 | 同上截图 | |
| 红帽「可靠利用演示」 | “public research has demonstrated a reliable exploit against a default-configured server with the mod_http2 module enabled” | 页面 Statement；`assets/img/redhat-statement-reliable-exploit-crop.png` | 未给出该研究链接。不要写成已有公开 PoC 仓库 |
| 仅 HTTP/2 启用才受影响 | “Only servers that have HTTP/2 enabled are affected; servers configured to serve only HTTP/1.1 are not vulnerable.” 及 Statement 中 “servers serving only HTTP/1.1 are not affected.” | 同上 | 与官方默认关闭 HTTP/2 一致 |
| RHEL 9/10 评为 Important | 因各 HTTP/2 stream 使用独立分配器；RHEL 8 及更早（mod_http2 < 2.0.8）不受影响 | 同上 Statement | 红帽产品口径，不要说成官方全局级别降级 |
| 红帽致谢 | 页面致谢侧重 Google 研究人员，未列 Anthropic | 同一门户（本包未单裁致谢节） | 成片致谢以 Apache 官方为准 |
| GitHub Advisory | GHSA-hjhf-gpg9-qqfj，状态 Unreviewed | https://github.com/advisories/GHSA-hjhf-gpg9-qqfj ；`assets/img/github-advisory-GHSA-hjhf-gpg9-qqfj.png` | 次要来源 |

## 讨论帖与视频

| 项目 | 取值 | 来源 | 备注 |
|---|---|---|---|
| HN 帖 | item 50453368；klaas- 提交于 2026-11-11T13:47:26 UTC = 2026-11-11 21:47:26 台北时间；截图时 28 points、9 comments | https://news.ycombinator.com/item?id=50453368 ；`assets/img/hn-item-50453368.png`；评论摘录 `assets/text/hn-item-50453368-comments.txt` | 评论不是官方版本结论 |
| X @watchtowrcyber | 2026-11-12 02:48:58 台北时间；截图时 16.5K Views、175 赞 | https://x.com/watchtowrcyber/status/2120589618131124245 ；`assets/img/x-watchtowrcyber.png` | 「only hosts with h2 enabled in Protocols being exposed」；公开可见，商用授权未知。赞数以截图为准（175） |
| X @TheHackersNews | 2026-11-12 13:13:27 台北时间；截图时 6,639 Views、14 赞 | https://x.com/TheHackersNews/status/2120746775455858849 ；`assets/img/x-thehackersnews-thread.png` | 主帖写了 CVSS 9.8（应标红帽）；跟帖同时转述「可靠利用演示」和 “No in-the-wild exploitation has been reported.” THN 网站正文被 Cloudflare 挡住，无文章页截图 |
| X @Daily_CyberSec | 2026-11-11 22:33:23 台北时间；截图时 23.7K Views、211 赞 | https://x.com/Daily_CyberSec/status/2120525299267866772 ；`assets/img/x-daily-cybersec.png` | 可见正文是「…CVE-2026-119618, a critical mod_http2 remote code execution flaw, alongside CVE-2026-106023」。RCE 语法上修饰 119618，106023 只是并列提及，并未被明确写成 RCE，但容易误读。106023 官方是 important / mod_md 空指针崩溃。文案不要照抄 |
| X @yousukezan | 2026-11-12 11:57:11 台北时间；截图时 958 Views | https://x.com/yousukezan/status/2120727582752878721 ；`assets/img/x-yousukezan.png` | 日文复述 Wiz，含「記事公開時点で実証コードも攻撃報告もない」；头像已打码；公开可见，商用授权未知 |
| SANS Stormcast 2026-11-12 | 上传日 2026-11-12；源片 369.24 秒、1280×720、26,031,449 字节；可用片段 00:38–01:21（43 秒、2,412,034 字节） | https://www.youtube.com/watch?v=NWoM9JdTQ3I ；笔记 `assets/text/sans-stormcast-2026-11-12-notes.txt` | 公开可见，商用授权未知；不是我们实测；完整期有人脸和其他漏洞，已放入 `_excluded/` |

未使用百度热搜。未私信任何人，未去水印，未下载被标为 PoC 的仓库。
