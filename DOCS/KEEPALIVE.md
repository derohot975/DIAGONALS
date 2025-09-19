# DIAGONALE — KEEP-ALIVE H24 SETUP

Documentazione per mantenere il backend DIAGONALE sempre attivo tramite monitoraggio esterno.

## 🎯 OBIETTIVO

Prevenire il "cold start" del backend mantenendolo caldo 24/7 tramite ping periodici dall'esterno.

## 🔗 ENDPOINT HEALTH

### URL da Monitorare
```
https://<your-domain>/api/health?token=<ENV_KEEPALIVE_TOKEN>
```

### Esempio Response (Successo)
```json
{
  "ok": true,
  "ts": "2025-09-19T12:36:25.123Z",
  "version": "1.0.0",
  "db": {
    "ok": true,
    "ms": 23
  }
}
```

### Esempio Response (Errore Token)
```json
{
  "message": "Not found"
}
```
Status: `404` (per non esporre l'endpoint)

## ⚙️ CONFIGURAZIONE VARIABILI

### Variabili Environment Richieste

```bash
# Token di sicurezza per endpoint health (OBBLIGATORIO)
ENV_KEEPALIVE_TOKEN=your-secret-token-here

# Ping database opzionale (OPZIONALE, default: false)
KEEPALIVE_DB_PING=true
```

### Generazione Token Sicuro
```bash
# Genera token casuale (32 caratteri)
openssl rand -hex 16

# Oppure usa un UUID
uuidgen
```

## 📊 SERVIZI MONITORAGGIO CONSIGLIATI

### 1. UptimeRobot (Gratuito)
- **URL**: https://uptimerobot.com
- **Frequenza**: Ogni 5 minuti
- **Timeout**: 5 secondi
- **Alert**: Email dopo 2 fallimenti consecutivi

**Setup UptimeRobot:**
1. Crea account gratuito
2. Add New Monitor → HTTP(s)
3. URL: `https://your-domain/api/health?token=***`
4. Monitoring Interval: 5 minutes
5. Alert Contacts: La tua email

### 2. BetterStack (Freemium)
- **URL**: https://betterstack.com
- **Frequenza**: Ogni 3 minuti (piano gratuito)
- **Timeout**: 10 secondi
- **Alert**: Email/SMS/Slack

**Setup BetterStack:**
1. Registrati su BetterStack
2. Create Monitor → HTTP Monitor
3. URL: `https://your-domain/api/health?token=***`
4. Check frequency: 3 minutes
5. Expected status: 200
6. Setup notifications

### 3. GitHub Actions Cron (Gratuito)
- **Frequenza**: Ogni 5 minuti
- **Vantaggi**: Completamente gratuito, controllo totale
- **Svantaggi**: Richiede setup manuale

**Setup GitHub Actions:**

Crea `.github/workflows/keepalive.yml`:
```yaml
name: Keep Backend Alive

on:
  schedule:
    # Ogni 5 minuti, 24/7
    - cron: '*/5 * * * *'
  workflow_dispatch: # Trigger manuale

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Health Endpoint
        run: |
          response=$(curl -s -w "%{http_code}" -o /tmp/response.json \
            "https://your-domain/api/health?token=${{ secrets.KEEPALIVE_TOKEN }}")
          
          if [ "$response" = "200" ]; then
            echo "✅ Backend is alive"
            cat /tmp/response.json
          else
            echo "❌ Backend health check failed (HTTP $response)"
            cat /tmp/response.json
            exit 1
          fi
```

**Secrets GitHub:**
- Vai su Settings → Secrets and variables → Actions
- Aggiungi `KEEPALIVE_TOKEN` con il tuo token

### 4. Cron Job Server Esterno
Se hai accesso a un server Linux sempre acceso:

```bash
# Aggiungi a crontab (crontab -e)
*/5 * * * * curl -s "https://your-domain/api/health?token=your-token" > /dev/null 2>&1
```

## 🔧 CONFIGURAZIONE HOSTING

### Vercel
- **Timeout**: 10 secondi (Hobby), 60 secondi (Pro)
- **Cold Start**: ~1-3 secondi
- **Raccomandazione**: Ping ogni 3-5 minuti

### Netlify Functions
- **Timeout**: 10 secondi (gratuito), 26 secondi (Pro)
- **Cold Start**: ~2-5 secondi
- **Raccomandazione**: Ping ogni 5 minuti

### Railway
- **Timeout**: 30 secondi
- **Cold Start**: ~5-10 secondi
- **Raccomandazione**: Ping ogni 5-10 minuti

### Render
- **Timeout**: 30 secondi
- **Cold Start**: ~10-30 secondi (piano gratuito)
- **Raccomandazione**: Ping ogni 5 minuti

## 📈 MONITORAGGIO E ALERT

### Metriche da Monitorare
- **Response Time**: < 5 secondi (normale), > 10 secondi (alert)
- **Success Rate**: > 95% (normale), < 90% (alert)
- **DB Response**: < 50ms (normale), > 100ms (warning)

### Setup Alert Intelligenti
```bash
# Alert se 2+ fallimenti consecutivi
# Alert se response time > 10 secondi per 3+ volte
# Alert se success rate < 90% in 1 ora
```

### Dashboard Consigliato
- **Grafana Cloud** (gratuito fino a 10k metriche)
- **DataDog** (gratuito fino a 5 host)
- **New Relic** (gratuito fino a 100GB/mese)

## 🚨 TROUBLESHOOTING

### Endpoint Ritorna 404
- ✅ Verifica che `ENV_KEEPALIVE_TOKEN` sia impostato
- ✅ Controlla che il token nell'URL sia corretto
- ✅ Assicurati che il server sia avviato

### Response Time Lento (> 5s)
- ✅ Controlla se `KEEPALIVE_DB_PING=true` è necessario
- ✅ Verifica connessione database
- ✅ Monitora carico server

### Fallimenti Intermittenti
- ✅ Aumenta timeout del monitor (da 5s a 10s)
- ✅ Riduci frequenza ping (da 3min a 5min)
- ✅ Verifica stabilità hosting provider

## 📝 LOG MONITORING

### Log Normali (1 ogni 100 chiamate)
```
🏥 /api/health: OK in 23ms (call #100)
🏥 /api/health: OK in 31ms (call #200)
```

### Log di Errore
```
❌ /api/health: Error after 1234ms [Error details]
```

### Analisi Log
- **Frequenza normale**: 1 log ogni ~8 ore (5min * 100 = 500min)
- **Response time target**: < 100ms
- **DB ping target**: < 50ms

## 🔐 SICUREZZA

### Best Practices
- ✅ Usa token casuali lunghi (32+ caratteri)
- ✅ Rota token periodicamente (ogni 3-6 mesi)
- ✅ Non loggare il token nei log
- ✅ Usa HTTPS sempre
- ✅ Monitora tentativi di accesso senza token

### Rate Limiting (Opzionale)
Se necessario, aggiungi rate limiting:
```javascript
// Max 20 richieste per IP ogni 5 minuti
app.use('/api/health', rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20
}));
```

## 📊 COSTI STIMATI

### Opzione Gratuita (UptimeRobot + GitHub Actions)
- **Costo**: €0/mese
- **Frequenza**: Ogni 5 minuti
- **Alert**: Email
- **Uptime**: 99%+

### Opzione Premium (BetterStack Pro)
- **Costo**: ~€10/mese
- **Frequenza**: Ogni 1 minuto
- **Alert**: Email/SMS/Slack
- **Uptime**: 99.9%+
- **Dashboard**: Avanzato

## 🎯 RACCOMANDAZIONE FINALE

**Setup Consigliato per DIAGONALE:**

1. **UptimeRobot** (gratuito) per monitoring base
2. **Frequenza**: Ogni 5 minuti, 24/7
3. **Timeout**: 5 secondi
4. **Alert**: Email dopo 2 fallimenti
5. **Variabili**: `ENV_KEEPALIVE_TOKEN` + `KEEPALIVE_DB_PING=false`

Questo setup garantisce:
- ✅ Zero costi aggiuntivi
- ✅ Backend sempre caldo
- ✅ Alert tempestivi su problemi
- ✅ Minimal overhead (1 richiesta ogni 5min)
