-- Migrazione 0001 — Lockdown RLS (additiva, non distruttiva)
--
-- SCOPO: chiudere l'accesso diretto al database via chiave pubblica (anon/PostgREST).
-- Prima di questa migrazione, la chiave anon poteva leggere/scrivere tutte le tabelle
-- (PIN in chiaro inclusi). Il backend dell'app si connette come ruolo `postgres`
-- (rolbypassrls = true, proprietario delle tabelle) quindi NON è impattato: continua a
-- funzionare identico. Solo l'accesso esterno via anon/authenticated viene bloccato.
--
-- SICUREZZA DELLA MIGRAZIONE:
--   - Solo ENABLE RLS + REVOKE: nessun DROP, nessuna ALTER di colonne, nessuna perdita dati.
--   - Nessuna policy permissiva: di default, con RLS attiva e zero policy, l'accesso è
--     negato a chi non bypassa la RLS (anon, authenticated). Deny-by-default.
--   - Reversibile: vedi blocco "ROLLBACK" in fondo (commentato).

BEGIN;

-- 1) Abilita Row Level Security su tutte le tabelle applicative.
--    Con RLS attiva e nessuna policy, anon/authenticated non possono più leggere/scrivere.
--    Il ruolo `postgres` (backend) bypassa la RLS: app invariata.
ALTER TABLE public.users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wine_events    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wines          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_reports  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_pagella  ENABLE ROW LEVEL SECURITY;

-- 2) Cintura + bretelle: revoca esplicita dei privilegi ai ruoli pubblici PostgREST.
--    Anche se RLS già blocca, togliere i GRANT rende l'intento esplicito e robusto.
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM authenticated;

COMMIT;

-- ============================================================================
-- ROLLBACK (eseguire SOLO se serve ripristinare lo stato precedente):
-- BEGIN;
--   ALTER TABLE public.users          DISABLE ROW LEVEL SECURITY;
--   ALTER TABLE public.wine_events    DISABLE ROW LEVEL SECURITY;
--   ALTER TABLE public.wines          DISABLE ROW LEVEL SECURITY;
--   ALTER TABLE public.votes          DISABLE ROW LEVEL SECURITY;
--   ALTER TABLE public.event_reports  DISABLE ROW LEVEL SECURITY;
--   ALTER TABLE public.event_pagella  DISABLE ROW LEVEL SECURITY;
--   GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
--   GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
-- COMMIT;
-- ============================================================================
