# USTAI-IM — Build & Test OFFLINE (pa server / pa Metro)

Ky dokument shpjegon si të ndërtohet dhe testohet aplikacioni **si aplikacion i vërtetë**
në Android, pa React Native dev server (Metro) dhe pa PocketBase.

## Problemi (nga screenshot-et)

APK-ja e instaluar ishte **variant `debug` me dev-support aktiv**, prandaj në nisje:

- `Could not connect to development server`
  `URL: http://localhost:8081/.expo/virtual-metro-entry.bundle?...&dev=true`
- ose `Unable to load script ... bundle 'index.android.bundle' is packaged correctly for release`
  (`jniLoadScriptFromAssets` → `CatalystInstanceImpl.java`)

Shkaku: React Native **nuk paketon JS bundle-in për variantin `debug`** kur ai është në listën
`debuggableVariants` (default `["debug", "debugOptimized"]`). Kështu app-i pret gjithmonë
Metro-n. Nuk ishte gabim në kodin JavaScript — PocketBase është mock lokal dhe AI është lokale.

## Çfarë u ndryshua

| Skedari | Ndryshimi |
|---|---|
| `android/app/build.gradle` | `debuggableVariants = []` → JS bundle-i paketohet edhe për `debug` |
| `android/app/src/main/java/com/ustai/app/MainApplication.kt` | `useDevSupport = false` → nuk lidhet me Metro-n |
| `src/lib/pushNotifications.ts` | Token-i i Expo push në `try/catch` → pa internet nuk bllokon app-in |
| `App.tsx` | `regjistroPerNjoftime().catch(() => {})` → pa "unhandled rejection" |
| `package.json` | Script i ri `build:apk:debug` |

Rezultati: app-i lexon JS nga `android/app/src/main/assets/index.android.bundle`
(i krijuar nga Gradle gjatë build-it) dhe **punon pa server**.

## Ndërtimi i APK-së offline

### Android Studio

1. Hap projektin → hap dosjen `android/` (ose rrënjën, sipas mënyrës që përdor).
2. Zgjidh variantin **`debug`** (tani paketohet offline) ose **`release`**.
3. **Build → Build Bundle(s) / APK(s) → Build APK(s)**.

APK-ja shfaqet në:
- debug: `android/app/build/outputs/apk/debug/app-debug.apk`
- release: `android/app/build/outputs/apk/release/app-release.apk`

### Nga terminali (PowerShell)

```powershell
cd 'C:\Users\roven\Desktop\ustai-app claude'
npm run build:apk:debug      # APK debug, offline, pa Metro
npm run build:android        # APK release (clean + bundle + assembleRelease)
```

### Instalimi në pajisje

```powershell
adb install -r "C:\Users\roven\Desktop\ustai-app claude\android\app\build\outputs\apk\debug\app-debug.apk"
```

## Rikthimi i Metro-s (për zhvillim normal)

1. `android/app/build.gradle` → `debuggableVariants = ["debug"]`
2. `MainApplication.kt` → `useDevSupport = true`
3. `npx expo start` dhe hap app-in.

> Shënim: `android/app/build.gradle` dhe `MainApplication.kt` janë skedarë të gjeneruar nga
> `expo prebuild`. Nëse ekzekuton `npx expo prebuild --clean`, këto dy ndryshime humbin dhe
> duhen ri-aplikuar.

## Çfarë mbetet ende "online" (por nuk bllokon app-in)

| Funksioni | Shërbimi | Sjellja pa internet |
|---|---|---|
| Harta (tiles) | `tiles.openfreemap.org` | Harta del bosh; ekrani hapet normalisht |
| Harta (WebView embed) | `cloud.wpgmaps.com` | WebView bosh |
| Kërkim adrese | `nominatim.openstreetmap.org` | Kthen `null`/`[]` (trajtuar me `try/catch`) |
| Njoftime push | Expo/FCM token | Kthen `false`, log paralajmërues |
| PocketBase | — | **Mock lokal**, pa thirrje rrjeti (`src/lib/pocketbase.ts`) |
| AI (diagnozë/skanim/plan/preventiv/matje) | — | **Lokale/offline** (`src/lib/localAI.ts`) |

## Verifikim i shpejtë

```powershell
# 1) Bundle-i është brenda APK-së
Test-Path 'android\app\src\main\assets\index.android.bundle'

# 2) APK-ja u krijua
Get-ChildItem 'android\app\build\outputs\apk' -Recurse -Filter *.apk |
  Select-Object FullName, Length, LastWriteTime

# 3) Pa referenca dev-serveri në kod
Get-ChildItem src -Recurse -Include *.ts,*.tsx |
  Select-String 'localhost:8081|10\.0\.2\.2:8081'
```