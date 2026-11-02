# IP 形象：账号主持人（用户本人的卡通形象）

> 用户 2026-11-01：“I need a character-based IP image. This is my profile picture. I want the IP to be animated, and I want it to be incorporated into each video to enhance my content.” 参考图：`inputs/host-ip/avatar.webp`（用户头像）。**形象定稿待用户确认**（model sheet：`inputs/host-ip/model-sheet.jpg`，样片：`inputs/host-ip/demo-net-six-protocols.mp4`）。

## 一、是什么

- 代码画的 2D 角色（`src/tutorial/host.tsx`，`<Host>`），从头像来：黑色蓬松短发向一侧扫、深色细框长方形眼镜、平直浓眉、平静的小嘴、黑色连帽卫衣和两根抽绳、奶油色圆底。粗墨线 + 平涂，和头像同一种画法；颜色全部从头像取（肤 #F9CBA3、颈影 #E2A981、耳 / 唇 #DC9775 / #D08364、发 #201C1B、卫衣 #1B1918 / 褶 #2C2729、圆底 #F7E8D2）。
- 不用生成图、不用真人照片：每一帧由代码算出来，所以能动、能对口型、每支片都一模一样。
- 它代表**用户本人**（口播就是用户的 MiniMax 音色）：它说话 = 用户在说话。第一人称规则照旧：只说真发生过的事。

## 二、会做什么（全部由时间决定）

| 部件 | 怎么动 |
|---|---|
| 嘴 | 按配音的逐字时间戳（`*.words.json` 的 `ms` / `dur`）开合，每个字一次起落，部分字是圆口 |
| 头 | 说话时随音节轻点、平时慢慢晃；头发比头慢半拍 |
| 眼 | 每 2.4–4.4 秒眨一次，偶尔连眨；`look` 控制看向哪 |
| 眼镜 | 每 5 秒左右一道反光扫过 |
| 身体 | 呼吸起伏，抽绳跟着动 |
| 表情 `expr` | calm 平静 / smile 笑 / surprise 惊讶 / think 想 / serious 认真 |
| 动作 `pose` | idle / point 指（右上，指向画面内容）/ wave 挥手 / think 托下巴 / thumbs 点赞 / shrug 摊手；切换 9 帧过渡 |

## 三、在片子里怎么用（配置 `"host"`）

```json
"host": {"x": 28, "y": 1118, "size": 265, "scenes": {
  "hook": {"expr": "calm", "pose": "wave", "beats": [{"at": 1.6, "pose": "idle"}]},
  "tcp":  {"expr": "surprise", "pose": "shrug", "beats": [{"at": 2.2, "expr": "calm", "pose": "idle"}]},
  "mqtt": {"beats": [{"at": 4.3, "expr": "smile", "pose": "point"}]},
  "end":  {"expr": "smile", "beats": [{"at": 0.8, "pose": "thumbs"}]}
}}
```

- 只在列出的场景出现；前一场没有它就弹进来（回弹），后一场没有它就沉下去。`beats` 的 `at` 是场内秒数。每场可单独改 `x` / `y` / `size`；`mute: true` 不对口型。
- **默认四次出场**（每支片按内容改）：钩子（挥手打招呼，让第 0 帧有“人”）、第二钩子 / 转折（惊讶、摊手）、高潮（指向画面里的主角）、结尾（笑、点赞，说最后一句）。中段讲解时不出现，把画面让给内容（一个画面一个主角）。
- **位置**：默认左下角，底边贴着字幕卡上沿（约 x 28、y 1118、宽 265），避开右侧按钮列（x > 930）和底部文案区（y > 1560）。会挡住主体的场景挪位置或不出场——先看静帧。
- 它是账号层（[账号风格.md](账号风格.md)），不属于任何模板：模板换了它也在，画法不跟模板走。
- 试新表情 / 动作：`npx remotion still src/index.ts HostLab qa/host/sheet.png`（`src/lab/HostLab.tsx`）。

## 四、还没做的

- 全身（腿）和走路；侧身；更多手势。
- 封面里放不放它（封面版式待定）。
