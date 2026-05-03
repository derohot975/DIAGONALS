# Runtime Sequences

## 1) Development bootstrap

1. `npm run dev` (o `npm run dev:5001`) esegue `tsx --env-file=.env server/index.ts`
2. `server/index.ts` inizializza DB (`initializeDatabase`, `ensurePagellaTable`)
3. In `NODE_ENV=development` monta middleware Vite (`setupVite`)
4. Avvia keep-alive DB con intervallo 24h (ping `SELECT 1`)
5. Route API e SPA convivono nello stesso processo HTTP
6. Server listen su porta 3000 (default) o 5001 (preferito utente)

## 2) Request lifecycle API

1. Request entra in Express
2. Middleware sicurezza API applica header per `/api*` (`nosniff`, frame, referrer, permissions, x-powered-by disabled)
3. Middleware logging misura durata e sintetizza payload JSON (max 160 caratteri)
4. Router dominio gestisce endpoint (`/api/*`)
5. Storage layer esegue query Drizzle/Postgres
6. Error middleware unifica shape risposta errore (`{ ok: false, error: { code, message, stack? } }`)

## 3) Production runtime

1. Build genera frontend in `dist/public` e backend bundle `dist/index.js`
2. `npm run start` lancia `node dist/index.js`
3. Express serve static via `serveStatic` + fallback SPA per route non-API
4. API restano su prefisso `/api/*`
5. Keep-alive DB attivo anche in produzione

## 4) Frontend startup

1. `client/src/main.tsx` monta `<AppProvider><App/></AppProvider>`
2. Inizializza safe-mode iOS flags su `window.__DIAGONALE_SAFE_MODE__` (IS_IOS, SHELL_ENABLED, INTRO_ENABLED, SW_ENABLED)
3. Registra service worker in modo deferred se abilitato (requestIdleCallback o setTimeout)
4. App.tsx gestisce splash screen prioritaria, loading skeleton, data fetching

## 5) Auth/session flow (client)

1. `useAuth` gestisce login/register via `/api/auth/*` (PIN 4 cifre)
2. `useSession` gestisce login per utente selezionato, heartbeat periodico e logout
3. Session state riflesso in `sessionStorage` (`dg_user_session`, `dg_admin_session`)
4. Admin session protetta via PIN flow con `useAppNavigation`

## 6) Event flow (alto livello)

1. Admin crea evento (verifica esistenza user `createdBy`)
2. Utente registra vino su evento (type: Bianco/Rosso/Bollicina)
3. Stato evento passa a `voting`, voting status a `active`
4. Utenti votano vini (upsert logic: update se esiste, create altrimenti)
5. Admin verifica completamento votazioni (`checkEventVotingComplete`)
6. Admin completa evento (`POST /:id/complete`) che genera report e calcola rankings
7. Schermate risultati/pagella consumano endpoint evento con ROUNDING_PRECISION=100
