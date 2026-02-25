import { Wine, InsertWine, wines, wineEvents, users } from "@shared/schema";
import { db } from "../db";
import { eq, and, sql } from "drizzle-orm";

export class WineStorage {
  async getWine(id: number): Promise<Wine | undefined> {
    const [wine] = await db.select().from(wines).where(eq(wines.id, id));
    return wine || undefined;
  }

  async getWineById(id: number): Promise<Wine | undefined> {
    return this.getWine(id);
  }

  async createWine(insertWine: InsertWine): Promise<Wine> {
    const [wine] = await db.insert(wines).values(insertWine).returning();
    return wine;
  }

  async getAllWines(): Promise<Wine[]> {
    return await db.select().from(wines);
  }

  async getWinesByEventId(eventId: number): Promise<Wine[]> {
    return await db.select().from(wines).where(eq(wines.eventId, eventId));
  }

  async updateWine(id: number, updates: Partial<InsertWine>): Promise<Wine | undefined> {
    const [wine] = await db.update(wines).set(updates).where(eq(wines.id, id)).returning();
    return wine || undefined;
  }

  async deleteWine(id: number): Promise<boolean> {
    const result = await db.delete(wines).where(eq(wines.id, id)).returning();
    return result.length > 0;
  }

  async searchWinesInCompletedEvents(query: string, limit: number, offset: number): Promise<any[]> {
    const searchTerm = `%${query.toLowerCase()}%`;
    return await db.select({
      id: wines.id, name: wines.name, producer: wines.producer, type: wines.type,
      year: wines.year, userName: users.name, eventName: wineEvents.name, eventDate: wineEvents.date,
    }).from(wines)
      .innerJoin(wineEvents, eq(wines.eventId, wineEvents.id))
      .innerJoin(users, eq(wines.userId, users.id))
      .where(and(eq(wineEvents.status, 'completed'), sql`(LOWER(${wines.name}) LIKE ${searchTerm} OR LOWER(${wines.producer}) LIKE ${searchTerm})`))
      .orderBy(sql`${wineEvents.date} DESC`).limit(limit).offset(offset);
  }
}
