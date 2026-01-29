import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.ts";
import * as teamService from "../services/team.service.ts";

/**
 * Champs requis pour créer une équipe (nécessaires pour pouvoir créer un match) :
 * - name, tla, crest_url, country
 * short_name et api_id sont optionnels.
 */
const createTeamSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  short_name: z.string().optional(),
  tla: z.string().min(1, "Le code TLA est requis (ex: PSG, OM)").max(6),
  crest_url: z.string().default(""), // Idéalement une URL de logo ; "" accepté pour création rapide
  country: z.string().min(1, "Le pays est requis"),
  api_id: z.number().int().optional(),
});

export async function getAllTeams(req: Request, res: Response) {
  try {
    const q = (req.query.q as string) || undefined;
    const limitParam = req.query.limit;
    const limit = limitParam ? parseInt(String(limitParam), 10) : undefined;

    const teams = await teamService.findAllTeams(q, limit);
    res.json(teams);
  } catch (error) {
    console.error("getAllTeams:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des équipes" });
  }
}

export async function createTeam(req: Request, res: Response) {
  try {
    const userPayload = (req as any).user;
    if (!userPayload || userPayload.userRole !== "ADMIN") {
      return res.status(403).json({
        message: "Accès refusé. Seuls les admins peuvent créer une équipe.",
      });
    }

    const parsed = createTeamSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Données invalides",
        details: parsed.error.issues.map((i) => i.message),
      });
    }

    const { name, short_name, tla, crest_url, country, api_id } = parsed.data;

    const existing = await prisma.team.findFirst({
      where: {
        OR: [{ name }, ...(api_id != null ? [{ api_id }] : [])],
      },
    });
    if (existing) {
      return res.status(409).json({
        message: "Une équipe avec ce nom ou cet api_id existe déjà.",
      });
    }

    const team = await prisma.team.create({
      data: {
        name,
        short_name: short_name ?? null,
        tla,
        crest_url: crest_url?.trim() || "",
        country,
        api_id: api_id ?? null,
      },
    });
    res.status(201).json(team);
  } catch (error) {
    console.error("createTeam:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la création de l'équipe" });
  }
}
