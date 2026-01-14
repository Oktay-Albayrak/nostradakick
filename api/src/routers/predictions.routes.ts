import { Router } from "express";
import { getAllPredictions, getOnePrediction, createPrediction } from "../controllers/predictions.controller.ts";

export const router: Router = Router();

router.get("/predictions", getAllPredictions);
router.get("/predictions/:id", getOnePrediction);
router.post("/predictions", createPrediction);