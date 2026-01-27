import { Router } from "express";
import {
  createOneMatch,
  deleteOneMatch,
  getAllMatches,
  getOneMatchById,
  updateOneMatch,
} from "../controllers/matches.controller.ts";
import { 
  requireAdmin, 
} from "../middleware/auth.middleware.ts";

export const router: Router = Router();

router.get("/matches", getAllMatches);
router.get("/matches/:id", getOneMatchById);
router.post("/matches", requireAdmin, createOneMatch);
router.patch("/matches/:id", requireAdmin, updateOneMatch);
router.delete("/matches/:id", requireAdmin, deleteOneMatch);
