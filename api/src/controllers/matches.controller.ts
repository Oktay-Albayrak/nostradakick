import { prisma } from "../lib/prisma.ts";
import type { Request, Response } from "express";

export async function getAllMatches(req: Request, res: Response) {
  try {
    const matches = await prisma.match.findMany({
      where: {
        // On ne veut que les matchs qui ne sont pas finis
        // OU ceux qui commencent à partir de maintenant
        status: {
          in: ["SCHEDULED", "TIMED", "IN_PLAY", "PAUSED"],
        },
        date: {
          gte: new Date(), // gte = Greater Than or Equal (Plus grand ou égal à maintenant)
        },
      },
      include: {
        home_team: true,
        away_team: true,
        competition: true,
      },
      orderBy: {
        date: "asc", // Les plus proches en premier
      },
    });
    res.json(matches);
  } catch (e) {
    console.error(e);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des matches" });
  }
}

export async function getOneMatch(req: Request, res: Response) {
  const { api_id } = req.params;

  // On verifie que l'api_id est bien present
  if (!api_id || typeof api_id !== "string") {
    return res.status(400).json({ message: "Paramètre apiId invalide." });
  }

  const matchId = parseInt(api_id, 10);

  if (isNaN(matchId)) {
    return res
      .status(400)
      .json({ message: "L'ID fourni n'est pas un nombre valide." });
  }

  const match = await prisma.match.findUnique({
    where: { api_id: matchId },
    include: {
      home_team: true,
      away_team: true,
      competition: true,
      predictions: true,
    },
  });

  if (!match) return res.status(404).json({ message: "Match non trouvé." });

  res.json(match);
}
