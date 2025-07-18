import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../shared/schema";

neonConfig.webSocketConstructor = ws;

// Supabase PostgreSQL connection string
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL must be set. Please add your Supabase PostgreSQL connection string to Replit Secrets.",
  );
}

console.log('🔗 Connecting to Supabase PostgreSQL database...');

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle({ client: pool, schema });