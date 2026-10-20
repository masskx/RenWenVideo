# 抖音发布包 · 特斯拉会飞的车？Roadster 发布会拆解

2026 年 10 月 15 日，特斯拉在得州麦格雷戈的 SpaceX 测试场发布第二代 Roadster，标题满天飞：“特斯拉发布飞行汽车”。这条片子把发布会拆成两半看：**现场真演示了的**（冲上弧形坡道倒挂、喷气翻身落地；行驶中被推进器托起、越过五台车；0–60 英里 0.81 秒）和**只是承诺的**（230+ 英里时速、300 英里续航、2028 年投产），再讲推力从哪来（约 600 升高压气瓶 + 10 个冷气推进器）、三个版本的订金，以及这台车从 2017 年起一再推迟的交付史。结论：它不是在天上开的车，而是一台能用压缩空气跳一下、翻个身的超跑——演示是真的，量产是承诺。竖屏 9:16，可以直接发抖音。

| 文件 | 说明 |
| --- | --- |
| `video.mp4` | 成片：1080×1920，30fps，H.264 + AAC，126 秒（2:06），约 17 MB，响度约 -15 LUFS |
| `cover.jpg` | 封面（1080×1920，取自开场画面） |
| `subtitles.srt` | 逐句字幕，画面里已经烧录了一份；如果用平台自动字幕，上传这份可以免识别 |

源配置：`tutorials/tesla-roadster-flight.json` · 分镜：`tutorials/tesla-roadster-flight.storyboard.md` · 重新渲染：`npm run tutorial:render -- tesla-roadster-flight --overwrite --crf=23`
配音：阿里云百炼 CosyVoice（`cosyvoice-v3-flash` / `longsanshu_v3`，语速 1.2）；音效：`scripts/generate-sfx.py` 合成，落在接触帧上
画面：纸面 + 墨线稿，按 `docs/video-craft/导演层.md` 做。一台线稿 Roadster 贯穿全片；赤陶色 = 演示（只有推进器喷出的冷气是这个颜色），墨绿虚线 = 承诺。

> 用户反馈（2026-10-16）：这一版按抖音 9:16 做，发视频号时尺寸和封面需要调整；画面缺少科技感。本片不重做，规则已记进 `docs/video-craft/发布与风格偏好.md`，下一部按它来。

## 标题（任选其一，≤ 30 字）

1. 特斯拉真的发布了“会飞的车”？演示和承诺分开看
2. 0.81 秒破百、倒挂翻身：特斯拉新 Roadster 到底能不能飞
3. 600 升压缩空气托起一台超跑：特斯拉“飞行汽车”拆解

## 作品描述

特斯拉新 Roadster 冲上弧形坡道倒挂、喷气翻身落地，还从五台车头上“飞”了过去——但它算飞行汽车吗？
推力不是螺旋桨也不是燃烧，是约 600 升压缩空气；0–60 英里现场测出 0.81 秒。
230+ 英里时速、300 英里续航、2028 年投产，这些现场都没演示。这台车 2017 年就亮相过，交付一推再推。
你会订吗？评论区聊聊 👇

#特斯拉 #Roadster #飞行汽车 #马斯克 #SpaceX #电动车 #超跑 #科技新闻 #汽车

## 来源与说明

- TechCrunch（Sean O'Kane），2026-10-15：https://techcrunch.com/2026/10/15/tesla-reveals-spacex-powered-roadster-that-flies-and-falls-with-style/
- Fox Business（Landon Mion）：https://www.foxbusiness.com/technology/teslas-new-roadster-makes-flying-debut-hitting-60-mph-under-second
- 英为财情：https://cn.investing.com/news/stock-market-news/article-3611632
- 网易新闻：https://www.163.com/news/article/L9BROIA80001899O.html
- 每日经济新闻（网易转载，2026-10-16，国内意向金）：https://www.163.com/dy/article/L9BSFDCF0512B07B.html
- 参考：CleanTechnica：https://cleantechnica.com/2026/10/15/elon-musk-tesla-roadster-unveil-flying-cars-evtol-vtol/
- **只有一家报道、口播里说了“据报道”的**：演示车是远程遥控的（英为财情）。
- **特斯拉自己说的、没有独立核实的**：推进器推力是轮胎抓地力的 4–5 倍；约 600 升碳纤维气瓶、10 个推进器、车载压缩机可以自己充气；0.81 秒是现场演示的数字，不是第三方测试。
- **承诺、现场没有演示的**：最高时速 230+ 英里、续航 300 英里、2028 年投产。三个版本（Performance 订金 5 万美元、Thrust 25 万美元、Rocket 仅限邀请）和国内 Performance 意向金 33.2 万元以报道为准，下单前请看官网。
- 推迟年份（2020、2021、2023、2024）和订车协议“不保证交付日期，甚至不保证一定交付”来自上面的报道；“安全不是它的首要目标”是报道转述的马斯克说法。
- 画面全部是自己画的线稿示意（车、坡道、车队、气瓶剖面都不是官方图纸），没有用官方图片、视频截图、真人形象或特斯拉标志。
