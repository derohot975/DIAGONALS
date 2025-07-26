var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  insertUserSchema: () => insertUserSchema,
  insertVoteSchema: () => insertVoteSchema,
  insertWineEventSchema: () => insertWineEventSchema,
  insertWineSchema: () => insertWineSchema,
  users: () => users,
  votes: () => votes,
  wineEvents: () => wineEvents,
  wines: () => wines
});
import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  sessionId: text("session_id"),
  lastActivity: timestamp("last_activity"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var wineEvents = pgTable("wine_events", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  date: text("date").notNull(),
  mode: text("mode").notNull(),
  // Modalità unica
  status: text("status").default("active").notNull(),
  // 'active', 'voting', 'completed'
  votingStatus: text("voting_status").default("registration").notNull(),
  // 'registration', 'voting', 'completed'
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var wines = pgTable("wines", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => wineEvents.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(),
  // 'Bianco', 'Rosso', 'Bollicina'
  name: text("name").notNull(),
  producer: text("producer").notNull(),
  grape: text("grape").notNull(),
  // Vitigno
  year: integer("year").notNull(),
  origin: text("origin").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  isRevealed: boolean("is_revealed").default(false).notNull(),
  votingStatus: text("voting_status").default("pending").notNull(),
  // 'pending', 'voting', 'closed'
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => wineEvents.id).notNull(),
  wineId: integer("wine_id").references(() => wines.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  score: decimal("score", { precision: 3, scale: 1 }).notNull(),
  // Supporta voti con .5 (es: 7.5)
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});
var insertWineEventSchema = createInsertSchema(wineEvents).omit({
  id: true,
  createdAt: true
});
var insertWineSchema = createInsertSchema(wines).omit({
  id: true,
  createdAt: true
});
var insertVoteSchema = createInsertSchema(votes).omit({
  id: true,
  createdAt: true
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
var databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL must be set. Please add your Supabase PostgreSQL connection string to Replit Secrets."
  );
}
console.log("\u{1F517} Connecting to Supabase PostgreSQL database...");
var pool = new Pool({ connectionString: databaseUrl });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq, and } from "drizzle-orm";
var DatabaseStorage = class {
  // User operations
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async getUserByName(name) {
    const [user] = await db.select().from(users).where(eq(users.name, name));
    return user || void 0;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  async updateUserSession(userId, sessionId) {
    const [user] = await db.update(users).set({ sessionId, lastActivity: /* @__PURE__ */ new Date() }).where(eq(users.id, userId)).returning();
    return user;
  }
  async checkUserSession(userId) {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    return user;
  }
  async clearUserSession(userId) {
    await db.update(users).set({ sessionId: null, lastActivity: null }).where(eq(users.id, userId));
  }
  async getAllUsers() {
    return await db.select().from(users);
  }
  async updateUser(id, updates) {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user || void 0;
  }
  async deleteUser(id) {
    const result = await db.delete(users).where(eq(users.id, id));
    return (result.rowCount ?? 0) > 0;
  }
  // Wine Event operations
  async getWineEvent(id) {
    const [event] = await db.select().from(wineEvents).where(eq(wineEvents.id, id));
    return event || void 0;
  }
  async createWineEvent(insertEvent) {
    const [event] = await db.insert(wineEvents).values(insertEvent).returning();
    return event;
  }
  async getAllWineEvents() {
    return await db.select().from(wineEvents);
  }
  async updateWineEventStatus(id, status) {
    const [event] = await db.update(wineEvents).set({ status }).where(eq(wineEvents.id, id)).returning();
    return event || void 0;
  }
  async updateEventVotingStatus(id, votingStatus) {
    const [event] = await db.update(wineEvents).set({ votingStatus }).where(eq(wineEvents.id, id)).returning();
    return event || void 0;
  }
  // Wine operations
  async getWine(id) {
    const [wine] = await db.select().from(wines).where(eq(wines.id, id));
    return wine || void 0;
  }
  async getWineById(id) {
    const [wine] = await db.select().from(wines).where(eq(wines.id, id));
    return wine || void 0;
  }
  async createWine(insertWine) {
    const [wine] = await db.insert(wines).values(insertWine).returning();
    return wine;
  }
  async getWinesByEventId(eventId) {
    return await db.select().from(wines).where(eq(wines.eventId, eventId));
  }
  async updateWineRevealed(id, isRevealed) {
    const [wine] = await db.update(wines).set({ isRevealed }).where(eq(wines.id, id)).returning();
    return wine || void 0;
  }
  async updateWineRevealStatus(id, isRevealed) {
    const [wine] = await db.update(wines).set({ isRevealed }).where(eq(wines.id, id)).returning();
    return wine || void 0;
  }
  async updateWineVotingStatus(id, votingStatus) {
    const [wine] = await db.update(wines).set({ votingStatus }).where(eq(wines.id, id)).returning();
    return wine || void 0;
  }
  // Vote operations
  async getVote(id) {
    const [vote] = await db.select().from(votes).where(eq(votes.id, id));
    return vote || void 0;
  }
  async createVote(insertVote) {
    const [vote] = await db.insert(votes).values(insertVote).returning();
    return vote;
  }
  async updateVote(id, score, hasLode) {
    const [vote] = await db.update(votes).set({ score }).where(eq(votes.id, id)).returning();
    return vote || void 0;
  }
  async getVotesByEventId(eventId) {
    return await db.select().from(votes).where(eq(votes.eventId, eventId));
  }
  async getVotesByWineId(wineId) {
    return await db.select().from(votes).where(eq(votes.wineId, wineId));
  }
  async getUserVoteForWine(userId, wineId) {
    const [vote] = await db.select().from(votes).where(and(eq(votes.userId, userId), eq(votes.wineId, wineId)));
    return vote || void 0;
  }
  // Advanced functions for voting management
  async getUsersByEventId(eventId) {
    const eventWines = await db.select().from(wines).where(eq(wines.eventId, eventId));
    const userIds = [...new Set(eventWines.map((wine) => wine.userId))];
    if (userIds.length === 0) return [];
    const allUsers = await db.select().from(users);
    return allUsers.filter((user) => userIds.includes(user.id));
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
import { z } from "zod";
import { nanoid } from "nanoid";
async function registerRoutes(app2) {
  app2.get("/api/users", async (req, res) => {
    try {
      const users2 = await storage.getAllUsers();
      res.json(users2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  app2.post("/api/users", async (req, res) => {
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
  app2.get("/api/users/:id", async (req, res) => {
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
  app2.post("/api/users/:id/login", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.checkUserSession(userId);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      if (user.sessionId) {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1e3);
        if (user.lastActivity && user.lastActivity > fiveMinutesAgo) {
          res.status(409).json({
            message: "Utente gi\xE0 connesso da un altro dispositivo. Disconnetti prima di continuare.",
            activeSession: true
          });
          return;
        }
      }
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
  app2.post("/api/users/:id/logout", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      await storage.clearUserSession(userId);
      res.json({ message: "Logout effettuato con successo" });
    } catch (error) {
      res.status(500).json({ message: "Failed to logout user" });
    }
  });
  app2.post("/api/users/:id/heartbeat", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { sessionId } = req.body;
      const user = await storage.checkUserSession(userId);
      if (!user || user.sessionId !== sessionId) {
        res.status(401).json({ message: "Sessione non valida" });
        return;
      }
      await storage.updateUserSession(userId, sessionId);
      res.json({ message: "Heartbeat updated" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update heartbeat" });
    }
  });
  app2.put("/api/users/:id", async (req, res) => {
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
  app2.delete("/api/users/:id", async (req, res) => {
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
  app2.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getAllWineEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });
  app2.post("/api/events", async (req, res) => {
    try {
      const eventData = insertWineEventSchema.parse(req.body);
      const event = await storage.createWineEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid event data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create event" });
      }
    }
  });
  app2.get("/api/events/:id", async (req, res) => {
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
  app2.patch("/api/events/:id/status", async (req, res) => {
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
  app2.get("/api/events/:eventId/wines", async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const wines2 = await storage.getWinesByEventId(eventId);
      res.json(wines2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch wines" });
    }
  });
  app2.post("/api/wines", async (req, res) => {
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
  app2.patch("/api/wines/:id/reveal", async (req, res) => {
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
  app2.get("/api/events/:eventId/votes", async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const votes2 = await storage.getVotesByEventId(eventId);
      res.json(votes2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch votes" });
    }
  });
  app2.post("/api/votes", async (req, res) => {
    try {
      const voteData = insertVoteSchema.parse(req.body);
      const existingVote = await storage.getUserVoteForWine(voteData.userId, voteData.wineId);
      if (existingVote) {
        const updatedVote = await storage.updateVote(existingVote.id, parseFloat(voteData.score.toString()), false);
        res.json(updatedVote);
      } else {
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
  app2.get("/api/wines/:wineId/votes", async (req, res) => {
    try {
      const wineId = parseInt(req.params.wineId);
      const votes2 = await storage.getVotesByWineId(wineId);
      res.json(votes2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch votes" });
    }
  });
  app2.put("/api/events/:eventId/start-voting", async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const event = await storage.updateEventVotingStatus(eventId, "voting");
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to start voting" });
    }
  });
  app2.put("/api/wines/:wineId/start-voting", async (req, res) => {
    try {
      const wineId = parseInt(req.params.wineId);
      const wine = await storage.updateWineVotingStatus(wineId, "voting");
      res.json(wine);
    } catch (error) {
      res.status(500).json({ message: "Failed to start wine voting" });
    }
  });
  app2.put("/api/wines/:wineId/close-voting", async (req, res) => {
    try {
      const wineId = parseInt(req.params.wineId);
      const wine = await storage.updateWineVotingStatus(wineId, "closed");
      res.json(wine);
    } catch (error) {
      res.status(500).json({ message: "Failed to close wine voting" });
    }
  });
  app2.put("/api/wines/:wineId/reveal", async (req, res) => {
    try {
      const wineId = parseInt(req.params.wineId);
      const wine = await storage.updateWineRevealStatus(wineId, true);
      res.json(wine);
    } catch (error) {
      res.status(500).json({ message: "Failed to reveal wine info" });
    }
  });
  app2.get("/api/wines/:wineId/voting-complete", async (req, res) => {
    try {
      const wineId = parseInt(req.params.wineId);
      const wine = await storage.getWineById(wineId);
      if (!wine) {
        res.status(404).json({ message: "Wine not found" });
        return;
      }
      const eventUsers = await storage.getUsersByEventId(wine.eventId);
      const wineVotes = await storage.getVotesByWineId(wineId);
      const eligibleVoters = eventUsers.filter((user) => user.id !== wine.userId);
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
  app2.get("/api/events/:eventId/results", async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const wines2 = await storage.getWinesByEventId(eventId);
      const votes2 = await storage.getVotesByEventId(eventId);
      const users2 = await storage.getAllUsers();
      const results = wines2.map((wine) => {
        const wineVotes = votes2.filter((vote) => vote.wineId === wine.id);
        const totalScore = wineVotes.reduce((sum, vote) => sum + parseFloat(vote.score.toString()), 0);
        const contributor = users2.find((u) => u.id === wine.userId);
        return {
          ...wine,
          totalScore: Math.round(totalScore * 10) / 10,
          // Somma totale invece di media
          totalVotes: wineVotes.length,
          contributor: contributor?.name || "Unknown"
        };
      }).sort((a, b) => b.totalScore - a.totalScore);
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch results" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid as nanoid2 } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid2()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/init-db.ts
async function initializeDatabase() {
  try {
    const adminUser = await storage.getUserByName("Admin");
    if (!adminUser) {
      await storage.createUser({
        name: "Admin",
        isAdmin: true
      });
      console.log("Database initialized with default Admin user");
    } else {
      console.log("Database already initialized");
    }
  } catch (error) {
    console.error("Error initializing database:", error);
    console.log("Database not configured, using in-memory storage");
  }
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  await initializeDatabase();
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "10000", 10);
  server.listen(port, "0.0.0.0", () => {
    log(`Server running on port ${port}`);
    log(`Environment: ${process.env.NODE_ENV || "development"}`);
  });
})();
