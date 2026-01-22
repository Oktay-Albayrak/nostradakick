import { Router } from "express";
import { deleteOneUser, getAllUsers, getOneUser, updateOneUser,  } from "../controllers/users.controller.ts";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.ts";

export const router: Router = Router();

router.get("/users/:username",  getOneUser);

router.get("/users", requireAdmin, getAllUsers);

router.patch("/users/:id", requireAuth, updateOneUser);

router.delete("/users/:id", requireAdmin, deleteOneUser);