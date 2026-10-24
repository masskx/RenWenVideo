# kimi-k3-1-pro 素材包

官方博客 https://www.kimi.com/en/blog/kimi-k3-1-pro 里的演示视频（1080p HLS 原样封装成 mp4）。原片太大（共约 150 MB），`material/` 不提交；重新下载：

```bash
ffmpeg -i https://statics.kimi.ai/kimi-blogs/kimi-k3-1/<日期>/<名字>/hls/1080p/index.m3u8 -c copy -bsf:a aac_adtstoasc inputs/kimi-k3-1-pro/material/<名字>.mp4
```

片子里用到的片段裁好、静音后放在 `public/video/kimi-k3-1-pro/`（提交）。上屏右下角「@Kimi｜案例展示」。

| 文件 | 日期目录 | 内容 | 长度 | 用在 / 入出点 |
|---|---|---|---|---|
| celestial-palace.mp4 | 20261023 | 虚幻引擎天宫、侠客战斗、巨龙 | 40.9 s | 钩子（龙 29–40 s）、结尾（柱廊 0–9 s） |
| cologne-interior.mp4 | 20261023 | Blender 里教堂从白模长出来，最后打光 | 19.1 s | Blender 一场（0–19 s 加速） |
| turbofan.mp4 | 20261023 | FreeCAD 涡扇发动机装配、剖开、旋转 | 9.9 s | 发动机一场 |
| modular-lamp-trimesh.mp4 | 20261022 | 台灯拆件 → 3D 打印 → 点亮 | 29.1 s | 台灯一场（14–29 s） |
| walking-sim.mp4 | 20261022 | 肌肉人从摔倒到走路，片尾有数字表 | 35.0 s | 走路一场（3–28 s） |
| airport-rainforest.mp4 | 20261023 | 机场室内雨林，橙色线框 → 成片 | 19.5 s | 片名墙缩略图 |
| sword-flight.mp4 | 20261023 | 虚幻引擎御剑飞行 | 15.8 s | 片名墙缩略图 |
| godot-adventure.mp4 | 20261023 | Godot 3D 冒险游戏 | 48.6 s | 片名墙缩略图 |
| robot-film.mp4 | 20261022 | Blender 机器人短片 | 14.0 s | 片名墙缩略图 |
| kw-nvda-model-v2.mp4 | 20261023 | Kimi Work 里做英伟达财务模型 | 26.0 s | 片名墙缩略图 |

`frames/`：取色用的截帧。

## 没用的素材和原因

- 财务模型录屏：手机上表格字太小、读不了；只当片名墙里的一个缩略图。
- 各视频的原声：外部素材一律静音。

## 出处（不上屏）

- 官方博客：https://www.kimi.com/en/blog/kimi-k3-1-pro （同文 https://www.kimi.ai/blog/kimi-k3-1-pro ）
- IT 之家：https://www.ithome.com/1/017/284.htm
- the-decoder：https://the-decoder.com/chinese-ai-model-kimi-k3-1-pro-is-closing-in-on-anthropics-claude-opus-5-5/
- Simon Willison：https://simonwillison.net/2026/Oct/23/kimi-k31-pro/
