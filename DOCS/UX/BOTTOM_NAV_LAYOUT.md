# 🎯 BOTTOM NAV LAYOUT - CENTRATURA OTTICA

**Data**: 02/10/2025 16:26  
**Versione**: 2.1 - Standard Progetto Consolidato  
**Status**: ✅ STANDARD DEFINITIVO  

---

## 🎨 PRINCIPIO DI DESIGN

### Centratura Ottica
Il layout della bottom-nav è progettato per garantire che le **icone centrali** risultino **otticamente centrate** nella barra, indipendentemente dalla presenza di icone laterali (freccia indietro a sinistra, lente ricerca a destra).

### Bilanciamento Visivo
Utilizziamo un sistema a **tre regioni bilanciate** per evitare che la presenza/assenza di icone laterali sposti il centro percepito delle icone principali.

---

## 📐 ARCHITETTURA LAYOUT

### Layout "Sides" (Principale)
```
┌─────────────────────────────────────────────────────────┐
│ [←]     [🏠] [🛡️] [+]     [🔍] │  ← Bottom Nav
│ 64px    flex-1 center      64px │  ← Regioni
└─────────────────────────────────────────────────────────┘
```

#### Regioni Definite
1. **Left Region** (`w-16` = 64px)
   - Ospita **solo** la freccia "Indietro" quando necessaria
   - **Spazio fisso** sempre riservato per bilanciamento ottico
   - Allineamento: `justify-start`

2. **Center Region** (`flex-1`)
   - Contiene le **icone principali** (Home, Admin, custom buttons)
   - **Perfettamente centrata** grazie alle regioni laterali bilanciate
   - Spaziatura interna: `space-x-4` (16px tra icone)
   - Allineamento: `justify-center`

3. **Right Region** (`w-16` = 64px)
   - Ospita **sempre** la lente di ricerca (quando abilitata)
   - **Spazio fisso** che bilancia la regione sinistra
   - Allineamento: `justify-end`

---

## 🔄 COMPORTAMENTO PER LAYOUT

### Layout "Center" (Alternativo)
```
┌─────────────────────────────────────────────────────────┐
│        [←] [🏠] [🛡️] [+] [🔍]        │  ← Tutto centrato
└─────────────────────────────────────────────────────────┘
```
- **Tutte le icone** in un cluster centrale
- Lente di ricerca **integrata** nel gruppo
- Spaziatura uniforme: `space-x-4`

### Layout "Mixed" (Posizionamento Assoluto)
```
┌─────────────────────────────────────────────────────────┐
│ [←]      [🛡️]      [🏠]    [🔍] │  ← Posizioni assolute
│ left-4   center    right-20 right-4
└─────────────────────────────────────────────────────────┘
```
- **Posizionamento assoluto** per ogni icona
- Lente sempre a `right-4` (estrema destra)
- Home spostata a `right-20` per fare spazio alla lente

---

## 📱 RESPONSIVE E ACCESSIBILITÀ

### Touch Targets
- **Dimensioni minime**: 48×48px (conforme W3C/Apple/Google)
- **Padding**: `p-3` (12px) per area cliccabile ottimale
- **Spaziatura**: Minimo 16px tra icone per evitare tap accidentali

### Safe Area
- **Padding orizzontale**: `px-4` per rispettare safe-area
- **Bottom offset**: `var(--bottom-nav-offset)` per gesture home
- **Z-index**: `z-50` per overlay management

### Focus Management
- **Keyboard navigation**: Tab order logico (sinistra → centro → destra)
- **Screen reader**: Aria-label descrittivi per ogni pulsante
- **Visual feedback**: Hover states coerenti

---

## 🎯 REGOLE DI BILANCIAMENTO

### Presenza Freccia Indietro
- **Con freccia**: Left region occupata, center perfettamente bilanciato
- **Senza freccia**: Left region vuota ma **spazio preservato**, center invariato

### Numero Icone Centrali
- **1 icona**: Centrata perfettamente
- **2 icone**: Distribuite equamente con gap 16px
- **3+ icone**: Cluster centrato con spaziatura uniforme

### Lente di Ricerca
- **Sempre presente** quando `ENABLE_WINE_SEARCH = true`
- **Right region sempre occupata** per bilanciamento costante
- **Dimensioni coerenti** con altre icone (w-6 h-6)

---

## 🔧 IMPLEMENTAZIONE TECNICA

### CSS Classes Chiave
```css
/* Regioni bilanciate */
.w-16          /* 64px fissi per left/right regions */
.flex-1        /* Center region espandibile */
.justify-start /* Left alignment */
.justify-center /* Center alignment */
.justify-end   /* Right alignment */

/* Spaziatura */
.space-x-4     /* 16px gap tra icone centrali */
.px-4          /* Safe area padding */

/* Touch targets */
.p-3           /* 12px padding per 48px touch area */
```

### Breakpoints
- **Mobile**: Layout ottimizzato per thumb navigation
- **Tablet**: Spaziatura aumentata per comfort
- **Desktop**: Hover states più evidenti

---

## 🧪 TEST VISIVI COMPLETATI

### Centratura Ottica
- ✅ **Con freccia + 1 icona centrale**: Centro perfetto
- ✅ **Senza freccia + 2 icone centrali**: Centro perfetto
- ✅ **Con freccia + 3 icone centrali**: Distribuzione uniforme
- ✅ **Layout center**: Cluster centrato con lente integrata
- ✅ **Layout mixed**: Posizioni assolute corrette

### Bilanciamento Visivo
- ✅ **Regioni laterali**: 64px fissi garantiscono simmetria
- ✅ **Spazi vuoti**: Non alterano percezione del centro
- ✅ **Lente sempre presente**: Bilanciamento costante

### Responsive
- ✅ **Touch targets**: ≥48px su tutti i device
- ✅ **Safe area**: Rispettata su iPhone con notch
- ✅ **Gesture conflicts**: Nessuna interferenza

---

## 📊 METRICHE LAYOUT

### Dimensioni Standard
- **Left/Right regions**: 64px (w-16)
- **Touch targets**: 48px (p-3 su icone 24px)
- **Gap icone centrali**: 16px (space-x-4)
- **Padding laterale**: 16px (px-4)

### Z-Index Hierarchy
- **Bottom nav**: z-50
- **Search overlay**: z-50 (BaseModal)
- **Other modals**: z-40

---

## 🔮 EDGE CASES GESTITI

### Icone Centrali Variabili
- **0 icone**: Solo freccia e lente (rare)
- **1 icona**: Home o Admin centrati
- **2 icone**: Home + Admin distribuiti
- **3+ icone**: Custom buttons + standard

### Screen Sizes
- **Molto piccoli** (<360px): Layout compatto ma touch-friendly
- **Standard** (360-768px): Layout ottimale
- **Grandi** (>768px): Spaziatura aumentata

### Feature Flags
- **Lente disabilitata**: Right region vuota ma spazio preservato
- **Admin nascosto**: Solo Home nel centro
- **Custom buttons**: Integrati seamlessly

---

## 📈 RISULTATI MISURABILI

### Prima dell'Ottimizzazione
- Centro visivo **spostato** in base a presenza freccia
- Spaziatura **inconsistente** tra layout
- Touch targets **al limite** degli standard

### Dopo l'Ottimizzazione
- Centro visivo **sempre perfetto** (±2px tolleranza)
- Spaziatura **uniforme** 16px tra icone
- Touch targets **ottimali** 48px+
- Bilanciamento **costante** indipendente da icone laterali

---

## 🏛️ GOVERNANCE E STANDARD

### Regola Aurea del Progetto
**Il layout a tre regioni (64px - flex-1 - 64px) è lo STANDARD DEFINITIVO** per tutte le implementazioni future della bottom-nav in DIAGONALE.

### Checklist Anti-Regressione
Prima di ogni modifica alla bottom-nav, verificare:
- ✅ **Left region**: 64px fissi (w-16)
- ✅ **Center region**: flex-1 con justify-center
- ✅ **Right region**: 64px fissi (w-16) 
- ✅ **Centratura**: ±2px tolleranza su tutti i layout
- ✅ **Touch targets**: ≥48px su mobile
- ✅ **Lente ricerca**: Sempre presente quando abilitata
- ✅ **Zero regressioni**: Test su Home/Auth/Admin/Eventi

### Modifiche Vietate
- ❌ **Non alterare** le dimensioni delle regioni laterali
- ❌ **Non rimuovere** il bilanciamento ottico
- ❌ **Non modificare** la spaziatura centrale (space-x-4)
- ❌ **Non spostare** la lente dalla right region

---

**STATUS**: 🏛️ **STANDARD PROGETTO CONSOLIDATO + LENTE ATTIVA**

Layout bottom-nav definito come regola aurea per sviluppi futuri e prevenzione regressioni.

### 🚑 Fix Critico Applicato (02/10/2025 17:08)
**Z-Index Conflict Risolto**: BaseModal z-index aumentato da `z-50` a `z-[100]` per garantire che la lente di ricerca sia sempre funzionante sopra la bottom-nav. Lente ora **completamente operativa** su mobile e desktop.

### 🛡️ Guardrail Z-Index Implementato (03/10/2025 16:18)
**Design Tokens Centralizzati**: Creato sistema token z-index in `/styles/tokens/zIndex.ts`
- `Z_BOTTOM_NAV = 50` (navigation layer)
- `Z_MODAL_OVERLAY = 100` (overlay layer)  
- `Z_TOAST = 200` (notification layer)

**Guardrail Development**: Console warning automatico se ordine z-index errato
**Test E2E**: Playwright test per prevenire regressioni future stacking context
