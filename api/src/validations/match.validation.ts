import { z } from "zod";

// Schéma de validation pour créer un match (utilisé à la fois par l'admin et les jobs de synchro)
export const createMatchSchema = z.object({
  // Horodatage complet du match
  date: z.iso.datetime(),
  venue: z.string().nullable().optional(),

  // Statut métier du match
  status: z
    .enum([
      "SCHEDULED",
      "TIMED",
      "IN_PLAY",
      "PAUSED",
      "FINISHED",
      "SUSPENDED",
      "POSTPONED",
      "CANCELLED",
      "AWARDED",
    ])
    .default("SCHEDULED"),

  // Scores (optionnels tant que le match n'est pas terminé)
  home_score: z.number().int().min(0).nullable().optional(),
  away_score: z.number().int().min(0).nullable().optional(),

  // Relations (utilisées par la création via l'admin avec des IDs existants)
  // Accepter "" comme absent pour éviter 400 quand le front envoie une chaîne vide
  home_team_id: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().uuid().optional()
  ),
  away_team_id: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().uuid().optional()
  ),
  competition_id: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().uuid().optional()
  ),

  // Métadonnées d'affichage
  is_featured: z.boolean().default(false),
  featured_name: z.string().nullable().optional(),
});

// Schéma de validation pour mettre à jour un match
// Tous les champs sont optionnels pour permettre une mise à jour partielle
export const updateMatchSchema = z.object({
  status: z
    .enum([
      "SCHEDULED",
      "TIMED",
      "IN_PLAY",
      "PAUSED",
      "FINISHED",
      "SUSPENDED",
      "POSTPONED",
      "CANCELLED",
      "AWARDED",
    ])
    .optional(),
  venue: z.string().nullable().optional(),
  home_score: z.number().int().min(0).nullable().optional(),
  away_score: z.number().int().min(0).nullable().optional(),
  is_featured: z.boolean().optional(),
  featured_name: z.string().nullable().optional(),
});

// Types générés depuis les schémas Zod
export type CreateMatchInput = z.infer<typeof createMatchSchema>;
export type UpdateMatchInput = z.infer<typeof updateMatchSchema>;
