# Repository Map

## Root

- `package.json` / `package-lock.json` - script, dipendenze, versioning (React 18.3.1, TS 5.6.3, Vite 5.4.19, Express 4.21.2, Drizzle 0.45.2)
- `vite.config.ts` - config frontend build/dev (manual chunks, sourcemap)
- `tsconfig.json` - config TypeScript (strict mode abilitato)
- `drizzle.config.ts` - config schema migration tooling
- `eslint.config.mjs` - lint policy (flat config ESLint 9.39.4)
- `.prettierrc.json` / `.prettierignore` - formatting policy (Prettier 3.8.3)
- `knip.json` - dead code detection config (Knip 5.88.1)
- `.github/workflows/render-deploy.yml` - CI/CD deploy pipeline
- `.env` - variabili ambiente (gitignored, contiene Supabase credentials)

## Frontend (`client/`)

### Entrata

- `client/index.html` - HTML entry point
- `client/src/main.tsx` - React root + safe-mode iOS flags + SW registration deferred
- `client/src/App.tsx` - orchestrazione principale (router, app state, mutations, handlers)
- `client/src/providers/AppProvider.tsx` - QueryClientProvider wrapper

### Macro-sezioni

- `components/screens/` - 10 schermate principali (AuthScreen, EventListScreen, EventDetailsScreen, SimpleVotingScreen, EventResultsScreen, EventReportScreen, HistoricEventsScreen, PagellaScreen, AdminScreen, AdminEventManagementScreen, SplashScreen)
- `components/modals/` - 9 modali operative (AddUserModal, EditUserModal, CreateEventModal, EditEventModal, WineRegistrationModal, ManageEventModal, ManageEventSteps, ChangeAdminPinModal, EventReportModal)
- `components/search/` - lens/search experience (GlobalWineSearchOverlay, WineSearchOverlay, WineSearchCard, SearchLensButton)
- `components/ui/` - componenti UI base (BaseModal con prop `open`)
- `components/optimized/` - componenti ottimizzati per performance (EventCard, LoadingSpinner, ScoreButton, VotingGrid)
- `components/navigation/` - BottomNavBar
- `hooks/` - 15+ custom React hooks (useAuth, useSession, useAppState, useAppRouter, useAppNavigation, useAppHandlers, useEventMutations, useUserMutations, useWineMutations, useEventLogic, useLongPress, useGuestAuth, useAppEffects, use-mobile, use-toast)
- `handlers/` - helper di orchestrazione UI/eventi (eventHandlers.ts, uiHandlers.ts, userHandlers.ts)
- `lib/` - utility tecniche e query client (queryClient.ts, logger.ts, performanceTelemetry.ts, serviceWorker.ts, utils.ts)
- `styles/` - css e token UI (auth-keypad-mobile.css, icons.css, tokens/zIndex.ts)
- `contexts/` - provider di contesto (SearchOverlayContext)
- `config/` - configurazioni (features.ts)

## Backend (`server/`)

### Entrata

- `server/index.ts` - bootstrap express/http, middleware sicurezza, logging, error handling, vite/static serving, keep-alive DB (24h)

### API

- `server/routes/index.ts` - mount router domini (8 router + reports router)
- `server/routes/auth.ts` - login/register con validazione PIN 4 cifre
- `server/routes/users.ts` - CRUD utenti con Zod validation
- `server/routes/events.ts` - CRUD eventi + voting control + participants management
- `server/routes/wines.ts` - CRUD vini + search endpoint con Server-Timing headers
- `server/routes/votes.ts` - CRUD voti con upsert logic
- `server/routes/reports.ts` - pagella (solo DERO/TOMMY) + event completion + report generation
- `server/routes/health.ts` - health check con rate limiting 100 req/15min, DB warm-up timeout 1s

### Data access

- `server/storage/index.ts` - orchestratore storage con interface IStorage
- `server/storage/users.ts` - UserStorage class
- `server/storage/events.ts` - EventStorage class
- `server/storage/wines.ts` - WineStorage class (include searchWinesInCompletedEvents)
- `server/storage/votes.ts` - VoteStorage class
- `server/storage/reports.ts` - ReportStorage class
- `server/storage.ts` - façade export storage
- `server/db.ts` - connessione DB via postgres driver
- `server/init-db.ts` - init runtime DB + ensurePagellaTable
- `server/db/pagella.ts` - pagella table separata con upsert logic
- `server/utils/logger.ts` - logging strutturato con LogLevel enum
- `server/vite.ts` - Vite middleware configuration

## Shared (`shared/`)

- `shared/schema.ts` - tabelle Drizzle (users, wine_events, wines, votes, event_reports), Zod schemas (insert*), tipi TypeScript condivisi (User, WineEvent, Wine, Vote, EventReport, WineResult, WineResultDetailed, EventReportData, UserRanking)

## Scripts (`scripts/`)

- `backup-system.js` - backup create/list/restore con rotazione ultimi 3
- `generate-icons.js` - generazione icone PWA (96x96, 144x144, 192x192, 512x512)
- `update-pwa-icons.js` - update icone con timestamp
- `post-build.js` - task post-build
- `START_DEV.sh` - helper start dev

## QA / Test

- `e2e/` - playwright specs (search-overlay.spec.ts)
- `playwright.config.ts` - config browser projects + webserver
- `playwright-report/` - output E2E report (non versionato)
- `test-results/` - output test results

## Asset

- `attached_assets/diagologo.png` - logo app principale
- `public/` - manifest.json, sw.js, PWA icons, apple-touch-icon.png
- `client/public/` - asset statici client
- `Backup_Automatico/` - archivi backup automatici (.tar.gz)
