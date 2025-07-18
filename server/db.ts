import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../shared/schema";

neonConfig.webSocketConstructor = ws;

// Supabase connection string - build from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// For Supabase, we need the direct PostgreSQL connection string
// Format: postgresql://postgres.{project-ref}:{password}@{hostname}:5432/postgres
let databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl && supabaseUrl) {
  // Extract project ref from Supabase URL
  const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');
  // Note: You'll need to add the actual database password as DATABASE_URL secret
  console.log('Supabase project detected:', projectRef);
  console.log('Please add DATABASE_URL secret with your Supabase PostgreSQL connection string');
}

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL must be set. Please add your Supabase PostgreSQL connection string to Replit Secrets.",
  );
}

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle({ client: pool, schema });