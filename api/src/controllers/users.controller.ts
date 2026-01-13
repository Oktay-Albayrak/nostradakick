import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.ts";

//appel de la base de donné tout les utilisateurs pour les afficher dans cette fonction
export async function getAllUsers(req: Request, res: Response) {
    const users = await prisma.user.findMany({ omit: { password_hash: true } });

    res.json(users);
}

