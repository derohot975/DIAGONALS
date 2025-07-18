# 🚀 Guida Completa Deploy DIAGONALE

## Checklist Pre-Deploy

Prima di fare il deploy su Render, verifica che tutto sia pronto:

### ✅ Repository GitHub
- [ ] Codice pushato su GitHub
- [ ] Branch `main` aggiornato
- [ ] File `package.json` con script corretti
- [ ] File `render.yaml` presente (opzionale)
- [ ] File `.gitignore` aggiornato

### ✅ Test Locali
- [ ] `npm install` funziona senza errori
- [ ] `npm run dev` avvia l'applicazione
- [ ] App accessibile su `localhost:5000`
- [ ] Tutte le funzionalità funzionano correttamente

### ✅ Build di Produzione
- [ ] `npm run build` completa senza errori
- [ ] Directory `dist/` creata con file necessari
- [ ] `npm start` avvia l'app in modalità produzione

## Configurazione Render

### Impostazioni Consigliate

**Configurazione Base:**
```
Service Name: diagonale-wine-app
Region: Frankfurt (EU Central) 
Runtime: Node
Branch: main
```

**Comandi:**
```
Build Command: npm install && npm run build
Start Command: npm start
```

**Variabili d'Ambiente:**
```
NODE_ENV=production
PORT=10000
```

### Configurazione Avanzata

**Per Performance Migliorate:**
- Instance Type: `Starter` (se necessario)
- Health Check Path: `/`
- Auto-Deploy: Abilitato

**Per Database (se necessario):**
- Crea servizio PostgreSQL separato
- Aggiungi `DATABASE_URL` alle variabili d'ambiente

## Struttura File per Deploy

Il tuo repository deve avere questa struttura:

```
diagonale-wine-app/
├── client/                 # Frontend React
│   ├── src/
│   ├── index.html
│   └── ...
├── server/                 # Backend Express
│   ├── index.ts
│   ├── routes.ts
│   └── ...
├── shared/                 # Tipi condivisi
│   └── schema.ts
├── .github/               # GitHub Actions
│   └── workflows/
├── package.json           # Dipendenze e script
├── render.yaml           # Configurazione Render
├── Dockerfile            # Container (opzionale)
├── README.md            # Documentazione
└── .gitignore           # File da ignorare
```

## Processo Deploy Step-by-Step

### 1. Preparazione Repository
```bash
# Assicurati che tutto sia aggiornato
git add .
git commit -m "feat: preparazione deploy render"
git push origin main
```

### 2. Configurazione Render
1. Accedi a [render.com](https://render.com)
2. Clicca "New" → "Web Service"
3. Connetti il tuo repository GitHub
4. Seleziona "diagonale-wine-app"
5. Configura le impostazioni

### 3. Deploy Automatico
- Render inizierà il build automaticamente
- Monitora i log per eventuali errori
- Testa l'applicazione una volta deployata

## Troubleshooting

### Errori Comuni e Soluzioni

**Build Failed - Dependencies:**
```bash
# Verifica che tutte le dipendenze siano in package.json
npm install
npm run build
```

**Port Error:**
```javascript
// Assicurati che server/index.ts usi la porta corretta
const port = parseInt(process.env.PORT || '5000', 10);
```

**Static Files Non Serviti:**
```typescript
// Verifica che server/vite.ts gestisca correttamente i file statici
if (app.get("env") === "development") {
  await setupVite(app, server);
} else {
  serveStatic(app);
}
```

### Log Debugging

Se l'app non funziona:
1. Controlla i log nel dashboard Render
2. Verifica le variabili d'ambiente
3. Testa la build localmente
4. Controlla la configurazione porta

## GitHub Actions (Opzionale)

Il file `.github/workflows/render-deploy.yml` automatizza:
- Test del codice
- Build dell'applicazione
- Deploy su Render

Per attivarlo:
1. Vai su GitHub → Settings → Secrets
2. Aggiungi `RENDER_SERVICE_ID` e `RENDER_API_KEY`
3. Ogni push su `main` triggerà il deploy

## Monitoraggio Post-Deploy

### Controlli Importanti
- [ ] App risponde correttamente
- [ ] Tutte le pagine funzionano
- [ ] API endpoints rispondono
- [ ] Database connesso (se applicabile)
- [ ] SSL/HTTPS attivo

### Metriche da Monitorare
- Tempo di risposta
- Uptime
- Errori 500
- Utilizzo risorse

## Backup e Sicurezza

### Backup Codice
Il codice è automaticamente salvato su GitHub.

### Backup Database
Se usi PostgreSQL su Render:
- Backup automatici giornalieri
- Possibilità di backup manuali
- Restore dal dashboard

### Sicurezza
- HTTPS automatico
- Variabili d'ambiente crittografate
- Certificati SSL gestiti automaticamente

## Costi e Limiti

### Piano Free
- **Compute**: 750 ore/mese
- **Bandwidth**: 100 GB/mese
- **Sleep**: Dopo 15 minuti inattività
- **Cold Start**: ~30 secondi riavvio

### Piano Starter ($7/mese)
- **Sempre attivo**: Nessun sleep
- **Risorse**: CPU e RAM dedicate
- **Supporto**: Prioritario

## Domande Frequenti

**Q: Quanto tempo richiede il primo deploy?**
A: Di solito 3-5 minuti, fino a 15 minuti per progetti complessi.

**Q: Posso usare un dominio personalizzato?**
A: Sì, puoi aggiungere domini personalizzati gratuitamente.

**Q: Come aggiorno l'app?**
A: Fai semplicemente push su GitHub, deploy automatico.

**Q: Posso vedere i log in tempo reale?**
A: Sì, dal dashboard Render nella sezione "Logs".

**Q: Cosa succede se l'app crasha?**
A: Render riavvia automaticamente l'applicazione.

---

🍷 **Buon deploy con DIAGONALE!**

Una volta completato il setup, avrai un'applicazione professionale per degustazioni di vino accessible 24/7 da qualsiasi dispositivo.