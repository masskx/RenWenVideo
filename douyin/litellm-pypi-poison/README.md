# 装个AI工具包，API Key就被偷了：LiteLLM 1.107.0 投毒，3步自查

- 成片：`video.mp4`（1080×1920，30 fps，H.264 + AAC，43.8 秒，约 −15 LUFS，19 MB）
- 封面：`cover.jpg`（3:4，小红书）、`cover-6x7.jpg`（6:7，视频号 / 抖音信息流）、`cover-9x16.jpg`；标题「装个AI工具包 / API Key被偷了？」，锚点是安装终端 + 飞走的 Key 卡 + 红色「?」
- 字幕：`subtitles.srt`；审片静帧 `still-XXs.jpg` + 拼图 `stills-sheet.jpg`
- 配音：本人复刻音色（豆包语音）。**发布时勾选「内容由AI生成」**
- 画面全部自绘：屏幕上所有 Key 都是假的且打码；没有恶意代码、payload、攻击者域名 / IP / 哈希，只出现自查用的文件名 `cook.pth`；DeepSeek / 豆包 / Kimi 只是文字，没有 logo
- **不引流**：片中、封面和发布文案都没有链接、资料包、评论区关键词、主页、公众号

## 抖音

**标题**：装个AI工具包，API Key就被偷了？

**文案**：开源库 LiteLLM 的 1.107.0 版本被人塞了木马（10 月 21 日，官方仓库已下架）。代码里没用它也会中招：任何 Python 程序一启动就自动运行，翻 SSH 密钥、云账号、浏览器密码和大模型 Key。三步自查：pip show litellm 看是不是 1.107.0；看 site-packages 里有没有 cook.pth；中了就重置所有 Key，卸载，换回 1.106.2。

**话题**：#AI #大模型 #网络安全 #Python #程序员

## 视频号

**标题**：装个AI工具包，API Key就被偷了？3步自查

**文案**：LiteLLM 1.107.0 发布包被投毒，装上后任何 Python 程序启动都会自动运行窃密程序，SSH 密钥、云账号凭证、浏览器密码、大模型 Key 都在目标里。自查：① pip show litellm 看版本；② site-packages 里有没有 cook.pth；③ 中了马上重置所有 Key，卸载后换回 1.106.2。开源工具很好用，但装之前，多看一眼版本号。

**话题**：#网络安全 #大模型 #Python

## 小红书

**标题**：LiteLLM投毒事件｜Python装包后API Key被偷？3步自查

**正文**：

🚨 很多人调大模型用的开源库 LiteLLM，1.107.0 版本的发布包被投毒（10 月 21 日，官方仓库已下架）
😱 最阴的是：代码里没 import 它也会中招，任何 Python 程序一启动就自动运行
🔑 它会翻：SSH 密钥 · 云账号 · 浏览器保存的密码 · 各种大模型 Key，然后偷偷传走
✅ 3 步自查：
1️⃣ 终端输入 pip show litellm，看版本是不是 1.107.0
2️⃣ 看 site-packages 文件夹里有没有 cook.pth
3️⃣ 中了：马上重置所有 Key，再卸载，换回干净的 1.106.2
开源工具很好用，但装之前，多看一眼版本号 👀
#AI工具 #大模型 #网络安全 #Python #程序员 #开源 #APIKey

## 出处（不上屏、不进发布文案）

- 选题：Eko 转发的突发新闻，2026-10-21。
- SafeDep 报告：https://safedep.io/litellm-pypi-compromise-credential-stealer-backdoor/ （litellm==1.107.0 全部 7 个 wheel 往 site-packages 写入 cook.pth / cook.py / sitecustomize.py；cook.pth 让任何 Python 启动时运行窃密程序，不需要 import litellm；目标包括 SSH 密钥、云凭证、CI/CD 密钥、AI 工具 token、浏览器密码、大模型 Key 和进程环境变量；PyPI 已下架；1.106.2 干净）
- Hacker News 讨论：https://news.ycombinator.com/item?id=50181114 （未用其中细节）
- 音效为仓库自带合成音效和 Freesound 录音（`public/audio/sfx/CREDITS.json`）；底乐为脚本生成，口播时压低约 18 dB。

## 和脚本不一样的地方

- 时长：用户要约 40 秒，脚本口播照读约 57 秒，所以压了字（事实不变），成片 43.8 秒：
  - 「很多人用来调大模型的开源库LiteLLM，10月21号发布的1.107.0版本，被人在安装包里塞了木马」→「开源库LiteLLM的1.107.0版本，很多人调大模型都在用，被人塞了木马」（日期放在画面「10月21日 · 官方仓库已下架」）
  - 「…它混进来的文件，会在电脑上任何Python程序启动时自动运行」→「任何Python程序一启动，它就自动运行」（「混进来的文件」放在画面上）
  - 「云账号凭证、浏览器保存的密码…然后偷偷传走」→「云账号、浏览器密码…偷偷传走」
  - 删「自查很简单。」（章节条 01 / 02 / 03 承担）；「只要中了，马上把所有Key全部重置，再卸载它」→「中了就马上重置所有Key，再卸载」
- 第三步的新 Key 也是假的且打码；终端是通用自绘窗口，不显示真实用户名或路径。
