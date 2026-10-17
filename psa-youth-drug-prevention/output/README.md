# 《青春，别拿健康冒险》（Youth, Don't Risk Your Health）— 校园禁毒公益短片

预防青少年药物滥用主题的原创公益短片，供学校创意作品评选，以及校园公告屏、学校官方视频号、抖音发布。

| 项 | 值 |
|---|---|
| 成片 | `final_video.mp4` |
| 规格 | 9:16，1080×1920，30 fps，H.264（High）+ AAC 48 kHz 立体声，MP4（faststart） |
| 时长 | 见 `qa/report.md`（本版约 81 秒，要求 60–90 秒） |
| 响度 | 约 -14 LUFS（短视频平台常用标准），旁白始终压过音乐 |
| 语言 / 字幕 | 普通话旁白；简体中文字幕已烧录进画面，另附 `subtitles.srt` |

## 目录

```
psa-youth-drug-prevention/
├── output/                 ← 交付物
│   ├── final_video.mp4     可直接提交的成片
│   ├── subtitles.srt       中文字幕（时间轴来自配音逐字时间戳）
│   ├── voiceover.txt       完整旁白稿
│   ├── storyboard.md       分镜脚本（五幕、每个镜头、文字、声音）
│   ├── sources.csv         素材来源：原链接、作者、授权、下载日期、在片中的位置
│   ├── references.md       禁毒 / 用药知识的官方依据，逐句对照
│   ├── project.json        全片的“剧本”：旁白、镜头、文字、音效都在这里改
│   ├── render.py           主程序：一条命令重新渲染整片
│   └── qa/                 检查报告 report.md + 每 3 秒一帧的总览图 contact_sheet.jpg
├── tracks/                 分轨（供剪辑软件二次编辑）
│   ├── video_no_text.mp4   已调色、已剪好、没有任何文字的画面
│   ├── graphics_and_subtitles.ass   全部动态文字和字幕（ASS，可在 Aegisub 等软件里改）
│   ├── notify0.png         “新消息”通知卡（透明 PNG）
│   ├── voice.wav  music_ducked.wav  sfx.wav  mix.wav   旁白 / 已闪避的音乐 / 音效 / 总混音
├── assets/
│   ├── manifest.json       每个下载素材的元数据（标题、页面、授权、下载地址、日期）
│   ├── music/  sfx/        音乐与音效原文件（音效授权见 sfx/CREDITS.json）
│   └── video/              Mixkit 原始 4K / 1080p 视频（约 1.6 GB，未放进 git，见下）
└── tools/fetch_assets.py   素材检索、授权核验、下载工具
```

## 怎么重新渲染

需要：Python 3.10+、FFmpeg（带 libass、libx264）、Pillow；中文字体（Noto Sans CJK SC / 思源黑体；Windows 上可把 `msyh.ttc` 或思源黑体放进 `assets/fonts/`）。

```bash
cd psa-youth-drug-prevention
pip install pillow edge-tts            # edge-tts 只在豆包配音不可用时用作备用
python tools/fetch_assets.py get video 1776 50111 …   # 按 sources.csv / manifest.json 里的编号重新下载原始视频到 assets/video/
python tools/fetch_assets.py search video "campus"   # 想找新素材：检索（列出每条的授权类型；get 只接受 Free 授权）
python output/render.py --draft        # 半分辨率预览（几分钟） -> work/draft.mp4
python output/render.py                # 正式渲染 -> output/final_video.mp4 + 字幕 + 分轨 + QA
python output/render.py --only-qa      # 只重跑检查
```

配音默认用豆包语音（火山引擎）声音复刻：环境变量 `DOUBAO_API_KEY`、`DOUBAO_VOICE_ZH`。不可用时自动换成 edge-tts 的 `zh-CN-YunxiNeural`，并在日志里写明用了哪个。配音按“文本 + 语速”缓存在 `work/tts/`，改了旁白才会重新合成（强制重配：`--force-tts`）。

## 怎么改

全部在 `output/project.json`：

- **改旁白**：改某一幕的 `narration`；字幕、文字出现时机、这一幕的长度都会跟着新配音自动重新排。
- **改语速**：每幕的 `pace`（slow / calm / normal / brisk）。
- **换镜头**：`shots` 里的 `clip`（Mixkit 编号）、`in`（从素材第几秒开始）、`w`（在这一幕里占的比重）、`focus`（竖屏裁切中心，0 = 最左，1 = 最右）、`move`（push / push_fast / push_slow / pull / pan_l / pan_r）、`rack`（开头由虚到实）。
- **改文字**：`overlays`；`"at": "@某个词"` 表示“旁白说到这个词时出现”，也可以写秒数。类型：`ecg` 心电线、`hook` 开场大字、`title` 片名、`notify` 手机通知、`card` 编号提醒卡、`pill` 两行大字、`help` 求助卡、`final` 结尾巨字、`endcard` 结尾口号。
- **调色**：每幕的 `grade`（noir / cold / mono / warm / golden），参数在 `render.py` 的 `GRADES`。
- **音乐 / 音效**：`music`（文件、起止幕、从曲子第几秒开始、音量、淡入淡出）；每幕的 `sfx`。

## 素材与版权（详见 `sources.csv`）

- **视频**：全部来自 [Mixkit](https://mixkit.co/)，只用标为 *Stock Video Free License* 的素材（官方说明：可用于商业与个人项目，无需署名；不得原样转售素材）。Mixkit 上标为 *Restricted License*（仅限个人、非商业）的素材，`fetch_assets.py` 会自动拒绝。原始文件以 4K 下载，竖屏裁切后仍是原生清晰度（`2385`、`32813` 两条只有 1080p，裁切后有放大，画面稍软）。
- **音乐**：Mixkit *Stock Music Free License*——《Echoes》（Andrew Ev）、《A New Life》（Eugenio Mininni）。
- **音效**：Freesound（经 Openverse 检索），CC0 和 CC BY 4.0。CC BY 需署名：**“Deep Cinematic Impact” by MeijstroAudio（CC BY 4.0）**，其余为 CC0。发布时建议在简介里附一句：“音效：Freesound — MeijstroAudio（CC BY 4.0）等；素材：Mixkit”。
- **Pexels / Pixabay**：按要求先试了，但这两个网站对自动访问返回 403，API 需要账户密钥（本环境没有），所以没有从它们下载；如有密钥，可在 `tools/fetch_assets.py` 里加一个来源。
- **没有使用**：任何官方或他人制作的禁毒宣传片画面、网站截图、校徽 / 机构标志、真实 App 界面；“新消息”通知卡是自绘的中性样式。
- 片中出现的人物都是图库模特（Mixkit 素材），不涉及任何真实学生的个人信息。

## 内容合规

- 不出现任何具体药名、剂量、使用方法、获取渠道或药物组合。
- 合法、遵医嘱的用药不被描述为“吸毒”；片中说法是“国家管制的麻醉药品和精神药品，离开医疗用途被滥用，就是毒品”，与《禁毒法》第二条和七部门倡议一致（见 `references.md`）。
- 求助信息：父母、老师、校医 / 心理老师、12355 青少年服务台（共青团主办；各地接通方式略有不同）。

## 已知限制

- 音乐和音效是按授权、时长和响度曲线挑选、混音的，制作过程中没有人工试听；提交前请完整听一遍。
- 配音使用的是本项目所有者在豆包语音上复刻的声音；如果以学生个人名义参赛、需要换成参赛者本人的声音，把 `project.json` 里 `voice.provider` 改成别的值即可回退到 edge-tts，或者直接替换 `tracks/voice.wav` 后重新混音。
- 赛事提交截止日期为 2026 年 10 月 18 日。
