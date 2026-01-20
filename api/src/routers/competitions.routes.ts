import { Router } from "express";
import { getAllCompetitions } from "../controllers/competitions.controller.ts";

export const router: Router = Router();
router.get("/competitions", getAllCompetitions);
