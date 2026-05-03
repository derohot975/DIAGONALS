import path from 'path';
import { fileURLToPath } from 'url';
import express, { type Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import router from './routes/index';
import { setupVite, serveStatic, log } from './vite';
import { initializeDatabase } from './init-db';
import { ensurePagellaTable } from './db/pagella';
import { db } from './db';
import { sql } from 'drizzle-orm';
import logger from './utils/logger';

const KEEP_ALIVE_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 ore
const MAX_LOG_LINE_LENGTH = 160;

function summarizeResponseBody(body: unknown): string {
  if (body == null) return 'json=null';
  if (Array.isArray(body)) return `json=array(len=${body.length})`;
  if (typeof body === 'object') {
    const keys = Object.keys(body as Record<string, unknown>);
    return `json=object(keys=${keys.length})`;
  }
  return `json=${typeof body}`;
}

function startDatabaseKeepAlive() {
  setInterval(async () => {
    try {
      await db.execute(sql`SELECT 1`);
      log('Keep-alive: database ping OK');
    } catch (err) {
      log('Keep-alive: database ping fallito');
    }
  }, KEEP_ALIVE_INTERVAL_MS);
  log('Keep-alive: avviato (intervallo 24h)');
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.disable('x-powered-by');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  }
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const reqPath = req.path;
  let capturedJsonResponse: unknown;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on('finish', () => {
    const duration = Date.now() - start;
    if (reqPath.startsWith('/api')) {
      let logLine = `${req.method} ${reqPath} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse !== undefined) {
        logLine += ` :: ${summarizeResponseBody(capturedJsonResponse)}`;
      }
      if (logLine.length > MAX_LOG_LINE_LENGTH) {
        logLine = logLine.slice(0, MAX_LOG_LINE_LENGTH - 1) + '…';
      }
      log(logLine);
    }
  });

  next();
});

(async () => {
  await initializeDatabase();
  await ensurePagellaTable();

  if (app.get('env') === 'development') {
    const publicDir = path.resolve(__dirname, '..', 'public');
    app.use(
      express.static(publicDir, {
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
        },
      })
    );
  }

  app.use(router);

  const server = createServer(app);

  app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
    const isErrorObject = typeof err === 'object' && err !== null;
    const status =
      isErrorObject && 'status' in err && typeof (err as { status?: unknown }).status === 'number'
        ? (err as { status: number }).status
        : isErrorObject &&
            'statusCode' in err &&
            typeof (err as { statusCode?: unknown }).statusCode === 'number'
          ? (err as { statusCode: number }).statusCode
          : 500;
    const message =
      isErrorObject &&
      'message' in err &&
      typeof (err as { message?: unknown }).message === 'string'
        ? (err as { message: string }).message
        : 'Internal Server Error';

    if (res.headersSent) {
      logger.error('Error after headers sent', 'SERVER', undefined, { url: req.url, status });
      return;
    }

    const errorResponse: { ok: false; error: { code: number; message: string; stack?: string } } = {
      ok: false,
      error: { code: status, message },
    };
    if (
      process.env.NODE_ENV === 'development' &&
      isErrorObject &&
      'stack' in err &&
      typeof (err as { stack?: unknown }).stack === 'string'
    ) {
      errorResponse.error.stack = (err as { stack: string }).stack;
    }

    res.status(status).json(errorResponse);
    logger.error('Server error', 'SERVER', undefined, { url: req.url, method: req.method, status });
  });

  if (app.get('env') === 'development') {
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
