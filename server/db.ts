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

const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';

console.log('🔗 Connecting to PostgreSQL database...');

// SSL & Connection Configuration with Fallback Strategy
const createDbConnection = () => {
  // Primary configuration (SSL required for security)
  const primaryConfig = {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 15, // Increased from 10 for better stability
    statement_timeout: 30000, // 30s query timeout
    ssl: isProd ? 'require' as const : 'prefer' as const // PROD: strict SSL, DEV: prefer but allow fallback
  };

  try {
    console.log(`📡 Attempting connection with SSL mode: ${primaryConfig.ssl}`);
    const client = postgres(databaseUrl, primaryConfig);
    
    // Test connection immediately
    client`SELECT 1 as test`.then(() => {
      console.log('✅ Database connection established successfully');
    }).catch((err) => {
      if (isDev && err.message.includes('SSL')) {
        console.warn('⚠️  SSL handshake failed in DEV, attempting fallback...');
        // In DEV only: attempt fallback with relaxed SSL
        const fallbackClient = postgres(databaseUrl, {
          ...primaryConfig,
          ssl: false
        });
        console.log('🔄 DEV fallback: SSL disabled for local development');
        return fallbackClient;
      } else {
        // PROD or non-SSL error: log and let it fail properly
        const logMsg = isProd 
          ? `❌ Database connection failed (PROD mode)` 
          : `❌ Database connection failed: ${err.message.substring(0, 100)}`;
        console.error(logMsg);
        throw err;
      }
    });

    return client;
  } catch (err) {
    const errorMsg = isProd 
      ? 'Database initialization failed. Check connection settings.'
      : `Database initialization failed: ${err instanceof Error ? err.message : 'Unknown error'}`;
    
    console.error(`💥 ${errorMsg}`);
    
    if (isDev) {
      console.log('💡 DEV Tips: Check DATABASE_URL, SSL settings, or network connectivity');
    }
    
    throw err;
  }
};

// Create postgres connection with hardened configuration
const client = createDbConnection();

export const db = drizzle(client, { schema });