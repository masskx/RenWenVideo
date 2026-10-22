#!/usr/bin/env bash
# Working copies for tutorials/claude-proactive-agent (the originals stay untouched in inputs/claude-proactive-agent/assets/).
# Footage: Pexels, re-encoded muted at 30 fps (dimming is done in the scene). Icons: Tabler (MIT), copied as shipped (cyan)
# plus amber / ink / red recolours for state changes.
set -euo pipefail
cd "$(dirname "$0")/../.."
IN=inputs/claude-proactive-agent/assets
VOUT=public/video/claude-proactive-agent
IOUT=public/images/tutorials/claude-proactive-agent
mkdir -p "$VOUT" "$IOUT"
for f in "$IN"/footage/*.mp4; do
  ffmpeg -v error -y -i "$f" -an -vf "fps=30,scale=-2:1280:flags=lanczos,format=yuv420p" -c:v libx264 -crf 20 -preset slow -movflags +faststart "$VOUT/$(basename "$f")"
done
for f in "$IN"/icons/*.svg; do
  b=$(basename "$f" .svg)
  cp "$f" "$IOUT/$b.svg"
  sed 's/#00e5ff/#ffb020/g' "$f" > "$IOUT/$b-amber.svg"
  sed 's/#00e5ff/#e8f0fa/g' "$f" > "$IOUT/$b-ink.svg"
  sed 's/#00e5ff/#ff5a5a/g' "$f" > "$IOUT/$b-red.svg"
done
ls "$VOUT" "$IOUT" | head -60
