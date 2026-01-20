import { Router } from "express";
import { router as authRouter } from "./auth.routes.ts";
import { router as competitionsRouter } from "./competitions.routes.ts";
import { router as matchesRouter } from "./matches.routes.ts";
import { router as usersRouter } from "./users.routes.ts";
import { router as predictionsRouter } from "./predictions.routes.ts";
import { healthCheck } from "../controllers/main.controller.ts";

export const router: Router = Router();

router.get("/health", healthCheck);

// Branchement des routeurs
router.use(authRouter);
router.use(usersRouter);
router.use(matchesRouter);
router.use(predictionsRouter);
router.use(competitionsRouter);
