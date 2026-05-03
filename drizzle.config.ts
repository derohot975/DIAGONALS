import { defineConfig } from 'drizzle-kit';

const drizzleDatabaseUrl =
  process.env.DATABASE_URL ||
  process.env.SUPABASE_DB_URL ||
  process.env.SUPABASE_DATABASE_URL ||
  'postgresql://localhost:5432/postgres';

export default defineConfig({
  out: './migrations',
  schema: './shared/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: drizzleDatabaseUrl,
  },
});
