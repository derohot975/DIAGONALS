#!/bin/bash

# DIAGONALE - Local Environment Setup Script
# Crea .env.local per sviluppo locale con Supabase

echo "🔧 DIAGONALE - Setup Environment Locale"
echo "========================================"

# Crea .env.local nella root del progetto
cat > .env.local << 'EOF'
# DIAGONALE - Local Development Environment
# Supabase Configuration
VITE_SUPABASE_URL=https://lmggvdulobhxlgdpbpom.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtZ2d2ZHVsb2JoeGxnZHBicG9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NTAzNDMsImV4cCI6MjA2ODQyNjM0M30.Wfykg2Up3lRLFz66keUSQsGymjrFaJ9PIizwZz8H2i4

# Feature Flags
VITE_ENABLE_SW=false
VITE_AUTH_MODE=supabase
VITE_ENABLE_APP_SHELL=true
VITE_ENABLE_APP_SHELL_ON_INTRO=false
EOF

echo "✅ File .env.local creato con successo!"
echo ""
echo "📋 PROSSIMI PASSI:"
echo "1. Riavvia il server di sviluppo:"
echo "   npx vite --config vite.config.ts"
echo ""
echo "2. Oppure se hai npm run dev configurato per Vite:"
echo "   npm run dev"
echo ""
echo "🔒 SICUREZZA: .env.local è gitignored e non verrà committato"
echo "🎯 L'app ora userà Supabase per auth e dati"
