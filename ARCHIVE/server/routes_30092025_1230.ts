import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertWineEventSchema, insertWineSchema, insertVoteSchema, insertEventReportSchema, EventReportData, UserRanking, WineResultDetailed } from "@shared/schema";
import { z } from "zod";
import { getPagellaByEventId, upsertPagella } from "./db/pagella";

// Internal constants
const ROUNDING_PRECISION = 10;
const UNKNOWN_CONTRIBUTOR = 'Unknown';

export async function registerRoutes(app: Express): Promise<Server> {
  // BEGIN DIAGONALE KEEP-ALIVE - Health endpoint
  let healthCallCount = 0;
  
  app.get("/api/health", async (req, res) => {
    const startTime = Date.now();
    
    try {
      // Token anti-abuso semplice
      const token = req.query.token as string;
      const expectedToken = process.env.ENV_KEEPALIVE_TOKEN;
      
      if (!expectedToken || token !== expectedToken) {
        // 404 per non esporre l'endpoint
        return res.status(404).json({ message: "Not found" });
      }
      
      // Log sobrio: solo 1 su 100 richieste
      healthCallCount++;
      const shouldLog = healthCallCount % 100 === 0;
      
      // Response base veloce
      const response: any = {
        ok: true,
        ts: new Date().toISOString(),
        version: "1.0.0"
      };
      
      // DB ping opzionale sotto feature flag
      const enableDbPing = process.env.KEEPALIVE_DB_PING === 'true';
      if (enableDbPing) {
        try {
          const dbStart = Date.now();
          // Ping DB molto leggero - usa una query semplice tramite storage
          await storage.getAllUsers(); // Query leggera esistente
          const dbDuration = Date.now() - dbStart;
          
          if (dbDuration < 50) {
            response.db = { ok: true, ms: dbDuration };
          } else {
            response.db = { ok: false, ms: dbDuration, reason: 'slow' };
          }
        } catch (dbError) {
          response.db = { ok: false, reason: 'error' };
        }
      }
      
      const totalDuration = Date.now() - startTime;
      
      // Log sobrio
      if (shouldLog) {
        console.log(`🏥 /api/health: OK in ${totalDuration}ms (call #${healthCallCount})`);
      }
      
      // Cache-Control: no-store
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      res.json(response);
      
    } catch (error) {
      const errorDuration = Date.now() - startTime;
      console.error(`❌ /api/health: Error after ${errorDuration}ms`, error);
      res.status(500).json({ ok: false, error: 'Internal error' });
    }
  });
  // END DIAGONALE KEEP-ALIVE

  // BEGIN DIAGONALE PAGELLA - Shared pagella endpoints
  
  // Helper: verifica se l'utente può scrivere (solo DERO e TOMMY)
  async function canEditPagella(userId: number) {
    if (!userId) return false;
    
    const user = await storage.getUser(userId);
    if (!user || !user.name) return false;
    
    // Solo DERO e TOMMY possono modificare (case-insensitive)
    const allowedUsers = ['DERO', 'TOMMY'];
    const userName = user.name.toUpperCase();
    return allowedUsers.includes(userName);
  }

  // GET /api/events/:id/pagella — leggibile da tutti (come altre rotte di lettura)
  app.get("/api/events/:id/pagella", async (req: Request, res: Response) => {
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
  app.put("/api/events/:id/pagella", async (req: Request, res: Response) => {
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

  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { pin } = req.body;
      
      if (!pin) {
        res.status(400).json({ message: "PIN richiesto" });
        return;
      }

      // Cerca utente solo per PIN
      const user = await storage.authenticateUserByPin(pin);
      
      if (!user) {
        res.status(401).json({ message: "PIN non valido" });
        return;
      }

      res.json({ user, message: "Login effettuato con successo" });
    } catch (error) {
      res.status(500).json({ message: "Errore durante il login" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, pin } = req.body;
      
      if (!name || !pin) {
        res.status(400).json({ message: "Nome e PIN sono richiesti" });
        return;
      }

      if (name.length > 10) {
        res.status(400).json({ message: "Il nome non può superare i 10 caratteri" });
        return;
      }

      if (!/^\d{4}$/.test(pin)) {
        res.status(400).json({ message: "Il PIN deve essere di 4 cifre" });
        return;
      }

      // Check if user already exists by name
      const existingUser = await storage.getUserByName(name);
      if (existingUser) {
        res.status(409).json({ message: "Nome utente già esistente" });
        return;
      }

      // Check if PIN already exists
      const existingPinUser = await storage.authenticateUserByPin(pin);
      if (existingPinUser) {
        res.status(409).json({ message: "PIN già esistente!" });
        return;
      }

      const userData = { name, pin, isAdmin: false };
      const user = await storage.createUser(userData);
      
      res.status(201).json({ user, message: "Registrazione completata con successo" });
    } catch (error) {
      res.status(500).json({ message: "Errore durante la registrazione" });
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
      console.error('Delete event error:', error);
      res.status(500).json({ message: "Failed to delete event", error: String(error) });
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

  // Voting control routes
  app.patch("/api/events/:id/voting-status", async (req, res) => {
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

  app.get("/api/events/:id/voting-status", async (req, res) => {
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
  app.get("/api/events/:id/voting-complete", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const completionStatus = await storage.checkEventVotingComplete(id);
      res.json(completionStatus);
    } catch (error) {
      res.status(500).json({ message: "Failed to check voting completion" });
    }
  });

  app.post("/api/events/:id/complete", async (req, res) => {
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

  app.get("/api/events/:id/report", async (req, res) => {
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

  // Wine routes
  app.get("/api/wines", async (req, res) => {
    // BEGIN DIAGONALE APP SHELL - Performance telemetry (non-invasive)
    const startTime = Date.now();
    // END DIAGONALE APP SHELL
    
    try {
      const eventId = req.query.eventId ? parseInt(req.query.eventId as string) : null;
      
      // BEGIN DIAGONALE APP SHELL - Query timing and diagnostics
      let wines;
      let queryType;
      const queryStart = Date.now();
      
      if (eventId) {
        queryType = 'getWinesByEventId';
        wines = await storage.getWinesByEventId(eventId);
      } else {
        queryType = 'getAllWines';
        // Return all wines for EventListScreen
        wines = await storage.getAllWines();
      }
      
      const queryDuration = Date.now() - queryStart;
      const totalDuration = Date.now() - startTime;
      
      // Server-Timing header per diagnostica client-side
      res.set('Server-Timing', `wines-query;dur=${queryDuration}, wines-total;dur=${totalDuration}`);
      
      // Performance monitoring for slow queries
      if (queryDuration > 1000) {
        console.warn(`⚠️ /api/wines: Query lenta rilevata (${queryDuration}ms) - ${queryType}`);
      }
      // END DIAGONALE APP SHELL
      
      res.json(wines);
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
      // Trasforma i campi numerici per la compatibilità
      const requestData = { ...req.body };
      if (requestData.alcohol !== undefined && requestData.alcohol !== null) {
        requestData.alcohol = typeof requestData.alcohol === 'number' ? requestData.alcohol.toString() : requestData.alcohol;
      }
      if (requestData.price !== undefined && requestData.price !== null) {
        requestData.price = typeof requestData.price === 'number' ? requestData.price.toString() : requestData.price;
      }
      
      const wineData = insertWineSchema.parse(requestData);
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

  app.put("/api/wines/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Trasforma il campo alcohol se presente
      const requestData = { ...req.body };
      if (requestData.alcohol !== undefined && requestData.alcohol !== null) {
        requestData.alcohol = typeof requestData.alcohol === 'number' ? requestData.alcohol.toString() : requestData.alcohol;
      }
      
      // Creo uno schema di update specifico che gestisce correttamente l'alcohol
      const updateWineSchema = z.object({
        type: z.string().optional(),
        name: z.string().optional(),
        producer: z.string().optional(),
        grape: z.string().optional(),
        year: z.number().optional(),
        origin: z.string().optional(),
        price: z.union([z.string(), z.number()]).optional().transform((val) => {
          if (val === null || val === undefined) return undefined;
          return typeof val === 'number' ? val.toString() : val;
        }),
        alcohol: z.union([z.string(), z.number()]).optional().transform((val) => {
          if (val === null || val === undefined) return undefined;
          return typeof val === 'number' ? val.toString() : val;
        })
      });
      
      const wineData = updateWineSchema.parse(requestData);
      
      const wine = await storage.updateWine(id, wineData);
      if (!wine) {
        res.status(404).json({ message: "Wine not found" });
        return;
      }
      res.json(wine);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid wine data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update wine" });
      }
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
      // Ensure score is a number
      const voteData = {
        ...req.body,
        score: Number(req.body.score)
      };
      
      const validatedData = insertVoteSchema.parse(voteData);
      
      // Check if user already voted for this wine
      const existingVote = await storage.getUserVoteForWine(validatedData.userId, validatedData.wineId);
      if (existingVote) {
        // Update existing vote
        const updatedVote = await storage.updateVote(existingVote.id, Number(validatedData.score));
        res.json(updatedVote);
      } else {
        // Create new vote
        const vote = await storage.createVote(validatedData);
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

  app.get("/api/events/:eventId/results", async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const wines = await storage.getWinesByEventId(eventId);
      const votes = await storage.getVotesByEventId(eventId);
      const users = await storage.getAllUsers();
      
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

  const httpServer = createServer(app);
  return httpServer;
}
