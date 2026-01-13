import { Router } from "express";
// import { router as matchesRouter } from "./match.routes.ts";
import { router as usersRouter } from "./users.routes.ts";
import { healthCheck } from "../controllers/main.controller.ts";

export const router: Router = Router();

router.get("/health", healthCheck);

// Branchement des routeurs
router.use(usersRouter);





