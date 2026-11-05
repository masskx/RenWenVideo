# openai-images-2-6-gif 抖音素材（仅素材，不含脚本）
批准：2026-11-05 10:07 马飞龙原话「批准做抖音」（见本目录 STATUS.txt / board.csv）
整理：小晚 2026-11-05（Asia/Taipei）。所有数字见 sources.md。
官方源：https://openai.com/index/introducing-images-2-6/（2026-11-04 产品发布页）

**口径总则**：只讲功能效果；不写如何访问 ChatGPT、不提翻墙/代理/带货；数字一律标「OpenAI 官方口径」；虎嗅对「50%」的异议已记入 sources，**以官方发布页原文为准**。

---

## 一、官方发布页（全文 + 截图）
| 文件 | 内容 | 建议用途 | 注意 |
|---|---|---|---|
| `assets/text/openai-official-full.txt` | Wayback 清洗后的官方全文（含 50%/Flare/Sunburst/4B/GIF/markup/SVG） | 核对数字、写旁白依据 | 首字母被 Wayback 切碎（如 W e’re），语义完整 |
| `assets/text/openai-official-jina.md` | jina 抓取的发布页 markdown | 同上备份 | openai.com 对本机 curl/headless 常 403，故走 jina/wayback |
| `assets/text/openai-official-page.html` | 早期页面片段 HTML | 溯源 | 非完整渲染页 |
| `assets/img/shot-openai-official-top.png` | Wayback `id_` 镜像顶部截图，可见标题、50%、4 billion、Flare/Sunburst、六秒等原文 | 开场/论据卡 | 视频位显示 Loading（镜像未加载 Vimeo）；勿当「页面无演示」 |
| `assets/img/openai-social-images-2-6.png` | 官方 OG/社媒横图（Contentful CDN） | 封面/转场 | 官方原图 |

## 二、官方演示视频（均 <30MB）
| 文件 | 时长/体积 | 内容 | 建议用途 | 注意 |
|---|---|---|---|---|
| `assets/video/openai-x-intro-images26-720p.mp4` | ~35s / 4.1MB | OpenAI 官方 X 介绍片：多组循环 GIF（猫/蛙/鸡等） | **主片推荐** | 无人脸；来自 @OpenAI 帖 |
| `assets/video/openai-x-gif-demo.mp4` | ~2s / 205KB | X 上短 GIF 演示 | 表情包/循环感特写 | 极短，可循环播 |
| `assets/video/vimeo-gif-montage.mp4` | 7s / 247KB | 发布页「A montage of animated scenes」 | GIF 合集蒙太奇 | 官方 Vimeo 1242918503 |
| `assets/video/vimeo-owl-animation.mp4` | 1.8s / 44KB | 草图猫头鹰 → 动画 | **草图变动画** 核心 | 官方 Vimeo 1242957231；极短可循环 |
| `assets/video/vimeo-openart-market-down.mp4` | 1.2s / 45KB | OpenArt 股市下跌 chibi GIF | 表情包/反应 GIF | 官方示例 |
| `assets/video/vimeo-openart-market-up.mp4` | 1.2s / 44KB | OpenArt 股市上涨 chibi GIF | 同上成对使用 | 官方示例 |
| `assets/video/vimeo-town-monty.mp4` | ~ / 172KB | Town 角色 Monty 动画 | 品牌吉祥物动画 | 官方合作方示例 |
| `assets/video/vimeo-latency-comparison.mp4` | ~ / 106KB | 速度/延迟对比演示 | 配合「快 50% / Flare 约六秒」 | 画面需对照旁白，勿自行读出未标注数字 |
| `assets/video/vimeo-editing-demo-ui-only.mp4` | ~46s / 1.0MB | 官方剪辑演示**去人头段**：锦鲤 GIF、复杂度三档、静物编辑等 UI | **连续改图 / 局部编辑 / 复杂度** | 原完整版含真人出镜，已放 `_excluded` |

静帧（从演示抽出，便于定格）：
- `assets/img/still-x-intro-gifs.png` — X 介绍片多 GIF 并排
- `assets/img/still-gif-montage.png` — 蒙太奇一帧
- `assets/img/still-ui-koi-gif.png` —「锦鲤」提示→动图 UI
- `assets/img/still-ui-complexity.png` — Multiple complexity levels 三档对比
- `assets/img/still-ui-stilllife.png` — 静物高质量成片 UI

## 三、官方示例静图 / Poster（Contentful CDN 原图）
| 文件 | 内容 | 建议用途 |
|---|---|---|
| `gif-montage-poster.jpg` | GIF 蒙太奇封面 | 片头 |
| `owl-animation-poster.jpg` / `owl-sketch-square.png` | 猫头鹰草图→动画海报 / 草图方图 | **草图变动画** |
| `openart-market-up-poster.jpg` / `openart-market-down-poster.jpg` | 涨跌表情包海报 | 循环 GIF /「反应图」 |
| `town-monty-poster.jpg` | Town Monty | 吉祥物 |
| ~~`editing-poster.jpg`~~ | 已移入 _excluded（真人正脸，Eko 审） | — |
| `luxury-travel-poster.jpg` | 旅行视觉海报 | 专业视觉 |
| `higgsfield-scene-edit-1/2/3.png` | Higgsfield 场景连续改图三连（红发战士同角色换场景） | **连续改图一致性**（插画角色脸，非真人） |
| `sable-product-visual.png` | Sable 产品视觉 | 产品图 |
| `picsart-glass-whale.png` | Picsart 玻璃鲸鱼 | 合作方示例 |
| `images-2-6-fal-before.png` / `images-2-6-fal-after.png` | fal 前后对比 | 编辑前后 |
| `x-flare-sunburst.jpg` | X 图：Flare vs Sunburst | API 两档命名 |
| `x-gif-demo-thumb.jpg` / `x-intro-video-thumb.jpg`（x-reference-images.jpg 含写实人脸，已移入 _excluded） | X 帖缩略图 | 补充 |

## 四、媒体报道（全文 + 截图）
| 媒体 | 全文 | 截图 | 备注 |
|---|---|---|---|
| The Verge | `text/theverge.md` | `img/shot-theverge.png` | 主外媒；标题强调原生 GIF；作者头像区 YuNet 未检出（页面 cookie 条遮挡较多） |
| The Next Web | `text/tnw.md` | `img/shot-tnw.png` | 转述 Verge + 40 亿；已模糊 1 处人脸 |
| 钛媒体 | `text/tmtpost.md` | （未单独截钛媒体页，可用文内数字交叉） | 中文短讯，数字与官方一致（50%、6 秒、Flare/Sunburst） |
| IT之家 | `text/ithome.md` | `img/shot-ithome.png` | 转 Verge；已模糊 1 处；全文较短 |
| 凤凰科技 | `text/ifeng.md` | `img/shot-ifeng.png` | 转 Verge；全文短 |
| 虎嗅 | `text/huxiu.md` | `img/shot-huxiu.png` | **异议源**：称「50%」是 Images 2.5 vs 2.0 的旧表述。与官方 Images 2.6 页原文冲突 → 采用官方页，虎嗅仅作对照 |

优先引用：官方页 > The Verge / 钛媒体；虎嗅数字段落勿直接当旁白。

## 五、_excluded（勿用）
- `assets/_excluded/vimeo-editing-demo-unblurred.mp4` — 含 OpenAI 出镜真人正脸约 40s
- `assets/_excluded/shot-openai-wayback.png` — Wayback 完整页中段滚偏（LifeVal 装饰区），信息密度低

## 六、建议叙事锚点（素材侧，非脚本）
1. **循环 GIF / 反应图**：X 介绍片 + OpenArt 涨跌 GIF + gif-montage  
2. **草图变动画**：owl sketch → vimeo-owl-animation  
3. **更快**：官方「50% faster」+ Flare「as little as six seconds」（低质量设置）+ latency 视频  
4. **连续改图更稳**：higgsfield 三连 + editing UI-only  
5. **API 能力点名**：Flare / Sunburst；markup 局部圈选；SVG 导出；complexity 参数（仍有静帧）

## 缺口
1. **无独立 SVG 导出示例图/文件**：官方只文字声明 “SVG exports…”，发布页与 CDN 未见可下载的 SVG 成品示意；讲 SVG 只能口述+截文字，或标缺口。  
2. **官方页 live 截图受 Cloudflare 阻挡**：现用 Wayback `id_` 顶栏截图；视频嵌入为 Loading。  
3. **「表情包」非官方用词**：官方写的是 reactions / memes / brand mascot GIFs；中文可说「反应图/表情 GIF」，勿谎称官网写了「表情包」。  
4. **局部圈选（markup）无单独特写视频**：仅有文字 + editing UI 片段间接体现；无「画圈改这里」的高清专项演示。  
5. **TechCrunch / 36氪 / 量子位**：本轮未收入可用全文+截图（The Verge + TNW + 钛媒体/IT之家/凤凰已覆盖中英）；若 Eko 要三家指定媒体可再补。  
6. **虎嗅与官方「50%」口径冲突**：必须以官方 Images 2.6 页为准，并在片中标「OpenAI 官方口径」。

## 风险
- 把「每周 40 亿张」说成第三方审计数据 → 实为 OpenAI 自述。  
- 把 Flare「六秒」说成所有模式 → 原文限定 quality=low。  
- 把 Sunburst/Flare 讲成 ChatGPT 里两个按钮 → 原文是 **API** 模型名。  
- 播出镜未打码版 editing-demo。  
- 任何「怎么打开 ChatGPT / 地区限制 / 代理」内容。
- `assets/_excluded/editing-poster.jpg` — 真人正脸（Eko 审时移出）
- `assets/_excluded/x-reference-images.jpg` — 写实人脸自拍示例（Eko 审时移出）
