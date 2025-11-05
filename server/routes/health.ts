import { Router, type Request, type Response } from "express";
import { storage } from "../storage";
import { db } from "../db";
import { sql } from "drizzle-orm";

export const healthRouter = Router();

// Rate limiting in-memory store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 100; // Max 100 requests per 15 min (generous for 15min intervals)

// Health check state tracking
let healthCallCount = 0;
let lastDbStatus = 'unknown';
const startTime = Date.now();

// Simple rate limiter
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const key = ip;
  
  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  const record = rateLimitStore.get(key)!;
  
  if (now > record.resetTime) {
    // Reset window
    record.count = 1;
    record.resetTime = now + RATE_LIMIT_WINDOW;
    return true;
  }
  
  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  record.count++;
  return true;
}

// Minimal database warm-up query with 2-step fallback
async function performDatabaseWarmup(): Promise<{ ok: boolean; latency_ms: number | null; error_hint?: string }> {
  const dbStart = Date.now();
  
  try {
    // Step 1: Try lightweight count query on users table (most stable)
    await db.execute(sql`SELECT COUNT(*) FROM users LIMIT 1`);
    const latency = Date.now() - dbStart;
    return { ok: true, latency_ms: latency };
  } catch (error1) {
    try {
      // Step 2: Fallback to wine_events table
      await db.execute(sql`SELECT COUNT(*) FROM wine_events LIMIT 1`);
      const latency = Date.now() - dbStart;
      return { ok: true, latency_ms: latency };
    } catch (error2) {
      // Both failed - database unreachable
      return { 
        ok: false, 
        latency_ms: null, 
        error_hint: "Database unreachable" 
      };
    }
  }
}

// GET /health endpoint
healthRouter.get("/health", async (req: Request, res: Response) => {
  const requestStart = Date.now();
  
  try {
    // Rate limiting
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
    if (!checkRateLimit(clientIp)) {
      return res.status(429).json({ 
        status: "error", 
        message: "Rate limit exceeded" 
      });
    }
    
    healthCallCount++;
    
    // Perform database warm-up with timeout
    let dbResult: { ok: boolean; latency_ms: number | null; error_hint?: string };
    
    try {
      // 1 second timeout for database query
      const dbPromise = performDatabaseWarmup();
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Database timeout')), 1000)
      );
      
      dbResult = await Promise.race([dbPromise, timeoutPromise]);
    } catch (error) {
      dbResult = { 
        ok: false, 
        latency_ms: null, 
        error_hint: "Database timeout" 
      };
    }
    
    // Determine overall status
    const status = dbResult.ok ? "ok" : "degraded";
    
    // Log state transitions only
    if (status !== lastDbStatus) {
      console.log(`🏥 Health status transition: ${lastDbStatus} → ${status} (call #${healthCallCount})`);
      lastDbStatus = status;
    }
    
    // Build response
    const response = {
      status,
      database: {
        ok: dbResult.ok,
        latency_ms: dbResult.latency_ms,
        ...(dbResult.error_hint && { error_hint: dbResult.error_hint })
      },
      timestamp_iso: new Date().toISOString(),
      app: {
        uptime_s: Math.floor((Date.now() - startTime) / 1000)
      },
      version: "1.0.0"
    };
    
    // Set headers
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Content-Type': 'application/json; charset=utf-8'
    });
    
    // Always return 200 for Uptime Robot (even if degraded)
    res.status(200).json(response);
    
  } catch (error) {
    const errorDuration = Date.now() - requestStart;
    console.error(`❌ /health: Unexpected error after ${errorDuration}ms`, error);
    
    res.status(200).json({
      status: "down",
      database: { ok: false, latency_ms: null },
      timestamp_iso: new Date().toISOString(),
      app: { uptime_s: Math.floor((Date.now() - startTime) / 1000) },
      version: "1.0.0"
    });
  }
});

// HEAD /health endpoint (optional)
healthRouter.head("/health", (req: Request, res: Response) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'Content-Type': 'application/json; charset=utf-8'
  });
  res.status(200).end();
});
