# Known Risks & Improvements

## Advisory issues

- Env variable dependencies: `DATABASE_URL` deve essere configurato in ambienti reali (Supabase)
- Session persistence: sessione attualmente in-memory (sessionStorage), non persiste across reload
- Pagella authorization: hardcoded check per DERO/TOMMY (dovrebbe essere role-based)
- Health endpoint: rate limiting in-memory (perde stato su restart)

## Incremental improvements

- Considerare localStorage per session persistence (con expiry)
- Refactor modali per usare BaseModal contract uniformemente (già parzialmente fatto)
- Estendere coverage E2E oltre search overlay (voting flow, admin flow)
- Ottimizzare bundle size ulteriormente se necessario (attualmente ~300KB)
- Role-based authorization per pagella (invece di hardcoded names)
- Distributed rate limiting per health endpoint (Redis-based)
- Add request validation middleware centralizzato
- Implementare API rate limiting per tutti gli endpoint
- Add response caching per GET endpoints statici
- Implementare audit logging per admin actions

## Rischi attuali noti

1. Advisory moderate su catena `vite/esbuild`
   - non bloccanti per policy `audit-level=high`
   - upgrade completo richiede valutazione breaking changes

2. Dipendenza da variabili env corrette
   - configurazioni DB mancanti impediscono bootstrap server

3. Persistenza sessione e callback globali
   - alcune parti usano stato globale browser (`window` callback admin)
   - mantenere attenzione su cleanup e collisioni naming

## Migliorie consigliate (incrementali)

1. Programmare upgrade controlled di Vite/esbuild
2. Centralizzare validazioni env al bootstrap
3. Rafforzare test E2E su flow auth/event completion
4. Aggiungere smoke test API in CI
5. Migliorare osservabilità (metriche health + error rate)

## Non obiettivo (al momento)

- refactor massivo UI/UX
- migrazione architetturale completa router/state
- redesign schema database
