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

### Database
- **Supabase** per dati in sola lettura
- **PostgreSQL** con Row Level Security (RLS)
- **Accesso guest** senza autenticazione persistente

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
# Build frontend statico per Netlify
npm run build:frontend
```

## Deploy

### Deploy su Netlify (Raccomandato)

1. **Collega Repository**: Collega il repository GitHub a Netlify
2. **Configurazione Build**:
   - **Build Command**: `npm run build:frontend`
   - **Publish Directory**: `dist/public`
   - **Node Version**: 18+

3. **Variabili d'Ambiente**:
   - `VITE_SUPABASE_URL`: URL del progetto Supabase
   - `VITE_SUPABASE_ANON_KEY`: Chiave anonima Supabase
   - `VITE_ENABLE_SW`: `false` (disabilita service worker)

4. **Auto-Deploy**: Abilita auto-deploy dal branch main

### Limitazioni Modalità Guest

**Funzionalità Read-Only**:
- Visualizzazione dati (utenti, eventi, vini)
- Navigazione completa dell'interfaccia
- Accesso a tutte le pagine

**Funzionalità Disabilitate**:
- Creazione/modifica utenti ed eventi
- Registrazione vini e votazioni
- Operazioni di scrittura sul database
## Configurazione Supabase

### Setup Database
1. **Crea progetto Supabase**: Vai su [supabase.com](https://supabase.com)
2. **Crea tabelle**:
   - `users` (id, name, pin, is_admin, created_at)
   - `wine_events` (id, name, date, mode, status, created_by)
   - `vini` (id, event_id, user_id, type, name, producer, etc.)

3. **Configura RLS**: Abilita Row Level Security per accesso read-only
4. **Ottieni credenziali**: URL progetto e chiave anonima

### Variabili d'Ambiente
- `VITE_SUPABASE_URL`: URL del progetto Supabase
- `VITE_SUPABASE_ANON_KEY`: Chiave anonima per accesso read-only
- `VITE_ENABLE_SW`: `false` (disabilita service worker)

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