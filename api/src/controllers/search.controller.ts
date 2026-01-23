import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.ts";

export async function getSearchSuggestions(req: Request, res: Response) {
  const { q } = req.query;
  const query = String(q);

  if (!query || query.length < 3)
    return res.json({ leagues: [], teams: [], matches: [] });

  try {
    const [leagues, teams, matches] = await Promise.all([
      //1. Chercher dans les Ligues
      prisma.competition.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { code: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 3,
      }),
      // 2. Chercher dans les Équipes
      prisma.team.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { short_name: { contains: query, mode: "insensitive" } },
            { tla: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 5,
      }),
      // 3. Chercher dans les Prochains Matchs
      prisma.match.findMany({
        where: {
          OR: [
            { home_team: { name: { contains: query, mode: "insensitive" } } },
            { away_team: { name: { contains: query, mode: "insensitive" } } },
          ],
          date: { gte: new Date() }, // Uniquement à venir pour les suggestions
        },
        include: { home_team: true, away_team: true },
        take: 5,
        orderBy: { date: "asc" },
      }),
    ]);

    res.json({ leagues, teams, matches });
  } catch (error) {
    res.status(500).json({ error: "Erreur recherche" });
  }
}
