import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "../shared/schema";

// PostgreSQL connection string — preferisce Supabase se configurato
const databaseUrl = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL o SUPABASE_DATABASE_URL deve essere configurato.",
  );
}

const usingSupabase = !!process.env.SUPABASE_DATABASE_URL;
console.log(`🗄️  Database: ${usingSupabase ? 'Supabase (produzione)' : 'PostgreSQL locale (sviluppo)'}`);

const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';

console.log('🔗 Connecting to PostgreSQL database...');

// Supabase-compatible connection configuration
const connectionConfig = {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 30,
  statement_timeout: 30000,
  ssl: isProd ? 'require' as const : 'prefer' as const
};

console.log(`📡 Attempting connection with SSL mode: ${connectionConfig.ssl}`);

// Create postgres connection (test will happen on first query)
const client = postgres(databaseUrl, connectionConfig);

export const db = drizzle(client, { schema });