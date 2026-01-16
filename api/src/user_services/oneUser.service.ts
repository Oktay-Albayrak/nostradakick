import { prisma } from "../lib/prisma.ts";

/**
 * Récupère un utilisateur par son username.
 * @param username - Le username de l'utilisateur à récupérer.
 * @returns L'utilisateur trouvé, ou null si non trouvé.
 * @throws Une erreur si la requête à la base de données échoue.
 */


export async function findUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
  })

  return user
}

export async function findUserByUsername(username: string) {

  try {
// on recherche dans la base de donné pour montré seulement 1 utilisateur en excluant les champs sensibles (password_hash email)
    const user = await prisma.user.findUnique({
      where: { username },
      omit: { 
        password_hash: true, 
        email: true 
      },
      include: { // on inclut pour un user les données suivants: stats, predictions, matchs; en excluant les données inutiles 
        stats: true,
        predictions: {
          include: {
            match: {
              include: {
                home_team: { 
                  omit: { 
                    created_at: true, 
                    updated_at: true, 
                    api_id: true 
                  }
                },
                away_team:  { 
                  omit: { 
                    created_at: true, 
                    updated_at: true, 
                    api_id: true 
                  }
                },
              },
              omit: {
                created_at: true,
                updated_at: true,
                api_id: true,
              }
            },
          }
        },
      },
    });

    return user;

  } catch (error) {
      console.error("Erreur lors de la recherche de l'utilisateur dans la base de donnée:", error);
      throw error; // Relance l'erreur pour que le controller puisse la gérer
  }
}



