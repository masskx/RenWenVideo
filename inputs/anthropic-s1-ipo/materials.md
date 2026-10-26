# anthropic-s1-ipo 素材汇总（只素材，不含脚本）

抖音 30–40s 角度：**「ANT上市 + 三个数字」**（营收暴涨 / GAAP 净亏损 vs 调整后营业利润 / 客户或估值）。  
纯内容收尾；不提资料包、不引导评论；不写翻墙/代理。

抓取核对：2026-10-26 Asia/Taipei。数字以 **SEC Form S-1 英文一手**为准。

一手：https://www.sec.gov/Archives/edgar/data/2130357/000162828026067168/anthropicpbc-sx1.htm  
Filing date on cover：**October 26, 2026**。Registrant：**Anthropic, PBC**（Delaware public benefit corporation）。

---

## 1. 上市信息（S-1 封面 / Prospectus）

忠实摘录：
- “We have applied to list our Class A common stock on the **Nasdaq Global Select Market** under the symbol **“ANT.”**”
- Preliminary prospectus；shares / IPO price range 在预披露稿中仍为空白。
- Lead underwriters 封面列示含 **Goldman Sachs & Co. LLC**、**Morgan Stanley** 等。
- 治理：PBC + Long-Term Benefit Trust（Class T）；Founder LLC 持有 Class F，对一般事项合计约 **50.1%** 投票权；自称 Nasdaq 意义下的 **controlled company**。

截图：
- `assets/img/s1_cover_top.png` / `s1_prospectus_cover_ANT.png` / `s1_ticker_ANT.png`：招股说明书封面页（含 ANT / Nasdaq）— **官方页面截图，可引用**
- `assets/img/s1_ant_ticker_excerpt.png`：自制 ANT 摘录卡 — **自制示意**

---

## 2. 三个核心数字（对表）

均来自 S-1 **Summary Consolidated Financial and Other Data** / Non-GAAP reconciliation（单位：百万美元，除非注明）。

### A. 营收暴涨
| 期间 | Revenue（表值） | 叙事口径 |
|---|---|---|
| 2023 | $41 | $41 million |
| 2024 | $386 | $386 million |
| 2025 | **$4,585** | 正文常写 **$4.6 billion** |
| H1 2025 | $1,163 | 正文常写 $1.2 billion |
| **H1 2026** | **$16,286** | 正文常写 **$16.3 billion** |

- H1 2026 YoY：**1,300%**（Risk Factors / MD&A 叙事；相对 H1 2025）。
- 正文亦写：2024→2025 YoY **1,088%**；2023→2024 YoY **841%**。
- 公司明确：历史增速 **不代表** 未来；“We do not expect our revenue will continue to grow at comparable rates”。

### B. GAAP 净亏损 vs 调整后营业利润
| 指标 | H1 2026 表值 | 口播可用约数 |
|---|---|---|
| Net loss | **$(80,748)** | **$80.7B 净亏损** |
| 其中：Change in FV of convertible notes / derivatives / SAFEs | **$(72,388)** | **$72.4B**（非现金，估值上升驱动） |
| Operating loss（GAAP） | $(693) | 营业亏损收窄（H1’25 为 $(2,135)） |
| **Adjusted Operating Income** | **$1,618** | **+$1.6B**（Non-GAAP） |
| Adjusted Operating Margin | **10%** | — |

Adj. Operating Income 定义（S-1）：operating loss 剔除 (i) stock-based compensation (ii) non-cash charitable contributions (iii) Bartz settlement。  
**红线**：不要把 Non-GAAP 说成「已经 GAAP 盈利」。

全年净亏损对照：2023 $(1,531)；2024 $(8,309)；2025 **$(41,965)**（正文常写 **$42.0 billion**）。

另：同页 Non-GAAP 还给出 H1’26 **Adjusted Net Income $2,671**（剔除 FV 变动等后）— 可作补充，非本集「三数字」必选。

### C. 客户 / 人才密度（或融资规模；估值见差异）
截至 **2026-09-30**（Prospectus Summary / Business）：
- **> 11,900** customers with ≥ $100k TTM revenue  
- **> 1,900** customers with ≥ $1M TTM revenue  
- **≈ 250** customers with ≥ $10M TTM revenue  
- 员工约 **5,300**（2024-12-31 约 940）  
- TTM revenue / employee **> $6.6 million**

Series H（May–June 2026）：
- H-1：77,637,878 股 × **$589.0095** ≈ **$45.7B**  
- H-2：33,110,291 股 × $589.0095 ≈ **$19.5B**  
- 财务报表附注合计毛收益约 **$65.2 billion**（与 CNBC「$65B round」同量级）

**$965B 估值：S-1 正文未检索到该数字** → 仅作二手（CNBC）备注，抖音若提必须标注「媒体报道 / 非 S-1 表内」。

截图 / 摘录图：
- `assets/img/s1_summary_financials.png`（及 netloss 同页副本）：Summary Consolidated 营运表含 Revenue $16,286 / Net loss $(80,748) — **官方页面截图，可引用**
- `assets/img/s1_adjusted_operating_income.png`：Adj. Op. Income $1,618 与 Adj. Net Income 调节表 — **官方页面截图，可引用**
- `assets/img/s1_customers_11900.png`：客户指标附近页 — **官方页面截图，可引用**
- `assets/img/s1_series_H_financing.png`：Series H / related person 融资叙述页 — **官方页面截图，可引用**
- `assets/img/s1_ops_table_excerpt.png` / `s1_financials_excerpt_card.png` / `s1_loss_vs_adjusted_excerpt.png` / `s1_customers_excerpt.png` — **自制摘录/对比示意**

---

## 3. 二手来源（仅 notes，不覆盖 S-1）

### CNBC live blog
https://www.cnbc.com/2026/10/26/anthropic-ipo-live-updates-ai-s-1-filing.html · 2026-10-26  
- 确认 ticker **ANT**、H1 亏损 **$80.7B**、H1 营收约 **$16.29B**、2025 营收约 **$4.59B**。  
- 称 May 一轮融资 **$65B @ $965B valuation**（Altimeter / Dragoneer / Greenoaks / Sequoia 等）— **估值数字未在 S-1 核到**。  
- MIT Sinan Aral 口头提到约 **$1.5–2T** 估值想象空间 — **访谈观点，非 S-1**。

### Hacker News
https://news.ycombinator.com/item?id=50242939  
- 链到同一 SEC S-1；讨论侧重算力承诺、纸面亏损中的 FV 会计、开源模型竞争等。  
- 不作数字来源。

---

## 4. 开头候选 `assets/hook/`（均为 1080×1920 示意）

| 文件 | 冲击点 |
|---|---|
| `hook1_ANT上市_示意.png` | 大字 **ANT** + Nasdaq |
| `hook2_营收暴涨_示意.png` | **$16.3B** + +1,300% |
| `hook3_亏损vs调整后_示意.png` | **亏 $80.7B** vs 调整后 **+$1.6B** |

均标注「示意画面 · 非实拍 · 数字以 S-1 为准」。

---

## 5. 成片注意（素材侧，不写脚本）

1. 表值优先：`$16,286` / `$4,585` / `$(80,748)` / `$1,618`；口播可说 $16.3B / $4.6B / $80.7B / $1.6B，与 S-1 正文四舍五入一致。  
2. 必须拆开：**净亏损大头是可转债公允价值变动（非现金）**，同时可以并列 **调整后营业利润转正**。  
3. **不要**用中央社/二手「训练」类表述（与本期无关）；**不要**把 $965B 说成 S-1 披露。  
4. 不要提资料包、不要引导评论区。
