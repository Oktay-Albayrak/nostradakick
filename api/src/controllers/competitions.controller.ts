import { prisma } from "../lib/prisma.ts";
import type { Request, Response } from "express";
import { z } from "zod";

// Schéma de validation pour créer une compétition
const createCompetitionSchema = z.object({
  name: z.string().min(1),
  code: z.string().max(10),
  emblem_url: z.string().default(""),
  country: z.string().default("Unknown"),
  api_id: z.number().int().optional(), // Optionnel pour les compétitions créées manuellement
});

export async function getAllCompetitions(req: Request, res: Response) {
  try {
    const { q, limit = "50" } = req.query;
    const searchQuery = q as string | undefined;
    const limitNum = parseInt(limit as string, 10);

    const where = searchQuery
      ? {
          OR: [
            { name: { contains: searchQuery, mode: "insensitive" as const } },
            { code: { contains: searchQuery, mode: "insensitive" as const } },
          ],
        }
      : {
          code: {
            in: ["PL", "FL1", "PD", "BL1", "SA", "CL"],
          },
        };

    const competitions = await prisma.competition.findMany({
      where,
      take: limitNum,
      orderBy: { name: "asc" },
    });
    res.json(competitions);
  } catch (e) {
    console.error(e);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des compétitions" });
  }
}

// Créer une nouvelle compétition
export async function createCompetition(req: Request, res: Response) {
  try {
    // Vérification du rôle admin
    const userPayload = (req as any).user;
    if (!userPayload || userPayload.userRole !== "ADMIN") {
      return res.status(403).json({
        message: "Accès refusé. Seuls les admins peuvent créer une compétition.",
      });
    }

    const competitionData = createCompetitionSchema.parse(req.body);

    // Générer un api_id si non fourni (utiliser un nombre négatif pour différencier des compétitions de l'API)
    let api_id = competitionData.api_id;
    if (!api_id) {
      // Trouver le plus petit api_id négatif existant
      const existingCompetition = await prisma.competition.findFirst({
        where: { api_id: { lt: 0 } },
        orderBy: { api_id: "asc" },
      });
      api_id = existingCompetition ? existingCompetition.api_id - 1 : -1;
    }

    // Vérifier si l'api_id existe déjà
    const existingCompetition = await prisma.competition.findUnique({
      where: { api_id },
    });

    if (existingCompetition) {
      return res.status(409).json({
        message: "Une compétition avec cet api_id existe déjà.",
      });
    }

    const competition = await prisma.competition.create({
      data: {
        api_id,
        name: competitionData.name,
        code: competitionData.code,
        emblem_url: competitionData.emblem_url,
        country: competitionData.country,
      },
    });

    res.status(201).json(competition);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Données invalides",
        details: error.issues.map((issue) => issue.message),
      });
    }

    console.error("Erreur lors de la création de la compétition:", error);
    res.status(500).json({ message: "Erreur lors de la création de la compétition" });
  }
}
