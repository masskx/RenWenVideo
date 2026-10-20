# 视频号发布包 · 同一句提示词，差一个数量级：DeepSeek V4.1 Flash 1017 vs Opus 5.5 写代码做视频

一句话：DeepSeek 不会生成视频——它和 Opus 一样，是写 Remotion 代码、再渲染成视频；同一个任务便宜一个数量级，但更慢、还有错。缺时间用 Opus，缺钱用 DeepSeek。

| 文件 | 说明 |
| --- | --- |
| `video.mp4` | 9:16 完整版：1080×1920，30fps，H.264 + AAC，53.8 秒，响度约 -15 LUFS，24 MB |
| `video-6x7.mp4` | 6:7 版（1080×1260，从 9:16 版中间裁出，内容完整），信息流按 6:7 显示时用 |
| `cover.jpg` | 视频号封面 3:4（1080×1440），对比型：“同一句提示词，差一个数量级” |
| `cover-6x7.jpg` / `cover-9x16.jpg` | 同一封面按 6:7、9:16 各排一次 |
| `subtitles.srt` | 逐句字幕（画面里已烧录） |

源配置：`tutorials/deepseek-vs-opus55.json` · 分镜：`tutorials/deepseek-vs-opus55.storyboard.md` · 素材切片：`scripts/clips/deepseek-vs-opus55.sh` · 重新渲染：`npm run tutorial:render -- deepseek-vs-opus55 --overwrite --crf=22`
配音：用户本人的复刻音色（豆包 `seed-icl-2.0`，expressive 模型，自动剪气口），每镜按档位变速。原素材声音全部静音。

> 上传前在视频号助手里预览：9:16 版在信息流里是否按 6:7 显示、封面在主页九宫格里是否完整。

## 标题（任选其一）

1. 同一句提示词，DeepSeek 比 Opus 便宜一个数量级——代价是什么？
2. DeepSeek 不会生成视频：它和 Opus 一样，是在写代码
3. 写代码做视频：缺时间用 Opus，缺钱用 DeepSeek

## 作品描述

DeepSeek V4.1 Flash 1017 和 Opus 5.5 做出来的视频，都是模型写 Remotion 代码、再渲染出来的。
同一个提示词，据作者 @marcthecreatorr 自述：Opus 约 20 分钟、约 6 美元；DeepSeek 约 1 小时、0.23 美元，细节更差、有几处错误。
接单赶时间用 Opus；草稿、批量、预算紧用 DeepSeek。你缺的是时间，还是钱？

#DeepSeek #Claude #AI写代码 #Remotion #AI视频 #动效设计 #AI工具

## 置顶评论（作者原帖）

```
片中素材均为公开作品的案例展示，数字为作者自述：
· 开场上：Opus 5.5 · @stephanlivera  https://x.com/stephanlivera/status/2103315922098470926
· 开场下：DeepSeek V4.1 Flash 1017 · @NpieAI（与上一条同一句提示词的中文译版） https://x.com/NpieAI/status/2111452238711587066
· 同题对比（时间与花费）：@marcthecreatorr  https://x.com/marcthecreatorr/status/2111427716142571554
```

## 来源与说明

- **素材**（全部静音、右下角“@作者｜案例展示”）：
  - A：Opus 5.5 · [@stephanlivera](https://x.com/stephanlivera/status/2103315922098470926)（开场上块、结尾上块、封面）
  - F：DeepSeek V4.1 Flash 1017 · [@NpieAI](https://x.com/NpieAI/status/2111452238711587066)（开场下块、结尾下块、封面）；与 A 是同一句提示词（英文原版 / 中文译版），模型档位、渲染工具、耗时未必一致，所以片中只说“同一句提示词”，不说“同条件”。
  - G：Opus 5.5（xhigh）vs DeepSeek 1017（max）同题上下对比 · 原作者 [@marcthecreatorr（Marcel）](https://x.com/marcthecreatorr/status/2111427716142571554)（转发扩散帖 @karanC_12 不作署名）。
- **数字**：只用了素材清单 G 行写明的作者自述——Opus 约 20 分钟、约 $6；DeepSeek 约 1 小时、$0.23；“Opus 动画、声音与细节更好，DeepSeek 接近但有几处错误”。未获得生成日志，也没有独立复现。“便宜一个数量级”由 $6 与 $0.23 直接得出。
- **没有使用**：官方价格表、F 作者自述的 22 分钟 / 1.2 元（A 的耗时花费未知，不能对比）、H / E / I / K 素材（K 是旧版 V4.1 Flash，不是 1017）、J1/J2 盲测（本包未带）、任何“待实测 / 待核实”内容；没有第一人称实测段。
- **音效**：“jp_tinypadlock01.flac” by JPolito，CC0 1.0，https://freesound.org/people/JPolito/sounds/391704 ；其余音效和底乐为本项目合成。
- **授权提醒**：署名不能替代授权。用于商业推广前，建议私信作者取得许可，尤其是 G 这类以完整作品为主体的段落。
