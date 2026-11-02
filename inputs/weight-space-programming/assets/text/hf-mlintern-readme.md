---
license: apache-2.0
base_model: Qwen/Qwen3.5-0.8B
library_name: transformers
tags:
- ml-intern
- weight-space-programming
---

# Qwen3.5-0.8B — edited by an LLM, no training (weight-space programming)

[![Built with ML Intern](https://huggingface.co/datasets/huggingface/badges/resolve/main/built-with-ml-intern-sm.svg)](https://hf.co/chat?mode=ml-intern)

This is the model from **["Sparks of Weight Space Programming"](https://rikiyat.github.io/blog/weight-space-programming/)**
(Experiment 8) — the one the blog post did **not** release. A frontier LLM ("Astra") read
Qwen3.5-0.8B's weights, diagnosed a repetition/loop pathology, and **hand-edited 131,072 weights**
(64 MLP output columns in each of layers 15 and 19, `down_proj`) to fix it. No gradient descent,
no training, no fine-tuning — a direct weight edit.

The base model loops until the token limit on almost every math problem. The edited one doesn't.

**🎮 Try it live:** [akhaliq/weight-space-programming-demo](https://huggingface.co/spaces/akhaliq/weight-space-programming-demo) —
type a problem, watch the base model loop while the edited one solves it.

## Verified results (this checkpoint)

Evaluated with the post's exact protocol: vLLM, thinking on, temperature 0.6, top_p 0.95, top_k 20,
presence_penalty 1.5, max 32,768 new tokens, seed 0, last `\boxed{}` graded with math-verify 0.9.0.

| | MATH-500 accuracy | answers cut at 32k tokens |
|---|---|---|
| Base Qwen3.5-0.8B | 5.0% *(25-problem smoke)* — post: 7.9 | 95% *(smoke)* — post: 93.0 |
| **This model** | **51.0%** — post: 48.1 | **31.6%** — post: 33.1 |

**Edited model: full MATH-500, all 500 problems × 4 samples = 2,000 generations** (43.4M generated
tokens, 51 min on an H200). Raw scores, per-problem results and sample generations:
[`eval/`](https://huggingface.co/akhaliq/Qwen3.5-0.8B-weight-space-programming/tree/main/eval).

## Why you can trust the weights

The author published Astra's edit as a bit-exact diff
([`RikiyaT/lm_understand-logs`](https://github.com/RikiyaT/lm_understand-logs), `exp8_math/runs/p50c/edit/`).
This checkpoint was rebuilt with the author's own `apply_edit.py`, which **sha256-verifies every
rebuilt tensor against the checkpoint that was actually evaluated**. Both tensors passed.
Base: `Qwen/Qwen3.5-0.8B` @ `2fc06364715b967f1860aea9cf38778875588b17`; only
`model.language_model.layers.15.mlp.down_proj.weight` and `...layers.19...` differ from the public release.

## Reproduction

Reproduced end-to-end by an AI assistant ([ML Intern](https://hf.co/chat?mode=ml-intern)) running on
Hugging Face Jobs, 2026-11-02: the edit was rebuilt and hash-verified on CPU, the edited checkpoint
pushed here, and the benchmark verification run on an NVIDIA H200 with vLLM 0.33.0 /
transformers 5.20.2 / math-verify 0.9.0, following the post's own `code/evaluate.py` protocol
(thinking on, `think35` sampling, last-`\boxed{}` grading). One deliberate substitution: the
experiment evaluated a text-only export of the model; this checkpoint is the full multimodal
release — the language-model tensors are identical (hash-verified) and the vision tower is unused
by text prompts.

## Usage

```python
from vllm import LLM, SamplingParams
from transformers import AutoTokenizer

ckpt = "akhaliq/Qwen3.5-0.8B-weight-space-programming"
tok = AutoTokenizer.from_pretrained(ckpt)
llm = LLM(model=ckpt, dtype="bfloat16", max_model_len=34816)

prompt = tok.apply_chat_template(
    [{"role": "user", "content": "What is $2^{10} + 24$?\nPlease reason step by step, and put your final answer within \\boxed{}."}],
    tokenize=False, add_generation_prompt=True, enable_thinking=True)
sp = SamplingParams(n=1, temperature=0.6, top_p=0.95, top_k=20, presence_penalty=1.5,
                    max_tokens=32768, seed=0)
print(llm.generate([prompt], sp)[0].outputs[0].text)
```

## Provenance

- Blog post: https://rikiyat.github.io/blog/weight-space-programming/
- Logs, diffs, and rebuild code: https://github.com/RikiyaT/lm_understand-logs (`exp8_math/`, CC BY 4.0 / MIT)
- Demo: [akhaliq/weight-space-programming-demo](https://huggingface.co/spaces/akhaliq/weight-space-programming-demo)
- Verification pipeline (this repo's `eval/`): MATH-500 (HuggingFaceH4/MATH-500), math-verify 0.9.0
- Base model: [Qwen/Qwen3.5-0.8B](https://huggingface.co/Qwen/Qwen3.5-0.8B), Apache 2.0
