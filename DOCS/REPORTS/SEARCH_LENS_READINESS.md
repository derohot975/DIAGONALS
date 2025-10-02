# 🔎 SEARCH LENS READINESS - DIAGONALE

**Data**: 02/10/2025 15:35  
**Obiettivo**: Diagnosi per implementazione ricerca vini eventi conclusi  
**Scope**: Bottom-nav + overlay ricerca (chirurgico, zero regressioni)  

---

## 📱 MAPPA FILE IDENTIFICATI

### Bottom Navigation
- **File**: `client/src/components/navigation/BottomNavBar.tsx`
- **Tipo**: Componente globale riutilizzabile
- **Layout**: 3 varianti (sides, center, mixed)
- **Slot disponibili**: 
  - Left: Back button
  - Center: Custom buttons array
  - Right: **DISPONIBILE** (attualmente vuoto per bilanciamento)

### Modal/Overlay Esistenti
- **BaseModal**: `client/src/components/ui/BaseModal.tsx` ✅
  - Supporta size (sm, md, lg, xl)
  - Dismissible, keyboard ESC
  - Footer, header personalizzabili
  - **RIUTILIZZABILE** per overlay ricerca

### Componenti Card Esistenti
- **EventCard**: `client/src/components/optimized/EventCard.tsx`
- **Modali vari**: 9 modali esistenti come riferimento
- **Pattern consolidato**: Title, content, actions

---

## 🗄️ STRATO DATI ANALIZZATO

### Schema Database (shared/schema.ts)
```typescript
// Tabelle principali
wines: {
  id, eventId, userId, type, name, producer, grape, 
  year, origin, price, alcohol, createdAt
}

wineEvents: {
  id, name, date, mode, status, votingStatus, 
  createdBy, createdAt
}

users: {
  id, name, pin, isAdmin, createdAt
}
```

### Regola "Evento Concluso"
- **Campo**: `wineEvents.status = 'completed'`
- **Alternativa**: `wineEvents.votingStatus = 'completed'`
- **Join necessario**: `wines ↔ wineEvents ↔ users`

### API Esistenti
- **GET /api/wines**: Già implementata
  - Supporta `?eventId=X` per filtro evento
  - Performance monitoring integrato
  - **ESTENDIBILE** per ricerca

---

## 🎯 ICONE DISPONIBILI

### Lente di Ricerca
- ❌ **Search**: Non presente in index.ts
- ✅ **Eye**: Disponibile (alternativa)
- ✅ **Plus**: Disponibile (ma semanticamente sbagliata)

### **AZIONE RICHIESTA**: Aggiungere `Search` a icone
```typescript
// In client/src/components/icons/index.ts
export { Search } from 'lucide-react';
```

---

## ⚠️ RISCHI IDENTIFICATI

### 1. **Slot Right Bottom-Nav**
- **Rischio**: BASSO
- **Dettaglio**: Slot right attualmente vuoto, disponibile
- **Mitigazione**: Aggiungere pulsante senza alterare layout

### 2. **Performance Query**
- **Rischio**: MEDIO
- **Dettaglio**: Join 3 tabelle + filtro testo
- **Mitigazione**: Debounce 300ms, min 2 caratteri, LIMIT 20

### 3. **Mobile Touch Target**
- **Rischio**: BASSO
- **Dettaglio**: Pulsante lente deve essere ≥44px
- **Mitigazione**: Riutilizzare pattern esistente bottom-nav

### 4. **Overlay Z-index**
- **Rischio**: BASSO
- **Dettaglio**: Possibile conflitto con modali esistenti
- **Mitigazione**: BaseModal già gestisce z-index correttamente

---

## 🛠️ COMPONENTI DA CREARE

### 1. **SearchLensButton** (Bottom-nav)
- Icona Search + onClick handler
- Variant 'primary', size standard
- Touch target ≥44px

### 2. **WineSearchOverlay** (Modal)
- Estende BaseModal
- Input con debounce
- Lista risultati paginata
- Empty/loading states

### 3. **WineSearchCard** (Risultato)
- Nome vino + produttore
- Utente + evento (nome + data)
- Pattern card esistente

### 4. **API Extension** (Backend)
- GET /api/wines/search?q=term
- Join wines + events + users
- Filtro status='completed'
- LIMIT 20, OFFSET per paginazione

---

## 📊 STIMA IMPLEMENTAZIONE

### File da Modificare
1. `client/src/components/icons/index.ts` (+1 riga)
2. `client/src/components/navigation/BottomNavBar.tsx` (+slot right)
3. `server/routes/wines.ts` (+endpoint search)

### File da Creare
1. `client/src/components/search/SearchLensButton.tsx`
2. `client/src/components/search/WineSearchOverlay.tsx`
3. `client/src/components/search/WineSearchCard.tsx`

### Stima Righe Codice
- **Backend**: ~50 righe (endpoint + query)
- **Frontend**: ~200 righe (3 componenti)
- **Totale**: ~250 righe

---

## ✅ CRITERI ACCETTAZIONE VERIFICABILI

### Funzionali
1. ✅ **Pulsante lente**: Visibile in bottom-nav slot right
2. ✅ **Overlay**: Si apre/chiude senza alterare layout
3. ✅ **Ricerca**: Min 2 caratteri, debounce 300ms
4. ✅ **Risultati**: Solo vini da eventi status='completed'
5. ✅ **Card**: Nome, produttore, utente, evento

### Non-Funzionali
1. ✅ **Zero regressioni**: Home, Auth, Gestione invariate
2. ✅ **Performance**: Query <500ms, UI responsive
3. ✅ **Mobile**: Touch target ≥44px, safe-area OK
4. ✅ **Accessibilità**: ESC chiude, focus management

---

## 🚦 SEMAFORO IMPLEMENTAZIONE

### 🟢 **VERDE - PROCEDI**
- **Bottom-nav**: Slot disponibile, pattern consolidato
- **BaseModal**: Riutilizzabile, testato
- **Schema DB**: Completo, join fattibili
- **API Pattern**: Consolidato, estendibile

### 🟡 **GIALLO - ATTENZIONE**
- **Icona Search**: Da aggiungere a barrel file
- **Performance**: Monitorare query join 3 tabelle
- **Mobile UX**: Testare touch target su device reali

### 🔴 **ROSSO - BLOCCANTI**
- **Nessuno identificato**

---

## 📋 CHECKLIST PRE-IMPLEMENTAZIONE

- [x] **Bottom-nav analizzata**: Slot right disponibile
- [x] **BaseModal verificato**: Riutilizzabile per overlay
- [x] **Schema DB mappato**: Join wines+events+users fattibile
- [x] **API wines analizzata**: Estendibile per search
- [x] **Icone verificate**: Search da aggiungere
- [x] **Rischi valutati**: Tutti mitigabili
- [x] **Pattern UI consolidati**: Card, modal, button

---

## 🎯 RACCOMANDAZIONI

### Implementazione Consigliata
1. **Iniziare da icona**: Aggiungere Search a barrel file
2. **Backend first**: Endpoint /api/wines/search
3. **UI incrementale**: Button → Overlay → Cards
4. **Test continuo**: Verificare zero regressioni

### Feature Flag
```typescript
// In config o constants
const ENABLE_WINE_SEARCH = true; // Default ON
```

### Performance Monitoring
```sql
-- Query target (esempio)
SELECT w.name, w.producer, u.name as user_name, 
       e.name as event_name, e.date as event_date
FROM wines w
JOIN wine_events e ON w.eventId = e.id  
JOIN users u ON w.userId = u.id
WHERE e.status = 'completed'
  AND (w.name ILIKE '%term%' OR w.producer ILIKE '%term%')
ORDER BY e.date DESC
LIMIT 20 OFFSET 0;
```

---

**STATUS**: 🟢 **READY TO IMPLEMENT**

Tutti i prerequisiti sono soddisfatti. Nessun rischio bloccante identificato. Pattern consolidati riutilizzabili. Implementazione chirurgica fattibile con zero regressioni.
