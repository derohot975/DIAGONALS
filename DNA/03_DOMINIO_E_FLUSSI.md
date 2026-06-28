# 03 — Dominio & Flussi

Logiche di dominio non ovvie dal codice. API complete: `server/routes/*` (montaggio in `server/routes/index.ts`). Base path `/api`.

## Regole di dominio (le cose da NON sbagliare)
- **PIN auth:** login/registrazione via PIN **4 cifre** (regex `/^\d{4}$/`). Nome max 10 caratteri, unico. Nessuna password.
- **Ruoli:** flag `is_admin` su `users`. Solo admin crea/gestisce eventi.
- **Stato evento:** `status` ∈ `registration`/`voting`/`completed`; `voting_status` ∈ `not_started`/`active`/`completed`. Sono due assi distinti.
- **Tipi vino:** `Bianco`/`Rosso`/`Bollicina`.
- **Voto:** score numerico **1–10 con supporto .5** (colonna `decimal(3,1)`). Upsert: se esiste già voto utente→vino, aggiorna; altrimenti crea.
- **Risultati:** ranking calcolato con `ROUNDING_PRECISION = 100`.
- **Pagella:** editabile **solo da DERO e TOMMY** — check `canEditPagella` (autorizzazione **hardcoded per nome**, non role-based: vedi rischio in `08`). Lettura libera.
- **Completamento evento:** `POST /:id/complete` verifica voti completi, calcola ranking, salva `event_reports`.

## Flusso evento (alto livello)
1. Admin crea evento (verifica esistenza user `createdBy`).
2. Utenti registrano vini sull'evento.
3. Admin attiva voting (`status → voting`, `voting_status → active`).
4. Utenti votano (`SimpleVotingScreen`).
5. Admin verifica completamento (`/:id/voting-complete`, riporta voti mancanti).
6. Admin completa evento → genera report.
7. Tutti vedono risultati/pagella.

## Endpoint con comportamenti speciali
- `GET /api/wines/search` — ricerca vini in **eventi completati**; early return **204** per query < 2 caratteri; `Server-Timing` headers per query lente (>500ms).
- `GET /api/health` — vedi `05` (rate limiting, warm-up DB, sempre 200 per uptime monitor).
- Reports/pagella montati sotto `/api/events` (router `reports`), non sotto un prefisso separato.
- `DELETE /api/events/:eventId/participants/:userId` — rimozione partecipante a **cascata** (vino + voti).

## Search Lens (sottosistema con guardrail)
Overlay di ricerca cross-screen per vini di eventi completati (`GlobalWineSearchOverlay`, `SearchOverlayContext`). Soggetto ai guardrail Lens (vedi `07`): prop visibilità solo `open`, z-index solo da token.

## UX
Mobile-first, bottom navigation condivisa, modal-driven per le azioni, gestione safe-area iOS. Tema glass/bordeaux.
