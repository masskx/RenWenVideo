# huashu-motion 抖音重做版 · 素材独立审（Eko，2026-10-30，Asia/Taipei）

结论：**有条件通过**——改完下列必改项即可推送 RenWenVideo（分支+PR，不进 main）。本次未推送、未联系 agent。

## 核对结果
- 来源：仓库 alchaincyf/huashu-motion，GitHub API 确认 MIT、1892星/180 fork；本地 README 与线上一致。4 支 MP4 = Release v0.2.0 附件（2026-10-22 17:08 发布），9 个 GIF = 仓库 docs/media，均为 huashu-motion 产出片，随 MIT。两张 shot-*.png 为真实 GitHub 页面截图。
- 1.95元：README 第68行原文「按当时的价格花了1块9毛5（缓存命中率99.4%）」；sources/materials 已标作者自报、按当时价格 ✅。
- point-to-edit.gif：README 第41行「编辑器和终端照真实界面重建，代码细节是示意」；materials 已注明 ✅。
- Grok Bot / Claude Duet：README 自标「粉丝自制，非官方」，sources 已要求标注 ✅。
- 量子位：版权声明禁转载，配图未下载，只口述事实 ✅。
- 「便宜X倍」：materials 明确禁止 ✅。
- 代码画的图：无。所有图都是仓库产出片或真实页面截图 ✅。
- 引流/资料包/诱导评论：未发现 ✅。
- 「豆子花叔」卡通形象（THIRD_PARTY.md：不随 MIT 授权）：抽帧检查 9 GIF + 4 MP4，未见 ✅。

## 必改项
1. **catlight-pro.gif 不当主力镜头（建议不用）**：画面是真人女性脸部特写，而且是开发者自己的付费 App「小猫补光灯Pro」。这里有肖像风险，也有替付费 App 带货之嫌；旧片也特意避开了这类镜头。materials「竖屏主力」要改。sixteen-cuts.gif 第7–8格（「冷白皮」）含同一真人画面，使用时要剪掉这几格。
2. **point-to-edit.gif 上屏须加「界面示意」角标**，不能说成真实录屏。参照旧片做法，裁掉编辑器顶栏和终端里的项目路径（Sales Outbound / grok-bot 项目）。
3. **1.95元上屏须带「作者自报·按当时价格」**，不能写成「只要1块9」这种普适承诺。同时配一句模型品味有差（README 第377行），不暗示便宜模型效果相同。
4. **Genspark 对比**：只能口头带一句「国内也有同类产品用了同款模型」，不要把 4.5万积分和 1.95元放进同一个画面或同一句话里比较。两边计价不可换算。
5. **粉丝片**：用到 Grok Bot / Claude Duet 的任何镜头都要叠「非官方粉丝片」；不用就从推送清单里删掉（建议不用，30–40秒用不上）。
6. **和旧片拉开差异**：旧片（PR #11，10-20，54.2秒）已经用过 DeepSeek 片开场、¥1.95「据开发者自述」、按C改，都是同一批素材。新版应以「成本账」做主线（缓存命中率99.4%、不到半小时、三轮意见、本机配乐不调收费接口），开场换成 hero.gif 或 score-first.gif。DeepSeek 镜头只做证据短镜头，按C改只占一拍。

## 通过后推送清单（inputs/huashu-motion-1d95/，分支+PR）
- materials.md（按必改项 1/4/5 修订）、sources.md、review.md
- assets/img：hero.gif、score-first.gif、sixteen-cuts.gif（附注剪掉真人格）、point-to-edit.gif（附注示意+裁顶栏）、deepseek-flash.gif、huashu-design.gif、shot-repo-top.png、shot-release-v020.png
- assets/video：deepseek-v4.1-flash-specimen.mp4、huashu-design-launch.mp4
- assets/text：LICENSE、THIRD_PARTY.md、README.md、repo.json
- **不推**：catlight-pro.gif；qbitai-506478.html/.txt（版权声明，只在 sources 里留链接和要点）；grok-bot.gif / claude-duet.gif / 两支粉丝 MP4（除非决定使用并加标注）

## Eko 复审（2026-10-30 08:49 台北时间）
**结论：未通过（1 项未达标），其余全部改到位。** 仍不推送 RenWenVideo。

逐项（我自己做了抽帧拼图：sixteen-cuts 全 75 帧，point-to-edit 全 139 帧，并对比 .orig）：
- ✅ catlight-pro.gif 和 4 个粉丝片（2 GIF + 2 MP4）已移到 assets/_excluded/，img/ 和 video/ 里都没有了。
- ✅ sixteen-cuts.gif：80→75 帧，「冷白皮」那组手机真人画面已经不在；全片 75 帧逐格看过，没有真人脸（剩下的只有古画、漫画、插画风格人物，都是生成画面）。
- ✅ point-to-edit.gif：顶栏裁掉了（473→441 高）；终端头两行（窗口标题 ~/my-product、「~/…/grok-bot-launch-20261017」路径）在第 88–103 帧都模糊到无法辨认；每帧右下角都有「界面示意」角标。
- ❌ **point-to-edit.gif 里「Sales Outbound」仍清晰可读**：第 0–47 帧编辑器里的演示页标题，以及第 88–103 帧右侧 frame.png/zoom.png 小窗（zoom 里是大字「es Outbound」和副标题），都能直接读出来。只模糊终端路径不够，删掉终端段也不够，因为前面的编辑器段同样有这个标题。
  **改法（二选一）**：① 每一帧都模糊或遮住演示页标题和副标题、frame/zoom 小窗里的文字，再交复审；② point-to-edit.gif 整个移到 _excluded/，「按C改」只用口播或文字说明，加一拍其他产出片。
- ✅ materials.md 重写合格：开场换成 hero/score-first；成本账做主线；1.95 同屏标「作者自报·按当时价格」，并配 README 第 377 行原句（已对照原文逐字一致）；Genspark 只口播、不同屏不同句、不比倍数；不上量子位配图；排除清单完整。
  - 附带要求：point-to-edit 如果按②删掉，materials.md 里「按C改…已带界面示意角标」和可用素材清单要同步更新。

另外提醒：assets/text/qbitai-506478.html 还在 text/ 目录里（上次已要求不推，只在 sources 留链接和要点），推送时注意排除，或者也移到 _excluded/。

## Eko 三审（2026-10-30 08:51 台北时间）
**结论：通过**（可以推送 RenWenVideo 的分支+PR；本次没有推送）

- ✅ point-to-edit.gif（原件和编辑版）、qbitai-506478.html 都已在 _excluded/，img/ 里已没有 point-to-edit。
- ✅ 「按C改」已改成口播/上屏文字，materials 第 9 行写明不用 point-to-edit。
- ✅ huashu-design.gif 自己抽帧检查了全部 90 帧，抽了 4 帧看原尺寸：都是产出片的版式页（旧书店、唱片、月薪、慢火、写、摩登焙香、改线47、2847公里、城市影展、相机等）和提示词条「给社区旧书店做一份众筹 PPT」。没有真人脸、没有终端或本机路径、没有可辨认的真人名字。「1.9秒 从按下快门到出片」那一格在第 66–71 帧附近，materials 第 37 行已经注明剪辑时避开 ✅。
- ✅ materials.md、sources.md 已同步：排除清单有 point-to-edit 两个版本和 qbitai.html；sources 第 32–34 行记录了替换的理由。sources 第 14、27 行仍然保留着 point-to-edit 的处理说明，作为留档可以，不影响。

## 推送清单（inputs/huashu-motion-1d95/，分支+PR，不进 main）
- materials.md、sources.md、review.md
- assets/img：hero.gif、score-first.gif、sixteen-cuts.gif、deepseek-flash.gif、huashu-design.gif、shot-repo-top.png、shot-release-v020.png
- assets/video：deepseek-v4.1-flash-specimen.mp4、huashu-design-launch.mp4
- assets/text：LICENSE、THIRD_PARTY.md、README.md、README.en.md、repo.json
- **不推**：assets/_excluded/ 整个目录；**assets/text/qbitai-506478.txt**（量子位全文，有版权声明，目前还在 text/ 里，推送时必须排除，最好移到 _excluded/）
