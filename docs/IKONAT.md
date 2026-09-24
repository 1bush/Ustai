# USTAI-IM — Ikonat & Logot (guida)

Të gjitha ikonat dhe logot gjenerohen nga **një burim i vetëm**:

```
assets/logo-master.png   ←  logoja origjinale rrethore (sfond i bardhë, 1254x1254)
        │
        │  python scripts/generate-icons.py
        ▼
assets/  +  android/app/src/main/res/  +  src/assets/
```

**Mos i modifiko manualisht asetet e gjeneruara** — ndryshimet humbin në
rigjenerim. Ndrysho `logo-master.png` (ose skriptin) dhe ekzekuto përsëri.

```powershell
cd 'C:\Users\roven\Desktop\ustai-app claude'
python scripts\generate-icons.py
```

## Problemet që u rregulluan

### 1. Ikona e aplikacionit dukej si katror i bardhë

| Problemi | Shkaku | Zgjidhja |
|---|---|---|
| Katror i bardhë në launcher | `icon.png` ishte logoja rrethore mbi **sfond të bardhë**, pa transparent | `circle_transparent()` heq gjithçka jashtë rrethit; logoja vendoset mbi sfond `#0A0A0A` |
| Rreth i zi brenda ikonës | Adaptive icon e paraqiste të gjithë rrethin, jo vetëm logon | `safe zone` — logoja zvogëlohet në 62% dhe mbahet brenda rrethit 66% që Android nuk e pret |

### 2. Ikona e njoftimeve dukej si njollë e bardhë

Android-i **e ngjyros vetë** ikonën e njoftimit (tint) dhe pret vetëm një
**siluetë monokrome me transparent**. Logoja e detajuar me 4 ngjyra bëhej
një katror i bardhë i palexueshëm.

Zgjidhja: `ustai_glyph()` vizaton një glif të thjeshtë **"U + kasketë"** që
lexohet qartë edhe në 24dp, në të bardhë mbi transparent.

### 3. Splash screen i shtrirë (stretched)

`android:windowBackground` e shtrin bitmap-in në ekran të plotë. U shtua
`res/drawable/splashscreen.xml` (layer-list) që e vendos logon si
`android:gravity="center"`, dhe `styles.xml` referon `@drawable/splashscreen`.

### 4. `assets_logo.png` ishte 1.4 MB / 1254px

Metro e kopjonte `assets/logo.png` ashtu si ishte. Tani `assets/logo.png`
është 512px transparent → APK më e vogël, logo më e pastër në UI.

### 5. Butonat "Hyr me Google" / "Hyr me Apple" ishin bosh

`src/assets/google.png` dhe `apple.png` ishin PNG **1x1 px** (70 bytes) —
praktikisht të padukshme. Tani gjenerohen vërtet (`google_logo()`,
`apple_logo()`) në 1x/2x/3x (20/40/60 px) me densitetet `@2x`, `@3x`
që React Native i zgjodh vetë.

### 6. Themed icons (Android 13+)

U shtua `assets/monochrome-icon.png` + `android.adaptiveIcon.monochromeImage`
në `app.json`, kështu ikona përputhet me ngjyrat e sistemit.
