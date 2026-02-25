# 🍷 DIAGONALE - Piano di Lavoro (Mobile PWA Perfect)

## 🎯 Obiettivi
- [x] **Stabilità Architetturale**: Refactoring grandi file (>300 righe) per manutenibilità.
- [x] **Performance**: Ottimizzazione caricamento (LCP < 300ms).
- [x] **Design**: UI minimale stile Apple (Glassmorphism, Haptic Feedback).
- [x] **UX Mobile**: Perfezionamento interazioni touch e scrolling.
- [ ] **Robustezza**: Gestione errori e feedback utente avanzato.
- [ ] **Refactoring**: Split `ScreenRouter.tsx` per modularità.

## 🛠️ Task Completati
- `T001`: Fix compatibilità Node 18 (`import.meta.dirname` -> `fileURLToPath`).
- `T002`: Refactoring `App.tsx` (671 -> 229 righe) tramite `AppModals` e `useAppHandlers`.
- `T003`: Refactoring `ManageEventModal` (447 -> 117 righe) con `ManageEventSteps`.
- `T004`: Design Refresh (Apple Style):
    - Floating `BottomNavBar` con sfocatura.
    - `VoteScrollPicker` con feedback aptico e animazioni fluide.
    - `BaseModal` con glassmorphism accentuato.
- `T005`: Restyle `EventListScreen` (Card più pulite, contrasto elevato, tipografia migliorata).

## 📋 Task in Corso
- `T006`: Analisi `ScreenRouter.tsx` (294 righe) per eventuale split.
- `T007`: Ottimizzazione `AdminEventManagementScreen.tsx` per coerenza design.
- `T008`: Perfezionamento Safe Areas su dispositivi con Notch (iOS/Android).

## ⚠️ Vincoli Obbligatori
- **DB Safety**: MAI toccare records o schema del DB Supabase senza autorizzazione.
- **Governance**: Mantener file < 300 righe.
- **Costi**: Inserire report costi in ogni intervento.

---
*Ultimo aggiornamento: 25 Febbraio 2026*
