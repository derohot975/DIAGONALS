import { EventReport, InsertEventReport, eventReports, User, Wine, Vote } from "@shared/schema";
import { db } from "../db";
import { eq } from "drizzle-orm";

export class ReportStorage {
  async createEventReport(insertReport: InsertEventReport): Promise<EventReport> {
    const [report] = await db.insert(eventReports).values(insertReport).returning();
    return report;
  }

  async getEventReport(eventId: number): Promise<EventReport | undefined> {
    const [report] = await db.select().from(eventReports).where(eq(eventReports.eventId, eventId));
    return report || undefined;
  }

  async checkEventVotingComplete(eventId: number, participants: User[], eventWines: Wine[], eventVotes: Vote[]): Promise<{
    isComplete: boolean; totalParticipants: number; totalWines: number; votesReceived: number;
    missingVotes: { userName: string; missingWineNames: string[] }[];
  }> {
    let expectedVotes = 0;
    const missingVotes: { userName: string; missingWineNames: string[] }[] = [];
    for (const participant of participants) {
      const winesCanVoteFor = eventWines.filter(wine => wine.userId !== participant.id);
      expectedVotes += winesCanVoteFor.length;
      const votedWineIds = new Set(eventVotes.filter(v => v.userId === participant.id).map(v => v.wineId));
      const missingWineNames = winesCanVoteFor.filter(wine => !votedWineIds.has(wine.id)).map(wine => wine.name || `Vino #${wine.id}`);
      if (missingWineNames.length > 0) missingVotes.push({ userName: participant.name, missingWineNames });
    }
    const votesReceived = eventVotes.length;
    return { isComplete: votesReceived >= expectedVotes, totalParticipants: participants.length, totalWines: eventWines.length, votesReceived, missingVotes };
  }
}
