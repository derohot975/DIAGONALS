import { User, InsertUser, WineEvent, InsertWineEvent, Wine, InsertWine, Vote, InsertVote, EventReport, InsertEventReport, EventReportData } from "@shared/schema";
import { users, wineEvents, wines, votes, eventReports } from "@shared/schema";
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
  
  // PIN authentication
  authenticateUser(name: string, pin: string): Promise<User | undefined>;
  authenticateUserByPin(pin: string): Promise<User | undefined>;
  
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
  
  // Event Report operations
  createEventReport(report: InsertEventReport): Promise<EventReport>;
  getEventReport(eventId: number): Promise<EventReport | undefined>;
  
  // Voting completion check
  checkEventVotingComplete(eventId: number): Promise<{ isComplete: boolean; totalParticipants: number; totalWines: number; votesReceived: number; }>;
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

  async authenticateUser(name: string, pin: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(
      and(eq(users.name, name), eq(users.pin, pin))
    );
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
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      // Prima trova tutti i vini dell'utente
      const userWines = await db.select().from(wines).where(eq(wines.userId, id));
      
      // Elimina tutti i voti sui vini dell'utente (da tutti gli utenti)
      for (const wine of userWines) {
        await db.delete(votes).where(eq(votes.wineId, wine.id));
      }
      
      // Elimina tutti i voti dell'utente (su qualsiasi vino)
      await db.delete(votes).where(eq(votes.userId, id));
      
      // Poi elimina tutti i vini dell'utente
      await db.delete(wines).where(eq(wines.userId, id));
      
      // Infine elimina l'utente stesso
      await db.delete(users).where(eq(users.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
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
    try {
      // Prima elimina tutti i voti collegati ai vini dell'evento
      const eventWines = await db.select().from(wines).where(eq(wines.eventId, id));
      
      for (const wine of eventWines) {
        await db.delete(votes).where(eq(votes.wineId, wine.id));
      }
      
      // Poi elimina tutti i vini dell'evento
      await db.delete(wines).where(eq(wines.eventId, id));
      
      // Elimina i report dell'evento se esistono
      await db.delete(eventReports).where(eq(eventReports.eventId, id));
      
      // Infine elimina l'evento stesso
      await db.delete(wineEvents).where(eq(wineEvents.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting wine event:', error);
      return false;
    }
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
      .values({
        ...insertVote,
        score: insertVote.score.toString()
      })
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

  // Event Report operations
  async createEventReport(insertReport: InsertEventReport): Promise<EventReport> {
    const [report] = await db
      .insert(eventReports)
      .values(insertReport)
      .returning();
    return report;
  }

  async getEventReport(eventId: number): Promise<EventReport | undefined> {
    const [report] = await db
      .select()
      .from(eventReports)
      .where(eq(eventReports.eventId, eventId));
    return report || undefined;
  }

  // Check if all participants have voted for all wines in an event
  async checkEventVotingComplete(eventId: number): Promise<{ isComplete: boolean; totalParticipants: number; totalWines: number; votesReceived: number; }> {
    // Get all participants (users who registered wines for this event)
    const participants = await this.getUsersByEventId(eventId);
    
    // Get all wines for this event
    const eventWines = await this.getWinesByEventId(eventId);
    
    // Get all votes for this event
    const eventVotes = await this.getVotesByEventId(eventId);
    
    // Calculate expected votes: each participant should vote for all wines except their own
    let expectedVotes = 0;
    for (const participant of participants) {
      const winesCanVoteFor = eventWines.filter(wine => wine.userId !== participant.id);
      expectedVotes += winesCanVoteFor.length;
    }
    
    const votesReceived = eventVotes.length;
    const isComplete = votesReceived >= expectedVotes;
    
    return {
      isComplete,
      totalParticipants: participants.length,
      totalWines: eventWines.length,
      votesReceived
    };
  }
}

export const storage = new DatabaseStorage();