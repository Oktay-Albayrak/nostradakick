import { Router } from "express";
import { registerUser } from "../controllers/auth.controller.ts";

export const router: Router = Router();

router.post("/auth/register", registerUser);