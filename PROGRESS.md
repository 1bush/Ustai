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
- **AI**: `src/lib/ollama.ts` → `thirrAI()` — **Ollama lokale** (`EXPO_PUBLIC_OLLAMA_URL`).
  Nëse serveri nuk arrihet, bie automatikisht te `src/lib/localAI.ts` (`thirrAILokale()`,
  të dhëna demo deterministe) ⇒ ekranet AI punojnë edhe pa server. **Pa API key cloud.**
  Në këtë kompjuter Ollama **nuk është i instaluar**, ndaj aktualisht kthen demo.
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
7. **AI → Ollama (Groq u fshi fare).** U krijua `src/lib/ollama.ts`: thirrje ndaj
   `POST {EXPO_PUBLIC_OLLAMA_URL}/api/generate` me `format: "json"`, timeout 120 s dhe
   `AbortController`. **Fallback vetëm kur serveri nuk arrihet** (nuk maskohet një përgjigje
   e pavlefshme me të dhëna demo). `aiDiagnosis.ts` dhe `aiVisionService.ts` tani përdorin
   `thirrAI()`. U hoq `ollama.ts.REAL.BAK` (arkivuar). U përditësuan `.env`, `.env.example`,
   `README.md`, `AGENTS.md`, `OFFLINE-BUILD.md`.
8. **Siguri — token i hardkoduar.** `WPGoMap.tsx` kishte `ff864928…` **të shkruar në kod dhe
   të commit-uar në git** (që nga *Initial commit*). Tani token-i vjen vetëm nga `.env` dhe
   komponenti shfaq një mesazh të qartë "nuk është konfiguruar" kur mungon.
9. **P2 — 6 komponentë orphan u lidhën:** `ChatMessage` → `ChatScreen` (u re-temua me
   `NGJYRAT`; kishte paletë teal/bezhë nga repo tjetër) · `VerifiedHistoryBadge` +
   `UstaiOfMonthBanner` → `UstaiPublicProfileScreen` · `PlatformAdBanner` →
   `AvailableJobsScreen` · `ContactPreferenceToggle` → `UstaiProfileScreen` ·
   `JobStatusTimeline` → `JobTimelineScreen` (u implementua nga stub 162-bajt).
   Kështu edhe `platform_ads`, `ustai_of_month` dhe `ustai_historiku_verifikuar` fituan
   konsumator UI.
10. **P2 — laku me `admin-dashboard` u mbyll.** U implementuan `VerificationUploadScreen`
    (shkruan `verification_documents` me `status: 'ne_pritje'`) dhe `ReportUserScreen`
    (shkruan `reports` me `status: 'ne_pritje'`) — pikërisht koleksionet që paneli lexon dhe
    aprovon. U shtuan edhe dy hyrje navigimi: profili i ustait → "Verifiko identitetin",
    profili publik → "Raporto këtë ustai". Verifikuar me `tsc` → **0 gabime**.

## 4. Hapa të hapur (të audituar, të verifikuar, jo të bërë)

| Prioritet | Problemi |
|---|---|
| P2 | **`WPGoMap` mbetet i palidhur** — `ContactMapScreen` përdor `FreeMap`. Vendos: lidhe në një ekran ose fshije. Token-i i vjetër ishte i publikuar në git ⇒ **duhet rotacion** nëse do ta përdorësh |
| P2 | **`verification_documents.dokumenti_url` ruan URI-n lokale** (`file://…`), jo një skedar të ngarkuar. Me PocketBase real duhet `FormData` (multipart), që paneli admin ta hapë me `pb.files.getUrl` |
| P2 | 6 folder `ustai*` të duplikuar në disk; `Desktop\ustai-app-release.apk` (111 MB, 16/09) është APK-ja e vjetruar për të cilën `OFFLINE-BUILD.md` paralajmëron |
| P3 | **18 nga 41 ekrane mbeten placeholder** dhe **të gjitha janë të regjistruara në navigim** (`App.tsx` rreshtat 181–222) ⇒ rrugë që çojnë në ekran bosh |

Ekranet bosh (10 × 162 bajt): `InsuranceScreen`, `VideoVerificationScreen`,
`ConformitySheetScreen`, `FavoriteUstaiScreen`, `MaintenancePlansScreen`,
`UstaiAnalyticsScreen`, `MaterialSuppliersScreen`, `MyMaintenanceSubscriptionsScreen`,
`BeforeAfterPhotosScreen`, `AddonPaymentScreen`.

Ekranet "në zhvillim" (8 ≈ 1.1 KB): `AIScanScreen`, `ClientMatchPaymentScreen`,
`CommissionPaymentScreen`, `SponsorListingScreen`, `RefundRequestScreen`,
`InstantBookScreen`, `InstantBookIncomingScreen`, `AIBathroomPlannerScreen`.

## 5. Rregulla pune (mos i shkel)

- **Mos ekzekuto `npx expo prebuild --clean`**: humbin `debuggableVariants = []`
  (`android/app/build.gradle`) dhe `useDevSupport = false`
  (`MainApplication.kt`) ⇒ APK-ja kërkon përsëri Metro-n.
- `android/app/src/main/assets/index.android.bundle` **gjenerohet**, nuk commit-ohet.
- `.env` **nuk gjurmohet** (përmban çelës realë) — mos e commit-o. `.env.example` është gjurmuar.
- Mos i modifiko manualisht asetet në `assets/`, `src/assets/` ose `android/**/res/`:
  janë të gjeneruara. Ndrysho `logo-master.png` ose `scripts/` dhe rigjenero.
- Testet/punimet e reja jo në rrënjë; rrënja mbetet e pastër nga log-e.
