#!/usr/bin/env bash
# Muted, 30 fps working copies of the external clips used by tutorials/deepseek-vs-opus55 (originals stay untouched
# in inputs/deepseek-vs-opus55/). In/out points are the ones in the storyboard; re-run after changing them.
set -euo pipefail
cd "$(dirname "$0")/../.."
IN=inputs/deepseek-vs-opus55
OUT=public/video/deepseek-vs-opus55
mkdir -p "$OUT"
cut() { # src start dur width out
  ffmpeg -v error -y -ss "$2" -t "$3" -i "$1" -an -vf "fps=30,scale=$4:-2:flags=lanczos,format=yuv420p" \
    -c:v libx264 -crf 18 -preset slow -movflags +faststart "$OUT/$5"
}
cut "$IN/素材/A_2103315748496302080.mp4"               1.5  9.3  1280 A_hook.mp4      # Opus 5.5 · @stephanlivera
cut "$IN/deepseek_materials/F_2111449639216103424.mp4" 0.0  9.3  1280 F_hook.mp4      # DeepSeek 1017 · @NpieAI (same prompt, Chinese)
cut "$IN/deepseek_materials/G_2111427449984589825.mp4" 2.0  13.0 1080 G_compare.mp4   # Opus top / DeepSeek bottom · @marcthecreatorr
cut "$IN/deepseek_materials/G_2111427449984589825.mp4" 15.0 8.0  1080 G_review.mp4    # same clip, the next stretch (author's verdict)
cut "$IN/素材/A_2103315748496302080.mp4"               5.5  9.5  1280 A_end.mp4
cut "$IN/deepseek_materials/F_2111449639216103424.mp4" 5.5  9.5  1280 F_end.mp4
# cover stills
ffmpeg -v error -y -ss 3.0 -i "$IN/素材/A_2103315748496302080.mp4" -frames:v 1 -vf scale=1280:-2 "$OUT/A_still.png"
ffmpeg -v error -y -ss 8.6 -i "$IN/deepseek_materials/F_2111449639216103424.mp4" -frames:v 1 -vf scale=1280:-2 "$OUT/F_still.png"
ls -la "$OUT"
