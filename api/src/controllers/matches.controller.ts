import type { Request, Response } from "express";
import { uuidSchema } from "../validations/utils.validation.ts";
import { ZodError } from "zod";
import { createMatchSchema, updateMatchSchema } from "../validations/match.validation.ts";
import * as matchService from "../services/match.service.ts";


  // VOIR TOUT LES MATCH
export async function getAllMatches(req: Request, res: Response) {
  try {
    // Récupération des paramètres (ex: ?page=1&limit=10)
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const leagueCode = req.query.league as string | undefined;
    const isHot = req.query.filter === "hot";

    const matches = await matchService.findAllMatches(
      page,
      limit,
      leagueCode,
      isHot
    );

    res.json(matches);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des matchs (controller.getAllMatches) :",
      error
    );
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des matches" });
  }
}

  // VOIR UN MATCH
export async function getOneMatch(req: Request, res: Response) {
  try {
    const { api_id } = req.params;

    // On vérifie que l'api_id est bien present
    if (!api_id || typeof api_id !== "string") {
      return res.status(400).json({ message: "Paramètre apiId invalide." });
    }

    const matchId = parseInt(api_id, 10);

    if (isNaN(matchId)) {
      return res
        .status(400)
        .json({ message: "L'ID fourni n'est pas un nombre valide." });
    }

    const match = await matchService.findMatchByApiId(matchId);

    if (!match) {
      return res.status(404).json({ message: "Match non trouvé." });
    }

    res.json(match);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération du match (controller.getOneMatch) :",
      error
    );
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération du match" });
  }
}

  // CRÉER UN MATCH 
export async function createOneMatch(req: Request, res: Response) {
  try {
    // Vérification du rôle admin
    const userPayload = (req as any).user;
    if (!userPayload || userPayload.userRole !== "ADMIN") {
      return res.status(403).json({
        message: "Accès refusé. Seul les admins peuvent créer un match.",
      });
    }

    // Validation des données via le body
    const createData = createMatchSchema.parse(req.body);

    // Création ou mise à jour du match (upsert)
    const match = await matchService.createMatch(createData);

    res.status(201).json(match);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: "Données invalide",
        details: error.issues.map((issue) => issue.message),
      });
    }

    console.error(
      "Erreur lors de la création du match (controller.createOneMatch) :",
      error
    );
    res.status(500).json({ message: "Erreur lors de la création du match" });
  }
}

  // METTRE À JOUR UN MATCH
export async function updateOneMatch(req: Request, res: Response) {
  try {
    // Validation de l'ID du match
    const { id } = uuidSchema.parse(req.params);

    // Récupération du role de l'utilisateur depuis la requête
    const userPayload = (req as any).user;
    if (!userPayload || userPayload.userRole !== "ADMIN") {
      return res.status(403).json({
        message: "Accès refusé. Seul les admins peuvent modifier un match",
      });
    }

    const matchExists = await matchService.findMatchById(id);
    if (!matchExists) {
      return res.status(404).json({ message: "Match non trouvé." });
    }

    // Validation des données via le body
    const updateData = updateMatchSchema.parse(req.body);

    // Mise à jour du match
    const updatedMatch = await matchService.updateMatch(id, updateData);

    res.json(updatedMatch);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: "Données invalide",
        details: error.issues.map((issue) => issue.message),
      });
    }

    console.error(
      "Erreur lors de la mise à jour du match (controller.updateOneMatch) :",
      error
    );
    res.status(500).json({ message: "Erreur lors de la mise à jour du match" });
  }
}

  // SUPPRIMER UN MATCH
export async function deleteOneMatch(req: Request, res: Response) {
  try {
    const { id } = uuidSchema.parse(req.params);

    const userPayload = (req as any).user;
    if (!userPayload || userPayload.userRole !== "ADMIN") {
      return res.status(403).json({
        message: "Accès refusé. Seul les admins peuvent supprimer un match.",
      });
    }

    const matchExists = await matchService.findMatchById(id);
    if (!matchExists) {
      return res.status(404).json({ message: "Match non trouvé." });
    }

    await matchService.deleteMatch(id);
    res.json({ message: "Match supprimé avec succès." });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: "Données invalide",
        details: error.issues.map((issue) => issue.message),
      });
    }

    console.error(
      "Erreur lors de la suppression du match (controller.deleteOneMatch) :",
      error
    );
    res.status(500).json({ message: "Erreur lors de la suppression du match" });
  }
}