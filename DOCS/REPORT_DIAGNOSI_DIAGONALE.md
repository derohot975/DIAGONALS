# 🍷 REPORT DIAGNOSI DIAGONALE

## 1. Executive Summary
Il progetto Diagonale è una Single Page Application (SPA) matura, orientata al mobile, costruita con lo stack React + Vite + Express + Drizzle. L'architettura è solida ma presenta diverse aree di miglioramento per raggiungere uno standard "enterprise" mobile-first.

- **Situazione Attuale**: Funzionale, con una forte enfasi sulla semplicità (autenticazione tramite PIN).
- **Problemi Bloccanti / Rischi**: Gestione dello stato globale frammentata tra diversi componenti (App.tsx è troppo grande), dipendenza da `localStorage` per dati sensibili, e potenziali glitch visivi su dispositivi mobili dovuti all'uso di unità come `100vh`.
- **Impatto Mobile**: Elevato. L'app è progettata per il mobile, ma richiede affinamenti su safe-area e gestione della tastiera software.
- **Stima Complessità**: **MEDIA**. Il refactoring per la stabilità visiva e la portabilità richiede interventi mirati senza stravolgere la logica di business.

---

## 2. Mappa Architetturale
Il progetto segue una struttura chiara ma con alcune concentrazioni di logica eccessive:

- **Frontend (`client/src/`)**:
    - `App.tsx`: Entrypoint principale (551 righe), contiene troppa logica di routing e stato.
    - `components/screens/`: Logica delle pagine gestita tramite uno `ScreenRouter` custom invece di un router standard (anche se `wouter` è presente nelle dipendenze).
    - `components/ui/`: Componenti base basati su Radix UI e Tailwind.
- **Backend (`server/`)**:
    - `index.ts`: Entrypoint Express, integra Vite in development mode.
    - `routes/`: API RESTful separate per modulo (auth, events, wines, ecc.).
    - `db.ts`: Gestione connessione PostgreSQL tramite `postgres.js`.
- **Shared (`shared/`)**:
    - `schema.ts`: Definizione unica della verità per il database (Drizzle ORM).

---

## 3. Diagnosi Stabilità Visiva (Mobile)
Aree critiche identificate per l'esperienza mobile:

- **Viewport & Layout**:
    - Uso di `100vh` in diversi file CSS/Tailwind (es. `client/src/index.css` o componenti fixed). Su mobile, questo causa il salto del layout quando le barre del browser compaiono/scompaiono. **Soluzione futura**: Usare `dvh` o `svh`.
    - **Safe Area**: Non è chiaro se il padding per il "notch" o la barra di home di iOS sia gestito consistentemente in tutti i componenti `fixed` (BottomNavBar).
- **Scrolling & Overflow**:
    - `VoteScrollPicker.tsx` utilizza molti `useEffect` per gestire lo scroll manuale. Questo è un punto ad alto rischio di "jank" (scatti) su dispositivi meno potenti.
- **Re-rendering**:
    - `App.tsx` gestisce troppi stati (currentUser, currentScreen, modals). Ogni cambio di schermata potrebbe scatenare re-render massivi di componenti non necessari.

---

## 4. Rischi Database / Integrità (Precedentemente Supabase)
*Nota: Il progetto è stato configurato per usare il database PostgreSQL interno di Replit, ma le considerazioni sulla sicurezza rimangono valide.*

- **Scritture Involontarie**:
    - `server/index.ts` chiama `ensurePagellaTable()` e `initializeDatabase()` all'avvio. Questo crea tabelle se mancanti.
    - In development, `db:push` potrebbe alterare lo schema.
- **Sicurezza PIN**:
    - Il PIN è gestito come stringa semplice. Sebbene funzionale per il caso d'uso, in un'ottica enterprise richiederebbe hashing lato server.

---

## 5. Qualità / Debito Tecnico
- **Dipendenze**: La codebase è aggiornata (React 18, Vite 5, Tailwind 4).
- **TypeScript**: Utilizzo esteso di tipi generati da Drizzle, riducendo il rischio di errori di runtime sulle API.
- **Logging**: Presente logging strutturato nelle API (durata della richiesta, status code), ottimo per la diagnosi.
- **Asset**: Presente una directory `attached_assets` e icone custom. Il caricamento delle icone tramite `unplugin-icons` è efficiente.

---

## 6. Piano Operativo Futuro (Proposta)

### Step 1: Consolidamento Viewport (Priorità: ALTA)
- **Obiettivo**: Eliminare i glitch di altezza su mobile.
- **Azioni**: Sostituire `100vh` con `h-[100dvh]` e aggiungere `padding-bottom: env(safe-area-inset-bottom)` alla `BottomNavBar`.

### Step 2: Refactoring App.tsx & Routing (Priorità: MEDIA)
- **Obiettivo**: Migliorare le performance di navigazione.
- **Azioni**: Spostare la logica dello `ScreenRouter` in un contesto dedicato o utilizzare `wouter` in modo più esteso. Separare lo stato della sessione (admin vs user).

### Step 3: Ottimizzazione Interazioni Touch (Priorità: MEDIA)
- **Obiettivo**: Rendere il VoteScrollPicker fluido come un componente nativo.
- **Azioni**: Valutare l'uso di CSS Snap Points invece di calcoli manuali in `useEffect`.

---

## 7. Checklist di Test Mobile
- [ ] **iOS Safari**: Verifica barra indirizzi a scomparsa (no reflow).
- [ ] **iOS/Android**: Safe area padding su notch e home indicator.
- [ ] **Keyboard**: Verifica che i campi di input (PIN, nome vino) non vengano coperti dalla tastiera.
- [ ] **Touch Targets**: Tutti i bottoni devono avere almeno 44x44px di area cliccabile.
- [ ] **Performance**: Scroll fluido nella lista vini storici senza delay.

---
*Report generato da Replit Agent - 25 Febbraio 2026*
