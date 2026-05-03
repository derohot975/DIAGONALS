import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';
import logger from './utils/logger';

// PostgreSQL connection string — preferisce Supabase se configurato
const databaseUrl =
  process.env.SUPABASE_DB_URL || process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL o SUPABASE_DATABASE_URL deve essere configurato.');
}

const usingSupabase = !!(process.env.SUPABASE_DB_URL || process.env.SUPABASE_DATABASE_URL);
logger.info(
  `Database target: ${usingSupabase ? 'Supabase (produzione)' : 'PostgreSQL locale (sviluppo)'}`,
  'DB'
);

const isProd = process.env.NODE_ENV === 'production';

logger.info('Connecting to PostgreSQL database...', 'DB');

// Supabase-compatible connection configuration
const connectionConfig = {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 30,
  statement_timeout: 30000,
  ssl: isProd ? ('require' as const) : ('prefer' as const),
  onnotice: () => {
    // Suppress PostgreSQL NOTICE noise (e.g., IF NOT EXISTS already exists).
  },
};

logger.info(`Attempting connection with SSL mode: ${connectionConfig.ssl}`, 'DB');

// Create postgres connection (test will happen on first query)
const client = postgres(databaseUrl, connectionConfig);

export const db = drizzle(client, { schema });
