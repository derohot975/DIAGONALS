# 05 — Auth, Sicurezza & Logging

## Autenticazione (PIN, no password)
- `POST /api/auth/login` — payload `{ pin }`, lookup utente per PIN (`authenticateUserByPin`).
- `POST /api/auth/register` — payload `{ name, pin }`. Validazione PIN `/^\d{4}$/`, nome ≤10 e unico (`getUserByName`), PIN unico.
- Sessione client (`useSession`): login/logout + heartbeat periodico, stato in `sessionStorage` (`dg_user_session`, `dg_admin_session`). Admin protetto da PIN flow.
- ⚠️ Sessione **in-memory/sessionStorage**: non persiste tra reload. Vedi `08`.

## Hardening backend (`server/index.ts`, su `/api*`)
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `Referrer-Policy: no-referrer`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `x-powered-by` disabilitato.
- `server/routes/auth.ts` aggiunge `Cache-Control: no-store`, `Pragma: no-cache`.

## Health endpoint `/api/health`
- Rate limiting **in-memory** (Map, 100 req/15min per IP) — perde stato al restart (vedi `08`).
- Timeout query DB 1s (`Promise.race`); warm-up 2-step (`users` → `wine_events`).
- Risponde **sempre 200** (compatibilità Uptime Robot), con status `ok`/`degraded`/`down` nel body.

## Logging
- Middleware request: durata + sintesi body troncata (max ~160 char).
- Logger strutturato `server/utils/logger.ts`: livelli `DEBUG/INFO/WARN/ERROR`, contesti (`DB`, `API`, `AUTH`, `REQ`, `HEALTH`, `WINES`, `EVENTS`, `REPORTS`), timestamp ISO. Livello per ambiente (DEBUG dev, INFO prod).
- `Server-Timing` headers su query wines/search per diagnostica.

## Error handling
Middleware globale: shape `{ ok: false, error: { code, message, stack? } }` (`stack` solo in dev), protezione `res.headersSent`, log con contesto (URL, method, status).
