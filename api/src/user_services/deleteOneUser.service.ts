import { prisma } from "../lib/prisma.ts";

// Suppression de l'utilisateur de la bdd
export async function deleteUser(id: string) {
  await prisma.user.delete({
    where: { id },
  });
}