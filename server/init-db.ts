import { db } from "./db";
import { users } from "../shared/schema";

export async function initializeDatabase() {
  try {
    // Solo test connessione database
    const result = await db.select().from(users).limit(1);
    console.log("Database connection successful");
  } catch (error) {
    console.error("Error initializing database:", error);
    console.log("Database not configured, using in-memory storage");
  }
}