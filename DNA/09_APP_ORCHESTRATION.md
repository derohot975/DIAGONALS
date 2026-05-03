# App Orchestration

## Root composition

`client/src/App.tsx`:

- AppProvider (QueryClient)
- AppShell
- ScreenRouter
- Modali globali (AppModals)
- SearchOverlayContext provider

## Blocchi orchestrati

### Router

`ScreenRouter` gestisce transizioni schermate basate su stato auth + navigation state.

### App state

`useAppState` gestisce:
- users list
- events list
- current event
- current user
- selected user

### Navigation

`useAppNavigation` gestisce:
- navigateTo*
- auth flow
- admin PIN flow

### Handlers

`useAppHandlers` gestisce:
- event handlers
- UI handlers
- user handlers

### Mutations

`useEventMutations`, `useUserMutations`, `useWineMutations` gestiscono:
- create/update/delete
- optimistic updates TanStack Query

### Auth/session

`useAuth` + `useSession` gestiscono login/logout/heartbeat.

## Data fetching queries

- `useQuery(['users'])` per lista utenti
- `useQuery(['events'])` per lista eventi
- `useQuery(['event', id])` per dettaglio evento
- `useQuery(['wines', eventId])` per vini evento
- `useQuery(['votes', eventId])` per voti evento

## Rendering order

1. Splash screen
2. Loading skeleton
3. Auth screen (se non auth)
4. Event list / event details / results / admin

## Modal orchestration

`AppModals` espone:
- AddUserModal
- CreateEventModal
- WineRegistrationModal
- EditEventModal
- ManageEventModal
- EventReportModal
- ChangeAdminPinModal
- EditUserModal

Tutte le modali usano prop `open` per visibilità (non `isOpen`/`visible`).

## Safe mode / Service Worker setup

`client/src/main.tsx`:

- Safe mode iOS flags su `window.__DIAGONALE_SAFE_MODE__`
- Service worker registration deferred se abilitato.
