# 🍷 DIAGONALE - Piano di Lavoro (Mobile PWA Perfect)

## 🎯 Obiettivi
- [x] **Stabilità Architetturale**: Refactoring grandi file (>300 righe) per manutenibilità.
- [x] **Performance**: LCP reale ~1.7s (2.3s incluso SplashScreen da 3s design-intenzionale).
- [x] **Design**: UI minimale stile Apple — coerente su tutte le 10+ schermate.
- [x] **UX Mobile**: Touch, haptic feedback, scrolling ottimizzato.
- [x] **Robustezza**: Fix bug React "setState durante render" in ScreenRouter via useEffect.
- [x] **Governance**: Nessun file > 300 righe; nessun tocco DB; nessun commit.

## 🛠️ Task Completati

### Architettura
- `T001`: Fix compatibilità Node 18 (`import.meta.dirname` → `fileURLToPath`).
- `T002`: Refactoring `App.tsx` (671 → 229 righe) con `AppModals` e `useAppHandlers`.
- `T003`: Refactoring `ManageEventModal` (447 → 117 righe) con `ManageEventSteps`.
- `T006`: Refactoring `ScreenRouter.tsx` — auth guards via `useEffect` (fix critico React).

### Design Apple-Style
- `T004`: `BottomNavBar` floating glassmorphism + `VoteScrollPicker` aptico + `BaseModal` glass.
- `T005`: `EventListScreen` — dark gradient, frosted-glass cards, tipografia white.
- `T007`: `AdminEventManagementScreen` — clean white/card layout.
- `T008`: `AuthScreen` — dark con keypad PIN minimalista.
- `T009`: `HistoricEventsScreen` — dark cards, long-press preserved.
- `T010`: `AdminScreen` — lista utenti con icone colorate per azione.
- `T011`: `EventReportScreen` — ranking cards oro/argento/bronzo.
- `T012`: `EventResultsScreen` + `ResultCard` + `ResultsHeader` + `CollapsibleDetails` — dark coerente.
- `T013`: `SimpleVotingScreen` + `WineListItem` + `EventInfo` + `WineList` — dark theme.
- `T014`: `EventDetailsScreen` + `EventContainer` + `ProgressBar` — dark coerente.

## 📋 Task Futuri (Ottimizzazione Opzionale)
- `T015`: Test safe areas su device fisico con notch (iPhone notch, Android punch-hole).
- `T016`: Analisi `WineCard.tsx` + `WinesGrid.tsx` per eventuale allineamento dark theme.
- `T017`: Analisi `PagellaScreen` e sub-componenti per coerenza.
- `T018`: Profiling performance in produzione (deployment).

## ⚠️ Vincoli Obbligatori
- **DB Safety**: MAI toccare records o schema del DB Supabase senza autorizzazione.
- **Governance**: Mantenere file < 300 righe; nessun commit da Agent.
- **Costi**: Inserire report costi in ogni intervento.

---
*Ultimo aggiornamento: 25 Febbraio 2026*
