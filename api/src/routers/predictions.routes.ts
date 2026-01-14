import { Router } from "express";
import { getAllPredictions } from "../controllers/predictions.controller.ts";

export const router: Router = Router();

router.get("/predictions", getAllPredictions);