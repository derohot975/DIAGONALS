import { User, InsertUser, WineEvent, InsertWineEvent, Wine, InsertWine, Vote, InsertVote } from "@shared/schema";
import { users, wineEvents, wines, votes } from "@shared/schema";
import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByName(name: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  getAllUsers(): Promise<User[]>;
  getUsersByEventId(eventId: number): Promise<User[]>;
  
  // Session management
  updateUserSession(userId: number, sessionId: string): Promise<User | undefined>;
  checkUserSession(userId: number): Promise<User | undefined>;
  clearUserSession(userId: number): Promise<void>;
  
  // Wine Event operations
  getWineEvent(id: number): Promise<WineEvent | undefined>;
  createWineEvent(event: InsertWineEvent): Promise<WineEvent>;
  getAllWineEvents(): Promise<WineEvent[]>;
  updateWineEvent(id: number, updates: Partial<InsertWineEvent>): Promise<WineEvent | undefined>;
  deleteWineEvent(id: number): Promise<boolean>;
  updateWineEventStatus(id: number, status: string): Promise<WineEvent | undefined>;

  
  // Wine operations
  getWine(id: number): Promise<Wine | undefined>;
  getWineById(id: number): Promise<Wine | undefined>;
  createWine(wine: InsertWine): Promise<Wine>;
  updateWine(id: number, updates: Partial<InsertWine>): Promise<Wine | undefined>;
  getAllWines(): Promise<Wine[]>;
  getWinesByEventId(eventId: number): Promise<Wine[]>;

  
  // Vote operations
  getVote(id: number): Promise<Vote | undefined>;
  createVote(vote: InsertVote): Promise<Vote>;
  updateVote(id: number, score: number): Promise<Vote | undefined>;
  getVotesByEventId(eventId: number): Promise<Vote[]>;
  getVotesByWineId(wineId: number): Promise<Vote[]>;
  getUserVoteForWine(userId: number, wineId: number): Promise<Vote | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByName(name: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.name, name));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserSession(userId: number, sessionId: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ sessionId, lastActivity: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async checkUserSession(userId: number): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    return user;
  }

  async clearUserSession(userId: number): Promise<void> {
    await db
      .update(users)
      .set({ sessionId: null, lastActivity: null })
      .where(eq(users.id, userId));
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Wine Event operations
  async getWineEvent(id: number): Promise<WineEvent | undefined> {
    const [event] = await db.select().from(wineEvents).where(eq(wineEvents.id, id));
    return event || undefined;
  }

  async createWineEvent(insertEvent: InsertWineEvent): Promise<WineEvent> {
    const [event] = await db
      .insert(wineEvents)
      .values(insertEvent)
      .returning();
    return event;
  }

  async getAllWineEvents(): Promise<WineEvent[]> {
    return await db.select().from(wineEvents).orderBy(wineEvents.id);
  }

  async updateWineEventStatus(id: number, status: string): Promise<WineEvent | undefined> {
    const [event] = await db
      .update(wineEvents)
      .set({ status })
      .where(eq(wineEvents.id, id))
      .returning();
    return event || undefined;
  }

  async updateWineEvent(id: number, updates: Partial<InsertWineEvent>): Promise<WineEvent | undefined> {
    const [event] = await db
      .update(wineEvents)
      .set(updates)
      .where(eq(wineEvents.id, id))
      .returning();
    return event || undefined;
  }

  async deleteWineEvent(id: number): Promise<boolean> {
    const result = await db.delete(wineEvents).where(eq(wineEvents.id, id));
    return (result.rowCount ?? 0) > 0;
  }



  // Wine operations
  async getWine(id: number): Promise<Wine | undefined> {
    const [wine] = await db.select().from(wines).where(eq(wines.id, id));
    return wine || undefined;
  }

  async getWineById(id: number): Promise<Wine | undefined> {
    const [wine] = await db.select().from(wines).where(eq(wines.id, id));
    return wine || undefined;
  }

  async createWine(insertWine: InsertWine): Promise<Wine> {
    const [wine] = await db
      .insert(wines)
      .values(insertWine)
      .returning();
    return wine;
  }

  async getAllWines(): Promise<Wine[]> {
    return await db.select().from(wines);
  }

  async getWinesByEventId(eventId: number): Promise<Wine[]> {
    return await db.select().from(wines).where(eq(wines.eventId, eventId));
  }

  async updateWine(id: number, updates: Partial<InsertWine>): Promise<Wine | undefined> {
    const [wine] = await db
      .update(wines)
      .set(updates)
      .where(eq(wines.id, id))
      .returning();
    return wine || undefined;
  }



  // Vote operations
  async getVote(id: number): Promise<Vote | undefined> {
    const [vote] = await db.select().from(votes).where(eq(votes.id, id));
    return vote || undefined;
  }

  async createVote(insertVote: InsertVote): Promise<Vote> {
    const [vote] = await db
      .insert(votes)
      .values(insertVote)
      .returning();
    return vote;
  }

  async updateVote(id: number, score: number): Promise<Vote | undefined> {
    const [vote] = await db
      .update(votes)
      .set({ score: score.toString() })
      .where(eq(votes.id, id))
      .returning();
    return vote || undefined;
  }

  async getVotesByEventId(eventId: number): Promise<Vote[]> {
    return await db.select().from(votes).where(eq(votes.eventId, eventId));
  }

  async getVotesByWineId(wineId: number): Promise<Vote[]> {
    return await db.select().from(votes).where(eq(votes.wineId, wineId));
  }

  async getUserVoteForWine(userId: number, wineId: number): Promise<Vote | undefined> {
    const [vote] = await db
      .select()
      .from(votes)
      .where(and(eq(votes.userId, userId), eq(votes.wineId, wineId)));
    return vote || undefined;
  }

  // Advanced functions for voting management
  async getUsersByEventId(eventId: number): Promise<User[]> {
    const eventWines = await db.select().from(wines).where(eq(wines.eventId, eventId));
    const userIds = Array.from(new Set(eventWines.map(wine => wine.userId)));
    if (userIds.length === 0) return [];
    
    // Get all users who have registered wines in this event
    const allUsers = await db.select().from(users);
    return allUsers.filter(user => userIds.includes(user.id));
  }
}

export const storage = new DatabaseStorage();