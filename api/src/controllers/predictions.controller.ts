import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.ts";
import z from "zod";
// import type { Prediction } from "../../generated/prisma/client";

// Récupère toutes les prédictions avec leurs détails associés (match et utilisateur)
export async function getAllPredictions(req: Request, res: Response) {
  const predictions = await prisma.prediction.findMany({
    orderBy: { updated_at: 'desc' },
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
    const result = uuidSchema.safeParse(req.params.id);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    const paramId = result.data;

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
      return res.status(404).json({ error: ["Prediction not found"] });
    }

    // Vérification de propriété : l'utilisateur ne peut voir que ses propres pronostics
    // sauf s'il est ADMIN
    const userPayload = (req as any).user;
    if (prediction.user_id !== userPayload.userId && userPayload.userRole !== "ADMIN") {
      return res.status(403).json({ 
        error: "Vous ne pouvez accéder qu'à vos propres pronostics" 
      });
    }

    res.json(prediction);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: z.prettifyError(error) });
    }
    throw error;
  }
}

// Crée ou met à jour une prédiction (Upsert)
export async function upsertPrediction(req: Request, res: Response) {
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
    const result = createPredictionSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ error: result.error.issues.map((issue) => (issue.message)) });
    }

    const { user_id, match_id, prediction_value } = result.data;

    // Vérification de propriété : l'utilisateur ne peut créer/modifier que ses propres pronostics
    // sauf s'il est ADMIN
    const userPayload = (req as any).user;
    if (user_id !== userPayload.userId && userPayload.userRole !== "ADMIN") {
      return res.status(403).json({ 
        error: "Vous ne pouvez créer ou modifier que vos propres pronostics" 
      });
    }

    // Utilisation de upsert : 
    // update si le combo user_id_match_id existe, sinon create
    const prediction = await prisma.prediction.upsert({
      where: {
        user_id_match_id: {
          user_id,
          match_id
        }
      },
      update: {
        prediction_value
      },
      create: {
        user_id,
        match_id,
        prediction_value
      }
    });

    // On retourne 200 (OK) car cela peut être une création ou une modification
    res.status(200).json(prediction);
  } catch (error) {
    throw error;
  }
}

// Suppression d'un pronostic
export async function deletePrediction(req: Request, res: Response) {
  const uuidSchema = z.uuid({
    message: "L'identifiant fourni n'est pas valide."
  });

  try {
    // 1. Validation des données (on peut les recevoir via req.params ou req.body)
    const result = uuidSchema.safeParse(req.params.id);

    if (!result.success) {
      return res.status(400).json({ error: result.error.issues });
    }

    const paramId = result.data;

    // 2. Récupérer la prédiction pour vérifier la propriété
    const prediction = await prisma.prediction.findUnique({
      where: { id: paramId }
    });

    if (!prediction) {
      return res.status(404).json({ error: "Pronostic non trouvé" });
    }

    // 3. Vérification de propriété : l'utilisateur ne peut supprimer que ses propres pronostics
    // sauf s'il est ADMIN
    const userPayload = (req as any).user;
    if (prediction.user_id !== userPayload.userId && userPayload.userRole !== "ADMIN") {
      return res.status(403).json({ 
        error: "Vous ne pouvez supprimer que vos propres pronostics" 
      });
    }

    // 4. Suppression du pronostic
    await prisma.prediction.delete({
      where: { id: paramId }
    });

    // 5. Retourner un succès
    return res.status(204).json({ message: "Pronostic supprimé" });

  } catch (error) {
    throw error;
  }
}
