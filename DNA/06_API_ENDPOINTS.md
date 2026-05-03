# API Endpoints

Base path: `/api`

## Health

- `GET /health` - health check con rate limiting 100 req/15min, DB warm-up timeout 1s
- `HEAD /health` - health check leggero (solo headers)

## Auth (`/api/auth`)

- `POST /login` - login con PIN (payload: `{ pin }`)
- `POST /register` - registrazione utente (payload: `{ name, pin }`, validazione regex `/^\d{4}$/`)

## Users (`/api/users`)

- `GET /` - lista tutti gli utenti
- `GET /:id` - ottieni utente per ID
- `POST /` - crea nuovo utente (validazione zod `insertUserSchema`)
- `PUT /:id` - aggiorna utente esistente
- `DELETE /:id` - elimina utente

## Events (`/api/events`)

- `GET /` - lista tutti gli eventi
- `GET /:id` - ottieni evento per ID
- `POST /` - crea nuovo evento (verifica esistenza user `createdBy`)
- `PATCH /:id` - aggiorna evento (validazione zod `insertWineEventSchema.partial()`)
- `PATCH /:id/status` - aggiorna stato evento (`registration`/`voting`/`completed`)
- `PATCH /:id/voting-status` - aggiorna voting status (`not_started`/`active`/`completed`)
- `DELETE /:id` - elimina evento
- `GET /:id/voting-status` - ottieni voting status corrente
- `GET /:id/voting-complete` - verifica se votazioni completate (con dettagli missing votes)
- `GET /:eventId/wines` - ottieni vini per evento
- `GET /:eventId/votes` - ottieni voti per evento
- `GET /:eventId/results` - calcola risultati evento con ranking (ROUNDING_PRECISION=100)
- `GET /:eventId/participants` - ottieni partecipanti evento con registration date
- `DELETE /:eventId/participants/:userId` - rimuovi partecipante (cascata delete vino + voti)

## Wines (`/api/wines`)

- `GET /` - lista tutti i vini (supporta query `eventId` per filtro)
- `GET /search` - ricerca vini eventi completati (query `q`, `limit`, `offset`; early return 204 per query < 2 caratteri)
- `POST /` - crea nuovo vino (transform `alcohol`/`price` number->string per compatibilità)
- `PUT /:id` - aggiorna vino esistente (schema update custom con transform fields)
- `GET /:wineId/votes` - ottieni voti per vino

## Votes (`/api/votes`)

- `GET /all` - ottieni tutti i voti
- `GET /` - ottieni voti per evento (query `eventId` obbligatorio)
- `POST /` - crea/aggiorna voto (upsert: se esiste già voto user->wine, update; altrimenti create)

## Reports/Pagella (`/api/events` via reports router)

- `GET /:id/pagella` - ottieni pagella evento (leggibile da tutti)
- `PUT /:id/pagella` - aggiorna pagella evento (solo DERO/TOMMY autorizzati via `canEditPagella`)
- `POST /:id/complete` - completa evento e genera report (verifica voting complete, calcola rankings, salva `event_reports`)
- `GET /:id/report` - ottieni report evento generato

## Note endpoint governance

- Routing centralizzato in `server/routes/index.ts` (8 router dominio + reports router)
- Endpoint reports montati sotto `/api/events` per coerenza dominio
- Validazione input tramite zod/drizzle-zod e parse lato route
- Server-Timing headers abilitati per endpoint wines/search con monitoring query > 500ms
- Error handling centralizzato in `server/index.ts` con shape standardizzata `{ ok: false, error: { code, message, stack? } }`
