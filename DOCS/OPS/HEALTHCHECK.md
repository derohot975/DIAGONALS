# 🩺 HEALTHCHECK ENDPOINT - DIAGONALE

**Data**: 01/10/2025 16:00  
**Versione**: 1.0.0  
**Scopo**: Prevenire standby database PostgreSQL/Supabase tramite warm-up automatico  

---

## 📋 PANORAMICA

L'endpoint `/health` è progettato per:
- **Warm-up database**: Mantiene attivo PostgreSQL/Supabase con query minimali
- **Monitoring**: Fornisce stato applicazione per Uptime Robot
- **Sicurezza**: Rate limiting e nessuna esposizione di segreti
- **Performance**: Risposta < 300ms (escluso primo risveglio DB)

---

## 🔗 ENDPOINT

### GET /health

**URL Produzione**: `https://diagonals.onrender.com/health`  
**URL Sviluppo**: `http://localhost:5000/health`

#### Response Format
```json
{
  "status": "ok" | "degraded" | "down",
  "database": {
    "ok": boolean,
    "latency_ms": number | null,
    "error_hint": "string" // Solo se errore
  },
  "timestamp_iso": "2025-10-01T16:00:00.000Z",
  "app": {
    "uptime_s": 3600
  },
  "version": "1.0.0"
}
```

#### Status Codes
- **200**: Sempre (anche se `status: "degraded"` per compatibilità Uptime Robot)
- **429**: Rate limit superato (100 req/15min)

#### Headers
```
Cache-Control: no-store, no-cache, must-revalidate
Content-Type: application/json; charset=utf-8
```

### HEAD /health

Risponde `200` senza body per check rapidi.

---

## 🔧 FUNZIONAMENTO INTERNO

### Database Warm-up (2-Step Fallback)

1. **Step 1**: `SELECT COUNT(*) FROM users LIMIT 1`
2. **Step 2**: `SELECT COUNT(*) FROM wine_events LIMIT 1` (se Step 1 fallisce)
3. **Fallback**: Se entrambi falliscono → `status: "degraded"`, `database.ok: false`

### Timeout Management
- **Query DB**: 1 secondo
- **Endpoint totale**: 3 secondi (hard timeout)
- **Fallback**: Risposta `degraded` se timeout

### Rate Limiting
- **Soglia**: 100 richieste per 15 minuti per IP
- **Finestra**: Rolling window di 15 minuti
- **Storage**: In-memory (reset al riavvio server)

### Logging Sobrio
- **Solo transizioni di stato**: `unknown → ok`, `ok → degraded`, etc.
- **Nessun log segreti**: Variabili d'ambiente mai stampate
- **Formato**: `🏥 Health status transition: ok → degraded (call #123)`

---

## ⚙️ CONFIGURAZIONE UPTIME ROBOT

### Setup Consigliato
```
URL: https://diagonals.onrender.com/health
Metodo: GET
Intervallo: 15 minuti
Timeout: 30 secondi
Keyword: "ok" (cerca nel response JSON)
```

### Alert Conditions
- **DOWN**: Status code ≠ 200 OR response non contiene `"status"`
- **DEGRADED**: Response contiene `"status": "degraded"` (opzionale)

---

## 🔒 SICUREZZA

### Variabili d'Ambiente
- **DATABASE_URL**: Solo server-side, mai nel bundle client
- **Nessun token**: Endpoint pubblico (rate limited)

### Best Practices
- ✅ Nessun secret nei log
- ✅ Query read-only (COUNT)
- ✅ Nessuna modifica schema DB
- ✅ Rate limiting per prevenire abusi
- ✅ Timeout per evitare hang

---

## 🧪 TEST LOCALI

### Server Mode (Development)
```bash
# Avvia server in modalità sviluppo
npm run dev
curl -i http://localhost:3000/api/health
```

### Server Mode (Production)
```bash
# Build e avvia server in modalità produzione
npm run build
DATABASE_URL="your_db_url" npm run start
curl -i http://localhost:3000/api/health
```

### Test Normale
```bash
curl -i http://localhost:3000/api/health
```

**Expected Response**:
```json
{
  "status": "ok",
  "database": { "ok": true, "latency_ms": 45 },
  "timestamp_iso": "2025-10-01T16:00:00.000Z",
  "app": { "uptime_s": 120 },
  "version": "1.0.0"
}
```

### Test Database Offline
```bash
# Simula DB offline modificando temporaneamente DATABASE_URL
export DATABASE_URL="postgresql://invalid:invalid@localhost:9999/invalid"
npm run dev
curl -i http://localhost:3000/api/health
```

**Expected Response**:
```json
{
  "status": "degraded",
  "database": { "ok": false, "latency_ms": null, "error_hint": "Database unreachable" },
  "timestamp_iso": "2025-10-01T16:00:00.000Z",
  "app": { "uptime_s": 30 },
  "version": "1.0.0"
}
```

### Test Rate Limiting
```bash
# Invia 101 richieste rapidamente
for i in {1..101}; do curl -s http://localhost:3000/api/health > /dev/null; done
curl -i http://localhost:3000/api/health
```

**Expected**: Status `429` dopo 100 richieste.

---

## 📊 METRICHE E MONITORING

### Performance Target
- **Latency normale**: < 100ms
- **Latency primo risveglio**: < 2000ms (accettabile)
- **Timeout query**: 1000ms
- **Timeout totale**: 3000ms

### Database Health Indicators
- **OK**: `latency_ms < 200` e `database.ok: true`
- **SLOW**: `latency_ms > 500` ma `database.ok: true`
- **DOWN**: `database.ok: false`

---

## 🚀 DEPLOY E PRODUZIONE

### Render.com Configuration
1. **Service Type**: Web Service
2. **Build Command**: `npm run build` (già configurato)
3. **Start Command**: `npm run start` (già configurato)
4. **Auto-deploy**: Abilitato da GitHub main branch
5. **Environment Variables**: `DATABASE_URL` configurato in Render dashboard
6. **Health Check**: Render può usare `/api/health` per internal monitoring

### Server Architecture
- **Express Server**: Serve sia API che file statici React
- **Production Mode**: File statici serviti da `dist/public/`
- **SPA Fallback**: Route non-API reindirizzate a `index.html`
- **API Routes**: Prefisso `/api/` per tutti gli endpoint server

### Post-Deploy Verification
```bash
# Verifica endpoint pubblico
curl -i https://diagonals.onrender.com/api/health

# Verifica response format
curl -s https://diagonals.onrender.com/api/health | jq .

# Verifica app React
curl -s https://diagonals.onrender.com/ | grep -o "<title>.*</title>"
```

### Uptime Robot Setup
1. Crea nuovo monitor HTTP(S)
2. URL: `https://diagonals.onrender.com/api/health`
3. Intervallo: 15 minuti
4. Keyword monitoring: `"status"`
5. Alert contacts: configurare email/SMS

---

## 🔧 TROUBLESHOOTING

### Problemi Comuni

#### 1. Database Connection Failed
**Sintomi**: `status: "degraded"`, `error_hint: "Database unreachable"`
**Soluzioni**:
- Verificare `DATABASE_URL` in Render dashboard
- Controllare firewall/network del database
- Verificare credenziali database

#### 2. High Latency
**Sintomi**: `latency_ms > 1000`
**Soluzioni**:
- Database potrebbe essere in standby (normale al primo risveglio)
- Verificare performance database
- Controllare network latency

#### 3. Rate Limiting
**Sintomi**: Status `429`
**Soluzioni**:
- Normale se > 100 req/15min da stesso IP
- Verificare configurazione Uptime Robot (non troppo frequente)
- Rate limit si resetta automaticamente

---

## 📝 CHANGELOG

### v1.0.0 (01/10/2025)
- ✅ Endpoint `/health` implementato
- ✅ Database warm-up con 2-step fallback
- ✅ Rate limiting in-memory
- ✅ Logging sobrio (solo transizioni)
- ✅ Timeout management (1s query, 3s totale)
- ✅ Compatibilità Uptime Robot (sempre 200)
- ✅ HEAD method support
- ✅ Documentazione completa

---

## 🎯 NEXT STEPS

1. **Deploy**: Push su GitHub → Auto-deploy Render
2. **Verify**: Test endpoint produzione
3. **Monitor**: Setup Uptime Robot con URL pubblico
4. **Observe**: Monitorare log transizioni stato per 24h
5. **Optimize**: Ajustare timeout se necessario basato su metriche reali
