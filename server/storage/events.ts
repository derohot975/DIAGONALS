import { WineEvent, InsertWineEvent, Wine, Vote, eventReports, wineEvents, wines, votes } from "@shared/schema";
import { db } from "../db";
import { eq } from "drizzle-orm";

export class EventStorage {
  async getWineEvent(id: number): Promise<WineEvent | undefined> {
    const [event] = await db.select().from(wineEvents).where(eq(wineEvents.id, id));
    return event || undefined;
  }

  async createWineEvent(insertEvent: InsertWineEvent): Promise<WineEvent> {
    const [event] = await db.insert(wineEvents).values(insertEvent).returning();
    return event;
  }

  async getAllWineEvents(): Promise<WineEvent[]> {
    return await db.select().from(wineEvents).orderBy(wineEvents.id);
  }

  async updateWineEventStatus(id: number, status: string): Promise<WineEvent | undefined> {
    const [event] = await db.update(wineEvents).set({ status }).where(eq(wineEvents.id, id)).returning();
    return event || undefined;
  }

  async updateWineEvent(id: number, updates: Partial<InsertWineEvent>): Promise<WineEvent | undefined> {
    const [event] = await db.update(wineEvents).set(updates).where(eq(wineEvents.id, id)).returning();
    return event || undefined;
  }

  async deleteWineEvent(id: number): Promise<boolean> {
    try {
      const eventWines = await db.select().from(wines).where(eq(wines.eventId, id));
      for (const wine of eventWines) { await db.delete(votes).where(eq(votes.wineId, wine.id)); }
      await db.delete(wines).where(eq(wines.eventId, id));
      await db.delete(eventReports).where(eq(eventReports.eventId, id));
      await db.delete(wineEvents).where(eq(wineEvents.id, id));
      return true;
    } catch (error) { return false; }
  }
}
