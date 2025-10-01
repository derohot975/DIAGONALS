# ✅ CHECKLIST E TODO CONSOLIDATI - DIAGONALE

Questo file consolida tutte le checklist, todo e procedure di testing del progetto Diagonale.

---

## INDICE

1. [Checklist Steps Diagonale](#checklist-steps-diagonale)
2. [Todo e Task](#todo-e-task)
3. [Procedure Testing](#procedure-testing)

---

## CHECKLIST STEPS DIAGONALE

### CHECKLIST_DIAGONALE_MODALS.txt
*Checklist testing standardizzazione modali (Step 2)*

**Criteri di test:**
- [ ] Tutti i modali usano BaseModal
- [ ] Body scroll lock funzionante
- [ ] ESC key e backdrop click
- [ ] Focus trap e accessibilità
- [ ] Responsive design
- [ ] Performance invariata

### CHECKLIST_DIAGONALE_SYNC.txt
*Checklist sincronizzazione e performance (Step 3)*

**Criteri di test:**
- [ ] Query invalidation corretta
- [ ] Real-time updates
- [ ] Error handling
- [ ] Loading states
- [ ] Cache management
- [ ] Network resilience

### CHECKLIST_DIAGONALE_SORT.txt
*Checklist ordinamento cards e persistenza login (Step 5)*

**Criteri di test:**
- [ ] Ordinamento: Bollicine→Bianchi→Rossi→Altro
- [ ] Gradazione crescente per tipologia
- [ ] Anno crescente come terzo criterio
- [ ] Stabilità UI e performance
- [ ] Login persistente Admin↔Home

### CHECKLIST_DIAGONALE_CLEANUP.txt
*Checklist pulizia icone e stabilità scroll (Step 6)*

**Criteri di test:**
- [ ] Nessuna icona decorativa residua
- [ ] Bottom bar sempre libera
- [ ] Scroll solo su liste/card
- [ ] Layout stability preservato
- [ ] Performance invariata

### CHECKLIST_DIAGONALE_MODAL_VOTE.txt
*Checklist fix modale voto e nav bar (Step 7)*

**Criteri di test:**
- [ ] Panel fisso, zero drift al touch
- [ ] Scroll solo verticale nel picker
- [ ] Backdrop non scrolla
- [ ] Icone nav bar sempre bianche
- [ ] Layout centrato (Back sinistra, resto centro)

---

## TODO E TASK

### TODO_MODULARE_20250930.txt
*Todo list modularizzazione screens*

**Priorità identificate:**
1. **ALTA**: AdminEventManagementScreen (351 righe)
2. **MEDIA**: SimpleVotingScreen (267 righe)
3. **MEDIA**: EventResultsScreen (256 righe)
4. **BASSA**: PagellaScreen (completato)

**Micro-task (≤15' ciascuno):**
- [ ] Estrarre ParticipantsManager
- [ ] Estrarre VotingCompletionChecker
- [ ] Creare useAdminEventManagement hook
- [ ] Scomporre UI in EventCard.tsx
- [ ] Scomporre UI in EventActions.tsx
- [ ] Target: ridurre a ≤80 righe

---

## PROCEDURE TESTING

### Testing Mobile
**Setup richiesto:**
- [ ] iOS Safari + Android Chrome
- [ ] DevTools aperto (Console + Network)
- [ ] Test su diverse densità schermo
- [ ] Verifica safe area e notch

### Testing Performance
**Metriche da verificare:**
- [ ] Bundle size: ~240KB target
- [ ] Build time: <4s
- [ ] TypeScript: 0 errori
- [ ] Console: pulita, 0 warning
- [ ] Memory leaks: test 10min uso

### Testing Regressioni
**Funzionalità da verificare:**
- [ ] Navigation: tutti i flussi
- [ ] Modali: apertura/chiusura
- [ ] Forms: input e submit
- [ ] API calls: tutte le chiamate
- [ ] State management: stato preservato

### Testing Accessibilità
**Criteri A11y:**
- [ ] Screen reader: navigazione chiara
- [ ] Keyboard navigation: funzionante
- [ ] Focus management: corretto
- [ ] Color contrast: mantenuto
- [ ] Touch targets: ≥44px

---

## SIGN-OFF CRITERIA

### Criteri Generali
- [ ] Tutti i test PASSED
- [ ] Console pulita
- [ ] Build TypeScript clean
- [ ] Performance invariata o migliorata
- [ ] Zero breaking changes

### Approvazione Finale
- [ ] Tester: ________________
- [ ] Data: ________________
- [ ] Note: ________________

---

*File consolidato generato il 01/10/2025 - Contiene tutte le checklist e todo del progetto Diagonale*
