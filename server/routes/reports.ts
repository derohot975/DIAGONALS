import { Router, type Request, type Response } from "express";
import { storage } from "../storage";
import { EventReportData, UserRanking, WineResultDetailed } from "@shared/schema";
import { getPagellaByEventId, upsertPagella } from "../db/pagella";

// Internal constants
const ROUNDING_PRECISION = 10;
const UNKNOWN_CONTRIBUTOR = 'Unknown';

export const reportsRouter = Router();

// Helper: verifica se l'utente può scrivere (solo DERO e TOMMY)
async function canEditPagella(userId: number): Promise<boolean> {
  if (!userId) return false;
  
  const user = await storage.getUser(userId);
  if (!user || !user.name) return false;
  
  // Solo DERO e TOMMY possono modificare (case-insensitive)
  const allowedUsers = ['DERO', 'TOMMY'];
  const userName = user.name.toUpperCase();
  return allowedUsers.includes(userName);
}

// BEGIN DIAGONALE PAGELLA - Shared pagella endpoints

// GET /api/events/:id/pagella — leggibile da tutti (come altre rotte di lettura)
reportsRouter.get("/:id/pagella", async (req: Request, res: Response) => {
  try {
    const eventId = Number(req.params.id);
    if (!Number.isFinite(eventId)) return res.status(400).json({ error: "Invalid event id" });
    
    const pagella = await getPagellaByEventId(eventId);
    
    // Assicura che updated_at sia una ISO string
    const responseData = pagella ? {
      content: pagella.content || "",
      updatedAt: pagella.updatedAt ? new Date(pagella.updatedAt).toISOString() : null,
      authorUserId: pagella.authorUserId || null
    } : {
      content: "",
      updatedAt: null,
      authorUserId: null
    };
    
    return res.json({ 
      ok: true, 
      data: responseData
    });
  } catch (error) {
    console.error('Get pagella error:', error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/events/:id/pagella — scrivibile solo da DERO e TOMMY
reportsRouter.put("/:id/pagella", async (req: Request, res: Response) => {
  try {
    const eventId = Number(req.params.id);
    if (!Number.isFinite(eventId)) return res.status(400).json({ error: "Invalid event id" });
    
    const { content, userId } = req.body;
    if (typeof content !== "string") return res.status(400).json({ error: "content must be string" });
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }
    
    const allowed = await canEditPagella(userId);
    if (!allowed) {
      return res.status(403).json({ error: "Forbidden: only DERO and TOMMY can edit pagella" });
    }
    
    await upsertPagella(eventId, content, userId);
    
    // Ritorna i dati aggiornati incluso updated_at
    const updatedPagella = await getPagellaByEventId(eventId);
    const responseData = updatedPagella ? {
      content: updatedPagella.content || "",
      updatedAt: updatedPagella.updatedAt ? new Date(updatedPagella.updatedAt).toISOString() : null,
      authorUserId: updatedPagella.authorUserId || null
    } : {
      content: content,
      updatedAt: new Date().toISOString(),
      authorUserId: userId
    };
    
    return res.json({ ok: true, data: responseData });
  } catch (error) {
    console.error('Update pagella error:', error);
    return res.status(500).json({ error: "Internal server error" });
  }
});
// END DIAGONALE PAGELLA

// Event completion and report generation
reportsRouter.post("/:id/complete", async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.id);
    const { userId } = req.body;

    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    // Check if event exists
    const event = await storage.getWineEvent(eventId);
    if (!event) {
      res.status(404).json({ message: "Event not found" });
      return;
    }

    // Check if voting is complete
    const completionStatus = await storage.checkEventVotingComplete(eventId);
    if (!completionStatus.isComplete) {
      res.status(400).json({ 
        message: "Non tutti i partecipanti hanno completato le votazioni",
        completionStatus 
      });
      return;
    }

    // Check if report already exists
    const existingReport = await storage.getEventReport(eventId);
    if (existingReport) {
      res.status(409).json({ message: "Report per questo evento già esistente" });
      return;
    }

    // Generate comprehensive report data
    const wines = await storage.getWinesByEventId(eventId);
    const votes = await storage.getVotesByEventId(eventId);
    const participants = await storage.getUsersByEventId(eventId);
    const allUsers = await storage.getAllUsers();

    // Calculate wine results with detailed votes
    const wineResults: WineResultDetailed[] = wines.map(wine => {
      const wineVotes = votes.filter(vote => vote.wineId === wine.id);
      const totalScore = wineVotes.reduce((sum, vote) => sum + parseFloat(vote.score.toString()), 0);
      const averageScore = wineVotes.length > 0 ? totalScore / wineVotes.length : 0;
      
      const contributor = allUsers.find(u => u.id === wine.userId);
      
      return {
        ...wine,
        averageScore: Math.round(averageScore * ROUNDING_PRECISION) / ROUNDING_PRECISION,
        totalScore: Math.round(totalScore * ROUNDING_PRECISION) / ROUNDING_PRECISION,
        totalVotes: wineVotes.length,
        lodeCount: 0, // Legacy field
        contributor: contributor?.name || UNKNOWN_CONTRIBUTOR,
        votes: wineVotes.map(vote => ({
          userId: vote.userId,
          userName: allUsers.find(u => u.id === vote.userId)?.name || UNKNOWN_CONTRIBUTOR,
          score: parseFloat(vote.score.toString())
        })),
        position: 0 // Will be set after sorting
      };
    }).sort((a, b) => b.averageScore - a.averageScore);

    // Set positions
    wineResults.forEach((wine, index) => {
      wine.position = index + 1;
    });

    // Calculate user rankings
    const userRankings: UserRanking[] = participants.map(participant => {
      const userVotes = votes.filter(vote => vote.userId === participant.id);
      const totalScore = userVotes.reduce((sum, vote) => sum + parseFloat(vote.score.toString()), 0);
      const averageScore = userVotes.length > 0 ? totalScore / userVotes.length : 0;

      return {
        userId: participant.id,
        userName: participant.name,
        totalScore: Math.round(totalScore * ROUNDING_PRECISION) / ROUNDING_PRECISION,
        averageScore: Math.round(averageScore * ROUNDING_PRECISION) / ROUNDING_PRECISION,
        votesGiven: userVotes.length,
        position: 0 // Will be set after sorting
      };
    }).sort((a, b) => b.averageScore - a.averageScore);

    // Set user positions
    userRankings.forEach((user, index) => {
      user.position = index + 1;
    });

    // Create report data
    const reportData: EventReportData = {
      eventInfo: event,
      userRankings,
      wineResults,
      summary: {
        totalParticipants: participants.length,
        totalWines: wines.length,
        totalVotes: votes.length,
        averageScore: votes.length > 0 ? 
          Math.round((votes.reduce((sum, vote) => sum + parseFloat(vote.score.toString()), 0) / votes.length) * ROUNDING_PRECISION) / ROUNDING_PRECISION : 0
      }
    };

    // Save report to database
    const report = await storage.createEventReport({
      eventId,
      reportData: JSON.stringify(reportData),
      generatedBy: userId
    });

    // Update event status to completed
    await storage.updateWineEvent(eventId, { status: 'completed' });

    res.json({ 
      message: "Evento completato con successo",
      reportId: report.id,
      reportData 
    });

  } catch (error) {
    console.error('Event completion error:', error);
    res.status(500).json({ message: "Failed to complete event" });
  }
});

reportsRouter.get("/:id/report", async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.id);
    const report = await storage.getEventReport(eventId);
    
    if (!report) {
      res.status(404).json({ message: "Report not found" });
      return;
    }

    const reportData: EventReportData = JSON.parse(report.reportData);
    res.json(reportData);
  } catch (error) {
    res.status(500).json({ message: "Failed to get report" });
  }
});
