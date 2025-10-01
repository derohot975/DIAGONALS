# 🔧 REFACTOR, GUIDE E MAPPE CONSOLIDATE - DIAGONALE

Questo file consolida guide tecniche, playbook operativi e mappe di dipendenze del progetto Diagonale.

---

## INDICE

1. [Playbook Operativo](#playbook-operativo)
2. [Guide Tecniche](#guide-tecniche)
3. [Mappe e Dipendenze](#mappe-e-dipendenze)
4. [How-To e Best Practices](#how-to-e-best-practices)

---

## PLAYBOOK OPERATIVO

### PLAYBOOK_OPERATIVO_DIAGONALE_20250930.md
*Playbook completo per operazioni su Diagonale*

**Procedure Standard:**
- Setup ambiente sviluppo
- Workflow git e deployment
- Testing e quality assurance
- Backup e recovery
- Monitoring e debugging

**Comandi Essenziali:**
```bash
# Sviluppo
npm run dev
npm run build
npm run test

# Backup
npm run backup
npm run restore

# Database
npm run db:migrate
npm run db:seed
```

---

## GUIDE TECNICHE

### ICONS_GUIDE.md
*Guida completa sistema icone*

**Sistema Iconify:**
- Tabler Icons (outline, moderne)
- Lucide Icons (complementari)
- Import: `@/components/icons`
- Sizing: w-4/5/6/8 h-4/5/6/8
- Colors: currentColor (ereditano tema)

**Best Practices:**
- Icone outline per consistency
- Touch targets ≥44px
- Sfondo trasparente
- Hover states con opacity

### HOW_TO_SCROLL.md
*Guida gestione scroll e layout*

**Principi Scroll:**
- Solo liste/card scrollabili
- Header/titoli sempre fissi
- Bottom bar mai coperta
- Safe area iOS/Android

**Pattern Standard:**
```css
.scroll-container {
  height: calc(100dvh - var(--header-height) - var(--bottom-nav-total));
  overflow-y: auto;
  touch-action: pan-y;
  overscroll-behavior: contain;
}
```

### KEEPALIVE.md
*Guida sistema keepalive e sessioni*

**Gestione Sessioni:**
- Heartbeat ogni 60s
- Body scroll lock sui modali
- Session storage per persistenza
- Cleanup su logout/timeout

### PAGELLA_SHARED_README.md
*Documentazione sistema Pagella*

**Architettura Modulare:**
- usePagellaLogic.ts (134 righe)
- usePagellaPermissions.ts (8 righe)
- PagellaHeader.tsx (32 righe)
- PagellaEditor.tsx (42 righe)
- PagellaNavigation.tsx (26 righe)

---

## MAPPE E DIPENDENZE

### MAPPA_IMPORTS_20250930.txt
*Mappa completa dipendenze tra screens*

**Dipendenze Principali:**
```
App.tsx
├── hooks/useAppRouter.ts
├── hooks/useAppState.ts
├── hooks/useAppNavigation.ts
├── hooks/useAppEffects.ts
└── providers/AppProvider.tsx

ScreenRouter.tsx
├── screens/AuthScreen.tsx
├── screens/AdminScreen.tsx
├── screens/EventListScreen.tsx
├── screens/EventDetailsScreen.tsx
├── screens/SimpleVotingScreen.tsx
├── screens/EventResultsScreen.tsx
├── screens/HistoricEventsScreen.tsx
├── screens/EventReportScreen.tsx
├── screens/PagellaScreen.tsx
└── screens/AdminEventManagementScreen.tsx
```

### MAPPA_ENDPOINT_20250930.txt
*Mappa endpoint API backend*

**Route Modulari:**
```
server/routes/
├── index.ts (router principale)
├── health.ts (GET /api/health)
├── auth.ts (POST /api/auth/*)
├── users.ts (GET/POST/PUT/DELETE /api/users/*)
├── events.ts (GET/POST/PUT/DELETE /api/events/*)
├── wines.ts (GET/POST/PUT/DELETE /api/wines/*)
├── votes.ts (GET/POST/PUT/DELETE /api/votes/*)
└── reports.ts (GET /api/reports/*)
```

---

## HOW-TO E BEST PRACTICES

### Modularizzazione Screen
**Pattern Standard:**
1. Analizza complessità (righe, responsabilità)
2. Identifica hook logici da estrarre
3. Scomponi UI in componenti coesi
4. Mantieni API pubbliche invariate
5. Test regressioni complete

**Target Metriche:**
- Screen principale: ≤100 righe
- Hook logici: 50-150 righe
- Componenti UI: 30-80 righe
- Zero breaking changes

### Performance Optimization
**Lazy Loading:**
```typescript
const Screen = lazy(() => import('./screens/Screen'));
```

**Memoization:**
```typescript
const MemoComponent = memo(Component);
const memoizedValue = useMemo(() => computation, [deps]);
```

**Query Optimization:**
```typescript
const { data } = useQuery({
  queryKey: ['key'],
  staleTime: 5 * 60 * 1000, // 5min
  cacheTime: 10 * 60 * 1000, // 10min
});
```

### Mobile Best Practices
**Touch & Gestures:**
- `touch-action: pan-y` per scroll verticale
- `overscroll-behavior: contain` per iOS
- `-webkit-overflow-scrolling: touch` per smooth

**Safe Area:**
```css
.container {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}
```

**Responsive Design:**
- Mobile-first approach
- Touch targets ≥44px
- Viewport units: dvh, dvw
- Flexible layouts con flexbox/grid

---

## ARCHITETTURA FINALE

### Frontend (Client)
```
client/src/
├── components/
│   ├── screens/ (10 screens modulari)
│   ├── modals/ (BaseModal + specifici)
│   ├── navigation/ (BottomNavBar unificato)
│   └── ui/ (componenti riutilizzabili)
├── hooks/ (15 hook specializzati)
├── lib/ (utilities e helpers)
└── providers/ (context providers)
```

### Backend (Server)
```
server/
├── routes/ (8 moduli per dominio)
├── middleware/ (auth, cors, logging)
├── utils/ (helpers e utilities)
└── types/ (TypeScript definitions)
```

### Shared
```
shared/
├── schema.ts (tipi condivisi)
└── constants.ts (costanti globali)
```

---

*File consolidato generato il 01/10/2025 - Contiene guide, mappe e best practices del progetto Diagonale*
