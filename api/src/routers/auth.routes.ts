import { Router } from "express";
import { registerUser, loginUser, getAuthenticatedUser, logoutUser, refreshAccessToken } from "../controllers/auth.controller.ts";

export const router: Router = Router();

router.post("/auth/register", registerUser);
router.post("/auth/login", loginUser);
router.get("/auth/me", getAuthenticatedUser);
router.post("/auth/refresh", refreshAccessToken);
router.post("/auth/logout", logoutUser);