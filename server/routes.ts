import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertWineEventSchema, insertWineSchema, insertVoteSchema } from "@shared/schema";
import { z } from "zod";
import { nanoid } from "nanoid";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid user data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create user" });
      }
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Session management routes
  app.post("/api/users/:id/login", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.checkUserSession(userId);
      
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      // Check unique session setting from header (passed from frontend)
      const uniqueSessionEnabled = req.headers['x-unique-session-enabled'] !== 'false';
      
      // Check if user is already logged in from another device (only if enabled)
      if (uniqueSessionEnabled && user.sessionId) {
        // Check if session is still active (less than 5 minutes of inactivity)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        if (user.lastActivity && user.lastActivity > fiveMinutesAgo) {
          res.status(409).json({ 
            message: "Utente già connesso da un altro dispositivo. Disconnetti prima di continuare.",
            activeSession: true 
          });
          return;
        }
      }

      // Generate new session ID
      const sessionId = nanoid();
      const updatedUser = await storage.updateUserSession(userId, sessionId);
      
      res.json({ 
        user: updatedUser, 
        sessionId,
        message: "Login effettuato con successo"
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to login user" });
    }
  });

  app.post("/api/users/:id/logout", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      await storage.clearUserSession(userId);
      res.json({ message: "Logout effettuato con successo" });
    } catch (error) {
      res.status(500).json({ message: "Failed to logout user" });
    }
  });

  app.post("/api/users/:id/heartbeat", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { sessionId } = req.body;
      
      const user = await storage.checkUserSession(userId);
      if (!user || user.sessionId !== sessionId) {
        res.status(401).json({ message: "Sessione non valida" });
        return;
      }

      // Update last activity
      await storage.updateUserSession(userId, sessionId);
      res.json({ message: "Heartbeat updated" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update heartbeat" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(id, updates);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      res.json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid user data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update user" });
      }
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteUser(id);
      if (!success) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Wine Event routes
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getAllWineEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.post("/api/events", async (req, res) => {
    try {
      console.log('Creating event with data:', req.body);
      const eventData = insertWineEventSchema.parse(req.body);
      console.log('Parsed event data:', eventData);
      
      // Verify user exists before creating event
      const user = await storage.getUser(eventData.createdBy);
      if (!user) {
        res.status(400).json({ message: `User with ID ${eventData.createdBy} not found` });
        return;
      }
      const event = await storage.createWineEvent(eventData);
      console.log('Created event:', event);
      res.status(201).json(event);
    } catch (error) {
      console.error('Event creation error:', error);
      if (error instanceof z.ZodError) {
        console.error('Validation errors:', error.errors);
        res.status(400).json({ message: "Invalid event data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create event", error: error.message });
      }
    }
  });

  app.get("/api/events/:id", async (req, res) => {
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

  app.patch("/api/events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log('Updating event:', id, 'with data:', req.body);
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
        res.status(500).json({ message: "Failed to update event", error: error.message });
      }
    }
  });

  app.delete("/api/events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteWineEvent(id);
      if (!success) {
        res.status(404).json({ message: "Event not found" });
        return;
      }
      res.json({ message: "Event deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  app.patch("/api/events/:id/status", async (req, res) => {
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

  // Wine routes
  app.get("/api/wines", async (req, res) => {
    try {
      const eventId = req.query.eventId ? parseInt(req.query.eventId as string) : null;
      if (eventId) {
        const wines = await storage.getWinesByEventId(eventId);
        res.json(wines);
      } else {
        res.status(400).json({ message: "eventId query parameter is required" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch wines" });
    }
  });

  app.get("/api/events/:eventId/wines", async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const wines = await storage.getWinesByEventId(eventId);
      res.json(wines);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch wines" });
    }
  });

  app.post("/api/wines", async (req, res) => {
    try {
      const wineData = insertWineSchema.parse(req.body);
      const wine = await storage.createWine(wineData);
      res.status(201).json(wine);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid wine data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create wine" });
      }
    }
  });

  app.patch("/api/wines/:id/reveal", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { isRevealed } = req.body;
      const wine = await storage.updateWineRevealed(id, isRevealed);
      if (!wine) {
        res.status(404).json({ message: "Wine not found" });
        return;
      }
      res.json(wine);
    } catch (error) {
      res.status(500).json({ message: "Failed to update wine" });
    }
  });

  // Vote routes
  app.get("/api/votes", async (req, res) => {
    try {
      const eventId = req.query.eventId ? parseInt(req.query.eventId as string) : null;
      if (eventId) {
        const votes = await storage.getVotesByEventId(eventId);
        res.json(votes);
      } else {
        res.status(400).json({ message: "eventId query parameter is required" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch votes" });
    }
  });

  app.get("/api/events/:eventId/votes", async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const votes = await storage.getVotesByEventId(eventId);
      res.json(votes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch votes" });
    }
  });

  app.post("/api/votes", async (req, res) => {
    try {
      const voteData = insertVoteSchema.parse(req.body);
      
      // Check if user already voted for this wine
      const existingVote = await storage.getUserVoteForWine(voteData.userId, voteData.wineId);
      if (existingVote) {
        // Update existing vote
        const updatedVote = await storage.updateVote(existingVote.id, parseFloat(voteData.score.toString()), false);
        res.json(updatedVote);
      } else {
        // Create new vote
        const vote = await storage.createVote(voteData);
        res.status(201).json(vote);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid vote data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create vote" });
      }
    }
  });

  app.get("/api/wines/:wineId/votes", async (req, res) => {
    try {
      const wineId = parseInt(req.params.wineId);
      const votes = await storage.getVotesByWineId(wineId);
      res.json(votes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch votes" });
    }
  });

  // Nuove route per gestione votazioni avanzate
  
  // Avvia fase votazioni per un evento
  app.put("/api/events/:eventId/start-voting", async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const event = await storage.updateEventVotingStatus(eventId, 'voting');
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to start voting" });
    }
  });

  // Seleziona vino per votazione
  app.put("/api/wines/:wineId/start-voting", async (req, res) => {
    try {
      const wineId = parseInt(req.params.wineId);
      const wine = await storage.updateWineVotingStatus(wineId, 'voting');
      res.json(wine);
    } catch (error) {
      res.status(500).json({ message: "Failed to start wine voting" });
    }
  });

  // Chiudi votazioni per un vino
  app.put("/api/wines/:wineId/close-voting", async (req, res) => {
    try {
      const wineId = parseInt(req.params.wineId);
      const wine = await storage.updateWineVotingStatus(wineId, 'closed');
      res.json(wine);
    } catch (error) {
      res.status(500).json({ message: "Failed to close wine voting" });
    }
  });

  // Rivela info vino (per proprietario)
  app.put("/api/wines/:wineId/reveal", async (req, res) => {
    try {
      const wineId = parseInt(req.params.wineId);
      const wine = await storage.updateWineRevealStatus(wineId, true);
      res.json(wine);
    } catch (error) {
      res.status(500).json({ message: "Failed to reveal wine info" });
    }
  });

  // Verifica se tutti hanno votato per un vino
  app.get("/api/wines/:wineId/voting-complete", async (req, res) => {
    try {
      const wineId = parseInt(req.params.wineId);
      const wine = await storage.getWineById(wineId);
      if (!wine) {
        res.status(404).json({ message: "Wine not found" });
        return;
      }
      
      const eventUsers = await storage.getUsersByEventId(wine.eventId);
      const wineVotes = await storage.getVotesByWineId(wineId);
      
      // Escludi il proprietario del vino dal conteggio
      const eligibleVoters = eventUsers.filter(user => user.id !== wine.userId);
      const isComplete = wineVotes.length >= eligibleVoters.length;
      
      res.json({ 
        isComplete, 
        totalVotes: wineVotes.length, 
        requiredVotes: eligibleVoters.length 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to check voting completion" });
    }
  });

  app.get("/api/events/:eventId/results", async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const wines = await storage.getWinesByEventId(eventId);
      const votes = await storage.getVotesByEventId(eventId);
      const users = await storage.getAllUsers();
      
      const results = wines.map(wine => {
        const wineVotes = votes.filter(vote => vote.wineId === wine.id);
        const totalScore = wineVotes.reduce((sum, vote) => sum + parseFloat(vote.score.toString()), 0);
        const contributor = users.find(u => u.id === wine.userId);
        
        return {
          ...wine,
          totalScore: Math.round(totalScore * 10) / 10, // Somma totale invece di media
          totalVotes: wineVotes.length,
          contributor: contributor?.name || "Unknown"
        };
      }).sort((a, b) => b.totalScore - a.totalScore);
      
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch results" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
