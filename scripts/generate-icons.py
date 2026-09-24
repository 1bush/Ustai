#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""USTAI-IM — gjeneron TË GJITHA ikonat dhe logot nga një burim i vetëm.

Burimi:  assets/logo-master.png   (logo rrethore me sfond të bardhë)

Shkruan:
  assets/icon.png                 ikona e aplikacionit (legacy, sfond i errët)
  assets/adaptive-icon.png        adaptive icon foreground (transparent + safe zone)
  assets/notification-icon.png    siluetë e bardhë për njoftimet
  assets/splash.png               logo e splash screen (transparent)
  assets/favicon.png              favicon web
  assets/logo.png                 logo e brendit e përdorur në UI (transparent)
  android/app/src/main/res/...    mipmap-*/ic_launcher*.webp, drawable-*/...
  src/assets/apple*.png           ikonat e butonit "Hyr me Apple" (1x/2x/3x)
  src/assets/google*.png          ikonat e butonit "Hyr me Google" (1x/2x/3x)

Përdorimi:  python scripts/generate-icons.py
"""

import os
import sys

from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import icons_lib as L  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(ROOT, "assets")
SRC_ASSETS = os.path.join(ROOT, "src", "assets")
RES = os.path.join(ROOT, "android", "app", "src", "main", "res")

# densiteti -> madhësia në px
LAUNCHER = {"mdpi": 48, "hdpi": 72, "xhdpi": 96, "xxhdpi": 144, "xxxhdpi": 192}
FOREGROUND = {"mdpi": 108, "hdpi": 162, "xhdpi": 216, "xxhdpi": 324, "xxxhdpi": 432}
NOTIF = {"mdpi": 24, "hdpi": 36, "xhdpi": 48, "xxhdpi": 72, "xxxhdpi": 96}
SPLASH = {"mdpi": 288, "hdpi": 432, "xhdpi": 576, "xxhdpi": 864, "xxxhdpi": 1152}

ICON_SIZE = 1024           # PNG burimor për ikonat
BADGE_SCALE = 0.84         # madhësia e logos brenda ikonës legacy
SAFE_SCALE = 0.62          # brenda 'zonës së sigurt' 66% të adaptive icon
SPLASH_SCALE = 0.50        # madhësia e logos në splash screen
LOGIN_ICON = (20, 40, 60)  # 1x / 2x / 3x për butonat social


def log(msg):
    print(f"  {msg}")


def save_webp(im, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    im.save(path, "WEBP", lossless=True, method=4)


def save_png(im, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    im.save(path, "PNG", optimize=True)


def main():
    master_path = os.path.join(ASSETS, "logo-master.png")
    if not os.path.exists(master_path):
        raise SystemExit(
            f"Mungon burimi: {master_path}\n"
            "Kopjo logon origjinale aty (me sfond te bardhe) dhe provo perseri."
        )

    print("-> Leximi i burimit:", os.path.basename(master_path))
    master = Image.open(master_path)
    badge = L.trim(L.circle_transparent(master, soft=2.0, tol=246))
    log(f"logo e nxjerre: {badge.size[0]}x{badge.size[1]} px (sfond transparent)")

    # ------------------- asetet burimor te Expo (assets/) -------------------
    print("-> Asetet e aplikacionit (assets/)")

    icon = L.square(badge, ICON_SIZE, bg=L.SFONDI, scale=BADGE_SCALE)
    save_png(icon, os.path.join(ASSETS, "icon.png"))
    log(f"assets/icon.png                {ICON_SIZE}px  sfond #0A0A0A")

    adaptive = L.square(badge, ICON_SIZE, bg=(0, 0, 0, 0), scale=SAFE_SCALE)
    save_png(adaptive, os.path.join(ASSETS, "adaptive-icon.png"))
    log(f"assets/adaptive-icon.png       {ICON_SIZE}px  transparent, safe zone")

    notif = L.ustai_glyph(96)
    save_png(notif, os.path.join(ASSETS, "notification-icon.png"))
    log("assets/notification-icon.png     96px  glif i bardhe 'U + kaskete'")

    # Android 13+ 'themed icons' — vetem forma (alfa), pa ngjyra
    mono = L.silhouette(badge, ICON_SIZE, cut=140, full=210)
    mono = L.square(mono, ICON_SIZE, scale=0.62)
    save_png(mono, os.path.join(ASSETS, "monochrome-icon.png"))
    log(f"assets/monochrome-icon.png    {ICON_SIZE}px  siluete, themed icons")

    splash = L.square(badge, 1152, bg=(0, 0, 0, 0), scale=SPLASH_SCALE)
    save_png(splash, os.path.join(ASSETS, "splash.png"))
    log("assets/splash.png              1152px  transparent")

    favicon = L.square(badge, 48, bg=(0, 0, 0, 0), scale=0.98)
    save_png(favicon, os.path.join(ASSETS, "favicon.png"))
    log("assets/favicon.png               48px")

    logo_ui = L.square(badge, 512, bg=(0, 0, 0, 0), scale=0.98)
    save_png(logo_ui, os.path.join(ASSETS, "logo.png"))
    log("assets/logo.png                 512px  transparent (UI)")

    # ------------------- resurset native Android (res/) -------------------
    print("-> Resurset native (android/app/src/main/res)")

    for d, size in LAUNCHER.items():
        save_webp(L.square(icon, size),
                  os.path.join(RES, f"mipmap-{d}", "ic_launcher.webp"))
        save_webp(L.square(icon, size),
                  os.path.join(RES, f"mipmap-{d}", "ic_launcher_round.webp"))
    log(f"mipmap-*/ic_launcher(.round).webp   {sorted(LAUNCHER.values())}")

    for d, size in FOREGROUND.items():
        save_webp(L.square(adaptive, size),
                  os.path.join(RES, f"mipmap-{d}", "ic_launcher_foreground.webp"))
    log(f"mipmap-*/ic_launcher_foreground.webp   {sorted(FOREGROUND.values())}")

    for d, size in NOTIF.items():
        save_webp(L.ustai_glyph(size),
                  os.path.join(RES, f"drawable-{d}", "notification_icon.png"))
    log(f"drawable-*/notification_icon.png   {sorted(NOTIF.values())}")

    for d, size in SPLASH.items():
        save_png(L.square(badge, size, scale=SPLASH_SCALE),
                 os.path.join(RES, f"drawable-{d}", "splashscreen_logo.png"))
    log(f"drawable-*/splashscreen_logo.png   {sorted(SPLASH.values())}")

    # fallback pa densitet (me pare 1254px / 1.4 MB)
    save_png(notif, os.path.join(RES, "drawable", "notification_icon.png"))
    log("drawable/notification_icon.png (fallback) 96px")

    # asset-i i bundluar nga Metro per require('./assets/logo.png')
    save_png(logo_ui, os.path.join(RES, "drawable-mdpi", "assets_logo.png"))
    log("drawable-mdpi/assets_logo.png     512px")

    # --------------- ikonat e butonave social (src/assets/) ---------------
    print("-> Ikonat e butonave social (src/assets/)")
    for i, size in enumerate(LOGIN_ICON):
        suffix = "" if i == 0 else f"@{i + 1}x"
        save_png(L.apple_logo(size), os.path.join(SRC_ASSETS, f"apple{suffix}.png"))
        save_png(L.google_logo(size), os.path.join(SRC_ASSETS, f"google{suffix}.png"))
    log(f"apple/google.png + @2x + @3x   {list(LOGIN_ICON)}px")

    print("\nOK - Te gjitha ikonat u rigjeneruan me sukses.")
    print("   Hapi tjeter:  npm run build:apk:debug")


if __name__ == "__main__":
    main()
