import { User, InsertUser, WineEvent, InsertWineEvent, Wine, InsertWine, Vote, InsertVote } from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByName(name: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  getAllUsers(): Promise<User[]>;
  getUsersByEventId(eventId: number): Promise<User[]>;
  
  // Wine Event operations
  getWineEvent(id: number): Promise<WineEvent | undefined>;
  createWineEvent(event: InsertWineEvent): Promise<WineEvent>;
  getAllWineEvents(): Promise<WineEvent[]>;
  updateWineEventStatus(id: number, status: string): Promise<WineEvent | undefined>;
  updateEventVotingStatus(id: number, votingStatus: string): Promise<WineEvent | undefined>;
  
  // Wine operations
  getWine(id: number): Promise<Wine | undefined>;
  getWineById(id: number): Promise<Wine | undefined>;
  createWine(wine: InsertWine): Promise<Wine>;
  getWinesByEventId(eventId: number): Promise<Wine[]>;
  updateWineRevealed(id: number, isRevealed: boolean): Promise<Wine | undefined>;
  updateWineRevealStatus(id: number, isRevealed: boolean): Promise<Wine | undefined>;
  updateWineVotingStatus(id: number, votingStatus: string): Promise<Wine | undefined>;
  
  // Vote operations
  getVote(id: number): Promise<Vote | undefined>;
  createVote(vote: InsertVote): Promise<Vote>;
  updateVote(id: number, score: number, hasLode: boolean): Promise<Vote | undefined>;
  getVotesByEventId(eventId: number): Promise<Vote[]>;
  getVotesByWineId(wineId: number): Promise<Vote[]>;
  getUserVoteForWine(userId: number, wineId: number): Promise<Vote | undefined>;
}

export class MemStorage implements IStorage {
  private users: User[] = [];
  private wineEvents: WineEvent[] = [];
  private wines: Wine[] = [];
  private votes: Vote[] = [];
  private nextUserId = 1;
  private nextEventId = 1;
  private nextWineId = 1;
  private nextVoteId = 1;

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async getUserByName(name: string): Promise<User | undefined> {
    return this.users.find(user => user.name === name);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: this.nextUserId++,
      name: insertUser.name,
      isAdmin: insertUser.isAdmin || false,
      sessionId: insertUser.sessionId || null,
      lastActivity: insertUser.lastActivity || null,
    };
    this.users.push(user);
    return user;
  }

  async updateUserSession(userId: number, sessionId: string): Promise<User | undefined> {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.sessionId = sessionId;
      user.lastActivity = new Date();
    }
    return user;
  }

  async checkUserSession(userId: number): Promise<User | undefined> {
    return this.users.find(user => user.id === userId);
  }

  async clearUserSession(userId: number): Promise<void> {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.sessionId = null;
      user.lastActivity = null;
    }
  }

  async getAllUsers(): Promise<User[]> {
    return [...this.users];
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.find(u => u.id === id);
    if (user) {
      Object.assign(user, updates);
    }
    return user;
  }

  async deleteUser(id: number): Promise<boolean> {
    const index = this.users.findIndex(u => u.id === id);
    if (index !== -1) {
      this.users.splice(index, 1);
      return true;
    }
    return false;
  }

  // Wine Event operations
  async getWineEvent(id: number): Promise<WineEvent | undefined> {
    return this.wineEvents.find(event => event.id === id);
  }

  async createWineEvent(insertEvent: InsertWineEvent): Promise<WineEvent> {
    const event: WineEvent = {
      id: this.nextEventId++,
      name: insertEvent.name,
      date: insertEvent.date,
      mode: insertEvent.mode,
      status: insertEvent.status || 'active',
      votingStatus: insertEvent.votingStatus || 'pending',
    };
    this.wineEvents.push(event);
    return event;
  }

  async getAllWineEvents(): Promise<WineEvent[]> {
    return [...this.wineEvents];
  }

  async updateWineEventStatus(id: number, status: string): Promise<WineEvent | undefined> {
    const event = this.wineEvents.find(e => e.id === id);
    if (event) {
      event.status = status;
    }
    return event;
  }

  async updateEventVotingStatus(id: number, votingStatus: string): Promise<WineEvent | undefined> {
    const event = this.wineEvents.find(e => e.id === id);
    if (event) {
      event.votingStatus = votingStatus;
    }
    return event;
  }

  // Wine operations
  async getWine(id: number): Promise<Wine | undefined> {
    return this.wines.find(wine => wine.id === id);
  }

  async getWineById(id: number): Promise<Wine | undefined> {
    return this.wines.find(wine => wine.id === id);
  }

  async createWine(insertWine: InsertWine): Promise<Wine> {
    const wine: Wine = {
      id: this.nextWineId++,
      eventId: insertWine.eventId,
      userId: insertWine.userId,
      type: insertWine.type,
      name: insertWine.name,
      producer: insertWine.producer,
      grape: insertWine.grape,
      year: insertWine.year,
      origin: insertWine.origin,
      price: insertWine.price,
      isRevealed: insertWine.isRevealed || false,
      votingStatus: insertWine.votingStatus || 'pending',
    };
    this.wines.push(wine);
    return wine;
  }

  async getWinesByEventId(eventId: number): Promise<Wine[]> {
    return this.wines.filter(wine => wine.eventId === eventId);
  }

  async updateWineRevealed(id: number, isRevealed: boolean): Promise<Wine | undefined> {
    const wine = this.wines.find(w => w.id === id);
    if (wine) {
      wine.isRevealed = isRevealed;
    }
    return wine;
  }

  async updateWineRevealStatus(id: number, isRevealed: boolean): Promise<Wine | undefined> {
    const wine = this.wines.find(w => w.id === id);
    if (wine) {
      wine.isRevealed = isRevealed;
    }
    return wine;
  }

  async updateWineVotingStatus(id: number, votingStatus: string): Promise<Wine | undefined> {
    const wine = this.wines.find(w => w.id === id);
    if (wine) {
      wine.votingStatus = votingStatus;
    }
    return wine;
  }

  // Vote operations
  async getVote(id: number): Promise<Vote | undefined> {
    return this.votes.find(vote => vote.id === id);
  }

  async createVote(insertVote: InsertVote): Promise<Vote> {
    const vote: Vote = {
      id: this.nextVoteId++,
      eventId: insertVote.eventId,
      wineId: insertVote.wineId,
      userId: insertVote.userId,
      score: insertVote.score,
      hasLode: insertVote.hasLode || false,
    };
    this.votes.push(vote);
    return vote;
  }

  async updateVote(id: number, score: number, hasLode: boolean): Promise<Vote | undefined> {
    const vote = this.votes.find(v => v.id === id);
    if (vote) {
      vote.score = score;
      vote.hasLode = hasLode;
    }
    return vote;
  }

  async getVotesByEventId(eventId: number): Promise<Vote[]> {
    return this.votes.filter(vote => vote.eventId === eventId);
  }

  async getVotesByWineId(wineId: number): Promise<Vote[]> {
    return this.votes.filter(vote => vote.wineId === wineId);
  }

  async getUserVoteForWine(userId: number, wineId: number): Promise<Vote | undefined> {
    return this.votes.find(vote => vote.userId === userId && vote.wineId === wineId);
  }

  // Advanced functions for voting management
  async getUsersByEventId(eventId: number): Promise<User[]> {
    const eventWines = this.wines.filter(wine => wine.eventId === eventId);
    const userIds = [...new Set(eventWines.map(wine => wine.userId))];
    return this.users.filter(user => userIds.includes(user.id));
  }
}

export const storage = new MemStorage();