import { Router, type Request, type Response } from "express";
import { storage } from "../storage";

export const authRouter = Router();

// Authentication routes
authRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const { pin } = req.body;
    
    if (!pin) {
      res.status(400).json({ message: "PIN richiesto" });
      return;
    }

    // Cerca utente solo per PIN
    const user = await storage.authenticateUserByPin(pin);
    
    if (!user) {
      res.status(401).json({ message: "PIN non valido" });
      return;
    }

    res.json({ user, message: "Login effettuato con successo" });
  } catch (error) {
    res.status(500).json({ message: "Errore durante il login" });
  }
});

authRouter.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, pin } = req.body;
    
    if (!name || !pin) {
      res.status(400).json({ message: "Nome e PIN sono richiesti" });
      return;
    }

    if (name.length > 10) {
      res.status(400).json({ message: "Il nome non può superare i 10 caratteri" });
      return;
    }

    if (!/^\d{4}$/.test(pin)) {
      res.status(400).json({ message: "Il PIN deve essere di 4 cifre" });
      return;
    }

    // Check if user already exists by name
    const existingUser = await storage.getUserByName(name);
    if (existingUser) {
      res.status(409).json({ message: "Nome utente già esistente" });
      return;
    }

    // Check if PIN already exists
    const existingPinUser = await storage.authenticateUserByPin(pin);
    if (existingPinUser) {
      res.status(409).json({ message: "PIN già esistente!" });
      return;
    }

    const userData = { name, pin, isAdmin: false };
    const user = await storage.createUser(userData);
    
    res.status(201).json({ user, message: "Registrazione completata con successo" });
  } catch (error) {
    res.status(500).json({ message: "Errore durante la registrazione" });
  }
});
