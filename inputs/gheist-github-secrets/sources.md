# sources.md — gheist-github-secrets

## 数字/日期核对（主源：Wiz https://www.wiz.io/blog/gheist-attempted-scaled-abuse-of-stolen-github-tokens-stumbles ，2026-10-25）
| 说法 | 核对结果 | 原文 |
|---|---|---|
| 850+ 账号 | ✅ 一致 | "more than 850 compromised accounts" |
| ~1.35 万分支 | ✅ 一致（原文是"超过13,500"，非"约"） | "more than 13,500 planted branches" |
| 9/15–10/24 | ⚠️ 需改表述：9/15 是 Wiz **开始追踪**日；10/24 是"截至"日期且**攻击仍在进行**，不是结束日 | "Since September 15, 2026…"；"As of October 24: the attack is ongoing and evolving" |
| base32 绕过日志遮蔽 | ✅ 一致 | "masks secret values in logs only when they appear verbatim. A base32-encoded secret doesn't match" |
| 约 2/3 涉事账号已不可用 | 原文 | "roughly ⅔ of implicated accounts are no longer available" |
| GitHub 审批拦截上线 2026-07-28，仅公开仓库 | Wiz + GitHub Changelog https://github.blog/changelog/2026-07-28-github-actions-holds-potentially-malicious-workflows-for-approval/ | |
| Tool B 首次运行 9-28；10-19 加自托管 runner job | Wiz | |
| 10-06 391 账号改名约 1,461 仓库；10-18 25 账号挖矿；57 账号曾遭 Megalodon | Wiz | |

## 素材清单（来源 + 授权）
| 文件 | 来源 | 授权 |
|---|---|---|
| assets/img/wiz_official_cover.webp | Wiz 文章头图 | 官方（引用注明 Wiz） |
| assets/img/wiz_blog_header.png | Wiz 原文截图（标题+关键数字段） | 官方页面截图，可引用 |
| assets/img/wiz_blog_full_codehidden.png | Wiz 原文整页截图，攻击代码块已隐藏 | 可引用 |
| assets/img/github_changelog_2026-07-28_hold.png | https://github.blog/changelog/2026-07-28-github-actions-holds-potentially-malicious-workflows-for-approval/ | 官方，可引用 |
| assets/img/github_docs_approving_fork_runs.png | GitHub Docs fork 运行审批 | 官方，可引用 |
| assets/img/github_docs_fork_approval_settings.png | GitHub Docs 仓库 Actions 设置 | 官方，可引用 |
| assets/img/github_docs_fine_grained_pat.png | GitHub Docs 管理 PAT | 官方，可引用 |
| assets/img/github_docs_secrets_actions.png | GitHub Docs Actions secrets | 官方，可引用 |
| assets/img/github_docs_secure_use_reference.png | GitHub Docs 安全使用参考 | 官方，可引用 |
| assets/img/selfcheck_ci-sync分支列表_示意.png | 自制示意（特征来自 Wiz IoC；分支后缀随机编造） | 自制示意 |
| assets/hook/hook1_数字冲击_850账号_示意.png | 自制，数字出自 Wiz | 自制示意 1080x1920 |
| assets/hook/hook2_日志红字_示意.png | 自制，随机字符非真实密钥；"seconds after completion" 与原文 "seconds later" 一致 | 自制示意 1080x1920 |
| assets/hook/hook3_删分支不等于没事_示意.png | 自制，依据 Wiz Respond 建议 | 自制示意 1080x1920 |

所有截图均为 2026-10-26 headless Chrome 截取。Wiz 原文无数据图表（仅头图）。
