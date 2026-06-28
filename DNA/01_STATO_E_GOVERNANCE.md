# 01 — Stato & Governance

## Cos'è
`DIAGONALE` (repo `DIAGONALS`): web app mobile-first per degustazioni vino.
Flusso: registrazione partecipanti → creazione evento → registrazione vini → voto → risultati → report/pagella.

## Stack reale
- **Frontend:** React 18 + TypeScript (strict) + Vite, Tailwind, TanStack Query. SPA mobile-first, PWA (manifest + service worker).
- **Backend:** Node + Express (`server/index.ts`), router per dominio (`server/routes/*`), storage layer (`server/storage/*`).
- **Dati:** PostgreSQL su Supabase via driver `postgres` + Drizzle ORM. Schema in `shared/schema.ts`.
- **Tooling qualità:** ESLint (flat config), Prettier, Knip (dead code), Playwright (E2E).

> Versioni esatte: vedi `package.json` (non duplicate qui — invecchiano).

## Architettura in una riga
SPA React (servita da Vite in dev, da Express static in prod) + API Express `/api/*`, tipi/schema condivisi via `shared/schema.ts`. Layering backend: `routes → storage → db` (Drizzle).

## Regole non negoziabili
- **Branch unica operativa: `main`.** Un push su `main` = **deploy in produzione** su Render. Trattalo come azione ad alto rischio: chiedi conferma prima.
- **Nessuna operazione Git** (commit/push/branch) senza richiesta esplicita.
- **Mai segreti in chiaro** in codice, commit o documentazione. `.env`, `.mcp.json`, `.agent/` sono in `.gitignore`.
- Prima di toccare DB / auth / deploy / cancellazioni: **fermarsi e chiedere conferma**.
- **Guardrail Lens** (vedi `07`): solo prop `open`, z-index solo da token. Bloccanti in CI.

## Vincolo infrastruttura — FREE TIER
- **Supabase Free:** pausa automatica dopo ~7 giorni di inattività → keepalive attivo (vedi `06`). DB attualmente ~11 MB su ~500 MB (margine ampio). Limiti egress/progetti: vedi `06`/`08`.
- **Render Free:** servizio in sleep dopo ~15 min di inattività (cold start al primo accesso). Un solo servizio per progetto.
- Segnalare **prima** di implementare se una feature rischia di avvicinare i limiti free.

## Avvio locale
- `npm run dev:5001` → app su **porta 5001** (preferito). Default `npm run dev` → porta 3000.
- Legge `.env` via `tsx --env-file=.env`.
