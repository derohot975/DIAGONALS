# 🎛️ DIAGONALE — Analisi Dettagliata Modali

## 🎯 **ANALISI DETTAGLIATA MODALI**

### **AddUserModal** (`/client/src/components/modals/AddUserModal.tsx`)

| **Aspetto** | **Dettagli** |
|-------------|-------------|
| **Identità** | Modal aggiunta utenti |
| **File Path** | `/client/src/components/modals/AddUserModal.tsx` |
| **Trigger** | Admin → Add User button |
| **Dipendenze** | BaseModal, form validation |
| **Permission** | Admin access only |

#### **Stato & Dati**
- **Form Fields**: name (string), isAdmin (boolean checkbox)
- **Validation**: Nome required, unique name check
- **State**: Local form state con controlled inputs
- **Default**: isAdmin = false

#### **Eventi & Handler**
- **onAddUser**: L175 `App.tsx` → userHandlers.addUser → createUserMutation
- **onClose**: Reset form state + close modal
- **Form Submit**: Validation → API call → success toast → close
- **Input Events**: Real-time validation feedback

#### **API Calls**
- **POST** `/api/users` - Payload: `{name, isAdmin}` - Response: `User`

#### **UI States**
- **Form**: Input validation con error messages
- **Loading**: Submit spinner durante API call
- **Success**: Toast notification + auto-close
- **Error**: Error toast per duplicati o errori API

---

### **EditUserModal** (`/client/src/components/modals/EditUserModal.tsx`)

| **Aspetto** | **Dettagli** |
|-------------|-------------|
| **Identità** | Modal modifica utenti |
| **File Path** | `/client/src/components/modals/EditUserModal.tsx` |
| **Trigger** | Admin → Edit user icon |
| **Dipendenze** | BaseModal, editingUser state |
| **Data Source** | appState.editingUser |

#### **Stato & Dati**
- **Form Fields**: Pre-filled da editingUser (name, isAdmin)
- **Validation**: Nome required, unique check
- **State**: Controlled inputs con pre-population
- **Condition**: Requires editingUser non-null

#### **Eventi & Handler**
- **onUpdateUser**: L382 `App.tsx` → updateUserMutation
- **onClose**: Clear editingUser + close modal
- **Form Submit**: Validation → API call → success handling
- **Pre-fill**: Auto-populate da editingUser data

#### **API Calls**
- **PUT** `/api/users/:id` - Payload: `{name, isAdmin}` - Response: `User`

#### **UI States**
- **Pre-populated Form**: Fields filled da existing data
- **Loading**: Update spinner durante API call
- **Success**: Toast + close + clear editingUser
- **Error**: Error handling per validation failures

---

### **CreateEventModal** (`/client/src/components/modals/CreateEventModal.tsx`)

| **Aspetto** | **Dettagli** |
|-------------|-------------|
| **Identità** | Modal creazione eventi |
| **File Path** | `/client/src/components/modals/CreateEventModal.tsx` |
| **Trigger** | Admin → Create Event |
| **Dipendenze** | BaseModal, date picker |
| **Permission** | Logged user required |

#### **Stato & Dati**
- **Form Fields**: name (string), date (date), mode (select)
- **Validation**: All fields required
- **State**: Local form state multi-step
- **Options**: Mode dropdown con opzioni predefinite

#### **Eventi & Handler**
- **onCreateEvent**: L205 `App.tsx` → createEventMutation
- **onClose**: Reset form state
- **Form Submit**: Full validation → API call → navigation
- **Date Selection**: Date picker integration

#### **API Calls**
- **POST** `/api/events` - Payload: `{name, date, mode, createdBy}` - Response: `WineEvent`

#### **UI States**
- **Multi-step Form**: Progressive form completion
- **Loading**: Create spinner
- **Success**: Navigate to events + toast
- **Validation**: Real-time field validation

---

### **EditEventModal** (`/client/src/components/modals/EditEventModal.tsx`)

| **Aspetto** | **Dettagli** |
|-------------|-------------|
| **Identità** | Modal modifica eventi |
| **File Path** | `/client/src/components/modals/EditEventModal.tsx` |
| **Trigger** | Admin → Edit event |
| **Dipendenze** | BaseModal, editingEvent |
| **Data Source** | appState.editingEvent |

#### **Stato & Dati**
- **Form Fields**: Pre-filled da editingEvent (name, date, mode)
- **Validation**: All fields required
- **State**: Controlled inputs con pre-population
- **Condition**: Requires editingEvent non-null

#### **Eventi & Handler**
- **onUpdateEvent**: L213 `App.tsx` → updateEventMutation
- **onClose**: Clear editingEvent + close modal
- **Form Submit**: Validation → API call → success handling
- **Pre-fill**: Auto-populate da existing event data

#### **API Calls**
- **PUT** `/api/events/:id` - Payload: `{name, date, mode}` - Response: `WineEvent`

#### **UI States**
- **Pre-populated Form**: Fields filled da existing data
- **Loading**: Update spinner
- **Success**: Toast + close + clear editingEvent
- **Error**: Validation error handling

---

### **WineRegistrationModal** (`/client/src/components/modals/WineRegistrationModal.tsx`)

| **Aspetto** | **Dettagli** |
|-------------|-------------|
| **Identità** | Modal registrazione/modifica vini |
| **File Path** | `/client/src/components/modals/WineRegistrationModal.tsx` |
| **Trigger** | Event → Register Wine / Edit Wine |
| **Dipendenze** | BaseModal, complex wine form |
| **Mode** | Create/Edit based on editingWine |

#### **Stato & Dati**
- **Form Fields**: type, name, producer, grape, year, origin, price, alcohol (optional)
- **Validation**: All required except alcohol
- **State**: Complex form state con multiple fields
- **Mode Detection**: editingWine ? Edit : Create

#### **Eventi & Handler**
- **onRegisterWine**: L223 `App.tsx` → handleRegisterWine
- **onClose**: Clear editingWine + close modal
- **Form Submit**: Validation → Create/Update wine
- **Type Selection**: Wine type dropdown (Bianco/Rosso/Bollicina)

#### **API Calls**
- **POST** `/api/wines` - Create mode - Payload: wine data + eventId + userId
- **PUT** `/api/wines/:id` - Edit mode - Payload: updated wine data

#### **UI States**
- **Multi-field Form**: Complex wine data entry
- **Loading**: Submit spinner
- **Success**: Toast + close + refresh wines
- **Mode Indicator**: Create vs Edit visual cues

---

### **AdminPinModal** (`/client/src/components/AdminPinModal.tsx`)

| **Aspetto** | **Dettagli** |
|-------------|-------------|
| **Identità** | Modal protezione admin |
| **File Path** | `/client/src/components/AdminPinModal.tsx` |
| **Trigger** | Admin action protection |
| **Dipendenze** | BaseModal, PIN validation |
| **Security** | Protects admin operations |

#### **Stato & Dati**
- **Form Field**: PIN input (4 digits)
- **Storage**: localStorage admin PIN check
- **Validation**: 4-digit PIN format + match check
- **Security**: No API call, local validation only

#### **Eventi & Handler**
- **onSuccess**: L179 `App.tsx` → execute pending admin action
- **onClose**: L189 `App.tsx` → cancel pending action
- **PIN Check**: Against localStorage stored PIN
- **Callback Execution**: Execute pendingAdminCallback on success

#### **API Calls**
- **None** - localStorage validation only

#### **UI States**
- **PIN Input**: 4-digit numeric input
- **Loading**: Validation processing
- **Error**: Invalid PIN error message
- **Success**: Auto-close + execute action

---

### **ChangeAdminPinModal** (`/client/src/components/modals/ChangeAdminPinModal.tsx`)

| **Aspetto** | **Dettagli** |
|-------------|-------------|
| **Identità** | Modal cambio PIN admin |
| **File Path** | `/client/src/components/modals/ChangeAdminPinModal.tsx` |
| **Trigger** | Admin → Change PIN |
| **Dipendenze** | BaseModal, PIN validation |
| **Security** | Updates admin PIN |

#### **Stato & Dati**
- **Form Field**: New PIN input (4 digits)
- **Validation**: 4-digit PIN format
- **Storage**: localStorage PIN update
- **Security**: Local PIN management

#### **Eventi & Handler**
- **onSuccess**: L195 `App.tsx` → handleChangeAdminPin
- **onClose**: Close modal without changes
- **PIN Save**: Update localStorage admin PIN
- **Success Feedback**: Toast notification

#### **API Calls**
- **None** - localStorage update only

#### **UI States**
- **New PIN Form**: 4-digit input
- **Loading**: Save processing
- **Success**: Toast + auto-close
- **Validation**: Real-time PIN format check

---

### **EventReportModal** (`/client/src/components/modals/EventReportModal.tsx`)

| **Aspetto** | **Dettagli** |
|-------------|-------------|
| **Identità** | Modal report eventi (LEGACY) |
| **File Path** | `/client/src/components/modals/EventReportModal.tsx` |
| **Status** | **DUPLICATO** - Sostituito da EventReportScreen |
| **Usage** | Non utilizzato nel codice attuale |

#### **Stato & Dati**
- **Status**: LEGACY/UNUSED
- **Replacement**: EventReportScreen.tsx
- **Note**: Candidato per rimozione

#### **Eventi & Handler**
- **Status**: Non utilizzato
- **Replacement**: Funzionalità migrate a EventReportScreen

#### **API Calls**
- **Status**: Non applicabile

#### **UI States**
- **Status**: Component non utilizzato

---

## 🔄 **MATRIX MODALI ↔ TRIGGER SOURCES**

| **Modal** | **Trigger Source** | **App State** | **Handler** |
|-----------|-------------------|---------------|-------------|
| **AddUserModal** | AdminScreen → Add User | `showAddUserModal` | `handleShowAddUserModal` |
| **EditUserModal** | AdminScreen → Edit User | `showEditUserModal` + `editingUser` | `handleShowEditUserModal` |
| **CreateEventModal** | AdminScreen → Create Event | `showCreateEventModal` | `handleShowCreateEventModal` |
| **EditEventModal** | AdminEventManagement → Edit | `showEditEventModal` + `editingEvent` | `handleEditEvent` |
| **WineRegistrationModal** | EventDetails → Register/Edit | `showWineRegistrationModal` + `editingWine` | `handleShowWineRegistration` |
| **AdminPinModal** | Any Admin Action | `showAdminPinModal` + `pendingAdminAction` | Admin protection system |
| **ChangeAdminPinModal** | AdminScreen → Change PIN | `showChangeAdminPinModal` | `handleShowChangeAdminPin` |

## 🎛️ **PATTERN MODALI COMUNI**

### **BaseModal Integration**
- Tutti i modali estendono BaseModal per consistency
- Gestione focus trap e overlay standard
- Close on ESC e outside click
- Z-index management centralizzato

### **Form Validation Pattern**
- Controlled inputs con state locale
- Real-time validation feedback
- Submit prevention se validation fails
- Error handling standardizzato

### **State Management Pattern**
- App-level state per show/hide
- Editing state per pre-population (editingUser, editingEvent, editingWine)
- Clear state on close per cleanup

### **API Integration Pattern**
- React Query mutations per API calls
- Loading states durante operations
- Success/Error handling con toast notifications
- Optimistic updates dove appropriato

### **Security Considerations**
- AdminPinModal protection per admin operations
- localStorage PIN management (no server-side)
- Input sanitization e validation
- Permission checks prima di show modal
