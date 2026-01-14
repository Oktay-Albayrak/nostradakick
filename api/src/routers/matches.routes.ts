import { Router } from "express";
import {
  getAllMatches,
  getOneMatch,
} from "../controllers/matches.controller.ts";

export const router: Router = Router();

router.get("/matches", getAllMatches);
router.get("/matches/:api_id", getOneMatch);
