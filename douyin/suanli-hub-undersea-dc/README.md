# 190万人问：AI这么怕热，为什么不把机房沉到海底？——从卫星上看海底机房和八大算力枢纽

- 成片：`video.mp4`（1080×1920，30 fps，H.264 + AAC，33.9 秒，−15.0 LUFS）
- 模板：`lemo/satellite-briefing`（卫星简报，lemo-opuscar；分镜里写了照搬了它哪些：公开领域卫星底图 + 分析员灰、白色细线标注、锁定框、唯一读数色、主张层被扫描条撕掉、俯冲和爬升、测距线、颜色在转折处回来、转录条字幕）。模板改造：读数色换成临港海上平台的橙 #F2913D、主张色换成那张想象图的电光蓝 #1798D4；央视航拍做成挂在定位针上的“近景片”；被撕掉的“地图”换成 190 万次浏览的想象图；沙漠上加了风的流线
- 封面：`cover-9x16.jpg`（抖音 / 视频号全屏）、`cover.jpg`（3:4，小红书）、`cover-6x7.jpg`（6:7，信息流）；标题「AI这么怕热 / 为什么不把机房沉到海底？」，辅助句「中国已经在用了」，锚点是灰阶卫星图上锁住临港的定位针 + 央视平台画面
- 字幕：`subtitles.srt`；静帧 `still-XXs.jpg`，总览 `stills-sheet.jpg`
- 分镜：`tutorials/suanli-hub-undersea-dc.storyboard.md`；事实和出处：`inputs/suanli-hub-undersea-dc/sources.md`、`materials.md`、`transcript/`；审稿：`REVIEW-DOUYIN.md`（Eko 10-28）
- 配音：用户本人的 MiniMax 音色（MashuaiDouyin01，brisk 档 1.12，按策划要求整体偏快）；配乐 `scripts/generate-score.py`（tension，D 小调，约 98 BPM，高潮落在测距线落地「<20 ms」那一拍，撕掉想象图前和落地前各抽空一次，代码合成）。**发布时勾选「内容由AI生成」，不要勾「原创」**（新闻整理解读，含央视画面）
- 画面：NASA Blue Marble + USGS Landsat 卫星底图（公开领域，画面上烧录署名）+ 央视画面（静音、保留台标、「来源：央视新闻」）+ 微软 Natick 官方照片（「Photo: Microsoft」）+ X 帖配图（「X 帖配图 @softlethal」）
- 口径（审稿红线）：「145 条干线光缆」「时延 <20ms」标发改委 2026-06-18（李超），不说是央视 10-27 报的；海南陵水没有真实画面，只在卫星图上落定位针 + 读数「400+ 台服务器」（新华网），没有拿别的画面冒充；不说“微软 2024 年终止 Natick”；临港 → 中卫“约 1,702 km”是两地坐标算的直线距离，屏上标“测算”；八大枢纽之间的连线标“示意”
- 地图合规（`docs/video-craft/平台与合规.md` 第 6 条）：全片不画国界、省界、国家轮廓，不出现“中国地图”字样，只有卫星照片 + 坐标定位针
- **不引流**：片中、封面和文案都没有链接、二维码、资料包、评论区关键词、主页

## 抖音

**标题**：190万人问：AI这么怕热，为什么不把机房沉到海底？

**文案**：X 上一条帖子被看了 190 万次：AI 这么费冷却，为什么不把数据中心建在海底？微软 2018 年真把一个数据中心沉进了苏格兰海底，两年后捞上来，外面裹满海藻和藤壶。中国已经在用了：海南陵水有海底智算舱，上海临港的“海风直连”海底数据中心今年 2 月投产，用海水冷却。不下海的往西搬：宁夏中卫在腾格里沙漠边上，年均 8.8℃，干冷的风直接吹服务器。搬这么远会不会卡？发改委说，已建成 145 条干线光缆，各省到八大枢纽时延都在 20 毫秒以内。

**话题**：#东数西算 #算力 #数据中心 #AI新闻 #海底数据中心

## 视频号

**标题**：AI 机房为什么要沉到海底、搬进沙漠？从卫星上看八大算力枢纽

**文案**：一条“为什么不把数据中心建在海底”的帖子在 X 上被看了 190 万次。微软 2018 年在苏格兰奥克尼海底约 36 米处试过（Project Natick），两年后回收。国内：海南陵水海底数据中心 2023 年首舱下水，2025 年 2 月海底智算舱启用（据新华网，一个舱 400 多台服务器）；上海临港全球首个“海风直连”海底数据中心 2026 年 2 月正式投产（央视新闻），借海降温、向风要电。央视 10 月 27 日报道：宁夏中卫枢纽在腾格里沙漠边缘，8.8℃ 的年均气温让干燥凉风成为天然冷源，直吹冷却服务器；内蒙古和林格尔绿电占比超 85%。国家发改委 6 月 18 日介绍：截至 2025 年底围绕算力枢纽建成 145 条干线光缆，8 大枢纽间互联及全国各省份至 8 大枢纽的网络传输时延均降至 20 毫秒以内。

**话题**：#东数西算 #算力 #AI新闻

## 小红书

**标题**：AI机房沉到海底、搬进沙漠？卫星图看懂“东数西算”

**正文**：

🌊 一个被看了 190 万次的问题
AI 这么怕热，为什么不把机房沉到海底？

🇬🇧 有人真做过
微软 2018 年把数据中心沉进苏格兰海底约 36 米，两年后捞上来，裹满海藻和藤壶

🇨🇳 中国已经在用了
海南陵水：海底智算舱，一个舱 400 多台服务器（据新华网）
上海临港：“海风直连”海底数据中心，2026 年 2 月投产，海水冷却（央视新闻）

🏜 不下海的，往西搬
宁夏中卫在腾格里沙漠边上，年均 8.8℃，干冷的风直接吹服务器（央视新闻）

🔌 搬这么远会不会卡？
已建成 145 条干线光缆，各省到八大枢纽时延都在 20 毫秒以内（国家发改委 2026.06.18）

🛰 片里的底图是 NASA / USGS 的公开卫星影像，只标坐标，不画边界

#东数西算 #算力 #数据中心 #海底数据中心 #AI新闻 #人工智能 #科普

## 出处和素材（只写在这里，不上屏）

- 央视网 2026-10-27《“东数西算”工程算力网加速织就 八大国家算力枢纽节点各展所长》（新闻30分）：画面 `ningxia.mp4` 取自该片 2:13–2:25（裁掉底部新闻条，台标保留）
- 央视《共同关注》2026-02-10 全球首个“海风直连”海底数据中心正式投产：https://tv.cctv.com/2026/02/10/VIDEb3gf8ymTQPtPOIcXn7yB260210.shtml （画面 `lingang-platform.mp4` 取自 0:09–0:21 演播室背景里的平台照片，`lingang-sea.mp4` 取自 1:19–1:33；台标保留）
- 国家发改委 2026-06-18 新闻发布会（李超）：https://www.ndrc.gov.cn/xwdt/wszb/6yxwfbh2026/wzsl/202606/t20260618_1405938.html
- 新华网（转海南日报）2025-02-19 海南陵水海底智算舱：http://www.hainan.xinhua.org/20250219/e7f5b5c27f784fcda8952b42ce86223a/c.html
- 微软 2020-09-14 Project Natick：https://news.microsoft.com/source/features/sustainability/project-natick-underwater-datacenter/ （照片 © Microsoft，摄影 Jonathan Banks / Simon Douglas）
- X 帖 @softlethal（2026-10-27）：https://x.com/softlethal/status/2114954528353067465 （曝光 1,903,751，X API 2026-10-28 12:25 读数）
- 卫星影像：NASA Blue Marble: Next Generation（NASA GIBS，https://gibs.earthdata.nasa.gov）；Landsat 8/9 Collection 2 Level-2（USGS，经 Microsoft Planetary Computer 读取）：中卫 LC09_L2SP_130034_20251013，临港 LC09_L2SP_118039_20251126。均为公开领域；“Landsat imagery courtesy of the U.S. Geological Survey”；“We acknowledge the use of imagery provided by services from NASA's Global Imagery Browse Services (GIBS), part of NASA's Earth Science Data and Information System (ESDIS).” 请求记录：`public/images/suanli-hub-undersea-dc/imagery-manifest.jsonl`
- 字体思源黑体、Barlow Condensed、IBM Plex Mono（OFL）；音效见 `public/audio/sfx/CREDITS.json`；配乐自己合成
