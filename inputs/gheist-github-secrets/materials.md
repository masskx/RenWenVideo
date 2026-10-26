# gheist-github-secrets 素材汇总（只素材，不含脚本；不含可复用攻击代码）

## 1. Wiz Research 原文要点（https://www.wiz.io/blog/gheist-attempted-scaled-abuse-of-stolen-github-tokens-stumbles）
作者 Rami McCarthy, Hila Ramati｜发布 2026-10-25
- 原文摘录："Since September 15, 2026, Wiz Research has been tracking Gheist: a new campaign performing mass abuse of compromised GitHub tokens."
- "The workflow seeks to print the repository's secrets into its own workflow log. Then, the tool downloads the log through the GitHub API and deletes the run seconds later. The tool's API requests carry the user agent `gheist`."
- "We have recovered more than 13,500 planted branches from more than 850 compromised accounts, ranging from personal projects to enterprise organizations' private repositories."
- 截至 10-24："the attack is ongoing and evolving"；"roughly ⅔ of implicated accounts are no longer available on GitHub"。
- 特征：分支 `ci-sync-`+6位随机字符，提交 `.github/workflows/sync-check.yml`，提交信息 `ci: sync config`，未签名，以 token 主人身份提交。
- 为何能绕过（只讲原理）："GitHub masks secret values in logs only when they appear verbatim. A base32-encoded secret doesn't match, so it prints in full." 另：`permissions: {}` 不限制 secrets 上下文；有部署环境时环境级密钥（常为生产凭据）也会被打印。
- "Because the secrets leave through GitHub's own API, there is no attacker domain or outbound connection to block."
- 两个变种 Tool A/B；Tool B 9-28 首次出现；10-19 增加针对自托管 runner 的 sync-host job（原文称其有 bug）。
- GitHub 防护："Since July 28, 2026, GitHub has held potentially malicious workflow runs in public repositories until a collaborator approves them. Every public Gheist run we checked … sits at action_required." 但 "that hold doesn't apply to private repositories or GitHub Enterprise Server"。
- 同批账号的其它活动：10-06 391 个账号把约 1,461 个仓库改名为破解软件诱饵；10-18 25 个账号建 "Windows RDP Runner" 挖矿；部分受害者感染 PolinRider（朝鲜相关）；57 个账号 5 月也是 Megalodon 受害者。凭据来源：infostealer 日志、3 月 Trivy 供应链事件泄露的 token。与 GhostAction 不同。
- 自查（Hunt）：找 ci-sync- 分支 + ci: sync config；审计日志中完成后 1 分钟内被删的 run、UA gheist；云审计日志中 OIDC subject 含 ci-sync- 分支；自托管 runner 上 .gdmp_* 文件。
- 响应（Respond）："Rotate every repository, organization and environment secret available to an affected repository. Deleting the run or the branch doesn't undo the exposure." 吊销 token、排查设备 infostealer；自托管 runner 视为已失陷；"Don't approve held sync-check runs"。
- 加固（Harden）：生产环境要求 reviewer；OIDC 信任策略限定受保护分支/环境；"use GitHub Apps or short-lived fine-grained tokens instead of personal access tokens"；自托管 runner 用临时主机、不挂 Docker socket。
- 注：原文含攻击 workflow YAML，本素材包**刻意不收录**，截图中代码块已隐藏。

## 2. GitHub 官方
- Changelog 2026-07-28「GitHub Actions holds potentially malicious workflows for approval」(https://github.blog/changelog/2026-07-28-github-actions-holds-potentially-malicious-workflows-for-approval/)：
  "When a workflow run is identified as potentially malicious and held, the workflow won't execute until a repository collaborator with write access reviews and approves it. The approval must be submitted through an authenticated web session." "You don't need to configure this protection" "currently applies to public repositories on github.com only. GitHub Enterprise Server doesn't add this protection at this time."
- 来自 fork 的 workflow 运行审批：https://docs.github.com/en/actions/managing-workflow-runs-and-deployments/managing-workflow-runs/approving-workflow-runs-from-public-forks
- 仓库 Actions 设置（含 fork PR 审批策略）：https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository
- 细粒度 PAT：https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens （GitHub 推荐尽量用 fine-grained token，可限定仓库、权限与过期时间）
- Actions 密钥使用/轮换：https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions ；安全使用参考：https://docs.github.com/en/actions/reference/security/secure-use
- 背景：GitHub 博客「Disrupting supply chain attacks on npm and GitHub Actions」https://github.blog/security/supply-chain-security/disrupting-supply-chain-attacks-on-npm-and-github-actions/
