# REVIEW-DOUYIN — nvidia-huang-resigns（Eko 独立审，2026-11-12 23:42 Asia/Taipei）

批准：马飞龙于 2026-11-12 23:10（台北时间）亲口「刚刚，黄仁勋说他要辞职了。你现在赶紧去查这个素材，我要做一个视频」。本审只审抖音素材，不写脚本，不联系任何人，不推 GitHub。成片规格：30–40 秒，1.2–1.25 倍速，纯内容收尾。旧期「据报道董事会准备罢免、尚未决定」的口径已作废，以本包官方声明和 Form 8-K 为准。

## 结论：有条件通过

核心事实已对照官网声明、SEC 8-K 及权威转述当场重核，与小晚交付口径一致：这是董事会宣布并接受辞职，不是「黄仁勋亲口宣布」，也不是「已经罢免」。事件日为美东 11 月 11 日，公告日为 11 月 12 日。临时 CEO 为 Colette Kress（兼任 CFO），Harvey C. Jones 为公司首位董事会主席。股价三个时点必须分开引用，本审自行核算与材料一致。建议上片的静帧均为真实网页或官方／Wikimedia 原图，未见代码绘制的走势图或示意图。无百度热搜，推荐画面无资料包或评论诱导。私生活和涉谍只允许「据报道」一句。

本条件通过不等于发布许可，也不等于成片已就绪。

## 独立核查方法

- 当场重新获取并阅读：英伟达新闻中心 https://nvidianews.nvidia.com/news/nvidia-announces-ceo-transition ；SEC 8-K https://www.sec.gov/Archives/edgar/data/1045810/000104581026000082/nvda-20261111.htm 及索引页；`data.sec.gov/submissions/CIK0001045810.json`；联合早报 https://www.zaobao.com.sg/finance/world/story20261112-9989479 ；BBC https://www.bbc.com/news/live/c6zjry11v8w1t ；财联社 https://www.cls.cn/detail/2533121 ；Hindu Business Line 转载路透 https://www.thehindubusinessline.com/info-tech/nvidia-ceo-jensen-huang-to-step-down-in-big-blow-to-ai-boom/article71694311.ece 。
- 对照本地官方文本（新闻稿、8-K、Exhibit 99.1）与真实截图；自行计算开盘／盘前／盘中跌幅；目视建议上片截图；用 ffmpeg 抽取两条 no-crowd 视频在推荐段与避开段的静帧。
- 11 月 12 日美股审稿时仍在盘中，不以新报价替换本包采集快照。对 sources.md 作了一处时序补记，见文末。

## 核实表

| 事实 | 结论 | 一手／权威来源 |
|---|---|---|
| 官网声明 *NVIDIA Announces CEO Transition*，日期 November 12, 2026；Board of Directors announced today that Jensen Huang has resigned as President, CEO and a member of the Board, effective immediately | 已核，正确 | 当场阅读新闻中心页，与 Exhibit 99.1、本地 `nvidia-ceo-transition.txt`、截图 `shot-nvidia-ceo-transition.png` 一致。声明未给出辞职原因，也未引用黄仁勋本人的话 |
| 8-K Item 5.02：On November 11, 2026, the Board … accepted the resignation of Jen-Hsun Huang … effective immediately；Filing Date / 签署日 November 12, 2026；Accepted 2026-11-12 08:52:41 美东（= 台北 21:52:41）；Period of Report 2026-11-11；Acc-no 0001045810-26-000082；Items 5.02、9.01 | 已核，正确 | 当场阅读 8-K 正文与索引页；submissions API acceptanceDateTime 2026-11-12T13:52:41.000Z。本地渲染截图 `shot-edgar-8k-item502-crop.png` 可见接受辞职原文及 Exhibit 99.1 dated November 12, 2026。成片须注明来源是 SEC 8-K，不要假装成「当时在线 EDGAR 浏览页」 |
| Kress（8-K 写 Colette M. Kress，公司自报 59 岁）任 Interim CEO，担任临时 CEO 期间继续兼任 EVP 兼 CFO；董事会启动正式遴选，新闻稿写 will consider internal and external candidates；Kress 自 2013 年 9 月起任 CFO | 已核，正确 | 8-K Item 5.02 与新闻稿。年龄、入职年份为公司自报。官网 leadership 页截稿时职务行仍为 EVP and CFO，成片以新闻稿／8-K 为准 |
| Jones（Harvey C. Jones，公司自报 73 岁，1993 年起任董事）被任命为 first-ever Chair of the Board；曾任新思科技 CEO 兼执行董事长 | 已核，正确 | 8-K 与新闻稿。官方肖像仅 145×181，leadership 页无照片，能用但须接受低分辨率 |
| Q3 FY2027 财报 11 月 17 日约 1:20 p.m. PT，随后电话会 2 p.m. PT，as previously scheduled | 已核，正确 | 新闻稿末段／Exhibit 99.1。不要说成因辞职改期或加开 |
| 前收 11 月 11 日 $173.73 | 已核 | 本包 Google／Yahoo 页 Previous Close，以及兄弟期 Google Finance 快照、Yahoo chart `chartPreviousClose` |
| 盘前：联合早报转述路透，截至晚间 22:11（台北＝美东 09:11，开盘前）跌 11.06%，报 $154.51 | 已核。自行计算 (154.51−173.73)/173.73 = **−11.063%**，四舍五入即 11.06% | 当场阅读早报正文，与裁切 `shot-zaobao-premarket-1106.png` 一致。BBC 与 Hindu／路透转载另写盘前跌超 10%，时点粗于早报。早报正文「黄仁勋宣布将辞去」与 8-K「董事会接受辞职」不符，**不采用该动词**；「近五个交易日跌 13.19%、近一个月 24.23%」未独立复核，不用 |
| 开盘：BBC 写 shares plummeted more than 13% as US markets opened；Google Finance 当日 Open **$151.01**，相对前收 $173.73 为约 **−13.08%** | 已核。自行计算 (151.01−173.73)/173.73 = **−13.0778%**，约 −13.08%，与 BBC「开盘跌超 13%」方向一致 | BBC Summary 第二条，裁切 `shot-bbc-summary-13pct-crop.png` 可见该句；当场直播页仍保留此条。Open $151.01 以 `shot-google-finance-nvda-quote-crop.png` 为准（页面时钟 10:17:18 AM UTC-5）。HTML 转储早于截图约 4 分钟，其中可见 Open $151.00，不以转储替换截图 |
| 当日低点 Low $148.80（约 −14.35%）不要和「开盘跌超 13%」混成一句 | 已核。自行计算 (148.80−173.73)/173.73 = **−14.350%** | 同一张 Google 截图 |
| 盘中约 −6%：Google $163.46，−5.91%（−10.27），10:17:18 AM ET；Yahoo $163.19，−6.07%（−10.54），As of 10:18:33 AM EST，Market Open | 已核。自行计算分别为 **−5.911%**、**−6.067%** | 真实页面裁切，非自绘。不要把盘中约 −6% 说成开盘跌超 13%。Yahoo 1 分钟数据 09:30 ET 第一分钟收约 $149.27（开 $149.29），仅作交叉、不上自绘走势图 |
| 国内快讯时点：财联社 21:50:08、新华网 21:59:14、中新网 22:09:11 | 已核，正确 | 当场阅读财联社，表述接近官方。新华、中新网标题／导语与材料一致。中新网 22:09 整页群像不用 |
| 私生活／涉谍：官方未给原因；外媒有报道 | 材料口径正确 | 只允许「据报道」一句，不展开、不上细节图文。BBC／Guardian 英雄标题或正文含 affair/spy，不整页上片 |

## 必须遵守的条件（剪辑必须遵守，不是再退回小晚补材料）

1. **动词只用「董事会宣布其辞职／董事会接受辞职」。** 不用「黄仁勋亲口说」「黄仁勋宣布将辞去」，不用旧口径「准备罢免／已经罢免」。官方用的是 accepted the resignation。须分清：8-K 所写接受日是美东 11 月 11 日，公告／新闻稿／签署日是 11 月 12 日。
2. **Kress 是临时 CEO 并兼任 CFO**，直至正式继任者确定；遴选「内外部候选人都考虑」。Jones 是公司**首位**董事会主席。年龄 59／73 如用须标 8-K 公司自报。不要把未更新的官网简历标题说成「公司现在只承认她是 CFO」。
3. **股价必须分盘前／开盘／盘中，带来源和时间戳，不得混数。** 盘前 11.06%／$154.51 跟联合早报（转述路透，台北 22:11／美东 09:11）；开盘跌超 13% 跟 BBC + Google Open $151.01（约 −13.08%）；盘中约 −6% 跟本包美东 10:17–10:18 截图（Google −5.91%，Yahoo −6.07%）。不要把低点 −14.35% 与开盘 13% 混成一句。不荐股，不报目标价。不用「过去一个月」或早报五日／一月跌幅。11 月 12 日若开拍时美股已收盘或行情已变，仍应标明这是采集快照，不要把新价说成本包已核数字。
4. **官方没给原因。私生活和涉谍只允许「据报道」一句**，不展开细节，不上相关图文。BBC、Guardian、联合早报整页、中新网 22:09 群像整页都不要上片，只用已裁切的中性标题／数字区。
5. **Google Finance 裁切可用价格与 Open 字段，但须再裁掉图下方 “NVIDIA declined sharply over the past month” 自动摘要后再上屏。** 该图是真实页面，不是代码绘图。官网声明页右侧媒体邮箱成片宜再裁掉。新华／中新网标题裁切上的分享图标尽量避开。Hindu 转载裁切须标明「Hindu Business Line 转载路透」；稿中将 Synopsys 拼成 Synopysys，不要照抄错拼。
6. **GTC 视频公开可见、商用授权未知：** 只允许极短引用，署名 NVIDIA 官方 GTC 高光及年份，不得整条搬运，不得说成「我们实测」。文件名含 `-no-crowd` **不代表已清干净**。上片只能用 materials.md「watchVideo 复核」列出的推荐单人时间码（时间码针对 no-crowd 文件本身）：Keynote no-crowd 推荐 0:26–0:30、0:47–0:54、2:00–2:04、3:08–3:12；Berlin no-crowd 推荐 0:06–0:07、1:02–1:04、2:07–2:13、3:03–3:09。审稿抽帧已确认 Keynote 推荐段为黄仁勋单人、1:32 与 Berlin 3:19 为清晰观众特写，必须避开。截取时尽量避开幻灯上的第三方 logo 墙（Berlin 2:07–2:13 背景可见合作方标识）。原片时间码见 materials 上表，两套时间码不要混用。
7. **Wikimedia 照片须按已记录许可署名**；官方肖像须可署名英伟达新闻中心，商用授权未知。`commons-Nvidia_sign.jpg` 约 13.4MB，建议压缩后再进成片。禁止代码画走势图或示意图。画面不要出现二维码、站外导流、资料包、评论领取。发布若使用 AI 配音／画面须勾选「内容由AI生成」。财报安排不要说成危机回应。

## 可用素材清单

优先：

- `shot-nvidia-ceo-transition.png` 或 `-main.png`（主证据；宜再裁媒体邮箱）
- `shot-nvidia-news-latest.png`
- `shot-edgar-8k-item502-crop.png`（注明 SEC 8-K 本地渲染）
- `shot-cls-2533121-crop.png`、`shot-xinhua-title.png`、`shot-xinhua-body-hq.png`、`shot-chinanews-10731222-title.png`
- `shot-google-finance-nvda-quote-crop.png`（按第 5 条再裁）、`shot-yahoo-finance-nvda-quote-crop.png`
- `shot-zaobao-title.png`、`shot-zaobao-premarket-1106.png`（只要数字句，不要整页错误口径）
- `shot-bbc-summary-13pct-crop.png`、`shot-hindu-reuters-lede-crop.png`（按第 5 条标注）
- 官方肖像：`nvidia-official-jensen-huang-gray.jpg`（或 `-black.jpg`）、`nvidia-official-colette-kress-1920.jpg`、`nvidia-official-harvey-jones.jpg`（低分辨率）及对应简历页截图
- 已记录许可的 Wikimedia 人物／总部照

视频：优先按第 6 条从 no-crowd 文件抽推荐段；也可按 materials 原片时间码从 AV1 原片抽同一内容。两版都不要整条搬运。

不可用（推库包已剔除敏感整页；剧集目录仍保留备查）：`assets/_excluded/` 全部；`shot-bbc-live.png`／`-full.png`、`shot-guardian-resigns.png`／`-full.png`、`shot-zaobao-9989479.png`／`-full.png`、`shot-chinanews-10731222.png`／`-full.png`、`shot-hindu-reuters.png`、以及未再裁自动摘要的 Google 整页。中新网 10731212 整页不是 brief 指定的 22:09 稿，标题裁切可用。

## 审稿对材料的小修

1. **sources.md 增补审稿补记：** 写明 Google Finance HTML 转储早于 10:17:18 截图，Open $151.01／盘中 $163.46 以截图为准；并记录当场重核的 8-K 接受时间与主要页面。

未写脚本，未改画面文件本身，未推仓库，未联系任何人。
