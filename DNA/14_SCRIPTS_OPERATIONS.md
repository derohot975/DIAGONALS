# Scripts & Operations

## Scripts NPM principali

- `dev` / `dev:5001` - avvio sviluppo (tsx --env-file=.env server/index.ts)
- `build` - build client + bundle server (vite build + esbuild server/index.ts)
- `start` - run produzione (node dist/index.js)
- `check` - typecheck TS (tsc)
- `lint` / `lint:fix` - ESLint 9.39.4 flat config
- `format:check` / `format:write` - Prettier 3.8.3
- `quality:deadcode` - knip 5.88.1 dead code detection
- `security:audit` - audit npm livello high
- `test:e2e`, `test:e2e:ui`, `test:e2e:headed` - Playwright 1.55.1
- `test:all` - chain di quality + e2e (check + lint + build + guard:lens + test:e2e)
- `db:push` - drizzle schema push
- `backup`, `backup:list`, `backup:restore` - sistema backup automatico

## Scripts folder

### `backup-system.js`

- `create` -> crea archivio `.tar.gz` con formato ddMMyyyy_HHmm
- `list` -> lista backup ordinati per data (più recente prima)
- `restore` -> preview restore (mostra primi 20 file contenuti)
- `restore-confirm` -> restore effettivo
- include policy rotazione backup (mantiene ultimi 3)
- verifica integrità archivio con `tar -tzf` prima di commit
- include pattern: client/, server/, shared/, scripts/, DNA/, public/, .github/, config files, .env.development
- exclude patterns: node_modules, .git, dist, .cache, .vite, Backup_Automatico, .env.local

### `generate-icons.js` / `update-pwa-icons.js`

- gestione asset icone PWA (96x96, 144x144, 192x192, 512x512)
- dipendenza opzionale: `canvas` (optionalDependencies in package.json)
- update-pwa-icons.js aggiunge timestamp per cache busting

### `post-build.js`

- hook post-build per task finali
- eseguito automaticamente dopo `vite build`

### `START_DEV.sh`

- helper shell per avvio locale con verifiche env

## Guardrails custom

- `guard:lens:props` blocca prop visibilità non standard (`isOpen/visible`)
- `guard:lens:zindex` blocca z-index arbitrarie in aree lens/ui (deve usare token da styles/tokens/zIndex.ts)
- entrambi inclusi in `test:all` e nel workflow CI
