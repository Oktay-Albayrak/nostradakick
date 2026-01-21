import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.ts";

export async function getAdminStats(req: Request, res: Response) {
  try {
    // Compter le nombre total d'utilisateurs
    const usersCount = await prisma.user.count();

    // Compter le nombre total de pronostics
    const predictionsCount = await prisma.prediction.count();

    // Compter le nombre total de matchs
    const matchesCount = await prisma.match.count();

    // Compter le nombre total de compétitions
    const competitionsCount = await prisma.competition.count();

    // Retourner les statistiques au format JSON
    res.json({
      usersCount,
      predictionsCount,
      matchesCount,
      competitionsCount,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des stats admin:", error);
    res.status(500).json({ 
      message: "Erreur interne du serveur lors de la récupération des statistiques" 
    });
  }
}
