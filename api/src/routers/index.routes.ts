import { Router } from "express";

import { router as usersRouter } from "./users.routes";


export const router = Router();



// Branchement des routeurs
router.use(usersRouter);
import { healthCheck } from "../controllers/main.controller.ts";
import { router as matchesRouter } from "./match.routes.ts";

export const router: Router = Router();

router.get("/health", healthCheck);
