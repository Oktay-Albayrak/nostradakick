// Routeur des prédictions : GET (avec smart routing), POST (UPSERT), DELETE
import { Router } from "express";
import { getAllPredictions, getOnePrediction, upsertPrediction, deletePrediction, getUserPredictionForMatch } from "../controllers/predictions.controller.ts";

export const router: Router = Router();

// GET /predictions : si user_id+match_id → prédiction spécifique, sinon toutes les prédictions
router.get("/predictions", (req, res, next) => {
  if (req.query.user_id && req.query.match_id) {
    return getUserPredictionForMatch(req, res);
  }
  return getAllPredictions(req, res);
});

// GET /predictions/:id : récupère une prédiction par UUID
router.get("/predictions/:id", getOnePrediction);

// POST /predictions : crée ou met à jour une prédiction (UPSERT)
router.post("/predictions", upsertPrediction);

// DELETE /predictions/:id : supprime une prédiction
router.delete("/predictions/:id", deletePrediction);