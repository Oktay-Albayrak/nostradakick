import { Router } from "express";
import { deleteOneUser, getAllUsers, getOneUser, updateOneUser,  } from "../controllers/users.controller.ts";

export const router: Router = Router();


router.get("/users", getAllUsers);
router.get("/users/:username",  getOneUser);
router.patch("/users/:id", updateOneUser);
router.delete("/users/:id", deleteOneUser)