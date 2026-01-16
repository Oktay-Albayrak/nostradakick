import { Router } from "express";
import { registerUser, loginUser, getAuthenticatedUser, logoutUser } from "../controllers/auth.controller.ts";

export const router: Router = Router();

router.post("/auth/register", registerUser);
router.post("/auth/login", loginUser);
router.get("/auth/me", getAuthenticatedUser);
router.get("/auth/logout", logoutUser);