一个免费的 Claude skill 能为任何机器构建可工作的 3D 模型，带有实时仪表和每个部件的按钮。下面：设置方法和全部 9 条提示词。

有一个免费的 Claude skill，能把任何机器构建成 3D 模拟器。你可以环绕观察它、把它切开，看部件如何工作。

在 V8 上，你追踪的汽缸会变成玻璃，你能看到混合气在里面燃烧，同时压力曲线图绘制出它的循环。

像这样的 V8 模拟器在 X 上获得了 3,790,000 次浏览。一个用 Opus 5.5 构建的野火工具获得了 1,640,000 次。人们观看机器运行的时间远长于阅读关于机器的文字。

它适用于任何有运动部件的物体，甚至是没人建造过的机器。一条长 1,300 米、宽 190 米的沙虫：

面板读取沙虫的真实姿态。头部随钻头转动，深度剖面跟随埋在地下的身体，地图绘制它的轨迹。

一只机器水母：

每个子系统都是一个按钮。按下一个，那个部件就会拆开，而身体的其余部分会退到一旁。

我在 2 天内构建了 7 个这样的东西。其中 3 个内置在 skill 里：V8、一架 Cessna 起落架和一个 Strandbeest。

这个 skill 叫 teardown。它免费，在 Claude Code 内运行。

你要构建什么

一个模拟器是一个 HTML 页面，800 KB，可离线工作。我构建的每一个都有相同的 6 个部分。下面是一个行走机器人上的示例：

机器。由代码构建：一个六边形底盘，6 条腿，18 个关节，红色舵机外壳，开槽股骨，小腿末端为锥形尖端。

模型。每条腿一个求解器。它提前一秒规划每一步。腿、面板和地板都从它读取数据。

面板。关节扭矩、每只脚的高度、6 条腿各自的负载、求解器时间、舵机温度。

按钮。三角步态、涟漪步态和波浪步态，方向键，WASD 键，速度、步幅和身体高度的滑块。

窗口。地板显示求解器的工作过程：连接到每只着地脚的线条、每只脚将落地的标记、摆动轨迹。

导览。放任不管时，一个光标会自行驱动页面。点击任何东西，它就把控制权交给你。安静 25 秒后，导览回来。

你需要什么

任何包含 Claude Code 的计划中的 Claude Code。我在 Opus 5.5 上运行了一切。

Node.js 20 或更新版本。

ffmpeg 和 Python 3，仅用于视频和声音。如果你要求，Claude Code 会安装两者。

这个 skill 叫 teardown：MIT 许可证，免费，内含 3 台机器。它基于 whaleyxbt 的 claude-motion 构建，后者为它提供了帧捕获和声音引擎。

第 1 步。安装 Skill

```
npx skills add elvarofficial/teardown -g -a claude-code
```

然后，在安装文件夹中执行一次：

```
cd ~/.claude/skills/teardown && npm install && npx playwright install chromium
```

打开 Claude Code 并输入 /teardown。

第 2 步。选择机器并找到参考

这一步决定一切。我是吃了苦头才学到的。

我要求做一只穿山甲、一只犰狳和一只蝎子，没有任何参考。3 个都变成了普通的玩具。然后我给同一个模型一段真实 V8 模拟器的片段，它逐面板地重建了发动机。

所以选择一台有一个运动输入和真实数字的机器，然后找到它的一张图片：手册中的剖视图、照片、片段。我还没构建的 5 个：

一个自行车后拨链器在 11 个链轮之间换挡

一个机械表擒纵机构以 4 Hz 滴答

一个汽车差速器在转弯时

一台缝纫机制作锁式线迹

一个挖掘机臂挖一斗

第 3 步。构建机器

把这粘贴到 Claude Code 中。替换 [方括号] 中的所有内容。

```
/teardown Build [the Cessna 337 main landing gear] as an interactive 3D simulator. Reference attached: [a cutaway drawing of the gear].

Build it from code in real units: [the main plate, the hydraulic actuator, the rack, the pinion on its output shaft, the universal joints, the side tubes, the spring legs and the wheels].

Before you draw anything, write the model as pure functions of one input: [stroke from 0 to 1]. Use the real numbers: [the rack travels 201 mm, the pinion has 32 teeth at module 4 mm, so the legs turn exactly 180°]. Check them by hand and show me the check. If you are not sure a number is real, say so and tell me where it comes from.

Every part, every panel and every label reads from that one model. Nothing is animated by hand.
```

```
/teardown 把 [Cessna 337 主起落架] 构建为交互式 3D 模拟器。附参考：[起落架的剖视图]。

用真实单位从代码构建它：[主板、液压作动器、齿条、输出轴上的小齿轮、万向节、侧管、弹簧腿和轮子]。

在你绘制任何东西之前，把模型写成一个输入的纯函数：[行程从 0 到 1]。使用真实数字：[齿条行程 201 mm，小齿轮有 32 个齿、模数 4 mm，所以腿正好转 180°]。手工检查并向我展示检查过程。如果你不确定某个数字是否真实，说出来并告诉我它来自哪里。

每个部件、每个面板和每个标签都从那个模型读取。没有任何东西是手工动画的。
```

为什么这有效：

模型优先。齿轮、仪表和时间线都读取同一个函数，所以它们不会彼此漂移。

一个输入。整个机构由一个数字摆出姿态，这就是机构。12 个部件手工动画，就是 12 个动画。

这是那条提示词构建出的东西：

一个汽缸将齿条推动 201 mm。齿条使一个 32 齿的齿轮正好转半圈。腿向后摆动 180° 进入机身。

数字在纸面上核对无误。32 个齿、模数 4 mm，是一个 128 mm 的齿轮。其周长的一半是 201 mm。

V8 和 Strandbeest 就是从这条相同的提示词中换上新方括号诞生的。Strandbeest 的模型是 Theo Jansen 1990 年的 11 个连杆长度：转动曲柄，每个关节都通过圆交点跟随。

第 4 步。构建控制台

```
Lay out a console around the machine at 1600×900:
- the title and the main live number top left, big: [engine speed in rpm]
- live charts that move with the machine: [valve lift over 720° of crank, the pressure-volume loop of the tracked cylinder]
- a schematic panel that redraws the mechanism in 2D from the same model
- one button per subsystem: isolate it, cut it, show it alone
- camera views as buttons: [hero, front, side, top, inside the valley]
- callouts with thin leader lines into the parts they name
Every panel redraws from the frame's state. No number on screen is typed in.
```

```
在 1600×900 下围绕机器布置一个控制台：
- 标题和主实时数字在左上角，大号：[发动机转速，单位 rpm]
- 随机器移动的实时图表：[曲轴 720° 内的气门升程、被追踪汽缸的压力-容积循环]
- 一个从同一模型以 2D 重绘机构的示意图面板
- 每个子系统一个按钮：隔离它、切开它、单独显示它
- 相机视角作为按钮：[主视角、前视、侧视、俯视、谷内视角]
- 带有细引线指向其所标注部件的标注
每个面板都从帧的状态重绘。屏幕上没有任何数字是手动输入的。
```

一个随部件移动的图表是人们停留的原因。V8 上的压力循环每 720° 曲轴闭合一次。你看着它闭合。

第 5 步。赋予它外观

```
Style: a clean study model on a pale studio.
- light background, soft shadows on an invisible floor, one accent colour for the part that is working right now
- the machine fills 60 to 70% of its view
- dark parts glossy, liners glass, metal roughness at least 0.45 so it never streaks white
- if a part is near-white, give it a thin ink outline or a darker ground
- pick the camera for the mechanism: if it collapses into a lattice face-on, use a 3/4 view
```

```
风格：浅色工作室中的干净研究模型。
- 浅色背景，隐形地板上的柔和阴影，一个强调色用于当前正在工作的部件
- 机器占其视图的 60% 到 70%
- 深色部件有光泽，内衬为玻璃，金属粗糙度至少 0.45，使其永不会出现白色条纹
- 如果部件接近白色，给它一条细墨线轮廓或更深的地面
- 为机构选择相机：如果它正面看会塌缩成格子状，使用 3/4 视角
```

每一行都是一个修复。Strandbeest 的白色管子消失在了奶油色背景中，直到我把它移到沙地上并给它加上墨线轮廓。正面看时它的 20 条腿变成了一道栅栏，所以相机位于沿脊线的 3/4 处。我的兔子场景的深色版本丢失了画面的第一秒。

第 6 步。像评论家一样检查

```
Before you show me anything:
1. Render a still at every beat of the tour and read each one: a part passing through another, a part floating off its mount, a label covering what it names, a number that disagrees with the pose.
2. Scrub every transition at 0.2 s steps and look for a jump.
3. Fix collisions with a number in the parameter block. Never hide them with the camera.
Tell me what you checked and what you fixed. Show me the stills.
```

```
在你向我展示任何东西之前：
1. 在导览的每个节拍渲染一张静帧并逐一阅读：一个部件穿过另一个、一个部件漂浮离开其安装座、一个标签遮住它所命名的东西、一个与姿态不符的数字。
2. 以 0.2 秒的步长刮擦每个过渡，寻找跳变。
3. 用参数块中的一个数字修复碰撞。永远不要用相机隐藏它们。
告诉我你检查了什么、修复了什么。给我看静帧。
```

静帧抓住了 2 个我本来会发布的 bug。一只兔子的脸穿过了帽子的壁，直到一个数字，0.222 m，把它放回里面。六足机器人的腿在每次步态变化时飞出，直到它的脚瞄准下一个真实的落脚点。

第 7 步。让它成为你可以驱动的页面

```
Make the simulator a page people drive:
- the tour from the film plays by itself, with a cursor that walks to each button and presses it
- any click, drag, scroll or key hands control to the visitor; 25 seconds of quiet hands it back
- drag to orbit, scroll to zoom, a key to hide the panels
- warm every shader before the first frame so the page never freezes
- test it on an integrated GPU and add quality steps: no ambient occlusion, a lower pixel ratio, smaller shadows, panels redrawn every other frame
```

```
把模拟器做成人们可以驱动的页面：
- 影片中的导览自行播放，一个光标走到每个按钮并按下它
- 任何点击、拖动、滚动或按键都把控制权交给访客；安静 25 秒后交还
- 拖动以环绕，滚动以缩放，一个按键隐藏面板
- 在第一帧之前预热每个着色器，使页面永不冻结
- 在集成 GPU 上测试它并添加质量档位：无环境光遮蔽、更低的像素比、更小的阴影、每隔一帧重绘面板
```

集成 GPU 是大多数人跳过的测试。六足机器人在集成 GPU 上以 15 fps 运行。经过质量档位后，它以 75 fps 运行。在一个沙丘页面上，慢的部分是一个着色器每个顶点计算相同位移 5 次。

第 8 步。把它变成视频

录制它：

```
Record the tour: render(t) has to be a pure function of time, so draw every frame at 60 fps at 1920×1080 in headless Chrome and pipe it into ffmpeg as H.264, yuv420p, faststart. Then show me a contact sheet of every beat.
```

```
录制导览：render(t) 必须是时间的纯函数，所以在无头 Chrome 中以 60 fps、1920×1080 绘制每一帧，并作为 H.264、yuv420p、faststart 管道输入 ffmpeg。然后给我看每个节拍的接触表。
```

为它配乐：

```
Score it in code on the same timeline: [Am9 chords at 92 bpm, a soft thump on every power stroke so the beat tightens when the throttle opens, a quiet click on every button press, rising air under the throttle drag]. Master to -14 LUFS with the true peak under -1 dB and mux it into the video.
```

```
在同一时间线上用代码为它配乐：[92 bpm 的 Am9 和弦，每次做功冲程一声轻柔的闷响，使节拍在油门打开时收紧，每次按钮按下时一声轻响，油门拖动下上升的空气声]。母带处理到 -14 LUFS，真峰值低于 -1 dB，并将其混流进视频。
```

屏幕录制器在 GPU 高负载时会丢帧。一个可寻址的导览不会。V8 影片输出为 26 秒，包含 189 个声音。每声闷响都落在其做功冲程上。

第 9 步。把它放到网上

```
Publish the simulator as a page:
- keep the HTML under 1 MB; move any large model out as a file next to the page
- a 1200×630 preview card from the best frame, with absolute image URLs
- deploy it to Vercel
```

```
把模拟器发布为页面：
- 保持 HTML 在 1 MB 以下；将任何大型模型移出为页面旁边的文件
- 从最佳帧制作一张 1200×630 的预览卡，使用绝对图片 URL
- 将其部署到 Vercel
```

1 MB 这条线来自一次失误。我的兔子页面在模型内置时重 15.9 MB，X 从未显示链接卡。把模型移出后它重 967 KB，卡片就出现了。

额外。让他们破坏它

```
Add one slider for [the wind, 0 to 15 m/s] and run the model live when it moves: [a light breeze barely turns the crank, a gale makes the legs blur]. Show it on the same panels.
```

```
为 [风，0 到 15 m/s] 添加一个滑块，并在它移动时实时运行模型：[微风几乎转不动曲柄，大风使腿变得模糊]。在相同的面板上显示它。
```

任何能把机器推过其极限的人都会了解每个数字的作用。

全部 6 个都在你的浏览器中免费运行：visual-learning.app。自己按按钮。

在手机或笔记本电脑的内置显卡上，首次加载需要几秒钟，同时着色器编译。之后页面会降低自身质量以保持帧率。

skill 中的 3 个是开源的：github.com/elvarofficial/teardown
