# Current State

## Snapshot operativo

Aggiornato al run corrente (2026-05-04).

## Gate qualità verificati

- `npm run lint` -> PASS (ESLint 9.39.4 flat config)
- `npm run check` -> PASS (TypeScript 5.6.3 strict mode)
- `npm run build` -> PASS (Vite 5.4.19 + esbuild 0.25.6)
- `npm run quality:deadcode` -> PASS (Knip 5.88.1)
- `npm run test:all` -> PASS (check + lint + build + guard:lens + test:e2e)
- `npm run security:audit` -> PASS sul livello `high` (restano advisory moderate non bloccanti)

## Runtime locale

- Comando standard: `npm run dev` (NODE_ENV=development tsx --env-file=.env server/index.ts)
- Comando preferito utente: `npm run dev:5001` (PORT=5001)
- Server Express avviabile su porta 5001 con env dev
- Keep-alive DB attivo (intervallo 24h) con ping `SELECT 1`

## Stato repository (funzionale)

- Frontend e backend compilano correttamente
- Bundle produzione generabile in `dist/` (frontend in `dist/public`, backend in `dist/index.js`)
- Asset branding principale disponibile in `attached_assets/diagologo.png`
- Sistema backup automatico operativo in `Backup_Automatico/` con rotazione ultimi 3 backup

## CI/CD

Workflow `.github/workflows/render-deploy.yml`:

1. `npm ci`
2. `npm run check`
3. `npm run lint`
4. `npm run guard:lens` (props + zindex guardrails)
5. `npm run build`
6. verifica artefatti `dist/index.js` e `dist/public`
7. deploy Render su push `main` via action

## Osservazioni operative

- Alcuni warning informativi esterni (es. baseline-browser-mapping / caniuse-lite) non bloccano build
- La base E2E corrente gira ma i test possono risultare `skipped` in base alla suite configurata
- Health endpoint `/api/health` con rate limiting 100 req/15min e timeout DB 1s
- Server-Timing headers abilitati per diagnostica performance su endpoint wines/search

## Impatto delle ultime attività

- Pulizia artefatti e file non runtime eseguita
- Cartella `DNA` rigenerata con documentazione aggiornata allo stato reale del codice
- Integrità funzionale confermata con typecheck + build + test pipeline
- Backup automatico configurato con rotazione e verifica integrità archivio
