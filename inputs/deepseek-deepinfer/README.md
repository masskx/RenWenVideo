# deepseek-deepinfer

Douyin script package: 「DeepSeek这次开源了什么？」, ~37s, 9:16 dark tech, Remotion 1080×1920 30fps, cloned voice.
- `script.md` — shot list with per-shot timing, verbatim CN narration/on-screen text, production + compliance notes.
- No external footage (all self-made animation), so no assets folder.

## Internal (not for video)
Topic: 百度实时热搜 #10「DeepSeek才是真正的OpenAI」 (via Eko, 2026-10-22).

### Facts used (all from 观察者网 2026-10-22, verified against source)
- 10月20日 DeepSeek 宣布开源内部生产级推理框架 DeepInfer.
- Inference framework manages how the model uses compute; same model can cost quite differently depending on software (source wording: 「存在较大差异」, no numbers).
- Framework design affects 延迟、吞吐量、所需硬件 → key factor in AI operating cost; more efficient software lowers compute per request and may cut energy use.
- Lower inference cost → bigger margin for AI hosting providers, possibly lower AI service prices (美媒).
- Integrates 分布式推理、投机解码; compatible with 英伟达 SM100 GPU and 华为昇腾950 NPU.
- Bloomberg (10-21): inference tech usually seen by AI companies as core competency, rarely published.
- 「Real OPEN AI」: said by an Indian social-media blogger in the replies → framed as 「被海外网友称为」.
- Not complete: KV缓存系统、Prefill/Decode解耦、数据并行副本间负载均衡 not fully included (source adds 大部分核心的解耦功能已经实现 → Shot 7 says so explicitly; ending 「摊开了一大半」).

### Verified but not used (length)
- Requesty CEO Thibault Jaigu: lowers deployment barrier but still needs compute and expertise.
- Enterprises self-hosting DeepSeek models may save compute with DeepInfer.

### Dropped / corrected
- **Apache-2.0 license**: not in source → dropped.
- **Unsloth ran V4.1-Flash on 128GB "with DeepInfer"**: source says Unsloth used its own **Dynamic GGUFs**, not DeepInfer → claim as relayed is wrong; not used.
- 「海外开发者称它为Real OPEN AI」: source attributes it to one Indian blogger → softened to 「被海外网友称为」.

### Source
- https://www.guancha.cn/CaiJing/2026_10_22_905376.shtml

### Compliance (douyin.md §4)
- [x] No links/QR/contacts, no 下载/搜索 App, no comment bait, no 资料包, no teaser
- [x] 「内容由AI生成」 required
- [x] No 翻墙 terms; no absolute claims (「被称为」「可能」「很少」「一大半」); no logos, no X handles/avatars
- [x] Own explanation (Shot 3); content complete
