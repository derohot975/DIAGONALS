import path from "path";
import { fileURLToPath } from "url";
import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import router from "./routes/index";
import { setupVite, serveStatic, log } from "./vite";
import { initializeDatabase } from "./init-db";
import { ensurePagellaTable } from "./db/pagella";
import { db } from "./db";
import { sql } from "drizzle-orm";

const KEEP_ALIVE_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 ore

function startDatabaseKeepAlive() {
  setInterval(async () => {
    try {
      await db.execute(sql`SELECT 1`);
      log("Keep-alive: database ping OK");
    } catch (err) {
      log("Keep-alive: database ping fallito");
    }
  }, KEEP_ALIVE_INTERVAL_MS);
  log("Keep-alive: avviato (intervallo 24h)");
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const reqPath = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (reqPath.startsWith("/api")) {
      let logLine = `${req.method} ${reqPath} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });

  next();
});

(async () => {
  await initializeDatabase();
  await ensurePagellaTable();

  if (app.get("env") === "development") {
    const publicDir = path.resolve(__dirname, "..", "public");
    app.use(express.static(publicDir, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.png')) {
          res.setHeader('Content-Type', 'image/png');
          if (filePath.includes('pwa-icon') || filePath.includes('apple-touch-icon')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          }
        } else if (filePath.endsWith('.json') && filePath.includes('manifest.json')) {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        }
      }
    }));
  }

  app.use(router);

  const server = createServer(app);

  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    if (res.headersSent) {
      console.error('Error after headers sent:', { url: req.url, status });
      return;
    }

    const errorResponse: any = { ok: false, error: { code: status, message } };
    if (process.env.NODE_ENV === 'development') {
      errorResponse.error.stack = err.stack;
    }

    res.status(status).json(errorResponse);
    console.error('Server error:', { url: req.url, method: req.method, status });
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || '3000', 10);
  server.listen(port, '0.0.0.0', () => {
    log(`Server running on port ${port}`);
    log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    startDatabaseKeepAlive();
  });
})();
