import { Router } from "express";
import { getAllTeams } from "../controllers/teams.controller.ts";

export const router: Router = Router();

router.get("/teams", getAllTeams);
