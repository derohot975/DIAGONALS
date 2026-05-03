# Environments & Secrets

## File env in uso

- Runtime dev server legge `--env-file=.env` (`npm run dev`, `npm run dev:5001`)
- `drizzle.config.ts` risolve URL DB da:
  1. `DATABASE_URL`
  2. `SUPABASE_DB_URL`
  3. `SUPABASE_DATABASE_URL`
  4. fallback locale

## Variabili critiche attuali (verificate in .env)

- `SUPABASE_URL`: URL progetto Supabase
- `SUPABASE_ANON_KEY`: chiave anonima client Supabase
- `SUPABASE_SERVICE_ROLE_KEY`: chiave service role Supabase (privilegi elevati)
- `SUPABASE_DB_URL`: stringa connessione PostgreSQL completa con credenziali
- `GITHUB_TOKEN`: token GitHub per automazioni
- `SUPABASE_DATABASE_URL`: alias per compatibilità
- `DATABASE_URL`: alias per compatibilità backend
- `NODE_ENV`: development/production
- `PORT`: porta server (default 3000, preferito 5001)
- feature flags frontend via `VITE_*` (es. VITE_ENABLE_APP_SHELL, VITE_ENABLE_SW)

## Policy sicurezza secrets

- `.env` è in `.gitignore` per evitare commit accidentale
- Mai committare credenziali reali in markdown/codice
- Usare secrets di piattaforma per deploy (`RENDER_*`)
- Evitare echo di valori sensibili nei log
- Le chiavi Supabase sono rotazione-managed via dashboard

## Render/GitHub secrets attesi

Workflow deploy richiede:

- `RENDER_SERVICE_ID`
- `RENDER_API_KEY`

## Risk checklist env

- [x] URL DB non hardcoded in codice (usa variabili env)
- [x] env file locale non pubblicato (in .gitignore)
- [x] segreti presenti solo su vault/CI secret store (Supabase dashboard)
- [x] separazione chiavi anonima/service role per least privilege
