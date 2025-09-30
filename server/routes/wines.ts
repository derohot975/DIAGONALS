import { Router, type Request, type Response } from "express";
import { storage } from "../storage";
import { insertWineSchema } from "@shared/schema";
import { z } from "zod";

export const winesRouter = Router();

// Wine routes
winesRouter.get("/", async (req: Request, res: Response) => {
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

winesRouter.post("/", async (req: Request, res: Response) => {
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

winesRouter.put("/:id", async (req: Request, res: Response) => {
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

// Wine-specific votes
winesRouter.get("/:wineId/votes", async (req: Request, res: Response) => {
  try {
    const wineId = parseInt(req.params.wineId);
    const votes = await storage.getVotesByWineId(wineId);
    res.json(votes);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch votes" });
  }
});
