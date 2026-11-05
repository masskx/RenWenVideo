# sources.md — openai-images-2-6-gif（抓取于 2026-11-05 Asia/Taipei）

主源：OpenAI《Introducing Images 2.6》https://openai.com/index/introducing-images-2-6/ （标注日期 2026-11-04）  
本地全文：`assets/text/openai-official-full.txt` / `openai-official-jina.md`

| # | 数字/说法 | 口径（必须这样说） | 来源 |
|---|---|---|---|
| 1 | Images 2.6 出图比以前快 **50%** | **OpenAI 官方口径**（Images 2.6 发布页原文："Images 2.6 generates images 50% faster than before."）。未写明对比基线是 2.5 还是更早版本。 | 官方页；本地 full.txt「Faster iteration…」段 |
| 2 | 虎嗅称「50%」其实是 2.5 vs 2.0 的旧说法 | **媒体异议，与官方 2.6 页冲突**；抖音旁白不要跟虎嗅，后期仅内部备注「有媒体质疑，按官网」，片中不展开 | 虎嗅 https://www.huxiu.com/ainews/16075.html ；`text/huxiu.md` |
| 3 | API：**GPT‑Image‑2.6 Flare** 与 **GPT‑Image‑2.6 Sunburst** | **OpenAI 官方口径**；二者为 API 模型名 | 官方页 |
| 4 | Flare 在 quality=low 时最快约 **六秒** 出图 | **OpenAI 官方口径**；限定 low quality（"as little as six seconds"） | 官方页 |
| 5 | Sunburst：更高质量；quality=medium/high 时编辑一致性更好 | **OpenAI 官方口径** | 官方页 |
| 6 | Flare 亦改善海报/产品图等 layout quality | **OpenAI 官方口径** | 官方页 |
| 7 | 全球用户每周经 ChatGPT、Codex、API 创作约 **40 亿** 张图；日均逾 **5 亿** | **OpenAI 官方自述**（"4 billion images per week" / "more than half a billion…per day"），非第三方审计 | 官方页；IT之家/TNW 转述 |
| 8 | 原生 **GIF**：品牌吉祥物、产品循环、reactions and memes、故事板 | **OpenAI 官方口径**；官网未使用中文「表情包」一词 | 官方页「Animate your ideas with GIFs」 |
| 9 | 简单草图可变成有表现力的动画角色 | **OpenAI 官方口径**（"even a simple sketch can become an expressive, animated character"） | 官方页；owl 示例视频/图 |
| 10 | **Image markup**（局部标注修改）从 ChatGPT 进入 API | **OpenAI 官方口径** | 官方页「More ways to create and edit in the API」 |
| 11 | **SVG exports** 便于网站/App/印刷 | **OpenAI 官方口径**；**无配套示例 SVG 文件** | 官方页同段 |
| 12 | 新参数 **complexity**（low/medium/high）控制模型规划量；多数编辑建议 low | **OpenAI 官方口径** | 官方页；`still-ui-complexity.png` / UI-only 视频 |
| 13 | Images 2.6 已在 ChatGPT 与 Codex 全订阅档、桌面/移动/Web **全球可用**（官网页表述） | **OpenAI 官方口径**；勿展开地区/访问方式 | 官方页「Pricing and availability」 |
| 14 | 发布日 2026-11-04；中文媒体多 11-05 报道 | 事实日期 | 官方页；The Verge / 钛媒体 / IT之家 |
| 15 | The Verge：可用提示或上传照片做 GIF；可调播放速度、编单帧、分享 | 媒体转述 + 产品行为描述 | https://www.theverge.com/ai-artificial-intelligence/1026474/openai-chatgpt-animated-gifs-images-2-6 |
| 16 | 钛媒体：速度提升 50%、GIF、Flare/Sunburst、标注、SVG、复杂度、Flare 最快 6 秒 | 与官方一致的中文转述 | https://www.tmtpost.com/nictation/8194220.html |
| 17 | OpenArt / Town / Picsart / Higgsfield / Sable / fal / Figma Weave 等为官网页点名的早期客户或引语 | **官方页面展示的客户案例/引言**，非本账号实测 | 官方页 quotes + CDN 示例图 |

## 抓取备忘
- openai.com 对本机 IP：curl / headless Chrome 常遇 Cloudflare；全文与视频改走 jina、Wayback、Contentful CDN、Vimeo HLS config、OpenAI X。  
- Vimeo 直链 yt-dlp 403；改 `player.vimeo.com/video/{id}/config` → HLS → ffmpeg。  
- 未使用百度热搜；未用代码绘制任何示意图/数据图。
