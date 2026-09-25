# Repository Guidelines

## Project Structure & Module Organization
The project is a React Native mobile application built with Expo, targeting the Albanian market. It follows a centralized architecture:
- `src/screens/`: Contains all application views. Screens are named using a mix of English and Albanian terminology (e.g., `JobPostScreen.tsx` vs `BrowseUstajteScreen.tsx`).
- `src/lib/`: Houses the core business logic, including AI-driven services (`localAI.ts` — offline, no server), geocoding, and push notifications.
- `src/components/`: Shared UI components for consistent rendering across screens.
- `App.tsx`: The main orchestrator for navigation (`react-navigation`) and global theme settings (Dark Theme).
- `admin-dashboard/`: A separate static site for administrative tasks.

## Build, Test, and Development Commands
Use the following commands for development and building:
- `npm start`: Starts the Expo development server.
- `npm run android`: Launches the application on an Android emulator or device.
- `npm run build:android`: Generates a release APK in `android/app/build/outputs/apk/release/`.
- `npm run clean:android`: Cleans the Android build folder.
- `npm run prebuild`: Synchronizes native Android files with Expo configurations.

## Coding Style & Naming Conventions
- **TypeScript**: Strict mode is enforced. Use explicit types wherever possible.
- **Path Aliases**: Use `@/*` to refer to the `src/` directory (e.g., `import { pb } from '@/lib/pocketbase'`).
- **Naming**: Business domain entities use Albanian terms: `ustai` (craftsman/worker), `klient` (client), `punë` (job). Screen and component filenames should follow PascalCase.
- **Theme**: The application is strictly Dark Mode. Avoid hardcoding colors; refer to the styles in `App.tsx` or screen-specific style objects.

## Core Services & Integration
- **PocketBase**: REMOVED. `src/lib/pocketbase.ts` is a local mock — it keeps the same surface (`pb`, `pbReady`) but makes **no network calls**. Restore with `Copy-Item src/lib/pocketbase.ts.REAL.BAK src/lib/pocketbase.ts -Force`.
- **AI Services**: Ollama is REMOVED (no `localhost:11434`, no API keys, no network). `src/lib/localAI.ts` exports `thirrAILokale()` and returns deterministic offline demo data, so every AI screen is testable without any server. Restore Ollama with `Copy-Item src/lib/ollama.ts.REAL.BAK src/lib/ollama.ts -Force`.
- **Payments**: Stripe is used for payment processing. Ensure `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set in the environment.

## Commit & Pull Request Guidelines
- Follow clear, descriptive commit messages. Maintain a clean log starting with feature-based or fix-based titles.

## Gjendja aktuale & historiku (LEXO PARA SE TË FILLOSH)

**`PROGRESS.md`** në rrënjë mban gjendjen e projektit: çfarë është bërë, çfarë është e
hapurm dhe rregullat e punës. Lexoje gjithmonë në fillim të sesionit dhe **përditësoje**
në fund të çdo sesioni me atë që ndryshoi — kështu asnjë sesion nuk ka nevojë të
rishpjegohet nga e para.

- `PROGRESS.md` — gjendja, hapat e hapur (P1/P2/P3), gotcha-t e build-it
- `OFFLINE-BUILD.md` — si ndërtohet/testohet pa Metro dhe pa server
- `docs/IKONAT.md` — si gjenerohen ikonat nga `assets/logo-master.png`

