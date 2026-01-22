import { Router } from "express";
import { deleteOneUser, getAllUsers, getOneUser, updateOneUser,  } from "../controllers/users.controller.ts";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.ts";

export const router: Router = Router();

// Route publique : profil d'un utilisateur
router.get("/users/:username",  getOneUser);

// Route admin : liste tous les utilisateurs
router.get("/users", requireAdmin, getAllUsers);

// Route authentifiée : modifier un utilisateur (vérification de propriété dans le controller)
router.patch("/users/:id", requireAuth, updateOneUser);

// Route admin : supprimer un utilisateur
router.delete("/users/:id", requireAdmin, deleteOneUser);