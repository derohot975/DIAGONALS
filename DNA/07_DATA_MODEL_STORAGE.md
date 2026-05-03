# Data Model & Storage

## Fonte di verità

- Schema DB: `shared/schema.ts`
- Storage orchestration: `server/storage/index.ts`
- Storage façade export: `server/storage.ts`
- Pagella table separata: `server/db/pagella.ts`

## Tabelle principali

### `users`

- `id` (serial PK)
- `name` (text not null, max 10 caratteri)
- `pin` (text not null, 4 cifre lato validazione regex `/^\d{4}$/`)
- `is_admin` (boolean default false)
- `created_at` (timestamp default now)

### `wine_events`

- `id` (serial PK)
- `name` (text not null)
- `date` (text not null)
- `mode` (text not null) - modalità unica
- `status` (text default `registration`) - `registration`/`voting`/`completed`
- `voting_status` (text default `not_started`) - `not_started`/`active`/`completed`
- `created_by` (integer FK users.id not null)
- `created_at` (timestamp default now)

### `wines`

- `id` (serial PK)
- `event_id` (integer FK wine_events.id not null)
- `user_id` (integer FK users.id not null)
- `type` (text not null) - `Bianco`/`Rosso`/`Bollicina`
- `name` (text not null)
- `producer` (text not null)
- `grape` (text not null) - vitigno
- `year` (integer not null)
- `origin` (text not null)
- `price` (decimal(10,2) not null)
- `alcohol` (decimal(4,1) optional)
- `created_at` (timestamp default now)
- indice `wines_event_id_idx` su `event_id`

### `votes`

- `id` (serial PK)
- `event_id` (integer FK wine_events.id not null)
- `wine_id` (integer FK wines.id not null)
- `user_id` (integer FK users.id not null)
- `score` (decimal(3,1) not null) - supporta voti con .5 (es: 7.5)
- `created_at` (timestamp default now)

### `event_reports`

- `id` (serial PK)
- `event_id` (integer FK wine_events.id not null)
- `report_data` (text not null) - JSON stringified report
- `generated_at` (timestamp default now)
- `generated_by` (integer FK users.id not null)

### `pagella` (tabella separata)

- `id` (serial PK)
- `event_id` (integer not null, unique)
- `content` (text)
- `author_user_id` (integer)
- `updated_at` (timestamp default now)

## Schemi input (zod)

- `insertUserSchema` - omit id, createdAt
- `insertWineEventSchema` - omit id, createdAt
- `insertWineSchema` - omit id, createdAt, extend con transform alcohol (union string/number)
- `insertVoteSchema` - omit id, createdAt, extend score 1..10
- `insertEventReportSchema` - omit id, generatedAt

## Tipi condivisi

- Entità: `User`, `WineEvent`, `Wine`, `Vote`, `EventReport`
- Insert types: `InsertUser`, `InsertWineEvent`, `InsertWine`, `InsertVote`, `InsertEventReport`
- Risultati: `WineResult`, `WineResultDetailed`
- Reporting: `EventReportData`, `UserRanking`

## Storage layer backend

Composizione in `server/storage/index.ts`:

- Interface `IStorage` - definisce contract completo
- `DatabaseStorage` - implementation con 5 storage class:
  - `UserStorage` - CRUD utenti + auth via PIN
  - `EventStorage` - CRUD eventi + voting control
  - `WineStorage` - CRUD vini + search in completed events
  - `VoteStorage` - CRUD voti + upsert logic
  - `ReportStorage` - report generation + voting completion check

`storage` espone API unificata usata dai router. Questo riduce accoppiamento route->db e centralizza logica dominio.

## Pattern di accesso dati

- Route parse/validazione input (zod/drizzle-zod)
- Chiamata metodi storage
- Storage esegue query Drizzle/Postgres
- Response JSON serializzata a livello route
- Error handling centralizzato in middleware
