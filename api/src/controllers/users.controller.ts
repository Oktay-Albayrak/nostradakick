import type { Request, Response } from "express";
import * as userService from "../services/user.service.ts"
import { usernameSchema, uuidSchema } from "../validations/utils.user.validation.ts";
import { updateUserSchema } from "../validations/user.validation.ts";
import { ZodError } from "zod";





// Fonction permettant de récupérer tout les utilisateurs
export async function getAllUsers(req: Request, res: Response) {
    try {
        // Appel du service pour récupérer les utilisateurs
        const users = await userService.findAllUsers();

        // Retourne la liste des utilisateurs sans filtrage en format JSON
        res.json(users);
    } catch (error) {

        // retour d'un message d'erreur si le serveur plante
        console.error("Erreur lors de la récupération des utilisateurs (controller.getAllUser) :", error);
        res.status(500).json({ message: "Erreur interne du serveur"})
    }
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
    const user = await userService.findUserByUsername(username)

    // si l'utilisateur n'existe pas on renvoie une 404
    if (!user) {
    return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    // on retourne les données au format JSON
    res.json(user);
}





// Fonction permettant la mise à jour d'un utilisateur via son 'ID'
export async function updateOneUser(req: Request, res: Response) {
  try {
    // validation des paramètres de id
    const { id } = uuidSchema.parse(req.params);

    // validation du body
    const updateData = updateUserSchema.parse(req.body);

    const userFound = await userService.findUserById(id);
    if (!userFound) {
        return res.status(404).json({ message: "L'utilisateur n'existe pas "});
    }

    const user = await userService.updateUser( id, updateData);
    res.json(user);

  } catch (error) {
    if ( error instanceof ZodError) {
      return res.status(400).json({
        error: "Données invalide",
        details: error.issues.map((issue) => issue.message),
      });
    }

    console.error( "Erreur lors de la mise à jour de l'utilisateur (controller.updateOneUser) :", error );
    res.status(500).json({ message: "Erreur interne du serveur" })
  }
}





// Fonction permettant de supprimer un utilisateur via son 'ID'
export async function deleteOneUser(req: Request, res: Response) {

    try {
    // Validation et récupération de l'ID depuis les paramètres de l'URL
    const { id } = uuidSchema.parse(req.params);

    // Vérification dans la bdd si l'utilisateur existe
    const userFound = await userService.findUserById(id);

    // Si aucune correspondance, on affiche une 404 avec un message d'erreur
    if (!userFound) {
        return res.status(404).json({ message: "Utilisateur introuvable"});
    }

    // Si l'utilisateur existe, on le supprime
    await userService.deleteUser(id);

    // Message de succès renvoyé à l'utilisateur
    res.json({message: "Utilisateur supprimé"})
    
    // erreur renvoyé en cas de problème du serveur ou autre
    } catch (error) {
        console.error("Erreur lors de la suppression de l'utilisateur (controller.deleteOneUser):", error);
        res.status(500).json({ 
            message: "erreur interne du serveur"
        });
    }
}