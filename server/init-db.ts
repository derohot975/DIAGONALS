import { db } from "./db";
import { storage } from "./storage";

export async function initializeDatabase() {
  try {
    // Verifica se esiste già un utente Admin
    const adminUser = await storage.getUserByName("Admin");
    
    if (!adminUser) {
      // Crea l'utente Admin di default
      await storage.createUser({
        name: "Admin",
        isAdmin: true,
      });
      console.log("Database initialized with default Admin user");
    } else {
      console.log("Database already initialized");
    }
  } catch (error) {
    console.error("Error initializing database:", error);
    // Se c'è un errore, probabilmente il database non è configurato
    console.log("Database not configured, using in-memory storage");
  }
}