# BACKUP PRE-IMPLEMENTAZIONE AUTOSAVE PAGELLA

**Data**: 21/09/2025 14:19  
**Obiettivo**: Implementare autosave automatico per DERO/TOMMY + readonly per altri  
**Git Status**: ✅ Clean (working tree clean)  

## FILE CHE VERRANNO MODIFICATI

### 🎯 **FILE PRINCIPALI**
1. **`client/src/components/screens/PagellaScreen.tsx`**
   - **Modifiche previste**:
     - Autosave con debounce 600ms per DERO/TOMMY
     - Textarea readonly per altri utenti
     - Rimozione pulsante "Salva"
     - Polling ogni 10s per lettori
     - Gestione bozze locali come fallback
   - **Backup attuale**: Versione con autosave base già implementato
   - **Rischio**: MEDIO - File critico UI

### 📋 **CONFIGURAZIONE TEST**
- **Event ID**: `3` ("Diagonale di mezza estate")
- **DERO User ID**: `2` (da confermare)
- **URL Produzione**: `https://diagonals.onrender.com`

### 🔄 **PIANO ROLLBACK**
Se qualcosa va storto:
1. `git checkout HEAD~1 -- client/src/components/screens/PagellaScreen.tsx`
2. `npm run build`
3. `git commit -m "rollback: Ripristino PagellaScreen.tsx pre-autosave"`
4. `git push origin main`

### 📊 **STATO PRE-MODIFICA**
- **Commit attuale**: `3a9a88a` - "backup: Post-diagnosi Pagella completa"
- **Funzionalità esistenti**: 
  - ✅ GET/PUT API funzionanti
  - ✅ Permessi DERO/TOMMY operativi
  - ✅ Struttura base autosave presente
- **Da implementare**:
  - 🔄 Autosave automatico senza pulsanti
  - 🔄 Readonly per non-editor
  - 🔄 Polling automatico lettori

### ⚠️ **PRECAUZIONI**
- Modifiche minime e conservative
- Test completo locale prima del deploy
- Nessuna nuova dipendenza
- Fallback su bozze locali mantenuto
- Stop immediato se errori critici

**BACKUP CREATO**: 21/09/2025 14:19  
**PRONTO PER IMPLEMENTAZIONE**: ✅
