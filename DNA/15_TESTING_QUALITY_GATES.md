# Testing & Quality Gates

## Gate locali

- `npm run check` - TypeScript strict mode (tsc, 0 errori)
- `npm run lint` - ESLint 9.39.4 flat config (0 errori)
- `npm run format:check` - Prettier 3.8.3
- `npm run quality:deadcode` - Knip 5.88.1 dead code detection
- `npm run security:audit` - audit npm livello high (advisory moderate non bloccanti)
- `npm run build` - Vite 5.4.19 + esbuild 0.25.6
- `npm run guard:lens` - props + zindex guardrails
  - `guard:lens:props` - blocca `isOpen`/`visible` props
  - `guard:lens:zindex` - blocca z-index arbitrarie
- `npm run test:e2e` - Playwright 1.55.1 E2E tests
- `npm run test:e2e:ui` - Playwright UI mode
- `npm run test:e2e:headed` - Playwright headed mode
- `npm run test:all` - chain completa (check + lint + build + guard:lens + test:e2e)

## CI quality gates

Workflow GitHub Actions (`.github/workflows/render-deploy.yml`):

1. `npm ci` - clean install
2. `npm run check` - typecheck
3. `npm run lint` - lint
4. `npm run guard:lens` - guardrails lens
5. `npm run build` - build
6. Verify artifacts (dist/index.js, dist/public)
7. Deploy Render via API

## E2E testing

- Playwright config: `playwright.config.ts`
- Test specs: `e2e/search-overlay.spec.ts`
- Webserver: auto-start per E2E tests
- Report: `playwright-report/` (non versionato)
- Test results: `test-results/`

## Stato release

- TypeScript: 0 errori (strict mode abilitato)
- ESLint: 0 errori (flat config)
- Build: successo (bundle ottimizzato)
- Dead code: 0 issues (Knip)
- Security: 0 high vulnerabilities (advisory moderate non bloccanti)
- E2E: base coverage (search overlay) in verde
- nessun errore TypeScript
- build artifact consistente
- route API core rispondono correttamente
