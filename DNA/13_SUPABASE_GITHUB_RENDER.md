# Supabase, GitHub & Render

## Database target

- PostgreSQL hosted on Supabase
- Connection via `postgres` driver 3.4.7
- ORM: Drizzle 0.45.2
- Schema: 5 tabelle (users, wine_events, wines, votes, event_reports) + pagella separata
- Connection URL: `SUPABASE_DB_URL` in .env (pointing to postgres.lmggvdulobhxlgdpbpom)
- Keep-alive DB: intervallo 24h con ping `SELECT 1` per evitare timeout connection pool

## CI/CD bridge con GitHub e Render

Workflow `.github/workflows/render-deploy.yml`:

1. Checkout code (actions/checkout@v4)
2. Install dependencies (npm ci)
3. Typecheck (npm run check)
4. Lint (npm run lint)
5. Guardrails (npm run guard:lens - props + zindex)
6. Build (npm run build)
7. Verify artifacts (dist/index.js, dist/public)
8. Trigger Render deploy via API (RENDER_SERVICE_ID, RENDER_API_KEY secrets)

## Deploy contract

- Build command: `npm run build` (vite build + esbuild server)
- Start command: `npm run start` (node dist/index.js)
- Environment variables su Render: `DATABASE_URL`, `NODE_ENV=production`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- Branch target: `main`

## Server in produzione

- Serve API su `/api/*`
- Serve static build da `dist/public` via `serveStatic`
- SPA fallback per route non-API (reindirizza a index.html)
- Health endpoint `/api/health` con rate limiting 100 req/15min
- Server-Timing headers abilitati per diagnostica performance
- Keep-alive DB attivo anche in produzione

## Post-deploy verification

- Health check `/api/health` (status: ok/degraded/down)
- React app loading (app shell, navigation)
- API endpoints (test base endpoints)
- SPA routing (navigation tra schermate)
- Uptime Robot monitoring su https://diagonals.onrender.com/api/health
