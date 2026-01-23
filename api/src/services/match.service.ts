import { prisma } from "../lib/prisma.ts";
import type { CreateMatchInput, UpdateMatchInput } from "../validations/match.validation.ts";

/**
 * Crée ou met à jour un match (upsert) basé sur l'api_id
 */
export async function createMatch(createData: CreateMatchInput) {
  const match = await prisma.match.upsert({
    where: { id: createData.id },
    create: {
      id: createData.id,
      api_id: createData.api_id,  // à supprimer après mise à jour bdd
      date: new Date(createData.date),
      status: createData.status || "SCHEDULED",
      home_score: createData.home_score || null,
      away_score: createData.away_score || null,
      home_team_id: createData.home_team_id,
      away_team_id: createData.away_team_id,
      competition_id: createData.competition_id,
      is_featured: createData.is_featured || false,
      featured_name: createData.featured_name || null,
    },
    update: {
      date: new Date(createData.date),
      status: createData.status ?? "SCHEDULED",
      home_score: createData.home_score ?? null,
      away_score: createData.away_score ?? null,
      is_featured: createData.is_featured ?? false,
      featured_name: createData.featured_name ?? null,
    },
    include: {
      home_team: true,
      away_team: true,
      competition: true,
      predictions: true,
    },
  });

  return match;
}

/**
 * Récupère tous les matchs avec filtres optionnels
 */
export async function findAllMatches(
  page: number = 1,
  limit: number = 10,
  leagueCode?: string,
  isHot: boolean = false
) {
  const skip = (page - 1) * limit;

  const whereConditions: any = {
    status: {
      in: ["SCHEDULED", "TIMED", "IN_PLAY", "PAUSED"],
    },
    date: {
      gte: new Date(),
    },
  };

  if (leagueCode) {
    whereConditions.competition = {
      code: leagueCode,
    };
  }

  if (isHot) {
    whereConditions.is_featured = true;
  }

  const matches = await prisma.match.findMany({
    where: whereConditions,
    take: limit,
    skip: skip,
    include: {
      home_team: true,
      away_team: true,
      competition: true,
    },
    orderBy: {
      date: "asc", // Les plus proches en premier
    },
  });

  return matches;
}

/**
 * Récupère un match par son api_id
 */
export async function findMatchByApiId(api_id: number) {
  const match = await prisma.match.findUnique({
    where: { api_id },
    include: {
      home_team: true,
      away_team: true,
      competition: true,
      predictions: true,
    },
  });

  return match;
}

/**
 * Récupère un match par son UUID
 */
export async function findMatchById(id: string) {
  const match = await prisma.match.findUnique({
    where: { id },
    include: {
      home_team: true,
      away_team: true,
      competition: true,
      predictions: true,
    },
  });

  return match;
}

/**
 * Met à jour un match
 */
export async function updateMatch(id: string, updateData: UpdateMatchInput) {
  const updatedMatch = await prisma.match.update({
    where: { id },
    data: updateData as any,
    include: {
      home_team: true,
      away_team: true,
      competition: true,
      predictions: true,
    },
  });

  return updatedMatch;
}

/**
 * Supprime un match
 */
export async function deleteMatch(id: string) {
  const deletedMatch = await prisma.match.delete({
    where: { id },
  });

  return deletedMatch;
}
