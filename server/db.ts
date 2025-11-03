import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "../shared/schema";

// PostgreSQL connection string
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL must be set. Please add your PostgreSQL connection string to environment variables.",
  );
}

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