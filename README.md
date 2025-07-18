# 🍷 DIAGONALE - Applicazione per Degustazioni di Vino

Una moderna applicazione web mobile-first per condurre degustazioni di vino alla cieca con supporto per le modalità CIECA (completamente alla cieca) e CIECONA (semi-alla cieca).

## Funzionalità

### Funzionalità Principali
- **Gestione Utenti**: Registrazione con ruoli amministratore
- **Creazione Eventi**: Crea eventi di degustazione con diverse modalità
- **Registrazione Vini**: I partecipanti possono registrare vini con nomi e prezzi
- **Sistema di Voto**: Punteggio numerico (1-10) con riconoscimento "lode" opzionale
- **Visualizzazione Risultati**: Classifiche e statistiche complete
- **Tracciamento Progressi**: Indicatori di progresso dei voti in tempo reale

### Caratteristiche Tecniche
- **Design Mobile-First**: Ottimizzato per dispositivi mobili con effetti glass-morphism
- **Interfaccia Italiana**: Localizzazione completa in italiano
- **Aggiornamenti in Tempo Reale**: Tracciamento progressi e aggiornamenti voti live
- **Capacità Offline**: Funziona con archiviazione locale per persistenza sessioni
- **Layout Responsivo**: Si adatta a diverse dimensioni schermo

## Stack Tecnologico

### Frontend
- **React 18** con TypeScript
- **Vite** per sviluppo veloce e build ottimizzate
- **Tailwind CSS** con stile personalizzato a tema vino
- **Radix UI** componenti con libreria shadcn/ui
- **React Query** per gestione stato server
- **Wouter** per routing leggero

### Backend
- **Express.js** con TypeScript
- **Drizzle ORM** per gestione database
- **PostgreSQL** (produzione) / Storage in memoria (sviluppo)
- **API RESTful** con gestione errori completa
- **Gestione sessioni** con archiviazione sicura

## Avvio Rapido

### Sviluppo
```bash
# Installa dipendenze
npm install

# Avvia server di sviluppo
npm run dev
```

L'applicazione sarà disponibile su `http://localhost:5000`

### Build di Produzione
```bash
# Build per produzione
npm run build

# Avvia server di produzione
npm start
```

## Deploy

### Deploy su Render

1. **Collega Repository**: Collega il tuo repository GitHub/GitLab a Render
2. **Crea Web Service**: Usa la seguente configurazione:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Node.js
   - **Port**: 5000 (auto-rilevato)

3. **Variabili d'Ambiente** (se si usa PostgreSQL):
   - `DATABASE_URL`: Stringa di connessione PostgreSQL
   - `NODE_ENV`: `production`

4. **Auto-Deploy**: Abilita auto-deploy dal branch principale

### Deploy Docker

```bash
# Build immagine Docker
docker build -t diagonale-wine-app .

# Esegui container
docker run -p 5000:5000 diagonale-wine-app
```

### Deploy Manuale

1. **Build dell'applicazione**:
   ```bash
   npm install
   npm run build
   ```

2. **Carica file** sul tuo server:
   - Directory `dist/` (applicazione compilata)
   - `package.json` e `package-lock.json`
   - `node_modules/` (o esegui `npm install --production`)

3. **Avvia l'applicazione**:
   ```bash
   NODE_ENV=production npm start
   ```

## Configurazione Database

### Sviluppo (In-Memory)
L'applicazione usa storage in memoria per default durante lo sviluppo, non richiede setup database.

### Produzione (PostgreSQL)
Per il deploy in produzione, imposta la variabile d'ambiente `DATABASE_URL`:

```
DATABASE_URL=postgresql://username:password@hostname:port/database
```

L'applicazione creerà automaticamente le tabelle necessarie all'avvio.

## Endpoint API

### Utenti
- `GET /api/users` - Ottieni tutti gli utenti
- `POST /api/users` - Crea nuovo utente
- `GET /api/users/:id` - Ottieni utente per ID

### Eventi
- `GET /api/events` - Ottieni tutti gli eventi
- `POST /api/events` - Crea nuovo evento
- `GET /api/events/:id` - Ottieni evento per ID
- `PATCH /api/events/:id/status` - Aggiorna stato evento

### Vini
- `GET /api/events/:eventId/wines` - Ottieni vini per evento
- `POST /api/wines` - Registra nuovo vino
- `PATCH /api/wines/:id/reveal` - Attiva/disattiva rivelazione vino

### Voti
- `GET /api/events/:eventId/votes` - Ottieni voti per evento
- `POST /api/votes` - Invia o aggiorna voto
- `GET /api/events/:eventId/results` - Ottieni risultati evento

## Configurazione

### Variabili d'Ambiente
- `NODE_ENV`: Imposta su `production` per deploy in produzione
- `PORT`: Porta server (default: 5000)
- `DATABASE_URL`: Stringa connessione PostgreSQL (opzionale)

### Personalizzazione
- **Colori**: Modifica variabili CSS in `client/src/index.css`
- **Stile**: Aggiorna configurazione Tailwind in `tailwind.config.ts`
- **Branding**: Cambia nome applicazione e logo nei componenti

## Linee Guida Sviluppo

### Struttura Codice
- `/client` - Applicazione frontend React
- `/server` - API backend Express
- `/shared` - Tipi TypeScript e schemi condivisi
- `/components` - Componenti React riutilizzabili organizzati per funzione

### Caratteristiche Principali
- **Type Safety**: Supporto TypeScript completo su frontend e backend
- **Validazione Dati**: Schemi Zod per controllo tipi runtime
- **Gestione Errori**: Error boundaries e gestione errori API complete
- **Performance**: Query ottimizzate e lazy loading

## Modalità Degustazione

### CIECA (Completamente alla Cieca)
- I vini sono completamente anonimi durante la degustazione
- Nomi e dettagli rivelati solo dopo la votazione
- Focus sulla valutazione del gusto puro

### CIECONA (Semi-alla Cieca)
- Alcune informazioni sui vini possono essere rivelate
- Esperienza di degustazione migliorata con contesto aggiuntivo
- Sistema di rivelazione flessibile per organizzatori

## Contribuire

1. Fai fork del repository
2. Crea un branch per la feature
3. Apporta le tue modifiche
4. Testa accuratamente
5. Invia una pull request

## Licenza

Questo progetto è concesso in licenza sotto la Licenza MIT.

## Supporto

Per problemi o domande:
1. Controlla la pagina GitHub Issues
2. Crea un nuovo issue con descrizione dettagliata
3. Includi i passi per riprodurre eventuali bug

---

Costruito con ❤️ per appassionati di vino e gruppi di degustazione.