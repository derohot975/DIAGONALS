import type { Page, Route } from '@playwright/test';

/**
 * Mock di rete per i test E2E.
 *
 * Intercetta TUTTE le chiamate a `/api/*` e risponde con dati finti in memoria.
 * Garantisce isolamento totale: nessuna lettura/scrittura sul database o servizi reali.
 * I test osservano la UI, non toccano Supabase.
 */

// Dataset finto minimo ma coerente con lo schema reale (shared/schema.ts).
const mockUsers = [
  { id: 1, name: 'DERO', pin: '0101', is_admin: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 2, name: 'TOMMY', pin: '0202', is_admin: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 3, name: 'OSPITE', pin: '0303', is_admin: false, created_at: '2026-01-01T00:00:00Z' },
];

const mockEvents = [
  {
    id: 1,
    name: 'Degustazione Test',
    date: '2026-06-01',
    mode: 'standard',
    status: 'completed',
    voting_status: 'completed',
    created_by: 1,
    created_at: '2026-05-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Serata Bollicine',
    date: '2026-07-01',
    mode: 'standard',
    status: 'registration',
    voting_status: 'not_started',
    created_by: 1,
    created_at: '2026-06-01T00:00:00Z',
  },
];

const mockWines = [
  {
    id: 1,
    event_id: 1,
    user_id: 1,
    type: 'Rosso',
    name: 'Barolo Test',
    producer: 'Cantina Demo',
    grape: 'Nebbiolo',
    year: 2018,
    origin: 'Piemonte',
    price: '25.00',
    alcohol: '14.0',
    created_at: '2026-05-02T00:00:00Z',
  },
];

const json = (route: Route, body: unknown, status = 200) =>
  route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });

/**
 * Installa i mock di rete sulla pagina. Chiamare PRIMA di `page.goto`.
 * `loggedIn` opzionale: se true, login/sessione risolvono come autenticato.
 */
export async function installApiMocks(page: Page) {
  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname.replace(/\/$/, '');
    const method = route.request().method();

    // Health
    if (path.endsWith('/api/health')) {
      return json(route, { status: 'ok', db: 'ok' });
    }

    // Auth — login/register: rispondono con un utente finto, MAI scrivono.
    if (path.endsWith('/api/auth/login') && method === 'POST') {
      return json(route, mockUsers[0]);
    }
    if (path.endsWith('/api/auth/register') && method === 'POST') {
      return json(route, { ...mockUsers[0], id: 99, name: 'NUOVO' });
    }

    // Collezioni in lettura
    if (path.endsWith('/api/users') && method === 'GET') return json(route, mockUsers);
    if (path.endsWith('/api/events') && method === 'GET') return json(route, mockEvents);
    if (path.endsWith('/api/wines') && method === 'GET') return json(route, mockWines);
    if (path.endsWith('/api/votes/all') && method === 'GET') return json(route, []);
    if (path.includes('/api/votes') && method === 'GET') return json(route, []);
    if (path.includes('/wines') && method === 'GET') return json(route, mockWines);
    if (path.includes('/results') && method === 'GET') return json(route, []);
    if (path.includes('/participants') && method === 'GET') return json(route, mockUsers);
    if (path.includes('/api/wines/search')) return json(route, []);

    // Qualsiasi mutation (POST/PUT/PATCH/DELETE) NON ancora gestita:
    // risponde ok senza effetti, così la UI non rompe ma nulla viene scritto.
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return json(route, { ok: true });
    }

    // Fallback GET generico
    return json(route, []);
  });
}
