# Sources · vibe-knowledge-douyin

Primary: 观默 @guanmo_ai X Article — https://x.com/guanmo_ai/status/2112525216924807210  
Title: 「20 天涨粉 78 万！全网爆火的「Vibe知识大赏」，保姆级教程来了！」  
Published: 2026-10-20 20:43 Asia/Taipei (API `created_at` 2026-10-20T12:43:55.000Z)  
Sibling (同源不同平台，勿照搬长文): `vibe-knowledge-wechat` / `/workspace/wechat/45/45-教程-Vibe知识大赏代码出片.md`；审稿 `/workspace/pipeline/episodes/vibe-knowledge-wechat/review.md`

| Claim (script) | Shot | Source | Notes |
|---|---|---|---|
| 据称有人靠「Vibe知识大赏」二十天涨粉近八十万 | 1 | 观默原文：比特新语 10/1 首更后约 20 天，B站约 66.2 万 + 抖音约 12.7 万 ≈78 万 | **据观默称**；口播用「据称」「近八十万」。B站粉 2026-10-23 API 约 71 万（wechat sources 独立核）量级旁证；抖音粉未在本 douyin 脚本独立打开主页核 |
| 先别急着学知识点；这类片火因画面用代码写出、能跟节拍动 | 2 | 观默开篇审美 + **本片判断** | 强调「讲产线不是再讲知识点」；与 wechat 长文分工 |
| ① 先对标：话题页看涨得猛的一条怎么动；先别开写 | 3 | 观默「02｜找爆款」 + 本片判断「先别开写」 | 不引流具体账号 |
| ② 先抽视觉参数；跳过易成旧PPT | 4 | 观默「04｜视觉风格」 + **本片判断**「跳过→旧PPT」 | **不贴**提示词全文 |
| ③ 强模型 + Canvas/Playwright/ffmpeg；样片拦返工 | 5 | 观默「01」「05」 + **本片判断**「样片拦返工」 | 模型「强模型（如 Claude Opus 一类）」；不展开绕路账号 |
| 剪映只找 BGM | 5 notes | 观默「01」「05」 | 成片不用剪映剪 |
| 一支片子一个知识点 = 约束提示词不发散 | 6 | 观默「02」原意 + **本片判断**「约束提示词」 | 收束句，非鸡汤 |
| 话题播放约 12 亿；10/31 前扶持 | （可选屏显，口播默认不读） | 观默；21jingji 约 11.7 亿；BetterOPC 等约 12.2 亿 | **据称/话题页显示**；规则会变，脚本不承诺扶持 |

## 据观默称清单（未在本 douyin 脚本独立核验，口播已软化）

- 比特新语抖音约 12.7 万粉；合计近 78 万（原帖口径）
- Nico / 叁号暗房 Logos 条数·粉·赞（本脚本未采用）
- 单条播放/点赞例句（126.3万 / 309.6万 / 365.2万 等）— 本脚本未念
- 话题约 12 亿播放、10/31 前官方流量扶持

## 与 vibe-knowledge-wechat 关系

- 同源：同一 X Article。
- 公众号：长教程编译（工具表、五步/四步、标题四套路、文末观点占位）。
- 本抖音：只压「代码出片产线」+ 自己的判断句（先别学知识点 / 抽参数拦 PPT / 样片拦返工 / 一支一个=约束提示词）；**不**复述四套路、**不**贴提示词、**不**导流公众号。
- 2026-10-23：赛博小晚按飞龙要求覆盖 Eko 临时稿；角度锁定「怎么做出 vibe 知识片」，不是再讲一个知识点。

## 素材 URL（已下载至 `assets/`）

| File | URL | Use |
|---|---|---|
| `HVEyeGWbsAAB8-U.jpg` / `ref_guanmo_cover_banner.jpg` | https://pbs.twimg.com/media/HVEyeGWbsAAB8-U.jpg | 封面参考（须去「观默 @guanmo_ai」水印） |
| `HVEjFgsaAAEvkUC.jpg` / `ref_topic_page_grid.jpg` | https://pbs.twimg.com/media/HVEjFgsaAAEvkUC.jpg | Shot 3 话题页网格（脱敏） |
| `HVEkyZwbEAEjawk.jpg` / `ref_topic_rules_12yi.jpg` | https://pbs.twimg.com/media/HVEkyZwbEAEjawk.jpg | 话题规则/约12亿屏显参考（可选） |
| `HVEnUDtasAA71YR.jpg` / `ref_jianying_bgm.jpg` | https://pbs.twimg.com/media/HVEnUDtasAA71YR.jpg | 剪映找 BGM 示意（可选；勿打曲名字幕） |

抓取备注：2026-10-23 Asia/Taipei 本机 curl 下载成功；X `get_posts_by_id` 复核 title/plain_text 与 wechat review 一致。
