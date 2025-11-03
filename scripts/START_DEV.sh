#!/bin/bash

# DIAGONALE - Script di avvio sviluppo definitivo
# Risolve tutti i problemi di environment variables

echo "🚀 DIAGONALE - Avvio Sviluppo"
echo "=============================="

# 1. Verifica che .env.local esista
if [ ! -f ".env.local" ]; then
    echo "❌ File .env.local non trovato!"
    echo "🔧 Eseguo setup automatico..."
    bash scripts/LOCAL_ENV_SETUP.sh
fi

# 2. Backup altri file .env che potrebbero confliggere
if [ -f ".env" ]; then
    echo "📦 Backup .env → .env.backup"
    mv .env .env.backup 2>/dev/null || true
fi

if [ -f ".env.development" ]; then
    echo "📦 Backup .env.development → .env.development.backup"
    mv .env.development .env.development.backup 2>/dev/null || true
fi

# 3. Kill processi Vite esistenti
echo "🔄 Fermando server esistenti..."
pkill -f "vite" 2>/dev/null || true
sleep 2

# 4. Verifica variabili da .env.local
echo "🔍 Verifica configurazione..."
source .env.local
if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
    echo "❌ Variabili Supabase mancanti in .env.local"
    exit 1
fi

echo "✅ Configurazione OK"
echo "   - VITE_SUPABASE_URL: SET"
echo "   - VITE_SUPABASE_ANON_KEY: SET"
echo "   - VITE_AUTH_MODE: $VITE_AUTH_MODE"

# 5. Avvia Vite con variabili esplicite per sicurezza
echo "🚀 Avvio server Vite..."
echo ""
echo "📱 App disponibile su: http://localhost:5173"
echo "🌐 Network: http://$(ipconfig getifaddr en0):5173"
echo ""

# Avvia con variabili esplicite per evitare problemi
VITE_SUPABASE_URL="$VITE_SUPABASE_URL" \
VITE_SUPABASE_ANON_KEY="$VITE_SUPABASE_ANON_KEY" \
VITE_ENABLE_SW="$VITE_ENABLE_SW" \
VITE_AUTH_MODE="$VITE_AUTH_MODE" \
VITE_ENABLE_APP_SHELL="$VITE_ENABLE_APP_SHELL" \
VITE_ENABLE_APP_SHELL_ON_INTRO="$VITE_ENABLE_APP_SHELL_ON_INTRO" \
npx vite --config vite.config.ts
