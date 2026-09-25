# USTAI-IM — Gjendja e projektit (handoff)

> Përditësuar: 25/09/2026 · Ky dokument flet vetë: lexojeni para se të filloni punën.
> Qëllimi: që çdo sesion i ri (Cline/agjent) të mos ketë nevojë të rishpjegohet.

## 1. Ku ndodhet projekti

| | Vlera |
|---|---|
| Aktiv | `C:\Users\roven\Desktop\ustai-app claude` (branch `master`) |
| Remote `origin` | `https://github.com/1bush/Ustai.git` |
| Remote `ustai-im` | `https://github.com/1bush/Ustai-im.git` |
| Kopje paralele — **MOS i ngatërro** | `C:\Users\roven\Ustai` (Supabase), `Ustai-im` (Firebase), `ustai-im-repo{1,2,3}`, `Desktop\USTAI-IM` (skelet Gradle) |

## 2. Arkitektura (si lidhet gjithçka)

```
index.js → App.tsx → src/screens/ (41 ekrane) → src/theme/colors.ts
                   → src/lib/* (pocketbase, localAI, offlineQueue, ...)
assets/logo-master.png → python scripts/generate-icons.py
                       → assets/  +  android/**/res/  +  src/assets/
```

- **Stack**: Expo 57 / React Native 0.86.2 / TypeScript strict
- **Alias**: `@/*` → `src/*` (i rregulluar në `babel.config.js` + `tsconfig.json`)
- **Backend**: `src/lib/pocketbase.ts` është **HIBRID** — mock lokal (AsyncStorage)
  kur `EXPO_PUBLIC_POCKETBASE_URL` është bosh; PocketBase real kur plotësohet.
  Në `.env` është bosh ⇒ momentalisht **gjithçka është mock lokal, pa rrjet**.
- **AI**: `src/lib/localAI.ts` — offline i plotë (Ollama u hoq, 0 thirrje rrjeti)
- **Build offline**: `build_android.bat` ose `npm run build:apk` (shih `OFFLINE-BUILD.md`)
- **Ikona**: burim i vetëm + gjenerator (shih `docs/IKONAT.md`)

## 3. Bërë — 25/09/2026

1. **`src/lib/offlineQueue.ts` u gjurmua në git.** Mungonte, ndërsa importohet nga
   `App.tsx:65` dhe `src/lib/pocketbase.ts:4` ⇒ një klon i ri **nuk kompilohej**.
2. **`.gitignore`**: shtuar `build_*.txt`, `bundle_*.txt`, `gen_*.txt`, `expo_cfg.txt`,
   `*.bak` (9 fajlle output shfaqeshin si `??` dhe do commit-oheshin me `git add .`).
3. **15 fajlle log/txt (282 KB) u hoqën nga rrënja** → `C:\Users\roven\Desktop\_arkiv-ustai-logs\`
   (`build_output.txt` dhe `bundle_output.txt` rigjenerohen nga `build_android.bat`).
4. **Commit i punës së papërfunduar**: `App.tsx`, `src/lib/pocketbase.ts` (hibrid mock/real
   + proxy i offline queue), `src/lib/pushNotifications.ts` (try/catch), `.env.example`,
   3 drawable apple të rigjeneruara.
5. **P1 — `README.md` u rishkrua i plotë.** 5 mospërputhje u rregulluan (RN 0.74.5 → **0.86.2**;
   PocketBase server → mock hibrid; Groq → hequr; Google Maps → hequr; Mapbox → **Nominatim**).
   Gjithashtu **kredencialet admin `Bush`/`BUSH1` u hoqën** — ishin të shkruara në README ndërsa
   paneli autentikohet me `_superusers` pa kredenciale të hardkoduar. README e vjetër u arkivua
   në `_arkiv-ustai-logs\README.md.old`.
6. **P1 — `ErrorBoundary` u lidh në `App.tsx`.** Komponenti ekzistonte por **nuk përdorej**;
   tani mbështjell `SafeAreaProvider` ⇒ app-i nuk bie më në ekran të zi. Verifikuar me
   `tsc --noEmit --skipLibCheck` → **0 gabime**.

## 4. Hapa të hapur (të audituar, të verifikuar, jo të bërë)

| Prioritet | Problemi |
|---|---|
| P2 | **7 nga 10 komponentë mbeten orphan** (përdoren vetëm `FairPriceEstimate`, `FreeMap` dhe `ErrorBoundary`): `ChatMessage`, `ContactPreferenceToggle`, `JobStatusTimeline`, `PlatformAdBanner`, `UstaiOfMonthBanner`, `VerifiedHistoryBadge`, `WPGoMap` |
| P2 | `admin-dashboard/` është **fund qorrsokak**: lidhet me PocketBase real dhe lexon/shkruan `reports` + `verification_documents`, koleksione që aplikacioni **nuk i shkruan kurrë** |
| P2 | Koleksione të dhënash **pa konsumator UI**: `platform_ads`, `ustai_of_month`, `ustai_historiku_verifikuar` (komponentët përkatës janë orphan) |
| P2 | `EXPO_PUBLIC_WP_GO_MAP_TOKEN` është në `.env` dhe `OFFLINE-BUILD.md` dokumenton `cloud.wpgmaps.com`, por `WPGoMap.tsx` nuk përdoret kurrë |
| P2 | 6 folder `ustai*` të duplikuar në disk; `Desktop\ustai-app-release.apk` (111 MB, 16/09) është APK-ja e vjetruar për të cilën `OFFLINE-BUILD.md` paralajmëron |
| P3 | **21 nga 41 ekrane janë placeholder** (11 × 162 bajt + 10 ≈ 1.1 KB) dhe **të gjitha janë të regjistruara në navigim** (`App.tsx` rreshtat 181–222) ⇒ rrugë që çojnë në ekran bosh |

Ekranet placeholder (162 bajt): `InsuranceScreen`, `VideoVerificationScreen`,
`ConformitySheetScreen`, `FavoriteUstaiScreen`, `MaintenancePlansScreen`,
`UstaiAnalyticsScreen`, `VerificationUploadScreen`, `MaterialSuppliersScreen`,
`MyMaintenanceSubscriptionsScreen`, `BeforeAfterPhotosScreen`, `AddonPaymentScreen`.

## 5. Rregulla pune (mos i shkel)

- **Mos ekzekuto `npx expo prebuild --clean`**: humbin `debuggableVariants = []`
  (`android/app/build.gradle`) dhe `useDevSupport = false`
  (`MainApplication.kt`) ⇒ APK-ja kërkon përsëri Metro-n.
- `android/app/src/main/assets/index.android.bundle` **gjenerohet**, nuk commit-ohet.
- `.env` **nuk gjurmohet** (përmban çelës realë) — mos e commit-o. `.env.example` është gjurmuar.
- Mos i modifiko manualisht asetet në `assets/`, `src/assets/` ose `android/**/res/`:
  janë të gjeneruara. Ndrysho `logo-master.png` ose `scripts/` dhe rigjenero.
- Testet/punimet e reja jo në rrënjë; rrënja mbetet e pastër nga log-e.
