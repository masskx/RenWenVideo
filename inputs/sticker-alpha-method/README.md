# sticker-alpha-method 素材包：一个角色 → 一整套透明表情包

给云端 Claude Code 剪辑用。脚本见 `script.md`（英文说明 + 中文逐字口播/字幕），目标约 90 秒（本期特意超出仓库 ≤60 秒规则）。

**本包所有画面都是用 AI 按这套方法现做的**（Grok Bot 的图片/视频生成），再在本地合成文字、抠图和测试背景。原帖的图片视频一张都没用。画面里只有原创卡通角色，没有真人、品牌和 logo。上屏时标「AI 生成示例」，不用标「案例展示」。

## 一、两篇帖子合起来讲什么

- **帖子 A（专属表情包）：** 先出一张不带字的角色定稿（正面半身、纯色背景、粗线条平涂、下方留字），缩小检查。之后每次都用同一张定稿当参考，只换动作，不要拿上一张新图当参考。跑偏了只重做那一张。最后统一排字（≤6 个字、粗黑字、位置一致），缩到 1/4 再看一遍，透明版放到深色、浅色底上查白边。
- **帖子 B（透明图）：** 透明靠 Alpha 通道（8 位：0 = 全透明，255 = 不透明）。白底图换背景会带出一个白框。棋盘格要是画进了像素里，就只是普通背景。要在深色、浅色、彩色底上检查。透明素材可以反复用在表情、海报、视频贴图、UI、PPT 里。
- **合起来：** 用任何生图模型「定角色 → 换动作 → 做透明底 → 验收」，做出一套能反复用的透明表情素材。模型能直接出透明 PNG 就直接出；不能就先出纯色底，再去背景。本包实测：提示词要了透明 PNG，模型返回的还是白底 JPG（A07）。

## 二、素材清单（materials/）

| 文件 | 内容 | 用在 |
|---|---|---|
| A01_master.png | 角色定稿（无字，白底） | 第 1、2 章 |
| A02_shoudao / A03_mashangkan / A04_xinkule / A05_xiabankuaile / A06_shaodeng .png | 用 A01 当参考换动作：比 OK、看手机、双手合十、举拳欢呼、竖食指 | 第 2 章 |
| A00_bad_too_detailed.jpg | 反例：细节过多的厚涂版（缩小后看不清） | 第 1 章缩小对比 |
| A07_asked_transparent_got_white.png | 提示词要了"透明背景 PNG"，模型返回的仍是白底 | 第 3 章 |
| V01–V07 .mp4 | 上面各张图做成 3 秒的动态（眨眼、点头、小动作），1080×608，无音轨 | 全片动态镜头 |
| V00_bad_detailed_still.mp4 | 反例图的 2 秒微动版（可不用） | 备用 |
| B01–B06 *_alpha.png | 真透明 PNG（RGBA），从图片边缘向内抠白底 | 第 3–5 章 |
| C02–C06 *_sticker_white.png / *_sticker_alpha.png | 512×512 成品表情（加粗黑字、白描边），白底版和透明版各一套 | 第 4、5 章 |
| D01_alpha_on_dark_light_color.jpg | 5 张透明表情分别放在深色、浅色、橙色底上 | 第 4 章 |
| D02_naive_delete_white_vs_edge_cutout_on_dark.jpg | 左：一键删掉所有白色（牙齿、眼睛高光被抠穿）；右：从边缘抠背景（正确） | 第 4 章 |
| D03_fake_checkerboard_vs_real_alpha_on_blue.jpg | 左：棋盘格画进图里的「假透明」放到蓝底上；右：真透明 | 第 3 章（示意图，本地合成） |
| D03a_fake_checkerboard_flat.jpg | 假透明单图 | 备用 |
| D04_white_box_vs_alpha_on_blue.jpg | 白底图和真透明图放到蓝底上的对比 | 第 3 章 |
| D05_quarter_size_check_simple_vs_detailed.jpg | 简洁版和细节版，原尺寸与 1/4 尺寸对比 | 第 1 章 |
| E01_overview_grid.jpg | 6 张总览图 | 第 5 章、封面 |
| E02_chat_mock_9x16.jpg | 通用深色聊天界面示范对话（无真实联系人） | 开头钩子、结尾 |
| previews/ | 每段视频 4fps 带时间码的预览图 | 找入出点 |

整包约 6.5 MB，单个文件都在 1 MB 以内。

## 三、每个素材用的提示词（原文照录，可做成文字卡上屏）

图片都用同一个生成器生成。动作图都附 A01 当参考图，固定特征整段重复，只换最后的 Action 句。

- **P1 定稿 A01**
  English (used): `Chat sticker character design (the user explicitly requested generated sticker example images for a tutorial): an original cartoon character with short black hair, round glasses, green crew-neck top, front-facing half-body, bold outlines, flat colors, simple facial features, clear silhouette. Plain white background with empty space around the figure and a blank area at the bottom reserved for text. Only one character, no text, no logos, no decorative border.`
  上屏用中文版（帖子 A 的基础提示词）：「原创聊天表情角色，短发、圆眼镜、绿色圆领上衣，正面半身，粗线条平涂，五官简洁，轮廓清楚。白色背景，人物四周留空，下方预留文字区。只画一个人物，不加文字、标志和装饰边框。」
  （第一次直接用中文提交时生成器没执行，换成英文版才生成。）
- **P2–P6 动作图（参考图 = A01）** 公共部分：`Same character as the reference image (keep identical face, hair, glasses, shirt): original cartoon chat-sticker character, short black hair, round glasses, green crew-neck top, half-body, bold outlines, flat colors, simple features. Plain white background, empty space around, blank area at the bottom for text. One character only, no text, no logos.` 后面接：
  - A02 收到：`Action: raising right hand with an OK gesture, smiling confidently.`
  - A03 我马上看：`Action: holding a phone up near the face with one hand, eyes wide, looking at the screen eagerly.`
  - A04 辛苦了：`Action: both palms pressed together in front of the chest, slight bow, grateful gentle smile with closed eyes.`
  - A05 下班快乐：`Action: both arms raised high in celebration, big open-mouth happy smile.`
  - A06 稍等一下：`Action: holding up one index finger as if saying "one moment", polite apologetic smile.`
  - 上屏中文示意：「同一个角色，保持发型、眼镜、衣服不变……动作：举起右手比OK，微笑」
- **P0 反例 A00：** `Chat sticker character, the user explicitly requested this as a deliberately over-detailed counter-example for a tutorial: original character with short black hair, round glasses, green crew-neck top, front half-body, rendered as a highly detailed painterly illustration with intricate individual hair strands, complex dramatic lighting, fine fabric texture, many folds and tiny patterns on the shirt, thin delicate line work, a busy detailed office background with shelves and plants. One character, no text, no logos.`
- **P7 要透明 A07（参考图 = A01）：** `Same character as the reference image: original cartoon chat-sticker character, short black hair, round glasses, green crew-neck top, half-body, bold outlines, flat colors. Transparent background, PNG. One character only, no text, no logos.` → 返回白底 JPG。
- **视频（图生视频，起始帧 = 对应图片，720p，3 秒，固定机位）：**
  - V01 `The cartoon character blinks once and gives a tiny friendly nod. Static locked camera, clean plain white background, flat cartoon style preserved, minimal motion.`
  - V02 `The cartoon character gives a small bouncy OK gesture with the raised hand and smiles, blinks once. Static locked camera, clean plain white background, flat cartoon style preserved.`
  - V03 `The cartoon character leans slightly toward the phone and eyes widen with interest. Static locked camera, clean plain white background, flat cartoon style preserved, minimal motion.`
  - V04 `The cartoon character makes a small grateful bow with palms together, gentle smile. Static locked camera, clean plain white background, flat cartoon style preserved, minimal motion.`
  - V05 `The cartoon character cheers, pumping both raised fists up and down happily with a small hop. Static locked camera, clean plain white background, flat cartoon style preserved.`
  - V06 `The cartoon character wags the raised index finger slightly as if saying one moment, apologetic smile. Static locked camera, clean plain white background, flat cartoon style preserved, minimal motion.`
  - V07（2 秒）`Almost completely still cartoon character, one subtle blink, static locked camera, plain white background unchanged.`
  - V00（2 秒）`Almost still painterly portrait, subtle blink, static locked camera, no other motion.`
- **本地处理（不是 AI 生成）：** 抠图是从图片四周向内填充白色区域，边缘做柔和过渡；表情文字用思源黑体 Bold 加白描边；D01–D05、E01、E02 都是本地拼的对比板和示范界面。

**技术说明：** 这次环境里，生成的图片文件没法直接拿到本机，所以 A0x 静帧取自对应图生视频的第 1 帧（720p）。画面和生成的原图一致，分辨率是 720×720 方图。

## 四、没用或淘汰的

- 第一轮动作图因为参考图路径无效，实际上没带参考图，全部作废，改用 A01 当参考重新生成（就是现在的 A02–A06）。
- 原帖的配图、截图、某些动漫角色示意图（涉及已有 IP 角色）一律不用。
- 原帖里的报价、收款、上架平台、具体 App 操作（尺寸、套餐）不讲：会显得像推广或副业引流，而且这些规则会变。

## 五、审核提示

- 发布时勾选「内容由AI生成」。
- 画面只有原创卡通角色和通用界面，没有真人、真实品牌、真实联系人。

## 六、内部来源（仅供核对，禁止上屏）

- 帖子 A（表情包）：https://x.com/better_christal/status/2109639305190863341
- 帖子 B（透明图）：https://x.com/VoxcatAI/status/2110542288074215542
- 透明背景并不是所有模型都支持（官方文档）：https://developers.openai.com/api/reference/resources/images/methods/generate/

## 七、待核实

- 「有的模型能直接出透明 PNG」只核实了一家官方 API 文档；口播没点名任何模型。国内各家生图产品是否支持透明导出，没有逐一核实。
- 帖子 B 说某些对话产品「直接说明就能出带 Alpha 的 PNG」，没有实测，口播不提。
