import { Router, type Request, type Response } from "express";
import { storage } from "../storage";
import { insertWineEventSchema } from "@shared/schema";
import { z } from "zod";

export const eventsRouter = Router();

// Wine Event routes
eventsRouter.get("/", async (req: Request, res: Response) => {
  try {
    const events = await storage.getAllWineEvents();
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch events" });
  }
});

eventsRouter.post("/", async (req: Request, res: Response) => {
  try {
    const eventData = insertWineEventSchema.parse(req.body);
    
    // Verify user exists before creating event
    const user = await storage.getUser(eventData.createdBy);
    if (!user) {
      res.status(400).json({ message: `User with ID ${eventData.createdBy} not found` });
      return;
    }
    const event = await storage.createWineEvent(eventData);
    res.status(201).json(event);
  } catch (error) {
    console.error('Event creation error:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid event data", errors: error.errors });
    } else {
      res.status(500).json({ message: "Failed to create event", error: String(error) });
    }
  }
});

eventsRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const event = await storage.getWineEvent(id);
    if (!event) {
      res.status(404).json({ message: "Event not found" });
      return;
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch event" });
  }
});

eventsRouter.patch("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const eventData = insertWineEventSchema.partial().parse(req.body);
    const event = await storage.updateWineEvent(id, eventData);
    if (!event) {
      res.status(404).json({ message: "Event not found" });
      return;
    }
    res.json(event);
  } catch (error) {
    console.error('Event update error:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid event data", errors: error.errors });
    } else {
      res.status(500).json({ message: "Failed to update event", error: String(error) });
    }
  }
});

eventsRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const success = await storage.deleteWineEvent(id);
    if (!success) {
      res.status(404).json({ message: "Event not found" });
      return;
    }
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: "Failed to delete event", error: String(error) });
  }
});

eventsRouter.patch("/:id/status", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    const event = await storage.updateWineEventStatus(id, status);
    if (!event) {
      res.status(404).json({ message: "Event not found" });
      return;
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: "Failed to update event status" });
  }
});

// Voting control routes
eventsRouter.patch("/:id/voting-status", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { votingStatus } = req.body;
    
    if (!['not_started', 'active', 'completed'].includes(votingStatus)) {
      res.status(400).json({ message: "Invalid voting status" });
      return;
    }
    
    const event = await storage.updateWineEvent(id, { votingStatus });
    if (!event) {
      res.status(404).json({ message: "Event not found" });
      return;
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: "Failed to update voting status" });
  }
});

eventsRouter.get("/:id/voting-status", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const event = await storage.getWineEvent(id);
    if (!event) {
      res.status(404).json({ message: "Event not found" });
      return;
    }
    res.json({ votingStatus: event.votingStatus || 'not_started' });
  } catch (error) {
    res.status(500).json({ message: "Failed to get voting status" });
  }
});

// Event completion routes
eventsRouter.get("/:id/voting-complete", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const completionStatus = await storage.checkEventVotingComplete(id);
    res.json(completionStatus);
  } catch (error) {
    res.status(500).json({ message: "Failed to check voting completion" });
  }
});

// Wine routes specific to events
eventsRouter.get("/:eventId/wines", async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const wines = await storage.getWinesByEventId(eventId);
    res.json(wines);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch wines" });
  }
});

// Vote routes specific to events
eventsRouter.get("/:eventId/votes", async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const votes = await storage.getVotesByEventId(eventId);
    res.json(votes);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch votes" });
  }
});

// Results routes specific to events
eventsRouter.get("/:eventId/results", async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const wines = await storage.getWinesByEventId(eventId);
    const votes = await storage.getVotesByEventId(eventId);
    const users = await storage.getAllUsers();
    
    const ROUNDING_PRECISION = 10;
    const UNKNOWN_CONTRIBUTOR = 'Unknown';
    
    const results = wines.map(wine => {
      const wineVotes = votes.filter(vote => vote.wineId === wine.id);
      const totalScore = wineVotes.reduce((sum, vote) => sum + parseFloat(vote.score.toString()), 0);
      const averageScore = wineVotes.length > 0 ? totalScore / wineVotes.length : 0;
      const contributor = users.find(u => u.id === wine.userId);
      
      // Includi i dettagli dei voti individuali
      const voteDetails = wineVotes.map(vote => {
        const voter = users.find(u => u.id === vote.userId);
        return {
          userId: vote.userId,
          userName: voter?.name || "Unknown",
          score: parseFloat(vote.score.toString())
        };
      });
      
      return {
        ...wine,
        averageScore: Math.round(averageScore * ROUNDING_PRECISION) / ROUNDING_PRECISION,
        totalVotes: wineVotes.length,
        contributor: contributor?.name || UNKNOWN_CONTRIBUTOR,
        votes: voteDetails
      };
    }).sort((a, b) => b.averageScore - a.averageScore);
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch results" });
  }
});

// Participants routes
eventsRouter.get("/:eventId/participants", async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const participants = await storage.getUsersByEventId(eventId);
    
    // Format participants with registration date
    const formattedParticipants = participants.map(user => ({
      userId: user.id,
      userName: user.name,
      registeredAt: new Date().toISOString() // For now, use current date
    }));
    
    res.json(formattedParticipants);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch participants" });
  }
});

eventsRouter.delete("/:eventId/participants/:userId", async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const userId = parseInt(req.params.userId);
    
    // First, delete the user's wine for this event
    const wines = await storage.getWinesByEventId(eventId);
    const userWine = wines.find(wine => wine.userId === userId);
    
    if (userWine) {
      // Delete all votes for this wine
      const votes = await storage.getVotesByEventId(eventId);
      const wineVotes = votes.filter(vote => vote.wineId === userWine.id);
      
      for (const vote of wineVotes) {
        await storage.deleteVote(vote.id);
      }
      
      // Delete the wine
      await storage.deleteWine(userWine.id);
    }
    
    // Also delete any votes the user made for other wines
    const allVotes = await storage.getVotesByEventId(eventId);
    const userVotes = allVotes.filter(vote => vote.userId === userId);
    
    for (const vote of userVotes) {
      await storage.deleteVote(vote.id);
    }
    
    res.json({ message: "Partecipante rimosso con successo dall'evento" });
  } catch (error) {
    console.error('Remove participant error:', error);
    res.status(500).json({ message: "Errore nella rimozione del partecipante" });
  }
});
