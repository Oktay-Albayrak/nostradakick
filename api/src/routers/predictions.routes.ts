import { Router } from "express";
import { getAllPredictions, getOnePrediction, upsertPrediction, deletePrediction } from "../controllers/predictions.controller.ts";
import { requireAuth } from "../middleware/auth.middleware.ts";

export const router: Router = Router();

// Routes publiques : tout le monde peut voir les pronostics
router.get("/predictions", getAllPredictions);
router.get("/predictions/:id", getOnePrediction);

// Routes authentifiées : seuls MEMBER et ADMIN peuvent créer/modifier/supprimer
router.post("/predictions", requireAuth, upsertPrediction);
router.delete("/predictions/:id", requireAuth, deletePrediction);