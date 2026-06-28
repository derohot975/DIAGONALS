# DNA — Indice operativo DIAGONALE

Contesto canonico del progetto. Il **codice è la fonte di verità**: se diverge, vale il codice e questo DNA va riallineato.
Leggi in ordine di numero: prima ciò che è indispensabile per operare in sicurezza.

## Cosa leggere e quando

| # | File | Leggi se devi… |
|---|------|----------------|
| 00 | `00_INDEX.md` | orientarti (questo file) |
| 01 | `01_STATO_E_GOVERNANCE.md` | **sempre prima di agire** — cos'è il progetto, regole non negoziabili, vincoli free tier |
| 02 | `02_ARCHITETTURA_RUNTIME.md` | capire come gira l'app (dev/prod, bootstrap, request lifecycle) |
| 03 | `03_DOMINIO_E_FLUSSI.md` | toccare logica di dominio, API o flussi UX (eventi, voti, pagella) |
| 04 | `04_DATI_E_STORAGE.md` | toccare schema DB, storage layer o query |
| 05 | `05_AUTH_SICUREZZA_LOGGING.md` | toccare auth, header sicurezza, logging |
| 06 | `06_INFRA_SUPABASE_GITHUB_RENDER.md` | **repo, deploy, istanza DB, secret, keepalive** |
| 07 | `07_OPERAZIONI_E_QUALITA.md` | build, test, guardrail, backup, script |
| 08 | `08_RISCHI_E_GAP.md` | conoscere rischi noti e punti DA COMPLETARE |

## Indispensabile (lettura minima per operare)
- `01` — regole e vincoli
- `06` — repo corretto, dove gira il deploy, quale DB, keepalive

## Cosa NON è qui (ricavabile dal codice in pochi secondi)
Struttura cartelle, elenco dipendenze, script `package.json`, naming dei file: leggi direttamente repo e `package.json`.

## Manutenzione
- Aggiorna dopo modifiche strutturali (API/schema/script/CI/deploy).
- Niente snapshot volatili (output comandi, conteggi): indica **dove** si verifica, non fotografare.
- Rinumera senza buchi se accorpi/elimini file.
