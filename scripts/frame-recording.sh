#!/usr/bin/env bash
# Wraps a simulator recording in the iPhone frame and writes an mp4 and a GIF.
#
# Usage: scripts/frame-recording.sh <recording.mp4> [out_dir]
#   Record with: xcrun simctl io booted recordVideo --codec=h264 recording.mp4
set -euo pipefail

IN="$1"
OUT="${2:-docs/media}"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

POS="$(python3 "$(dirname "$0")/phone-frame.py" "$WORK" | awk '{print $4}')"
SX="${POS%,*}"
SY="${POS#*,}"

# The frame images loop forever, so cap the output at the recording's length.
DUR="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$IN")"
FILTER="[0:v]fps=60,scale=603:1311[v];[2:v]format=gray[m];[v][m]alphamerge[s];[1:v][s]overlay=${SX}:${SY}"

ffmpeg -v error -y -i "$IN" -loop 1 -framerate 60 -i "$WORK/frame-base.png" -loop 1 -framerate 60 -i "$WORK/frame-mask.png" \
  -filter_complex "$FILTER,format=yuv420p" -t "$DUR" -an -c:v libx264 -crf 24 -preset slow -movflags +faststart \
  "$OUT/demo.mp4"

ffmpeg -v error -y -i "$OUT/demo.mp4" \
  -vf "fps=20,scale=420:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=160[p];[b][p]paletteuse=dither=bayer:bayer_scale=4" \
  "$OUT/demo.gif"

echo "wrote $OUT/demo.mp4 and $OUT/demo.gif"
