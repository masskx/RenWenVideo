# net-six-protocols：一句“开灯”，灯亮之前要过 6 种协议（IP、TCP、UDP、DNS、HTTP、MQTT）

> 用户 2026-10-31：“Create a video: A comprehensive explanation of all network protocols – IP, TCP, UDP, DNS, HTTP, MQTT.”
> 没有给素材（导演方法 §一 情况 C：全部代码画）。口播、分镜由我定。

## 想法

- 想让观众记住的一件事：六个协议不是六个名词，是一句话从手机到灯要走的**一条路**：DNS 问路（走 UDP）→ IP 贴地址一跳一跳传 → TCP 握手、编号、补丢的 → HTTP 写真正的请求 → MQTT 把命令推给一直在线的灯；回头看是一层套一层（HTTP 装进 TCP，TCP 装进 IP）。
- 为什么讲：账号观众天天在用 AI 助手、智能设备，“我说一句话，背后发生了什么”是他们会好奇、会收藏的原理题。
- 最反常识的地方（钩子）：三个字的一句话，灯亮之前至少过 6 种协议；而且 IP 本身“只管送、不管丢没丢”。
- 感觉：清楚、轻快、像一张会动的信息图。

## 事实和出处（全部是公开标准，口播只说标准里写着的）

- DNS 把域名解析成 IP 地址；查询一般走 UDP 53 端口，没收到回复由解析器重发 —— RFC 1034、RFC 1035 §4.2.1 https://www.rfc-editor.org/rfc/rfc1035
- UDP 无连接：不握手、不确认、不保证送达 —— RFC 768 https://www.rfc-editor.org/rfc/rfc768
- IP 给每个包写源 / 目的地址，路由器逐跳转发，每过一跳 TTL 减 1；IP 不保证送达和顺序 —— RFC 791 https://www.rfc-editor.org/rfc/rfc791
- Linux / Android 默认 TTL 64 —— Linux 内核文档 ip-sysctl `ip_default_ttl`（默认 64）https://docs.kernel.org/networking/ip-sysctl.html
- TCP 三次握手（SYN、SYN-ACK、ACK）、序号、确认、丢包重传 —— RFC 9293 https://www.rfc-editor.org/rfc/rfc9293
- HTTP 请求方法和状态码，200 = OK（请求成功）—— RFC 9110 https://www.rfc-editor.org/rfc/rfc9110 ；实际大多走 HTTPS（多一层 TLS 加密）。
- MQTT：发布 / 订阅，经过 Broker 中转；跑在 TCP 上；固定包头最小 2 字节；设备保持长连接 —— OASIS MQTT 5.0 https://docs.oasis-open.org/mqtt/mqtt/v5.0/mqtt-v5.0.html
- 画面里的地址用文档专用的保留地址和域名（203.0.113.8 —— RFC 5737；example.com —— RFC 2606），不是真实服务器。
- “开灯”这条链路是常见智能家居云的示意（手机 → 云端 HTTP 接口 → MQTT 推给灯），不同厂商细节不同，上屏标「示意」。

## 颜色从哪里来

- 没有产品素材，取“这个题材的世界”：网络工程师看包时用的 Wireshark 默认着色规则（`colorfilters`，release-4.4）：TCP #E7E6FF、UDP #DAEEFF、HTTP #E4FFC7、Routing #FFF3D6、TCP SYN/FIN #A0A0A0、TCP RST #A40000、深色字 #12272E、浅灰绿 #ECF0EB、黄 #FFFC9C。
  https://raw.githubusercontent.com/wireshark/wireshark/release-4.4/resources/share/wireshark/colorfilters

## 限制

- 时长 ≤ 60 秒。不引流。
