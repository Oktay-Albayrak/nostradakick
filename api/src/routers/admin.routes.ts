import { Router } from "express";
import { getAdminStats } from "../controllers/admin.controller.ts";

export const router: Router = Router();

router.get("/admin/stats", getAdminStats);
