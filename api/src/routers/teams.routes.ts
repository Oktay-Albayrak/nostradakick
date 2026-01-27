import { Router } from "express";
import { getAllTeams, createTeam } from "../controllers/teams.controller.ts";
import { requireAdmin } from "../middleware/auth.middleware.ts";

export const router: Router = Router();

router.get("/teams", getAllTeams);
router.post("/teams", requireAdmin, createTeam);
