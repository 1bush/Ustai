#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""USTAI-IM — bibliotekë ndihmëse për gjenerimin e ikonave / logove.

Përmban:
  * zbrazjen e sfondit të bardhë (flood-fill nga kufijtë, jo globalisht —
    kështu elementet e bardha BRENDA logos nuk gërryehen),
  * siluetën e bardhë për ikonat e njoftimeve (Android i ngjyros vetë),
  * vizatimin vektorial të logove Apple dhe Google.
"""

import re

import numpy as np
from PIL import Image, ImageDraw

# ─────────────────────────── ngjyrat e brendit ───────────────────────────
# Përputhen me src/theme/colors.ts
SFONDI = (0x0A, 0x0A, 0x0A, 255)  # NGJYRAT.sfondi
PRIMARE = (0xFF, 0x7A, 0x1A, 255)  # NGJYRAT.primare

# Google (ngjyrat zyrtare)
G_BLUE = (66, 133, 244)
G_RED = (234, 67, 53)
G_YELLOW = (251, 188, 5)
G_GREEN = (52, 168, 83)
APPLE_WHITE = (255, 255, 255)

SS = 8  # faktor supersampling për vizatimet vektoriale (anti-aliasing)


def circle_transparent(im, soft=2.0, tol=246):
    """Bën transparente gjithçka JASHTË rrethit të logos.

    Logoja është badge rrethore mbi sfond të bardhë; rrethi nxirret nga bbox-i
    i pikselave jo-të-bardhë. Shumë më e shpejtë se flood-fill-i në Python
    (gjithçka bëhet me NumPy) dhe nuk gërryen elementet e bardha BRENDA logos
    — p.sh. shkronja 'U'.
    """
    rgba = im.convert("RGBA")
    arr = np.array(rgba)
    lum = arr[..., :3].astype(np.float32) @ np.array([0.299, 0.587, 0.114])
    ys, xs = np.nonzero(lum < tol)
    if len(xs) == 0:
        return rgba
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    cx, cy = (x0 + x1) / 2.0, (y0 + y1) / 2.0
    radius = min(x1 - x0 + 1, y1 - y0 + 1) / 2.0
    gy, gx = np.ogrid[0:arr.shape[0], 0:arr.shape[1]]
    dist = np.sqrt((gx - cx) ** 2 + (gy - cy) ** 2)
    if soft > 0:
        k = np.clip((radius - dist) / soft, 0.0, 1.0)
    else:
        k = (dist <= radius).astype(np.float32)
    arr[..., 3] = (arr[..., 3].astype(np.float32) * k).astype(np.uint8)
    return Image.fromarray(arr, "RGBA")


def flood_transparent(im, tol=64):
    """Transparenton VETËM sfondin e lidhur me kufijtë (jo vrimat brenda)."""
    rgba = im.convert("RGBA")
    rgb = rgba.convert("RGB")
    w, h = rgb.size
    magic = (255, 0, 255)
    for xy in ((0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)):
        ImageDraw.floodfill(rgb, xy, magic, thresh=tol)
    arr = np.array(rgb)
    mask = np.all(arr == np.array(magic, dtype=np.uint8), axis=-1)
    out = np.array(rgba)
    out[mask, 3] = 0
    return Image.fromarray(out, "RGBA")


def trim(im, pad=0):
    """Pret rrethin e dukshëm (bbox i pikselave jo-transparente) + pad px."""
    bbox = im.getbbox()
    if bbox is None:
        return im
    l, t, r, b = bbox
    l, t = max(0, l - pad), max(0, t - pad)
    r, b = min(im.width, r + pad), min(im.height, b + pad)
    return im.crop((l, t, r, b))


def square(im, size, bg=(0, 0, 0, 0), scale=1.0):
    """Vendos im-në në një kanavacë katrore size×size, të centruar.

    scale < 1 e zvogëlon logon (për 'zonën e sigurt' të adaptive-icon).
    """
    canvas = Image.new("RGBA", (size, size), bg)
    target = max(1, int(round(size * scale)))
    w, h = im.size
    k = min(target / w, target / h)
    resized = im.resize((max(1, int(w * k)), max(1, int(h * k))), Image.LANCZOS)
    canvas.alpha_composite(resized, ((size - resized.width) // 2,
                                     (size - resized.height) // 2))
    return canvas


def silhouette(im, size, cut=140, full=210):
    """Kthen një siluetë TË BARDHË mbi transparent nga pjesët e ndritshme.

    Android e ngjyros vetë ikonën e njoftimit, prandaj duhet vetëm forma
    (alfa), jo ngjyrat. Pikselat e ndritshëm → të bardhë opak.
    """
    src = im.convert("RGBA")
    arr = np.asarray(src).astype(np.float32)
    lum = arr[..., :3] @ np.array([0.299, 0.587, 0.114], dtype=np.float32)
    alfa = np.clip((lum - cut) / float(full - cut), 0.0, 1.0)
    alfa = alfa * (arr[..., 3] / 255.0)  # respekto transparentin ekzistues
    out = np.zeros((*alfa.shape, 4), dtype=np.uint8)
    out[..., 0:3] = 255
    out[..., 3] = (alfa * 255).astype(np.uint8)
    glyph = Image.fromarray(out, "RGBA")
    return square(trim(glyph), size, scale=0.92)


def ustai_glyph(size, color=(255, 255, 255, 255)):
    """Grafik i thjeshtë 'U me kasketë' për ikonën e njoftimeve.

    Android e ngjyros vetë ikonën e njoftimeve dhe e shfaq në 24dp, prandaj
    duhet një formë e thjeshtë e lexueshme. Logoja e detajuar aty bëhet një
    rreth i hollë i palexueshëm — kjo është arsyeja e këtij glifi të veçantë.
    """
    big = size * SS
    img = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    s = float(big)
    col = color[:3] + (255,)

    # ── shkronja 'U' ──
    t = 0.15 * s                       # trashësia e vijës
    u = 0.52 * s                       # gjërësia e jashtme
    left = (s - u) / 2.0
    right = left + u
    y_top = 0.46 * s
    y_bot = 0.72 * s                   # qendra e harkut të poshtëm
    r = u / 2.0                        # rrezja e jashtme e harkut
    # harku i poshtëm: PIL 0°=E, 90°=S, 180°=W → 0..180 është gjysma e poshtme.
    # Rrezja = u/2 dhe gjerësia = t, kështu harku vazhdon saktësisht këmbët.
    d.arc([s / 2 - r, y_bot - r, s / 2 + r, y_bot + r], 0, 180,
          fill=col, width=int(round(t)))
    d.rectangle([left, y_top, left + t, y_bot], fill=col)
    d.rectangle([right - t, y_top, right, y_bot], fill=col)

    # ── kasketa e punëtorit (kubeja + streha) ──
    hx, hy = s / 2.0, 0.42 * s
    d.pieslice([hx - 0.28 * s, hy - 0.17 * s, hx + 0.28 * s, hy + 0.17 * s],
               180, 360, fill=col)
    brim = 0.07 * s
    d.rounded_rectangle([hx - 0.37 * s, hy - brim / 2, hx + 0.37 * s, hy + brim / 2],
                        radius=brim / 2, fill=col)

    # centrimi: pritet rrethina e dukshme dhe vendoset në kanavacë katrore
    return square(trim(img), size, scale=0.96)


# ───────────────────────────── vektor → PNG ─────────────────────────────
def _cubic(p0, p1, p2, p3, steps=48):
    out = []
    for i in range(1, steps + 1):
        t = i / steps
        mt = 1 - t
        x = (mt ** 3) * p0[0] + 3 * (mt ** 2) * t * p1[0] \
            + 3 * mt * (t ** 2) * p2[0] + (t ** 3) * p3[0]
        y = (mt ** 3) * p0[1] + 3 * (mt ** 2) * t * p1[1] \
            + 3 * mt * (t ** 2) * p2[1] + (t ** 3) * p3[1]
        out.append((x, y))
    return out


def _flatten_svg(path, steps=40):
    """Flatten-on një 'd' të path-it SVG.

    Trajton M/m, L/l, H/h, V/v, C/c, Z/z — përfshirë komandat e përsëritura
    pa shkronjë (implicit, siç lejon standardi SVG).
    """
    tokens = re.findall(r"[MmLlHhVvCcZz]|-?\d*\.?\d+(?:e-?\d+)?", path)
    polys, cur = [], []
    pos = (0.0, 0.0)
    start = (0.0, 0.0)
    cmd = None
    i = 0

    def num():
        nonlocal i
        v = float(tokens[i])
        i += 1
        return v

    def rel(px, py):
        return (px + pos[0], py + pos[1]) if cmd.islower() else (px, py)

    while i < len(tokens):
        if tokens[i] in "MmLlHhVvCcZz":
            cmd = tokens[i]
            i += 1
            if cmd in "Zz":
                if cur:
                    cur.append(start)
                    polys.append(cur)
                    cur = []
                pos = start          # pas Z pika kthehet në fillim të nën-shtegut
                continue
        elif cmd is None:
            i += 1
            continue

        if cmd in "Mm":
            p = rel(num(), num())
            if cur:
                polys.append(cur)
            pos = start = p
            cur = [pos]
            cmd = "l" if cmd == "m" else "L"  # përsëritjet pas M janë L
        elif cmd in "Ll":
            pos = rel(num(), num())
            cur.append(pos)
        elif cmd in "Hh":
            x = num()
            pos = (x + pos[0], pos[1]) if cmd == "h" else (x, pos[1])
            cur.append(pos)
        elif cmd in "Vv":
            y = num()
            pos = (pos[0], y + pos[1]) if cmd == "v" else (pos[0], y)
            cur.append(pos)
        elif cmd in "Cc":
            c1 = rel(num(), num())
            c2 = rel(num(), num())
            end = rel(num(), num())
            cur.extend(_cubic(pos, c1, c2, end, steps))
            pos = end

    if cur:
        polys.append(cur)
    return polys


def _fit(polys, size, pad_ratio=0.02):
    """Shkallëzon poligonet në një kanavacë katrore size×size."""
    xs = [p[0] for poly in polys for p in poly]
    ys = [p[1] for poly in polys for p in poly]
    minx, maxx, miny, maxy = min(xs), max(xs), min(ys), max(ys)
    w, h = maxx - minx, maxy - miny
    pad = size * pad_ratio
    k = min((size - 2 * pad) / w, (size - 2 * pad) / h)
    ox = (size - w * k) / 2 - minx * k
    oy = (size - h * k) / 2 - miny * k
    return [[(x * k + ox, y * k + oy) for x, y in poly] for poly in polys]


# Logo zyrtare Apple (path e njohur, viewBox 0 0 384 512)
APPLE_PATH = (
    "M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6"
    "-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5"
    "c0 26.2 4.8 53.3 14.4 81.2 12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9"
    "31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9z"
    "m-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9"
    "-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"
)


def apple_logo(size, color=APPLE_WHITE):
    """Logo Apple si PNG RGBA size×size (supersampling për tehe të lëmuara)."""
    big = size * SS
    img = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    for poly in _fit(_flatten_svg(APPLE_PATH), big, 0.03):
        d.polygon(poly, fill=color + (255,))
    return img.resize((size, size), Image.LANCZOS)


def google_logo(size):
    """Logo 'G' e Google në 4 ngjyrat zyrtare, si PNG RGBA size×size.

    Ndërtohet si bashkim i: disku me pyka (pieslice) + shufra horizontale,
    minus vrima e brendshme — por shufra NUK hapet nga vrima.
    Këndet PIL: 0° = ora 3, rriten në drejtim të orës (E=0, S=90, W=180, N=270).
    """
    big = size * SS
    cx = cy = big / 2.0
    radius = big * 0.46
    stroke = big * 0.19
    inner = radius - stroke
    box = [cx - radius, cy - radius, cx + radius, cy + radius]
    bar_top = cy - stroke * 0.5
    bar_box = [cx, bar_top, cx + radius, bar_top + stroke]

    # ── maska: (disk | shufra) minus (vrima & ~shufra) ──
    m_disk = Image.new("L", (big, big), 0)
    ImageDraw.Draw(m_disk).ellipse(
        [cx - radius, cy - radius, cx + radius, cy + radius], fill=255)
    m_hole = Image.new("L", (big, big), 0)
    ImageDraw.Draw(m_hole).ellipse(
        [cx - inner, cy - inner, cx + inner, cy + inner], fill=255)
    m_bar = Image.new("L", (big, big), 0)
    ImageDraw.Draw(m_bar).rectangle(bar_box, fill=255)

    disk = np.array(m_disk) > 0
    hole = np.array(m_hole) > 0
    bar = np.array(m_bar) > 0
    keep = (disk | bar) & ~(hole & ~bar)

    # ── ngjyrat: unaza e plotë 360° + shufra ──
    color = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    d = ImageDraw.Draw(color)
    for start, end, col in (
        (225, 337, G_RED),      # lart
        (337, 360, G_BLUE),     # lart-djathtas
        (0, 20, G_BLUE),        # djathtas-poshtë (vazhdim)
        (20, 110, G_GREEN),     # poshtë
        (110, 225, G_YELLOW),   # majtas
    ):
        d.pieslice(box, start, end, fill=col + (255,))
    d.rectangle(bar_box, fill=G_BLUE + (255,))

    out = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    out.paste(color, (0, 0),
              Image.fromarray((keep * 255).astype(np.uint8), "L"))
    return out.resize((size, size), Image.LANCZOS)
