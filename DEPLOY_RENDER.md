# 🚀 Guida Deploy su Render - DIAGONALE

Questa guida ti mostrerà come fare il deploy dell'applicazione DIAGONALE su Render in modo semplice e veloce.

## Prerequisiti

1. **Account Render**: Crea un account gratuito su [render.com](https://render.com)
2. **Repository GitHub**: Il tuo codice deve essere su GitHub
3. **Codice funzionante**: Assicurati che l'app funzioni localmente con `npm run dev`

## Passi per il Deploy

### 1. Preparazione Repository GitHub

Assicurati che il tuo repository GitHub contenga:
- `package.json` con script corretti
- `render.yaml` (opzionale ma consigliato)
- Codice completo dell'applicazione DIAGONALE
- File README.md con documentazione

### 2. Connessione GitHub a Render

1. **Accedi a Render**: Vai su [render.com](https://render.com) e accedi
2. **Nuovo Web Service**: Clicca "New" → "Web Service"
3. **Connetti GitHub**: Seleziona "GitHub" e autorizza Render ad accedere ai tuoi repository
4. **Seleziona Repository**: Scegli il repository DIAGONALE dalla lista

### 3. Configurazione Web Service

Usa queste impostazioni:

**Configurazione Base:**
- **Name**: `diagonale-wine-app` (o nome a tua scelta)
- **Region**: `Frankfurt (EU Central)` (consigliato per l'Italia)
- **Branch**: `main` (o il tuo branch principale)
- **Runtime**: `Node`

**Comandi Build:**
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

**Configurazione Avanzata:**
- **Instance Type**: `Free` (per iniziare)
- **Auto-Deploy**: `Yes` (deploy automatico ad ogni push)

### 4. Variabili d'Ambiente

Aggiungi queste variabili nella sezione "Environment":

```
NODE_ENV=production
PORT=10000
```

**Opzionale (se usi database PostgreSQL):**
```
DATABASE_URL=postgresql://username:password@hostname:port/database
```

### 5. Deploy

1. **Avvia Deploy**: Clicca "Create Web Service"
2. **Attendi Build**: Il primo deploy può richiedere 5-10 minuti
3. **Verifica**: Controlla i log per errori
4. **Testa**: Apri l'URL generato da Render

## Configurazione Avanzata

### Database PostgreSQL su Render

Se vuoi usare un database PostgreSQL:

1. **Crea Database**: In Render, clicca "New" → "PostgreSQL"
2. **Configura**: 
   - Name: `diagonale-db`
   - Region: Stessa del web service
   - Plan: `Free`
3. **Ottieni URL**: Copia l'URL di connessione
4. **Aggiungi Variabile**: Incolla l'URL in `DATABASE_URL`

### Domini Personalizzati

Per usare il tuo dominio:

1. **Impostazioni Service**: Vai nelle impostazioni del tuo web service
2. **Custom Domains**: Clicca "Add Custom Domain"
3. **Inserisci Dominio**: Aggiungi il tuo dominio (es. `diagonale.tuodominio.it`)
4. **Configura DNS**: Punta il tuo dominio ai server Render

## Troubleshooting

### Errori Comuni

**Build Failed:**
```bash
# Controlla che package.json abbia gli script corretti
"scripts": {
  "build": "vite build && esbuild server/index.ts --bundle --platform=node --target=node18 --outfile=dist/index.js --external:express --external:ws",
  "start": "NODE_ENV=production node dist/index.js"
}
```

**App non si avvia:**
- Verifica che la PORT sia impostata correttamente
- Controlla i log per errori specifici
- Assicurati che tutte le dipendenze siano in `dependencies`, non `devDependencies`

**Database non funziona:**
- Verifica che `DATABASE_URL` sia configurata correttamente
- Controlla che il database sia nella stessa regione del web service

### Controllo Log

Per vedere i log:
1. Vai nel tuo service su Render
2. Clicca tab "Logs"
3. Filtra per tipo di log se necessario

## Monitoraggio

### Salute dell'App

Render monitora automaticamente:
- **Health Checks**: Verifica che l'app risponda
- **Restart automatico**: Se l'app crasha, viene riavviata
- **Metriche**: CPU, memoria, traffico

### Notifiche

Configura notifiche per:
- Deploy completati
- Errori dell'applicazione
- Downtime

## Sicurezza

### HTTPS

Render fornisce automaticamente:
- **Certificato SSL**: Gratuito e automatico
- **HTTPS**: Tutto il traffico è crittografato
- **Redirect**: HTTP → HTTPS automatico

### Variabili Sicure

- **Environment Variables**: Sono crittografate
- **Non commitare**: Mai committare chiavi API nel codice
- **Rotazione**: Cambia periodicamente le chiavi

## Costi

### Piano Free

Include:
- **750 ore/mese**: Web service
- **100 GB bandwidth**: Traffico
- **Sleep dopo inattività**: 15 minuti
- **Riavvio lento**: Può richiedere 30 secondi

### Piano a Pagamento

Vantaggi:
- **Sempre attivo**: Nessun sleep
- **Più risorse**: CPU e memoria
- **Supporto prioritario**: Assistenza più veloce

## Workflow GitHub

### Auto-Deploy da GitHub

Con auto-deploy attivo (consigliato):
1. **Push al repository GitHub**: Fai commit e push delle modifiche
2. **Webhook automatico**: GitHub notifica automaticamente Render
3. **Build automatico**: Render avvia il build del nuovo codice
4. **Deploy automatico**: La nuova versione viene deployata automaticamente

### Deploy Manuale

Se preferisci controllo manuale:
1. **Disattiva auto-deploy**: Nelle impostazioni del service
2. **Deploy manuale**: Usa "Manual Deploy" dal dashboard Render
3. **Scegli branch**: Puoi selezionare un branch specifico da GitHub

### Gestione Branch

**Branch principale (main/master):**
- Configura Render per monitorare il branch `main`
- Ogni push su `main` triggerà un deploy automatico

**Branch di sviluppo:**
- Crea un branch `develop` per test
- Configura un service separato per staging se necessario
- Merge su `main` solo quando pronto per produzione

## Backup

### Codice

Il codice è automaticamente salvato nel tuo repository Git.

### Database

Se usi PostgreSQL su Render:
- **Backup automatici**: Giornalieri per 7 giorni
- **Backup manuali**: Disponibili quando necessario
- **Restore**: Possibile dal dashboard Render

## Supporto

### Risorse Utili

- **Documentazione**: [render.com/docs](https://render.com/docs)
- **Community**: Forum e Discord ufficiali
- **Status**: [status.render.com](https://status.render.com)

### Debug

Per problemi:
1. Controlla log dell'applicazione
2. Verifica configurazione
3. Testa localmente prima
4. Contatta supporto Render se necessario

---

🍷 **Buon deploy con DIAGONALE!**

Una volta completato il deploy, la tua app sarà disponibile 24/7 e accessibile da qualsiasi dispositivo per le tue degustazioni di vino.