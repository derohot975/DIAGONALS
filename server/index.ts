import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import router from "./routes/index";
import { setupVite, serveStatic, log } from "./vite";
import { initializeDatabase } from "./init-db";
import { ensurePagellaTable } from "./db/pagella";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
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
  // Inizializza il database Supabase
  await initializeDatabase();
  
  // Garantisce la tabella per la Pagella senza richiedere migrazioni manuali
  await ensurePagellaTable();

  // Serve PWA static files with correct MIME types in development
  if (app.get("env") === "development") {
    const path = await import("path");
    const publicDir = path.resolve(import.meta.dirname, "..", "public");
    app.use(express.static(publicDir, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.png')) {
          res.setHeader('Content-Type', 'image/png');
          // Force revalidation for PWA icons
          if (filePath.includes('pwa-icon') || filePath.includes('apple-touch-icon')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
          }
        } else if (filePath.endsWith('.json')) {
          res.setHeader('Content-Type', 'application/json');
          // Force revalidation for manifest.json
          if (filePath.includes('manifest.json')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
          }
        }
      }
    }));
  }
  
  // Mount all routes
  app.use(router);
  
  const server = createServer(app);

  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Check if headers have already been sent to avoid double response
    if (res.headersSent) {
      console.error('Error occurred after headers sent:', {
        url: req.url,
        method: req.method,
        status,
        message: process.env.NODE_ENV === 'development' ? err.stack : message
      });
      return;
    }

    // Send standardized error response
    const errorResponse: any = {
      ok: false,
      error: {
        code: status,
        message: message
      }
    };

    // In development, include stack trace for debugging
    if (process.env.NODE_ENV === 'development') {
      errorResponse.error.stack = err.stack;
    }

    res.status(status).json(errorResponse);

    // Log error safely without crashing the process
    console.error('Server error:', {
      url: req.url,
      method: req.method,
      status,
      message: process.env.NODE_ENV === 'development' ? err.stack : message
    });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Fallback to 3000 for consistent development/production behavior.
  // this serves both the API and the client.
  const port = parseInt(process.env.PORT || '3000', 10);
  server.listen(port, '0.0.0.0', () => {
    log(`Server running on port ${port}`);
    log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
})();
