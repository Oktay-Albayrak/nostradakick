import { prisma } from "../lib/prisma.ts";
import type { Request, Response } from "express";
import { z } from "zod";

// Schéma de validation pour créer une équipe
const createTeamSchema = z.object({
  name: z.string().min(1),
  short_name: z.string().optional(),
  tla: z.string().max(6).default("N/A"),
  crest_url: z.string().default(""),
  country: z.string().default("Unknown"),
  api_id: z.number().int().optional(), // Optionnel pour les équipes créées manuellement
});

// Récupérer toutes les équipes (avec recherche optionnelle)
export async function getAllTeams(req: Request, res: Response) {
  try {
    const { q, limit = "50" } = req.query;
    const searchQuery = q as string | undefined;
    const limitNum = parseInt(limit as string, 10);

    const where = searchQuery
      ? {
          OR: [
            { name: { contains: searchQuery, mode: "insensitive" as const } },
            { short_name: { contains: searchQuery, mode: "insensitive" as const } },
            { tla: { contains: searchQuery, mode: "insensitive" as const } },
          ],
        }
      : {};

    const teams = await prisma.team.findMany({
      where,
      take: limitNum,
      orderBy: { name: "asc" },
    });

    res.json(teams);
  } catch (error) {
    console.error("Erreur lors de la récupération des équipes:", error);
    res.status(500).json({ message: "Erreur lors de la récupération des équipes" });
  }
}

// Créer une nouvelle équipe
export async function createTeam(req: Request, res: Response) {
  try {
    // Vérification du rôle admin
    const userPayload = (req as any).user;
    if (!userPayload || userPayload.userRole !== "ADMIN") {
      return res.status(403).json({
        message: "Accès refusé. Seuls les admins peuvent créer une équipe.",
      });
    }

    const teamData = createTeamSchema.parse(req.body);

    // Générer un api_id si non fourni (utiliser un nombre négatif pour différencier des équipes de l'API)
    let api_id = teamData.api_id;
    if (!api_id) {
      // Trouver le plus petit api_id négatif existant
      const existingTeam = await prisma.team.findFirst({
        where: { api_id: { lt: 0 } },
        orderBy: { api_id: "asc" },
      });
      api_id = existingTeam ? existingTeam.api_id - 1 : -1;
    }

    // Vérifier si l'api_id existe déjà
    const existingTeam = await prisma.team.findUnique({
      where: { api_id },
    });

    if (existingTeam) {
      return res.status(409).json({
        message: "Une équipe avec cet api_id existe déjà.",
      });
    }

    const team = await prisma.team.create({
      data: {
        api_id,
        name: teamData.name,
        short_name: teamData.short_name || teamData.name,
        tla: teamData.tla,
        crest_url: teamData.crest_url,
        country: teamData.country,
      },
    });

    res.status(201).json(team);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Données invalides",
        details: error.issues.map((issue) => issue.message),
      });
    }

    console.error("Erreur lors de la création de l'équipe:", error);
    res.status(500).json({ message: "Erreur lors de la création de l'équipe" });
  }
}
