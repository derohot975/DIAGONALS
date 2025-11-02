# 🚀 NETLIFY DEPLOY READINESS REPORT
**Progetto**: DIAGONALE Wine Tasting App  
**Data**: 02/11/2025 23:46  
**Framework**: React 18 + TypeScript + Vite  

---

## 📊 ANALISI COMPATIBILITÀ

### ✅ Framework e Build System
- **Framework**: React 18.3.1 con TypeScript 5.6.3
- **Build Tool**: Vite 5.4.19 (✅ Compatibile Netlify)
- **Comando Build**: `npm run build` (⚠️ Attualmente include server build)
- **Output Directory**: `dist/public` (✅ Configurato correttamente)
- **Package Lock**: ✅ `package-lock.json` presente

### ⚠️ Build Command Issue
**PROBLEMA**: Il comando `npm run build` attuale include build del server:
```json
"build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist"
```

**SOLUZIONE NECESSARIA**: Creare comando separato per frontend-only:
```json
"build:frontend": "vite build"
```

### ✅ Routing SPA
- **Router**: Wouter 3.3.5 (client-side routing)
- **File _redirects**: ❌ Non presente (NECESSARIO)
- **Configurazione**: Richiede rewrite per SPA

### ✅ Variabili d'Ambiente
**Variabili VITE_ rilevate**:
- `VITE_ENABLE_SW` (Service Worker toggle)
- `VITE_ENABLE_APP_SHELL` (App Shell toggle)  
- `VITE_ENABLE_APP_SHELL_ON_INTRO` (Intro Shell toggle)

**Nota**: Nessuna variabile sensibile o API key rilevata nel codice client.

### ✅ API e CORS
- **Backend**: Express server separato (non deployato su Netlify)
- **API Calls**: Relative URLs (`/api/*`) tramite `apiRequest` function
- **CORS**: ✅ Gestito tramite `credentials: "include"`
- **Proxy Dev**: Configurato per `localhost:3000` in sviluppo

### ✅ Asset e Dipendenze
- **PWA Assets**: ✅ Manifest, icone, service worker configurati
- **Dipendenze**: ✅ Solo client-side (React, Radix UI, TanStack Query)
- **Vite Config**: ✅ Alias configurati correttamente
- **Base Path**: ✅ Default (nessuna configurazione speciale)

### ⚠️ Sicurezza
- **Secrets Client**: ✅ Nessun secret hardcoded rilevato
- **Environment**: ✅ Solo variabili VITE_ (sicure per client)
- **Database**: ✅ Accesso solo tramite API backend

---

## 🔧 CONFIGURAZIONI RICHIESTE

### File _redirects (da creare in `dist/public/`)
```
/*    /index.html   200
```

### Alternativa: netlify.toml (da creare in root)
```toml
[build]
  command = "npm run build:frontend"
  publish = "dist/public"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Script Build Separato (da aggiungere a package.json)
```json
{
  "scripts": {
    "build:frontend": "vite build"
  }
}
```

---

## ⚠️ LIMITAZIONI NETLIFY DEPLOY

### Backend Separato Richiesto
- **Database**: PostgreSQL richiede backend separato
- **API Routes**: Express server non compatibile con Netlify statico
- **Sessioni**: Express-session richiede server persistente
- **Soluzione**: Deploy backend su Render/Railway/Vercel

### Funzionalità Compromesse (Solo Frontend)
- ❌ Autenticazione utenti
- ❌ Gestione eventi e vini  
- ❌ Votazioni e report
- ❌ Database persistence
- ✅ UI/UX e routing client-side

---

## 🎯 COSA IMPOSTARE SU NETLIFY

**Build command**: `npm run build:frontend`  
**Publish directory**: `dist/public`  
**Environment variables**: `VITE_ENABLE_SW`, `VITE_ENABLE_APP_SHELL`, `VITE_ENABLE_APP_SHELL_ON_INTRO`

---

## 📋 CHECKLIST PRE-DEPLOY

- [ ] Creare script `build:frontend` in package.json
- [ ] Aggiungere file `_redirects` o `netlify.toml`
- [ ] Configurare variabili d'ambiente su Netlify
- [ ] Deploy backend separato per API
- [ ] Aggiornare URL API nel client per produzione
- [ ] Test routing SPA post-deploy

---

## 🚨 RACCOMANDAZIONE FINALE

**DEPLOY NETLIFY = SOLO FRONTEND STATICO**

Per app completa funzionante:
1. **Frontend**: Netlify (questo progetto con modifiche)
2. **Backend**: Render.com/Railway (server Express + PostgreSQL)
3. **Configurazione**: CORS e URL API per comunicazione cross-origin

**Status**: ⚠️ **PRONTO CON MODIFICHE MINORI**
