/**
 * ROUTEUR DES PRÉDICTIONS
 * 
 * Définit tous les endpoints pour gérer les prédictions.
 * 
 * Routes :
 * - GET /predictions : récupère toutes les prédictions
 *   OU si query params user_id + match_id : récupère la prédiction spécifique
 * - GET /predictions/:id : récupère une prédiction par ID
 * - POST /predictions : crée ou met à jour une prédiction (UPSERT)
 * - DELETE /predictions/:id : supprime une prédiction
 * 
 * Logique intelligente sur GET /predictions :
 * - Si user_id ET match_id dans la query : appelle getUserPredictionForMatch()
 * - Sinon : appelle getAllPredictions()
 */

import { Router } from "express";
import { getAllPredictions, getOnePrediction, upsertPrediction, deletePrediction, getUserPredictionForMatch } from "../controllers/predictions.controller.ts";

export const router: Router = Router();

/**
 * ROUTE GET /predictions
 * 
 * Logique intelligente :
 * - Si req.query.user_id ET req.query.match_id présents
 *   → Appelle getUserPredictionForMatch() pour récupérer la prédiction spécifique
 * - Sinon
 *   → Appelle getAllPredictions() pour récupérer toutes les prédictions
 * 
 * Exemple d'utilisation :
 * - GET /predictions → toutes les prédictions
 * - GET /predictions?user_id=uuid1&match_id=uuid2 → prédiction spécifique
 */
router.get("/predictions", (req, res, next) => {
  // Vérification de la présence des paramètres pour la requête spécifique
  if (req.query.user_id && req.query.match_id) {
    return getUserPredictionForMatch(req, res);
  }
  // Sinon retourne toutes les prédictions
  return getAllPredictions(req, res);
});

/**
 * ROUTE GET /predictions/:id
 * 
 * Récupère une prédiction par son UUID unique.
 * 
 * Params :
 * - id : UUID de la prédiction
 * 
 * Exemple : GET /predictions/550e8400-e29b-41d4-a716-446655440000
 */
router.get("/predictions/:id", getOnePrediction);

/**
 * ROUTE POST /predictions
 * 
 * Crée une nouvelle prédiction OU met à jour une existante (UPSERT).
 * 
 * Body :
 * {
 *   "user_id": "uuid",
 *   "match_id": "uuid",
 *   "prediction_value": "HOME" | "DRAW" | "AWAY"
 * }
 * 
 * Exemple :
 * POST /predictions
 * {
 *   "user_id": "550e8400-e29b-41d4-a716-446655440000",
 *   "match_id": "660e8400-e29b-41d4-a716-446655440001",
 *   "prediction_value": "HOME"
 * }
 */
router.post("/predictions", upsertPrediction);

/**
 * ROUTE DELETE /predictions/:id
 * 
 * Supprime une prédiction par son UUID.
 * 
 * Params :
 * - id : UUID de la prédiction à supprimer
 * 
 * Exemple : DELETE /predictions/550e8400-e29b-41d4-a716-446655440000
 */
router.delete("/predictions/:id", deletePrediction);