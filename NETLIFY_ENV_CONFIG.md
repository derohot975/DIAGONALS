# 🔧 CONFIGURAZIONE VARIABILI D'AMBIENTE NETLIFY

## Variabile Richiesta

### VITE_API_BASE_URL
**Descrizione**: URL base per le chiamate API del frontend

**Valori per ambiente**:
- **Sviluppo locale**: Non necessario (usa proxy Vite)
- **Netlify produzione**: `https://YOUR-BACKEND-RENDER.onrender.com/api`

## Configurazione Netlify Dashboard

1. Vai su **Site settings** → **Environment variables**
2. Aggiungi variabile:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://YOUR-BACKEND-RENDER.onrender.com/api`
3. **Deploy** il sito per applicare le modifiche

## Note
- Sostituire `YOUR-BACKEND-RENDER` con il nome effettivo del servizio Render
- La variabile è sicura per il client (prefisso VITE_)
- Nessun secret o credenziale esposta
