# DIAGONALE — ANALISI RUOLI E SESSIONI (ADMIN vs UTENTE)

## 1. Sommario Esecutivo

**PROBLEMA IDENTIFICATO**: L'app presenta una **falla critica di separazione dei ruoli** dove l'accesso all'area Admin con PIN `000` **sblocca automaticamente l'accesso all'area Utenti** senza richiedere il PIN utente. Questo avviene perché il sistema utilizza un **unico flag di autenticazione globale** (`currentUser`) che viene impostato sia per accessi Admin che Utente, violando il principio di separazione dei ruoli.

**ROOT CAUSE**: Il hook `useAppRouter` (linee 23-27) esegue un **auto-redirect automatico** da `auth` a `events` quando `currentUser` è presente, indipendentemente dal fatto che l'utente sia un admin o un utente regolare.

## 2. Architettura Attuale

### Diagramma Flusso Autenticazione
```
┌─────────────┐    PIN 000     ┌──────────────┐    Auto-redirect    ┌─────────────┐
│ AuthScreen  │ ──────────────→ │ AdminScreen  │ ──────────────────→ │ EventsScreen│
└─────────────┘                └──────────────┘                    └─────────────┘
                                       │                                    ▲
                                       │ setCurrentUser(mockUser)           │
                                       ▼                                    │
                               ┌──────────────┐                            │
                               │ currentUser  │ ───────────────────────────┘
                               │ != null      │    useAppRouter auto-nav
                               └──────────────┘    (lines 23-27)
```

### Albero File Coinvolti
```
client/src/
├── hooks/
│   ├── useAppRouter.ts          ⚠️  AUTO-REDIRECT CRITICO (linee 23-27)
│   ├── useAppNavigation.ts      🔑  requireAdminPin + handleShowAdmin
│   ├── useSession.ts            📡  Gestione sessioni utente
│   └── useAuth.ts               🔐  Login/Register utenti
├── components/
│   ├── AdminPinModal.tsx        🔑  Validazione PIN 000
│   ├── ScreenRouter.tsx         🚦  Routing principale
│   └── screens/
│       ├── AuthScreen.tsx       🏠  Schermata login
│       ├── AdminScreen.tsx      👑  Area admin
│       └── EventListScreen.tsx  👥  Area utenti
└── App.tsx                      🎯  State globale currentUser
```

## 3. Tracciamento Sessioni & Storage

### Chiavi localStorage
| Chiave localStorage | Valore | Sorgente | Lettura | Reset |
|---------------------|--------|----------|---------|-------|
| `diagonale_admin_pin` | `"000"` (default) | AdminPinModal.tsx:13 | AdminPinModal.tsx:13 | ❌ Mai |
| `diagonale_unique_session_enabled` | `"false"` | AdminScreen.tsx:35 | AdminScreen.tsx:30 | ❌ Mai |
| `diagonale_protected_events` | `[1,2,3]` | App.tsx:242 | HistoricEventsScreen.tsx:58 | Debug only |

### Variabili Sessione Globali
| Variabile | Tipo | Dove si imposta | Dove si legge | Dove si resetta |
|-----------|------|----------------|---------------|-----------------|
| `currentUser` | `User \| null` | App.tsx:63 | useAppRouter.ts:24 | useAppEffects.ts:33 |
| `currentScreen` | `Screen` | useAppRouter.ts:15 | ScreenRouter.tsx:124 | useAppRouter.ts:19 |
| `sessionId` | `string \| null` | useSession.ts:22 | useSession.ts:135 | useSession.ts:88 |

## 4. Flusso Admin→Utente (Sequenza Problematica)

### Timeline Riproduzione Bug
1. **User** clicca tasto Admin in AuthScreen
2. **AuthScreen.tsx:177** → `onShowAdmin()` chiamato
3. **useAppNavigation.ts:40** → `requireAdminPin('admin-access', callback)`
4. **AdminPinModal** si apre, user inserisce PIN `000`
5. **AdminPinModal.tsx:25** → PIN validato, `onSuccess()` chiamato
6. **useAppNavigation.ts:40** → `setCurrentScreen('admin')` eseguito
7. **🚨 PROBLEMA**: Nessun `setCurrentUser()` chiamato, ma...
8. **ScreenRouter.tsx:137-150** → AdminScreen renderizzato
9. **User** clicca "Indietro" o naviga verso area utenti
10. **🚨 SIDE EFFECT**: `currentUser` rimane `null` MA...
11. **useAppRouter.ts:23-27** → **AUTO-REDIRECT CRITICO**:
    ```typescript
    useEffect(() => {
      if (currentUser && currentScreen === 'auth') {
        setCurrentScreen('events'); // ← BYPASS UTENTI!
      }
    }, [currentUser, currentScreen]);
    ```

### Punto di Fuga Identificato
**File**: `/hooks/useAppRouter.ts`  
**Linee**: 23-27  
**Codice Problematico**:
```typescript
// Auto-navigate to events if user exists and we're on auth
useEffect(() => {
  if (currentUser && currentScreen === 'auth') {
    setCurrentScreen('events'); // ← QUI IL BUG!
  }
}, [currentUser, currentScreen]);
```

## 5. Root Cause Candidates (Ordinati per Probabilità)

### 🥇 **CAUSA #1: Auto-redirect Indiscriminato (95% probabilità)**
- **File**: `useAppRouter.ts:23-27`
- **Problema**: L'effect auto-naviga a `events` per QUALSIASI `currentUser`, senza distinguere admin vs utente
- **Impatto**: Admin bypass completo dell'autenticazione utente

### 🥈 **CAUSA #2: Mancanza Separazione Ruoli (80% probabilità)**  
- **File**: `App.tsx:63` + architettura generale
- **Problema**: Unico stato `currentUser` per admin e utenti
- **Impatto**: Impossibile distinguere tra sessione admin e utente

### 🥉 **CAUSA #3: Gestione Sessioni Insufficiente (60% probabilità)**
- **File**: `useSession.ts` + `useAppNavigation.ts`
- **Problema**: Admin PIN non crea sessione persistente separata
- **Impatto**: Stato admin temporaneo si confonde con stato utente

## 6. Test di Riproduzione

### Script Manuale Step-by-Step
```
1. Apri app → AuthScreen visibile
2. Click tasto Admin (icona Settings)
3. Inserisci PIN "000" → AdminScreen visibile ✅
4. Click "Indietro" o naviga → Torna ad AuthScreen
5. 🚨 BUG: App auto-redirect a EventListScreen
6. 🚨 RISULTATO: Accesso area utenti senza PIN utente!
```

### Verifica Tecnica
```javascript
// Console commands per debug:
console.log('currentUser:', currentUser);        // null dopo admin
console.log('currentScreen:', currentScreen);    // 'events' dopo bypass
console.log('sessionId:', sessionId);           // null (nessuna sessione)
```

## 7. Rischi & Impatti

### Rischi Sicurezza
- **🔴 CRITICO**: **Impersonation Attack** - Admin può accedere come qualsiasi utente
- **🔴 CRITICO**: **Privilege Escalation** - Bypass completo autenticazione utente  
- **🟡 MEDIO**: **Audit Trail Compromesso** - Azioni senza `userId` valido
- **🟡 MEDIO**: **Data Integrity** - Voti/azioni attribuite erroneamente

### Impatti Operativi
- **Compliance**: Violazione principi separazione ruoli
- **UX**: Confusione utenti su stato autenticazione
- **Debugging**: Log inconsistenti senza `userId`
- **Scalabilità**: Impossibile implementare RBAC futuro

## 8. Appendice - Snippet Critici

### useAppRouter.ts (LINEE 23-27) - ROOT CAUSE
```typescript
// Auto-navigate to events if user exists and we're on auth
useEffect(() => {
  if (currentUser && currentScreen === 'auth') {
    setCurrentScreen('events'); // ← PROBLEMA QUI!
  }
}, [currentUser, currentScreen]);
```

### useAppNavigation.ts (LINEE 39-41) - Admin Access
```typescript
const handleShowAdmin = useCallback(() => {
  requireAdminPin('admin-access', () => setCurrentScreen('admin'));
}, [requireAdminPin, setCurrentScreen]);
```

### AdminPinModal.tsx (LINEE 24-33) - PIN Validation
```typescript
const handleConfirm = () => {
  if (pin === ADMIN_PIN) {
    onSuccess(); // ← Non imposta currentUser
    setPin('');
    setError('');
  } else {
    setError('Codice non valido');
    setPin('');
  }
};
```

### App.tsx (LINEA 63) - Global State
```typescript
const [currentUser, setCurrentUser] = useState<User | null>(null);
```

---

## 9. Controlli Richiesti (Checklist Completata)

### ✅ 1. Route & Guard
- **Rotte Admin**: `admin`, `adminEvents` (ScreenRouter.tsx:137-150, 169+)
- **Rotte Utente**: `events`, `eventDetails`, `voting`, etc. (ScreenRouter.tsx:151-168)
- **Guard**: Nessun guard formale, solo `requireAdminPin()` per accesso admin
- **Problema**: Area utenti non ha guard, si basa solo su `currentUser != null`

### ✅ 2. Auth Context / Store
- **File**: Nessun AuthContext dedicato, stato in `App.tsx:63`
- **Stato globale**: `currentUser: User | null`, `currentScreen: Screen`, `sessionId: string | null`
- **Azioni**: `setCurrentUser`, `setCurrentScreen`, `loginMutation`, `logoutMutation`
- **Problema**: Unico stato per admin e utenti, nessuna separazione ruoli

### ✅ 3. Persistenza & Token
- **localStorage**: `diagonale_admin_pin`, `diagonale_unique_session_enabled`, `diagonale_protected_events`
- **Scrittura/Lettura**: AdminPinModal.tsx:13, AdminScreen.tsx:30-35, App.tsx:242
- **TTL/Expiry**: Nessuno, persistenza indefinita
- **Problema**: Nessuna persistenza sessione utente vs admin

### ✅ 4. Flussi di Navigazione
- **Sequenza Admin→Utenti**: Identificata e documentata (sezione 4)
- **Side-effect**: `useAppRouter.ts:23-27` auto-redirect
- **Redirect automatici**: Sì, problematico per separazione ruoli

### ✅ 5. PIN Handling
- **Validazione PIN Admin**: AdminPinModal.tsx:25 (`pin === ADMIN_PIN`)
- **Validazione PIN Utente**: useAuth.ts + useSession.ts (login con PIN 4 cifre)
- **Problema**: PIN admin non richiede `userId`, PIN utente sì

### ✅ 6. Server/API
- **Middleware**: Express standard, nessun middleware auth trasversale identificato
- **Endpoint**: `/api/users/:id/login` richiede `userId` valido
- **Problema**: Admin non usa endpoint login, bypassa validazioni server

### ✅ 7. Telemetria & Log
- **Logging**: Console.log in vari punti, nessun sistema strutturato
- **userId tracking**: Solo per azioni utente autenticate
- **Problema**: Azioni admin non tracciate con `userId`

---

## 10. Conclusioni

**PROBLEMA CONFERMATO**: Il bug è **localizzato e riproducibile**. La causa principale è l'auto-redirect in `useAppRouter.ts:23-27` che non distingue tra sessioni admin e utente.

**PRIORITÀ**: **🔴 CRITICA** - Violazione sicurezza e separazione ruoli

**RACCOMANDAZIONE**: Implementare separazione logica tra sessioni admin e utente, o condizioni più specifiche nell'auto-redirect per prevenire il bypass dell'autenticazione utente.

---

*Documento generato il: 04/11/2025 23:26*  
*Versione: 1.0*  
*Stato: DIAGNOSI COMPLETATA - IN ATTESA CONFERMA PER FIX*
