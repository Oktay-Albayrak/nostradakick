import { z } from "zod";

export const createMatchSchema = z.object({
  id: z.uuid(),
  api_id: z.number().int(), // à supprimer après mise à jour de la bdd
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
  home_team_id: z.uuid(),
  away_team_id: z.uuid(),
  competition_id: z.uuid(),
  is_featured: z.boolean().default(false),
  featured_name: z.string().optional(),
});

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
  popularity: z.number().int().min(0).optional(),
});

export type CreateMatchInput = z.infer<typeof createMatchSchema>;
export type UpdateMatchInput = z.infer<typeof updateMatchSchema>;