# DIAGONALE - Wine Tasting Event Manager

## Stack
- **Frontend**: React 18 + Vite + TailwindCSS + Radix UI (PWA)
- **Backend**: Express.js + Drizzle ORM + PostgreSQL (Supabase)
- **Auth**: PIN-based (no JWT)
- **Runtime**: Node 18.x

## Avvio
```bash
npm run dev   # porta 5000 (env var PORT)
npm run build # build produzione
```

## Struttura
```
client/src/
  App.tsx                      # Orchestratore principale (~229 righe)
  components/
    AppModals.tsx              # Rendering modali globali
    AppShell.tsx               # Layout wrapper
    ScreenRouter.tsx           # Routing custom tra schermate
    AdminPinModal.tsx
    LoadingSkeleton.tsx
    InstallPrompt.tsx
    modals/
      ManageEventModal.tsx     # Logica gestione evento (split da 447→117 righe)
      ManageEventSteps.tsx     # Step UI del ManageEventModal
      AddUserModal.tsx
      EditUserModal.tsx
      CreateEventModal.tsx
      EditEventModal.tsx
      EditEventModal.tsx
      WineRegistrationModal.tsx
      ChangeAdminPinModal.tsx
      EventReportModal.tsx
    navigation/
      BottomNavBar.tsx         # Navbar mobile con safe-area support
    screens/                   # Schermate applicazione
    search/                    # Overlay ricerca vini
    optimized/                 # Componenti memoizzati
    ui/                        # Componenti base (Radix)
  hooks/
    useAppHandlers.ts          # Handler azioni (estratto da App.tsx)
    useAppState.ts             # Stato modale globale
    useAppRouter.ts            # Routing state
    useAppNavigation.ts        # Handler navigazione
    useAuth.ts, useSession.ts
    useUserMutations.ts, useEventMutations.ts, useWineMutations.ts
  contexts/
    SearchOverlayContext.tsx
  lib/
    queryClient.ts, utils.ts, logger.ts, performanceTelemetry.ts
  styles/
    tokens/zIndex.ts
  handlers/                    # Handler per domain logic

server/
  index.ts         # Entry Express (~98 righe, Node 18 compatible)
  vite.ts          # Vite integration + serveStatic (~92 righe)
  db.ts            # Connessione PostgreSQL via postgres-js + Drizzle
  db/pagella.ts    # Tabella event_pagella (raw SQL)
  storage.ts       # IStorage interface + DatabaseStorage
  init-db.ts       # Test connessione DB all'avvio
  routes/          # API routes: auth, users, events, wines, votes, reports
  utils/logger.ts

shared/
  schema.ts        # Drizzle schema (users, wine_events, wines, votes, event_reports, event_pagella)
```

## Database (Supabase PostgreSQL)
- Connessione via `DATABASE_URL` env var
- SSL: `prefer` in dev, `require` in prod
- **NON eseguire mai `db:push` senza autorizzazione esplicita**
- Tabelle: users, wine_events, wines, votes, event_reports, event_pagella

## Regole di governance
- Massimo ~300 righe per file
- Nessun commit/push automatico — l'utente committa manualmente
- Non modificare mai i dati del DB di Supabase
- Chiedere autorizzazione prima di cambiamenti architetturali importanti
- **Report Costi**: Ogni volta che Agent esegue azioni a pagamento, deve includere un report schematico con l'importo in $ dell'ultima azione e il totale addebitato fino a quel momento.

## Fix applicati (Feb 2026)
- `server/vite.ts`: sostituito `import.meta.dirname` con `fileURLToPath` (Node 18 compat)
- `server/index.ts`: stesso fix + rimosso dynamic import superfluo
- `package.json` dev script: rimosso `--env-file=.env.development` (non supportato Node 18)
- `App.tsx`: 671 → 229 righe (estratti `AppModals.tsx` + `useAppHandlers.ts`)
- `ManageEventModal.tsx`: 447 → 117 righe (estratto `ManageEventSteps.tsx`)
- `ScreenRouter.tsx`: fix bug React "setState durante render" — guards auth via `useEffect`
- Design Apple-style applicato a tutte le schermate principali (dark + glassmorphism)

## Schermate aggiornate (design Apple-style)
Tutte le schermate usano dark theme coerente (from-[#300505] to-[#1a0303]) con:
- Frosted glass cards (`bg-white/5 backdrop-blur-2xl border border-white/10`)
- Tipografia white con gerarchia chiara (`text-white`, `text-white/40`, `text-white/20`)
- Bottoni bianchi su dark (`bg-white text-red-950`) o rossi (`bg-red-600 text-white`)

| Schermata | File | Stile |
|---|---|---|
| Auth | AuthScreen.tsx | Dark + keypad PIN glassmorphism |
| Home utente | EventListScreen.tsx | Dark gradient + frosted cards |
| Storico | HistoricEventsScreen.tsx | Dark cards, long-press preservato |
| Admin | AdminScreen.tsx | Light clean, icone colorate |
| Gestione eventi | AdminEventManagementScreen.tsx | Light clean, bottoni chiari |
| Report evento | EventReportScreen.tsx | Light clean, badge oro/argento/bronzo |
| Risultati | EventResultsScreen.tsx | Dark gradient + rank cards |
| Votazione | SimpleVotingScreen.tsx | Dark gradient + wine list glass |
| Dettagli evento | EventDetailsScreen.tsx | Dark gradient + frosted container |

## Performance
- FCP/LCP effettivo app (post-splash): ~1.7s da cold start
- SplashScreen ha timer 3s intenzionale — i valori 4-5s nei log sono normali
- Nessun errore runtime in browser console
