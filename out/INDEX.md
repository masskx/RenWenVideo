# 成片目录

> 本文件由 `npm run catalog` 自动生成（渲染脚本结束时也会更新），请勿手改。

每条视频一个文件夹：`out/<系列>/<id>/`，里面的 mp4 / 封面 / srt 就是上传抖音需要的全部文件；
草稿、静音版和抽帧截图放在各自的 `drafts/` 子目录，不进版本库。

## 哲理短片（`zen/`）· 7 条

源配置：`episodes/<id>.json` · 渲染：`npm run render -- episodes/<id>.json`

| ID | 标题 | 时长 | 规格 | 大小 | 渲染时间 | 发布 | 文件 |
|---|---|---|---|---|---|---|---|
| `leave-space` | 留白 | 0:33 | 1080×1920 · 25fps | 33.1 MB | 2026-09-19 | 待发布 | [视频](zen/leave-space/leave-space.mp4) · [字幕](zen/leave-space/leave-space.srt) |
| `listen-rain` | 听雨 | 0:33 | 1080×1920 · 25fps | 39.9 MB | 2026-09-19 | 待发布 | [视频](zen/listen-rain/listen-rain.mp4) · [字幕](zen/listen-rain/listen-rain.srt) |
| `morning-tea` | 晨光 | 0:33 | 1080×1920 · 25fps | 36.6 MB | 2026-09-19 | 待发布 | [视频](zen/morning-tea/morning-tea.mp4) · [字幕](zen/morning-tea/morning-tea.srt) |
| `self-kindness` | 自渡 | 0:33 | 1080×1920 · 25fps | 42.6 MB | 2026-09-19 | 待发布 | [视频](zen/self-kindness/self-kindness.mp4) · [字幕](zen/self-kindness/self-kindness.srt) |
| `slow-life` | 慢下来 | 0:33 | 1080×1920 · 25fps | 39.5 MB | 2026-09-19 | 待发布 | [视频](zen/slow-life/slow-life.mp4) · [字幕](zen/slow-life/slow-life.srt) |
| `solitude` | 独处 | 0:33 | 1080×1920 · 25fps | 38.5 MB | 2026-09-19 | 待发布 | [视频](zen/solitude/solitude.mp4) · [字幕](zen/solitude/solitude.srt) |
| `walk-inward` | 向内走 | 0:33 | 1080×1920 · 25fps | 44.3 MB | 2026-09-19 | 待发布 | [视频](zen/walk-inward/walk-inward.mp4) · [字幕](zen/walk-inward/walk-inward.srt) |

## 科普教程（`tutorials/`）· 1 条

源配置：`tutorials/<id>/tutorial.json` · 渲染：`npm run tutorial:render -- <id>`

| ID | 标题 | 时长 | 规格 | 大小 | 渲染时间 | 发布 | 文件 |
|---|---|---|---|---|---|---|---|
| `rea-quickstart` | REA 保姆级上手 | 3:26 | 1080×1920 · 30fps | 42.8 MB | 2026-10-14 | 待发布 | [视频](tutorials/rea-quickstart/rea-quickstart.mp4) · [封面](tutorials/rea-quickstart/rea-quickstart-cover.jpg) · [字幕](tutorials/rea-quickstart/rea-quickstart.srt) · [发布文案](../tutorials/rea-quickstart/publish.md) |
