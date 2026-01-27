import { z } from "zod";

// Schéma de validation pour créer un match
export const createMatchSchema = z.object({ // à supprimer après mise à jour de la bdd
  date: z.iso.datetime(),
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

// Schéma pour les entités (équipes et compétition)
export const CreateteamSchema = z.object({
  name: z.string().min(1, "Le nom de l'équipe est requis"),
  short_name: z.string().optional(),
  tla: z.string().min(1, "Le code TLA de l'équipe est requis"),
  crest_url: z.url().min(1, "URL du crest (Logo) requis"),
  country: z.string().min(1, "Le pays est requis"),
  api_id: z.number().int().optional(),
});

export const CreatecompetitionSchema = z.object({
  name: z.string().min(1, "Le nom de la compétition est requis"),
  code: z.string().optional(),
  emblem_url: z.url().min(1, "URL de l'emblem (Logo) requis"),
  country: z.string().min(1, "Le pays est requis"),
  api_id: z.number().int().optional(),
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
  home_score: z.number().int().min(0).optional(),
  away_score: z.number().int().min(0).optional(),
  is_featured: z.boolean().optional(),
  featured_name: z.string().optional(),
});

// Types générés depuis les schémas Zod
export type CreateMatchInput = z.infer<typeof createMatchSchema>;
export type UpdateMatchInput = z.infer<typeof updateMatchSchema>;