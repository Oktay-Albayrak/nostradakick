import { Router } from "express";
import { getAllPredictions, getOnePrediction, upsertPrediction, deletePrediction } from "../controllers/predictions.controller.ts";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.ts";

export const router: Router = Router();

router.get("/predictions", requireAdmin, getAllPredictions);

router.get("/predictions/:id", requireAuth, getOnePrediction);

router.post("/predictions", requireAuth, upsertPrediction);

router.delete("/predictions/:id", requireAuth, deletePrediction);