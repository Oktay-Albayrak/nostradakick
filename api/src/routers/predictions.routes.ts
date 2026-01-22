import { Router } from "express";
import { getAllPredictions, getOnePrediction, upsertPrediction, deletePrediction, getUserPredictionForMatch } from "../controllers/predictions.controller.ts";

export const router: Router = Router();

router.get("/predictions", (req, res, next) => {
  // Si les query params user_id et match_id sont présents, récupérer le pronostic spécifique
  if (req.query.user_id && req.query.match_id) {
    return getUserPredictionForMatch(req, res);
  }
  // Sinon, récupérer tous les pronostics
  return getAllPredictions(req, res);
});
router.get("/predictions/:id", getOnePrediction);
router.post("/predictions", upsertPrediction);
router.delete("/predictions/:id", deletePrediction);