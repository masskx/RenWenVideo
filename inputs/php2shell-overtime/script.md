# PHP2Shell漏洞，全球程序员连夜加班 · 抖音短视频脚本

> Account: 学术小白 (马飞龙). Topic: PHP2Shell critical PHP vulnerabilities, patched 2026-10-21.
> **Total duration: ~38s** (target 30–40s). 9:16, 1080×1920, 30fps, Remotion. Dark tech style (follow `deepseek-vs-opus55` reference episode), all on-screen fonts ≥40px (key captions 64–96px).
> Voice: user's Volcengine/豆包 cloned voice ONLY. Speed ~1.1x, urgent but calm. Narration below is VERBATIM.
> Visual rule: all self-made text / terminal / version-number animations. **NO real logos** (PHP elephant, Cloudflare, ENISA, EU flag etc.) — plain text names only. NO exploit code, NO payloads, NO attack steps, NO config/mitigation snippets on screen.
> Ending: pure content. No CTA, no 资料包, no comment prompts, no 主页, no next-episode teaser, no links, no 公众号.

---

## Shot list

| # | Time | Visual (EN) | On-screen text (CN, verbatim) | Narration (CN, verbatim) |
|---|---|---|---|---|
| 1 | 0.0–3.5s | **Frame 0, no fade-in.** Black screen, red flashing alert banner slams in; behind it a fake world map dotted with red pulsing points. Clock overlay reads 「03:00」 ticking. Red alert tint, alarm SFX. | 「凌晨三点<br>全球程序员被叫醒」 | 凌晨三点，全球一大批程序员，被同一个漏洞叫醒了。 |
| 2 | 3.5–8.5s | Big glitch title 「PHP2Shell」, below it two CVE IDs type out in monospace; a score gauge fills to 9.2 in red. | 「PHP2Shell」<br>「CVE-2026-109618 / 109619」<br>「危险评分 9.2 / 10」 | 它叫PHP2Shell，两个漏洞，危险评分九点二，满分是十。 |
| 3 | 8.5–14.0s | Icon animation: a padlock with "无需登录" stamped open; a generic server box turns red. Simple text, no technical detail. | 「不用登录<br>远程就能在服务器上执行代码」 | 意思是，攻击者不用登录，远程就可能在你的服务器上执行代码。 |
| 4 | 14.0–19.5s | Stat counter "75%~80%" rolls up; plain-text tags float in: WordPress / Drupal / Joomla. Then a list of runtimes types out: PHP-FPM, mod_php, php-cgi, FrankenPHP, LiteSpeed. | 「约75%~80%的网站用PHP」<br>「跑网站的PHP基本都在范围内」 | PHP撑着大约七到八成的网站，常见的跑网站方式，基本都在影响范围里。 |
| 5 | 19.5–24.5s | Timeline animation: 「10月20日 细节提前泄露」 → 「10月21日 21:40 官方紧急补丁」(北京时间); small grey text cards 「欧盟多机构联合声明」「英国国家网络安全中心：立即更新」. | 「细节提前泄露<br>官方连夜发补丁」 | 漏洞细节还提前泄露了，官方只好紧急发补丁，欧盟和英国的安全机构都在催大家马上更新。 |
| 6 | 24.5–31.0s | Mock terminal (self-drawn, generic): `php -v` → old version in red → arrow → green version numbers appear one by one: 8.5.12 / 8.4.27 / 8.3.36 / 8.2.35. Then a "重启" spinner icon. | 「升级到：8.5.12｜8.4.27<br>8.3.36｜8.2.35」<br>「升级完记得重启服务」 | 有网站的朋友，把PHP升级到这四个版本之一，升级完记得重启服务，不然可能还在跑旧代码。 |
| 7 | 31.0–34.5s | Version 「8.1」「7.x」 cards turn grey with a 「已停止维护」 stamp; arrow to 「找服务商 / 升级到新版本」. | 「8.1及更早：官方不再更新」<br>「问服务商，或升级新版」 | 还在用8.1及更早版本的，官方已经不管了，赶紧问服务商，或者直接升级。 |
| 8 | 34.5–38.0s | Back to the world map; red dots turn green one by one; clock moves to 「07:00」, sunrise gradient. Hold 1.5s on final text. No logo end card. | 「补丁不打<br>漏洞就一直在」 | 漏洞不会自己消失，补丁打上，才算真的过夜。 |

**Hook line (frame 0):** 「凌晨三点，全球一大批程序员，被同一个漏洞叫醒了。」

---

## Production notes (EN)
- Pacing: cut or text change every 2–3s; burned-in word-synced captions; no intro logo/title card before Shot 1.
- Shot 1 must be the conflict visual at frame 0 (data: 2s bounce 44–50% on tutorial intros; hit video 17.8% completion at 47s).
- 「凌晨三点」 is a dramatized framing (patch landed 21:40 Beijing time; admins worldwide patched through the night across time zones). Keep the clock as a stylized visual, not a factual claim of a specific time.
- Terminal mock: only `php -v` and version numbers. Do NOT show mitigation settings, nginx rules, exploit paths, or any memory/heap details.
- SFX: alarm at 0.0s, typing clicks in Shot 2/6, soft BGM ducked under voice.
- No external footage → no 「案例展示」 needed. If an editor adds stock clips: Pexels-only, muted, labeled 「案例展示」, no faces, no logos.
- Douyin publish settings: tick 「内容由AI生成」 (cloned voice).
- Suggested title (CN): 「一个漏洞，让全球程序员连夜升级PHP」  Tags: #网络安全 #程序员 #PHP

## Fact check (sources in README internal section)
Verified:
- CVE-2026-109618 / CVE-2026-109619, collectively "PHP2Shell", unauthenticated RCE — BleepingComputer, ENISA, cve.org.
- CVSS v4.0 9.2 (both) — cve.org record, NHS England Digital alert, Huntress.
- Affects all PHP serving web requests: PHP-FPM, Apache mod_php, php-cgi, FrankenPHP, LiteSpeed — BleepingComputer, Huntress (quoting PHP).
- Details leaked Oct 20 before coordinated disclosure — Huntress, Check Point.
- Patch released 21 Oct 2026 13:40 UTC = 21:40 Beijing time — ENISA.
- ENISA / European Commission / CERT-EU / Europol EC3 / CSIRTs network joint statement — ENISA.
- UK NCSC: update immediately or take offline — BleepingComputer.
- Fixed versions 8.5.12 / 8.4.27 / 8.3.36 / 8.2.35 — BleepingComputer, Huntress, cve.org.
- Restart workers after patching — Huntress search summary / PHP mitigation notes (restart every worker).
- 8.1 and older no longer get official PHP updates (vendors may backport; PHP gave minimal source backports for 7.4/8.0/8.1) — BleepingComputer. Script says 「官方不再更新」 + 「问服务商」, not "no patch exists".
- PHP powers ~75–80% of websites — BleepingComputer.
Dropped / softened:
- "Nginx itself not vulnerable, misreported" — no source found confirming the misreport story; not used.
- "Rebuild containers" — not explicitly found in sources; folded into 「重启服务」.
- "Programmers worldwide pulled all-nighters" — framing, not a sourced fact; hedged as 「一大批」 and stylized clock.

## Compliance checklist (douyin.md)
- [x] No links/QR/WeChat/phone numbers/公众号
- [x] No 下载/搜索 App guidance
- [x] No comment-bait, no 下集, no 资料包
- [x] AI label 「内容由AI生成」 required (cloned voice)
- [x] No VPN/翻墙 terms
- [x] No attack tutorial / no exploitation details (公约第38条)
- [x] No real logos, no national emblems/flags
- [x] No absolute claims: 「可能」「大约」「基本」「一大批」 used; no 100%/绝对/最
- [x] Content complete, no cliffhanger; original narration + self-made animation
