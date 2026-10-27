# sources.md · anthropic-phd-career-reset

所有素材来源与授权/许可状态。数字均附链接。

## 视频
| 资产 | URL / 路径 | 许可 / 授权 |
|------|------------|-------------|
| 完整演讲 | https://www.youtube.com/watch?v=3LZN2UUxDos | YouTube 标准许可；Stanford HAI / PAI26 上传。本地下载仅供剪辑素材，成片需遵守平台与权利人条款。 |
| clip-compute-10Mfold.mp4 等三段 | 由本地 full.mp4 ffmpeg 裁剪重编码（无重绘）。**full.mp4 不在本包** | 同源 |
| YouTube 频道页/标题 | 2026 Conference on Physics and AI: Jascha Sohl-Dickstein | 同上 |

## 幻灯与讲者笔记
| 资产 | URL | 许可 |
|------|-----|------|
| X 线程（讲稿+图） | https://x.com/jaschasd/status/1972360405885637021 | 讲者 **明确授权复用**：「Feel free to reuse them however you like.」(https://x.com/jaschasd/status/1972360504929894448) |
| Google Slides | https://docs.google.com/presentation/d/1qVFDW8qT4CC4E_2TSVevrDbZ_Z9Utu_I1z0-ISLwZts/edit?usp=sharing | 同上线程分享 |
| slide-compute-plot.jpg | https://pbs.twimg.com/media/G16BaRpb0Akajjs.jpg | 同上 |
| slide-career-grad-student.jpg | https://pbs.twimg.com/media/G18zuALbEAA7PE0.jpg | 同上 |
| slide-metr-tasks.jpg | https://pbs.twimg.com/media/G16CjOEb0AEql80.jpg | 同上 |
| slide-title-gdp.jpg | https://pbs.twimg.com/media/G15eGzMb0AU36ma.jpg | 同上 |
| slide-what-to-do.jpg | https://pbs.twimg.com/media/G18yOc9a4AAi5O7.jpg | 同上 |
| slide-use-ai-tools.png | https://pbs.twimg.com/media/G18zUd0agAAYCAt.png | 同上 |
| slide-summary.png | https://pbs.twimg.com/media/G1815YbakAAAQzB.png | 同上 |
| slide-outline.png | https://pbs.twimg.com/media/G15fFi0bIAApXtz.png | 同上 |
| Thread Reader 全文 | https://threadreaderapp.com/thread/1972360405885637021.html | 第三方 unroll；内容来自讲者线程 |

## 图像帧 / 头像 / 媒体图
| 资产 | 来源 | 许可 |
|------|------|------|
| frame-*.jpg | ffmpeg 自 YouTube 录像抽帧 | 同录像 |
| jascha-sohl-dickstein-x-avatar-400.jpg | X 头像 CDN | 平台公开头像；报道合理使用，非商用肖像授权 |
| tencent-hero.jpg | 腾讯新闻文章头图 | 腾讯文内注明「图片经由AI处理」；二次转载需注意平台版权 |

## 中文报道
| 资产 | URL | 备注 |
|------|-----|------|
| 腾讯科技正文 | https://news.qq.com/rain/a/20261020A034MC00 | 2026-10-20；删减实录；**非一手英文** |
| 「一夜清零」类标题 | 二次传播夸张（STATUS 红线） | **非讲者原话**；勿当引语 |
| SMZDM 澄清文 | https://post.smzdm.com/p/a4qxg5wx/ | 说明「读博无意义」非原话 |

## 活动元数据
| 事实 | 来源 |
|------|------|
| PAI26 · 2026-06-10–12 · Paul Brest Hall | https://datascience.stanford.edu/events/center-decoding-universe/c4du-annual-conference/2026-conference-physics-and-ai-pai26 |
| HAI agenda 含本场演讲 | https://hai.stanford.edu/events/conference-on-physics-and-ai-pai26 |

## 数字核对表
| 数字 / 说法 | 本包依据 | 链接 |
|-------------|----------|------|
| ~10 million fold / ~1000万倍（约十年训练算力） | 演讲原话 ASR ~282.9s；腾讯转述一致 | YouTube 3LZN2UUxDos；news.qq.com/...A034MC00 |
| METR 任务时长指数增长 / ~10×/年量级 | 演讲 + 讲者笔记；腾讯「不到一年…约10倍」 | 同 YouTube；X 线程 METR 幻灯 |
| AGI 三年（研究生个人时间线） | 讲者转述一次对话，非共识预测 | YouTube ~1525s；X note_tweet 1972360456670257487 |
| 2030 算力 ~10,000× vs 2025 | Epoch 外推（讲者幻灯/笔记）；腾讯转述 | X 线程 / Google Slides；腾讯文 |
| writing is thinking | Q&A 原话 ~2445s | YouTube；腾讯「写作即思考」 |
| 「一夜清零」 | **无**英文/视频依据 | 媒体标题 only |

## 转写方法
- yt-dlp 自动字幕：多次 HTTP 429，失败（timedtext.xml 为空）。
- 本地：faster-whisper `base`（中间件 `audio16k.wav` 由 full.mp4 抽出，**未随包提交**）。
- 金句以原视频为准；ASR 有误听时对照讲者 X 笔记与腾讯实录。

## 禁止项执行情况
- [x] 无代码生成示意图 / 摘录卡 / 9:16 hook 示意
- [x] 无 script.md
- [x] 无 `full.mp4`（仅本地存档，不进本包）
- [x] Eko 审稿通过（`REVIEW-DOUYIN.md`，2026-10-27）
