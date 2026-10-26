# anthropic-s1-ipo — 来源与数字出处

核对时区：Asia/Taipei。权威来源：**SEC Form S-1**（英文）。二手仅作 notes。

## 一手

| 项 | 值 |
|---|---|
| 文件 | Anthropic, PBC Form S-1 |
| URL | https://www.sec.gov/Archives/edgar/data/2130357/000162828026067168/anthropicpbc-sx1.htm |
| CIK / Accession | 2130357 / 0001628280-26-067168 |
| Cover filing date | October 26, 2026 |
| 本机抓取 | `/tmp/s1-fetch/s1.htm`（约 14MB HTML；SEC 远程对部分 UA 返回 403，本机已缓存） |

SEC 索引页 / 官方 PDF 直链在本环境可能 403；数字一律以已抓取 HTML 正文与分页截图为准。

## 二手（notes）

| 来源 | URL | 用途 |
|---|---|---|
| CNBC live updates | https://www.cnbc.com/2026/10/26/anthropic-ipo-live-updates-ai-s-1-filing.html | 媒体转述、估值报道 |
| Hacker News | https://news.ycombinator.com/item?id=50242939 | 社区讨论入口，不作数字源 |

---

## 数字 / 日期 → 出处

| 主张 | 精确值（表或正文） | 出处 |
|---|---|---|
| 申请上市代码 | Nasdaq Global Select · **ANT** | S-1 封面 / Prospectus：「We have applied to list our Class A common stock on the Nasdaq Global Select Market under the symbol “ANT.”」 |
| S-1 提交日 | **2026-10-26** | S-1 cover “As filed with the Securities and Exchange Commission on October 26, 2026.” |
| Revenue 2023 | **$41** million | Summary Consolidated Financial and Other Data |
| Revenue 2024 | **$386** million | 同上 |
| Revenue 2025 | **$4,585** million（正文常写 **$4.6 billion**） | 同上 + Risk Factors / MD&A 叙事 |
| Revenue H1 2025 | **$1,163** million（正文常写 $1.2 billion） | 同上 |
| Revenue H1 2026 | **$16,286** million（正文常写 **$16.3 billion**） | 同上 |
| H1 2026 YoY 营收增速 | **1,300%** | Risk Factors / MD&A（相对 H1 2025） |
| 2024→2025 YoY | **1,088%** | 同上叙事 |
| 2023→2024 YoY | **841%** | 同上叙事 |
| Net loss 2023 | **$(1,531)** million | Summary Consolidated |
| Net loss 2024 | **$(8,309)** million | 同上 |
| Net loss 2025 | **$(41,965)** million（正文常写 **$42.0 billion**） | 同上 |
| Net loss H1 2025 | **$(12,969)** million | 同上 |
| Net loss H1 2026 | **$(80,748)** million（正文常写 **$80.7 billion**） | 同上 |
| Change in FV（H1’26） | **$(72,388)** million | Consolidated statements / footnotes；驱动 GAAP 大额亏损的主要非现金项 |
| Operating loss H1’26 | **$(693)** million | Summary / ops table |
| **Adj. Operating Income H1’26** | **$1,618** million（**+$1.6B**；margin **10%**） | Non-GAAP reconciliation（截图 `s1_adjusted_operating_income.png`） |
| Adj. Operating Income/(Loss) 2025 | **$(4,854)** million | 同上 |
| Adj. Net Income H1’26 | **$2,671** million | 同上（补充，非「三数字」必选） |
| Customers ≥$100k TTM | **> 11,900**（as of 2026-09-30） | Prospectus Summary / Business |
| Customers ≥$1M TTM | **> 1,900** | 同上 |
| Customers ≥$10M TTM | **≈ 250** | 同上 |
| Employees | 约 **5,300**（2026-09-30）；2024-12-31 约 940 | 同上 |
| TTM rev / employee | **> $6.6 million** | 同上 |
| Series H 每股价 | **$589.0095** | Related Person / financing narrative |
| Series H-1 规模 | 77,637,878 股 ≈ **$45.7B** | 同上 |
| Series H-2 规模 | 33,110,291 股 ≈ **$19.5B** | 同上 |
| Series H 合计毛收益 | 约 **$65.2 billion** | 财务报表附注合计 |
| Controlled company / 投票 | Founder LLC Class F 合计约 **50.1%**；Long-Term Benefit Trust Class T | Prospectus / governance |
| Underwriters（封面） | 含 Goldman Sachs、Morgan Stanley 等 | S-1 cover |

### 明确未在 S-1 核到的主张

| 主张 | 状态 |
|---|---|
| **$965B** 估值 | **仅 CNBC**（及转载）报道 May 轮；S-1 HTML 全文检索无「965」「$965」无匹配。抖音若出现必须标「媒体报道，非 S-1」。 |
| IPO 发行股数 / 价格区间 | 预披露稿仍为空白；勿编造。 |
| 「已上市」 | 仅为 **applied to list**；勿说成已交易。 |

---

## CNBC vs S-1 差异（务必按 S-1）

| 点 | CNBC（约） | S-1 |
|---|---|---|
| H1’26 营收 | $16.29B | 表 **$16,286M**；正文 **$16.3B** |
| 2025 营收 | $4.59B | 表 **$4,585M**；正文 **$4.6B** |
| H1 YoY | 1,304% | **1,300%** |
| 2025 YoY | 1,089% | **1,088%** |
| 2025 净亏损 | $41.9B | 表 **$41,965M**；正文 **$42.0B** |
| H1’26 净亏损 | $80.7B | 表 **$80,748M**；正文 **$80.7B**（一致量级） |
| May 融资 | $65B @ **$965B** 估值 | Series H 合计约 **$65.2B**；**无 $965B** |
| board.csv 草稿「162.9亿/807亿美金」 | 媒体式约数 | 以表值 / 正文 $16.3B、$80.7B 为准 |

---

## 资产清单与授权

### `assets/img/`（官方页面截图 = 可引用；自制卡 = 自制示意）

| 文件 | 内容 | 授权 |
|---|---|---|
| `s1_cover_top.png` | S-1 封面顶部（公司名 / As filed） | 官方页面截图 · 可引用 |
| `s1_prospectus_cover_ANT.png` | Prospectus 封面含 ANT / Nasdaq | 官方页面截图 · 可引用 |
| `s1_ticker_ANT.png` | ANT 上市语句所在页 | 官方页面截图 · 可引用 |
| `s1_summary_financials.png` | Summary 财务表（Revenue / Net loss） | 官方页面截图 · 可引用 |
| `s1_summary_financials_netloss.png` | 同上页副本（净亏损特写用途） | 官方页面截图 · 可引用 |
| `s1_adjusted_operating_income.png` | Non-GAAP Adj. Op. Income / Adj. Net Income | 官方页面截图 · 可引用 |
| `s1_customers_11900.png` | 客户指标叙述页 | 官方页面截图 · 可引用 |
| `s1_series_H_financing.png` | Series H 融资叙述 | 官方页面截图 · 可引用 |
| `s1_ant_ticker_excerpt.png` | ANT 摘录大字卡 | 自制示意 |
| `s1_financials_excerpt_card.png` | 营收/亏损摘录卡 | 自制示意 |
| `s1_ops_table_excerpt.png` | 营运表摘录 | 自制示意 |
| `s1_loss_vs_adjusted_excerpt.png` | GAAP 亏损 vs Adj. 利润对比卡 | 自制示意 |
| `s1_customers_excerpt.png` | 客户数字摘录卡 | 自制示意 |

### `assets/hook/`（全部 1080×1920，标「示意」）

| 文件 | 冲击点 | 授权 |
|---|---|---|
| `hook1_ANT上市_示意.png` | ANT + Nasdaq | 自制示意 · AI/代码生成画面 |
| `hook2_营收暴涨_示意.png` | $16.3B · +1,300% | 自制示意 · AI/代码生成画面 |
| `hook3_亏损vs调整后_示意.png` | 亏 $80.7B vs +$1.6B | 自制示意 · AI/代码生成画面 |

数字均来自上表；画面非实拍。

### 视频

本期未收录外部演示视频（S-1 为静态招股文件）。如需口播 B-roll，优先用上方官方页面截图 + hook 示意。

---

## 红线备忘

- 不提供、不复述任何攻击/绕过类操作（与本期无关）。
- 不把 Non-GAAP 说成 GAAP 盈利。
- 不把 $965B 写成 S-1 披露。
- 不写脚本；不推 RenWenVideo（等 Eko 审）。
