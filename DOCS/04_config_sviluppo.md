
# ⚙️ Configurazione Sviluppo

## 🔄 Hot Reload & Development Server

### Vite Configuration
```typescript
// vite.config.ts - Configurazione ottimizzata per sviluppo
export default defineConfig({
  plugins: [
    react(),
    cartographer(),
    runtimeErrorModal()
  ],
  root: './client',
  server: {
    host: '0.0.0.0',     // Accessibile da esterno
    port: 5000,          // Porta standard Replit
    strictPort: true,
    hmr: {
      overlay: true      // Overlay errori in tempo reale
    }
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: true,     // Debug facilitato
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-select']
        }
      }
    }
  }
});
```

### Express Development Setup
```typescript
// server/index.ts - Setup sviluppo con logging
if (app.get("env") === "development") {
  // Vite dev server integration
  await setupVite(app, server);
  
  // Request logging middleware
  app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
      const duration = Date.now() - start;
      if (req.path.startsWith("/api")) {
        log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
      }
    });
    next();
  });
}
```

## 📊 Error Reporting Strutturato

### Frontend Error Boundaries
```typescript
// Implementazione in App.tsx per catch errori React
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error Boundary:', error, errorInfo);
    
    // Invio a servizio monitoring (se configurato)
    if (window.MONITORING_ENABLED) {
      sendErrorReport(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50">
          <div className="glass-effect p-8 rounded-2xl text-center">
            <h2 className="text-2xl font-bold text-red-800 mb-4">
              Oops! Qualcosa è andato storto
            </h2>
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-6 py-2 rounded-full"
            >
              Ricarica Applicazione
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
```

### Backend Error Handling
```typescript
// server/index.ts - Error middleware centralizzato
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  
  // Log strutturato per debugging
  console.error('Server Error:', {
    status,
    message,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
  
  res.status(status).json({ 
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});
```

### Zod Validation Errors
```typescript
// Gestione errori validazione con dettagli specifici
try {
  const validData = schema.parse(requestData);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('Validation Error:', {
      errors: error.errors,
      path: req.path,
      data: requestData
    });
    
    res.status(400).json({
      message: "Dati non validi",
      errors: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        received: err.received
      }))
    });
    return;
  }
  throw error;
}
```

## 📝 Logging Configurabile

### Log Levels & Configuration
```typescript
// lib/logger.ts - Sistema logging configurabile
enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

class Logger {
  private level: LogLevel;
  
  constructor() {
    this.level = process.env.LOG_LEVEL 
      ? parseInt(process.env.LOG_LEVEL) 
      : LogLevel.INFO;
  }
  
  error(message: string, meta?: any) {
    if (this.level >= LogLevel.ERROR) {
      console.error(`[ERROR] ${message}`, meta);
    }
  }
  
  warn(message: string, meta?: any) {
    if (this.level >= LogLevel.WARN) {
      console.warn(`[WARN] ${message}`, meta);
    }
  }
  
  info(message: string, meta?: any) {
    if (this.level >= LogLevel.INFO) {
      console.info(`[INFO] ${message}`, meta);
    }
  }
  
  debug(message: string, meta?: any) {
    if (this.level >= LogLevel.DEBUG) {
      console.debug(`[DEBUG] ${message}`, meta);
    }
  }
}

export const logger = new Logger();
```

### Request/Response Logging
```typescript
// server/middleware/logging.ts
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substr(2, 9);
  
  logger.info('Request Start', {
    requestId,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info('Request Complete', {
      requestId,
      status: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('Content-Length')
    });
  });
  
  next();
}
```

## 🌍 Environment Variables

### Development (.env.development)
```bash
# Database
DATABASE_URL=postgresql://localhost:5432/diagonale_dev

# Server Configuration
NODE_ENV=development
PORT=5000
LOG_LEVEL=3

# Feature Flags
ENABLE_DEBUG_TOOLS=true
ENABLE_ERROR_OVERLAY=true
ENABLE_PERFORMANCE_MONITORING=true

# Development URLs
VITE_API_BASE_URL=http://localhost:5000
VITE_APP_VERSION=dev
```

### Production (.env.production)
```bash
# Database
DATABASE_URL=${REPLIT_DB_URL}

# Server Configuration  
NODE_ENV=production
PORT=5000
LOG_LEVEL=1

# Security
ENABLE_DEBUG_TOOLS=false
ENABLE_ERROR_OVERLAY=false

# Production URLs
VITE_API_BASE_URL=${REPL_SLUG}.${REPL_OWNER}.repl.co
VITE_APP_VERSION=${REPLIT_GIT_SHA}
```

### Environment Loading
```typescript
// lib/env.ts - Caricamento e validazione env vars
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default(5000),
  DATABASE_URL: z.string().optional(),
  LOG_LEVEL: z.string().transform(Number).default(2),
  ENABLE_DEBUG_TOOLS: z.string().transform(Boolean).default(false)
});

export const env = envSchema.parse(process.env);

// Validazione startup
if (env.NODE_ENV === 'production' && !env.DATABASE_URL) {
  throw new Error('DATABASE_URL è richiesto in produzione');
}
```

## 🔧 Development Tools Integration

### React Query DevTools
```typescript
// App.tsx - DevTools condizionali
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
```

### TypeScript Strict Mode
```json
// tsconfig.json - Configurazione rigorosa per qualità codice
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffects": true
  }
}
```

### ESLint Development Rules
```json
// .eslintrc.json - Regole sviluppo
{
  "extends": ["@typescript-eslint/recommended"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "react-hooks/exhaustive-deps": "error",
    "no-console": "off" // Permesso in sviluppo
  },
  "overrides": [
    {
      "files": ["*.tsx"],
      "rules": {
        "react/prop-types": "off" // TypeScript gestisce prop validation
      }
    }
  ]
}
```

## 🚀 Performance Monitoring

### Bundle Analysis
```typescript
// vite.config.ts - Plugin analisi bundle
import { defineConfig } from 'vite';
import { analyzer } from 'vite-bundle-analyzer';

export default defineConfig({
  plugins: [
    // Altri plugin...
    process.env.ANALYZE && analyzer()
  ]
});

// package.json script
// "analyze": "ANALYZE=true npm run build"
```

### Memory Leak Detection
```typescript
// lib/performance.ts
export function detectMemoryLeaks() {
  if (process.env.NODE_ENV === 'development') {
    setInterval(() => {
      const usage = process.memoryUsage();
      const heapMB = Math.round(usage.heapUsed / 1024 / 1024);
      
      if (heapMB > 200) {
        logger.warn('High memory usage detected', { heapMB });
      }
      
      logger.debug('Memory usage', {
        heap: `${heapMB}MB`,
        rss: `${Math.round(usage.rss / 1024 / 1024)}MB`
      });
    }, 30000);
  }
}
```

### API Response Time Monitoring
```typescript
// middleware/performance.ts
export function performanceMonitor(req: Request, res: Response, next: NextFunction) {
  const start = process.hrtime.bigint();
  
  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1000000; // Convert to ms
    
    if (duration > 1000) {
      logger.warn('Slow API response', {
        path: req.path,
        method: req.method,
        duration: `${duration.toFixed(2)}ms`
      });
    }
    
    // Track performance metrics
    if (process.env.ENABLE_PERFORMANCE_MONITORING) {
      trackApiPerformance(req.path, req.method, duration);
    }
  });
  
  next();
}
```
