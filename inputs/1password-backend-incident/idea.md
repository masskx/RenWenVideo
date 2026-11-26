# 1Password 后台安全事件：密码库和恢复邮件是两回事

## 想法

- 标题：密码库没受影响，为什么还要提防恢复邮件？
- 为什么现在拍：1Password 于 11 月 25 日发布通告，Hacker News 在台北时间 11 月 26 日 01:18 出现讨论。11 月 26 日 18:04 左右复核，Hacker News 官方接口显示 1,431 分、610 条评论（平台快照）。[官方公告](https://1password.com/blog/update-on-nov-2026-security-incident) · [Hacker News 原讨论](https://news.ycombinator.com/item?id=50644817) · [互动数据接口](https://hacker-news.firebaseio.com/v0/item/50644817.json)
- 谁会讨论：用密码管理器的用户和小团队管理员。集中管理省事，也需要事先做恢复准备；分散保存降低对单一服务的依赖，同时增加管理成本。本片抓一项可操作的判断：收到自己没发起的恢复邮件，先用平时用的官方入口核实。

## 事实和出处

- 据 1Password，部分用户的姓名、邮箱和账户元数据被复制，其中包括某些邀请、开通和恢复邮件链接中的令牌。官方称这类令牌本身无法登录，涉及部分令牌状态的小范围用户已获定向通知。[公告：What information was affected](https://1password.com/blog/update-on-nov-2026-security-incident#what-information-was-affected)
- 官方称用户密码库及其中内容、保护密码库的密钥和账户恢复密钥均未受影响；官方表示用户无需更新账户设置，提醒警惕自己未发起的邀请或恢复邮件。[官方公告](https://1password.com/blog/update-on-nov-2026-security-incident)

## 素材与问题

- 所有演示用自绘道具，标「示意」。邮件提示仅用于解释风险，使用虚构界面和文字，没有网址或可操作的链接。见 [README.md](README.md) 和 [script.md](script.md)。
- 评论区：如果密码管理器突然发来一封你没发起的恢复邮件，你会先去哪儿核实？
