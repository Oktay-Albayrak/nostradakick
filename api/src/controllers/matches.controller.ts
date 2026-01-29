import type { Request, Response } from "express";
import { uuidSchema } from "../validations/utils.validation.ts";
import { ZodError } from "zod";
import {
  createMatchSchema,
  updateMatchSchema,
} from "../validations/match.validation.ts";
import * as matchService from "../services/match.service.ts";

// RÉCUPÉRER TOUS LES MATCHS (avec pagination et filtres)
export async function getAllMatches(req: Request, res: Response) {
  try {
    // Récupération des paramètres de la requête
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const leagueCode = req.query.league as string | undefined;
    const teamSlug = req.query.team as string | undefined;
    const isHot = req.query.filter === "hot";
    const date = req.query.date as string | undefined;
    const status = req.query.status as string | undefined;
    const all = req.query.all === "true";

    const matches = await matchService.findAllMatches(
      page,
      limit,
      leagueCode,
      teamSlug,
      isHot,
      date,
      status,
      all,
    );

    res.json(matches);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des matchs (controller.getAllMatches) :",
      error,
    );
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des matches" });
  }
}

  // RÉCUPÉRER UN MATCH PAR SON UUID
export async function getOneMatchById(req: Request, res: Response) {
  try {
    // Validation de l'UUID avec Zod
    const { id } = uuidSchema.parse(req.params);

    const match = await matchService.findMatchById(id);

    if (!match) {
      return res.status(404).json({ message: "Match non trouvé." });
    }

    res.json(match);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: "Données invalides",
        details: error.issues.map((issue) => issue.message),
      });
    }

    console.error(
      "Erreur lors de la récupération du match (controller.getOneMatchById) :",
      error
    );
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération du match" });
  }
}

// CRÉER UN MATCH (réservé aux admins)
export async function createOneMatch(req: Request, res: Response) {
  try {
    // Vérification du rôle admin
    const userPayload = (req as any).user;
    if (!userPayload || userPayload.userRole !== "ADMIN") {
      return res.status(403).json({
        message: "Accès refusé. Seuls les admins peuvent créer un match.",
      });
    }

    // Validation des données avec Zod (incluant éventuellement les IDs)
    // Utiliser safeParse pour capturer les erreurs de validation
    const validationResult = createMatchSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      const details = validationResult.error.issues.map((issue) => {
        const path = issue.path.join(".");
        return path ? `${path}: ${issue.message}` : issue.message;
      });
      console.error("Erreur de validation Zod:", validationResult.error.issues);
      return res.status(400).json({
        error: "Données invalides",
        details,
      });
    }
    
    const createData = validationResult.data;

    // Cas d'utilisation admin : création à partir d'IDs existants
    if (
      createData.home_team_id &&
      createData.away_team_id &&
      createData.competition_id
    ) {
      const match = await matchService.createMatchFromIds(
        createData,
        createData.home_team_id,
        createData.away_team_id,
        createData.competition_id
      );

      return res.status(201).json(match);
    }

    // Si le body contient des champs *_id mais pas tous remplis → message clair
    const { home_team, away_team, competition } = req.body;
    if (
      req.body.home_team_id !== undefined ||
      req.body.away_team_id !== undefined ||
      req.body.competition_id !== undefined
    ) {
      return res.status(400).json({
        error: "Données invalides",
        details: [
          "Veuillez sélectionner une compétition, une équipe à domicile et une équipe à l'extérieur (en cliquant sur une proposition dans la liste).",
        ],
      });
    }

    // Cas de fallback (mode historique / synchro) : on attend des objets complets

    const match = await matchService.createMatch(
      createData,
      home_team,
      away_team,
      competition
    );

    res.status(201).json(match);
    
  } catch (error) {
    if (error instanceof ZodError) {
      const details = error.issues.map((issue) => {
        const path = issue.path.join(".");
        return path ? `${path}: ${issue.message}` : issue.message;
      });
      return res.status(400).json({
        error: "Données invalides",
        details,
      });
    }
    console.error("Erreur création match:", error);
    
    // Retourner le message d'erreur si c'est une erreur métier connue
    if (error instanceof Error) {
      // Erreur de validation (IDs inexistants, etc.)
      if (error.message.includes("n'existe pas")) {
        return res.status(404).json({
          error: "Ressource non trouvée",
          message: error.message,
        });
      }
      // Erreur Prisma (contraintes, etc.)
      if (error.message.includes("Unique constraint") || error.message.includes("Foreign key constraint")) {
        return res.status(400).json({
          error: "Erreur de contrainte",
          message: error.message,
        });
      }
      return res.status(500).json({
        error: "Erreur lors de la création du match",
        message: error.message,
      });
    }
    
    res.status(500).json({ message: "Erreur lors de la création du match" });
  }
}

// METTRE À JOUR UN MATCH (réservé aux admins)
export async function updateOneMatch(req: Request, res: Response) {
  try {
    // Validation de l'ID du match
    const { id } = uuidSchema.parse(req.params);

    // Vérification du rôle admin
    const userPayload = (req as any).user;
    if (!userPayload || userPayload.userRole !== "ADMIN") {
      return res.status(403).json({
        message: "Accès refusé. Seuls les admins peuvent modifier un match.",
      });
    }

    // Vérification de l'existence du match
    const matchExists = await matchService.findMatchById(id);
    if (!matchExists) {
      return res.status(404).json({ message: "Match non trouvé." });
    }

    // Validation des données avec Zod
    const updateData = updateMatchSchema.parse(req.body);

    // Mise à jour du match
    const updatedMatch = await matchService.updateMatch(id, updateData);

    res.json(updatedMatch);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: "Données invalides",
        details: error.issues.map((issue) => issue.message),
      });
    }

    console.error(
      "Erreur lors de la mise à jour du match (controller.updateOneMatch) :",
      error,
    );
    res.status(500).json({ message: "Erreur lors de la mise à jour du match" });
  }
}

// SUPPRIMER UN MATCH (réservé aux admins)
export async function deleteOneMatch(req: Request, res: Response) {
  try {
    // Validation de l'UUID du match
    const { id } = uuidSchema.parse(req.params);

    // Vérification du rôle admin
    const userPayload = (req as any).user;
    if (!userPayload || userPayload.userRole !== "ADMIN") {
      return res.status(403).json({
        message: "Accès refusé. Seuls les admins peuvent supprimer un match.",
      });
    }

    // Vérification de l'existence du match
    const matchExists = await matchService.findMatchById(id);
    if (!matchExists) {
      return res.status(404).json({ message: "Match non trouvé." });
    }

    await matchService.deleteMatch(id);
    res.json({ message: "Match supprimé avec succès." });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: "Données invalides",
        details: error.issues.map((issue) => issue.message),
      });
    }

    console.error(
      "Erreur lors de la suppression du match (controller.deleteOneMatch) :",
      error,
    );
    res.status(500).json({ message: "Erreur lors de la suppression du match" });
  }
}
