import { Router, type Request, type Response } from "express";
import { storage } from "../storage";

export const healthRouter = Router();

// BEGIN DIAGONALE KEEP-ALIVE - Health endpoint
let healthCallCount = 0;

healthRouter.get("/health", async (req: Request, res: Response) => {
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
