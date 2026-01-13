import { Router } from "express";
import { getAllUsers, getOneUser,  } from "../controllers/users.controller.ts";

export const router: Router = Router();


router.get("/users", getAllUsers);
router.get("/users/:username",  getOneUser);