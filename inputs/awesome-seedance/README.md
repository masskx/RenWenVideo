# awesome-seedance 教程视频素材包

给云端 Claude Code 剪辑用。脚本见 `script.md`（英文说明 + 中文逐字口播/字幕）。目标时长约 120 秒（本期特意超出仓库 ≤60 秒规则，script.md 已写明）。

## 一、这是什么（已核实）

- **awesome-seedance**：GitHub 开源仓库（代码 MIT，整理内容 CC BY 4.0），收录 Seedance 2.5 / 2.0 视频提示词，每条案例对过原帖，并拿第二个模型复测。
- 截至 2026-10-19 README：851 条案例、495 次跨模型复测、27 个分类模板、80 个可安装 AI 视频 Skill（每天同步，数字会变；口播用「800多条 / 27个 / 80个」）。
- 用法一（新手，不用安装）：挑模板 → 复制 → 换方括号内容 → 连参考图发给任意 AI 聊天 → 粘贴进 Seedance（即梦/Dreamina）生成。
- 用法二（Claude Code / Codex 用户）：
  - `npx seedance-prompt-library install`（npm 包 0.3.0 已核实）
  - 可选：`npx skills add LearnPrompt/awesome-seedance --skill seedance-production-workflow`

## 二、素材清单（materials/）

所有视频：H.264 CRF 27、无音轨、faststart，长边 ≤1080（模板墙录屏保留 1280 宽以便看清缩略图）。所有外部画面上屏时右下角标「案例展示」。

| 文件 | 内容 | 来源原片区间 | 用在 |
|---|---|---|---|
| 01a_bad_fight_air_punching.mp4 | 写得差的打斗提示词：两人对着空气打 | 全片 0–5.0s | 开头钩子、第3章 |
| 01b_good_fight_muaythai_round_kick.mp4 | 泰拳扫踢（大弧线） | 全片 0–10.1s | 钩子、第3章分屏 |
| 01c_good_fight_taekwondo_kicks.mp4 | 跆拳道横踢（直线弹出） | 全片 0–10.1s | 第3章分屏 |
| 02_repo_hero_awesome_seedance.jpg | 仓库标题图（已裁掉网址和旧统计数字） | — | 第1章 |
| 03_template_gallery_scroll.mp4 | 模板分类墙滚动录屏 | 全片 0–6.2s | 第1章，1.5× |
| 04_cross_model_retest_table.jpg | 跨模型复测表 | — | 第1章 |
| 05_ugc_vlog_template_pitfalls.jpg | 手持 UGC vlog 模板 + 常见坑 | — | 第2章 |
| 06_prompt_to_agent_headphones.jpg | 把模板+耳机图发给 AI 的对话截图 | — | 第2章四步 |
| 06a_ugc_headphones_unbox.mp4 | 耳机 vlog：拿出耳机 | 原片 0.0–8.0s | 第2章成片 |
| 06b_ugc_headphones_wear.mp4 | 耳机 vlog：戴上耳机 | 原片 8.5–15.0s | 第2章成片、避坑 |
| 07_combat_template_contact_points.jpg | 打斗编排模板（接触点、招式链） | — | 第3章 |
| 08_template_vs_skill_table.jpg | 模板 vs Skill 对比表 | — | 第4章 |
| 09_ugc_review_template_prompt.jpg | UGC 口播测评带货模板的提问截图 | — | 第4章对比画中画 |
| 10a/10b/10c_template_shampoo_*.mp4 | 模板版洗发水带货视频，拆 3 段 | 原片 0–3 / 3–17.5 / 17.5–25.1s | 第4章对比（洗头段 2×） |
| 11_skill_install_in_agent_blurred.jpg | 在 Agent 里安装并调用 Skill（Skill 名里的创作者账号已模糊） | — | 第4章 |
| 12a/12b/12c_skill_shampoo_*.mp4 | Skill 版洗发水测评视频，拆 3 段 | 原片 0–8 / 8–15 / 15–25.1s | 第4章对比、结尾空镜 |
| 13_OPTIONAL_storyboard_sheet_broll.jpg | 分镜表图（原帖封面） | — | 可选背景 |
| previews/*_1s.jpg | 每段视频每秒一帧的预览图，带时间码 | — | 方便找入出点 |

长片段剪辑方案（精确入出点、倍速、定格、分屏）见 `script.md` 第 3、4 节。

## 三、没用的素材及原因

- 原帖里的飞书机器人日报截图：内部工具消息，没有教学价值，还带第三方产品界面。
- GoodCase Skills 卡片墙截图、某个 Skill 详情页截图：卡片和标题上都是创作者账号名，模糊后没剩什么信息；安装命令改成脚本里的文字卡片。
- 耳机 vlog 原片 15–20s（走出房间，鱼眼、糊）：已剪掉。
- 原帖里提到某云电脑、作者花了多少钱这类内容：属于推广/个人叙述，不用。
- 模板墙录屏里有几个很小的缩略图（例如恐怖类模板里穿红裙的背影），按 9:16 裁到左栏放 1.5× 之后基本看不清；如果剪出来能看清，就模糊掉。

## 四、审核提示（抖音）

- 发布时勾选「内容由AI生成」。
- 打斗素材都是戴护具/拳套的体育对练，没有血腥画面；不要配暴力音效或标语。
- 01c 原片约第 6s 裤子上有一串 AI 生成的乱码字母（像某运动品牌），这一段不在推荐入出点内，用到时请模糊。
- 洗发水瓶身品牌都是 AI 生成的虚构名，不是真实品牌。
- 画面里不出现任何 X 用户名、头像、网址。

## 五、内部来源（仅供核对，禁止上屏）

- 原帖：https://x.com/aiwarts/status/2102240456092626951（X 长文）
- 仓库：https://github.com/LearnPrompt/awesome-seedance
- 模板文档：docs/templates/en/handheld-ugc-vlog.md、docs/templates/en/combat-choreography.md
- npm：https://www.npmjs.com/package/seedance-prompt-library

## 六、待核实

- 素材里的成片（耳机、泰拳/跆拳道、洗发水）都是原作者自己跑的，我们没有复现；口播只说「原作者跑出来的」。
- 原帖写的是「463 条 / 14 个模板 / 25 个 Skill」，是发帖当时的数字；口播用的是 2026-10-19 README 上的数字。
- 「7 到 10 秒不超过 4 段」用的是仓库模板文档的说法（原帖写的是 5 到 10 秒）。
- 原帖演示里那个产品广告 Skill 的安装方式（从 GoodCase 网站下载 .skill 文件）没有单独核实；视频里只展示仓库 README 写明的 npx 命令。

## 七、文件大小

整个包约 14 MB，单个文件最大约 2.4 MB，可以直接整包上传云端（上限 30 MB）。
