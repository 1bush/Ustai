# Ustai-Im — Aplikacioni për Ustallarë dhe Klientë

Aplikacion mobil React Native (Expo) që lidh ustallarët me klientët në tregun shqiptar.
Përfshin AI lokale (offline), pagesa me Stripe dhe një panel admin të veçantë.

> **Gjendja aktuale e projektit, hapat e hapur dhe gotcha-t e build-it: shiko
> [`PROGRESS.md`](./PROGRESS.md). Lexoje para se të fillosh punën.**

## 📋 Përmbledhje

Platformë dy-façe që lejon:
- **Klientët** të postojnë punë dhe të gjejnë ustallarë të kualifikuar
- **Ustallarët** të shohin punë të disponueshme dhe të bëjnë oferta
- **Admin-panelin** për menaxhimin e përdoruesve, konflikteve dhe verifikimeve

## 🛠️ Tech Stack

### Mobile App
| Komponenti | Vlera |
|---|---|
| React Native | **0.86.2** me Expo **57** |
| React | 19.2.3 |
| TypeScript | strict mode |
| Navigation | React Navigation (Native Stack) |
| Backend | `src/lib/pocketbase.ts` — **hibrid**: mock lokal (AsyncStorage) ose PocketBase real |
| Payments | Stripe React Native |
| Harta | `react-native-maps` + **Nominatim (OpenStreetMap)** për geocoding — jo Mapbox |
| Notifications | Expo Notifications |
| AI | **Ollama lokal** (`src/lib/ollama.ts` → `thirrAI()`), me fallback automatik demo offline |
| Alias rrugësh | `@/*` → `src/*` (`babel.config.js` + `tsconfig.json`) |

### Admin Dashboard
- HTML/JavaScript statik me PocketBase SDK (CDN)
- Kërkon një **PocketBase real** — shiko [`PROGRESS.md`](./PROGRESS.md) (është i shkëputur nga app-i)

## 📁 Struktura e Projektit

```
ustai-app claude/
├── index.js                  # Pika e hyrjes (registerRootComponent)
├── App.tsx                   # Navigimi + tema globale (rregjistron 41 ekrane)
├── app.json                  # Konfigurimi Expo (ikona, plugin-e, Android)
├── babel.config.js           # Alias @ → ./src
├── metro.config.js           # Default i Expo
├── tsconfig.json             # strict + paths @/*
├── eas.json                  # Profilet EAS
├── build_android.bat         # Build offline (bundle + assembleRelease)
├── AGENTS.md                 # Rregullat e repo-s për agjentët
├── PROGRESS.md               # Gjendja aktuale / handoff
├── OFFLINE-BUILD.md          # Si ndërtohet APK pa Metro
├── src/
│   ├── screens/              # 41 ekrane
│   ├── components/           # 10 komponentë të përbashkët
│   ├── lib/                  # Shërbimet thelbësore
│   ├── theme/colors.ts       # NGJYRAT (Dark)
│   └── assets/               # ikonat google/apple @1x/2x/3x (të gjeneruara)
├── assets/                   # ikonat e app-it (të gjeneruara nga logo-master.png)
├── scripts/                  # generate-icons.py + icons_lib.py
├── docs/IKONAT.md            # Si gjenerohen ikonat
├── admin-dashboard/          # Panel admin (HTML statik)
├── android/                  # Prebuild native (i gjeneruar)
└── node_modules/
```

## 🚀 Instalimi

### Parakushtet
- Node.js 18+
- Android Studio (për build Android)
- **Nuk nevojitet** server PocketBase — app-i punon me mock lokal nga kutia

### Hapat

```bash
git clone https://github.com/1bush/Ustai.git
cd "ustai-app claude"
npm install
npm start
```

### Variablat e mjedisit

Kopjo `.env.example` në `.env`. Të gjitha janë **opsionale** për aplikacionin offline:

| Variabla | Efekti |
|---|---|
| `EXPO_PUBLIC_POCKETBASE_URL` | Bosh ⇒ **mock lokal**. Plotësuar (p.sh. `http://127.0.0.1:8090`) ⇒ PocketBase real |
| `EXPO_PUBLIC_OLLAMA_URL` | Serveri AI lokal (default `http://localhost:11434`; emulator: `http://10.0.2.2:11434`) |
| `EXPO_PUBLIC_OLLAMA_MODEL` | Modeli Ollama (default `llama3.2-vision:11b`) |
| `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Çelësi publik i Stripe |
| `EXPO_PUBLIC_WP_GO_MAP_TOKEN` | Token për embed-in WP Go Map |

> `.env` **nuk gjurmohet në git** dhe përmban çelësa — mos e commit-o.

## 📱 Ekrane

Rregjistrohen të gjitha në `App.tsx`. ⚠️ = **placeholder / në ndërtim** (shih `PROGRESS.md`).

**Auth** — `LoginScreen` · `RegisterScreen` · `VerifyOTPScreen` · `SelectCategoryScreen`

**Klient** — `JobPostScreen` · `JobBidsScreen` · `BrowseUstajteScreen` · `ClientProfileScreen`
· ⚠️`ClientMatchPaymentScreen` · ⚠️`RefundRequestScreen` · ⚠️`ReportUserScreen`

**Ustai** — `AvailableJobsScreen` · `MyBidsScreen` · `UstaiProfileScreen`
· `UstaiPublicProfileScreen` · ⚠️`UstaiAnalyticsScreen` · ⚠️`CommissionPaymentScreen`
· ⚠️`VerificationUploadScreen` · ⚠️`VideoVerificationScreen` · ⚠️`InsuranceScreen`
· ⚠️`InstantBookScreen` · ⚠️`InstantBookIncomingScreen` · ⚠️`AddonPaymentScreen`

**Puna** — `RatingScreen` · `ChatScreen` · `ContactMapScreen` · ⚠️`JobTimelineScreen`
· ⚠️`BeforeAfterPhotosScreen` · ⚠️`ConformitySheetScreen` · ⚠️`MaintenancePlansScreen`
· ⚠️`MyMaintenanceSubscriptionsScreen` · ⚠️`MaterialSuppliersScreen` · ⚠️`FavoriteUstaiScreen`
· ⚠️`SponsorListingScreen`

**AI** — `AIPreventivScreen` · `AIMatjaScreen` · `AIRoomPlannerScreen`
· ⚠️`AIScanScreen` · ⚠️`AIBathroomPlannerScreen`

**Të tjera** — `ReferralScreen` · `ContactMapScreen` · `AdminTestScreen`

## 🧠 Shërbimet AI (Ollama lokale)

| Moduli | Roli |
|---|---|
| `lib/ollama.ts` | `thirrAI()` — thirrje ndaj Ollama-s lokale; bie automatikisht në demo offline kur serveri nuk arrihet |
| `lib/localAI.ts` | `thirrAILokale()` — të dhëna demo deterministe, pa rrjet (fallback-u) |
| `lib/aiVisionService.ts` | Validuesit e përgjigjeve AI + analizë foto, planifikim hapësirash, skanim |
| `lib/aiMatching.ts` | Përputhja ustai ↔ klient dhe rekomandime |
| `lib/aiDiagnosis.ts` | Diagnozë problemesh nga foto + kategorizim automatik |
| `lib/aiScheduling.ts` | Planifikimi i termineve |

## 💾 Struktura e të Dhënave

App-i përdor `pb.collection('...')` me **mock lokal** (AsyncStorage) si default;
me `EXPO_PUBLIC_POCKETBASE_URL` kalon automatikisht në PocketBase real.

| Koleksioni | Përdoret nga app-i |
|---|---|
| `users`, `profiles`, `categories` | ✅ |
| `jobs`, `bids`, `job_timeline`, `work_sessions`, `work_updates` | ✅ |
| `messages`, `reviews`, `referrals`, `scheduling_slots` | ✅ |
| `ustai_locations`, `ustai_of_month`, `ustai_historiku_verifikuar` | ✅ (UI pjesërisht) |
| `device_tokens`, `notification_*`, `platform_ads` | ✅ |
| `verification_documents`, `reports` | ❌ **vetëm admin-dashboard** (app-i nuk i shkruan) |

## 🔧 Komandat e Build

```bash
# Zhvillim
npm start                    # Expo dev server
npm run android              # Nis në Android emulator/device
npm run ios                  # Nis në iOS simulator

# Ikona (nga assets/logo-master.png → assets/, src/assets/, android res/)
npm run icons

# Build Android
npm run bundle:android       # Vetëm JS bundle → android/app/src/main/assets/
npm run build:apk:debug      # APK debug (offline, pa Metro)
npm run build:android        # APK release (clean + bundle + assembleRelease)
npm run build:apk            # Alias i build:android

# Pastrim
npm run clean:android        # Ndal gradle + clean
npm run clean:full           # Pastrim i plotë (build + cache)
```

Detajet e build-it offline: [`OFFLINE-BUILD.md`](./OFFLINE-BUILD.md).

## 🎛️ Admin Dashboard

`admin-dashboard/index.html` — faqe statike që lidhet me PocketBase.

- URL-i i serverit konfigurohet në `CONFIG.pocketbaseUrl` brenda fajllit (default `http://127.0.0.1:8090`)
- Autentikimi bëhet kundrejt koleksionit `_superusers` me kredencialet e tua
  (**nuk ka kredenciale të hardkoduar në kod**)
- Të dhënat që mirëmban: `profiles`, `categories`, `verification_documents`, `reports`

> ⚠️ Paneli lexon koleksione që aplikacioni mobil nuk i shkruan aktualisht.
> Shiko hapin P2 në [`PROGRESS.md`](./PROGRESS.md).

## 🎨 Tema

Dark Mode, ngjyrat në `src/theme/colors.ts`:

```typescript
{
  primare: '#E11D2E',        // E kuqja
  sfondi: '#0A0A0A',         // E zezë
  sfondiKarte: '#141414',    // Gri e errët
  teksti: '#FFFFFF',
  tekstiZbehur: '#9CA3AF',
  tekstiShumeZbehur: '#6B7280',
  kufiri: '#2A2A2A',
  paralajmerim: '#FFB020',
  gabim: '#E5484D',
  sukses: '#34C759'
}
```

## 🚀 Deployimi Android

```bash
npm run build:android
```

APK-ja del në `android/app/build/outputs/apk/release/app-release.apk`.

> ⚠️ **Mos ekzekuto `npx expo prebuild --clean`** — humbin `debuggableVariants = []`
> dhe `useDevSupport = false`, dhe APK-ja kërkon përsëri Metro-n. Detajet:
> [`OFFLINE-BUILD.md`](./OFFLINE-BUILD.md).

## 🔐 Siguria

- Sesioni ruhet lokalisht në `AsyncStorage`
- Stripe për pagesa
- `.env` nuk gjurmohet në git (përmban çelësa)
- Autentikimi real kërkon `EXPO_PUBLIC_POCKETBASE_URL`; mock-u lokal hedh gabim

## 📝 Konventat e Kodimit

- **TypeScript strict** — tipet eksplicite
- **Alias**: `@/*` për `src/*`
- **Emërtimi**: entitetet e biznesit në shqip (`ustai`, `klient`, `punë`), komponentët PascalCase
- **Tema**: gjithmonë `NGJYRAT`, pa ngjyra të hardkoduara
- **Assets**: nuk modifikohen manualisht — rigjenerohen nga `scripts/`

## 🐛 Debugim

| Problemi | Zgjidhja |
|---|---|
| "Could not connect to development server" | Kontrollo `debuggableVariants = []` + `useDevSupport = false` (shih `OFFLINE-BUILD.md`) |
| Ekranet shfaqin të dhëna boshe | E pritshme — mock-u lokal. Plotëso `EXPO_PUBLIC_POCKETBASE_URL` për të dhëna reale |
| AI nuk kthen përgjigje reale | Kontrollo nëse Ollama punon: `ollama list` dhe `http://localhost:11434/api/tags`. Pa të, app-i kthen të dhëna demo |
| Modeli AI mungon në Ollama | `ollama pull llama3.2-vision:11b` (ose vendos `EXPO_PUBLIC_OLLAMA_MODEL`) |
| Ikona e gabuar në APK | `npm run icons`, pastaj rindërto |

## 📄 Licenca

Ky projekt është pronë private. Të gjitha të drejtat e rezervuara.



