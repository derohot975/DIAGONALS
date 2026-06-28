# 04 — Dati & Storage

## Fonte di verità
- Schema gestito: `shared/schema.ts` (Drizzle).
- Tabella `pagella`: definita a parte in `server/db/pagella.ts`, creata via SQL raw al bootstrap (`ensurePagellaTable`).
- Storage layer: `server/storage/*` (orchestratore `index.ts`, façade `server/storage.ts`).

## Tabelle gestite dal codice (Drizzle, `shared/schema.ts`)
- `users` — id, name (≤10), pin (4 cifre), is_admin, created_at.
- `wine_events` — id, name, date, mode, status, voting_status, created_by (FK users), created_at.
- `wines` — id, event_id (FK), user_id (FK), type, name, producer, grape, year, origin, price `decimal(10,2)`, alcohol `decimal(4,1)` opzionale, created_at. Indice su `event_id`.
- `votes` — id, event_id (FK), wine_id (FK), user_id (FK), score `decimal(3,1)`, created_at.
- `event_reports` — id, event_id (FK), report_data (JSON stringificato), generated_at, generated_by (FK users).
- `pagella` (SQL raw) — id, event_id (unique), content, author_user_id, updated_at.

> Dettaglio colonne/tipi sempre verificabile in `shared/schema.ts` — qui solo l'essenziale e le scelte non ovvie (es. score decimale per i .5).

## ⚠️ Divergenza DB reale vs codice (DA TENERE PRESENTE)
Il database Supabase contiene anche tabelle **non gestite dal codice attuale**: `one_time_tokens`, `refresh_tokens`, `migrations`, e una `wines` con eventuali colonne extra. Sono **residui di un sistema auth precedente** (token-based). Il codice attuale usa solo auth PIN. Non rimuoverle senza verifica. Vedi `08`.

## Schemi input (zod / drizzle-zod)
`insertUserSchema`, `insertWineEventSchema`, `insertWineSchema` (transform alcohol string/number), `insertVoteSchema` (score 1..10), `insertEventReportSchema`. Omettono id/timestamp.

## Storage layer
`DatabaseStorage` implementa l'interfaccia `IStorage` componendo 5 classi: `UserStorage`, `EventStorage`, `WineStorage` (include search in eventi completati), `VoteStorage` (upsert), `ReportStorage` (report + check completamento). I router chiamano lo storage, mai il DB diretto: l'accoppiamento route→db è centralizzato qui.
