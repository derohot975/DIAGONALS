# Screens & Flows

## Schermate principali (`client/src/components/screens`)

### AuthScreen

- PIN keypad login/register
- Validazione 4 cifre (regex `/^\d{4}$/`)
- Feedback errori inline
- Toggle login/register mode

### EventListScreen

- Lista eventi con stato
- Filtro stato (registration/voting/completed)
- Badge voting status
- Tap per dettagli evento
- Floating action button per creare evento (admin)

### EventDetailsScreen

- Dettagli evento (name, date, mode, status)
- Lista vini registrati con WineCard
- Partecipanti con registration date
- Azioni admin (modifica, gestione, completamento)
- NavButtons per navigation flow

### SimpleVotingScreen

- Lista vini per voto con WineListItem
- VoteScrollPicker per score 1-10 (supporto .5)
- Swipe navigation tra vini
- Progress bar voti completati
- VotingHeaderBar con event info

### EventResultsScreen

- Ranking vini ordinati per score medio
- Dettagli risultati per vino (CollapsibleDetails)
- ShareButtonBar per share functionality
- Link a PagellaScreen

### EventReportScreen

- Pagella editor (solo DERO/TOMMY autorizzati via `canEditPagella`)
- PagellaHeader con event info
- PagellaEditor per edit content
- PagellaNavigation per save/cancel
- Preview pagella formatted

### HistoricEventsScreen

- Lista eventi completati
- Search lens overlay per ricerca vini cross-event
- Accesso risultati storici

### PagellaScreen

- Visualizzazione pagella evento
- PagellaHeader con event info
- Pagella content formatted
- Actions per admin (edit pagella)

### AdminScreen

- Gestione utenti (AddUserModal, EditUserModal)
- Gestione eventi (CreateEventModal, EditEventModal)
- Admin PIN protection via ChangeAdminPinModal
- Navigation to AdminEventManagementScreen

### AdminEventManagementScreen

- Gestione dettagliata evento
- ParticipantsManager con remove functionality
- VotingCompletionChecker per verifica voti
- Actions: edit event, manage wines, manage participants
- ManageEventSteps per workflow step-by-step

### SplashScreen

- Priorità rendering
- Loading skeleton
- Transition to AuthScreen dopo init

## Flussi utente

### Auth flow

1. SplashScreen
2. AuthScreen (login/register)
3. Select user
4. EventListScreen

### Evento flow

1. Admin crea evento (CreateEventModal)
2. Utenti registrano vini (WineRegistrationModal)
3. Admin attiva voting (PATCH status)
4. Utenti votano (SimpleVotingScreen)
5. Admin verifica completamento (checkEventVotingComplete)
6. Admin completa evento (POST complete)
7. Tutti vedono risultati (EventResultsScreen)

### Admin flow

1. Login admin
2. AdminScreen
3. Gestione utenti/eventi
4. AdminEventManagementScreen per dettagli
5. Pagella editor per report

## Flusso storico

1. `HistoricEventsScreen`
2. Apertura risultati evento storico
3. Accesso pagella evento via `PagellaScreen`

## Flusso pagella

- Header stato save + editor contenuto
- Permessi edit limitati (`usePagellaPermissions`)
- Salvataggio/autosave (`usePagellaLogic`)

## Note UX

- Bottom navigation condivisa (`BottomNavBar`)
- Search overlay globale disponibile da shell
- Layout mobile-first con gestione safe area e scroll
- Bottom navigation per schermate principali
- Search overlay cross-screen per vini eventi completati
- Modal-driven per actions (create/edit/manage)
- Safe transitions per iOS (safe-mode detection)
- Glass morphism UI con tema rosso/bordeauxscroll
