import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "../shared/schema";

// PostgreSQL connection string
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL must be set. Please add your PostgreSQL connection string to Replit Secrets.",
  );
}

console.log('🔗 Connecting to PostgreSQL database...');

// Create postgres connection with proper configuration
const client = postgres(databaseUrl, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  ssl: 'require'
});

export const db = drizzle(client, { schema });