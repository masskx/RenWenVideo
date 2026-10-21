# 字面意义上的「网络爬虫」— 40s 抖音竖屏脚本（学术小白）

- Format: Remotion 1080x1920, 30fps, dark tech style (bg #0a0b0d, neon cyan/magenta accents matching the demo), all on-screen text >= 40px (titles 72-96px, subtitles 48px).
- Voice: user's 豆包 cloned voice. Subtitles = narration verbatim. Mute source clip (it has no audio anyway). Light BGM low under voice.
- Publish: tick 发布页 → 高级设置 → 自主声明 → 「内容由AI生成」 (cloned voice).
- Asset: `literal-web-crawler-assets/demo-full.mp4` (1280x800, 56.2s, H.264, no audio, 1.9MB), self-recorded from the public live demo, dark theme. Label overlay top-left small 「网页演示录屏」 (our own recording; no X/YouTube watermark, no creator handle anywhere).
- Vertical framing: place the 1280x800 clip scaled to 1080 wide (≈1080x675) in the middle band, or for close-ups crop a 800x800 region and scale to 1080x1080; title text above, subtitles below. Crop out the browser top bar where noted to hide English UI clutter.

## Shot list (v2, ~40s)

| # | Time | Clip in→out (demo-full.mp4) | Speed / crop / zoom | On-screen text (verbatim) | Narration (verbatim) |
|---|------|------|------|------|------|
| 1 HOOK | 0.0–3.0 | 13.0→16.0 (rip at max, spider tearing links) | 1x; crop 700x700 following spider, scale to 1080x1080; punch-in 1.0→1.15 | 大标题：「网页被蜘蛛啃了？」 | 「我的网页，被一只蜘蛛啃了。」 |
| 2 | 3.0–7.0 | 1.0→9.0 (roam mode) | 2x; full width, crop top bar (y 0–40) | 「网络爬虫 = 真·爬虫」 | 「程序员管抓网页的程序叫“网络爬虫”，有人就真把它做成了一只爬虫。」 |
| 3 | 7.0–12.0 | 16.0→21.0 (tearing links, debris, counter rising) | 1x; crop 800x800 following spider, zoom 1.2 | 「专撕蓝色链接」 | 「它八条腿轮流迈步，四条走、四条抓稳，脚一勾，就把蓝色链接整条撕下来。」 |
| 3b | 12.0–15.0 | 19.0→20.5 (same tearing, close-up) | 0.5x slow-mo; crop 500x500 on foot+link, scale to 1080x1080; counter 「N torn off」 highlighted | 「碎片还会掉下去」 | 「放慢看，撕下来的碎片还带物理效果，一路往下掉。」 |
| 4 | 15.0–21.0 | 21.0→30.5 (follow-mouse mode) | ~1.58x; full width; glowing cursor-ring overlay on mouse path | 「它会追着你的鼠标跑」 | 「切到跟随模式，它就追着你的鼠标跑，像养了只电子宠物。」 |
| 5 | 21.0–26.0 | 30.5→40.5 (size 2 → size 0.6) | 2x; full width; labels 「变大」(src 30.5–36.5)「变小」(src 36.5–40.5) | 「大小、撕的频率都能调」 | 「蜘蛛大小、撕得多猛，都能拖滑块调，大到吓人，小到像只蚂蚁。」 |
| 6 | 26.0–30.0 | 40.5→43.5 (Repair page restores text) | 0.75x; full width; flash highlight on 「Repair page」 button (src ~x470,y20) | 「一键修好网页」 | 「撕烂了也不怕，点一下修复，网页立刻复原。」 |
| 7 | 30.0–35.0 | 45.0→55.0 (pasted Chinese text incl. 学术小白) | 2x; crop center 900x560, scale to width | 「贴进自己的文字也能啃」 + card 「Linux 桌面插件 · 可当屏保」 | 「还能贴自己的文字给它啃；Linux 用户甚至能把它装成屏保，让它啃你的桌面。」 |
| 8 END | 35.0–40.0 | 13.0→15.5 reuse | 0.5x slow-mo; dark vignette | small 40px 「纯 JS/CSS · 零依赖 · MIT 开源」 + big 「把双关做成真东西」 | 「纯网页代码，不靠任何库。灵感来自一位海外创作者的短片——这才叫字面意义上的爬虫。」 |

Total ≈ 40s (trim BGM to voice end). Note: shot 7 source 45–55 can show spider beside rather than tearing pasted text; if weak, swap to 16.0→21.0 at 2x for the first half.

## Fact check (from repo README + live demo HTML, 2026-10-21)
- Repo adampog/literal-web-crawler, MIT. Spider grips links/IDs and tears them off; "alternating tetrapod gait (four legs move while the other four hold on)", 3-segment leg IK, physics of torn pieces; core/crawler.js is a plain script (no deps / no build step).
- Web demo controls verified in HTML: Roam / Follow cursor, Rip slider (0–1), Size slider (0.6–2), Pause, Repair page, Use your own page (paste).
- Omarchy (Linux) plugin: crawls a snapshot of your screen; keybind toggle; can replace Omarchy's screensaver.
- NOTE: README says "Inspired by this short" linking a YouTube Shorts clip, not X. Narration therefore says 「一位海外创作者的短片」 with no platform/handle. Not used in footage.

## Compliance (douyin.md)
- No links, no 去GitHub搜/下载, no 资料包/评论区/主页领取/公众号/下集预告; no 翻墙; no absolute words (no 最/第一); English-only content is self-recorded and explained in our own words; AI-voice label required.

## Internal (do not show)
- https://github.com/adampog/literal-web-crawler
- https://adampog.github.io/literal-web-crawler/
- Recording log (source seconds): 1.0 roam start · 13.0 rip=max · 21.0 follow mode · 30.5 size=2 + roam · 36.5 size=0.6 · 40.5 Repair · 43.5 paste own text · 45 crawl starts · 55.3 end.
