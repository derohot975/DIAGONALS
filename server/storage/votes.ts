import { Vote, InsertVote, votes } from "@shared/schema";
import { db } from "../db";
import { eq, and } from "drizzle-orm";

export class VoteStorage {
  async getVote(id: number): Promise<Vote | undefined> {
    const [vote] = await db.select().from(votes).where(eq(votes.id, id));
    return vote || undefined;
  }

  async createVote(insertVote: InsertVote): Promise<Vote> {
    const [vote] = await db.insert(votes).values({ ...insertVote, score: insertVote.score.toString() }).returning();
    return vote;
  }

  async updateVote(id: number, score: number): Promise<Vote | undefined> {
    const [vote] = await db.update(votes).set({ score: score.toString() }).where(eq(votes.id, id)).returning();
    return vote || undefined;
  }

  async deleteVote(id: number): Promise<boolean> {
    const result = await db.delete(votes).where(eq(votes.id, id)).returning();
    return result.length > 0;
  }

  async getVotesByEventId(eventId: number): Promise<Vote[]> {
    return await db.select().from(votes).where(eq(votes.eventId, eventId));
  }

  async getVotesByWineId(wineId: number): Promise<Vote[]> {
    return await db.select().from(votes).where(eq(votes.wineId, wineId));
  }

  async getUserVoteForWine(userId: number, wineId: number): Promise<Vote | undefined> {
    const [vote] = await db.select().from(votes).where(and(eq(votes.userId, userId), eq(votes.wineId, wineId)));
    return vote || undefined;
  }
}
