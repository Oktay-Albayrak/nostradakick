import { Router } from "express";
import { healthCheck } from "../controllers/main.controller.ts";
import { router as matchesRouter } from "./match.routes.ts";

export const router: Router = Router();

router.get("/health", healthCheck);
