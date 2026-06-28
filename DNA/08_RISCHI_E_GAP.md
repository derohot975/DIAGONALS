# 08 — Rischi noti & Gap

## Rischi noti (codice/infra reali)
1. **CI deploy step non funzionante** — `render-deploy.yml` referenzia secret `RENDER_SERVICE_ID`/`RENDER_API_KEY` non configurati. Il deploy regge solo sull'autoDeploy nativo di Render. Se l'autoDeploy venisse disattivato, **non ci sarebbe deploy**. Decidere: configurare i secret o rimuovere lo step. Vedi `06`.
2. **DB con tabelle orfane** — `one_time_tokens`, `refresh_tokens`, `migrations` nel DB Supabase non sono gestite dal codice (auth token precedente). Non rimuovere senza verifica. Vedi `04`.
3. **Pagella authorization hardcoded** — edit consentito solo a DERO/TOMMY per nome, non role-based. Fragile a rinomine/nuovi editor.
4. **Sessione non persistente** — `sessionStorage`, persa al reload. Valutare localStorage con expiry.
5. **Rate limiting health in-memory** — perde stato al restart; non distribuito.
6. **Keepalive interno inefficace da solo** — il `setInterval` 12h in `server/index.ts` non gira con Render in sleep. La protezione reale è il workflow esterno (`06`). Valutare se rimuovere il keepalive interno (ora ridondante/fuorviante).
7. **Advisory moderate** su catena `vite/esbuild` — non bloccanti (`audit-level=high`); upgrade richiede valutazione breaking changes.

## Limiti Free tier — stato
- **DB Supabase:** ~11 MB / ~500 MB → ~2%, margine ampio. Nessuna tabella in crescita anomala.
- **Egress / progetti:** entro i limiti; verificare dalla dashboard Supabase se compaiono warning. Non fotografato qui (volatile).
- **Render Free:** un solo servizio, sleep dopo inattività.

## Backlog incrementale (non obiettivo immediato)
- Estendere E2E oltre il search overlay (voting flow, admin flow, completamento evento).
- Authorization pagella role-based.
- Smoke test API in CI; osservabilità (metriche health, error rate).
- Validazione env centralizzata al bootstrap.

## Gap — DA COMPLETARE
- **Egress/uso reale Supabase:** non verificabile dal repo; controllare dashboard Supabase prima di feature ad alto traffico.
- **Decisione su CI deploy step** (rischio #1): scelta del proprietario tra configurare i secret Render o affidarsi solo all'autoDeploy.
