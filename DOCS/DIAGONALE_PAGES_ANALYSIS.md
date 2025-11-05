# 📄 DIAGONALE — Analisi Dettagliata Pagine

## 🎯 **ANALISI DETTAGLIATA PAGINE**

### **AuthScreen** (`/client/src/components/screens/AuthScreen.tsx`)

| **Aspetto** | **Dettagli** |
|-------------|-------------|
| **Identità** | Login/Register screen, Route: 'auth' |
| **File Path** | `/client/src/components/screens/AuthScreen.tsx` |
| **Dipendenze** | `useAuth`, `useToast`, form validation |
| **Trigger** | App start, logout, session expired |

#### **Stato & Dati**
- **State Locali**: `authLoading: boolean`, `authError: string | null`
- **Validazione**: PIN 4 cifre numeriche, nome required
- **Storage**: localStorage per session persistence
- **Default**: Redirect automatico se già autenticato

#### **Eventi & Handler**
- **onLogin**: L155 `App.tsx` → `handleLogin` → API call + navigation
- **onRegister**: L164 `App.tsx` → `handleRegister` → API call + navigation  
- **onShowAdmin**: Admin panel access (no auth required)
- **Form validation**: Real-time PIN format check

#### **API Calls**
- **POST** `/api/auth/login` - Payload: `{name, pin}` - Response: `User`
- **POST** `/api/auth/register` - Payload: `{name, pin, isAdmin}` - Response: `User`

#### **UI States**
- **Loading**: Spinner durante autenticazione
- **Error**: Toast destructive per errori
- **Success**: Navigate to 'events' + toast success
- **Form**: Controlled inputs con validation

---

### **EventListScreen** (`/client/src/components/screens/EventListScreen.tsx`)

| **Aspetto** | **Dettagli** |
|-------------|-------------|
| **Identità** | Home principale, Route: 'events' |
| **File Path** | `/client/src/components/screens/EventListScreen.tsx` |
| **Dipendenze** | EventCard, BottomNavBar, useOptimizedQueries |
| **Auto-navigation** | Da auth se logged in |

#### **Stato & Dati**
- **Data Arrays**: `events[]`, `users[]`, `wines[]`, `votes[]`
- **Filtering**: Eventi per status, vini per utente corrente
- **Cache**: 5min staleTime per events, 2min per wines
- **State**: selectedEventId per navigation

#### **Eventi & Handler**
- **onShowEventDetails**: Navigate to eventDetails + setSelectedEventId
- **onParticipateEvent**: Smart navigation basata su event.votingStatus
- **onRegisterWine**: Trigger WineRegistrationModal
- **onShowEventResults**: Navigate to results se votingStatus completed
- **onEditWine**: Find user wine + trigger modal

#### **API Calls**
- **GET** `/api/events` - Cache 5min - Response: `WineEvent[]`
- **GET** `/api/users` - Cache 10min - Response: `User[]`
- **GET** `/api/wines` - Cache 2min - Response: `Wine[]`
- **GET** `/api/votes?eventId=X` - Conditional on selectedEventId

#### **UI States**
- **Empty**: "Nessun evento disponibile" con call-to-action
- **Loading**: Skeleton cards durante fetch
- **Cards**: Status-based styling (registration/voting/completed)
- **Actions**: Conditional buttons per event status

---

### **AdminScreen** (`/client/src/components/screens/AdminScreen.tsx`)

| **Aspetto** | **Dettagli** |
|-------------|-------------|
| **Identità** | Pannello amministrativo, Route: 'admin' |
| **File Path** | `/client/src/components/screens/AdminScreen.tsx` |
| **Dipendenze** | ParticipantsManager, AdminPinModal |
| **Protection** | AdminPinModal guard per accesso |

#### **Stato & Dati**
- **Data**: `users[]` array da React Query
- **Permission**: Admin PIN required tramite AdminPinModal
- **State**: editingUser per EditUserModal
- **Cache**: Shared users cache con altre pagine

#### **Eventi & Handler**
- **onShowAddUserModal**: Trigger AddUserModal
- **onDeleteUser**: Confirm dialog + deleteUserMutation
- **onChangeAdminPin**: Trigger ChangeAdminPinModal
- **onShowEditUserModal**: Set editingUser + show modal
- **onShowCreateEventModal**: Navigate to event creation
- **onShowEventList**: Navigate to adminEvents

#### **API Calls**
- **GET** `/api/users` - Shared cache - Response: `User[]`
- **DELETE** `/api/users/:id` - Via deleteUserMutation
- **PUT** `/api/users/:id` - Via updateUserMutation

#### **UI States**
- **Grid Layout**: User cards in responsive grid
- **Action Buttons**: Edit/Delete per ogni user
- **Empty State**: "Nessun utente registrato"
- **Loading**: Skeleton durante fetch users

---

### **SimpleVotingScreen** (`/client/src/components/screens/SimpleVotingScreen.tsx`)

| **Aspetto** | **Dettagli** |
|-------------|-------------|
| **Identità** | Votazioni attive, Route: 'voting' |
| **File Path** | `/client/src/components/screens/SimpleVotingScreen.tsx` |
| **Dipendenze** | VotingGrid, VoteScrollPicker, useVotingLogic |
| **Condition** | event.votingStatus === 'active' |

#### **Stato & Dati**
- **Required Data**: `event`, `currentUser` (non-null)
- **Logic Hook**: useVotingLogic per gestione stato votazioni
- **Validation**: Score range 1-10 con incrementi 0.5
- **State**: Current wine, user votes, completion status

#### **Eventi & Handler**
- **Vote Submission**: VoteScrollPicker onChange → voteMutation
- **Score Selection**: 1-10 range con .5 increments
- **Navigation**: Back/Home buttons
- **Auto-redirect**: Se votingStatus cambia a 'completed'

#### **API Calls**
- **POST** `/api/votes` - Payload: `{eventId, wineId, userId, score}`
- **GET** `/api/wines?eventId=X` - Per lista vini da votare
- **Real-time**: Polling per event status changes

#### **UI States**
- **Active Voting**: VoteScrollPicker interface
- **Completed**: Auto-redirect to results
- **Loading**: Wine cards skeleton
- **Progress**: Indicator voti completati

---

### **EventDetailsScreen** (`/client/src/components/screens/EventDetailsScreen.tsx`)

| **Aspetto** | **Dettagli** |
|-------------|-------------|
| **Identità** | Dettagli evento, Route: 'eventDetails' |
| **File Path** | `/client/src/components/screens/EventDetailsScreen.tsx` |
| **Dipendenze** | WinesGrid, WineCard, ProgressBar, EventContainer |
| **Navigation** | Da EventListScreen |

#### **Stato & Dati**
- **Required**: `event`, `wines[]`, `votes[]`, `users[]`
- **Filtering**: Wines by eventId, votes by eventId
- **State**: User wine registration status
- **Progress**: Calcolo partecipanti e vini registrati

#### **Eventi & Handler**
- **onShowWineRegistrationModal**: Trigger modal per registrazione
- **onVoteForWine**: Vote handler (se voting attivo)
- **onParticipateEvent**: Status-based navigation
- **onCompleteEvent**: Admin action per completare evento
- **onShowResults**: Navigate to results

#### **API Calls**
- **GET** `/api/wines?eventId=X` - Wines per evento specifico
- **GET** `/api/votes?eventId=X` - Votes per evento specifico
- **POST** `/api/wines` - Via WineRegistrationModal

#### **UI States**
- **Registration Phase**: Wine registration form
- **Voting Phase**: Vote interface per ogni vino
- **Results Phase**: Results view
- **Progress Bar**: Visual indicator fase evento

---

### **EventResultsScreen** (`/client/src/components/screens/EventResultsScreen.tsx`)

| **Aspetto** | **Dettagli** |
|-------------|-------------|
| **Identità** | Risultati finali, Route: 'eventResults' |
| **File Path** | `/client/src/components/screens/EventResultsScreen.tsx` |
| **Dipendenze** | ResultCard, CollapsibleDetails, useResultsStats |
| **Condition** | event.votingStatus === 'completed' |

#### **Stato & Dati**
- **Data**: `results[]` WineResultDetailed con voti dettagliati
- **Stats Hook**: useResultsStats per statistiche aggregate
- **Expansion**: useResultsExpansion per collapsible details
- **Sorting**: Pre-sorted by averageScore descending

#### **Eventi & Handler**
- **toggleExpandWine**: Collapsible wine details
- **handleExport**: Share/export results functionality
- **Navigation**: Back/Home buttons only
- **No Interactions**: Read-only results view

#### **API Calls**
- **GET** `/api/events/:id/results` - Complete results con voti dettagliati

#### **UI States**
- **Ranked Display**: Position-based styling (1st place gold)
- **Expandable Cards**: Wine details on click
- **Empty State**: "Nessun risultato disponibile"
- **Export Ready**: Formatted per condivisione

---

### **AdminEventManagementScreen** (`/client/src/components/screens/AdminEventManagementScreen.tsx`)

| **Aspetto** | **Dettagli** |
|-------------|-------------|
| **Identità** | Gestione eventi admin, Route: 'adminEvents' |
| **File Path** | `/client/src/components/screens/AdminEventManagementScreen.tsx` |
| **Dipendenze** | useAdminEventManagement, VotingCompletionChecker |
| **Permission** | Admin access required |

#### **Stato & Dati**
- **Data**: `events[]`, `users[]`, `wines[]` per management
- **Logic Hook**: useAdminEventManagement per operazioni
- **Validation**: Voting completion check prima di complete
- **State**: Event status management

#### **Eventi & Handler**
- **onActivateVoting**: Change votingStatus to 'active'
- **onDeactivateVoting**: Change votingStatus to 'completed'
- **onCompleteEvent**: Complete event + generate report
- **onViewReport**: Generate and view event report
- **onEditEvent**: Trigger EditEventModal
- **onDeleteEvent**: Confirm + delete event

#### **API Calls**
- **PATCH** `/api/events/:id/voting-status` - Change voting status
- **POST** `/api/events/:id/complete` - Complete event
- **GET** `/api/events/:id/report` - Generate report
- **DELETE** `/api/events/:id` - Delete event

#### **UI States**
- **Management Interface**: Admin controls per evento
- **Status Indicators**: Visual status per ogni evento
- **Action Buttons**: Edit/Delete/Activate/Complete
- **Validation**: Disable actions se requirements non met

---

### **HistoricEventsScreen** (`/client/src/components/screens/HistoricEventsScreen.tsx`)

| **Aspetto** | **Dettagli** |
|-------------|-------------|
| **Identità** | Eventi storici, Route: 'historicEvents' |
| **File Path** | `/client/src/components/screens/HistoricEventsScreen.tsx` |
| **Filtering** | status === 'completed' events only |
| **Navigation** | From main menu |

#### **Stato & Dati**
- **Data**: `events[]` filtered per completed events
- **Display**: Chronological order (newest first)
- **Cache**: Shared events cache
- **Filter**: Client-side filtering per status

#### **Eventi & Handler**
- **onShowEventResults**: Navigate to results per evento storico
- **onShowPagella**: Navigate to pagella per evento
- **Navigation**: Back/Home buttons
- **No Modifications**: Read-only historical view

#### **API Calls**
- **GET** `/api/events` - Shared cache, client-side filtering

#### **UI States**
- **Historic Cards**: Event summary cards
- **Empty State**: "Nessun evento storico disponibile"
- **Action Buttons**: View Results, View Pagella
- **Chronological**: Date-based sorting

---

### **PagellaScreen** (`/client/src/components/screens/PagellaScreen.tsx`)

| **Aspetto** | **Dettagli** |
|-------------|-------------|
| **Identità** | Pagella personalizzata, Route: 'pagella' |
| **File Path** | `/client/src/components/screens/PagellaScreen.tsx` |
| **Dipendenze** | PagellaEditor, PagellaHeader, usePagellaLogic |
| **Permissions** | usePagellaPermissions per edit control |

#### **Stato & Dati**
- **Required**: `event`, `currentUser`
- **Logic Hook**: usePagellaLogic per gestione contenuto
- **Permissions**: usePagellaPermissions per controllo edit
- **Storage**: pagellaStorage utils per persistence

#### **Eventi & Handler**
- **Edit Operations**: PagellaEditor rich text interface
- **Save Operations**: Auto-save su changes
- **Navigation**: Back/Home buttons
- **Permission Check**: Edit restrictions per user

#### **API Calls**
- **GET** `/api/events/:id/pagella` - Load pagella content
- **PUT** `/api/events/:id/pagella` - Save pagella changes

#### **UI States**
- **Editor Interface**: Rich text editor
- **Permissions**: Edit vs read-only mode
- **Loading**: Editor skeleton durante load
- **Auto-save**: Visual indicator save status

---

### **EventReportScreen** (`/client/src/components/screens/EventReportScreen.tsx`)

| **Aspetto** | **Dettagli** |
|-------------|-------------|
| **Identità** | Report completo evento, Route: 'eventReport' |
| **File Path** | `/client/src/components/screens/EventReportScreen.tsx` |
| **Access** | From AdminEventManagementScreen |
| **Mode** | Read-only report display |

#### **Stato & Dati**
- **Data**: `reportData` EventReportData (pre-loaded)
- **Structure**: userRankings, wineResults, summary stats
- **Display**: Comprehensive formatted report
- **Static**: No dynamic content or interactions

#### **Eventi & Handler**
- **Navigation**: Back/Home buttons only
- **No Interactions**: Pure display component
- **Print-friendly**: Optimized per export/print

#### **API Calls**
- **None** - Data pre-loaded da AdminEventManagementScreen

#### **UI States**
- **Report Layout**: Professional formatted display
- **Static Content**: No loading or interactive states
- **Export Ready**: Formatted per condivisione/stampa
