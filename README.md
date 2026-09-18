# Ustai-Im - Aplikacioni për Ustallarë dhe Klientë

Aplikacion mobil React Native me Expo që lidh ustallarët me klientët në tregun shqiptar. Përfshin funksionalitete të avancuara AI, pagesa me Stripe, dhe një panel admin.

## 📋 Përmbledhje

**Ustai-Im** është një platformë dy-façe që lejon:
- **Klientët** të postojnë punë dhe të gjejnë ustallarë të kualifikuar
- **Ustallarët** të shohin punë të disponueshme dhe të bëjnë oferta
- **Admin-panelin** për menaxhimin e përdoruesve, konflikteve dhe verifikimeve

## 🛠️ Tech Stack

### Mobile App
- **React Native** 0.74.5 me Expo 57
- **TypeScript** me strict mode
- **Navigation**: React Navigation (Native Stack)
- **Backend**: PocketBase — HEQUR (mock lokal në `src/lib/pocketbase.ts`, pa rrjet)
- **Payments**: Stripe React Native
- **Maps**: React Native Maps + Mapbox Geocoding
- **Notifications**: Expo Notifications
- **AI Services**: AI lokale offline (`src/lib/localAI.ts`) — pa server, pa API key, pa internet

### Admin Dashboard
- HTML/JavaScript statik me PocketBase SDK
- Panel admin për menaxhim

## 📁 Struktura e Projektit
ustai-app claude/ ├── src/ │ ├── screens/ # Të gjitha ekrane e aplikacionit │ ├── components/ # Komponente të përdorura │ ├── lib/ # Shërbime thelbësore │ │ ├── pocketbase.ts # Mock lokal (serveri u hoq) │ │ ├── localAI.ts # AI lokale offline (Ollama u hoq) │ │ ├── aiVisionService.ts # AI për analiza vizuale │ │ ├── aiMatching.ts # AI për përputhje ustallarësh │ │ ├── geocoding.ts # Shërbimi Mapbox │ │ ├── pushNotifications.ts # Njoftime push │ │ └── seedData.ts # Të dhëna fillestare │ └── theme/ # Tema dhe ngjyrat ├── admin-dashboard/ # Panel admin (HTML statik) ├── App.tsx # Hyrja kryesore dhe navigimi ├── app.json # Konfigurimi Expo ├── package.json # Varësitë └── tsconfig.json # Konfigurimi TypeScript




## 🚀 Instalimi dhe Konfigurimi

### Parakushtet
- Node.js 18+
- Expo CLI
- Android Studio (për Android)
- PocketBase server

### Hapat e Instalimit

1. **Klononi projektin**
```bash
git clone <repository-url>
cd ustai-app-claude
Instaloni varësitë



bash
npm install
Konfiguroni PocketBase
Shkarkoni PocketBase nga https://pocketbase.io/docs/
Nisni serverin: ./pocketbase serve
Krijoni koleksionet e nevojshme (shih strukturën e databazës)
Konfiguroni variablat e mjedisit Krijoni .env në rrënjën e projektit:


env
EXPO_PUBLIC_POCKETBASE_URL=http://127.0.0.1:8090
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_your_stripe_key
EXPO_PUBLIC_GROQ_API_KEY=gsk_your_groq_key
EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=pk_your_mapbox_token
Konfiguroni Google Maps
Në app.json, zëvendësoni VENDOS_GOOGLE_MAPS_API_KEY_KETU me API key-in tuaj
Nisni projektin



bash
npm start
Për Android:




bash
npm run android
🎨 Tema dhe Ngjyrat
Aplikacioni përdor Dark Mode me ngjyrat e përcaktuara në src/theme/colors.ts:



typescript
{
  primare: '#FF7A1A',        // Portokalli
  sfondi: '#0A0A0A',        // E zezë
  sfondiKarte: '#141414',   // Gri e errët
  teksti: '#FFFFFF',       // E bardhë
  tekstiZbehur: '#9CA3AF', // Gri
  paralajmerim: '#FFB020',  // E verdhë
  gabim: '#E5484D',         // E kuqe
  sukses: '#34C759'         // E gjelbër
}
📱 Ekrane Kryesore
Auth Flow
StartScreen: Zgjedhja roli (Klient/Ustai)
RegisterScreen: Regjistrimi me numër telefon
VerifyOTPScreen: Verifikimi OTP
SelectCategoryScreen: Zgjedhja kategorisë
Klient
JobPostScreen: Postimi i punëve me AI auto-fill
JobBidsScreen: Shikimi i ofertave
BrowseUstajteScreen: Kërkimi i ustallarëve
ClientProfileScreen: Profili i klientit
Ustai
AvailableJobsScreen: Shikimi i punëve të disponueshme
MyBidsScreen: Ofertat e mia
UstaiProfileScreen: Profili i ustait
UstaiAnalyticsScreen: Analitika
AI Features
AIPreventivScreen: Gjenerim preventivi me foto
AIScanScreen: Skanim i hapësirave
AIBathroomPlannerScreen: Planifikim tualeti
AIRoomPlannerScreen: Planifikim hapësirash
Extra Features
ChatScreen: Mesazheri
RatingScreen: Vlerësimi
InstantBookScreen: Rezervim i menjëhershëm
MaintenancePlansScreen: Planet e mirëmbajtjes
🧠 Shërbimet AI
AI Lokale / Offline Integration
Ollama u hoq nga projekti. AI-ja ofrohet nga src/lib/localAI.ts, që kthen te dhena demo deterministe pa asnje thirrje rrjeti. Projekti testohet pa server, pa internet dhe pa API key.

AI Vision Service (src/lib/aiVisionService.ts)
Analizë foto për preventiv
Planifikim hapësirash (kuzhinë, dhomë gjumi, tualet, kopsht)
Skanim i dhomave
AI Matching (src/lib/aiMatching.ts)
Gjetja e ustallarëve më të përshtatshëm
Rekomandime të personalizuara
AI Diagnosis (src/lib/aiDiagnosis.ts)
Analizë problemeve nga foto
Kategorizim automatik
💾 Struktura e Databazës (PocketBase)
Koleksionet Kryesore
users

id, email, password, pushToken
profiles

id, user_id, emri, telefon, role (klient/ustai)
category_id, rating, eshte_i_verifikuar
eshte_i_bllokuar, arsyeja_bllokimit
categories

id, emri, ikona
jobs

id, klient_id, category_id, pershkrimi
sipërfaqja_m2, afati_perfundimit
vendndodhja (JSON), status, eshte_urgjente
fotot (array)
bids

id, job_id, ustai_id, cmimi, pershkrimi
verification_documents

id, ustai_id, dokumenti_url, status
reports

id, reporter_id, job_id, status
🔧 Komandat e Build
Zhvillim


bash
npm start              # Nis Expo Dev Server
npm run android        # Nis në Android emulator/device
npm run ios            # Nis në iOS simulator
Build Android


bash
npm run prebuild       # Sinkronizim me native files
npm run build:android  # Build APK release
npm run build:android-debug  # Build APK debug
Pastrim


bash
npm run clean:android  # Pastron build folder
npm run clean:full     # Pastrim i plotë
🎛️ Admin Dashboard
Panel admin gjendet në admin-dashboard/index.html:

Kredencialet Default:

Përdoruesi: Bush
Fjalëkalimi: BUSH1
Funksionalitete:

Përmbledhje statistikash
Menaxhim i kategorive
Verifikim dokumentesh
Menaxhim konfliktesh
Bllokim përdoruesish
🔐 Siguria
PocketBase për autentikim dhe autorizim
AsyncStorage për ruajtjen e sesionit
Stripe për pagesa të sigurta
Verifikim dokumentesh për ustallarë
📝 Konventa të Kodimit
TypeScript strict mode: Të gjitha tipet duhet të jenë të përcaktuara
Path aliases: Përdorni @/* për src/*
Naming: Entitetet e biznesit në shqip (ustai, klient, punë)
Theme: Gjithmonë përdorni ngjyrat nga NGJYRAT në vend të hardcoding
🚀 Deployimi
Android APK
Konfiguroni app.json me versionin e duhur
Nisni npm run build:android
APK gjendet në android/app/build/outputs/apk/release/
PocketBase Deploy
Serveri PocketBase është hequr — src/lib/pocketbase.ts është mock lokal (pa rrjet).
Për ta rikthyer serverin real: Copy-Item src/lib/pocketbase.ts.REAL.BAK src/lib/pocketbase.ts -Force
🐛 Debugim
Për probleme me PocketBase:

Serveri është hequr; src/lib/pocketbase.ts është mock lokal që kthen të dhëna boshe.
Nëse një ekran pritej të shfaqte të dhëna reale, rikthe serverin me skedarin .REAL.BAK.
Për probleme me AI:

AI-ja është lokale (src/lib/localAI.ts) — nuk ka server për të kontrolluar.
Kontrollo logcat për linjën "[localAI]" për të verifikuar që thirrja u trajtua lokalisht.
📞 Kontakt
Për pyetje ose kontribute, kontaktoni me ekipin e zhvillimit.

📄 Licenca
Ky projekt është pronë private. Të gjitha të drejtat e rezervuara.
