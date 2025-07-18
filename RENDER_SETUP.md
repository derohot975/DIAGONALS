# RENDER ENVIRONMENT VARIABLES SETUP

## PROBLEMA DEPLOY RENDER
L'applicazione si connette perfettamente a Supabase in locale ma fallisce su Render per mancanza variabili ambiente.

## SOLUZIONE: AGGIUNGERE VARIABILI AMBIENTE IN RENDER

### 1. Vai su Render Dashboard
- Apri il tuo servizio DIAGONALE su Render
- Clicca su "Environment" nella barra laterale

### 2. Aggiungi queste variabili:

**DATABASE_URL**
```
postgresql://postgres.lmggvdulobhxlgdpbpom:Jazzclub-00!@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

**SUPABASE_URL**
```
https://lmggvdulobhxlgdpbpom.supabase.co
```

**SUPABASE_ANON_KEY**
```
[Il tuo SUPABASE_ANON_KEY da Replit Secrets]
```

**NODE_ENV**
```
production
```

### 3. Salva e Redeploy
- Clicca "Save Changes"
- Render farà automaticamente un nuovo deploy
- L'applicazione si connetterà a Supabase

## STATO ATTUALE
✅ **Supabase**: Database funzionante e connesso
✅ **Locale**: Tutti i test API passano
✅ **Dati**: Utenti ed eventi si salvano correttamente
❌ **Render**: Variabili ambiente mancanti

## DOPO IL FIX
L'applicazione sarà completamente funzionante su Render con persistenza dati Supabase.