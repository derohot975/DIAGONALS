# 02 — Architettura & Runtime

## Entrypoint
- **Server:** `server/index.ts` — bootstrap Express/HTTP, middleware sicurezza+logging, error handling, serving Vite/static, keepalive DB interno.
- **Client:** `client/src/main.tsx` → monta `<AppProvider><App/></AppProvider>`. `client/src/App.tsx` orchestra router, stato, modali, search overlay.

## Bootstrap dev
1. `npm run dev:5001` → `tsx --env-file=.env server/index.ts`.
2. Init DB: `initializeDatabase()` + `ensurePagellaTable()` (la tabella `pagella` è creata via SQL raw al bootstrap, non da Drizzle).
3. In `NODE_ENV=development` monta middleware Vite (`setupVite`): API e SPA nello stesso processo HTTP.
4. Porta da `process.env.PORT` (default 3000; 5001 in dev preferito).

## Runtime produzione
1. `npm run build` → frontend in `dist/public`, backend bundle `dist/index.js`.
2. `npm run start` → `node dist/index.js`.
3. Express serve static (`serveStatic`) + fallback SPA per route non-`/api`. API restano su `/api/*`.

## Request lifecycle API
1. Middleware sicurezza su `/api*` (header hardening, vedi `05`).
2. Middleware logging: durata + sintesi body (troncata).
3. Router dominio → storage layer → query Drizzle/Postgres.
4. Error middleware: shape unificata `{ ok: false, error: { code, message, stack? } }` (`stack` solo in dev).

## Keepalive DB interno (NB: insufficiente da solo)
- `server/index.ts` avvia un `setInterval` ogni **12h** con ping `SELECT 1`.
- **Limite:** gira solo quando l'app è sveglia. Con Render Free in sleep, non gira → da solo NON previene la pausa Supabase. Il keepalive reale è il **workflow esterno** (vedi `06`).

## Orchestrazione frontend
- `App.tsx`: AppShell + ScreenRouter + modali globali (`AppModals`) + `SearchOverlayContext`.
- Stato globale via hook (`useAppState`, `useAppNavigation`, `useAppHandlers`) + mutations TanStack Query (`useEventMutations`, `useUserMutations`, `useWineMutations`).
- Auth/sessione: `useAuth` + `useSession` (heartbeat periodico, stato in `sessionStorage`: `dg_user_session`, `dg_admin_session`).
- Safe-mode iOS: flag su `window.__DIAGONALE_SAFE_MODE__`; service worker registrato in modo deferred se abilitato.

> Elenco completo schermate/modali/hook: ricavabile da `client/src/components/` e `client/src/hooks/`. Qui solo le logiche non ovvie — vedi `03`.
