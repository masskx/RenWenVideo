# 一支带配乐的宣传片，作者说只花了1块9毛5——huashu-motion 的成本账

- 成片：`video.mp4`（1080×1920，30 fps，H.264 + AAC，32.0 秒）
- 模板：`lemo/swiss-motion`（瑞士动态排版，lemo-opuscar；分镜里写了照搬了它哪些：平面纸 + 黑字 + 浅灰 + 一个信号色、6 栏网格、精确缓动不弹跳、擦出和从基线升起、刀切、网格有意义、极端大小对比、一个不守网格的例外、字幕是版式的一部分）。模板改造：信号色用那支 1.95 元片子自己的 DeepSeek 蓝 #4E6AF4、纸面用它的米白 #F0EBE4；例外是「1.95」的小数点——就是那支片子“贯穿全片的圆点”——最后离开数字落到「品味」那一行；上半格放作者的真产出片；配乐用合成的 playful，速度定成那支片子的 124 BPM；字用 Inter Display + 思源黑体
- 封面：`cover-9x16.jpg`（抖音 / 视频号全屏）、`cover.jpg`（3:4，小红书）、`cover-6x7.jpg`（6:7，信息流）；标题「带配乐的宣传片 / 只花了1块9毛5」，辅助句「DeepSeek 做的 22 秒动效片」，锚点「1.95」下面紧贴「作者自报 · 按当时价格」
- 字幕：`subtitles.srt`；静帧 `still-XXs.jpg`，总览 `stills-sheet.jpg`
- 分镜：`tutorials/huashu-motion-1d95.storyboard.md`；事实和出处：`inputs/huashu-motion-1d95/materials.md`、`sources.md`、`assets/text/README.md`；审稿：`review.md`（Eko 三审通过）。10-20 的旧片是 `douyin/huashu-motion-skill`（功能导览）；这支只讲成本账
- 配音：用户本人的 MiniMax 音色（MashuaiDouyin01，brisk 档 1.12）；配乐 `scripts/generate-score.py`（playful，124 BPM，高潮落在蓝点落进「品味」那一拍，前面抽空 0.35 秒，代码合成）。**发布时勾选「内容由AI生成」，不要勾「原创」**（案例整理，含作者的产出片）
- 画面：作者仓库的产出片（`score-first.gif`、Release v0.2.0 的 `deepseek-v4.1-flash-specimen.mp4`、`huashu-design.gif` 前 5.3 秒），静音，右下角「@alchaincyf｜案例展示」；其余全部是代码排版。按 C 改那一拍的点选框是画出来的示意（标了「点选框为示意」），不是作者编辑器的录屏
- 口径（审稿红线，全部照办）：1.95 元每次上屏都带「作者自报 · 按当时价格」，并配 README 第 377 行原句「不同模型的品味差别是真实存在的」；DeepSeek 片只做证据镜头，不开场；不用 point-to-edit、catlight-pro、sixteen-cuts、粉丝片；huashu-design 避开「1.9秒」那一格；不提 Genspark / 量子位，不说“便宜 X 倍”；不出现作者的卡通形象
- 1000 格只是把 99.4% 画成 1000 个格子，不是作者的请求日志；「提示词里：0 次」是 README“我一句都没提过”的画面化
- **不引流**：片中、封面和文案都没有链接、二维码、资料包、评论区关键词、主页

## 抖音

**标题**：带配乐的宣传片，作者说只花了1块9毛5

**文案**：开源 skill huashu-motion 的作者在 README 里写：一支 22 秒、带配乐和音效的动效片，把 Claude Code 背后的模型换成 DeepSeek V4.1 Flash，提了三轮意见，前后不到半小时，按当时的价格花了 1 块 9 毛 5（缓存命中率 99.4%）。配乐在本机生成，不调收费接口；统一的配色、贯穿全片的圆点、卡在 124 拍的配乐，作者说一句都没提，是 skill 带出来的。但作者也写明：不同模型的品味差别是真实存在的。1 块 9 毛 5 是作者自报、按当时价格。

**话题**：#AI视频 #DeepSeek #ClaudeCode #AI工具 #动效设计

## 视频号

**标题**：一支带配乐的 22 秒宣传片，作者说只花了 1 块 9 毛 5

**文案**：huashu-motion 是一个开源（MIT）的 agent skill：让 Claude Code、Codex 这类 agent 读你的产品、给三个方向、写整支片子、自己写谱配乐，再在浏览器里打开编辑器，哪里不满意在画面上点一下，只改那一处。作者在 README 里记了一支片的账：22 秒动效片，模型换成 DeepSeek V4.1 Flash（1017 版），三轮意见，带配乐和音效，前后不到半小时，按当时价格花了 1 块 9 毛 5（缓存命中率 99.4%，作者自报）。配乐在本机生成，不调用收费接口。作者同时写明了边界：效果跟模型有关，“不同模型的品味差别是真实存在的”；它也听不见，“最后一耳朵还得是你的”。

**话题**：#AI工具 #AI视频 #DeepSeek

## 小红书

**标题**：AI 做动效宣传片｜DeepSeek 跑 huashu-motion，作者自报 1 块 9 毛 5

**正文**：

🧾 一支片的账（作者自报 · 按当时价格）
片子：22 秒，带配乐和音效
模型：DeepSeek V4.1 Flash（1017 版）
意见：3 轮
用时：不到半小时
合计：¥1.95

💡 便宜在哪
缓存命中率 99.4%
配乐在本机生成，不调收费接口

🎛 作者一句没提、skill 自己带出来的
统一配色｜贯穿全片的圆点｜124 拍的配乐

✍️ 哪里不满意：在画面上点一下，只改那一处

⚠️ 作者也写明
“不同模型的品味差别是真实存在的”

#AI工具 #AI视频 #DeepSeek #ClaudeCode #动效设计 #开源项目

## 出处和素材（只写在这里，不上屏）

- 仓库 alchaincyf/huashu-motion（MIT）：https://github.com/alchaincyf/huashu-motion （README 第 19、47、64–68、375、377 行）
- Release v0.2.0（`deepseek-v4.1-flash-specimen.mp4`）：https://github.com/alchaincyf/huashu-motion/releases/tag/v0.2.0
- 画面里的产出片 © 作者，随仓库 MIT；作者的卡通形象不随 MIT（THIRD_PARTY.md），片中未出现
- 字体：思源黑体、Inter Display、IBM Plex Mono（OFL）；音效见 `public/audio/sfx/CREDITS.json`，铅字声是 `scripts/generate-sfx.py` 合成的；配乐自己合成
