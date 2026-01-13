import { Router } from "express";

import { router as usersRouter } from "./users.routes";


export const router = Router();



// Branchement des routeurs
router.use(usersRouter);