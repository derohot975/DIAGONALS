# E2E Lens Archive Note

## Contesto

Il progetto integra guardrail e test per il Search Lens overlay, con policy esplicite su:

- naming prop visibilità (`open`)
- policy z-index tramite token centralizzati

## Guardrails e test per Search Lens overlay

- Guard `guard:lens:props` blocca prop visibilità non standard (`isOpen`/`visible`)
- Guard `guard:lens:zindex` blocca z-index arbitrarie in aree lens/ui
- Entrambi i guard sono inclusi in `npm run guard:lens` e nel workflow CI

## Naming e z-index policy

- Usare solo prop `open` per visibilità modali (BaseModal contract)
- Usare solo token da `styles/tokens/zIndex.ts` per z-index
- Evitare hardcoded z-index values in componenti search/ui

## E2E test configuration

- Playwright config: `playwright.config.ts`
- Test spec: `e2e/search-overlay.spec.ts`
- Webserver: auto-start per E2E tests
- Test modes: standard, UI mode, headed mode

## Note su archivi E2E

- Report E2E in `playwright-report/` (non versionato, .gitignored)
- Test results in `test-results/` (non versionato, .gitignored)
- Cleanup archivi report periodicamente per ridurre repo size
- Archivi lens readiness in `attached_assets/DNA_ARCHIVE_REPORTS/` per tracking E2E readiness

## Nota archivio

Le vecchie cartelle report archiviate esterne al runtime sono state rimosse durante pulizia chirurgica repository.

Per nuovi report:

- usare output standard Playwright (`playwright-report/`) come artefatto temporaneo
- non versionare report generati nel repository
