import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.ts";
import z from "zod";
// import type { Prediction } from "../../generated/prisma/client";

// Récupère toutes les prédictions avec leurs détails associés (match et utilisateur)
export async function getAllPredictions(req: Request, res: Response) {
  const predictions = await prisma.prediction.findMany({
    include: {
      match: {
        include: { home_team: true, away_team: true, competition: true } // Include pour faire appel a la relation et avoir les détails des matchs grace aux ids
      },
      user: { select: { id: true, username: true, avatar_url: true } } // Sélectionner seulement les infos publics
    }
  });
  res.json(predictions);
}

// Récupère une seule prédiction par son ID
export async function getOnePrediction(req: Request, res: Response) {
  const uuidSchema = z.uuid({
    message: "L'identifiant fourni n'est pas valide."
  });

  try {
    // Valide que l'ID du paramètre est un UUID valide
    const paramId = await uuidSchema.parseAsync(req.params.id);

    // Récupère la prédiction avec tous ses détails associés (match et utilisateur)
    const prediction = await prisma.prediction.findUnique({
      where: { id: paramId },
      include: {
        match: {
          include: { home_team: true, away_team: true, competition: true }
        },
        user: { select: { id: true, username: true, avatar_url: true } }
      }
    });

    // Retourne 404 si la prédiction n'existe pas
    if (!prediction) {
      return res.status(404).json({ error: "Prediction not found" });
    }

    res.json(prediction);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: z.prettifyError(error) });
    }
    throw error;
  }
}

// Crée une nouvelle prédiction avec validation des données
export async function createPrediction(req: Request, res: Response) {
  const createPredictionSchema = z.object({
    user_id: z.uuid({
      message: "L'ID utilisateur fourni n'est pas valide."
    }),
    match_id: z.uuid({
      message: "L'ID match fourni n'est pas valide."
    }),
    prediction_value: z.enum(["HOME", "DRAW", "AWAY"], {
      message: "La valeur de prédiction doit être HOME, DRAW ou AWAY."
    })
  });

  try {
    // Valide et récupère les données du corps de la requête
    const { user_id, match_id, prediction_value } = await createPredictionSchema.parseAsync(req.body);

    // Vérifie si l'utilisateur a déjà une prédiction pour ce match (via la clé composée unique)
    const existing = await prisma.prediction.findUnique({
      where: { user_id_match_id: { user_id, match_id } }
    });

    // Retourne une erreur 409 si la prédiction existe déjà
    if (existing) {
      return res.status(409).json({ error: "Vous avez déjà fait un pronostic pour ce match." });
    }

    // Crée la nouvelle prédiction en base de données
    const prediction = await prisma.prediction.create({
      data: {
        user_id,
        match_id,
        prediction_value
      }
    });

    res.status(201).json(prediction);
  } catch (error) {
    // Gère les erreurs de validation Zod
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: z.prettifyError(error) });
    }
    throw error;
  }
}
