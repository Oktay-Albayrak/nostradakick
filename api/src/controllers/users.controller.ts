import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.ts";
import { z } from "zod";



// Fonction permettant de récupérer tout les utilisateurs
export async function getAllUsers(req: Request, res: Response) {

    // Récupère tout les utilisateurs en base de donnée
    // "omit" permet d'exclure les champs sensibles (password_hash ici)
    const users = await prisma.user.findMany({ 
        omit: { password_hash: true } 
    });

    // Retourne la liste des utilisateurs sans filtrage en format JSON
    res.json(users);
}




// Fonction permettant de récupérer un utilisateur via son 'username'
export async function getOneUser(req: Request, res: Response) {

    const usernameSchema = z.string()
    .min(3)
    .max(50)
    .regex(/^[a-zA-Z0-9_]+$/);

    const parseResult = usernameSchema.safeParse(req.params.username);

    if (!parseResult.success) {
    return res.status(400).json({
        error: "Username invalide",
        details: parseResult.error.issues.map(issue => issue.message)
    });
    }

    const username = parseResult.data; 

    const user = await prisma.user.findUnique({
    where: { username },
    omit: { 
        password_hash: true, 
        email: true },
    });

    if (!user) {
    return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    res.json(user);
}