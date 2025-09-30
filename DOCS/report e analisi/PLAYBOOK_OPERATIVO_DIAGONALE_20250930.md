# PLAYBOOK OPERATIVO DIAGONALE - 30/09/2025

## 1. PANORAMICA PROGETTO

### Stack Tecnologico
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Express.js + TypeScript + PostgreSQL + Drizzle ORM  
- **Deploy**: Render.com con auto-deploy da GitHub
- **PWA**: Service Worker + Manifest completo

### Directory Chiave
```
/client          # Frontend React con screens modulari
/server          # Backend Express con routes modulari  
/shared          # Schema Drizzle ORM e validazioni Zod
/scripts         # Utility PWA, post-build, generatori
/DOCS            # Documentazione completa progetto
/Backup_Automatico # Sistema backup rotazione max 3
```

### Stato Attuale
- ✅ **TypeScript**: 0 errori (tsc clean)
- ✅ **Build**: OK in ~2.8s (vite build successful)
- ✅ **Console**: 0 warning/errori (pulita)
- ✅ **App locale**: Attiva su http://localhost:3000
- ✅ **Bundle**: 244.37 kB (gzipped: 72.43 kB)

## 2. MAPPA MODULI PER SCHERMATA (FRONTEND)

### AdminEventManagementScreen
- **Container**: AdminEventManagementScreen.tsx (211 righe, da 220 originali)
- **Status**: Monolite ottimizzato, candidato per futura modularizzazione

### SimpleVotingScreen  
- **Container**: SimpleVotingScreen.tsx (89 righe, da 95 originali)
- **Moduli**:
  - vote/components/EventInfo.tsx (31 righe) - Info evento header
  - vote/components/VotingHeaderBar.tsx (41 righe) - Barra navigazione
  - vote/components/WineList.tsx (72 righe) - Lista vini scrollabile
  - vote/components/WineListItem.tsx (48 righe) - Item singolo vino
  - vote/modals/VoteScrollPickerBridge.tsx (27 righe) - Bridge modal voto
  - vote/modals/AdminPinModalBridge.tsx (17 righe) - Bridge modal admin

### EventResultsScreen
- **Container**: EventResultsScreen.tsx (84 righe, da 90 originali)  
- **Status**: Monolite ottimizzato, logica export embedded

### PagellaScreen ⭐ MODULARIZZATO
- **Container**: PagellaScreen.tsx (46 righe, da 271 originali, **-83.0%**)
- **Moduli**:
  - pagella/hooks/usePagellaLogic.ts (170 righe) - Logica core autosave/polling
  - pagella/hooks/usePagellaPermissions.ts (8 righe) - Permessi DERO/TOMMY
  - pagella/components/PagellaHeader.tsx (36 righe) - Header + status
  - pagella/components/PagellaEditor.tsx (43 righe) - Textarea + messaggi
  - pagella/components/PagellaNavigation.tsx (31 righe) - Bottoni navigazione
  - pagella/utils/pagellaStorage.ts (15 righe) - LocalStorage helpers

### EventDetailsScreen ⭐ MODULARIZZATO
- **Container**: EventDetailsScreen.tsx (90 righe, da 224 originali, **-59.8%**)
- **Moduli**:
  - event-details/components/EventContainer.tsx (75 righe) - Header + CTA
  - event-details/components/WinesGrid.tsx (46 righe) - Griglia + empty state
  - event-details/components/WineCard.tsx (55 righe) - Card vino + VotingGrid
  - event-details/components/ProgressBar.tsx (41 righe) - Progresso + azioni
  - event-details/components/NavButtons.tsx (36 righe) - Navigazione fissa

## 3. ROUTER & ENDPOINT (BACKEND)

### Struttura Modulare
```
server/routes/
├── index.ts        # Router principale
├── health.ts       # Keep-alive system
├── auth.ts         # Autenticazione PIN
├── users.ts        # Gestione utenti
├── events.ts       # Eventi degustazione
├── wines.ts        # Gestione vini
├── votes.ts        # Sistema votazioni
└── reports.ts      # Pagella + report finali
```

### Endpoint Principali

| Metodo | Path | File Router | Usato da |
|--------|------|-------------|----------|
| GET | `/api/health` | health.ts | Keep-alive |
| POST | `/api/auth/login` | auth.ts | AuthScreen |
| POST | `/api/auth/register` | auth.ts | AuthScreen |
| GET | `/api/users` | users.ts | AdminScreen |
| POST | `/api/users` | users.ts | AdminScreen |
| PUT | `/api/users/:id` | users.ts | AdminScreen |
| DELETE | `/api/users/:id` | users.ts | AdminScreen |
| GET | `/api/events` | events.ts | EventListScreen |
| POST | `/api/events` | events.ts | AdminEventManagement |
| GET | `/api/events/:id` | events.ts | EventDetailsScreen |
| DELETE | `/api/events/:id` | events.ts | AdminEventManagement |
| GET | `/api/events/:eventId/wines` | events.ts | EventDetails, SimpleVoting |
| GET | `/api/events/:eventId/votes` | events.ts | EventDetails, EventResults |
| GET | `/api/events/:eventId/results` | events.ts | EventResultsScreen |
| **GET** | **`/api/events/:eventId/participants`** | **events.ts** | **AdminEventManagement** |
| **DELETE** | **`/api/events/:eventId/participants/:userId`** | **events.ts** | **AdminEventManagement** |
| GET | `/api/wines` | wines.ts | EventDetailsScreen |
| POST | `/api/wines` | wines.ts | EventDetailsScreen |
| PUT | `/api/wines/:id` | wines.ts | EventDetailsScreen |
| GET | `/api/votes` | votes.ts | SimpleVotingScreen |
| POST | `/api/votes` | votes.ts | SimpleVotingScreen |
| **GET** | **`/api/events/:id/pagella`** | **reports.ts** | **PagellaScreen** |
| **PUT** | **`/api/events/:id/pagella`** | **reports.ts** | **PagellaScreen** |
| POST | `/api/events/:id/complete` | reports.ts | EventDetailsScreen |
| GET | `/api/events/:id/report` | reports.ts | EventResultsScreen |

## 4. PLAYBOOK OPERAZIONI COMUNI

### Aggiungi Nuova Schermata Modulare

```bash
# 1. Crea struttura directory
mkdir -p client/src/components/screens/nuova-schermata/{components,hooks,utils}

# 2. Pattern file (≤ 7 file totali)
touch client/src/components/screens/nuova-schermata/NuovaSchermataScreen.tsx  # Container ≤100 righe
touch client/src/components/screens/nuova-schermata/hooks/useNuovaSchermataLogic.ts
touch client/src/components/screens/nuova-schermata/components/Header.tsx
touch client/src/components/screens/nuova-schermata/components/Content.tsx
touch client/src/components/screens/nuova-schermata/components/Actions.tsx

# 3. Naming convention
# - PascalCase per componenti
# - camelCase per hook
# - kebab-case per directory
# - Suffisso Screen solo per container principale

# 4. Checklist
# ✅ Container ≤ 100 righe (solo orchestrazione)
# ✅ Hook per business logic separata
# ✅ Componenti UI puri (≤ 60 righe ciascuno)
# ✅ Props tipizzate con interfacce esplicite
# ✅ Zero dipendenze nuove
```

### Estrarre Componente da Schermata Esistente

```bash
# 1. Backup originale
cp client/src/components/screens/TargetScreen.tsx ARCHIVE/client/screens/TargetScreen_$(date +%Y%m%d_%H%M).tsx

# 2. Identifica sezione JSX coesa (20-60 righe)
# 3. Estrai in nuovo file con props tipizzate
# 4. Importa nel container originale
# 5. Verifica build + console pulita

# Vincoli:
# - Stesse classi CSS
# - Stessi handler/props pubblici  
# - Zero cambi UX/comportamento
# - Nessun nuovo import esterno
```

### Verifica Rapida Pre-Deploy

```bash
# Build & TypeScript
npm run check          # Atteso: 0 errori
npm run build          # Atteso: ✓ built in ~2.8s
npm run dev            # Atteso: server attivo

# Console browser
# Atteso: 0 warning/errori in DevTools

# Smoke test (5 click rapidi)
# ✅ EventDetails: CTA + griglia vini
# ✅ SimpleVoting: voto + salvataggio  
# ✅ EventResults: classifiche + export
# ✅ Pagella: editor + autosave
# ✅ AdminEventManagement: CRUD eventi
```

### Backup & Restore

```bash
# Backup automatico (già configurato)
npm run backup         # Crea Backup_Automatico/BACKUP_YYYYMMDD_HHMM.tar.gz

# Backup manuale
tar -czf backup_custom.tar.gz --exclude='node_modules' --exclude='.git' --exclude='dist' .

# Restore (se necessario)
tar -xzf Backup_Automatico/BACKUP_YYYYMMDD_HHMM.tar.gz -C ./restore_temp/
```

## 5. CHECKLIST REGRESSIONE LAMPO

| Screen | Test | Atteso |
|--------|------|--------|
| **EventDetails** | Click CTA + scroll griglia | OK - Registrazione/partecipazione + vini visibili |
| **SimpleVoting** | Voto vino + salva | OK - Picker funziona + punteggio salvato |
| **EventResults** | Visualizza classifica + export | OK - Risultati corretti + share attivo |
| **Pagella** | Scrivi testo + attendi autosave | OK - Salvataggio automatico + status verde |
| **AdminEventManagement** | Crea evento + gestisci partecipanti | OK - CRUD completo + lista aggiornata |

### Regole Invarianti
- ✅ **UX/Flow**: Nessun cambio navigazione, layout, interazioni
- ✅ **Console**: 0 warning/errori in DevTools
- ✅ **Endpoint**: API response identiche, nessun nuovo errore 500/404

## 6. GUARDRAIL & STANDARD

### Contratti Immutabili
- ❌ **Nessun rename pubblico**: Props, hook exports, screen names
- ❌ **Nessuna dipendenza nuova**: Package.json invariato
- ✅ **READ-ONLY su vini**: Solo lettura dati vino in voting
- ✅ **Supplier UUID**: Identificatori univoci per fornitori
- ✅ **Date normalizzate**: Formato YYYY-MM-DD consistente
- ✅ **Caricamento 2-step**: Fetch dati + render UI separati
- ✅ **Provider order**: App → Query → Auth → Router (invariato)

### Pattern Architetturali
- **Container/Presenter**: Logic nei hook, UI nei componenti
- **Single Responsibility**: Un file = una responsabilità
- **Props Drilling**: Evitare, usare context per stato globale
- **Error Boundaries**: Gestione errori a livello screen
- **Lazy Loading**: Componenti pesanti con React.lazy()

## 7. TROUBLESHOOTING MINIMO

| Errore | Causa | Azione |
|--------|-------|--------|
| Console warning VotingGrid | Props non tipizzate | Aggiungi interface esplicita |
| Cache invalidazione mancante | Query stale | Forza refetch con queryClient |
| Offset navbar mobile | CSS var non definita | Verifica --bottom-nav-offset |
| Build fallisce TypeScript | Import path errato | Controlla alias @/ e percorsi relativi |
| Modal non si chiude | State non resettato | Verifica onClose callback |
| Autosave non funziona | Debounce rotto | Controlla useEffect dependencies |
| Scroll non funziona mobile | Height calc errato | Verifica calc(100dvh - ...) |
| Export share fallisce | Web Share API non supportata | Fallback su clipboard copy |
| Login PIN non accetta | Validation schema | Controlla Zod schema 4 cifre |
| Performance lenta | Bundle troppo grande | Analizza con npm run build --analyze |

## 8. APPENDICE LINK INTERNI

### Documentazione Tecnica Base
- `DOCS/01_database_api.md` - Schema DB e API reference
- `DOCS/02_struttura_progetto.md` - Architettura generale
- `DOCS/03_scripts_utilita.md` - Script PWA e build
- `DOCS/04_config_sviluppo.md` - Setup ambiente sviluppo
- `DOCS/05_setup_sviluppo.md` - Guida installazione

### Report Modularizzazione
- `DOCS/report e analisi/REPORT_PAGELLA_MODULARIZZAZIONE_20250930.md`
- `DOCS/report e analisi/REPORT_EVENT_DETAILS_MODULARIZZAZIONE_20250930.md`
- `DOCS/report e analisi/REPORT_FINALE_MODULARIZZAZIONE_20250930.md`
- `DOCS/report e analisi/REPORT_STRUTTURA_MODULARE_20250930.md`

### Analisi & Refactor
- `DOCS/report e analisi/REFACTOR_APP_30092025.md`
- `DOCS/report e analisi/REFACTOR_ROUTES_30092025.md`
- `DOCS/report e analisi/REFACTOR_SCREENROUTER_30092025.md`
- `DOCS/report e analisi/REPORT_ADMIN_EVENT_MANAGEMENT_20250930.md`
- `DOCS/report e analisi/REPORT_VOTING_RESULTS_20250930.md`

### Mappe & Status
- `DOCS/report e analisi/MAPPA_IMPORTS_20250930.txt`
- `DOCS/report e analisi/MAPPA_ENDPOINT_20250930.txt`
- `DOCS/report e analisi/TODO_MODULARE_20250930.txt`
- `DOCS/report e analisi/STATUS_PROJECT.md`
- `DOCS/report e analisi/CURRENT_STATUS_2025.md`

### Guide Specializzate
- `DOCS/report e analisi/ICONS_GUIDE.md` - Sistema icone Iconify
- `DOCS/report e analisi/HOW_TO_SCROLL.md` - Gestione scroll mobile
- `DOCS/report e analisi/KEEPALIVE.md` - Sistema keep-alive
- `DOCS/report e analisi/PAGELLA_SHARED_README.md` - Pagella collaborativa

---

**DIAGONALE v1.0.0** - Architettura modulare completa, pronta per produzione e manutenzione a lungo termine.
