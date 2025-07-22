import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  sessionId: text("session_id"),
  lastActivity: timestamp("last_activity"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const wineEvents = pgTable("wine_events", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  date: text("date").notNull(),
  mode: text("mode").notNull(), // Modalità unica
  status: text("status").default('active').notNull(), // 'active', 'voting', 'completed'
  votingStatus: text("voting_status").default('registration').notNull(), // 'registration', 'voting', 'completed'
  currentVotingWineId: integer("current_voting_wine_id"),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const wines = pgTable("wines", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => wineEvents.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // 'Bianco', 'Rosso', 'Bollicina'
  name: text("name").notNull(),
  producer: text("producer").notNull(),
  grape: text("grape").notNull(), // Vitigno
  year: integer("year").notNull(),
  origin: text("origin").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  isRevealed: boolean("is_revealed").default(false).notNull(),
  votingStatus: text("voting_status").default('pending').notNull(), // 'pending', 'voting', 'closed'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => wineEvents.id).notNull(),
  wineId: integer("wine_id").references(() => wines.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  score: decimal("score", { precision: 3, scale: 1 }).notNull(), // Supporta voti con .5 (es: 7.5)
  createdAt: timestamp("created_at").defaultNow().notNull(),
});



// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertWineEventSchema = createInsertSchema(wineEvents).omit({
  id: true,
  createdAt: true,
});

export const insertWineSchema = createInsertSchema(wines).omit({
  id: true,
  createdAt: true,
});

export const insertVoteSchema = createInsertSchema(votes).omit({
  id: true,
  createdAt: true,
});



// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type WineEvent = typeof wineEvents.$inferSelect;
export type InsertWineEvent = z.infer<typeof insertWineEventSchema>;
export type Wine = typeof wines.$inferSelect;
export type InsertWine = z.infer<typeof insertWineSchema>;
export type Vote = typeof votes.$inferSelect;
export type InsertVote = z.infer<typeof insertVoteSchema>;

// Extended type for results
export interface WineResult extends Wine {
  averageScore: number;
  totalVotes: number;
  lodeCount: number;
  contributor: string;
}
