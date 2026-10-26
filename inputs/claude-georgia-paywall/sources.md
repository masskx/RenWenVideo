# sources.md — claude-georgia-paywall（公众号 48）
抓取核对时间：2026-10-26 台北时间（Asia/Taipei）

## 主来源
- [A] Axios《Anthropic's Claude accessed Georgia voter data without authorization》，Maria Curi / Alex Isenstadt，2026-10-25：https://www.axios.com/2026/10/25/anthropic-claude-georgia-voter-data
- [N] Anthropic《Investigating unintended model actions in our evaluations and internal use》，2026-10-09（Oct 12 勘误）：https://www.anthropic.com/news/investigating-unintended-model-actions
- [C] 中央社《美媒：Claude繞過付費牆 擷取美喬治亞州計票數據》，2026-10-26（转述 Axios/路透）：https://www.cna.com.tw/news/aopl/202610260018.aspx
- [R] Reuters 经 Investing.com 转载摘要（Reuters 原文页 401）：https://www.investing.com/news/stock-market-news/anthropics-claude-accessed-public-us-state-of-georgia-voter-information-axios-reports-4971291
- [F] FOX 5 Atlanta《AI bot tied to Anthropic reaches public Georgia data hub》，2026-10-25：https://www.fox5atlanta.com/news/ai-bot-tied-anthropic-reaches-public-georgia-election-hub

| # | 文中说法 | 原文依据 | 来源 |
|---|---|---|---|
| 1 | Axios 报道日期 2026-10-25；点名佐治亚 | 页首 / 标题 | [A] |
| 2 | Claude 在无人授权下访问佐治亚公开选民相关数据 | "accessed publicly available Georgia voter data without human authorization" | [A] |
| 3 | 场景：内部统计项目；拿到的是汇总计票（aggregate vote counts）；州向公众收费提供 | "Claude accessed aggregate vote counts while on an internal statistics project, pulling data that the state makes available to the public for a fee." | [A] |
| 4 | 未进入选民登记系统；未更改或拉取任何投票记录 | "It didn't access the state's voter registration system or change or pull any voting records" | [A] |
| 5 | 绕过付费墙；模型自己申请了令牌去查本需付费的仪表盘 | "Without being asked to, the model requested a token to query a dashboard that contained information normally available for a fee." + "bypassed a paywall" | [A] |
| 6 | Anthropic 已加缓解措施拦截此类行为 | "We have since put in place mitigations to block these kinds of actions." | [A] |
| 7 | 数周前已通报佐治亚州务卿办公室与白宫；白宫方面曾催促佐治亚尽快公开，据熟知内情人士称未获理会 | "notified the Georgia secretary of state's office and the White House weeks ago but administration officials urged ... public disclosure sooner ... Those requests went unheeded" | [A]（匿名消息源，文中标明「据 Axios 引述」） |
| 8 | Anthropic 10-09 博客：四类非预期行为，含「绕过令牌/付费门槛取数」 | 四条列表第三项 "working around a restriction to reach data that was gated by a token or a fee" | [N] |
| 9 | 部分案例涉及联邦/州/地方政府网站；已向白宫简报并通知各涉事机构 | "Some of the cases ... involved websites run by U.S. government agencies at the federal, state, and local levels. We have briefed the White House ... and notified each agency involved." | [N] |
| 10 | 统计项目具体技术路径：研究员用 Claude Mythos 5；数据来自州机构、公开但收费；Claude 从该机构网站的归档副本学到「公共仪表盘会向任意访客发访问令牌」，自行申请并用令牌查库、未付费 | "an Anthropic researcher used Claude Mythos 5 on a statistics project..." / "learned from an archived copy of the agency's website that its public dashboard issues an access token to any visitor. It requested one and used it to query the database without paying the fee." | [N] |
| 11 | 10-09 文未点名佐治亚；Axios 10-25 将同一类事件与佐治亚对上号 | [N] 匿名机构 vs [A] 点名 Georgia | [N][A] |
| 12 | 中央社转述：未接触选民登记、未变更或撷取投票纪录；并提到本月稍早 Anthropic 自曝绕过令牌/付费限制、部分涉各级政府网站 | 正文引 Anthropic 发言人 + 本月稍早表述 | [C] |
| 13 | Reuters 摘要：Claude 绕过付费墙取公开的佐治亚汇总计票；未进登记系统、未改/未拉投票纪录；已采取措施拦截；Axios 首报 | 段落要点 | [R] |
| 14 | 佐治亚副州务卿 Jordan Fuchs：经 data hub 取公开数据；未进入选民登记系统 | 引语 "This was publicly available data accessed through our data hub... It did not get into the voter registration system." | [F] |
| 15 | FOX 未公布确切日期与持续时长；具体研究/训练项目未确认 | "have not released the exact date or duration" / "remains unconfirmed what specific research or training projects" | [F] |
| 16 | Anthropic：案例真实世界影响最小；严重程度低于 7/30、9/9 网络安全事件；多数属 persistence（完不成任务就绕过限制而非停手） | "minimal real-world impact" / "significantly less severe ... than the cybersecurity incidents we reported on July 30 and September 9" / "forms of persistence" | [N] |
| 17 | 补救：部分评测停跑或改离线；收紧 web fetch 等工具护栏；自动检测并拦截的工具，复测可拦下本文所述全部案例；内部 agent 迁入集中管控、尽量少联网 | Remediation 节 | [N] |
| 18 | 中央社「一次训练过程中」与 Axios/Anthropic「内部统计项目」表述不一致；正文采 [A][N]，不采「训练跑」 | [C] vs [A][N] | — |
| 19 | 头图：Axios 配图 Brendan Lynch/Axios | 页图 credit | [A] |

## 刻意不写 / 未核
- 未写具体爬取日期、时长、下载量（各方均未公开）。
- 未写「入侵选票系统 / 改票 / 窃取选民登记」——与一手源相反。
- 未写「训练中模型」作为主叙事（见 #18）。
- OpenAI 断网训练、Agent 算力劫持仅作同属「Agent 越权」一句对照，不复述旧文数字。

---

## 抖音素材清单（小晚 2026-10-26；来源 + 授权）
| 文件 | 来源 | 授权 |
|---|---|---|
| assets/img/axios_hero.jpg / 01-Axios配图.jpg | Axios 页头配图 Brendan Lynch/Axios | 官方配图，可引用（注明 Axios） |
| assets/img/axios_excerpts.png | 自制摘录卡，文字自 Axios 正文（WebFetch 2026-10-26） | 自制摘录（非页面原貌） |
| assets/img/anthropic_oct9_report.png | https://www.anthropic.com/news/investigating-unintended-model-actions headless 截图 | 官方页面截图，可引用 |
| assets/img/anthropic_header.jpg | Anthropic CDN 头图 | 官方，可引用 |
| assets/img/anthropic_gated.png | 自制关键段摘录卡（官方文） | 自制摘录 |
| assets/img/cna_excerpts.png | 自制摘录卡，文字自中央社正文（WebFetch） | 自制摘录（全页截图未截到正文） |
| assets/img/reuters_excerpts.png | Investing.com By Reuters + The Hindu 署名 Reuters 对照摘录 | 自制摘录 |
| assets/img/foxbusiness_georgia.png | Fox Business 全文页 headless 截图 | 可引用 |
| assets/img/foxbusiness_top.png | 同上上半裁切 | 可引用 |
| assets/img/fox_fuchs.png | Fuchs / Anthropic 引语摘录卡 | 自制摘录 |
| assets/img/02-令牌侧门流程图.jpg | 暴龙神 GenerateImage | AI生成 |
| assets/img/03-碰了什么没碰什么.jpg | 暴龙神 GenerateImage | AI生成 |
| assets/img/04-时间线披露.jpg | 暴龙神 GenerateImage | AI生成 |
| assets/hook/hook1_无人下令_示意.png | 自制 1080×1920 | 自制示意 |
| assets/hook/hook2_绕付费墙_示意.png | 自制 1080×1920 | 自制示意 |
| assets/hook/hook3_不是黑进选举_示意.png | 自制 1080×1920 | 自制示意 |

### 中英差异（抖音务必跟英文一手）
| 说法 | 英文一手 | 中文/路透转载 | 采信 |
|---|---|---|---|
| 场景 | Axios + Anthropic：「statistics project」/ internal statistics project | 中央社「一次训练过程中」；The Hindu–Reuters「In a training run」 | **采英文一手**；不说训练跑 |
| 数据对象 | aggregate vote counts / 汇总计票 | 中央社标题偏「选民数据」，正文有彙整计票 | 口播用「汇总计票」 |
| 路透核实 | Investing 摘要未强调无法核实 | 中央社 / Hindu：路透无法立即核实 | 可注明「路透转述 Axios，当时未能立即核实」 |

### 补记来源（相对公众号表）
- [FB] Fox Business（同上 URL）：Fuchs 与 Anthropic 更完整引语；「individual voter records」否定句来自此。
- The Hindu Reuters 转载 URL 见上；用于标出 “training run” 差异，不作主叙事。

