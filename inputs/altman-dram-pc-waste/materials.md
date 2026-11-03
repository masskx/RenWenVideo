# altman-dram-pc-waste 抖音素材（仅素材，不含脚本）
批准：2026-11-03 10:35 马飞龙原话「批准只做抖音」（见 STATUS.txt / board.csv）
整理：小晚 2026-11-03（台北时间）。所有数字见 sources.md。

## 一、原话（核心）
- 视频：`assets/video/altman-cheekypint-2900-2955.mp4`（720p，55 秒，3.1MB）= 原片 29:00–29:55。
  - 原话在片段内约 **0:12–0:44**（原片 29:12–29:44）；"5% of the time" 约在片段 0:35 前后（Collison 插一声 "Mm-hmm" 后）。
  - 画面：奥特曼正脸 + Collison 背影/侧脸（均为公众人物）。无字幕，需要后期自己上中文字幕。
  - 静帧：`assets/img/frame-altman-2920.png`
- 逐字稿 + 中译 + 上下文：`assets/text/altman-quote-transcript.md`；全集自动字幕 `assets/text/cheekypint-autosub-en.vtt`
- **口径**：5% 是奥特曼随口估计，没给依据；他说的是"从全球分配角度"，不是 OpenAI 政策，也没说要限制个人电脑。

## 二、媒体报道（全文 + 页面截图）
| 媒体 | 全文 | 截图 |
|---|---|---|
| MetaPatchAI（逐字稿+"已证实/未证实"） | text/metapatchai-com.txt | img/shot-metapatch-top.png |
| TechSpot（"DRAM 成本涨五倍"） | text/techspot.txt | img/shot-techspot-top.png |
| TNW（两天后见三星社长） | text/thenextweb-com.txt | img/shot-tnw-top.png（有 cookie 弹窗；配图为三星会场，里面三星高管人脸较小，如用需模糊）|
| 凤凰/机器之心（中文） | text/tech-ifeng.txt | img/shot-ifeng-top.png（已裁掉下方带用户名的评论截图）|

## 三、HBM vs DDR、晶圆产能（真实图 + 数据）
- SK 海力士官方新闻室实拍图（官方展台/产品，可用）：
  - `skhynix-official-hbm4-48gb-16hi.png` HBM4 16 层 48GB
  - `skhynix-official-hbm4-vera-rubin.png`、`skhynix-official-hbm3e-blackwell.png` HBM 贴在 GPU 旁
  - `skhynix-official-hbm-gpu-model.png`、`-hbm-gpu-model-2.jpg` GPU+HBM 堆叠结构放大模型（最直观）
  - `skhynix-official-hbm-zone-mwc.jpg`、`-ai-dc-memory-mwc.jpg`、`-hbm-dtw-booth.png` 展区
- 截图：`shot-toms-micron-3x.png`（美光：同容量 HBM3E ≈ DDR5 的 3 倍晶圆）、`shot-trendforce-hbm-wafer.png`（HBM 占 22% 晶圆只出 9% 位元）
- 全文：text/toms-micron-3x.txt、trendforce-hbm-wafer.txt
- **讲法**：电脑内存条（DDR5）和 AI 卡上的 HBM 不是同一种东西，不能互换；抢的是上游同一批 DRAM 晶圆产能——HBM 每 GB 吃掉约 3 倍晶圆，原厂把产能转去 HBM/服务器，普通内存就少了。（凤凰原文也是这个说法）

## 四、「RAM 大赦换订阅」谣言
- 出处：10-31 X 上一则恶搞帖（"BREAKING: openai launches 'ram amnesty'…you get a $200/month subscription to use your own ram"）。
- 辟谣：动区动趋 10-31《OpenAI 被造謠…是假的》：OpenAI 官网和官方账号都没有回收内存计划。
- 素材：`shot-blocktempo-title.png`（标题），`shot-blocktempo-parody-quote.png`（恶搞原文，账号名已模糊）；全文 text/blocktempo.txt
- 原 X 帖未单独截图（发帖人非公众人物，按规则不露账号）。动区配图是奥特曼把内存条塞进机器的合成图，**不用**（已放 _excluded）。
- **讲法**：明确说"这是网友恶搞，不是真的"，不能当新闻讲。

## 五、内存涨价（带日期）
- `shot-trendforce-4q26.png` TrendForce 09-30：4Q26 一般 DRAM 合约价季增 10–15%
- `shot-sina-434pct.png` IT之家/新浪 10-15：某款 32GB DDR5 英国亚马逊 13 个月涨 434.2%
- `shot-yicai-hqb.png` 第一财经/央视财经 10-26：华强北 32G DDR5 2000–3000 多元，销量降 20–30%
- 全文：text/trendforce-4q26.txt、trendforce-tw-oct-contract.txt、sina-434pct.txt、yicai-hqb.txt、toms-ddr5-450.txt
- **注意**：涨幅在收敛（2Q≈80%→3Q≈40%→4Q≈10–20%），现货已有松动；别说"还在暴涨"。

## 六、_excluded（勿用）
- shot-ifeng-uncropped-有用户名.png、shot-blocktempo-full-含用户名和疑似合成配图.png、skhynix-06/07/08-有人脸

## 缺口
- 播客无官方中文字幕；片段需后期自配字幕。
- 没有 Cheeky Pint 官方 transcript 页面截图（用 MetaPatchAI 转引 + YouTube 自动字幕交叉核对）。
- 三星/美光官方 HBM、DDR5 图未单独收（只有 SK 海力士官方图 + 美光演讲报道截图）。
- 国内内存价格只有媒体走访报价，无权威价格指数截图（CFM 闪存市场 10-20 周评可补，未截图）。
- 90 万片晶圆/约 40% 只有二手汇总来源，建议不用或找 2025-10 OpenAI 原公告再用。

## 风险
- 把 5% 说成事实/数据 → 必须标"他随口说的"。
- 把"应集中到云端"说成"OpenAI 要收走你的内存" → 原话无政策含义。
- 把恶搞当新闻。
- "DRAM 涨五倍"是 TechSpot 说法，"434%"是单一型号，都要带出处、不说成全市场。
