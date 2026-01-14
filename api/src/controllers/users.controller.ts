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

    // on définit un schéma de validation pour le username (doit être une chaîne de caractères valide)
    // afin d'éviter des erreurs avec TypeScript et Prisma
    const usernameSchema = z.string()
    .min(3) // minimum 3 caractères
    .max(50) // maximum 50 caractères
    .regex(/^[a-zA-Z0-9_]+$/); // caractères autorisés

    // On valide le username avec le schéma Zod. Si la validation échoue, on retourne une erreur 400
    const parseResult = usernameSchema.safeParse(req.params.username);


    // ce message d'erreur apparaîtra seulement si le pseudo est trop court ou trop long ou contient des caractère non autorisé
    if (!parseResult.success) {
    return res.status(400).json({
        error: "Username invalide",
        details: parseResult.error.issues.map(issue => issue.message)
    });
    }

    // si validation réussi on récupère le username validé de la base de donnée
    const username = parseResult.data; 


    // on recherche dans la base de donné pour montré seulement 1 utilisateur en excluant les champs sensibles (password_hash email)
    const user = await prisma.user.findUnique({
    where: { username },
    omit: { 
        password_hash: true, 
        email: true },
    });

    // si l'utilisateur n'existe pas on renvoie une 404
    if (!user) {
    return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    // on retourne les données au format JSON
    res.json(user);
}