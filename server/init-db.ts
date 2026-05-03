import { db } from './db';
import { users } from '../shared/schema';
import logger from './utils/logger';

export async function initializeDatabase() {
  try {
    // Solo test connessione database
    await db.select().from(users).limit(1);
    logger.info('Database connection successful', 'DB');
  } catch (error: unknown) {
    logger.error('Error initializing database', 'DB', error instanceof Error ? error : undefined);
    logger.warn('Database connection test failed', 'DB');
  }
}
