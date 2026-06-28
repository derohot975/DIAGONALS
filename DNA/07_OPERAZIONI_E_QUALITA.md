# 07 — Operazioni & Qualità

Elenco completo script: `package.json`. Qui solo ciò che serve sapere per operare in sicurezza.

## Gate qualità (locali e CI)
- `npm run check` — TypeScript strict (tsc).
- `npm run lint` / `lint:fix` — ESLint flat config.
- `npm run format:check` / `format:write` — Prettier.
- `npm run quality:deadcode` — Knip (dead code).
- `npm run security:audit` — `npm audit` livello high (advisory moderate non bloccanti).
- `npm run build` — Vite (client) + esbuild (server).
- `npm run guard:lens` — guardrail Lens (vedi sotto), **bloccante in CI**.
- `npm run test:e2e` (+ `:ui`, `:headed`) — Playwright.
- `npm run test:all` — catena: check + lint + build + guard:lens + test:e2e.

CI (`render-deploy.yml`) esegue: `npm ci` → check → lint → guard:lens → build → verifica artefatti.

## Guardrail Lens (regola non negoziabile)
- `guard:lens:props` — blocca prop visibilità non standard (`isOpen`/`visible`): usare **solo `open`** (boolean).
- `guard:lens:zindex` — blocca z-index arbitrari nelle aree `search`/`ui`: usare **solo token** da `client/src/styles/tokens/zIndex.ts`.
- Entrambi in `test:all` e in CI. Violarli rompe la pipeline.

## E2E
- Config `playwright.config.ts` (porta 5001, multi-browser + mobile), spec in `e2e/`. Webserver auto-start.
- Isolamento: i test usano mock di rete (`e2e/helpers/mockApi.ts`) e sessione finta (`e2e/helpers/session.ts`) — **nessuna scrittura sul DB reale**.
- Coverage: boot/navigazione, auth (keypad PIN), flussi post-login (lista eventi, admin), search lens, resa mobile/desktop, regressione visiva (snapshot baseline versionati).
- Output `playwright-report/` e `test-results/` sono **gitignored** (non versionare); gli snapshot di riferimento sì.

## Backup
- `npm run backup` / `backup:list` / `backup:restore` — `scripts/backup-system.js`, archivi `.tar.gz`, rotazione ultimi 3, verifica integrità (`tar -tzf`).
- Gli archivi locali (`Backup_Automatico/`, `*.tar.gz`) sono **gitignored**. Il backup reale del codice è git + remote `gitsafe-backup`.

## Altri script
- `db:push` — push schema Drizzle.
- `scripts/generate-icons.js` — genera favicon (tab) e icone home/PWA da due sorgenti `.webp` in `client/public/` (cartella servita da Vite, root=client), ottimizzate con `pngquant` (dipendenze: `canvas`, `sips` nativo, `pngquant`). `post-build.js` ricopia gli asset PWA da `client/public/` a `dist/public/`.
- `scripts/post-build.js` — task post-build.

## Keepalive Supabase
Workflow schedulato esterno — gestione e verifica in `06`.
