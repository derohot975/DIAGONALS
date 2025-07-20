# RENDER DEPLOY FIX - ISTRUZIONI PRECISE

## PROBLEMA IDENTIFICATO
Render ha Root Directory impostato su `dist` ma deve essere **VUOTO**

## CONFIGURAZIONE CORRETTA RENDER

### 1. Settings → Build & Deploy
- **Build Command**: `node build-render.js` ✅
- **Start Command**: `NODE_ENV=production node server-prod.js`
- **Root Directory**: **LASCIA VUOTO** (rimuovi `dist`)

### 2. Perché Root Directory deve essere vuoto:
- Il build script genera `server-prod.js` e `public/` nella ROOT
- Render deve eseguire comandi dalla ROOT, non da una subdirectory
- Path `/opt/render/project/src/dist` non esiste perché generiamo tutto in `/opt/render/project/src/`

### 3. Commit GitHub più recente:
Il commit "Working Render build with proper dependency installation" contiene il build script corretto.

## AZIONE IMMEDIATA
1. Render Dashboard → Settings → Build & Deploy
2. **Root Directory**: Cancella completamente il campo (deve essere vuoto)  
3. **Start Command**: `NODE_ENV=production node server-prod.js`
4. Manual Deploy

## VERIFICA BUILD LOCALE
Il build funziona perfettamente:
```
✅ Frontend: 6.48s build → public/
✅ Backend: 16ms build → server-prod.js  
✅ Start: NODE_ENV=production node server-prod.js
```

**ROOT DIRECTORY VUOTO È LA SOLUZIONE**