import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../shared/schema";

neonConfig.webSocketConstructor = ws;

// Supabase connection string format:
// postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres.lmggvdulobhxlgdpbpom:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres';

if (!databaseUrl || databaseUrl.includes('[YOUR-PASSWORD]')) {
  throw new Error(
    "DATABASE_URL must be set with valid Supabase connection string. Please check your environment variables.",
  );
}

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle({ client: pool, schema });