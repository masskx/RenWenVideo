# huashu-motion 重做版 · sources（小晚 2026-10-30 采集，时间 Asia/Taipei）

## 仓库 https://github.com/alchaincyf/huashu-motion
- 协议：MIT（assets/text/LICENSE；GitHub API license.spdx_id=MIT）。第三方组件见 assets/text/THIRD_PARTY.md（GSAP、字体 OFL 等，各自协议）。
- 星数：1,892（GitHub API stargazers_count，2026-10-30 08:39 取）；页面显示 1.9k，Fork 180（见 img/shot-repo-top.png）。
- 安装：`npx skills add alchaincyf/huashu-motion`（README 第22、239行）。
- 流程（README 第17–19、278行）：读产品 → 给三个方向（关键帧）挑 → 写节奏单/整支片 → 自己写谱配乐 → 浏览器编辑器 `om studio`，按C点画面写意见只改那一处。
- 配乐本机生成、不调收费接口（README 第47行，作者自述）。
- **1.95元（作者自报）**：README 第64–68行「这支22秒的动效片……换成DeepSeek V4.1 Flash（1017版）……三轮意见……前后不到半小时，按当时的价格花了1块9毛5（缓存命中率99.4%）」。未独立复现；“按当时价格”、缓存命中率 99.4% 是前提。
- 模型差异 caveat：README 第377行「我主要在Claude Code里用Opus 5.5……不同模型的品味差别是真实存在的」。第375行「它听不见……最后一耳朵还得是你的」。
- 渲染速度：30秒片在作者14核Mac约12–15秒渲完（第322行，作者自报）。

## 素材授权
- img/*.gif：仓库 docs/media/，随仓库 MIT；均为 huashu-motion 产出片。**point-to-edit.gif 中编辑器/终端是“照真实界面重建、代码细节示意”（README 第41行）**，用时需知悉，不当真实录屏宣称。
- Grok Bot / Claude Duet 片 = 作者标注「粉丝自制，非官方」；含第三方品牌，用作演示须标“非官方粉丝片”。
- video/*.mp4：Release v0.2.0 附件（https://github.com/alchaincyf/huashu-motion/releases/tag/v0.2.0），作者发布，随仓库 MIT。huashu-motion-launch.mp4（31.1MB，>30MB）未下载，链接：https://github.com/alchaincyf/huashu-motion/releases/download/v0.2.0/huashu-motion-launch.mp4 （README 顶部 hero.gif 即其片段）。
- img/shot-*.png：小晚 headless Chrome 真实页面截图（GitHub 页面）。

## 量子位 https://www.qbitai.com/2026/10/506478.html
- 《奥特曼和Dario同台唱rap！Genspark新视频Agent上线，零基础也能拍短剧》听雨，2026-10-29 14:53。全文 assets/text/qbitai-506478.txt。
- **文末「版权所有，未经授权不得以任何形式转载及使用」** → 文章配图未下载，只引用事实要点并口头注明来源。
- 要点：Genspark Media Studio 导演LLM三档含 DeepSeek V4.1 Flash；接入20多家厂商70多个模型版本；10-27 18:00–11-04 18:00 Plus/Pro 积分五折；作者跑3个case 5万积分花约4.5万；局部重拍一次最多5段每段≥4秒；Knowledge Explainer 走 code-to-video，代码渲染本身不收积分（据官方）。

## 修订（2026-10-30 按 Eko review.md）
- 移入 assets/_excluded/（不用）：catlight-pro.gif（真人脸＋付费App）、grok-bot.gif、claude-duet.gif、grok-bot-fan-film.mp4、claude-duet-fan-film-en.mp4（粉丝片）。
- sixteen-cuts.gif：ffmpeg 删除原 GIF 第35–39帧（3.5–4.0s「冷白皮」真人画面），其余帧未改；原件 _excluded/sixteen-cuts.orig.gif。
- point-to-edit.gif：ffmpeg 裁去顶部32px编辑器顶栏（含 grok-bot-launch-20261017 项目名）；7.1–10.8s 终端段顶部58px（~/…/grok-bot-launch… 路径）boxblur 模糊；右下角 drawtext「界面示意」。原件 _excluded/point-to-edit.orig.gif。依据 README 第41行「照真实界面重建，代码细节是示意」。
- 作者原话核对：README 第377行逐字「不同模型的品味差别是真实存在的」。
- 量子位 qbitai-506478.* 仅留档不推送（版权声明）。

## 二审修订（2026-10-30 按 Eko）
- point-to-edit.gif（编辑版）移入 _excluded/point-to-edit.edited.gif：「Sales Outbound」仍可辨认，不用；按C改改为口播/上屏文字。
- qbitai-506478.html 移入 _excluded/；仅留 text/qbitai-506478.txt 要点与链接（不推送）。
- 替代画面：img/huashu-design.gif（仓库 docs/media，MIT，huashu-motion 产出片）；抽帧检查无人脸/路径/真实人名；避开「1.9秒」一格。
