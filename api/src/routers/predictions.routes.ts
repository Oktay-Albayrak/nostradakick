import { Router } from "express";
import { getAllPredictions, getOnePrediction, upsertPrediction, deletePrediction } from "../controllers/predictions.controller.ts";

export const router: Router = Router();

router.get("/predictions", getAllPredictions);
router.get("/predictions/:id", getOnePrediction);
router.post("/predictions", upsertPrediction);
router.delete("/predictions/:id", deletePrediction);