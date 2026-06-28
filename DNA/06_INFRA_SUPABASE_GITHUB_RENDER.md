# 06 — Infrastruttura: Supabase, GitHub & Render

Riferimenti operativi reali. Nessun segreto qui: i valori sensibili stanno in `.env` (locale, gitignored) e nei secret di piattaforma.

## Repository
- **GitHub:** `https://github.com/derohot975/DIAGONALS`
- **Branch operativa unica: `main`** (nessun altro branch remoto). Push su `main` = deploy.
- Remote secondario locale `gitsafe-backup` (mirror di backup).

## Database — Supabase (piano Free)
- PostgreSQL su Supabase, progetto ref **`lmggvdulobhxlgdpbpom`** (`https://lmggvdulobhxlgdpbpom.supabase.co`).
- Connessione: driver `postgres` + Drizzle. URL via `DATABASE_URL` (alias `SUPABASE_DB_URL` / `SUPABASE_DATABASE_URL`).
- Accesso backend diretto (non PostgREST). RLS disattivata sulle tabelle (coerente con accesso service-level dal server).
- **Pausa Free dopo ~7 giorni di inattività** → mitigata dal keepalive esterno (sotto).

## Deploy — Render (piano Free)
- Servizio **DIAGONALS**, id `srv-d44l5tuuk2gs73fgqipg`.
- URL pubblico: **https://diagonals.onrender.com**
- Area admin/gestione app: **https://diagonals.onrender.com/admina**
- **autoDeploy ON** su push `main` (Render fa il pull e build da solo).
- Build: `npm run build` · Start: `npm run start`.
- Env vars su Render: `DATABASE_URL`, `VITE_AUTH_MODE`, `VITE_ENABLE_APP_SHELL`, `VITE_ENABLE_SW`.
- Sleep Free dopo ~15 min inattività → cold start al primo accesso.

## CI/CD — GitHub Actions
- `.github/workflows/render-deploy.yml`: su push/PR `main` esegue `npm ci` → `check` → `lint` → `guard:lens` → `build` → verifica artefatti, poi step "Deploy to Render".
  - ⚠️ Lo step deploy usa i secret `RENDER_SERVICE_ID` / `RENDER_API_KEY` che **NON sono configurati** sul repo: quello step non effettua il deploy. Il deploy reale avviene via **autoDeploy nativo di Render**. Vedi `08`.

## Keepalive Supabase (la catena che tiene vivo il DB)
- Workflow **`.github/workflows/supabase-keepalive.yml`** — scheduler **esterno**, indipendente dallo sleep di Render.
- Cron `17 6 */2 * *` → ping ogni **2 giorni**. Lettura minima REST: `GET /rest/v1/users?select=id&limit=1` con anon key (privilegio minimo, mai service key). Nessuna scrittura.
- Secret repo usati: `SUPABASE_URL`, `SUPABASE_ANON_KEY` (configurati).
- **Verifica:** GitHub → Actions → "Supabase Keepalive" → run schedulato o `Run workflow` manuale; atteso `HTTP 200` + `Keepalive OK`.
- **Disattivazione:** elimina il file o disabilita il workflow dalla tab Actions.
- **Rischio residuo:** GitHub disabilita i cron dopo 60gg di repo fermo; mitigato dai deploy regolari + run manuale.

## Monitoring
- Uptime Robot su `https://diagonals.onrender.com/api/health` (health sempre 200, status nel body).

## Catena operativa (per orientarsi)
repo `main` → push → **Render autoDeploy** → build/start → app pubblica.
DB `lmggvdulobhxlgdpbpom` ← keepalive Actions (ogni 2gg) mantiene attivo.
