# 🍷 DIAGONALE - Piano di Lavoro (Mobile PWA Perfect)

## 🎯 Obiettivi
- [x] **Stabilità Architetturale**: Refactoring grandi file (>300 righe) per manutenibilità.
- [x] **Performance**: Ottimizzazione caricamento (LCP target < 300ms).
- [x] **Design**: UI minimale stile Apple (Glassmorphism, Haptic Feedback).
- [x] **UX Mobile**: Perfezionamento interazioni touch e scrolling.
- [x] **Robustezza**: Fix bug React "setState durante render" in ScreenRouter.
- [x] **Refactoring**: Split `ScreenRouter.tsx` + guards via useEffect.

## 🛠️ Task Completati
- `T001`: Fix compatibilità Node 18 (`import.meta.dirname` → `fileURLToPath`).
- `T002`: Refactoring `App.tsx` (671 → 229 righe) con `AppModals` e `useAppHandlers`.
- `T003`: Refactoring `ManageEventModal` (447 → 117 righe) con `ManageEventSteps`.
- `T004`: Design Refresh (Apple Style): `BottomNavBar` floating, `VoteScrollPicker` aptico, `BaseModal` glassmorphism.
- `T005`: Restyle `EventListScreen` (dark cards, tipografia migliorata, indicatori chiari).
- `T006`: Refactoring `ScreenRouter.tsx` — guards auth via `useEffect` (fix "setState during render").
- `T007`: Restyle `AdminEventManagementScreen` (clean white layout).
- `T008`: Restyle `AuthScreen` (dark glassmorphism, keypad migliorato).
- `T009`: Restyle `HistoricEventsScreen` (dark cards, long-press preserve).
- `T010`: Restyle `AdminScreen` (lista utenti clean, icone colorate).
- `T011`: Restyle `EventReportScreen` (ranking card, badge colorati).

## 📋 Task Rimanenti
- `T012`: Analisi e restyle `EventResultsScreen` + componenti (ResultCard, ResultsHeader, ecc.).
- `T013`: Safe Areas avanzate su notch iOS/Android (test su device reale).
- `T014`: Verifica LCP dopo fix — target < 500ms su connessione lenta.
- `T015`: Analisi `SimpleVotingScreen` e `EventDetailsScreen` per coerenza design.

## ⚠️ Vincoli Obbligatori
- **DB Safety**: MAI toccare records o schema del DB Supabase senza autorizzazione.
- **Governance**: Mantenere file < 300 righe; nessun commit da Agent.
- **Costi**: Inserire report costi in ogni intervento.

---
*Ultimo aggiornamento: 25 Febbraio 2026*
