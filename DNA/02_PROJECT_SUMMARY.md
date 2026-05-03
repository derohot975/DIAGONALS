# Project Summary

## Identità prodotto

`DIAGONALS` è una web app mobile-first per degustazioni vino con flusso completo: registrazione partecipanti, creazione eventi, registrazione vini, voto, risultati e report/pagella.

## Stack reale in uso

### Frontend

- React 18.3.1 + TypeScript 5.6.3
- Vite 5.4.19 (`client/index.html`, `client/src/main.tsx`)
- Tailwind CSS 3.4.17 + tailwindcss-animate
- TanStack Query 5.60.5 per stato server
- Icone: `lucide-react` 0.453.0 + `unplugin-icons` 22.3.0
- nanoid 5.1.5 per ID generation

### Backend

- Node.js 18+ + Express 4.21.2 (`server/index.ts`)
- Router modulari in `server/routes/*` (8 router dominio)
- Storage layer pattern in `server/storage/*` (5 storage class)
- Middleware sicurezza + logging centralizzati

### Data layer

- PostgreSQL via `postgres` driver 3.4.7
- Drizzle ORM 0.45.2 + drizzle-zod 0.7.0
- Schema condiviso in `shared/schema.ts` (5 tabelle + tipi estesi)
- Pagella table separata in `server/db/pagella.ts`

### Qualità / Tooling

- TypeScript strict mode abilitato
- ESLint 9.39.4 flat config (`eslint.config.mjs`)
- Prettier 3.8.3
- Knip 5.88.1 (dead code detection)
- Playwright 1.55.1 (E2E testing)
- GitHub Actions workflow per deploy Render

## Caratteristiche funzionali principali

- Login/registrazione via PIN 4 cifre (validazione regex `/^\d{4}$/`)
- Ruoli utente (admin / non-admin) con flag `is_admin`
- Eventi con stato (`registration`/`voting`/`completed`) e voting status (`not_started`/`active`/`completed`)
- Registrazione vini per evento (type: Bianco/Rosso/Bollicina)
- Voto con score numerico 1-10 (supporto .5 via decimal(3,1))
- Calcolo risultati evento con rounding precision 100
- Report evento + pagella editor (solo DERO/TOMMY possono editare)
- Lens search overlay cross-screen per vini eventi completati
- Safe-mode iOS detection per shell/SW gating

## Architettura ad alto livello

- SPA React servita da Vite in development (middleware `setupVite`)
- In produzione Express serve API + static build (`dist/public`) via `serveStatic`
- Frontend e backend condividono tipi/schema da `shared/schema.ts`
- Layering backend: `routes` -> `storage` -> `db` (Drizzle ORM)
- Storage pattern con interface `IStorage` e implementation `DatabaseStorage`

## Entry points verificati

- Dev server: `npm run dev` / `npm run dev:5001` -> `tsx --env-file=.env server/index.ts`
- Build: `vite build` + `esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist`
- Start production: `node dist/index.js`
- Database init: `initializeDatabase()` + `ensurePagellaTable()` al bootstrap server

## Stato attuale sintetico

- Pipeline qualità attiva e funzionante
- Lint/typecheck/build/test automatizzati via npm scripts
- Dead code scan attivo con `knip`
- Deploy gate su branch `main` via workflow Render (.github/workflows/render-deploy.yml)
- Backup automatico con rotazione (ultimi 3 backup) in `Backup_Automatico/`
- Health endpoint con rate limiting (100 req/15min) e DB warm-up
