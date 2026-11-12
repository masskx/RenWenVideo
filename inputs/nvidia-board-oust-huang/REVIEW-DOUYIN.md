# REVIEW-DOUYIN — nvidia-board-oust-huang（Eko 独立审，2026-11-12 14:16 Asia/Taipei）

批准：马飞龙于 2026-11-12 13:51（台北时间）原话「1给Eko做抖音」，确认指当日 HN 热榜选题第 1 条。本审只审抖音素材，不写脚本，不联系任何人，不推 GitHub。成片规格：30–40 秒，1.2–1.25 倍速，纯内容收尾。公众号未批准。

## 结论：有条件通过

核心事实已对照一手或权威转述当场重核，与小晚交付口径一致：这是 WSJ 独家报道，不是公司公告；路透／Semafor／CNBC 只写董事会开会讨论、尚未作出决定，不能说已经罢免；盘后跌幅须按来源和时间戳分开引用，不能混成一个数；临时 CEO 的 Semafor 董事消息与路透里的分析师观点不能合并；章程细则 Section 32 过半数在任董事可有因或无因免职高管，11 名董事中 10 名独立；截至小晚采集（14:07）及本审当场复查，公司新闻中心与 SEC 均无针对该报道的官方回应或新 8-K。无代码绘制的数据图或示意图，无百度热搜，推荐画面无二维码、站外引流、资料包或评论诱导。每经「33 名直接下属」未核到，不采用。

本条件通过不等于发布许可，也不等于成片已就绪。开拍前须再查 8-K、新闻中心与主要媒体是否已宣布决定。

## 独立核查方法

- WSJ 正文付费墙，未绕过。核可见区标题与更新时间（本地 `wsj-paywall-visible.txt`：Exclusive | Nvidia Is Preparing to Oust CEO Jensen Huang；Updated Nov. 11, 2026 7:17 pm ET = 2026-11-12 08:17 台北时间；作者 Robbie Whelan、Josh Dawsey、Amrith Ramkumar），并以 Semafor、韩国时报转载的路透稿、CNBC、TechCrunch、The Verge、MarketWatch 本地存档作转述交叉核验。审稿当场成功获取 Semafor、韩国时报／路透转载、CNBC、英伟达新闻中心与 11-08 声明、IR 董事会页、HN 50459703。MarketWatch 当场 401，改用本地 `marketwatch-article-paras.txt`。reuters.com 本身被拦截，以韩国时报转载稿为准。
- SEC：当场重拉 `https://data.sec.gov/submissions/CIK0001045810.json`。cgi-bin 公司提交页当场 403，不以该页为否证。细则 Section 32、FY2026 10-K、2026 DEF 14A 均对照本地官方文本。
- 目视关键可用截图（WSJ 标题裁切、Google Finance 行情裁切、Section 32 裁切、11-08 声明整页），并用 ffmpeg 抽取两条 GTC 官方高光在 0／5／15／30／60 秒的帧，核对路人面孔。
- 审稿对 brief.md、board.csv、materials.md、sources.md 及许可日志做了必要小修，见文末。

## 核实表

| 事实 | 结论 | 一手／权威来源 |
|---|---|---|
| 这是 WSJ 独家，标题为准备罢免，不是公司公告；必须全程「据报道」 | 已核，正确 | WSJ 可见区 Exclusive 标题；Semafor／路透转载／CNBC／TechCrunch／Verge／MarketWatch 均明确归因为 WSJ。英伟达新闻中心无对应公告 |
| 路透／Semafor／CNBC 只说董事会开会讨论、尚未决定；不能说已经罢免 | 已核，正确 | Semafor：directors scheduled to meet Wednesday evening，full board has yet to decide。韩国时报路透转载：meeting late Wednesday to decide whether to oust。CNBC：confirmed late Wednesday the board is meeting to decide whether to oust。审稿当场 CNBC 标题已改为 “…fate stretches into evening”，仍未见宣布决定 |
| 盘后跌幅不可混用：Google Finance 采集快照收盘 $173.73（+2.92%），盘后 $158.78（-8.61%，-$14.95），After hours · 7:59 PM，Closed Nov 11, 4:00:00 PM UTC-5；路透／Semafor「超／约 8%」；CNBC「超 9%」；Verge「超 7%」；每经「一度超 10%，截至发稿收窄至 7.3%」；MarketWatch「about 8%」、常规交易 +2.9% | 已核，与材料一致。不以审稿时点重取新价 | 本地 `google-finance-nvda.txt` 与裁切图 `shot-google-finance-nvda-quote-chart.png`（图上收盘时间写作 UTC-5，文本转储作 GMT-5，时区偏移相同）。韩国时报路透、Semafor、CNBC、Verge、MarketWatch、每经 4645456 各记各的数字。页面自动摘要「过去一个月约跌 25%」未独立核对，不得口播，也不得留在成片画面上 |
| 临时 CEO：Semafor 称部分董事倾向 CFO Colette Kress（若被罢免），董事会尚未决定；路透里 Kress 是 Minotaur Capital 的 Armina Rosenberg 的分析师观点 | 已核，正确。二者不可合并，更不能说 Kress 已被指定 | Semafor 原文 “Some members of Nvidia’s board favor appointing Chief Financial Officer Colette Kress as interim CEO … if CEO and founder Jensen Huang is ousted, according to people familiar with the matter.” 韩国时报路透转载：Rosenberg said Kress would be the natural choice as an interim CEO。Bloomberg 寻访外部公司／Johny Srouji 为二手消息，须单独标注来源。Polymarket／Ian Buck 赔率不采用 |
| 章程细则 Section 32：过半数在任董事可有因或无因免职高管；亦可以在任董事一致书面或电子同意，或经授权的委员会／CEO／上级高管 | 已核，措辞与材料一致 | 2024-03-12 重述细则（10-K 展件仍引用该版；2026 年已列 8-K 未见 Item 5.03 修订）。原文：“Any officer may be removed from office at any time, either with or without cause, by the affirmative vote of a majority of the directors in office at the time, or by the unanimous written or electronic consent of the directors in office at the time, or by any committee of the Board of Directors or by the Chief Executive Officer or superior officers upon whom such power of removal may have been conferred by the Board of Directors.” 不要把 Section 21（股东罢免董事，无因须 66-2/3%）套到免职 CEO。不要说表决已经通过 |
| 11 名董事、除黄仁勋外 10 名独立；首席独立董事而非董事长 | 已核，正确 | 当场阅读 IR 董事会页，11 人名单与材料一致（Tench Coxe、John O. Dabiri、Jensen Huang、Dawn Hudson、Harvey C. Jones、Melissa B. Lora、Stephen C. Neal、A. Brooke Seawell、Aarti Shah、Mark A. Stevens、Suzanne Nora Johnson）。2026-05-08 新闻稿：Nora Johnson 自 2026-07-13 生效，董事会扩至 11 人。2026 代理声明：independent Lead Director, rather than a chairperson；Neal 为 Lead Director |
| 持股 3.58% 是 2026-03-23 代理声明时点，不是 11 月即时持股；路透约 3.6% 是四舍五入 | 已核，正确 | 2026 DEF 14A：Jen-Hsun Huang 870,604,104 股，3.58%；当时流通 24,312,141,810。BlackRock 7.43%、Vanguard Capital Management 7.31%。`shot-sec-proxy-ownership-358.png` 未截到表格，视觉上不可用，数字以文本为准 |
| 关键人风险用 10-K 官方表述；2026 代理声明只写 many senior managers work directly with our CEO；2024 代理声明 “over 60 senior managers…” 是历史官方措辞，不能说成 2026 年现行官方人数；每经「33 名直接下属」未核到，不用 | 已核，正确 | FY2026 10-K：“Additionally, we are highly dependent on the services of our longstanding executive team. Failure to ensure effective succession planning, transfer of knowledge, and smooth transitions involving executives and key employees could hinder our strategic planning, execution, and long-term success.” 2026 代理 Senior Management Development 段；2024 代理摘录 |
| 截至 14:07（及审稿当场）无针对该报道的官方回应，11 月无新 8-K | 已核，仍然成立 | submissions API：11-01 后仅 2026-11-06 Form 4（0001197647-26-000013）；最近 8-K 2026-09-03 item 8.01（0001045810-26-000078）。新闻中心最新相关仍为 11-10 独立董事声明。11-08「The Board has confidence in Jensen and his leadership team」是调查启动当日声明，不是对周三 WSJ 报道的回应。10-28 预告的 11 月 17 日财报电话会不要说成危机回应。若真免职主执行官，原则上应在四个工作日内就 Item 5.02 提交 8-K——开拍前再查 |
| HN 正确主帖是 50459703；50459745 是错号（Perl 旧文） | 已核。brief.md 与 board.csv 已在本审改正 | 当场获取 50459703 标题 “Nvidia is preparing to oust Jensen Huang (wsj.com)”。分数会变：小晚截图约 797 分／1134 评，审稿当场约 807 分／1145 评，不以分数入口播 |
| Wikimedia 黄仁勋照与总部照许可 | 已核，与材料一致 | 审稿用 Commons API 补核采集时 403 的条目：2024 近景 CC BY 4.0（Peter Dasilva／欧盟相关署名）；斯坦福 008／010 CC BY-SA 4.0（Anderseidesvik）；gestikuliert CC BY 2.0（Maurizio Pesce）；20231109 CC BY 2.0（总统府）；总部系列 CC BY-SA 4.0（Coolcaesar／Dicklyon 等）；园区标识 CC BY 2.0（Will Buckner）。成片须按许可署名；CC BY-SA 须 ShareAlike。航拍勿把远处其他园区（如 Apple Park）说成英伟达 |
| 两条 GTC 官方高光：公开可见、商用授权未知；须切路人、不得整条搬运 | 已核，并抽帧补了时间点 | 2026 Keynote Highlights（YT kDd24YOeqQQ，2026-03-20，281s，1280×720，25,020,530 字节）：约 0–10 秒入口路人，约 5 秒为人潮特写；约 15 秒起讲台单人；约 60 秒特写。GTC Berlin 2026（YT rF1EsryCAwc，2026-10-25，239s，14,632,349 字节）：约 5 秒场馆航拍；约 15 秒观众特写、面孔清晰，不可用；约 60 秒机柜前单人可用。退伍军人日官方视频已在 `_excluded/`（含人脸与美国国旗） |
| 不碰婚外情细节、不把 11-08／11-10 声明里的情报／国安定性句口播、不荐股、无引流 | 材料口径正确；11-08 整页截图仍把定性句写在画面上，见下方条件 | 11-08 声明页可见 “foreign intelligence effort”“national security” 等句。每经 4645493 含私情与 ETF／配置价值表述，不用整页、不荐股 |

## 必须遵守的条件（剪辑必须遵守，不是再退回小晚补材料）

1. **全程「据报道」。** 这是 WSJ 独家及后续媒体转述，不是公司公告，也不是已经完成的罢免。禁止说「已被罢免」「董事会已经决定」「临时 CEO 已经是 Kress」。开拍前再查新闻中心、SEC 8-K（尤其 Item 5.02）和主要媒体是否已有决定或公司回应。
2. **盘后跌幅必须带来源和时间戳，不得混数。** 优先用 Google Finance 采集快照：「美东 11 日 19:59 盘后 -8.61%（$173.73 → $158.78）」。若改引路透／Semafor「超／约 8%」、CNBC「超 9%」、Verge「超 7%」或每经「一度 10%、发稿时收窄至 7.3%」，必须说清是哪家、哪个时点。不要把「一度」说成「收在」。不要口播或上屏「过去一个月约跌 25%」，也不要引用路透未经本包核算的市值蒸发数字，或 TechCrunch「五日约跌 11%」（如用须另核）。
3. **Kress 口径分开写。** Semafor＝部分董事倾向其出任临时 CEO（若被罢免），全会尚未决定。路透＝分析师 Rosenberg 的看法。禁止合并成「董事会属意 Kress」。Srouji／外部猎头须标 Bloomberg 等二手来源。不用赔率或类荐股数字。
4. **只讲 Section 32 免职高管**，过半数在任董事、有因或无因；11 人中 10 人独立。不要把股东罢免董事的超级多数（Section 21）套上来，不要暗示表决已过。持股 3.58% 必须带「截至 2026-03-23 代理声明」。关键人风险用 10-K 原话；直接下属只可用「many」或标明年份的 2024 年「over 60 senior managers」，不用每经「33」。
5. **不碰婚外情细节，不做外国情报／政治定性。** 11-08 声明里的 foreign intelligence effort／national security 等句不口播，也不要把含这些句子的整页推上屏；如需「启动独立调查」或「当时对黄仁勋及团队表示有信心」，须另裁不含定性句的句子，或只出标题与日期，并说明那是周日调查启动时的表态，不是对周三报道的回应。11-10 同上，只引用治理相关句。黄仁勋 11-08 致员工信不上整页、不摘私人事由。
6. **Google Finance 裁切 `shot-google-finance-nvda-quote-chart.png` 可用价格与盘后曲线，但须再裁掉图下方「过去一个月约 25%」自动摘要和右侧 Research 提示后再上屏。** 该图是真实页面截图，不是代码绘图。整页 `shot-google-finance-nvda.png` 因新闻标题涉私人和情报，不可用。
7. **两条 GTC 视频公开可见、商用授权未知**：只允许极短引用，标注 NVIDIA 官方 GTC 高光及年份，切掉一切可辨认路人／观众特写（Keynote 片头约 0–10 秒；Berlin 约 15 秒观众特写禁用），不得整条搬运，不得说成「我们实测」。默认不要单独使用未经授权的官方 logo。剪辑若不支持 AV1 可先转码，转码不是画图。
8. **Wikimedia 照片须按许可署名**（CC BY／CC BY-SA 还须 ShareAlike）。园区标识原图约 13.4MB，建议压缩后再进成片。禁止代码画走势图或示意图；官方文档与真实行情截图优先。画面不要出现二维码、站外导流、资料包、评论领取。不荐股。发布若使用 AI 配音／画面须勾选「内容由AI生成」。

## 可用素材清单

优先（官方或已裁敏感信息）：

- `shot-wsj-exclusive-title.png`（Exclusive + 标题，已裁导语）
- `shot-google-finance-nvda-quote-chart.png`（按上面第 6 条再裁）
- `shot-sec-bylaws-section32-removal-crop.png`（及必要时完整页 `shot-sec-bylaws-section32-removal.png`／`shot-sec-bylaws-2024.png`）
- `shot-edgar-8k-index.png`、`shot-nvidia-news-latest.png`（佐证未见新 8-K／未见回应稿，开拍前以复查为准）
- `shot-nvidia-board-default-nocookie.png`、`shot-nvidia-committee-nocookie.png`、`shot-nvidia-about-board.png`、`shot-sec-proxy-leadership-leaddirector.png`
- 11-08／11-10 官方声明：按第 5 条再裁后使用，不整页上屏含定性句的 11-08 页
- `shot-hn-50459703-title.png`（只用标题条）
- 已记录许可的 Wikimedia 人物／总部照（见 materials 表）。`commons-Nvidia_sign.jpg` 可用但须先压缩
- 每经 4645456 早参标题区（`shot-nbd-4645456.png` 若上屏须避开任何荐股或敏感正文）

可选、须标注出处且不作实测：Semafor／TechCrunch／韩国时报路透／MarketWatch 的**标题区**（本包多为整页，成片须自裁标题，不要整页上片）。

视频：`assets/video/nvidia-gtc-2026-keynote-highlights.mp4`、`nvidia-gtc-berlin-2026-highlights.mp4`，按第 7 条短引。

不可用（仓库包已剔除）：`assets/_excluded/` 全部；整页含私情／情报／荐股或未裁评论的截图，包括 `shot-wsj-headline.png`、`shot-google-finance-nvda.png`、`shot-hn-50459703.png`、`shot-cnbc-1111.png`、`shot-semafor-1111.png`、`shot-techcrunch-1111.png`、`shot-verge-1111.png`、`shot-arstechnica-succession.png`、`shot-koreatimes-reuters.png`、`shot-yicai-103437224.png`、`shot-nbd-4645493-localhtml.png`、`shot-nbd-4645493-gov-crop.png`、`shot-nbd-4645493-body-crop.png`、`shot-nvidia-huang-message-1108.png`、`shot-marketwatch-afterhours.png`（无独立标题裁切）、`shot-yahoo-finance-nvda.png`（材料未推荐、本审未作为可用画面）；以及未截到持股表的 `shot-sec-proxy-ownership-358.png`。

## 审稿对材料的小修

1. **改正 HN 编号。** brief.md 与 `/workspace/pipeline/board.csv` 第 179 行 `item?id=50459745` 已改为正确主帖 `50459703`。
2. **brief.md 将「11-09 董事会独立调查声明」改为官方页面日期 11-08。**
3. **materials.md：** 注明 Google Finance 已有裁切仍须再去掉 25% 摘要和 Research 提示；11-08 整页含定性句不得整页上屏；补写两条 GTC 视频抽帧（Keynote 约 15 秒起已是讲台、片头 0–10 秒须切；Berlin 约 15 秒观众特写禁用）。
4. **sources.md 增补审稿当场 EDGAR／新闻中心复查、CNBC 标题更新，以及许可补核说明。** `commons-photo-licenses.txt` 文末写入 Commons API 对原 DL_ERROR 条目的许可复核（与材料已写许可一致，未重新下载图片）。

未写脚本，未改画面文件本身，未推仓库，未联系任何人。
