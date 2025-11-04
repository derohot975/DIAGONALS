# DIAGONALE - Autenticazione e Separazione Sessioni

## Architettura Sessioni

### Separazione Admin/Utente
- **UserSession**: Gestisce autenticazione utenti con PIN personale
- **AdminSession**: Gestisce accesso admin con PIN 000 (configurabile)
- **Indipendenza**: Le due sessioni sono completamente separate

### Persistenza Sessioni
- **sessionStorage**: Sessioni persistono solo finché l'app/tab è aperta
- **Chiavi**: `dg_user_session` (utente), `dg_admin_session` (admin)
- **TTL**: 24h per sessioni utente, indefinito per admin (fino a chiusura tab)

### Guard e Protezioni
- **Schermate Utente**: Richiedono `userSession.isAuthenticated = true`
- **Schermate Admin**: Richiedono PIN 000 e `adminSession.isAdmin = true`
- **Auto-redirect**: Solo per utenti autenticati, mai per admin

### Ciclo di Vita
1. **Login Utente**: PIN → `userSession.isAuthenticated = true` → sessionStorage
2. **Login Admin**: PIN 000 → `adminSession.isAdmin = true` → sessionStorage
3. **Logout**: Clear sessionStorage + reset stati
4. **Reload**: Ripristino da sessionStorage se valido
5. **Chiusura Tab**: Perdita automatica sessioni

*Implementato: Nov 2025 - Fix separazione ruoli critici*
