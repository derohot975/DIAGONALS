# DNA Index

## Scopo
Questa cartella contiene la mappa operativa completa di `DIAGONALS` aggiornata allo stato reale del codice.

## Stato aggiornamento
- Data aggiornamento: 2026-05-04 (ultimo aggiornamento completo)
- Fonte: codice runtime/build/test corrente (frontend, backend, CI, scripts)
- Ambito: architettura, flussi, API, storage, sicurezza, qualità, deploy, rischi

## File presenti
1. `01_DNA_INDEX.md` - indice e linee d'uso
2. `02_PROJECT_SUMMARY.md` - quadro generale prodotto e stack
3. `03_CURRENT_STATE.md` - stato attuale operativo e qualità
4. `04_REPOSITORY_MAP.md` - mappa cartelle/file principali
5. `05_RUNTIME_SEQUENCES.md` - sequenze runtime client/server
6. `06_API_ENDPOINTS.md` - endpoint REST consolidati
7. `07_DATA_MODEL_STORAGE.md` - modello dati Drizzle + repository layer
8. `08_AUTH_SECURITY_LOGGING.md` - autenticazione, hardening, logging
9. `09_APP_ORCHESTRATION.md` - orchestrazione App React
10. `10_SCREENS_FLOWS.md` - schermate e flussi UX
11. `11_MODALS_HOOKS_HANDLERS.md` - modali, hooks e handlers
12. `12_ENVIRONMENTS_SECRETS.md` - ambienti, variabili e policy secrets
13. `13_SUPABASE_GITHUB_RENDER.md` - integrazione DB/CI/deploy
14. `14_SCRIPTS_OPERATIONS.md` - scripts operativi e runbook
15. `15_TESTING_QUALITY_GATES.md` - test e gate qualità
16. `16_KNOWN_RISKS_IMPROVEMENTS.md` - rischi e backlog tecnico
17. `17_E2E_LENS_ARCHIVE_NOTE.md` - nota su lens guardrail e archivi e2e

## Regole di manutenzione DNA
- Aggiornare la documentazione dopo modifiche strutturali (API/schema/scripts/CI).
- Non usare descrizioni teoriche: riportare solo ciò che è verificabile nel codice.
- In caso di divergenza tra DNA e codice, il codice è fonte di verità.
- Ogni file deve mantenere sezioni: **stato**, **fatti verificati**, **impatti**.
