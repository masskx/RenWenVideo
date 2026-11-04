# IP 形象：账号主持人（用户本人的卡通形象）

> 用户 2026-11-01：“I need a character-based IP image. This is my profile picture. I want the IP to be animated, and I want it to be incorporated into each video to enhance my content.” 参考图：`inputs/host-ip/avatar.webp`（用户头像）。**形象已定稿**（用户 2026-11-02 看完 model sheet、样片和 claude-teardown-3d-sim 后：“OK, continue”）（model sheet：`inputs/host-ip/model-sheet.jpg`，样片：`inputs/host-ip/demo-net-six-protocols.mp4`）。

## 〇、v2（2026-11-04）：为什么重做、改了什么

> **v2 定稿**（用户 2026-11-04 看完 model sheet、片中样子和对口型特写：“approved, merge it — use the window as default”）。默认取景 `window`；名牌 `name` 暂不加（用户没定写什么）。

用户 2026-11-04 看完 altman-dram-pc-waste：“the design of your personal brand … felt rushed and disjointed, appearing strange in the video”；随后：“First, focus on refining the individual branding IP to make it more sophisticated and versatile for future video use.”

v1 的毛病（对照 altman-dram-pc-waste 的静帧看出来的）：奶油色圆形贴纸压在真人原片上（画面里两个“人”，一个是贴纸）；圆底的米色和片子的配色无关；手画的近似——Q 版大头、块状头发、粗眼镜、腮红——和头像的画法对不上；棍子手臂 + 连指手套手是最粗糙的部分，手还伸出圆外；和画面内容没有任何互动，按时间表弹进弹出。

v2 怎么改：

| | v1 | v2 |
|---|---|---|
| 画法 | 手写 SVG 近似头像 | **头像本身**：`scripts/host/trace-avatar.py` 按颜色把 `avatar.webp` 描成矢量层（脸、阴影、线、头发和发丝高光、眼镜、卫衣和褶），生成 `src/tutorial/host-art.ts`；比例、发丝、阴影、线条和头像一致 |
| 会动的部分 | 整套手画五官 | 眼睛、眉毛单独描出来再绑定（眨眼、看向、挑眉、皱眉）；嘴：不说话时是头像原样的唇，说话时按逐字时间戳开合；头在下颌处和身体分开，可以点头、歪头、侧倾；头发比头慢半拍；肩膀呼吸、耸肩 |
| 手臂 | 棍子手臂 + 手套手 | **去掉**。动作靠头、眼、眉、嘴和肩（`point` = 侧身看向画面里的东西；`wave` = 两下点头 + 笑；`thumbs` / `nod` = 一下点头；`think` = 歪头、眼往上；`shrug` = 耸肩 + 挑眉）——旧配置照样能用 |
| 和片子的关系 | 米色圆贴纸，浮在画面上 | **三种取景，颜色跟片子走**（默认取 `look.pk`）：`window` 画中画小窗（片子的卡面色做底、强调色做边框、胸像被下边裁掉，像新闻里的连线小窗；可加名牌 `name`）；`edge` 从一条线后面升起（下三分之一条、卡片、字幕带——画面切掉他的下半身，而不是飘着）；`badge` 头像原样的圆（只给封面、片尾卡）。强调色的细轮廓光把他放进片子的光里；脸和卫衣是他自己的，不变色 |
| 进出 | 回弹弹出 | 小窗从下往上擦开 / 从线后升起，离场反过来 |

model sheet：`inputs/host-ip/model-sheet-v2.jpg`（第一行头像原样 + 五种表情，第二行五种动作，第三行三种取景放在三支片的配色上）；对口型特写（带声音）`inputs/host-ip/demo-v2-lipsync-closeup.mp4`；在片子里的样子 `inputs/host-ip/demo-v2-in-film.mp4`（altman-dram-pc-waste 开头 10 秒）。v1 的图和样片留着对照（`model-sheet.jpg`、`demo-net-six-protocols.mp4`）。

## 一、是什么

- 头像描出来的矢量角色（`src/tutorial/host.tsx` 的 `<Host>` / `<HostFrame>`，图层在 `src/tutorial/host-art.ts`，重新描：`python3 scripts/host/trace-avatar.py`）。头像的样子：黑色蓬松短发向一侧扫、深色细框长方形眼镜、平直浓眉、平静的小嘴、黑色连帽卫衣和两根抽绳、奶油色圆底。粗墨线 + 平涂，和头像同一种画法；颜色全部从头像取（肤 #F9CBA3、颈影 #E2A981、耳 / 唇 #DC9775 / #D08364、发 #201C1B、卫衣 #1B1918 / 褶 #2C2729、圆底 #F7E8D2）。
- 不用生成图、不用真人照片：每一帧由代码算出来，所以能动、能对口型、每支片都一模一样。
- 它代表**用户本人**（口播就是用户的 MiniMax 音色）：它说话 = 用户在说话。第一人称规则照旧：只说真发生过的事。

## 二、会做什么（全部由时间决定）

| 部件 | 怎么动 |
|---|---|
| 嘴 | **按配音本身对口型**（用户 2026-11-04：“The way the mouth is moving seems very unnatural… better if the mouth movements were synchronized with speech”）：`scripts/host/mouth.py` 从每场配音量出口型轨 `NN-<scene>.mouth.json`——张多大来自声音的元音频段（250–1200 Hz，元音响、辅音和字与字之间会掉下去，所以每个字都有开合，停顿时闭上；嘴比声音早约 35 ms），口形来自每个字的拼音韵母（A 张大 / O 圆 / E 半开 / I 扁、露牙 / U 嘟起），b/p/m/f 开头先合唇；字与字之间口形渐变。画法：口腔、上牙、舌头、上唇线、下唇。不说话时是头像原样的唇。渲染时口型轨缺了或比配音旧会自动重做；没装 pypinyin 时口形一律中性、开合仍按声音。v1 的做法（按 TTS 的逐字时间戳每个字随机张一次）时间粗、和声音对不上，已不用 |
| 头 | 说话时随音节轻点、平时慢慢晃；换动作时点头 / 歪头 / 侧倾；头发比头慢半拍 |
| 眼 | 每 2.5–4.5 秒眨一次，偶尔连眨，换动作时眨一下；`look` 控制看向哪（−1 左 … 1 右，−1 上 … 1 下） |
| 眼镜 | 每 6 秒左右一道反光扫过 |
| 肩 | 呼吸起伏；`shrug` 耸肩 |
| 表情 `expr` | calm 平静 / smile 笑 / surprise 惊讶 / think 想（一边眉毛挑起）/ serious 认真（皱眉）；表情之间 10 帧过渡 |
| 动作 `pose` | idle / point 侧身看向 `look` 那边 / wave 两下点头 / nod、thumbs 一下点头 / think 歪头 / shrug 耸肩 |

## 三、在片子里怎么用（配置 `"host"`）

```json
"host": {"mode": "window", "x": 64, "y": 866, "size": 220, "scenes": {
  "hook": {"expr": "surprise", "pose": "wave", "look": [0.6, -0.3], "beats": [{"at": 1.8, "pose": "point", "expr": "calm", "look": [1, -0.4]}]},
  "end":  {"expr": "think", "pose": "think", "beats": [{"at": 1.8, "pose": "nod", "expr": "smile"}]}
}}
```

- `mode`：`window`（**默认**，用户 2026-11-04 定）/ `edge` / `badge`，每场可单独改；`x`、`y` 是小窗（或 edge 那个框）的左上角，`size` 是小窗宽度（高约 1.06 倍；有名牌再加 52）。`edge` 的框高约 0.82 × size，**框的下边要正好压在片子里的一条线上**（条、卡片上沿、字幕带），否则会像飘着。
- 颜色：不写 `colors` 就用片子的 `look.pk`（`panel` 做小窗底、`accent` 做边框和轮廓光、`ink` 做名牌字）；没有 `pk` 的片子写 `"colors": {"panel", "accent", "ink", "bg"}`。
- `name`：小窗下的名牌（不写就没有；**写什么由用户定**，不要自己起名字）。
- `look`：他看向哪边——指向画面里的主角时，`point` + `look` 朝主角那一侧。
- 只在列出的场景出现；前一场没有他就擦开 / 升起，后一场没有他就收回。`beats` 的 `at` 是场内秒数；`mute: true` 不对口型。
- **先在分镜里给他留位置**：他是画面的一部分，不是最后贴上去的。镜头表里写他在哪一场、用哪种取景、看向什么；内容占满全宽的场（证据板、整页截图）就不出场。默认两到四次：钩子（第 0 帧有“人”）、转折、（可选）高潮看向主角、结尾。和真人原片同框时用 `window`（明确是另一个画框），不用 `edge`。
- 它是账号层（[账号风格.md](账号风格.md)），不属于任何模板：模板换了它也在，取景和颜色跟模板走。
- 试新表情 / 取景：`npx remotion still src/index.ts HostLab qa/host/sheet.png --overwrite`（`src/lab/HostLab.tsx`）；说话测试 `npx remotion render src/index.ts HostLab qa/host/talk.mp4 --props='{"sheet":"talk"}'`。

## 四、还没做的

- 手：v2 去掉了手臂；要手势时画真正的手（按头像的线条和比例），不再用棍子 + 手套。
- 侧脸 / 转身：头像是一个固定的 3/4 角度，`turn` 只能挪几个像素；要大角度转头得另描一张侧脸。
- 名牌写什么、封面里放不放他（等用户定）。
- 旧片（2026-11-01 到 11-03）的 `host` 配置是按 v1 的盒子量的，重渲之前要按 §三 重新摆。
