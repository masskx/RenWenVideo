# 审稿 公众号57 deepseek-superagent（Eko 独立审稿，2026-11-01 00:27 台北）

## 结论：小改后通过（改完 4 条，复审图05即可发）

## 核查
- 事实：对照 DeepSeek 官方公众号原文（assets/text/wechat-official.html，mp.weixin.qq.com/s/zoS7GlReWPhfCjENGxXCdg 已抓到全文）、IT之家 1/020/615、原型 README、DSH releases。正文所有数字与原文一致：3 到 5 个 Session；p50 12.4/p95 15.7 分钟；中性提示 5 次 0 次调用、p95 29.5；优先委派 5 次里 4 次；去掉直通决定 +约30%、读缓存 token 2323 万→3177 万（约37%）；压测 batch 1.0→2.8、2.5→3.9 秒、6.4→1.6 秒；1/4 缩放；异步“已实现但尚未默认开启”；README「Research prototype… not an official DeepSeek product」、MIT。
- 已知问题1：「去掉直通」token 数据与「5次里4次委派」在**官方原文**里有原句，已确认，不用删。但参考资料第1条现在写的是 uied 转载链接，需改为官方原文。
- 声明：“不是正式产品”“合成负载、不衡量单任务能力、仅作初步参考”都写清楚了。✔
- 无引流、无售卖、无求互动。✔ 无「飞龙说」段。✔
- 配图：00、05 为 AI 生成；01–04 为 DeepSeek 原图（04 是 DeepSeek 自己的曲线图，非我方代码出图），无代码作图。✔ 01–04 图注均有「图源：DeepSeek《Super-agent 设计探索》」。✔

## 必改
1. **重出图05**：现在四条「汇报」虚线都指向「共享文件夹」，与正文“Worker 汇报给 Router”矛盾。改成：写稿/审稿/翻译 bot 的「汇报」箭头指回总管 bot；共享文件夹只用实线表示“读写/交接”。仍用 GenerateImage，不要代码画。并给图05加图注，如「▲ 我的 bot 小队，对照双层架构（AI 生成示意图）」。
2. **参考资料第1条**改为：DeepSeek Harness 团队《Super-agent 设计探索：迈向更自主的 Agent 系统》（DeepSeek 官方公众号，2026-10-31）。删掉 uied 链接（转载站，不作来源）。sources.md 同步把“只在 uied 里有”的两条改为“官方原文 7.1 节”。
3. **图片路径**：正文引用 `.辅助资料/素材/57-DeepSeek超级Agent/...`，episode 目录下不存在；改成实际路径（/workspace/sa57/out/57-DeepSeek超级Agent/ 拷进 episode 或改相对路径），保证排版时图能找到。
4. **人设**：通篇“我”可以，但全文没出现「蒟蒻」；开头或 bot 小队一节至少自称一次「蒟蒻」（例：“蒟蒻我现在做这个号……”）。

## 可选
- 封面 00 OK。发文勾 AI 声明，不勾原创（同意暴龙神）。

## 抖音素材审稿（Eko 独立审，2026-11-01 00:29 Asia/Taipei）

**结论：通过，可推 RenWenVideo**（inputs/deepseek-superagent，只推 materials.md、sources.md、assets/；不推 _dup / _勿用 文件夹，不推公众号成品）

- 数字对照官方原文表图 official-24 和全文：Super-agent P50/P95 = 12.4/15.7；单 Session 中性提示 20.4/29.5；提示优先委派 13.8/29.0；读缓存 token 2323 万 vs 605 万，约 3.8 倍；时长按 1/4 缩放（官方图注原文）。全部一致。
- 和公众号 57 对得上：57 引用的单 Session p95 = 29.5，就是同一行的 P95，P50 是 20.4。口播如果说「快近一倍」，要说清楚比的是 P50（12.4 vs 20.4）；不要拿 12.4 去比 29.5。
- 图片：都是 DeepSeek 官方原图、IT之家转载图，或者真实页面截图，没有代码画的图。
- X 截图 4 张：抽查头像和用户名都已模糊；未匿名的原图在 _raw_未匿名_勿用 里，不推。
- 30–40 秒竖版够用：钩子用 official-03（群里没人 @ 它也主动修 PR），核心用 official-07 双层架构，数据用 official-24，口径用 repo 截图（not an official product）。没有视频，剪辑时对静态图做推拉；横版图要竖版重排或加底。
- 没写脚本，符合小晚只找素材的分工。
- 口播必须守住的口径：「架构思路探讨 / 研究原型」，不能说「发布新产品」；实验是合成负载；讲「更快」时要带上「更费 token」；subagent_oar 不等于 Super-agent；「对标 Cursor」是网友观点。
