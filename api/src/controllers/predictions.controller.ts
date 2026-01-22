/**
 * CONTRÔLEUR DES PRÉDICTIONS
 * 
 * Gère toute la logique métier des prédictions de matchs.
 * 
 * Fonctionnalités :
 * - Récupérer toutes les prédictions
 * - Récupérer une prédiction spécifique
 * - Récupérer la prédiction d'un utilisateur pour un match
 * - Créer ou mettre à jour une prédiction (UPSERT)
 * - Supprimer une prédiction
 * 
 * Pattern UPSERT :
 * - Clé composite unique : (user_id, match_id)
 * - Nouvelle prédiction : INSERT
 * - Prédiction existante : UPDATE
 */

import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.ts";
import z from "zod";


/**
 * FONCTION GETUSERPREDICTIOINFORMATCH
 * 
 * Récupère la prédiction existante d'un utilisateur pour un match spécifique.
 * 
 * Query params requis :
 * - user_id: UUID de l'utilisateur
 * - match_id: UUID du match
 * 
 * Retour :
 * - 200 : objet prédiction avec tous les détails
 * - 404 : aucune prédiction trouvée
 * - 400 : paramètres invalides
 * 
 * Utilisé par le frontend pour :
 * - Charger la prédiction existante
 * - Afficher le bouton du pronostic en couleur différente
 */
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

// Récupère une seule prédiction par son ID
/**
 * FONCTION GETONEPREDICTION
 * 
 * Récupère une prédiction spécifique par son ID (UUID).
 * 
 * Params :
 * - id (route) : UUID unique de la prédiction
 * 
 * Retour :
 * - 200 : objet prédiction avec détails
 * - 404 : prédiction non trouvée
 * - 400 : ID invalide
 */
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

    res.json(prediction);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: z.prettifyError(error) });
    }
    throw error;
  }
}

// Crée ou met à jour une prédiction (Upsert)
/**
 * FONCTION UPSERTPREDICTION
 * 
 * Crée une nouvelle prédiction OU met à jour une existante.
 * 
 * Utilise le pattern UPSERT avec clé composite (user_id, match_id).
 * 
 * Body requis :
 * - user_id: UUID de l'utilisateur
 * - match_id: UUID du match
 * - prediction_value: "HOME" | "DRAW" | "AWAY"
 * 
 * Logique :
 * 1. Valide les données avec Zod
 * 2. Cherche (user_id, match_id) dans la DB
 * 3. Si existe : UPDATE la prédiction
 * 4. Si n'existe pas : CREATE nouvelle prédiction
 * 
 * Retour :
 * - 200 OK : prédiction créée ou mise à jour
 * - 400 : données invalides
 * 
 * Utilisé par le frontend quand l'utilisateur :
 * - Fait son premier pronostic
 * - Change son pronostic existant
 */
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

    // 2. Tentative de suppression via la clé composée
    const prediction = await prisma.prediction.delete({
      where: { id: paramId }
    });

    // 3. Retourner un succès
    return res.status(204).json(prediction);

  } catch (error) {
    throw error;
  }
}
