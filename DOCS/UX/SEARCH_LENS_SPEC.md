# 🔍 SEARCH LENS SPECIFICATION - DIAGONALE

**Data**: 02/10/2025 16:26  
**Versione**: 1.1 - Desktop Consolidato  
**Status**: ✅ MOBILE + DESKTOP FUNZIONANTI  

---

## 🎯 PANORAMICA

La **lente di ricerca** è un pulsante globale sempre presente nella bottom-nav che permette di cercare vini utilizzati negli eventi conclusi. Fornisce accesso rapido a tutto lo storico dei vini degustati con informazioni su chi li ha portati e in quale evento.

---

## 📱 POSIZIONAMENTO E PERSISTENZA

### Posizione Globale
- **Slot**: Sempre nell'estrema destra della bottom-nav
- **Persistenza**: Visibile in **tutte le schermate** che montano BottomNavBar
- **Layout supportati**: sides, center, mixed
- **Feature flag**: `FEATURES.ENABLE_WINE_SEARCH = true` (default ON)

### Touch Target
- **Dimensioni**: 48×48px (conforme standard ≥44px)
- **Icona**: Search (lucide-react)
- **Aria-label**: "Cerca vini negli eventi conclusi"
- **Hover**: Feedback visivo coerente con altri pulsanti nav

---

## 🔍 FUNZIONALITÀ RICERCA

### Criteri di Ricerca
- **Input minimo**: 2 caratteri
- **Debounce**: 300ms per ottimizzare performance
- **Scope**: Solo vini da eventi con `status = 'completed'`
- **Campi ricerca**: Nome vino + Produttore (case-insensitive, match parziale)
- **Ordinamento**: Per recenza evento (più recenti primi)

### Performance
- **Paginazione**: 20 risultati per pagina
- **Query timeout**: Monitoraggio <500ms
- **Caching**: Nessuno (sempre dati freschi)

---

## 🎨 UX STATES

### Stato Iniziale
- **Messaggio**: "Cerca per nome o produttore"
- **Sottotesto**: "Minimo 2 caratteri"
- **Icona**: Wine (16×16, gray-300)

### Input Troppo Corto
- **Condizione**: query.length < 2
- **Messaggio**: "Inserisci almeno 2 caratteri"

### Loading
- **Skeleton**: 3 card placeholder animate-pulse
- **Durata tipica**: <300ms

### Risultati Vuoti
- **Messaggio**: "Nessun vino trovato"
- **Sottotesto**: "negli eventi conclusi"
- **Icona**: Search (16×16, gray-300)

### Errore Rete
- **Messaggio**: Errore specifico
- **Azione**: Pulsante "Riprova"
- **Colore**: text-red-600

---

## 📋 FORMATO RISULTATI

### Card Vino
Ogni risultato mostra:

```
[🍷] NOME VINO                    [Tipo]
     Produttore • Anno

Portato da: NOME_UTENTE
Evento: Nome Evento • Data

[+N altri eventi] (se multipli)
```

### Dati Visualizzati
- **Nome vino**: Font bold, colore brand (#300505)
- **Produttore + Anno**: Text gray-600, font medium
- **Tipo vino**: Badge colorato (Rosso/Bianco/Bollicina)
- **Utente**: Font semibold, colore brand
- **Evento**: Nome + data formattata
- **Eventi multipli**: Indicatore "+N altri eventi" se presente

---

## 🔧 IMPLEMENTAZIONE TECNICA

### Frontend Components
```
client/src/components/search/
├── SearchLensButton.tsx      # Pulsante globale
├── WineSearchOverlay.tsx     # Modal ricerca
└── WineSearchCard.tsx        # Card risultato
```

### Backend API
```
GET /api/wines/search?q=term&limit=20&offset=0
```

### Database Query
```sql
SELECT w.name, w.producer, w.type, w.year,
       u.name as userName, e.name as eventName, e.date
FROM wines w
JOIN wine_events e ON w.eventId = e.id  
JOIN users u ON w.userId = u.id
WHERE e.status = 'completed'
  AND (LOWER(w.name) LIKE '%term%' OR LOWER(w.producer) LIKE '%term%')
ORDER BY e.date DESC
LIMIT 20 OFFSET 0;
```

---

## ⚙️ CONFIGURAZIONE

### Feature Flag
```typescript
// client/src/config/features.ts
export const FEATURES = {
  ENABLE_WINE_SEARCH: true, // Default ON
} as const;
```

### Integrazione BottomNavBar
- **Import automatico**: SearchLensButton + WineSearchOverlay
- **State management**: useState locale per overlay
- **Rendering condizionale**: Dietro feature flag

---

## 🧪 TEST DI ACCETTAZIONE

### ✅ Test Funzionali Completati

1. **Persistenza Globale**
   - ✅ Pulsante visibile in Home
   - ✅ Pulsante visibile in EventList  
   - ✅ Pulsante visibile in Auth
   - ✅ Pulsante visibile in Admin

2. **Ricerca Funzionante**
   - ✅ Input "fer" → risultati con "fer" in nome/produttore
   - ✅ Solo eventi completed mostrati
   - ✅ Min 2 caratteri rispettato
   - ✅ Debounce 300ms attivo

3. **UX States**
   - ✅ Stato iniziale con hint
   - ✅ Loading skeleton durante query
   - ✅ Empty state per nessun risultato
   - ✅ Error state con retry

4. **Layout e Accessibilità**
   - ✅ Touch target ≥44px
   - ✅ ESC chiude overlay
   - ✅ Tap esterno chiude overlay
   - ✅ Focus management corretto

5. **Performance**
   - ✅ Build: SUCCESS (3.02s)
   - ✅ TypeScript: 0 errori
   - ✅ Bundle size: +9.17kB BottomNavBar
   - ✅ Zero regressioni altre pagine

---

## 🖥️ COMPORTAMENTO DESKTOP

### Funzionalità Completa
- **Stesso overlay**: Identico comportamento mobile, nessuna pagina dedicata
- **Dimensioni**: Modal `max-w-3xl` centrato a schermo
- **Responsive**: Layout cards adattato per viewport larghi
- **Keyboard**: Supporto completo ESC, Tab, Enter

### UX Desktop-Specific
- **Modal size**: Large (lg) con max-width 768px
- **Cards layout**: Full-width per leggibilità ottimale
- **Scroll**: Verticale con padding laterale
- **Hover states**: Feedback più evidenti su desktop

### Integrazione Seamless
- **Stesso API**: Nessuna logica separata backend
- **Stessi states**: Loading, empty, error identici
- **Stesso data flow**: Debounce, paginazione invariati
- **Zero duplicazione**: Riuso totale componenti mobile

---

## 🚫 LIMITAZIONI NOTE

### Navigazione
- **Click su card**: Attualmente disabilitato (TODO comment)
- **Dettaglio vino**: Non implementato in questa versione
- **Filtri avanzati**: Non disponibili (solo testo)

### Performance
- **Cache**: Nessuna (sempre query DB)
- **Offline**: Non supportato
- **Paginazione**: Solo offset-based (no cursor)

### Dati
- **Eventi multipli**: Mostra solo ultimo evento + contatore
- **Voti/rating**: Non mostrati nelle card
- **Immagini vini**: Non supportate

---

## 🔮 ROADMAP FUTURA

### V1.1 - Navigazione
- Click su card → Dettaglio vino
- Breadcrumb: Ricerca → Dettaglio → Back
- Deep linking risultati ricerca

### V1.2 - Filtri Avanzati  
- Filtro per tipo vino (Rosso/Bianco/Bollicina)
- Filtro per anno/periodo
- Filtro per utente/evento

### V1.3 - Performance
- Cache risultati ricerca
- Infinite scroll invece paginazione
- Search suggestions/autocomplete

---

## 📊 METRICHE E MONITORING

### Performance Targets
- **Query DB**: <500ms (warning se >500ms)
- **UI Response**: <100ms tap → overlay
- **Bundle Impact**: <10kB aggiuntivi

### Logging
- **Search queries**: Termine + risultati count
- **Performance**: Query duration in Server-Timing header
- **Errori**: Console.error per debug

---

**STATUS FINALE**: 🎉 **IMPLEMENTAZIONE COMPLETATA**

Lente di ricerca globale funzionante, sempre presente, zero regressioni, conforme a tutti i requisiti UX e performance.
