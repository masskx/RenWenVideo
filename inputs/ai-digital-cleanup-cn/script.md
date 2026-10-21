# 用 AI 清掉你在网上留下的痕迹（中国版）· 视频素材包

> 时长 ~85s。**This script overrides the default ≤60s rule (target 80–90s, per request 60~90s).**
> 风格：9:16, 1080×1920, dark tech, all fonts ≥40px, follow reference episode `deepseek-vs-opus55` in masskx/RenWenVideo.
> Voice: user's Volcengine/豆包 cloned voice ONLY. No 公众号 mention, no links on screen/narration, no next-episode teaser.

---

## 0. 内部备注（INTERNAL — never shown in video）
- Source post (Turkish thread, 2026-10-19, ~600万浏览 / 4万赞 / 13.5万收藏 at fetch time): https://x.com/paramuhendisim/status/2112093385695592585
- Do NOT show author's name/handle/avatar anywhere. Original post images are only a fingerprint graphic + Claude logo → not used. No external footage needed; all visuals are self-made cards / screen-recordings of the user's OWN phone with personal data blurred.
- If any external clip is added later: mute + label 「案例展示」.

## 1. 原帖方法提炼
作者用 Claude 花 6 小时：删掉 47 条含姓名/电话/住址的记录，关掉 12 个旧账号。六步：
1. **先看清暴露面**：搜自己的名字、邮箱、手机号，截图 → 让 AI 分类（数据中介/社媒/旧账号/文章）并排删除优先级。
2. **数据中介站**（美国 Spokeo 等）：让 AI 写 CCPA 退出申请。
3. **僵尸账号**：用 justdeleteme 找注销入口，问 AI「怎么彻底删除而不只是停用」。
4. **按本地法律发删除请求**（土耳其 KVKK / 欧盟 GDPR），AI 写正式函件，带身份核验和回复期限。
5. **删不掉就用新内容压下去**（正面内容 SEO）。
6. **查邮箱是否出现在泄露事件**（haveibeenpwned）→ AI 按风险排：改密码 / 开两步验证 / 删号。
附：注册新服务用一次性邮箱别名；换隐私浏览器。
核心：AI 替代了「律师写函 + 找入口 + 排优先级」的活。

**本土化映射**：数据中介/CCPA → 国内对应是《个人信息保护法》第47条删除权；搜索引擎自查 → 一证通查 + 一键查卡；justdeleteme → 各 App 官方注销路径；投诉 → 12321。第5步（SEO 压制）和 haveibeenpwned 在视频里不讲（前者偏营销、后者需外网且画面涉「泄露」敏感词）。

## 2. 国内合法自查 / 注销 / 维权渠道（2026-10-21 核实）

| 渠道 | 能做什么 | 入口 | 出处 | 状态 |
|---|---|---|---|---|
| 工信部「一证通查」（电话卡） | 查本人名下有几张手机卡 | 微信公众号「工信微报」→服务→政务服务→一证通查；或「国务院客户端」「国家政务服务平台」小程序、支付宝「一证通查」小程序、运营商营业厅（带身份证） | 新华网/人民日报 2025-12-19 http://www.news.cn/law/20251219/f12b2348f0b443d39803b8a5460d0ac9/c.html ；江苏检察网 2026-06 https://www.jsjc.gov.cn/yaowen/202606/t20260616_1337886.shtml | ✅ |
| 「一证通查」（互联网账号，原2.0） | 查本人手机号关联了多少个 App 账号（覆盖微信、支付宝、抖音、美团、京东、小红书、拼多多等 25 款）；结果 48 小时内由 10699000 短信回复；页面有「解绑与明细查询」指引 | 同上，选「互联网账号」，填姓名、身份证后六位、手机号、验证码 | 同上；工信部福建通管局 https://fjca.miit.gov.cn/xwdt/bsyw/art/2022/art_64c85432b07e417e948667d793499d67.html ；武汉市政府 2024-12（扩至25款）https://www.wuhan.gov.cn/ztzl/24zt/csrl/202412/t20241202_2492350.shtml | ✅（只给数量，明细需去各平台查） |
| 云闪付「一键查卡」 | 查本人名下各银行银行卡（数量、银行、借/贷记、脱敏卡号）；24h 出报告，7 天可查一次 | 云闪付 App 首页搜索「一键查卡」→人脸+短信验证 | 中国银联 https://cn.unionpay.com/upowhtml/cn/templates/newInfo-nosub/7885004da382485e8bde5a0ba000fdd3/20220629145824.html ；兴业银行 2026-07 资料 https://download.cib.com.cn/netbank/download/cn/20260710_1.pdf | ✅（只在云闪付 App 内，别的渠道都是假的） |
| 「码号助手」/「一号通查」一键解绑 | 2022 年信通院试运行的「一键解绑」 | — | IT之家 https://www.ithome.com/0/623/692.htm （试运行、需完善） | ⚠️ **未能核实现在可用**，视频里不提 |
| 微信注销 | 15 天内重新登录可撤销 | 我→设置→账号与安全→微信安全中心→注销账号（需先注销微信支付、解绑公众号/小程序管理员） | https://cs.help.wechat.com/hc/zh-cn/articles/16404042981775 | ✅ |
| QQ 注销 | 15 天冷静期，仅手机 QQ | 头像→设置→账号与安全→更多安全设置→注销账号 | https://kf.qq.com/faq/1803146n2yMr180314MbIfER.html | ✅ |
| 微博注销 | 需先解除第三方授权 | 我→设置→账号与安全→注销账号 | https://kefu.weibo.com/faqdetail?id=20690 | ✅ |
| 抖音注销 | 一般 7 天冷静期 | 我→右上角☰→设置→账号与安全→抖音安全中心→注销账号 | 官方《抖音注销须知》https://sf3-cdn-tos.douyinstatic.com/obj/ies-hotsoon-draft/douyin_agreement/9ad46199-6a75-4c7b-b380-e7c128680a1f.html | ✅（路径来自第三方教程，以 App 内为准） |
| 支付宝注销 | | 我的→设置→安全中心→永久注销账号 | 第三方测评转述，未见官方页 | ⚠️ 路径以 App 内为准 |
| 淘宝注销 | 条件较多（如近期无交易） | 设置→账户与安全→注销账户 | 第三方测评转述 | ⚠️ 路径以 App 内为准 |
| 《个人信息保护法》第47条 删除权 | 目的已达成/不再必要、停止服务、撤回同意、违法违约处理时，平台应删除，未删可请求删除 | 向平台客服/隐私政策里的个人信息保护联系方式提交 | 中国人大网 http://www.npc.gov.cn/npc/c2/c30834/202108/t20210820_313088.html | ✅ |
| 同法第50条 | 平台须建立便捷的申请受理机制；拒绝须说明理由；被拒可起诉 | — | 同上；网信办 https://www.cac.gov.cn/2021-08/20/c_1631050028355286.htm | ✅（注：法律没写具体回复天数，申请函里写「请在合理期限内」或参照平台隐私政策承诺的时限，不要写「法定30天」） |
| 12321 举报中心 | 投诉 App/小程序/网站「账号注销难」「未提供更正或删除个人信息功能」「个人信息泄露」等 | www.12321.cn → 投诉个人信息泄露；公众号「12321受理中心」→我要投诉；电话 010-12321（咨询） | https://www.12321.cn/user ；https://www.12321.cn/single?tpl=guide | ✅ |

## 3. 配套提示词（只针对本人信息）

**P1 账号盘点清单**
```
我要做一次个人账号大扫除。下面是我能想起来的注册过的App/网站、一证通查短信结果（只有数量）、以及我手机里装过的App列表：
[粘贴]
请：1）按「在用/半年没用/完全不记得」分三类做成表格；2）每个标出风险高低（是否绑了银行卡、实名、存了地址）；3）给出处理建议：保留并加固 / 解绑手机号 / 注销；4）按优先级排序，高风险的排前面。
```

**P2 注销前检查 + 彻底删除**
```
我想注销【平台名】账号，要求是数据真的删除，不只是停用。请告诉我：1）注销前要先处理什么（余额、绑定的支付、第三方授权、会员自动续费、我是管理员的群/店铺）；2）该平台一般的注销入口路径（提示我以App内为准）；3）冷静期是多久、期间不要做什么；4）注销后还可能保留哪些数据、依据什么。
```

**P3 删除个人信息申请函（个保法）**
```
帮我写一封给【公司/平台名】的个人信息删除申请，依据《个人信息保护法》第四十七条和第五十条。我的情况：【账号已不用/我撤回同意/它在没必要的情况下还保存我的信息】。要求：语气正式克制；写明需要删除的信息范围；说明我可以配合身份核验（不要在函里直接写身份证号全号）；请对方在合理期限内书面答复，如拒绝请说明理由；控制在400字内。
```

**P4 隐私政策审查**
```
下面是【App名】的隐私政策全文：[粘贴]
请用大白话告诉我：1）它收集了我哪些信息，哪些是非必要的；2）会共享给谁；3）保存多久；4）在哪里、用什么方式能申请查阅/删除/注销；5）有没有我应该马上去设置里关掉的选项。
```

**P5 自己公开信息的脱敏自查**
```
下面是我自己的朋友圈/主页简介/最近发布内容的文字和截图描述：[粘贴，只放我自己的]
请帮我找出可能暴露我隐私的点（真实全名、手机号、住址/小区、单位、学校、车牌、快递单、定位、孩子信息、作息规律），每条给出风险等级和改法（删掉/打码/设为仅自己可见）。
```

## 4. Script (storyboard EN / narration & on-screen text CN verbatim)

Global: dark navy/black bg, neon cyan + amber accents, monospace "terminal" cards, big Chinese captions ≥56px, sub text ≥40px. All phone screens = mock UI cards or user's OWN phone recordings with every number/name/ID heavily blurred. Show the prompts as typed-in chat cards (any generic AI chat UI, no brand needed; may say 「任何大模型都行」).

| # | Time | Visual (EN) | Narration (CN, verbatim) | On-screen text (CN, verbatim) |
|---|---|---|---|---|
| 1 | 0–4s | FRAME 0: huge counter animating 0→25, a phone icon in the center with lines shooting out to 25 app icons (generic shapes, no logos). | 你的手机号，可能绑着你早就忘了的二十几个账号。 | 你的手机号<br>绑了多少个账号？ |
| 2 | 4–9s | Split: left "6 小时" clock, right checklist ticking. Label small 「海外博主实测」. | 有人用 AI 花了六个小时，删掉四十七条个人记录，关掉十二个旧账号。国内版，我教你怎么做。 | 6小时 · 47条记录 · 12个旧账号 |
| 3 | 9–12s | Roadmap card with 4 steps lighting up. | 一共四步，全程合法，只查你自己。 | ①查 ②排 ③删 ④投诉 |
| 4 | 12–24s | Mock flow: WeChat search bar → 「工信微报」→ 服务 → 政务服务 → 一证通查 → toggle 「互联网账号」. Inputs blurred. Then SMS bubble from 10699000 "关联账号 N 个". | 第一步，查。微信搜工信微报，点服务、政务服务、一证通查，选互联网账号，填手机号和身份证后六位，四十八小时内短信告诉你，你的号绑了多少个App账号。 | 第一步：一证通查<br>工信微报 › 服务 › 政务服务 › 一证通查 |
| 5 | 24–31s | Mock 云闪付 search bar typing 「一键查卡」→ report card with masked card numbers ****. Warning sticker. | 顺手再用云闪付搜一键查卡，看看名下有没有你不知道的银行卡。这个功能只在云闪付里，别的渠道找你查卡的都是骗子。 | 云闪付搜「一键查卡」<br>⚠ 只在云闪付App内 |
| 6 | 31–43s | AI chat card: user pastes app list (P1 shortened), AI returns a table with 3 color-coded rows: 保留加固 / 解绑 / 注销. | 第二步，排。把一证通查的结果和你记得的App全丢给AI，让它按在用、半年没用、完全不记得分三类，再按绑没绑银行卡、有没有实名排风险。十分钟出一张清单。 | 第二步：让AI排优先级<br>保留加固 · 解绑 · 注销 |
| 7 | 43–58s | Path cards flipping fast, each ≤2s: 微信 / QQ / 抖音 / 微博 paths (text from section 2). Then AI chat card for P2 answer bullets: 余额 / 支付 / 授权 / 续费. | 第三步，删。微信在设置、账号与安全、安全中心里注销；抖音在账号与安全、抖音安全中心里。注销前先问AI：要先清哪些东西？余额、支付、第三方授权、自动续费，漏一个就注销失败。 | 第三步：注销前先问AI<br>余额 · 支付 · 授权 · 续费 |
| 8 | 58–70s | Law card: 「个人信息保护法 第四十七条 · 删除权」highlight; AI generates a short formal letter (P3) scrolling. | 有的平台不给注销按钮怎么办？个人信息保护法第四十七条，你有删除权。让AI帮你写一封删除申请，发给客服，平台拒绝必须说明理由。 | 个保法第47条：你有删除权<br>AI 一键写申请函 |
| 9 | 70–78s | 12321 mock form card with dropdown highlighted 「账号注销难」「未提供更正或删除个人信息功能」. | 第四步，还是不理你，就去一二三二一投诉，类型直接选账号注销难。 | 第四步：12321 投诉<br>选「账号注销难」 |
| 10 | 78–86s | Recap 4 icons + prompt-pack cover mock 「个人信息大扫除 · 提示词包」. | 五条提示词我整理好了，评论区扣「清理」，我把资料包放在主页。花一个下午，把自己从网上收拾干净。 | 评论区扣「清理」<br>领提示词包 |

Total ≈ 86s.

### Compliance / Douyin review notes (EN)
- Never put on screen or in narration: 黑产, 开盒, 人肉, 社工库, 泄露库, 查他人, 买数据, 爬虫, 恢复聊天记录. Use 「个人信息」「自查」「注销」「删除权」 only. 「泄露」 appears only inside the official 12321 form label — avoid showing it in big captions.
- Every query step must visibly say/imply 本人: blur all real numbers/IDs; never type a third party's info even as demo.
- Do not show third-party data-broker sites, haveibeenpwned, or Telegram/YouTube links from the source thread.
- Do not claim 「法定30天回复」 — PIPL has no fixed deadline. Do not claim one-click unbinding (码号/一号通查) — unverified.
- Avoid 「一证通查能查出所有账号」: it only covers 25 apps and returns counts.
- CTA: no 加微信 / 私信发链接 / 外链 / 二维码. 「评论区扣关键词 + 主页」 is the safe form; deliver the pack via 抖音 粉丝群 or 私信自动回复 inside Douyin, or as a 橱窗 商品 if user has it. Don't say 「免费领」 if it's paid; don't say 「私信我」 repeatedly.
- No author handle/avatar; 「海外博主实测」 is the only reference to the source.

## 5. 资料包大纲 —《个人信息大扫除：AI 提示词 + 自查清单》

**定位**：给普通人的一下午操作手册，本人自查自删，不涉及查他人。
**格式**：PDF 12–16 页（手机竖版阅读）+ 一页可打印清单 + 提示词纯文本（方便复制）。可选：飞书/腾讯文档在线版便于更新（交付时放抖音内渠道，不在视频里露链接）。

1. **开始前 5 分钟**：为什么要清；一张总流程图（查→排→删→投诉）；安全提醒（只在官方渠道操作、验证码不给任何人、报告不外传）。
2. **自查工具箱**：一证通查（电话卡/互联网账号）、云闪付一键查卡的图文步骤；结果怎么看；数量对不上怎么办。
3. **账号盘点模板**：表格（平台/注册手机号/是否实名/是否绑卡/最后使用/处理方式）+ 提示词 P1。
4. **主流平台注销与解绑速查**：微信、QQ、抖音、微博、支付宝、淘宝、京东、美团等路径和前置条件、冷静期（标注更新日期与「以App内为准」）。
5. **个保法删除权实操**：第44–50条要点白话版；申请函模板 3 种（账号已停用/撤回同意/平台违规保存）+ 提示词 P3。
6. **隐私设置加固**：各平台该关的选项（个性化推荐、通讯录匹配、附近的人、手机号搜索到我）+ 提示词 P4。
7. **公开内容脱敏**：朋友圈/主页/快递单/定位的自查表 + 提示词 P5。
8. **投诉与维权**：12321 投诉类型怎么选、证据怎么截图；平台拒绝后的路径。
9. **以后少留痕**：注册习惯（不用主号注册小App、少用手机号一键登录、定期半年复查）。
10. **附录**：全部提示词合集（5 条 + 3 条进阶变体）、官方入口出处清单。

**定价建议**：
- 账号小、信任未建立 → **主推免费引流版**（第 1、2、3、10 章 + 5 条提示词），换关注/粉丝群。
- 完整版 **9.9–19.9 元**：低价冲动消费区间，覆盖平台抽成仍有利润；高于 29.9 元对小号转化差，且「隐私」题材用户对付费心理防线更高。
- 定价依据：内容可被公开信息拼出，价值在「整理好 + 模板 + 随时更新」，所以卖便利不卖信息差；承诺「入口变化免费更新」提升复购信任。
