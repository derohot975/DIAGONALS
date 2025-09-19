import { db } from "../db";
import { sql } from "drizzle-orm";

// Crea la tabella se non esiste (safe in produzione)
export async function ensurePagellaTable() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS event_pagella (
      event_id INTEGER PRIMARY KEY,
      content  TEXT NOT NULL,
      author_user_id INTEGER,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export async function getPagellaByEventId(eventId: number) {
  const res = await db.execute(sql`
    SELECT content, author_user_id as "authorUserId", updated_at as "updatedAt"
    FROM event_pagella
    WHERE event_id = ${eventId}
    LIMIT 1;
  `);
  return (res as any).rows?.[0] ?? null;
}

export async function upsertPagella(eventId: number, content: string, authorUserId: number | null) {
  await db.execute(sql`
    INSERT INTO event_pagella (event_id, content, author_user_id, updated_at)
    VALUES (${eventId}, ${content}, ${authorUserId}, CURRENT_TIMESTAMP)
    ON CONFLICT(event_id) DO UPDATE
      SET content = EXCLUDED.content,
          author_user_id = EXCLUDED.author_user_id,
          updated_at = CURRENT_TIMESTAMP;
  `);
}
