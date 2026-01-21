import { prisma } from "../lib/prisma.ts";
import type { Request, Response } from "express";

export async function getAllMatches(req: Request, res: Response) {
  try {
    // Récupération des paramètres (ex: ?page=1&limit=10)
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    // Exemple: Page demandée: 2 => Calcul: (2 - 1) * 10 = 10 (On saute les 10 premiers, on prends de 11 à 20)
    const skip = (page - 1) * limit;

    const leagueCode = req.query.league;
    const filter = req.query.filter;

    const whereConditions: any = {
      status: {
        in: ["SCHEDULED", "TIMED", "IN_PLAY", "PAUSED"],
      },
      date: {
        gte: new Date(),
      },
    };
    if (leagueCode) {
      whereConditions.competition = {
        code: leagueCode,
      };
    }

    if (filter === "hot") {
      whereConditions.is_featured = true;
    }

    const matches = await prisma.match.findMany({
      where: whereConditions,
      take: limit,
      skip: skip,
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
