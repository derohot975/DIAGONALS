import { Router } from "express";
import { healthRouter } from "./health";
import { authRouter } from "./auth";
import { usersRouter } from "./users";
import { eventsRouter } from "./events";
import { winesRouter } from "./wines";
import { votesRouter } from "./votes";
import { reportsRouter } from "./reports";

const router = Router();

// Mount domain routers with exact same paths as before
router.use("/api", healthRouter);
router.use("/api/auth", authRouter);
router.use("/api/users", usersRouter);
router.use("/api/events", eventsRouter);
router.use("/api/wines", winesRouter);
router.use("/api/votes", votesRouter);

// Mount reports router for event-specific endpoints (pagella, complete, report)
router.use("/api/events", reportsRouter);

export default router;
