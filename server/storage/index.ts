import { UserStorage } from "./users";
import { EventStorage } from "./events";
import { WineStorage } from "./wines";
import { VoteStorage } from "./votes";
import { ReportStorage } from "./reports";
import { 
  User, InsertUser, WineEvent, InsertWineEvent, Wine, InsertWine, 
  Vote, InsertVote, EventReport, InsertEventReport 
} from "@shared/schema";

export class DatabaseStorage {
  private users = new UserStorage();
  private events = new EventStorage();
  private wines = new WineStorage();
  private votes = new VoteStorage();
  private reports = new ReportStorage();

  // User
  getUser(id: number) { return this.users.getUser(id); }
  getUserByName(name: string) { return this.users.getUserByName(name); }
  createUser(u: InsertUser) { return this.users.createUser(u); }
  authenticateUser(n: string, p: string) { return this.users.authenticateUser(n, p); }
  authenticateUserByPin(p: string) { return this.users.authenticateUserByPin(p); }
  getAllUsers() { return this.users.getAllUsers(); }
  updateUser(id: number, u: Partial<InsertUser>) { return this.users.updateUser(id, u); }
  deleteUser(id: number) { return this.users.deleteUser(id); }
  getUsersByEventId(id: number) { return this.users.getUsersByEventId(id); }

  // Event
  getWineEvent(id: number) { return this.events.getWineEvent(id); }
  createWineEvent(e: InsertWineEvent) { return this.events.createWineEvent(e); }
  getAllWineEvents() { return this.events.getAllWineEvents(); }
  updateWineEventStatus(id: number, s: string) { return this.events.updateWineEventStatus(id, s); }
  updateWineEvent(id: number, e: Partial<InsertWineEvent>) { return this.events.updateWineEvent(id, e); }
  deleteWineEvent(id: number) { return this.events.deleteWineEvent(id); }

  // Wine
  getWine(id: number) { return this.wines.getWine(id); }
  getWineById(id: number) { return this.wines.getWineById(id); }
  createWine(w: InsertWine) { return this.wines.createWine(w); }
  getAllWines() { return this.wines.getAllWines(); }
  getWinesByEventId(id: number) { return this.wines.getWinesByEventId(id); }
  updateWine(id: number, w: Partial<InsertWine>) { return this.wines.updateWine(id, w); }
  deleteWine(id: number) { return this.wines.deleteWine(id); }
  searchWinesInCompletedEvents(q: string, l: number, o: number) { return this.wines.searchWinesInCompletedEvents(q, l, o); }

  // Vote
  getVote(id: number) { return this.votes.getVote(id); }
  createVote(v: InsertVote) { return this.votes.createVote(v); }
  updateVote(id: number, s: number) { return this.votes.updateVote(id, s); }
  deleteVote(id: number) { return this.votes.deleteVote(id); }
  getVotesByEventId(id: number) { return this.votes.getVotesByEventId(id); }
  getVotesByWineId(id: number) { return this.votes.getVotesByWineId(id); }
  getUserVoteForWine(u: number, w: number) { return this.votes.getUserVoteForWine(u, w); }

  // Report
  createEventReport(r: InsertEventReport) { return this.reports.createEventReport(r); }
  getEventReport(id: number) { return this.reports.getEventReport(id); }
  async checkEventVotingComplete(id: number) {
    const [p, w, v] = await Promise.all([
      this.getUsersByEventId(id),
      this.getWinesByEventId(id),
      this.getVotesByEventId(id)
    ]);
    return this.reports.checkEventVotingComplete(id, p, w, v);
  }
}

export const storage = new DatabaseStorage();
