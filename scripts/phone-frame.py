"""Draws an iPhone-style frame for wrapping simulator recordings.

Writes two images to the output directory:
  frame-base.png  background, drop shadow, titanium body and black bezel (screen area black)
  frame-mask.png  white rounded rectangle marking the screen, used as the video's alpha mask

Usage: python3 scripts/phone-frame.py <out_dir>
Then see scripts/frame-recording.sh for the ffmpeg composite.
"""

import os
import sys

from PIL import Image, ImageDraw, ImageFilter

# Screen size the recording is scaled to (iPhone 18 Pro is 402x874 pt, so 1.5x).
SCREEN_W, SCREEN_H = 603, 1311
SCREEN_R = 83  # ~55pt display corner radius at 1.5x
BEZEL = 16  # black border between screen and body
RIM = 7  # titanium edge
CANVAS_W, CANVAS_H = 900, 1500
BG = (236, 236, 236, 255)
RIM_COLOR = (196, 190, 182, 255)
RIM_HIGHLIGHT = (228, 224, 218, 255)


def rounded(size, radius, fill):
    img = Image.new("RGBA", size, (0, 0, 0, 0))
    ImageDraw.Draw(img).rounded_rectangle([0, 0, size[0] - 1, size[1] - 1], radius, fill=fill)
    return img


def main(out_dir):
    os.makedirs(out_dir, exist_ok=True)
    body_w = SCREEN_W + 2 * (BEZEL + RIM)
    body_h = SCREEN_H + 2 * (BEZEL + RIM)
    body_r = SCREEN_R + BEZEL + RIM
    bx = (CANVAS_W - body_w) // 2
    by = (CANVAS_H - body_h) // 2

    canvas = Image.new("RGBA", (CANVAS_W, CANVAS_H), BG)

    # Soft drop shadow under the phone.
    shadow = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle(
        [bx + 10, by + 30, bx + body_w - 10, by + body_h + 10], body_r, fill=(0, 0, 0, 70)
    )
    canvas.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(28)))

    # Side buttons (action + volume on the left, power on the right), drawn behind the rim.
    d = ImageDraw.Draw(canvas)
    for y, h in ((by + 190, 52), (by + 290, 96), (by + 410, 96)):
        d.rounded_rectangle([bx - 5, y, bx + 6, y + h], 3, fill=RIM_COLOR)
    d.rounded_rectangle([bx + body_w - 6, by + 330, bx + body_w + 5, by + 480], 3, fill=RIM_COLOR)

    # Titanium rim with a subtle inner highlight, then the black bezel.
    canvas.alpha_composite(rounded((body_w, body_h), body_r, RIM_COLOR), (bx, by))
    canvas.alpha_composite(rounded((body_w - 4, body_h - 4), body_r - 2, RIM_HIGHLIGHT), (bx + 2, by + 2))
    canvas.alpha_composite(
        rounded((body_w - 2 * RIM, body_h - 2 * RIM), body_r - RIM, (10, 10, 12, 255)), (bx + RIM, by + RIM)
    )
    canvas.save(os.path.join(out_dir, "frame-base.png"))

    mask = Image.new("L", (SCREEN_W, SCREEN_H), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, SCREEN_W - 1, SCREEN_H - 1], SCREEN_R, fill=255)
    mask.save(os.path.join(out_dir, "frame-mask.png"))

    sx, sy = bx + RIM + BEZEL, by + RIM + BEZEL
    print(f"screen {SCREEN_W}x{SCREEN_H} at {sx},{sy}")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "docs/media/frame")
