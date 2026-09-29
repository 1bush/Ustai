#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""USTAI-IM — rikthen tonet e verdhë të logos në të kuqe (E11D2E).

Prek vetëm PIXELËT me ngjyrë të verdhë/portokalli (hue 10°–85°), duke
ruajtur hijet, gradientet dhe skajet e butë (anti-aliasing) — meqë vetëm
ndryshon "temperaturën" e ngjyrës, jo strukturën.

Shkruan mbi vend:  assets/logo-master.png

Përdorimi:  python scripts/recolor-logo-red.py
Backup:     assets/logo-master.yellow-backup.png (krijohet një herë)
"""

import colorsys
import os
import shutil
import sys

import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MASTER = os.path.join(ROOT, "assets", "logo-master.png")
BACKUP = os.path.join(ROOT, "assets", "logo-master.yellow-backup.png")

# --- ngjyra e re e brandit -------------------------------------------------
NEW_HEX = "#E11D2E"
N_R, N_G, N_B = (int(NEW_HEX[i:i + 2], 16) / 255.0 for i in (1, 3, 5))
NEW_H, NEW_S, NEW_V = colorsys.rgb_to_hsv(N_R, N_G, N_B)

# --- intervali i toneve që preken -----------------------------------------
HUE_LO, HUE_HI = 10.0 / 360.0, 85.0 / 360.0
SAT_MIN = 0.02


def main():
    if not os.path.exists(MASTER):
        raise SystemExit(f"Mungon {MASTER}")
    if not os.path.exists(BACKUP):
        shutil.copy2(MASTER, BACKUP)
        print("-> Backup i krijuar:", os.path.basename(BACKUP))

    im = Image.open(MASTER).convert("RGBA")
    arr = np.array(im).astype(np.float32) / 255.0
    rgb, alpha = arr[..., :3], arr[..., 3]

    # RGB -> HSV me vektorizim (ndryshe nga colorsys që nuk mbështet NumPy)
    mx = rgb.max(axis=-1)
    mn = rgb.min(axis=-1)
    d = mx - mn
    hue = np.zeros_like(mx)
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    nz = d > 1e-6
    idx = nz & (mx == r)
    hue[idx] = ((g[idx] - b[idx]) / d[idx]) % 6
    idx = nz & (mx == g)
    hue[idx] = ((b[idx] - r[idx]) / d[idx]) + 2
    idx = nz & (mx == b)
    hue[idx] = ((r[idx] - g[idx]) / d[idx]) + 4
    hue /= 6.0
    sat = np.where(mx > 1e-6, d / np.where(mx > 1e-6, mx, 1.0), 0.0)

    mask = nz & (sat >= SAT_MIN) & (hue >= HUE_LO) & (hue <= HUE_HI) & (alpha > 0)

    n = int(mask.sum())
    if n == 0:
        print("-> Asnjë pixel i verdhë nuk u gjet; logoja është tashmë e kuqe.")
        return

    # ---- Rotacion i hue-s: 45° (verdhja) -> 0° (e kuqja) ----------------
    # Hue relative (p.sh. 55° portokalli ose 35° ochre) mbahet, ndaj
    # gradientet brenda logos mbeten të njëjta — ndryshon vetëm "familja".
    REF_HUE = 45.0 / 360.0
    rot_hue = (hue[mask] - REF_HUE) % 1.0

    # Shkallëzojmë V-në dhe S-në ndaj vlerat më të ndritura të verdhës të
    # arrijnë saktësisht tonin e ri (i njëjti "ndriçim" perceptiv).
    k_v = NEW_V / max(float(mx[mask].max()), 1e-6)
    new_v = np.clip(mx[mask] * k_v, 0.0, 1.0)
    s_mask = sat[mask]
    k_s = NEW_S / max(float(s_mask.max()), 1e-6)
    new_s = np.clip(s_mask * k_s, 0.0, 1.0)

    # HSV -> RGB (formula standarde)
    i = np.floor(rot_hue * 6.0).astype(int)
    f = rot_hue * 6.0 - i
    p_ = new_v * (1.0 - new_s)
    q_ = new_v * (1.0 - new_s * f)
    t_ = new_v * (1.0 - new_s * (1.0 - f))
    r_out = np.select([i == 0, i == 1, i == 2, i == 3, i == 4, i == 5],
                      [new_v, q_, p_, p_, t_, new_v])
    g_out = np.select([i == 0, i == 1, i == 2, i == 3, i == 4, i == 5],
                      [t_, new_v, new_v, q_, p_, p_])
    b_out = np.select([i == 0, i == 1, i == 2, i == 3, i == 4, i == 5],
                      [p_, p_, t_, new_v, new_v, q_])

    out = rgb.copy()
    out[mask, 0], out[mask, 1], out[mask, 2] = r_out, g_out, b_out

    result = np.concatenate([out, alpha[..., None]], axis=-1)
    Image.fromarray((result * 255.0).round().clip(0, 255).astype(np.uint8), "RGBA").save(MASTER, "PNG", optimize=True)
    print(f"-> {n:,} pikselë të verdhë u rikthyen në {NEW_HEX} ({im.size[0]}x{im.size[1]})".replace(",", "."))
    print("-> Shkruar:", os.path.relpath(MASTER, ROOT))


if __name__ == "__main__":
    sys.exit(main())
