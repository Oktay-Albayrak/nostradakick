import { Router } from "express";
import { getAllUsers } from "../controllers/users.controller.ts";

export const router = Router();


router.get("/users", getAllUsers)
router.get("/user/:id", )