#!/bin/bash

# DIAGONALE - Script di avvio sviluppo definitivo
# Risolve tutti i problemi di environment variables

echo "🚀 DIAGONALE - Avvio Sviluppo"
echo "=============================="

# 1. Verifica configurazione development
if [ ! -f ".env.development" ]; then
    echo "⚠️ File .env.development non trovato"
    echo "💡 Crea il file .env.development con DATABASE_URL per il database PostgreSQL"
    echo "   Esempio: DATABASE_URL=postgresql://user:pass@localhost:5432/diagonale"
fi

# 3. Kill processi Vite esistenti
echo "🔄 Fermando server esistenti..."
pkill -f "vite" 2>/dev/null || true
sleep 2

# 4. Verifica variabili da .env.development
echo "🔍 Verifica configurazione..."
if [ -f ".env.development" ]; then
    source .env.development
    if [ -z "$DATABASE_URL" ]; then
        echo "❌ DATABASE_URL mancante in .env.development"
        exit 1
    fi
    echo "✅ Configurazione OK"
    echo "   - DATABASE_URL: SET"
    echo "   - NODE_ENV: $NODE_ENV"
else
    echo "⚠️ File .env.development non trovato, usando configurazione default"
fi

# 5. Avvia Vite con variabili esplicite per sicurezza
echo "🚀 Avvio server Vite..."
echo ""
echo "📱 App disponibile su: http://localhost:5173"
echo "🌐 Network: http://$(ipconfig getifaddr en0):5173"
echo ""

# Avvia server di sviluppo
npm run dev
