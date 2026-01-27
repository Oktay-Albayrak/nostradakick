import { z } from "zod";

// Schéma de validation pour créer un match
export const createMatchSchema = z.object({ // à supprimer après mise à jour de la bdd
  date: z.iso.datetime(),
  venue: z.string().nullable().optional(),
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
  home_score: z.number().int().min(0).optional(),
  away_score: z.number().int().min(0).optional(),
  is_featured: z.boolean().default(false),
  featured_name: z.string().optional(),
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
  home_score: z.number().int().min(0).optional(),
  away_score: z.number().int().min(0).optional(),
  is_featured: z.boolean().optional(),
  featured_name: z.string().optional(),
});

// Types générés depuis les schémas Zod
export type CreateMatchInput = z.infer<typeof createMatchSchema>;
export type UpdateMatchInput = z.infer<typeof updateMatchSchema>;
