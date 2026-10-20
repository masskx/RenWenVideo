# 抖音发布包 · magpie 的错题本：AI 怎么自己维护项目

yetone 的开源项目 magpie 由 agent 写、审、合、发，19 天发了 1204 个版本。这条视频拆解它不翻车的办法：一本每晚由 agent 自己写的错题本（LESSONS.md），同一个错犯满 3 天就升成硬规则；再加上三条少见的验收标准，以及一份可以照抄的模板。竖屏 9:16，可以直接发抖音。

| 文件 | 说明 |
| --- | --- |
| `video.mp4` | 成片：1080×1920，30fps，H.264 + AAC，190 秒，响度约 -15 LUFS |
| `cover.jpg` | 封面（1080×1920，取自开场画面） |
| `subtitles.srt` | 逐句字幕，画面里已经烧录了一份；如果用平台自动字幕，上传这份可以免识别 |

源配置：`tutorials/magpie-lessons.json` · 分镜：`tutorials/magpie-lessons.storyboard.md` · 重新渲染：`npm run tutorial:render -- magpie-lessons --overwrite --crf=24`
配音：阿里云百炼 CosyVoice（`cosyvoice-v3-flash` / `longsanshu_v3`，语速 1.22）

## 标题（任选其一，≤ 30 字）

1. 19 天 1204 个版本，AI 自己维护项目靠一本错题本
2. 写、审、合、发全交给 AI，magpie 凭什么不翻车？
3. 同一个错犯满三天就成硬规则：AI 项目的错题本

## 作品描述

yetone 的开源项目 magpie，代码由 agent 编写、审查、合并和发布，19 天发了 1204 个版本。
它不翻车的秘密是一本错题本：agent 每晚复盘当天的 commit，只找返工的、不该合的、验证太糙的；同一条教训出现满 3 天，就升进代码规范，变成硬规则。
一条规则加进去，第二天发版就从 168 降到 42。模板见置顶评论 👇

#AI编程 #ClaudeCode #AIAgent #开源项目 #程序员 #软件工程 #自动化 #GitHub #AI工具 #干货分享

## 置顶评论（照抄这本错题本）

```
LESSONS.md 每条长这样（原文给的结构）：

**<一句话规则>**
- <哪个 commit / issue 出的事，后果是什么>
- <修复的 commit>
- Done right: <做对的例子>
- Seen N× (YYYY-MM-DD, YYYY-MM-DD)

用法：
① 每天让 agent 复盘一次当天的 commit，只找三种：返工的、不该合的、验证太弱的
② 同一条在 3 个不同的日子出现，就挪进代码规范（code-standards.md），之后每个 PR 逐条对
③ 合并前写清：回退测试、真实使用、没跑的检查（列为 Not run，不能省略）

项目：github.com/yetone/magpie
```

## 来源与核对

- 选题和分析来自 WquGuru（X @wquguru）的文章《yetone 的魔法：magpie 是怎么让 AI 自己维护项目的》（2026-10-12）：
  https://x.com/wquguru/status/2109650264601117141 。旁白和画面都是重写、重画的，没有搬运原文截图。
- **已核对**（2026-10-15 拉取 yetone/magpie，HEAD `35aa50cf`）：
  - `CLAUDE.md` 只有 `@AGENTS.md`、`@LESSONS.md` 两行；
  - `LESSONS.md` 的第一句、夜审的三类问题，以及“Seen 满 3 天搬进 code-standards”的规则；
  - #834 返工 4 次（v0.1.920 → .925 → .931 → .938）；
  - 验收标准里的“A check that wasn't run is listed as not run, never left out.”；
  - `gh pr merge --match-head-commit <reviewed sha>`；
  - “Don't reverse deliberate decisions.”；
  - “A tag waits for a green run”已经转正。
- **数字随时间变了**：原文发出时（10-12）转正 8 条，10-15 核对时已 15 条（视频里两个数都说了）；原文说 LESSONS.md 479 行，核对时 619 行，视频里没有用行数。
- **按原文转述、没有核实**：19 天 / 2,862 commit / 1,204 tag、OpenClaw 对照数字、10-05 发 168 版和 40 来个修复版、每天发版 168 → 42 → 15～26、PR #1339 的评论内容。“294 tags in 51 hours”这句在当前的 LESSONS.md 里已经找不到，视频没有用它。
- 画面里的 commit 列表、CI 运行条是示意（画面上标了“示意”），不是 magpie 的真实记录；PR 评论是按原文描述重画的。
- 用于商业推广前，建议先联系原作者取得转载/改编许可。
