import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.ts";


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

//fonction permettant de récupérer un utilisateur via son 'username'
export async function getOneUser(req: Request, res: Response) {

    // Récupère le paramètre 'username' dans l'URL
    const { username } = req.params;

    // Vérifie que le 'username' est bien présent et que ce n'est pas un tableau
    // express peut typer les params en string | string[] | undefined
    // Prisma fait pas de typage en string[], donc on spécifie que on veut que du string sans tableau
    // Retour d'un code 400 si le paramètre est mal formé
    if (!username || Array.isArray(username)) {
        return res.status(400).json({error: "username invalide"});
    }

    // Recherche de l'utilisateur dans la base de donnée
    // En excluant le mot de passe du résultat pour la sécurité
    const user = await prisma.user.findUnique({
        where: { username : username},
        omit: { password_hash : true }
    });

    // Si aucun utilisateur est trouvé on renvoi une 404
    if (!user) {
        res.status(404).json({error: "User not found" });
        return;
    }
    
    // Retourne l'utilisateur en format JSON
    res.json(user);
}