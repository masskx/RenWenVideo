# 抖音发布包 · REA 保姆级上手

用恐龙小游戏跑通 REA 官方案例的 5 步上手教程，竖屏 9:16，可以直接发抖音。

| 文件 | 说明 |
| --- | --- |
| `video.mp4` | 成片：1080×1920，30fps，H.264 + AAC，206 秒，响度约 -16 LUFS |
| `cover.jpg` | 封面（1080×1920，取自开场画面） |
| `subtitles.srt` | 逐句字幕，画面里已经烧录了一份；如果用平台自动字幕，上传这份可以免识别 |

源配置：`tutorials/rea-quickstart.json` · 重新渲染：`npm run tutorial:render -- rea-quickstart --overwrite`

## 标题（任选其一，≤ 30 字）

1. GitHub 一天涨 2.5 万星的 REA，小白 5 步上手
2. 让 AI 读懂任何功能？REA 保姆级实操教程
3. 用 Codex + REA 逆向恐龙游戏，再做个自己的版本

## 作品描述

爆火的开源工具 REA（Reverse Engineer Anything）到底怎么用？
用恐龙跑酷小游戏完整跑一遍：查清它为什么越跑越快 → 做一个能调速的自己的版本 → 让 AI 核对有没有算对。全程不手写代码，命令见置顶评论 👇

#AI编程 #Codex #ClaudeCode #REA #开源项目 #GitHub #AI工具 #程序员 #逆向工程 #保姆级教程

## 置顶评论（完整命令，Mac）

```
① 检查环境（需 Node.js 24 系列，≥ 24.11）
node --version
npm --version

② 给 Codex 接入 REA（先预览，再正式接入，完成后退出并重开 Codex）
npx -y rea-agents@6.4.0 setup --client codex --dry-run --json
npx -y rea-agents@6.4.0 setup --client codex --yes --json

③ 启动调试版 Chrome（调试地址 http://127.0.0.1:9222）
REA_BROWSER_DIR=$(mktemp -d /tmp/rea-dino-browser.XXXXXX)
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --remote-debugging-address=127.0.0.1 \
  --remote-debugging-port=9222 \
  --user-data-dir="$REA_BROWSER_DIR" \
  --no-first-run --no-default-browser-check \
  "https://wayou.github.io/t-rex-runner/"

官网 rea.tools ｜ 源码 github.com/morluto/rea
```

## 来源与核对

- 选题与步骤参考：蓝哥AI（X @0xlangeai）文章《REA 保姆级上手教程: Codex 实操官方案例》
  https://x.com/0xlangeai/status/2109544824135467312 。旁白、画面与提示词均为重新撰写和绘制，未搬运原文截图。
- 加速规则（SPEED 6、ACCELERATION 0.001、MAX_SPEED 13）核对自 wayou/t-rex-runner `index.js` 第 566–571 行。
- 0 / 1000 / 4000 / 10000 次更新 → 6.000 / 7.000 / 10.000 / 13.001，与 rea.tools 官方恐龙实验室一致；
  第 7000 次更新后速度为 12.999999999997897，因此会再加一次到 13.000999…。
- 视频中的命令按原教程实测版本 rea-agents 6.4.0 展示；发布时 npm 最新版为 6.5.0，可在评论区补充说明。
- 星数（单日 +25,599、累计 12 万+）为原文发布时（2026-10-12）的数据。
- 若用于商业推广，建议先联系原作者取得转载/改编许可。
