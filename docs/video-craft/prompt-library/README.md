# 提示词库（prompt-library）

把 [来源帖](来源帖.md) 推荐的 8 个“用 Opus 5.5 写代码做视频”的仓库里的提示词、风格提示词和制作文档，**原样**存成本仓库里固定版本的文件。网页刷新、仓库改名、作者改了提示词或删库，这里的版本都不变，做过的片子用的是哪一版也能查到。

**这是可选参考，不是规则。** 和 [quick-reference.md](../quick-reference.md) 冲突时以速查页为准。原提示词大多是给 16:9、HTML/Canvas、自带 TTS 的独立短片写的，用到本仓库要先按 [选用指南.md](选用指南.md) §三 改写。

## 怎么用

1. 按脚本的类型查 [选用指南.md](选用指南.md) §二，找到对应的风格或提示词 id。
2. 搜索、看全文：

   ```bash
   node scripts/prompts/find.mjs 发布 数字                 # 关键词都要命中；标题命中排前面
   node scripts/prompts/find.mjs '讲解|explainer' --zh      # a|b 表示任一个词；--zh 只看含中文的
   node scripts/prompts/find.mjs '新闻|news' --source=lemo  # 只搜一个来源
   node scripts/prompts/find.mjs --show=lemo/dark-keynote   # 全文 + 来源仓库@commit + 许可
   node scripts/prompts/find.mjs --list --source=mg15       # 列出全部 id
   ```

3. 用了哪几条，在分镜里记一笔（[分镜模板.md](../分镜模板.md) 的“参考提示词”，可选），以后重做或复盘时知道当时照的是哪一版。

## id 前缀

| 前缀 | 来源 | 内容 |
|---|---|---|
| `opus55/<slug>` | yihui-dev/awesome-opus5-5-videos | 703 条别人做爆款用的原提示词，带原帖链接和 Skillry 重制版链接 |
| `lemo/<风格>`、`lemo/<风格>/demo` | lemomo-ai/lemo-opuscar | 51 份风格提示词（STYLE.md：质感、配色、字体、动效、镜头语法、声音、“原生招式”、坑）和样片拆解（DEMO.md）；`lemo/DIRECTOR`、`lemo/TECHNIQUE` 是导演和制作方法 |
| `opuscar98/<号>` | lemomo-ai/lemo-opuscar | OPUSCAR 98 的 98 种风格提示词（中英）、镜头表、导演编排 |
| `mg15/<号-风格>` | Vincentwei1021/mg-styles-15 | 15 份完整 MG 风格提示词；`mg15/template` 写新风格，`mg15/rubric` 让另一个 AI 当评委 |
| `ovp/<号-名>` | joeseesun/opus-video-prompts | 18 份带中文说明的提示词（含一句话出片、中文讲解 + TTS、真人口播改线稿、Remotion 宣传片） |
| `ac55/<文档>` | athemeroy/awesome-claude-5-5-videos | 七类可复用提示模板、制作任务单、提示词与制作条件对照、按任务选制作路径、案例索引 |
| `pdoom/<文档>` | mexicat/pdoom-video | 歌词 MV 的风格圣经和卡拉 OK 规则、引擎说明 |
| `cab/<文档>` | JohnHeibel/ClaudeAnimationBase | 手绘角色动画规则（计时、表演、转场、常见失败） |

## 文件结构和更新

```text
sources.json                         来源清单：每个仓库复制哪些文件（include）、许可、当前固定的快照（pinned）
vendor/<owner>__<repo>/<commit>/     原样复制的文件 + SOURCE.json（仓库地址、完整 commit、提交时间、快照时间、每个文件的 sha256）
来源帖.md                             推荐这 8 个仓库的原帖全文和存档时的核对
选用指南.md                           按脚本选参考、改写对照、可直接吸收的做法
```

```bash
node scripts/prompts/snapshot.mjs                        # 重新抓全部来源：有新 commit 就新建一个快照目录，旧的不动
node scripts/prompts/snapshot.mjs --only=lemomo-ai/lemo-opuscar --pin   # 抓一个，并把 find.mjs 改用新快照
```

- 快照目录写好以后**不再修改**；`find.mjs` 只读 `pinned` 的那一份。新快照不加 `--pin` 不会被用到，所以更新不会让“昨天好用的版本”消失。
- 新快照用过、确认更好再 `--pin`；不要手改 `vendor/` 里的文件（要改写就复制到别处，写明出处）。
- 上游仓库没了也没关系：快照还在，`SOURCE.json` 里有原来的地址和 commit。

## 许可和署名

| 仓库 | 许可 | 复制了什么 |
|---|---|---|
| yihui-dev/awesome-opus5-5-videos | MIT；每条提示词的原文归其作者 | `data/videos.json`、README |
| lemomo-ai/lemo-opuscar | 文档 MIT；样片和静帧 CC BY 4.0 | 指南、风格提示词、样片拆解（文字），**没有**复制样片、图片和代码 |
| mexicat/pdoom-video | MIT | README 和 `docs/` |
| JohnHeibel/PDoomVideo | 没有许可证 | 只记版本，不复制 |
| Vincentwei1021/mg-styles-15 | MIT | 提示词、模板、评审提示词 |
| JohnHeibel/ClaudeAnimationBase | MIT（Clawd 形象属于 Anthropic） | README、`ANIMATION_GUIDE.md` |
| athemeroy/awesome-claude-5-5-videos | 原创文字 CC BY 4.0 | 提示模板和研究文档（署名 athemeroy，附原仓库链接） |
| joeseesun/opus-video-prompts | 没有许可证文件；README 写明提示词版权归原作者、转载保留作者与原帖链接 | 提示词和 README，作者和原帖链接都在文件里 |

- 每份文件的原始许可放在它的快照目录里（`LICENSE`）。
- 照某条提示词做出的片子，如果画面明显来自某位作者的作品或风格样片，发布包 README 的出处里写上作者和链接；拿别人的作品当素材展示时照常标「@作者｜案例展示」。
