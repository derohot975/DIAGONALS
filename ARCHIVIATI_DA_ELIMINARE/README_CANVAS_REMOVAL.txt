================================================================================
                        RIMOZIONE CANVAS - DOCUMENTAZIONE
================================================================================

Data: 16/09/2025 14:32
Operazione: Rimozione dipendenza Canvas dal progetto DIAGONALE

MOTIVAZIONE:
- Canvas non utilizzato nell'applicazione principale
- Utilizzato solo in 2 script di utilità per generazione icone PWA
- Risparmio: 4.9MB + dipendenze

FILE COINVOLTI:
1. scripts/generate-icons.js - Genera icone PWA da file sorgente
2. scripts/update-pwa-icons.js - Aggiorna icone PWA con timestamp

STRATEGIA SICUREZZA:
1. Backup completo progetto creato
2. File script copiati in ARCHIVIATI_DA_ELIMINARE
3. Rimozione graduale con test intermedi

ROLLBACK DISPONIBILE:
- Backup: BACKUP_16092025_1431.tar.gz
- Script originali: generate-icons.js.backup, update-pwa-icons.js.backup

NOTA: Gli script di generazione icone sono utility di sviluppo, non critici 
per il funzionamento dell'app in produzione.
================================================================================
