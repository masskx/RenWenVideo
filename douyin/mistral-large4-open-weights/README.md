# 自称开源编码第一41分，第三方一测只有25——Mistral Large 4

- 成片：`video.mp4`（1080×1920，30 fps，H.264 + AAC，40.3 秒）
- 模板：`lemo/telestrator`（体育战术板，lemo-opuscar；分镜里写了照搬了它哪些：回放 → 倒带 → 定格画线、白闪 + 推 + 去饱和的定格、脚下光环、荧光笔线、黑底彩边标签卡、角标和来源时钟、比分条翻牌、斜向色带擦除、全片一次的印章）。模板改造：我们跟的一方从荧光黄换成 Mistral 官方柱图的橙 #FF5229，第三方测量用粉笔白，空档用粉笔斜纹不用红；比赛录像换成官方图表截图（真柱子从底部长出来 = 播放，沉回去 = 倒带）；比分条改成「官方自报 | 第三方实测」，翻牌放在第三方数字落地那一拍（高潮）；字幕只留中文；配乐用合成的 tension
- 封面：`cover-9x16.jpg`（抖音 / 视频号全屏）、`cover.jpg`（3:4，小红书）、`cover-6x7.jpg`（6:7，信息流）；标题「自称开源编码第一 / 第三方一测只有25」，辅助句「Mistral Large 4 · 官方自报 41%」
- 字幕：`subtitles.srt`；静帧 `still-XXs.jpg`，总览 `stills-sheet.jpg`
- 分镜：`tutorials/mistral-large4-open-weights.storyboard.md`；事实和出处：`inputs/mistral-large4-open-weights/materials.md`、`sources.md`；审稿：`REVIEW-DOUYIN.md`（Eko 10-30）
- 配音：用户本人的 MiniMax 音色（MashuaiDouyin01，brisk 档 1.12）；配乐 `scripts/generate-score.py`（tension，高潮落在比分条翻成 25 那一拍，前面抽空 0.35 秒，代码合成）。**发布时勾选「内容由AI生成」，不要勾「原创」**（新闻整理解读，含官方图表）
- 画面：Mistral 官方跑分图（Terminal-Bench 4.0、FrontierCode 2.0，官方页实拍，不是重绘）、@MistralAI 的 CHONK 梗图（只当氛围）、HN 热帖截图（用户名已遮）；Artificial Analysis 的数字画在官方图上（AA 页面没截图）
- 口径（审稿红线，全部照办）：官方数字一律带「官方自报」；41% / 19.7% 出现时同屏给出第三方 AA 的 25% / 15%；只说“编码类、官方自报”，不说「全面第一」「最强开源」；参数只说「约 1 万亿」；差距原因只说“可能是设置或版本不同”（AA 页没注明测的是不是 10-29 版权重）；page-* 截图不用
- **不引流**：片中、封面和文案都没有链接、二维码、资料包、评论区关键词、主页

## 抖音

**标题**：自称开源编码第一41分，第三方一测只有25

**文案**：Mistral 放出了 Mistral Large 4 的权重，官方说它是写代码最强的开放权重模型：Terminal-Bench 4.0 41%，比 GLM-5.3 的 40% 多一分。可第三方 Artificial Analysis 的对比页上，它是 25%，GLM-5.3 开低档推理是 35%；FrontierCode 2.0 官方 19.7%，第三方 15%。差在哪官方没说，可能是测试设置或版本不同。实打实的是：权重能下载，约一万亿参数，每百万 token 输入 0.7 美元、输出 2.1 美元。另外它的许可是改版 MIT，做模型服务的公司商用前要另签授权。看跑分，先看是谁测的。

**话题**：#Mistral #开源大模型 #AI新闻 #大模型 #AI编程

## 视频号

**标题**：Mistral 大模型自称开源编码第一，第三方实测只有 25 分

**文案**：10 月 29 日 Mistral 放出 Mistral Large 4（外号 Le Chonk）的开放权重。官方公布：Terminal-Bench 4.0 41%（比预览版高 13 个百分点，GLM-5.3 为 40%），FrontierCode 2.0 19.7%，称其为编码最强的开放权重模型——以上均为官方自报。第三方 Artificial Analysis 对比页（10 月 30 日查看）的数字：Terminal-Bench 4.0 25%（GLM-5.3 低档推理 35%），FrontierCode 2.0 15%（GLM-5.3 低档 13%）；该页未注明测试的是否为 10 月 29 日版本权重，差距原因可能是设置或版本不同。可以确认的：权重已在 Hugging Face 公开，约 1 万亿参数；API 价格每百万 token 输入 0.70 美元、输出 2.10 美元。许可为 Mistral Ecosystem Open-Weight（改版 MIT）：个人和企业可免费使用、修改、微调、商用，但提供模型即服务（MaaS）的公司商用前须另签授权。

**话题**：#Mistral #AI新闻 #大模型

## 小红书

**标题**：Mistral Large 4 开放权重｜官方跑分 vs 第三方实测，差了 16 分

**正文**：

📊 Terminal-Bench 4.0
官方自报：41%（GLM-5.3 40%）
第三方 AA：25%（GLM-5.3 低档推理 35%）

📊 FrontierCode 2.0
官方自报：19.7%
第三方 AA：15%

❓ 差在哪
官方没说，可能是设置或版本不同

✅ 实打实的
权重已开放下载，约 1 万亿参数
每百万 token：输入 $0.70，输出 $2.10

⚠️ 别急着叫它“开源”
许可是改版 MIT：自用、改、微调、商用免费
但做模型服务（MaaS）的公司，商用前要另签授权

👉 看跑分，先看是谁测的

#Mistral #开源大模型 #大模型 #AI新闻 #AI编程 #人工智能

## 出处和素材（只写在这里，不上屏）

- Mistral 官方公告《Mistral Large 4 (Le Chonk) is now open weight》（2026-10-29）：https://mistral.ai/news/mistral-large-4-oss/ （跑分图 © Mistral AI，新闻引用）
- Artificial Analysis 对比页（Eko 2026-10-30 08:48 台北时间核对）：https://artificialanalysis.ai/models/comparisons/mistral-large-4-vs-glm-5-3-low
- Hacker News 讨论《We're releasing the weights of Mistral Large 4》：https://news.ycombinator.com/item?id=50289418 （截图用户名已遮成 [user]）
- @MistralAI 回复帖配图（ABSOLUTE CHONK）：https://x.com/i/status/2115819154335051867
- 字体：思源黑体、Barlow Condensed、IBM Plex Mono（OFL）；音效见 `public/audio/sfx/CREDITS.json`，笔划声 / 快门 / 铅字声是 `scripts/generate-sfx.py` 合成的；配乐自己合成
