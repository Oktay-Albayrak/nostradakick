// Contrôleur des prédictions : GET, POST, UPSERT (pattern composite key user_id+match_id)

import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.ts";
import z from "zod";

// Récupère la prédiction d'un utilisateur pour un match via GET /predictions?user_id=X&match_id=Y
export async function getUserPredictionForMatch(req: Request, res: Response) {
  const schema = z.object({
    user_id: z.uuid("L'ID utilisateur fourni n'est pas valide."),
    match_id: z.uuid("L'ID match fourni n'est pas valide.")
  });

  try {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      return res.status(400).json({ error: result.error.issues.map((issue) => issue.message) });
    }

    const { user_id, match_id } = result.data;

    // Recherche la prédiction avec la clé composite (user_id_match_id)
    const prediction = await prisma.prediction.findUnique({
      where: {
        user_id_match_id: {
          user_id,
          match_id
        }
      },
      include: {
        match: {
          include: { home_team: true, away_team: true, competition: true }
        },
        user: { select: { id: true, username: true, avatar_url: true } }
      }
    });

    if (!prediction) {
      return res.status(404).json({ error: "Pas de pronostic pour ce match" });
    }

    res.json(prediction);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: z.prettifyError(error) });
    }
    throw error;
  }
}

// Récupère toutes les prédictions avec leurs détails associés (match et utilisateur)
/**
 * FONCTION GETALLPREDICTIONS
 * 
 * Récupère TOUTES les prédictions du système.
 * 
 * Retour :
 * - Tableau de toutes les prédictions avec détails du match et utilisateur
 * 
 * Attention :
 * - Peut être lourd si beaucoup de prédictions
 * - À protéger par authentification admin
 * - À utiliser pour les statistiques globales
 */
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

// Récupère une prédiction spécifique par son ID
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

// Crée ou met à jour une prédiction (UPSERT sur clé composite user_id+match_id)
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
    // UPSERT : mise à jour OU création selon si la clé composite existe
    /**
     * Logique Prisma UPSERT :
     * 
     * WHERE : clé composite pour identifier si prédiction existe
     *   - user_id_match_id: { user_id, match_id }
     * 
     * UPDATE : si prédiction existe, mets à jour juste la valeur
     *   - prediction_value
     * 
     * CREATE : si prédiction n'existe pas, crée avec les 3 champs
     *   - user_id, match_id, prediction_value
     */
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

    // Retourne 200 (OK) car cela peut être une création ou une modification
    res.status(200).json(prediction);
  } catch (error) {
    throw error;
  }
}

// Suppression d'un pronostic
/**
 * FONCTION DELETEPREDICTION
 * 
 * Supprime une prédiction par son ID.
 * 
 * Params :
 * - id (route) : UUID unique de la prédiction à supprimer
 * 
 * Retour :
 * - 204 No Content : suppression réussie
 * - 404 : prédiction non trouvée
 * - 400 : ID invalide
 * 
 * Attention :
 * - À protéger par authentification (l'utilisateur ne peut supprimer que ses propres prédictions)
 * - Cascade delete si besoin (vérifier le schéma Prisma)
 */
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
