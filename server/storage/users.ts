import { 
  User, InsertUser, WineEvent, InsertWineEvent, Wine, InsertWine, 
  Vote, InsertVote, EventReport, InsertEventReport, EventReportData 
} from "@shared/schema";
import { users, wineEvents, wines, votes, eventReports } from "@shared/schema";
import { db } from "../db";
import { eq, and, sql } from "drizzle-orm";

export class UserStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByName(name: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.name, name));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async authenticateUser(name: string, pin: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(and(eq(users.name, name), eq(users.pin, pin)));
    return user || undefined;
  }

  async authenticateUserByPin(pin: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.pin, pin));
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user || undefined;
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      const userWines = await db.select().from(wines).where(eq(wines.userId, id));
      for (const wine of userWines) { await db.delete(votes).where(eq(votes.wineId, wine.id)); }
      await db.delete(votes).where(eq(votes.userId, id));
      await db.delete(wines).where(eq(wines.userId, id));
      await db.delete(users).where(eq(users.id, id));
      return true;
    } catch (error) { return false; }
  }

  async getUsersByEventId(eventId: number): Promise<User[]> {
    const eventWines = await db.select().from(wines).where(eq(wines.eventId, eventId));
    const userIds = Array.from(new Set(eventWines.map(wine => wine.userId)));
    if (userIds.length === 0) return [];
    const allUsers = await db.select().from(users);
    return allUsers.filter(user => userIds.includes(user.id));
  }
}
