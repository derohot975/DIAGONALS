import { Router, type Request, type Response } from "express";
import { storage } from "../storage";
import { insertVoteSchema } from "@shared/schema";
import { z } from "zod";

// Internal constants
const ROUNDING_PRECISION = 10;
const UNKNOWN_CONTRIBUTOR = 'Unknown';

export const votesRouter = Router();

// Vote routes
votesRouter.get("/", async (req: Request, res: Response) => {
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

votesRouter.post("/", async (req: Request, res: Response) => {
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

// Note: Event-specific votes, wine-specific votes, and results are now handled
// directly in their respective domain routers (events.ts, wines.ts) to avoid
// complex routing conflicts and maintain clear domain boundaries.
