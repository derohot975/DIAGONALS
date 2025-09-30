# Pagella condivisa — Guida rapida

## Funzionalità
- **Lettura**: tutti gli utenti autenticati vedono la Pagella dell'evento (`GET /api/events/:id/pagella`)
- **Scrittura**: solo admin (o owner evento, se collegato) possono pubblicare (`PUT /api/events/:id/pagella`)
- **Bozza locale**: la pagina mantiene una bozza in `localStorage` come backup (non condivisa)
- **Tabella**: `event_pagella` è creata automaticamente all'avvio se non esiste

## Comportamento
1. **Caricamento**: Prima carica dal server, se vuoto fallback su bozza locale
2. **Auto-save**: Bozza salvata automaticamente in localStorage ogni 300ms
3. **Salvataggio**: 
   - Admin → Pubblica per tutti + salva bozza locale
   - Utente normale → Solo bozza locale + messaggio informativo
   - Offline → Solo bozza locale

## API Endpoints
- `GET /api/events/:id/pagella` - Lettura (tutti gli utenti autenticati)
- `PUT /api/events/:id/pagella` - Scrittura (solo admin)

## Database
```sql
CREATE TABLE IF NOT EXISTS event_pagella (
  event_id INTEGER PRIMARY KEY,
  content  TEXT NOT NULL,
  author_user_id INTEGER,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Permessi
- **Lettura**: Richiede autenticazione (middleware `requireAuth`)
- **Scrittura**: Solo `user.isAdmin = true`
- **Estendibile**: Aggiungere controllo owner evento in `canEditPagella()`
