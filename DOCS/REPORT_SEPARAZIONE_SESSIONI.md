# REPORT SEPARAZIONE SESSIONI - PUNTI CRITICI

## Call-Graph Redirect Problematici

### 🚨 ROOT CAUSE: useAppRouter.ts (23-27)
```typescript
if (currentUser && currentScreen === 'auth') {
  setCurrentScreen('events'); // ← BYPASS CRITICO
}
```

### 🔄 Flusso Admin→Utente Identificato
1. **AdminPinModal** → PIN 000 → `onSuccess()`
2. **useAppNavigation.ts:40** → `setCurrentScreen('admin')`
3. **AdminScreen** → `onGoBack()` → `setCurrentScreen('events')` (linea 146)
4. **useAppRouter.ts:23-27** → Auto-redirect se `currentUser != null`

## Punti di Lettura/Scrittura Stato

### currentUser (App.tsx:63)
- **WRITE**: `setCurrentUser` in useSession.ts:87, useAuth.ts
- **READ**: useAppRouter.ts:24, ScreenRouter.tsx:156,187,190
- **PROBLEMA**: Unico flag per admin e utenti

### currentScreen (useAppRouter.ts:15)
- **WRITE**: `setCurrentScreen` in 15+ punti
- **READ**: ScreenRouter.tsx:124, useAppRouter.ts:24
- **PROBLEMA**: AdminScreen.onGoBack → events senza guard

### sessionId (useSession.ts:22)
- **WRITE**: useSession.ts:88 (logout), loginMutation
- **READ**: useSession.ts:107,135
- **PROBLEMA**: Solo per utenti, admin bypassa

## Checklist Redirect Guard

- ❌ **events**: Nessun guard, solo `currentUser != null`
- ❌ **eventDetails**: Nessun guard utente
- ❌ **voting**: Guard `currentUser` ma accetta admin
- ✅ **admin**: Richiede PIN 000
- ✅ **adminEvents**: Deriva da admin

## Storage Attuale

- `localStorage`: admin_pin, unique_session, protected_events
- `sessionStorage`: ❌ Non utilizzato
- Persistenza: ❌ Solo localStorage (permanente)

## Fix Points Identificati

1. **useAppRouter.ts:23-27** - Condizione auto-redirect
2. **App.tsx:63** - Separare userSession/adminSession  
3. **ScreenRouter.tsx:151+** - Guard per schermate utente
4. **AdminScreen.tsx:146** - onGoBack non deve andare a events
5. **useSession.ts** - Implementare sessionStorage

---
*Analisi completata - Pronto per implementazione fix*
