# 哲理视频工作台 API

供 Codex Skill 或其他自动化工具调用的 REST API。

**Base URL:** `http://localhost:3210`

普通预览不需要本服务：直接打开上级目录的 `workbench.html`，选择 `out/` 文件夹即可。

## 快速验证

```bash
curl http://localhost:3210/api/system
```

## 视频管理

### 获取视频列表
```
GET /api/episodes
```
返回所有 episode 摘要（id、标题、时长、渲染状态、发布状态）。

### 获取视频详情
```
GET /api/episodes/:id
```
返回完整 episode JSON 配置。

### 创建新视频
```
POST /api/episodes
Content-Type: application/json

{
  "title": "静心",
  "template": "slow-life"
}
```
返回 `{id, title}`。

### 更新视频
```
PUT /api/episodes/:id
Content-Type: application/json

{完整 episode JSON}
```

### 删除视频
```
DELETE /api/episodes/:id
```

## 渲染

### 触发渲染
```
POST /api/render
Content-Type: application/json

{
  "episodeId": "solitude",
  "draft": false
}
```
- `draft: true` → 720×1280 快速预览
- `draft: false` → 1080×1920 正式导出

### 查询渲染状态
```
GET /api/render/status
```
返回 `{running, episodeId, status, logs}`。

## 素材

### 获取素材列表
```
GET /api/assets
```
返回 `{images, videos, audio}` 数组。

### 获取素材文件
```
GET /api/asset-file/images/01-bridge.png
```

## 工作台数据

### 获取工作台数据
```
GET /api/workbench
```

### 更新工作台数据（发布状态等）
```
PUT /api/workbench
Content-Type: application/json

{
  "version": 1,
  "episodes": {
    "solitude": {
      "published": true,
      "publishedAt": "2026-09-18"
    }
  },
  "topics": []
}
```

### 获取生产概览
```
GET /api/overview
```
返回项目复刻规范摘要、提供商连接状态、素材数量和每条视频的规范分数。不会返回任何密钥值。

### 获取提供商状态
```
GET /api/providers
```
返回 Images2、豆包 Seedream、百炼 CosyVoice TTS 的 `configured` 状态、模型名和环境变量名。

### 获取复刻规范
```
GET /api/spec
```
返回 `config/replication-spec.json` 的完整内容。

## Skill 集成示例流程

1. 创建视频：`POST /api/episodes`
2. 编写文案：`PUT /api/episodes/:id`（更新 captions）
3. 触发渲染：`POST /api/render`
4. 轮询状态：`GET /api/render/status`（每2秒）
5. 渲染完成后，视频在 `zen-video/out/` 目录
6. 标记发布：`PUT /api/workbench`
