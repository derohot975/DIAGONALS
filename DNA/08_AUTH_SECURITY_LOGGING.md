# Auth, Security & Logging

## Autenticazione

### Endpoint auth

- `POST /api/auth/login` con payload `{ pin }` (lookup utente per PIN)
- `POST /api/auth/register` con payload `{ name, pin }` (validazione regex `/^\d{4}$/`)

### Regole principali

- PIN obbligatorio e formato 4 cifre lato API register (`/^\d{4}$/`)
- Unicità nome verificata via `getUserByName()` in register
- Unicità PIN verificata via `authenticateUserByPin()` in register
- Lunghezza nome max 10 caratteri
- Login usa lookup utente per PIN via `authenticateUserByPin()`

### Sessione client

- `useSession` gestisce:
  - login mutation su endpoint utenti
  - heartbeat periodico
  - logout mutation
  - cleanup heartbeat su transizioni
- Session state riflesso in `sessionStorage` lato app shell (`dg_user_session`, `dg_admin_session`)

## Hardening sicurezza backend

In `server/index.ts` per `/api*`:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `Referrer-Policy: no-referrer`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `x-powered-by` disabilitato

In `server/routes/auth.ts`:

- `Cache-Control: no-store`
- `Pragma: no-cache`

## Health endpoint sicurezza

`/api/health` include:

- Rate limiting in-memory (Map store, 100 req/15min per IP)
- Timeout query DB (1s con Promise.race)
- Status degradato/down senza crash app
- DB warm-up 2-step fallback (users table → wine_events table)
- Response sempre 200 per Uptime Robot compatibility

## Logging

### Server app log

- Middleware log request durata e sintesi body (`summarizeResponseBody`)
- Truncation linee log a 160 caratteri (MAX_LOG_LINE_LENGTH)
- Keep-alive DB con log esito (intervallo 24h, ping `SELECT 1`)
- Server-Timing headers per diagnostica performance (wines-query, wine-search)

### Logger strutturato

`server/utils/logger.ts`:

- Livelli: `DEBUG`, `INFO`, `WARN`, `ERROR` (LogLevel enum)
- Contesto: `DB`, `API`, `AUTH`, `REQ`, `HEALTH`, `WINES`, `EVENTS`, `REPORTS`
- Output console con timestamp ISO
- Metodi convenienza: `db()`, `api()`, `auth()`, `request()`
- Livello configurabile per ambiente (DEBUG in dev, INFO in prod)

## Error handling

- Error middleware globale in `server/index.ts`
- Shape risposta errore standardizzata:
  - `ok: false`
  - `error.code` (status HTTP)
  - `error.message`
  - `error.stack` (solo in NODE_ENV=development)
- Protezione headers-sent con check `res.headersSent`
- Logging error con contesto (URL, method, status)
