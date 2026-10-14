"""Generates the placeholder book covers in assets/covers.

Run with: python3 scripts/generate-covers.py
Each cover is original typographic art (no real cover artwork is reproduced).
"""

import math
import os
import random

from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 600, 900
OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "covers")
SUP = "/System/Library/Fonts/Supplemental/"
SYS = "/System/Library/Fonts/"


def font(name, size, index=0):
    for base in (SUP, SYS):
        path = base + name
        if os.path.exists(path):
            return ImageFont.truetype(path, size, index=index)
    return ImageFont.load_default(size)


IMPACT = lambda s: font("Impact.ttf", s)
DIDOT = lambda s, i=0: font("Didot.ttc", s, i)
FUTURA = lambda s, i=0: font("Futura.ttc", s, i)
GEORGIA_B = lambda s: font("Georgia Bold.ttf", s)
ROCKWELL = lambda s, i=0: font("Rockwell.ttc", s, i)
AVENIR = lambda s, i=0: font("Avenir Next.ttc", s, i)
COPPER = lambda s, i=0: font("Copperplate.ttc", s, i)
BASKER = lambda s, i=0: font("Baskerville.ttc", s, i)


def hexc(h, a=255):
    h = h.lstrip("#")
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4)) + (a,)


def centered(d, y, text, f, fill, spacing=0, x=W / 2):
    for line in text.split("\n"):
        box = d.textbbox((0, 0), line, font=f)
        w, h = box[2] - box[0], box[3] - box[1]
        d.text((x - w / 2 - box[0], y - box[1]), line, font=f, fill=fill)
        y += h + spacing
    return y


def left(d, x, y, text, f, fill, spacing=0):
    for line in text.split("\n"):
        box = d.textbbox((0, 0), line, font=f)
        d.text((x - box[0], y - box[1]), line, font=f, fill=fill)
        y += box[3] - box[1] + spacing
    return y


def grain(img, amount=10, seed=0):
    rnd = random.Random(seed)
    noise = Image.new("L", img.size)
    noise.putdata([128 + rnd.randint(-amount, amount) for _ in range(img.size[0] * img.size[1])])
    noise = noise.filter(ImageFilter.GaussianBlur(0.6)).convert("RGBA")
    return Image.blend(img, Image.composite(noise, img, Image.new("L", img.size, 40)), 0.35)


def vgrad(img, top, bottom):
    d = ImageDraw.Draw(img)
    t, b = hexc(top), hexc(bottom)
    for y in range(H):
        k = y / H
        d.line([(0, y), (W, y)], fill=tuple(int(t[i] + (b[i] - t[i]) * k) for i in range(4)))


def tree(d, x, y, angle, length, depth, color, width):
    if depth == 0 or length < 4:
        return
    x2 = x + math.cos(math.radians(angle)) * length
    y2 = y - math.sin(math.radians(angle)) * length
    d.line([(x, y), (x2, y2)], fill=color, width=max(1, int(width)))
    rnd = random.Random(depth * 31 + int(x))
    for spread in (-26 - rnd.random() * 10, 24 + rnd.random() * 10):
        tree(d, x2, y2, angle + spread, length * 0.74, depth - 1, color, width * 0.68)


# ---------- cover styles ----------

def orphaned_believers():
    img = Image.new("RGBA", (W, H), hexc("#C8141C"))
    d = ImageDraw.Draw(img)
    centered(d, 50, "ORPHANED\nBELIEVERS", IMPACT(108), hexc("#FFFFFF"), 6)
    for i, (dx, dy, rot) in enumerate([(-40, 0, -12), (30, 30, 8), (0, 60, -3)]):
        card = Image.new("RGBA", (260, 300), hexc("#F4F1EA"))
        cd = ImageDraw.Draw(card)
        cd.rectangle([18, 18, 242, 230], fill=hexc(["#3C3C3C", "#6E6A63", "#9A958B"][i]))
        cd.ellipse([90, 80, 170, 160], outline=hexc("#E8E4DA"), width=6)
        card = card.rotate(rot, expand=True, resample=Image.BICUBIC)
        img.alpha_composite(card, (150 + dx, 400 + dy))
    centered(d, 820, "SARA BILLUPS", FUTURA(34, 2), hexc("#FFFFFF"))
    return img


def next_of_kin():
    img = Image.new("RGBA", (W, H), hexc("#E8412C"))
    d = ImageDraw.Draw(img)
    centered(d, 40, "N E X T\nO F  K I N", ROCKWELL(96, 1), hexc("#FFF4E8"), 10)
    tree(d, W / 2, 760, 90, 150, 9, hexc("#2A0E0A"), 22)
    centered(d, 700, "GABRIELLE\nHAMILTON", ROCKWELL(64, 1), hexc("#FFF4E8"), 6)
    return img


def conform():
    img = Image.new("RGBA", (W, H))
    vgrad(img, "#E9EEF4", "#C9D6E4")
    d = ImageDraw.Draw(img)
    gold = hexc("#C79A3A")
    d.polygon([(300, 90), (285, 330), (315, 330)], fill=gold)
    for y, w in ((250, 150), (300, 210), (560, 180), (610, 120)):
        d.ellipse([300 - w, y - 16, 300 + w, y + 16], fill=gold)
    d.polygon([(285, 560), (315, 560), (300, 760)], fill=gold)
    centered(d, 400, "CONFORM", DIDOT(116), hexc("#B88A2E"))
    centered(d, 830, "ARIEL SULLIVAN", FUTURA(30), hexc("#8D7A55"))
    return img


def richest_man():
    img = Image.new("RGBA", (W, H))
    vgrad(img, "#1F3A3F", "#14282C")
    d = ImageDraw.Draw(img)
    centered(d, 80, "THE RICHEST\nMAN IN\nBABYLON", BASKER(78), hexc("#E8E2CF"), 14)
    for i in range(7):
        w = 220 - i * 26
        d.rectangle([300 - w / 2, 650 - i * 42, 300 + w / 2, 690 - i * 42], fill=hexc(["#B9874B", "#A2733D", "#C99A5B"][i % 3]))
    centered(d, 760, "GEORGE S. CLASON", FUTURA(34), hexc("#E8E2CF"))
    return img


def too_big():
    img = Image.new("RGBA", (W, H), hexc("#E12B2B"))
    d = ImageDraw.Draw(img)
    centered(d, 30, "ANDREW ROSS SORKIN", IMPACT(46), hexc("#FFFFFF"))
    centered(d, 120, "TOO\nBIG\nTO\nFAIL", IMPACT(168), hexc("#111111"), -6)
    d.rectangle([0, 840, W, H], fill=hexc("#111111"))
    centered(d, 852, "NEW YORK TIMES BESTSELLER", IMPACT(34), hexc("#FFFFFF"))
    return img


def short_history():
    img = Image.new("RGBA", (W, H), hexc("#5B6B3A"))
    d = ImageDraw.Draw(img)
    centered(d, 140, "A\nSHORT\nHISTORY OF\nFINANCIAL\nEUPHORIA", COPPER(66, 1), hexc("#F1E9CF"), 18)
    d.line([(160, 690), (440, 690)], fill=hexc("#F1E9CF"), width=3)
    centered(d, 730, "JOHN KENNETH\nGALBRAITH", COPPER(40), hexc("#F1E9CF"), 8)
    return img


def mastering_cycle():
    img = Image.new("RGBA", (W, H))
    vgrad(img, "#C9A24B", "#9C7A2E")
    d = ImageDraw.Draw(img)
    centered(d, 40, "THE NEW YORK TIMES BESTSELLER", FUTURA(24), hexc("#3A2C10"))
    centered(d, 130, "MASTERING\nTHE\nMARKET\nCYCLE", GEORGIA_B(80), hexc("#FFF8E3"), 12)
    pts = [(x, 640 + math.sin(x / 50) * 60) for x in range(40, 560, 6)]
    d.line(pts, fill=hexc("#3A2C10"), width=6)
    centered(d, 800, "HOWARD MARKS", FUTURA(38, 2), hexc("#3A2C10"))
    return img


def atomic_habits():
    img = Image.new("RGBA", (W, H), hexc("#F2EEE3"))
    d = ImageDraw.Draw(img)
    centered(d, 50, "Tiny Changes,\nRemarkable Results", GEORGIA_B(34), hexc("#3A3A3A"), 6)
    centered(d, 230, "Atomic\nHabits", font("Georgia.ttf", 140), hexc("#D9A55C"), -4)
    centered(d, 580, "An Easy & Proven Way\nto Build Good Habits\n& Break Bad Ones", font("Georgia.ttf", 30), hexc("#5A5A5A"), 6)
    centered(d, 800, "James Clear", GEORGIA_B(46), hexc("#222222"))
    d.ellipse([470, 760, 540, 830], fill=hexc("#C77A2E"))
    return img


def power_discipline():
    img = Image.new("RGBA", (W, H), hexc("#F7D417"))
    d = ImageDraw.Draw(img)
    left(d, 50, 120, "THE", IMPACT(60), hexc("#111111"))
    left(d, 50, 190, "POWER", IMPACT(150), hexc("#111111"))
    left(d, 50, 360, "DISCIPLINE", IMPACT(108), hexc("#111111"))
    left(d, 440, 330, "of", GEORGIA_B(44), hexc("#111111"))
    left(d, 50, 520, "HOW TO USE SELF CONTROL AND MENTAL\nTOUGHNESS TO ACHIEVE YOUR GOALS", FUTURA(24, 2), hexc("#111111"), 10)
    d.rectangle([0, 780, W, H], fill=hexc("#111111"))
    centered(d, 815, "DANIEL WALTER", IMPACT(56), hexc("#F7D417"))
    return img


def five_rings():
    img = Image.new("RGBA", (W, H), hexc("#F3EFE6"))
    d = ImageDraw.Draw(img)
    centered(d, 50, "The Book of\nFive Rings", BASKER(70, 1), hexc("#B5232B"), 4)
    d.rectangle([40, 290, 560, 880], fill=hexc("#7A1420"))
    for i in range(14):
        r = 260 - i * 18
        c = ["#F05A28", "#7A1420", "#FDB54A", "#B5232B"][i % 4]
        d.ellipse([300 - r, 620 - r, 300 + r, 620 + r], fill=hexc(c))
    d.rectangle([292, 560, 308, 700], fill=hexc("#1B0A0C"))
    d.ellipse([287, 540, 313, 566], fill=hexc("#1B0A0C"))
    return img


def one():
    img = Image.new("RGBA", (W, H), hexc("#E6E6E2"))
    d = ImageDraw.Draw(img)
    centered(d, 40, "Discover the Power of Singular Focus", AVENIR(24, 1), hexc("#555555"))
    centered(d, 110, "ONE", FUTURA(190), hexc("#1E1E1E"))
    centered(d, 330, "BECOME TOMORROW'S YOU TODAY", AVENIR(22, 1), hexc("#333333"))
    d.ellipse([140, 700, 460, 800], fill=hexc("#4A3A2C"))
    d.line([(300, 720), (300, 560)], fill=hexc("#5E8C3A"), width=8)
    d.ellipse([200, 520, 300, 580], fill=hexc("#7DB24A"))
    d.ellipse([300, 490, 410, 560], fill=hexc("#6AA23C"))
    centered(d, 840, "BRADLEY CHARBONNEAU", AVENIR(26, 1), hexc("#333333"))
    return img


def trust():
    img = Image.new("RGBA", (W, H))
    vgrad(img, "#3E8C7A", "#1E5A4C")
    d = ImageDraw.Draw(img)
    d.ellipse([60, 80, 200, 220], fill=hexc("#D9B24A"))
    d.polygon([(330, 160), (360, 160), (380, 900), (300, 900)], fill=hexc("#BFD8CF", 200))
    d.polygon([(250, 360), (330, 300), (330, 900), (250, 900)], fill=hexc("#9EC2B6", 200))
    centered(d, 700, "T R U S T", BASKER(96, 1), hexc("#F0F6F2"))
    centered(d, 830, "HERNAN DIAZ", FUTURA(30), hexc("#F0F6F2"))
    return img


def electric_city():
    img = Image.new("RGBA", (W, H))
    vgrad(img, "#2B2F2A", "#141614")
    d = ImageDraw.Draw(img)
    centered(d, 80, "ELECTRIC\nCITY", ROCKWELL(110, 1), hexc("#E8A33A"), 6)
    centered(d, 380, "THE LOST HISTORY OF FORD\nAND EDISON'S AMERICAN UTOPIA", FUTURA(26), hexc("#D8D2C0"), 10)
    for i, h in enumerate([220, 300, 260, 340, 200]):
        x = 70 + i * 96
        d.rectangle([x, 900 - h - 100, x + 70, 800], fill=hexc("#3A4A3A"))
    centered(d, 830, "THOMAS HAGER", ROCKWELL(46, 1), hexc("#E8A33A"))
    return img


def practical_uncertainty():
    img = Image.new("RGBA", (W, H), hexc("#F7F7F5"))
    d = ImageDraw.Draw(img)
    centered(d, 70, "PRACTICAL", FUTURA(84, 2), hexc("#111111"))
    for i in range(14):
        x = 60 + i * 36
        d.line([(x, 190), (x + 8, 520 + (i % 3) * 30)], fill=hexc("#333333"), width=3)
        d.ellipse([x - 4, 510 + (i % 3) * 30, x + 16, 530 + (i % 3) * 30], fill=hexc("#111111"))
    for i, ch in enumerate("UNCERTAINTY"):
        d.text((50 + i * 46, 640 + math.sin(i) * 30), ch, font=FUTURA(56, 2), fill=hexc("#111111"))
    return img


def nervous_system():
    img = Image.new("RGBA", (W, H), hexc("#C9C43A"))
    d = ImageDraw.Draw(img)
    left(d, 30, 30, "NERVOUS\nSYSTEM", DIDOT(96, 2), hexc("#1E1E1A"), 0)
    for i in range(18):
        d.arc([60 + i * 6, 380 + i * 8, 540 - i * 6, 880 - i * 4], 200, 340, fill=hexc("#5A6A2A"), width=3)
    centered(d, 820, "WANG YAN", FUTURA(36, 2), hexc("#1E1E1A"))
    return img


def the_magic():
    img = Image.new("RGBA", (W, H), hexc("#24B7B5"))
    d = ImageDraw.Draw(img)
    centered(d, 40, "THE MAGIC", FUTURA(96, 2), hexc("#FFFFFF"))
    for i in range(6):
        d.ellipse([150 + i * 10, 300 + i * 10, 450 - i * 10, 600 - i * 10], outline=hexc(["#FFE14A", "#FF6F61", "#FFFFFF"][i % 3]), width=8)
    centered(d, 650, "RHONDA BYRNE", FUTURA(40, 2), hexc("#0E4F4E"))
    return img


def fahrenheit():
    img = Image.new("RGBA", (W, H), hexc("#D3202E"))
    d = ImageDraw.Draw(img)
    centered(d, 40, "60TH ANNIVERSARY EDITION", FUTURA(28, 2), hexc("#F4D9B5"))
    d.polygon([(130, 400), (480, 300), (520, 420), (170, 520)], fill=hexc("#F7F2E8"))
    d.polygon([(200, 470), (300, 600), (330, 560), (240, 440)], fill=hexc("#1A1A1A"))
    centered(d, 640, "FAHRENHEIT\n451", IMPACT(120), hexc("#F7F2E8"), 0)
    return img


def let_her_wolf():
    img = Image.new("RGBA", (W, H), hexc("#2C3E77"))
    d = ImageDraw.Draw(img)
    centered(d, 120, "LET\nHER\nWOLF", IMPACT(170), hexc("#F2C14E"), -4)
    centered(d, 820, "A NOVEL", FUTURA(30, 2), hexc("#F2C14E"))
    return img


def deep_work():
    img = Image.new("RGBA", (W, H), hexc("#F1E6D2"))
    d = ImageDraw.Draw(img)
    centered(d, 120, "DEEP\nWORK", FUTURA(150, 2), hexc("#1F2A44"), 0)
    d.rectangle([90, 520, 510, 530], fill=hexc("#D9572B"))
    centered(d, 580, "RULES FOR FOCUSED SUCCESS\nIN A DISTRACTED WORLD", FUTURA(28), hexc("#1F2A44"), 10)
    centered(d, 800, "CAL NEWPORT", FUTURA(44, 2), hexc("#D9572B"))
    return img


def still_mind():
    img = Image.new("RGBA", (W, H))
    vgrad(img, "#F6C9A8", "#7E8FC4")
    d = ImageDraw.Draw(img)
    d.ellipse([200, 380, 400, 580], fill=hexc("#FFF2DC"))
    d.rectangle([0, 600, W, H], fill=hexc("#45507F"))
    centered(d, 90, "The Still\nMind", DIDOT(110, 1), hexc("#2B2F4F"), 0)
    centered(d, 810, "ANNA RIVERA", FUTURA(32), hexc("#F6E8DA"))
    return img


def quiet_hours():
    img = Image.new("RGBA", (W, H), hexc("#2F4A3A"))
    d = ImageDraw.Draw(img)
    for i in range(9):
        d.ellipse([300 - 40 * i, 450 - 40 * i, 300 + 40 * i, 450 + 40 * i], outline=hexc("#8FB39A", 160), width=2)
    centered(d, 80, "QUIET\nHOURS", COPPER(100, 1), hexc("#E9F1E2"), 8)
    centered(d, 820, "M. OKAFOR", COPPER(40), hexc("#E9F1E2"))
    return img


BOOKS = {
    "orphaned-believers": orphaned_believers,
    "next-of-kin": next_of_kin,
    "conform": conform,
    "richest-man": richest_man,
    "too-big-to-fail": too_big,
    "short-history": short_history,
    "mastering-cycle": mastering_cycle,
    "atomic-habits": atomic_habits,
    "power-discipline": power_discipline,
    "five-rings": five_rings,
    "one": one,
    "trust": trust,
    "electric-city": electric_city,
    "practical-uncertainty": practical_uncertainty,
    "nervous-system": nervous_system,
    "the-magic": the_magic,
    "fahrenheit": fahrenheit,
    "let-her-wolf": let_her_wolf,
    "deep-work": deep_work,
    "still-mind": still_mind,
    "quiet-hours": quiet_hours,
}


def wood():
    """A cork/wood plank texture for the shelf."""
    pw, ph = 1200, 48
    img = Image.new("RGBA", (pw, ph), hexc("#8A5A33"))
    d = ImageDraw.Draw(img)
    rnd = random.Random(7)
    for _ in range(5000):
        x, y = rnd.randint(0, pw), rnd.randint(0, ph)
        c = rnd.choice(["#6E4424", "#A26E42", "#B88452", "#5E391D"])
        d.point((x, y), fill=hexc(c))
    for y in range(0, ph, 3):
        d.line([(0, y), (pw, y + rnd.randint(-1, 1))], fill=hexc("#7A4B28", 60))
    d.rectangle([0, 0, pw, 3], fill=hexc("#B07A49"))
    return img.filter(ImageFilter.GaussianBlur(0.4))


def avatar():
    s = 240
    img = Image.new("RGBA", (s, s))
    vgrad_img = Image.new("RGBA", (s, s))
    d = ImageDraw.Draw(vgrad_img)
    for y in range(s):
        k = y / s
        d.line([(0, y), (s, y)], fill=(int(240 - 30 * k), int(150 - 40 * k), int(90 - 30 * k), 255))
    d.ellipse([70, 40, 170, 150], fill=hexc("#6B3A22"))
    d.ellipse([84, 60, 156, 140], fill=hexc("#E8B48C"))
    d.ellipse([40, 150, 200, 320], fill=hexc("#FFFFFF"))
    mask = Image.new("L", (s, s))
    ImageDraw.Draw(mask).ellipse([0, 0, s, s], fill=255)
    img.paste(vgrad_img, (0, 0), mask)
    return img


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    for i, (slug, fn) in enumerate(BOOKS.items()):
        cover = grain(fn(), seed=i).convert("RGB")
        cover.save(os.path.join(OUT, f"{slug}.jpg"), quality=86)
    wood().convert("RGB").save(os.path.join(OUT, "..", "shelf-wood.jpg"), quality=88)
    avatar().save(os.path.join(OUT, "..", "avatar.png"))
    print(f"wrote {len(BOOKS)} covers")
