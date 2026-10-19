# inputs/sweety-handdraw-video — editing package

A ~90 s 9:16 tutorial (Douyin first) about the open-source Agent Skill **sweety-handdraw-video**. Read `script.md` first: it has the storyboard, the verbatim narration, the long-clip plan, the covers and the platform copy.
**Duration note:** ~90 s overrides the standing ≤60 s rule for this job.

## Materials
| File | What | Source | Notes |
|---|---|---|---|
| materials/01a_film_snake_line_drawing.mp4 | Snake drawn as a line, stroke by stroke | Post's demo film, source 1.0–6.8 s | 1080×608, no audio, watermark + brush-shaft handle removed. Label 「案例展示」 |
| materials/01b_film_coil_outline_then_color.mp4 | Coil outline → color fill | Film 10.0–17.5 s | Same treatment |
| materials/01c_film_match_flame.mp4 | Match flame sketch → color | Film 27.5–31.6 s | Same treatment |
| materials/01d_film_man_sketch_to_color.mp4 | Man sketched → colored | Film 39.0–46.0 s | Same treatment |
| materials/previews/*_1fps.jpg | 1 fps contact sheets with timecodes (clip-local) | — | For picking in/out points |
| materials/02_hand_presets_9x16.jpg | Six arm presets, 9:16 layout with large labels | Official repo image `hand-presets.jpg` | Names verbatim from the repo |
| materials/02_hand_presets_official.jpg | Original official image (1440×960) | Official repo | Backup |
| materials/03_style_wall_9x16.jpg | 10 library styles with "逐笔/揭示" tags | Official repo style previews | Style 3 excluded (see below) |
| materials/styles/style_XX.jpg | Individual official style previews (1, 4, 5, 8, 9, 10, 13, 17, 19, 20) | Official repo | For custom layouts |
| materials/04_card_install.png | Step ① install command card (1080×1350) | Made by us from README v1.3 text | Not AI-generated |
| materials/05_card_setup.png | Step ② setup/doctor card | README v1.3 | Not AI-generated |
| materials/06_card_first_prompt.png | Step ③ official starter prompt card | README v1.3 | Not AI-generated |
| materials/07_card_outputs.png | Outputs + "reuse when revising" | README v1.3 | Not AI-generated |
| materials/08_card_pitfalls.png | 4 pitfalls card | README v1.3 | Not AI-generated |

No GenerateImage/GenerateVideo assets were needed. Every essential visual came from the post's film or the official repo, so there is no 「AI 生成示例」 asset in this package. The showcased film itself is AI-generated content, so turn on the platform AI label when publishing.

### Processing done on the film
- The light-gray handle watermark and promo line in the top-right corner were whitened.
- The handle printed on the brush shaft (the "笔杆文字" option) was filled with the shaft color and softened, frame by frame.
- Both were checked on frames sampled every 0.5 s: no readable handle remains.
- Audio stripped. Encode: H.264 CRF 27, 1080 wide, faststart.
- **Still present (crop in the edit, see script.md §2):** the film's own chapter titles at the top and burned-in subtitles at the bottom.

## Skipped materials and why
- **Raw demo film (k0, 49 s):** carries the author's handle watermark, the promo line and the brush-shaft handle. It also contains blood: red drops at ~7–10 s and the snake cut into red segments at ~21–27 s, which is Douyin-unsafe. Only the cleaned, gore-free segments 01a–01d are shipped.
- **Post images k1, k3, k4, k5 (film stills):** redundant with the film and watermarked.
- **Post image k2 (brush/hand combos):** replaced by the cleaner official `hand-presets.jpg`.
- **Post image k6 (voice list table):** outdated; the voice names don't match the current README v1.3.
- **Official `snake-drawing.webp`:** the same film as an animation. It carries the handle watermark and shows blood, so it was skipped.
- **Official style 3:** named after an animation studio IP (吉卜力风). Excluded to avoid IP/brand naming on screen.
- **Post text not used:** promotional superlatives, plans for a paid version, and the author's cost/time claims (see Unverified).

## Douyin notes
- Label every film shot only 「案例展示」, keep it muted, and crop the film's own title and subtitle bands.
- No handles, avatars, links, 公众号 or promotion. Voice: Volcengine/豆包 cloned voice only. Music from frame 0, ducked.
- Switch on the AI-generated declaration when publishing.

## Internal: sources (do not show on screen)
- Post: https://x.com/leo_xiaolei/status/2109982650199060818 (X article "开源手绘视频工具 sweety-handdraw-video：Codex 安装与使用教程"; the demo film and images were downloaded from it)
- Official repo (MIT): https://github.com/threerocks/sweety-handdraw-video. README v1.3, 2026-10-17, is the fact source for every claim.
- Hand presets and style previews: the official repo's README image assets.

## Unverified / caveats
- **Claude Code:** README says installation and local scripts are verified, but the full production flow is untested. The video says only "完整流程官方只在 Codex 上实测过".
- **Cost and time:** the author's "<1% of a $200 subscription" and "about 10 minutes" are self-reported and not stated in the video.
- **Post vs. README differences:** the post's check prompt mentions Bun and ExifTool, which v1.3 no longer lists as requirements. The post's install command is shorter than README's full command. The card uses the README's full command.
- **Voice quality:** README says the bundled synthetic voices are still pending listening review. 火山豆包/Gemini TTS integrations are only mock-tested. The video does not claim anything about voice quality.
- **Film watermark removal:** done by algorithm. The editor should still spot-check the final export.
