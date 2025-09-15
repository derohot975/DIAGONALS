
# 🚀 Setup Sviluppo

## 📦 Installazione Completa

### Prerequisiti
- **Node.js**: v18+ (raccomandato v20)
- **npm**: v9+ (incluso con Node.js)
- **PostgreSQL**: v14+ (per produzione, opzionale per sviluppo)
- **Browser**: Chrome/Firefox/Safari per testing PWA

### Clone e Installazione
```bash
# 1. Clone del repository (se da GitHub)
git clone https://github.com/user/diagonale-wine-app.git
cd diagonale-wine-app

# 2. Installazione dipendenze
npm install

# 3. Verifica installazione
npm run check
```

### Database Setup

#### Sviluppo (Storage In-Memory)
```bash
# Nessuna configurazione richiesta
# L'app usa storage in memoria per default in sviluppo
npm run dev
```

#### Produzione (PostgreSQL)
```bash
# 1. Crea database PostgreSQL
createdb diagonale_prod

# 2. Configura variabile ambiente
export DATABASE_URL="postgresql://username:password@localhost:5432/diagonale_prod"

# 3. Inizializza schema database
npm run db:push

# 4. Verifica connessione
npm run dev
```

## 🎯 Comandi Disponibili

### Development
```bash
# Avvio server sviluppo (hot reload)
npm run dev
# → Avvia su http://0.0.0.0:5000
# → Frontend: Hot reload React + Vite
# → Backend: Auto-restart con tsx

# Build di produzione
npm run build
# → Compila TypeScript + Vite build
# → Output: /dist directory

# Avvio produzione
npm start
# → Serve build compilata
# → Usa NODE_ENV=production
```

### TypeScript & Quality
```bash
# Controllo tipi TypeScript
npm run check
# → Valida tutto il codebase TS

# Lint e formattazione (se configurato)
npm run lint
npm run format
```

### Database
```bash
# Push schema to database
npm run db:push
# → Sincronizza schema Drizzle con DB
# → Crea/aggiorna tabelle

# Genera migration files (opzionale)
npx drizzle-kit generate:pg
```

### Utilities
```bash
# Genera icone PWA
node scripts/generate-icons.js

# Analisi bundle size
npm run build && npx vite-bundle-analyzer dist

# Statistiche progetto
node scripts/project-stats.js
```

## 🔧 Configurazione Ambiente

### File di Configurazione

#### `.env.development` (Locale)
```bash
# Crea file per configurazione sviluppo locale
cat > .env.development << 'EOF'
NODE_ENV=development
PORT=5000
LOG_LEVEL=3
DATABASE_URL=postgresql://localhost:5432/diagonale_dev
ENABLE_DEBUG_TOOLS=true
EOF
```

#### `.env.production` (Replit)
```bash
# Variabili ambiente Replit (auto-gestite)
DATABASE_URL=${REPLIT_DB_URL}
NODE_ENV=production
PORT=5000
```

### Replit Secrets (Recomendato)
```bash
# Configura in Replit Secrets tool:
DATABASE_URL=postgresql://[neon-connection-string]
ADMIN_PIN=0000  # PIN amministratore personalizzato
```

## 🐛 Troubleshooting

### Problemi Comuni

#### Port Already in Use
```bash
# Errore: EADDRINUSE :::5000
# Soluzione: Kill processo su porta 5000
lsof -ti:5000 | xargs kill -9

# Oppure usa porta alternativa
PORT=5001 npm run dev
```

#### Database Connection Failed
```bash
# Errore: Connection to PostgreSQL failed
# Verifiche:
echo $DATABASE_URL  # Controlla variabile ambiente
pg_isready -h hostname -p port  # Testa connessione PostgreSQL

# Per sviluppo locale senza PostgreSQL:
unset DATABASE_URL  # Usa storage in-memory
npm run dev
```

#### TypeScript Errors
```bash
# Errore: Cannot find module '@/components/...'
# Soluzione: Verifica paths in tsconfig.json
npm run check  # Mostra errori dettagliati

# Reset TypeScript cache
rm -rf node_modules/.cache
npm run check
```

#### Vite Build Failures
```bash
# Errore: Build failed with errors
# Soluzioni:
rm -rf node_modules/.vite  # Clear Vite cache
rm -rf dist  # Clear build output
npm run build  # Retry build

# Debug mode
DEBUG=vite:* npm run build
```

#### PWA Icons Missing
```bash
# Errore: PWA icons not found
# Soluzione: Genera icone
node scripts/generate-icons.js

# Verifica file generati
ls -la public/icon-*.png
```

### Performance Issues

#### Slow Development Server
```bash
# Ottimizzazioni:
# 1. Exclude node_modules from file watcher
echo "node_modules/" >> .gitignore

# 2. Increase Node.js memory
export NODE_OPTIONS="--max-old-space-size=4096"

# 3. Use faster reload
npm run dev -- --host 0.0.0.0 --open
```

#### Large Bundle Size
```bash
# Analisi bundle
npm run build
npx vite-bundle-analyzer dist

# Identificare dipendenze pesanti
npm ls --depth=0 --long
```

### Database Issues

#### Migration Errors
```bash
# Reset database schema
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
npm run db:push

# Oppure ricrea database
dropdb diagonale_dev
createdb diagonale_dev
npm run db:push
```

#### Data Corruption
```bash
# Backup database
pg_dump diagonale_prod > backup.sql

# Restore from backup
createdb diagonale_new
psql diagonale_new < backup.sql
```

## 📋 Workflow Consigliato

### Sviluppo Feature
```bash
# 1. Sync con main branch
git pull origin main

# 2. Crea feature branch
git checkout -b feature/nome-feature

# 3. Sviluppo
npm run dev  # Avvia development server
# Modifica codice con hot reload

# 4. Testing
npm run check  # Verifica TypeScript
npm run build  # Test build produzione

# 5. Commit e push
git add .
git commit -m "feat: descrizione feature"
git push origin feature/nome-feature
```

### Debugging Workflow
```bash
# 1. Abilita debug logging
export LOG_LEVEL=3

# 2. Avvia con debug
npm run dev

# 3. Monitor logs
tail -f logs/app.log  # Se configurato

# 4. Browser DevTools
# React DevTools + React Query DevTools
# Network tab per API calls
# Console per error logging
```

### Deploy Workflow
```bash
# 1. Test locale
npm run build
npm start  # Test build produzione

# 2. Verifica configurazione
node scripts/config-inspector.js

# 3. Deploy su Replit
git push origin main  # Auto-deploy attivo

# 4. Verifica deploy
curl https://repl-name.username.repl.co/api/users
```

## 🛡️ Best Practices

### Code Quality
- **TypeScript strict mode**: Sempre abilitato
- **Zod validation**: Per tutti i dati input/output
- **Error boundaries**: Per gestione errori React
- **Consistent naming**: Segui convenzioni stabilite

### Performance
- **Code splitting**: Componenti lazy-loaded quando possibile
- **Query optimization**: React Query con staleTime appropriato
- **Bundle analysis**: Monitor regolare delle dimensioni
- **Memory monitoring**: Debug memory leaks in sviluppo

### Security
- **Environment variables**: Mai committare secrets
- **Input validation**: Server-side validation sempre
- **Error messages**: Non esporre informazioni sensibili
- **CORS configuration**: Configurato per domini corretti

### Maintenance
- **Regular updates**: Dependency updates mensili
- **Documentation**: Aggiorna docs con nuove feature
- **Testing**: Test manuale su dispositivi mobili
- **Monitoring**: Log analysis per identificare issues

## 📱 Testing Mobile

### Simulazione Mobile in Browser
```bash
# Chrome DevTools
# 1. F12 → Toggle device toolbar
# 2. Seleziona device (iPhone 12, Samsung Galaxy)
# 3. Test touch interactions
# 4. Test PWA install prompt

# Firefox Responsive Design
# 1. F12 → Responsive Design Mode
# 2. Test varie risoluzioni
# 3. Verifica layout responsive
```

### PWA Testing
```bash
# 1. Build produzione
npm run build

# 2. Serve localmente
npx serve dist -p 3000

# 3. Test features PWA
# - Install prompt
# - Offline functionality
# - App icons
# - Manifest.json
```

### Device Testing (Consigliato)
- **iPhone Safari**: Test iOS compatibility
- **Android Chrome**: Test Android compatibility
- **iPad**: Test tablet layout
- **Various screen sizes**: Test responsive design
