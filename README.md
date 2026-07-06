# Shërbime Shtëpiake — App Android

Marketplace shërbimesh shtëpiake (hidraulikë, elektricistë, kopshtarë, pastrues etj.) — **Faza 1: pa pagesa/komision**, thjesht lidhje klient ↔ ofrues.

## Çfarë përfshin

- **Klientët**: shfletojnë kategori → shohin ofrues të renditur sipas distancës/vlerësimit → dërgojnë kërkesë direkte OSE postojnë **kërkesë të hapur** për të marrë oferta nga disa ofrues → zgjedhin ofertën më të mirë → shohin statusin → lënë vlerësim → mund të rezervojnë përsëri ose të ruajnë ofrues të preferuar
- **Ofruesit**: regjistrohen me kategori + lokacion GPS + certifikime → marrin kërkesa direkte (prano/refuzo/përfundo) → shohin dhe bëjnë oferta te "Punët e Hapura" → ndërtojnë vlerësim me kalimin e kohës
- **Kategoritë**: Hidraulikë, Elektricistë, Kopshtarë, Pastrues, Piktorë, Marangozë, Pllakaxhi, Bojaxhi, Shtrues Parketesh, Montues Kondicionerash
- **Lokacion & Hartë**: renditje sipas distancës (GPS), lidhje direkte për Google Maps te çdo ofrues
- **Sistemi i ofertave** (si Thumbtack): klienti posto një punë të hapur, disa ofrues bëjnë oferta me çmim, klienti zgjedh më të mirën
- **Rezervime të përsëritura**: çdo javë/2javë/muaj për të njëjtin ofrues
- Autentikim me email/password (Supabase Auth), bazë e sigurt me RLS

## Hapi 1 — Krijo projektin Supabase

1. Shko te [supabase.com](https://supabase.com) → krijo projekt të ri (falas)
2. Te **SQL Editor**, ngjit dhe ekzekuto përmbajtjen e `supabase-schema.sql`
3. Te **Settings → API**, kopjo `Project URL` dhe `anon public key`
4. Hape `lib/supabase.js` dhe zëvendëso:
   ```js
   const SUPABASE_URL = "https://YOUR_PROJECT.supabase.co";
   const SUPABASE_ANON_KEY = "YOUR_ANON_KEY";
   ```

## Hapi 2 — Instalo dhe testo lokalisht

```bash
npm install
npx expo start
```

Skano QR kodin me app-in **Expo Go** (Android/iOS) për ta testuar direkt në telefon.

## Hapi 3 — Ndërto APK-në (pa Google Play, direkt APK për instalim)

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android --profile preview
```

- `eas build:configure` krijon automatikisht `eas.json`
- Profili `preview` prodhon një `.apk` që mund ta shpërndash direkt (jo `.aab` për Play Store)
- Kur build-i mbaron, EAS të jep një link shkarkimi për APK-në

Alternativë falas pa EAS cloud: `npx expo run:android` (kërkon Android Studio të instaluar lokalisht).

## Struktura e projektit

```
app/
  index.js              → Faqja kryesore (kategoritë)
  auth/login.js         → Hyrje
  auth/signup.js        → Regjistrim
  category/[id].js      → Lista e ofruesve sipas kategorisë
  provider/[id].js      → Profili i ofruesit + vlerësimet
  booking/[providerId].js → Forma e kërkesës për shërbim
  my-requests.js        → Kërkesat e klientit + lënia e vlerësimit
  provider-onboard.js   → Regjistrimi si ofrues
  provider-dashboard.js → Paneli i ofruesit (prano/refuzo/përfundo)
lib/
  supabase.js           → Lidhja me Supabase
  AuthContext.js        → Menaxhimi i sesionit
supabase-schema.sql      → Skema e plotë e databazës + RLS
```

## Hapat e ardhshëm (kur të duhet monetizim)

- Shto fushë `commission_rate` te `providers` dhe integrim pagese (Stripe/PayPal) vetëm kur vendos ta aktivizosh
- Njoftime push (Expo Notifications) kur vjen kërkesë e re
- Upload foto profili (Supabase Storage bucket — struktura e RLS tashmë e mbështet këtë shtesë)
- Panel admin për verifikimin e ofruesve (si te Tripzo)
