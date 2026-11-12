# Apache HTTP/2 远程代码执行漏洞：AI 扫描器最早报告，2.4.71 已修

- 成片：`video.mp4`（1080×1920，30 fps，H.264 + AAC，约 37 秒，配音 1.22 倍）
- 模板：`lemo/visual-investigation`（冷色调查桌）。官方公告、Apache 手册、Wiz、红帽的真实页面裁成灰度证据条，红色只用来“指”（高亮关键行、圈出 Anthropic 那行、范围内的版本、受影响那一行）；时间线读数 10-26 → 11-11、T+16 天；招牌是中招条件真值表：版本尺上的游标逐个读版本号、进入 2.4.55–2.4.70 变红，再加“开了 HTTP/2（默认关）”，四台示例服务器逐行算出受影响 / 不受影响 / 已修复 / 不在范围；利用情况分“已知 / 未解决”两栏；结尾三步自查。
- 账号主持人（IP 形象 v2，画中画小窗）出现在钩子、真值表、结尾三场
- 封面：`cover-9x16.jpg`、`cover.jpg`（3:4）、`cover-6x7.jpg`；字幕 `subtitles.srt`；静帧 `still-XXs.jpg`、`stills-sheet.jpg`
- 分镜：`tutorials/apache-http2-rce-ai-found.storyboard.md`；素材和审稿：`inputs/apache-http2-rce-ai-found/`（有条件通过，九条全部照办）
- 口径：64% 标「Wiz 自报」、对象是“云环境里有资源受影响”、未计入配置；官方与 Wiz 发表时未报告在野攻击，红帽称有公开研究演示过可靠利用但未公布——不说绝对；不念 Wiz 笔误编号、不用红帽 9.8、不提 CVE-2026-106023；受影响 = 版本 + 开了 h2 / h2c；`Protocols http/1.1` 标为 Wiz 建议的临时缓解，优先升级 2.4.71；致谢两家（Anthropic OSS Scanner、Google Cloud）；无利用细节、无 PoC、无 logo；SANS 视频未用
- 网页截图为必要新闻引用、注明出处，商用授权未单独取得
- **只发抖音**；**发布时勾选「内容由AI生成」**；**不引流**

## 抖音

**标题**：Apache刚修了个严重漏洞，最早报告的是AI扫描器

**文案**：Apache 官方公告：CVE-2026-119618（critical），mod_http2 可导致远程代码执行，影响 2.4.55 到 2.4.70，11 月 11 日发布 2.4.71 修复。官方致谢里，最早报告的是 Anthropic 的 OSS Scanner（10 月 26 日），之后 Google Cloud 漏洞研究团队也报告了（11 月 3 日）。要中招得同时满足两条：版本在范围内，而且开启了 HTTP/2（h2 / h2c）——HTTP/2 官方默认是关的。Wiz 自称 64% 的云环境里有受影响的资源，但这个数没算配置。官方和 Wiz 发表时都没报告在野攻击；红帽说有公开研究演示过可靠利用，但没公布研究本身。自查：httpd -v 看版本，升级到 2.4.71；暂时升不了，可以先把 Protocols 改回 http/1.1（Wiz 建议的临时缓解）。

**话题**：#网络安全 #Apache #漏洞 #AI新闻 #运维

## 出处（只写在这里，不上屏）

- Apache 官方公告：https://httpd.apache.org/security/vulnerabilities_24.html
- Apache 手册：https://httpd.apache.org/docs/2.4/programs/httpd.html ；https://httpd.apache.org/docs/2.4/mod/core.html#protocols ；https://httpd.apache.org/docs/2.4/mod/mod_http2.html
- Wiz：https://www.wiz.io/blog/cve-2026-119618-rce-apache-http-server-vulnerability
- 红帽：https://access.redhat.com/security/cve/cve-2026-119618
- oss-security：https://www.openwall.com/lists/oss-security/2026/11/11/13
