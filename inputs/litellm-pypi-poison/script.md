# 装个AI工具包，API Key就被偷了 · 抖音短视频脚本

> Account: 学术小白 (马飞龙). Topic: LiteLLM 1.107.0 PyPI poisoning (breaking, 2026-10-21).
> **Total duration: ~38s** (target 30–40s). 9:16, Remotion 1080×1920 @30fps, dark tech style (follow `deepseek-vs-opus55` reference episode), all on-screen fonts ≥40px (key captions 64–96px).
> Voice: user's Volcengine/豆包 cloned voice ONLY. Speed ~1.1x, punchy. Narration below is VERBATIM.
> Visual rule: all visuals are self-made terminal / text animations. NO real app or company logos (DeepSeek/豆包/Kimi appear as plain text only). **Every API key on screen is FAKE and blurred/masked** (e.g. `sk-••••••••3f9a`). NO malicious code, NO payload, NO attacker domains/URLs on screen.
> Ending: pure content. No CTA, no 资料包, no comment prompts, no 主页, no next-episode teaser, no links, no 公众号.

---

## Shot list

| # | Time | Visual (EN) | On-screen text (CN, verbatim) | Narration (CN, verbatim) |
|---|---|---|---|---|
| 1 | 0.0–3.5s | **Frame 0, no fade-in.** Dark terminal, line `pip install litellm` already typed, Enter hits at 0.3s. Install log scrolls; then three key cards (text-only labels 「DeepSeek Key」「豆包 Key」「Kimi Key」, values blurred) fly out of the screen toward a red "?" with a whoosh. Red alert tint. | 「装个AI工具包<br>API Key就被偷了」 | 装了一个AI工具包，你的大模型API Key，可能已经被偷了。 |
| 2 | 3.5–8.5s | Text slam card: package name + version in big mono font, red stamp 「被投毒」. Small line: 「10月21日 · 官方仓库已下架」. | 「LiteLLM 1.107.0<br>发布包被投毒」 | 很多人用来调大模型的开源库LiteLLM，10月21号发布的1.107.0版本，被人在安装包里塞了木马。 |
| 3 | 8.5–15.0s | Animation: a "Python" box; arrow from 「装上」 straight into it with a small grey file icon labeled 「混进来的文件」. Then several different Python windows pop up (「你的脚本」「pip」「编辑器插件」) and each lights red. | 「没用它也中招<br>Python一启动就运行」 | 最阴的是，你代码里根本没用它也会中招：它混进来的文件，会在电脑上任何Python程序启动时自动运行。 |
| 4 | 15.0–20.5s | Grid of icons (self-drawn, generic) lighting up one by one: key, cloud, lock, browser, terminal. Labels as text. | 「SSH密钥 · 云账号<br>浏览器密码 · 大模型Key」 | 它会翻你的SSH密钥、云账号凭证、浏览器保存的密码，还有各种大模型Key，然后偷偷传走。 |
| 5 | 20.5–26.0s | 第一步: terminal types `pip show litellm`; output line `Version: 1.107.0` gets red box; then alt version `1.106.2` with green check. | 第一步<br>「pip show litellm<br>看版本号」 | 自查很简单。第一步，终端里输入pip show litellm，看版本号是不是1.107.0。 |
| 6 | 26.0–29.5s | 第二步: file-tree animation of a folder 「site-packages」, a highlighted file `cook.pth` blinks red. | 第二步<br>「site-packages里<br>有没有 cook.pth」 | 第二步，看site-packages文件夹里，有没有一个叫cook.pth的文件。 |
| 7 | 29.5–35.0s | 第三步: three key cards (DeepSeek / 豆包 / Kimi, values masked) flip to 「已作废」 then show new masked keys; small line below 「卸载 · 换回1.106.2」. | 第三步<br>「中了：立刻重置所有Key」 | 第三步，只要中了，马上把所有Key全部重置，再卸载它，换回干净的1.106.2。 |
| 8 | 35.0–38.0s | Back to the opening terminal; cursor blinks; key cards return safely, lock icon closes. Hold 1.2s on final text. No logo end card. | 「装之前<br>多看一眼版本号」 | 开源工具很好用，但装之前，多看一眼版本号。 |

**Hook line (frame 0):** 「装了一个AI工具包，你的大模型API Key，可能已经被偷了。」

---

## Production notes (EN)
- Pacing: cut or text change every 2–3s; burned-in word-synced captions; no intro logo/title card before Shot 1.
- Terminal look: monospace, green/cyan on near-black; generic window chrome (no macOS/Windows/brand logos). Terminal font ≥48px.
- FAKE keys only, and always blurred/masked anyway. Do not show real usernames, paths with real names, or the user's own environment.
- Do NOT show: file contents of cook.py / sitecustomize.py, any decoding/exfiltration code, attacker domains, IP addresses, hashes. Only the filename `cook.pth` (as a self-check indicator) is allowed.
- SFX: keyboard clicks + Enter at 0.3s, alarm/glitch on Shot 1–3, soft BGM ducked under voice.
- No external footage → no 「案例展示」 needed.
- Douyin publish settings: tick 「内容由AI生成」 (cloned voice).
- Suggested title (CN): 「装个AI工具包，API Key就被偷了？3步自查」  Tags: #AI #大模型 #网络安全 #Python

## Fact check (internal — not on screen)
Verified against SafeDep report (Oct 21, 2026):
- litellm==1.107.0 on PyPI; all seven wheels (Linux/macOS/Windows) install 3 extra files into site-packages: cook.pth, cook.py, sitecustomize.py. ✅
- cook.pth → imports cook.py (credential stealer): SSH keys, cloud creds, CI/CD secrets, AI tool tokens, browser passwords, LLM provider keys (from LiteLLM proxy DB) + env vars of processes. ✅ (Narration says 「各种大模型Key」 — keys in env vars/AI-tool configs are covered by env_vars/ai_devtools modules.)
- sitecustomize.py → background daemon, hourly re-runs stealer and fetches remote code (backdoor). ✅ (kept off-screen as detail; not narrated to keep it light)
- Runs on any Python start even without `import litellm`. ✅
- GitHub source does not contain the implant; release package compromised. ✅ (not narrated)
- PyPI removed the release (observed gone by 13:40 UTC Oct 21). ✅
- 1.106.2 clean (also 1.107.0rc1/rc2). ✅
- Not verified / not used: HN thread details. "木马" used as plain-language term for stealer+backdoor.

## Compliance checklist (douyin.md §4)
- [x] No WeChat/QR/links/phone numbers; no source URLs on screen
- [x] No 下载/搜索 App guidance (pip command is a self-check, not install guidance)
- [x] No comment-bait, no 关注看下集, no 资料包
- [x] AI label 「内容由AI生成」 required
- [x] No VPN/翻墙 terms
- [x] No external footage; no watermarks; no brand logos
- [x] All keys fake + masked (§4 API Key/Token 打码)
- [x] No attack tutorial, no payload code (§1.13, §3.6)
- [x] No absolute claims: 「可能已经被偷」「很简单」; no 100%/一定/最
- [x] Content complete, no cliffhanger
