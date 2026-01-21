import { Router } from "express";
import { getAdminStats } from "../controllers/admin.controller.ts";
import { requireAdmin } from "../middleware/auth.middleware.ts";

export const router: Router = Router();

// Toutes les routes admin nécessitent le rôle ADMIN
router.get("/admin/stats", requireAdmin, getAdminStats);
