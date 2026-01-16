import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.ts";
import * as oneUserService from "../user_services/oneUser.service.ts"
import * as updateUserService from "../user_services/updateUser.service.ts"
import { usernameSchema, uuidSchema } from "../user_validations/utils.validation.ts";
import { updateUserSchema } from "../user_validations/user.validation.ts";
import { ZodError } from "zod";




// Fonction permettant de récupérer tout les utilisateurs
export async function getAllUsers(req: Request, res: Response) {

    // Récupère tout les utilisateurs en base de donnée
    // "omit" permet d'exclure les champs sensibles (password_hash ici)
    const users = await prisma.user.findMany({ 
        select: {
            id: true,
            username: true,
            email: true,
            role: true,
            avatar_url: true,
            created_at: true,
            updated_at: true
        },
        orderBy: { 
            created_at: "asc",
        },
    });

    // Retourne la liste des utilisateurs sans filtrage en format JSON
    res.json(users);
}




// Fonction permettant de récupérer un utilisateur via son 'username'
export async function getOneUser(req: Request, res: Response) {


    // On valide le username en important le schéma Zod du dossier validations. Si la validation échoue, on retourne une erreur 400
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

// on recherche dans la base de donné via le userService mentionné
    const user = await oneUserService.findUserByUsername(username)

    // si l'utilisateur n'existe pas on renvoie une 404
    if (!user) {
    return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    // on retourne les données au format JSON
    res.json(user);
}




export async function updateOneUser(req: Request, res: Response) {
  try {
    // validation des paramètres de id
    const { id } = uuidSchema.parse(req.params);

    // validation du body
    const updateData = updateUserSchema.parse(req.body);

    const userFound = await oneUserService.findUserById(id);
    if (!userFound) {
        return res.status(404).json({ message: "L'utilisateur n'existe pas "});
    }

    const user = await updateUserService.updateUser( id, updateData);
    res.json(user);

  } catch (error) {
    if ( error instanceof ZodError) {
      return res.status(400).json({
        error: "Données invalide",
        details: error.issues.map((issue) => issue.message),
      });
    }

    console.error( "Erreur dans le controleur, partie updateOneUser :", error );
    res.status(500).json({ message: "Erreur interne du serveur" })
  }
}