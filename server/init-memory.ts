import { storage } from "./storage";
import { log } from "./vite";

export async function initializeMemoryStorage() {
  try {
    // Verifica se l'utente Admin esiste già
    const adminUser = await storage.getUserByName("Admin");
    
    if (!adminUser) {
      // Crea l'utente Admin
      await storage.createUser({
        name: "Admin",
        isAdmin: true,
        sessionId: null,
        lastActivity: null
      });
      log("Admin user created");
    } else {
      log("Admin user already exists");
    }

    // Crea un evento di esempio se non esiste
    const existingEvents = await storage.getAllWineEvents();
    if (existingEvents.length === 0) {
      await storage.createWineEvent({
        name: "DIAGONALE DI MEZZA ESTATE",
        date: "2025-08-15",
        mode: "CIECA",
        status: "active",
        votingStatus: "pending"
      });
      log("Sample event created");
    }

    log("Memory storage initialized successfully");
  } catch (error) {
    log(`Error initializing memory storage: ${error}`);
  }
}