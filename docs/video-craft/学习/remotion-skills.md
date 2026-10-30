# remotion-dev/skills：Remotion 官方给 agent 的最佳实践

> 2026-10-30 读，版本 30d4553（对应 `@remotion/skills` 4.0.539；我们装的是 4.0.524）。仓库没有许可证文件（来自 remotion 单仓库 `packages/skills`），只记录版本（`prompt-library/vendor/remotion-dev__skills/30d4553/`，无文件），这里记要点。安装：`npx skills add remotion-dev/skills`。原仓库：https://github.com/remotion-dev/skills

## 结构

一个路由 `SKILL.md`，按任务加载子文档：create（新建）、markup（写组件的规矩，40 多个专题：音频、字幕、转场、动效模糊、测量文字、调色、光斑、音频可视化、静音检测、Lottie、3D……）、captions（转录、导入 SRT、显示字幕）、maps（Mapbox / MapLibre / MapTiler / Cesium 飞行）、multimedia、render、studio、upgrade。

## 对我们有用的几条

| 专题 | 要点 | 我们 |
|---|---|---|
| motion-blur | `<HtmlInCanvasMotionBlur>`（≥ 4.0.529）在小数帧取样再平均，快门角默认 180°、8 个样本；旧的 `<CameraMotionBlur>` / `<Trail>` 在 4.0.524 就有 | 没用过。快甩镜头（suanli 的俯冲、telestrator 的倒带）可以先用 `<CameraMotionBlur>` 包住那一场试 |
| measuring-text | `@remotion/layout-utils` 的 `fitText` / `fillTextBox`：按容器宽度算字号、检查会不会溢出；**先等字体加载完再量** | 我们靠肉眼和 `scan.mjs --phone` 找溢出；封面标题、下三分之一条可以改成 `fitText` 自动算 |
| light-leaks | `@remotion/effects` 的 `lightLeak()`（≥ 4.0.500），放在两场之间的 overlay 上 | 可作为某些模板的转场；不要默认用 |
| silence-detection | 用音频找静音段，自动裁口播 | 我们的 MiniMax 时间线已经有词级时间戳，不需要 |
| captions | 词级时间戳 → 分页显示，`createTikTokStyleCaptions` | 我们的字幕组件（`CaptionToast` / `CaptionLabel` 等）是按模板定制的，不换 |
| maps | MapLibre / MapTiler 的渲染稳定性：等瓦片加载完再截帧（`delayRender`），固定缩放级别 | satellite-briefing 那类片子要用地图时先看这一篇 |
| 预览 | 先开 Studio 让用户看着改，不默认渲染 | 我们在云容器里，靠风格帧和 `frames.mjs` 代替 |

## 结论

不换管线；三件事值得试：快甩镜头的运动模糊、`fitText` 管封面和标题条的字号、做地图片时照它的“等瓦片”写法。升级 Remotion 到 ≥ 4.0.529 之前先跑一遍 `npm run lint` 和一支旧片的渲染对比。
