# Modals, Hooks & Handlers

## Modali principali

### Modali operative

- `AddUserModal` - creazione utente con validazione PIN 4 cifre
- `EditUserModal` - modifica utente esistente
- `CreateEventModal` - creazione evento (verifica esistenza user `createdBy`)
- `EditEventModal` - modifica evento esistente
- `WineRegistrationModal` - registrazione vino (type: Bianco/Rosso/Bollicina)
- `ManageEventModal` - gestione evento
- `ManageEventSteps` - steps gestione evento (multi-step workflow)
- `EventReportModal` - report evento
- `ChangeAdminPinModal` - cambio PIN admin con protezione

### Base contract

Tutte le modali usano prop `open` per visibilità (non `isOpen`/`visible`).
BaseModal in `components/ui/BaseModal.tsx` implementa questo contract.

## Hooks principali

### Core hooks

- `useAuth` - login/register via `/api/auth/*`
- `useSession` - session management, heartbeat periodico, logout
- `useAppState` - stato globale app (users, events, currentEvent, currentUser, selectedUser)
- `useAppRouter` - routing con ScreenRouter
- `useAppNavigation` - navigation con navigateTo* methods
- `useAppHandlers` - handlers centralizzati (event, UI, user)
- `useAppEffects` - effects app shell
- `useGuestAuth` - auth guest mode

### Domain hooks

- `useEventMutations` - mutations eventi (create, update, delete, status update)
- `useUserMutations` - mutations utenti (create, update, delete)
- `useWineMutations` - mutations vini (create, update, delete)
- `useEventLogic` - logica evento (voting status, completion check)
- `useLongPress` - long press gesture (500ms delay)

### Screen-specific hooks

- `useVotingLogic` - logica schermata votazione
- `useResultsStats` - statistiche risultati
- `usePagellaLogic` - logica pagella (save, autosave)
- `usePagellaPermissions` - permessi pagella (DERO/TOMMY only)
- `useAdminEventManagement` - gestione admin evento

### UI hooks

- `use-mobile` - mobile detection
- `use-toast` - toast notifications

## Handlers

- `eventHandlers.ts` - handlers eventi (create, update, delete, status)
- `uiHandlers.ts` - handlers UI (modals, navigation, search)
- `userHandlers.ts` - handlers utenti (login, logout, select)

## Search subsystem

- `GlobalWineSearchOverlay` - search overlay globale per vini eventi completati
- `WineSearchOverlay` - search overlay specifico
- `WineSearchCard` - card vino search con details
- `SearchLensButton` - button trigger search
- `SearchOverlayContext` - context provider per search state

## Guardrails

- Prop visibilità: usare solo `open` (boolean) - guard `guard:lens:props` blocca `isOpen`/`visible`
- Z-index: usare solo token da `styles/tokens/zIndex.ts` - guard `guard:lens:zindex` blocca z-index arbitrarie
