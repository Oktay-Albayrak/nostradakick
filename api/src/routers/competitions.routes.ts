import { Router } from "express";
import { getAllCompetitions, createCompetition } from "../controllers/competitions.controller.ts";
import { requireAdmin } from "../middleware/auth.middleware.ts";

export const router: Router = Router();
router.get("/competitions", getAllCompetitions);
router.post("/competitions", requireAdmin, createCompetition);
