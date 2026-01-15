import argon2 from "argon2";
import { prisma, Prisma } from "../lib/prisma.ts";
import type { UpdateUserInput } from "../user_validations/user.validation.ts";

/**
 * Met à jour les données d'un utilisateur dans la base de données.
 * @param {string} userId - ID de l'utilisateur à mettre à jour.
 * @param {UpdateUserInput} updateData - Données de mise à jour.
 * @returns {Promise<User>} - Utilisateur mis à jour (sans le mot de passe).
 * @throws {Error} - En cas d'erreur lors de la mise à jour.
 */

export async function updateUser(
  userId: string,
  updateData: UpdateUserInput
) {

  // Déstructuration des données d'entrée pour extraire les champs spécifiques
  const { password, username, email, avatar_url } = updateData;

  const trimUsername = username?.trim();
  const trimEmail = email?.trim();
  const trimPassword = password?.trim();
  const trimAvatar = avatar_url?.trim();

  // Hachage du mot de passe si celui-ci est fourni dans les données de mise à jour
  const passwordHash = trimPassword ? await argon2.hash(trimPassword) : undefined;

  // Construction de l'objet de mise à jour pour Prisma
  // Chaque champ est ajouté à dataToUpdate uniquement s'il est défini dans updateData
  // Cela évite d'envoyer des valeurs undefined à la base de données
  const dataToUpdate: Prisma.UserUpdateInput = {
    ...(trimUsername !== undefined && { username: trimUsername }),
    ...(trimEmail !== undefined && { email: trimEmail }),
    ...(trimAvatar !== undefined && { avatar_url: trimAvatar }),
    ...(passwordHash !== undefined && { password_hash: passwordHash }),
  };

  try {


    // Mise à jour de l'utilisateur dans la base de données
    // On utilise 'select' pour spécifier quels champs retourner (excluant le mot de passe haché)
  const user = await prisma.user.update({
    where: { id: userId },
    data: dataToUpdate,
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      avatar_url: true,
      created_at: true,
      updated_at: true,
    },
  });

console.log(`Utilisateur ${userId} mis à jour avec succès.`);

  return user;

        } catch (error) {
            console.error(`Erreur lors de la mise à jour de l'utilisateur ${userId} :`,
              error 
            );

          // Message pour l'utilisateur final concernant l'erreur
          throw new Error("Échec de la mise à jour de l'utilisateur");
        }

}