# 一句“开灯”，灯亮之前要过 6 种协议——IP、TCP、UDP、DNS、HTTP、MQTT 一条路讲完

- 成片：`video.mp4`（1080×1920，30 fps，H.264 + AAC，48.1 秒，约 −15 LUFS）
- 2026-11-02 重渲：加上账号主持人（IP 形象，`src/tutorial/host.tsx`）——钩子挥手、「但 IP 只管送」惊讶摊手再托下巴、灯亮时指向灯、结尾点赞；其余不变
- 模板：`lemo/iso-infographic`（等距信息图，lemo-opuscar；它 MIT 的 Canvas 引擎原样移植在 `src/tutorial/iso-engine.js`）。照搬：真等距、每面三色调、浮在浅底上的小岛和剖面边、标签针、虚线路线、线先走物后到、focus + context（讲哪站别的褪灰）、剖开 + 斜线剖面、追踪环、字幕是地图标签。模板改造：每个协议用 Wireshark 默认着色规则里它本来的颜色（TCP #E7E6FF、UDP #DAEEFF、HTTP #E4FFC7、Routing #FFF3D6 给 IP、SYN/FIN 灰给握手、RST 红只给丢包；DNS / MQTT 没有默认规则，DNS 用同文件闲置的 ICMP 粉、MQTT 用 mqtt.org 的梅紫）；贯穿物件是那句「开灯」本身（黄色气泡，最后变成灯光）；字幕卡里的图例小方块跟着当前协议换色；字 Inter Display + 思源黑体 + JetBrains Mono；合成 playful 配乐 + 每个协议一种拟音
- 结构：一条路——手机 → DNS 问路（走 UDP，丢了再问）→ IP 贴地址一跳一跳（TTL 64 → 63 → 62）→「但 IP 只管送」→ TCP 三次握手、编号、3 号重发 → HTTP 请求 POST /light，回 200 OK → MQTT 订阅 home/light，Broker 推送，灯亮（配乐高潮）→ 剖开那个包：IP ⊃ TCP ⊃ HTTP ⊃「开灯」→ 回到第 0 帧的小岛（灯亮着）
- 封面：`cover-9x16.jpg`（抖音 / 视频号）、`cover.jpg`（3:4，小红书）、`cover-6x7.jpg`（6:7）；标题「一句“开灯” / 要过6种协议」，辅助句「IP · TCP · UDP · DNS · HTTP · MQTT」
- 字幕 `subtitles.srt`；静帧 `still-XXs.jpg`，总览 `stills-sheet.jpg`
- 分镜：`tutorials/net-six-protocols.storyboard.md`；想法和出处：`inputs/net-six-protocols/idea.md`
- 配音：用户本人的 MiniMax 音色（MashuaiDouyin01，brisk 1.12）；配乐 `scripts/generate-score.py`（playful，高潮落在灯亮那一拍，前面抽空 0.3 秒）
- 画面全部是代码画的示意（标「示意」），没有外部素材。地址是文档保留地址（203.0.113.8 —— RFC 5737；api.example.com —— RFC 2606）。智能家居“手机 → 云端 HTTP → MQTT → 灯”是常见做法的示意，各家细节不同
- **发布时勾选「内容由AI生成」**（配音为 AI 合成音色、画面为代码生成）；全部原创画面，可以勾「原创」
- **不引流**：片中、封面、文案都没有链接、二维码、资料包、评论区关键词

## 抖音

**标题**：一句“开灯”，背后要过6种网络协议

**文案**：你对手机说“开灯”，灯亮之前：DNS 先问出服务器的地址（走 UDP，丢了就再问），IP 给每个包贴上地址、路由器一跳一跳传，TCP 握手、编号、丢哪个补哪个，HTTP 写下真正的请求，最后 MQTT 把命令推给一直在线的灯。回头看，HTTP 装在 TCP 里，TCP 装在 IP 里。

**话题**：#网络协议 #计算机网络 #TCP #HTTP #智能家居

## 视频号

**标题**：你说一句“开灯”，灯亮之前要过 6 种协议

**文案**：IP、TCP、UDP、DNS、HTTP、MQTT 不是六个要背的名词，是一句话从手机走到灯的一条路。DNS 把名字换成地址，问路一般用 UDP——不握手、不确认，丢了就再问；IP 给每个包写上地址，路由器逐跳转发，每过一跳 TTL 减 1，但它不保证送到；TCP 用三次握手、序号和重传把路补稳；HTTP 写真正的请求，服务器回 200 表示成功（实际多是 HTTPS，再加一层加密）；MQTT 让设备订阅自己的频道，消息经 Broker 推送，包头最小只有 2 字节。画面为示意，依据 RFC 768 / 791 / 1035 / 9110 / 9293 和 OASIS MQTT 5.0。

**话题**：#网络协议 #计算机网络 #科普

## 小红书

**标题**：一条视频讲清 6 种网络协议｜IP TCP UDP DNS HTTP MQTT 是怎么配合的

**正文**：

💡 一句“开灯”，从手机到灯要走的一条路

1️⃣ DNS：把名字换成地址（api.example.com → 203.0.113.8）
2️⃣ UDP：DNS 问路用它——不握手、不确认，丢了再问
3️⃣ IP：每个包贴上地址，路由器一跳一跳传（TTL 64 → 63 → 62）
4️⃣ TCP：IP 只管送不管丢，所以先三次握手（SYN / SYN-ACK / ACK），包编号，丢哪个补哪个
5️⃣ HTTP：真正的请求 POST /light {"on": true}，服务器回 200 OK
6️⃣ MQTT：灯订阅 home/light，Broker 一推，灯就亮（包头最小 2 字节）

🧅 分层：HTTP 装进 TCP，TCP 装进 IP；UDP 和 TCP 同一层；MQTT 和 HTTP 同一层，跑在 TCP 上

下次灯没亮，你就知道该问是哪一层了。

#网络协议 #计算机网络 #TCP #HTTP #MQTT #程序员 #智能家居

## 出处（只写在这里，不上屏）

- DNS：RFC 1034、RFC 1035 https://www.rfc-editor.org/rfc/rfc1035
- UDP：RFC 768 https://www.rfc-editor.org/rfc/rfc768
- IP：RFC 791 https://www.rfc-editor.org/rfc/rfc791 ；默认 TTL 64：Linux ip-sysctl https://docs.kernel.org/networking/ip-sysctl.html
- TCP：RFC 9293 https://www.rfc-editor.org/rfc/rfc9293
- HTTP：RFC 9110 https://www.rfc-editor.org/rfc/rfc9110
- MQTT：OASIS MQTT 5.0 https://docs.oasis-open.org/mqtt/mqtt/v5.0/mqtt-v5.0.html
- 配色：Wireshark 默认着色规则（release-4.4 `colorfilters`）
- 引擎：lemo-opuscar `styles/iso-infographic/demo/engine.js`（MIT，LemoLab）https://github.com/lemomo-ai/lemo-opuscar
