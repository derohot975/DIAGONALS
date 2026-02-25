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

## Fix applicati (Feb 2026)
- `server/vite.ts`: sostituito `import.meta.dirname` con `fileURLToPath` (Node 18 compat)
- `server/index.ts`: stesso fix + rimosso dynamic import superfluo
- `package.json` dev script: rimosso `--env-file=.env.development` (non supportato Node 18)
- `App.tsx`: 671 → 229 righe (estratti `AppModals.tsx` + `useAppHandlers.ts`)
- `ManageEventModal.tsx`: 447 → 117 righe (estratto `ManageEventSteps.tsx`)

## Performance
- LCP: da 4-8s → ~288ms dopo refactoring
- FCP: ~272ms
