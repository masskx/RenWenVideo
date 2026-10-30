# HN We're releasing the weights of Mistral Large 4 — score 1131, 324 comments (fetched 2026-10-30 ~07:55 Asia/Taipei)
https://news.ycombinator.com/item?id=50289418
(usernames omitted; order = HN ranking)

## #50290476 (26 replies)
> 2. If the Licensee or any of its affiliates operates a Model as a Service business, the Licensee must enter into a separate commercial license with Mistral before using the Model or its derivative works for any commercial purpose. The Licensee may contact Mistral, using this form: https://mistral.ai/contact/, to request a commercial license. [0]
Calling this "open weight" is misleading. That's why we had huge backlash when Redis, Elasticsearch, and Terraform went source-available, right?
Weight-available is a better adjective for this kind of licensing. Same for Qwen, GLM, Kimi, MiniMax, etc. If they really want to be open source, they should pick an OSI-approved license.
[0]: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B/blo...

## #50297894 (0 replies)
Very nice. I always expected it to beat z.ai's model, by at least a little bit, since it's so similar and would be slightly behind Kimi. Maybe this can change with better post-training, but it's great to go from not having a model in this size class to making something competitive with z.ai, who of course have made several good large models.
A first step on a trip which will hopefully go quite far.

## #50290261 (3 replies)
Mistral has been great for us as a provider for our EU-based company. We use Mistral Large 4, GLM 5.3 Flash and DeepSeek v4.1 Flash 1017 through their API for our B2B2C app for complex work around building blocks for documents and custom tools. A few months ago we weren't sure which EU provider to use, but since they introduced 3rd party models, added more features (now Responses API etc.) and improved their own model, we are quite happy-

## #50289701 (6 replies)
They slashed pricing, it's now nearly half vs the preview (Input: $0.7/M Tokens, Output: $2.1/M Tokens vs Input: $1.36/M Tokens, Output: $4.18/M Tokens).
At the original pricing in my evals, Mistral Large 4 Preview was not competitive. With this price point and some improvements on top, this full release warrants a major reassessment.
[0] https://docs.mistral.ai/inference/pricing

## #50289555 (3 replies)
Kind of buried down at the end:
https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B
https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B-NVF...

## #50289898 (5 replies)
"Cyber benchmarks, while achieving an average refusal rate of 96.6% on malicious cyber requests, the highest we measure among open models."
I feel like stating the obvious here and hence like I'm missing something. Where is the statistic about not refusing the non malicious requests? I can achieve the same performance with refusing when random(1000) < 967.

## #50294837 (0 replies)
I'll never not cheer for Mistral.
The more countries are in this game the better for us all.
Much like other stuff when there isn't enough competition the consumer gets wrecked

## #50289652 (10 replies)
It's not open weight, it's weights available as they use a modified MIT license that is not OSI. It's the common "if you're serving it as a business you need a license" difference, for what it's worth.

## #50294557 (4 replies)
It's interesting how all the recent SOTA models are in the 1T-3T range. This even has a large number of active parameters (A52B). It is also likely that OpenAI, Anthropic, et. al. have similar sized models.
This has two effects: 1) it prevents effective use of these models on consumer-grade hardware; and 2) it pushes the requirements to train and run these models on existing and future data centres, making them more expensive to run.
It would be nice to have more slimmer models and more active research that isn't just "let's throw more compute at the problem". Maybe they'll train smaller models from the large model like Qwen have done in the past.

## #50290022 (6 replies)
I have access to a server with 4 x h200 cards - 540 GB in total memory, but it appears I have to go to 4bit or 3bit even to serve it. Any idea if that is feasible/desirable (we have restrictions that we can't use a chinese model!).
