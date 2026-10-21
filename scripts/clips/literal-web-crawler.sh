#!/usr/bin/env bash
# Muted, 30 fps working copies of the self-recorded demo used by tutorials/literal-web-crawler (the original stays untouched
# in inputs/literal-web-crawler/). demo.mp4 is the whole recording (scenes pick in-points and speeds); the two slow-motion
# shots get their own motion-interpolated copies so 0.5× does not stutter at 12.5 fps. Re-run after changing in-points.
set -euo pipefail
cd "$(dirname "$0")/../.."
IN=inputs/literal-web-crawler/demo-full.mp4
OUT=public/video/literal-web-crawler
mkdir -p "$OUT"
[ -f "$OUT/demo.mp4" ] || ffmpeg -v error -y -i "$IN" -an -vf "fps=30,format=yuv420p" -c:v libx264 -crf 16 -preset slow -movflags +faststart "$OUT/demo.mp4"
slow() { # start dur out  -> 0.5× speed, 30 fps
  ffmpeg -v error -y -ss "$1" -t "$2" -i "$IN" -an -vf "setpts=2.0*PTS,minterpolate=fps=30:mi_mode=mci:mc_mode=aobmc:me_mode=bidir,format=yuv420p" \
    -c:v libx264 -crf 16 -preset slow -movflags +faststart "$OUT/$3"
}
slow 19.0 2.2 slow-tear.mp4   # shot 3b: foot hooks a link, debris falls (4.4 s)
slow 12.6 3.6 slow-end.mp4    # end: the hook shot again, slowed down (7.2 s)
# cover still: the spider mid-rip
ffmpeg -v error -y -ss 14.0 -i "$IN" -frames:v 1 "$OUT/still-rip.png"
ls -la "$OUT"
