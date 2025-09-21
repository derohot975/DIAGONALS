
# 📊 Database Schema & API Endpoints

**Ultimo aggiornamento:** 21 Settembre 2025  
**Versione:** v1.0.0 - Schema stabile  
**Database:** PostgreSQL + Drizzle ORM

## 🗄️ Database Schema

### Tables Overview

#### `users`
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  pin TEXT NOT NULL,           -- 4-digit PIN for authentication
  is_admin BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

#### `wine_events`
```sql
CREATE TABLE wine_events (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  date TEXT NOT NULL,
  mode TEXT NOT NULL,          -- 'CIECA' or 'CIECONA'
  status TEXT DEFAULT 'registration' NOT NULL,  -- 'registration', 'voting', 'completed'
  voting_status TEXT DEFAULT 'not_started' NOT NULL,  -- 'not_started', 'active', 'completed'
  created_by INTEGER REFERENCES users(id) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

#### `wines`
```sql
CREATE TABLE wines (
  id SERIAL PRIMARY KEY,
  event_id INTEGER REFERENCES wine_events(id) NOT NULL,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  type TEXT NOT NULL,          -- 'Bianco', 'Rosso', 'Bollicina'
  name TEXT NOT NULL,
  producer TEXT NOT NULL,
  grape TEXT NOT NULL,         -- Vitigno
  year INTEGER NOT NULL,
  origin TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  alcohol DECIMAL(4,1),        -- Optional alcohol content
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

#### `votes`
```sql
CREATE TABLE votes (
  id SERIAL PRIMARY KEY,
  event_id INTEGER REFERENCES wine_events(id) NOT NULL,
  wine_id INTEGER REFERENCES wines(id) NOT NULL,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  score DECIMAL(3,1) NOT NULL, -- Supports .5 votes (e.g., 7.5)
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

#### `event_reports`
```sql
CREATE TABLE event_reports (
  id SERIAL PRIMARY KEY,
  event_id INTEGER REFERENCES wine_events(id) NOT NULL,
  report_data TEXT NOT NULL,   -- JSON stringified report
  generated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  generated_by INTEGER REFERENCES users(id) NOT NULL
);
```

## 🔗 Relazioni

- **User → Events**: Un utente può creare molti eventi (1:N)
- **Event → Wines**: Un evento può avere molti vini (1:N)
- **User → Wines**: Un utente può registrare un vino per evento (1:1 per evento)
- **User + Wine → Vote**: Un utente può votare ogni vino una sola volta (1:1)
- **Event → Report**: Un evento può avere un solo report finale (1:1)

## 🌐 API Endpoints

### Users
```
GET    /api/users              - Ottieni tutti gli utenti
POST   /api/users              - Crea nuovo utente
GET    /api/users/:id          - Ottieni utente per ID
PUT    /api/users/:id          - Aggiorna utente
DELETE /api/users/:id          - Elimina utente
```

### Authentication
```
POST   /api/auth/login         - Login con PIN
POST   /api/auth/register      - Registrazione utente
```

### Events
```
GET    /api/events             - Ottieni tutti gli eventi
POST   /api/events             - Crea nuovo evento
GET    /api/events/:id         - Ottieni evento per ID
PATCH  /api/events/:id         - Aggiorna evento
DELETE /api/events/:id         - Elimina evento
PATCH  /api/events/:id/status  - Aggiorna stato evento
PATCH  /api/events/:id/voting-status - Gestisci stato votazioni
```

### Wines
```
GET    /api/wines              - Ottieni tutti i vini
GET    /api/events/:eventId/wines - Ottieni vini per evento
POST   /api/wines              - Registra nuovo vino
PUT    /api/wines/:id          - Aggiorna vino esistente
```

### Votes
```
GET    /api/events/:eventId/votes - Ottieni voti per evento
POST   /api/votes              - Invia/aggiorna voto
GET    /api/wines/:wineId/votes - Ottieni voti per vino specifico
```

### Results & Reports
```
GET    /api/events/:eventId/results - Ottieni risultati evento
POST   /api/events/:id/complete     - Completa evento e genera report
GET    /api/events/:id/report       - Ottieni report evento
GET    /api/events/:id/voting-complete - Verifica completamento votazioni
```

## 📝 Esempi d'uso

### Registrazione Utente
```json
POST /api/auth/register
{
  "name": "Marco",
  "pin": "1234"
}
```

### Creazione Evento
```json
POST /api/events
{
  "name": "Diagonale di Primavera",
  "date": "2024-03-15",
  "mode": "CIECA",
  "createdBy": 1
}
```

### Registrazione Vino
```json
POST /api/wines
{
  "eventId": 1,
  "userId": 2,
  "type": "Rosso",
  "name": "Barolo Brunate",
  "producer": "Giuseppe Mascarello",
  "grape": "Nebbiolo",
  "year": 2018,
  "origin": "Piemonte",
  "price": "45.00",
  "alcohol": "14.5"
}
```

### Votazione
```json
POST /api/votes
{
  "eventId": 1,
  "wineId": 3,
  "userId": 2,
  "score": 8.5
}
```

## 🛠️ Validazioni

### Zod Schemas
- `insertUserSchema`: Valida nome (max 10 char) e PIN (4 cifre)
- `insertWineEventSchema`: Valida nome, data, modalità
- `insertWineSchema`: Valida tutti i campi vino con trasformazioni
- `insertVoteSchema`: Valida score (1-10 con decimali .5)

### Constraint Database
- PIN utente deve essere univoco
- Nome utente deve essere univoco
- Un utente può registrare solo un vino per evento
- Score voto deve essere tra 1.0 e 10.0
