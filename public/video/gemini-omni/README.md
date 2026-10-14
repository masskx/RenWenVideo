# Gemini Omni 动态片段导入区

从已登录的 Chrome Gemini 会话下载无字幕、无配乐的 9:16 动态片段后，按下面的目录放置：

```text
public/video/gemini-omni/<episode-id>/<shot-id>.mp4
```

例如：

```text
public/video/gemini-omni/slow-life/bridge.mp4
public/video/gemini-omni/slow-life/water.mp4
public/video/gemini-omni/slow-life/warm-room.mp4
```

然后运行：

```powershell
npm run video:prepare -- --episode=slow-life --audio=mute
npm run check
```

原生声策略：

- `mute`：默认方案，保留百炼旁白和 MiniMax 底乐的清晰度。
- `ambience`：适合雨、水、炉火等自然声，低音量混入。
- `keep`：仅用于没有旁白或确实需要原声的片段。
