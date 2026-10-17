# 视频号发布包 · 会动，不等于看懂：AI 做科普视频的一条规矩

最近很火的 Anatomy Skill 主张“物体本身，就是解释”：一句话，让 AI 把一个原理做成一台能转、能拆、能拧发条的模型。数字生命卡兹克用它跑了好几个，发现动画再漂亮，门外汉也看不懂；他的办法是让 AI 在动画旁边加上讲解和配音。这条片子用**用户自己的视角**重讲这件事：同一台机芯贯穿全片，先“只会动”，再挂上三个问号，再用四个问题（这是啥 / 在发生啥 / 为什么 / 有啥用）按顺序讲一遍机械表怎么计时，最后落到我们自己做片的规矩——**说到哪个零件，画面上就只让那个零件动**。

| 文件 | 说明 |
| --- | --- |
| `video.mp4` | 9:16 完整版：1080×1920，30fps，H.264 + AAC，152 秒（2:32），响度约 -15.7 LUFS |
| `video-6x7.mp4` | 6:7 版（1080×1260，从 9:16 版中间裁出，内容完整）——信息流按 6:7 显示时用这一版 |
| `cover.jpg` | 视频号封面 3:4（1080×1440），按 `封面.md` 单独排版：冲突型，标题“会动，不等于看懂”，锚点是机芯 |
| `cover-6x7.jpg` / `cover-9x16.jpg` | 同一封面按 6:7 和 9:16 **各排一次**（不是裁出来的） |
| `subtitles.srt` | 逐句字幕，画面里已经烧录了一份 |

源配置：`tutorials/anatomy-explain.json` · 分镜：`tutorials/anatomy-explain.storyboard.md` · 重新渲染：`npm run tutorial:render -- anatomy-explain --overwrite --crf=22`
配音：**用户本人的复刻音色**（豆包语音 `seed-icl-2.0`），每镜按内容定语速（钩子 brisk、原理 calm、结论 slow）；音效：Freesound 真实录音（见下）。
画面：蓝图科技风；琥珀 = 物体 / 正在讲的零件，青 = 讲解。机芯是按原理画的示意图（演示速度标在画面左下：慢放 ×1/2、×1/4，最后切到实速 8 拍 / 秒）。

> 上传前在视频号助手里预览一次：看 9:16 版在信息流里是否被裁成 6:7、封面在主页九宫格里是否完整；规格以当期后台为准（`docs/video-craft/发布与风格偏好.md`）。

## 标题（任选其一）

1. 会动，不等于看懂：让 AI 讲东西，记住这四个问题
2. AI 一句话做出一块会动的表，可你看得懂吗？
3. 画得精细不难，难的是讲的顺序

## 作品描述

一句话，AI 就能把机械表做成一台能转、能拆的模型。可盯着看十秒，你说得出它怎么计时吗？
物体负责演示，讲解负责顺序：下次让 AI 给你讲一个东西，提问时带上四句——这是啥、在发生啥、为什么、有啥用。关键的参数和原理，记得自己核对。

#AI #科普 #AI工具 #Claude #机械表 #学习方法 #AI视频

## 置顶评论

```
素材：数字生命卡兹克（X @Khazix0918）《分享一个最近很惊艳的开源Skill，一句话让AI搓出任何原理的科普视频》
https://x.com/Khazix0918/status/2110587546271191166
Anatomy Skill：https://github.com/wheresryan22/anatomy

提问模板：解释一下 ____ 怎么工作，边演示边讲：这是啥、现在在发生啥、为什么、有啥用。
```

## 来源与说明

- 内容来自数字生命卡兹克 2026-10-15 的 X 长文（链接见上）；Anatomy 的理念 “The object is the explanation” 和机械表的例子来自 Anatomy Skill 本身。耗时“5 分钟视频约一个半小时”、“自己学用便宜点的配置也够”是原文作者的实测，我们没有复测。
- 片中“我这个频道的视频也是和 AI 一起做的”“说到哪个零件就只让哪个零件动”是频道自己的做法（本仓库的导演层规则），不是原文内容。
- 没有用原文截图、原文视频画面，也没有画作者本人；机芯、计时盘、课程盒都是重画的示意。“常见的机芯一秒八拍”指 28,800 次 / 小时的机芯，也有 21,600 次 / 小时（一秒六拍）等其他规格。
- 音效来自 Freesound（经 Openverse 检索）：
  - “Watch tick” by DrMinky，CC BY 4.0，https://freesound.org/people/DrMinky/sounds/174721
  - “SingleWind1.wav” by BMacZero，CC0 1.0，https://freesound.org/people/BMacZero/sounds/96149
  - “jp_tinypadlock01.flac” by JPolito，CC0 1.0，https://freesound.org/people/JPolito/sounds/391704
  - “Paper slide” by Kingofgamers_cz，CC0 1.0，https://freesound.org/people/Kingofgamers_cz/sounds/352914
- 用于商业推广前，建议先联系原作者取得转载 / 改编许可。
