import { Prisma, prisma } from "../lib/prisma.ts";
import type { CreateMatchInput, UpdateMatchInput } from "../validations/match.validation.ts";

/**
 * Interface pour les entités optionnelles (team/competition) lors de la création d'un match
 */
interface OptionalTeam {
  name: string;
  short_name?: string | null;
  tla: string;
  crest_url: string;
  country: string;
  api_id?: number | null,
}

interface OptionalCompetition {
  name: string;
  code?: string | null;
  emblem_url: string;
  country: string;
  api_id?: number | null,
}

/**
 * Crée un match directement (pas d'upsert car id auto-généré)
 * Fonction interne (non exportée)
 */
async function createMatchInDb(
  matchData: CreateMatchInput,
  homeTeamId: string,
  awayTeamId: string,
  competitionId: string
) {
  const match = await prisma.match.create({
    data: {
      date: new Date(matchData.date),
      status: matchData.status ?? "SCHEDULED",
      home_score: matchData.home_score ?? null,
      away_score: matchData.away_score ?? null,
      home_team_id: homeTeamId,
      away_team_id: awayTeamId,
      competition_id: competitionId,
      is_featured: matchData.is_featured ?? false,
      featured_name: matchData.featured_name ?? null,
    },
    
    // On inclut les relations pour avoir les détails complets du match
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
 * Crée un match avec création/récupération automatique des équipes et compétition
 * Utile pour créer un match avec des données complètes depuis le body de la requête
 */
export async function createMatch(
  matchData: CreateMatchInput,
  homeTeam?: OptionalTeam,
  awayTeam?: OptionalTeam,
  competition?: OptionalCompetition
) {
  // Validation : au moins une équipe et une compétition doivent être fournies
  if (!homeTeam || !awayTeam || !competition) {
    throw new Error(
      "Les objets home_team, away_team et competition sont requis pour créer un match"
    );
  }

  // 1. Créer/récupérer la compétition
  const comp = await prisma.competition.upsert({
    where: { name: competition.name },
    create: {
      name: competition.name,
      code: competition.code ?? null,
      emblem_url: competition.emblem_url,
      country: competition.country,
      api_id: competition.api_id ?? null,
    },
    update: {
      // Optionnel : mettre à jour les infos si besoin
      ...(competition.code !== undefined && { code: competition.code }),

      ...(competition.emblem_url !== undefined && { emblem_url: competition.emblem_url }),
      
      ...(competition.country !== undefined && { country: competition.country}),
    },
  });

  // 2. Créer/récupérer équipe domicile
  const home = await prisma.team.upsert({
    where: { name: homeTeam.name },
    create: {
      name: homeTeam.name,
      short_name: homeTeam.short_name ?? null,
      tla: homeTeam.tla,
      crest_url: homeTeam.crest_url,
      country: homeTeam.country,
      api_id: homeTeam.api_id ?? null,
    },
    update: {
      // Optionnel : mettre à jour les infos si besoin
      ...(homeTeam.short_name !== undefined && {
        short_name: homeTeam.short_name }),

      ...(homeTeam.tla !== undefined && {
        tla: homeTeam.tla }),

      ...(homeTeam.crest_url !== undefined && { crest_url: homeTeam.crest_url }),

      ...(homeTeam.country !== undefined && {
        country: homeTeam.country }),
    },
  });

  // 3. Créer/récupérer équipe extérieure
  const away = await prisma.team.upsert({
    where: { name: awayTeam.name },
    create: {
      name: awayTeam.name,
      short_name: awayTeam.short_name ?? null,
      tla: awayTeam.tla,
      crest_url: awayTeam.crest_url,
      country: awayTeam.country,
      api_id: awayTeam.api_id ?? null,
    },
    update: {
      // Optionnel : mettre à jour les infos si besoin
      ...(awayTeam.name !== undefined && {
        name: awayTeam.name }),

      ...(awayTeam.short_name !== undefined && {
        short_name: awayTeam.short_name }),

      ...(awayTeam.tla !== undefined && {
        tla: awayTeam.tla }),

      ...(awayTeam.crest_url !== undefined && { crest_url: awayTeam.crest_url }),

      ...(awayTeam.country !== undefined && {
        country: awayTeam.country }),
    },
  });

  // 4. Créer le match avec les IDs récupérés
  return createMatchInDb(matchData, home.id, away.id, comp.id);
}


/**
 * Récupère tous les matchs avec filtres optionnels
 * Pagination intégrée avec page et limit
 */
export async function findAllMatches(
  page: number = 1,
  limit: number = 10,
  leagueCode?: string,
  teamSlug?: string,
  isHot: boolean = false
) {
  // Calcul du nombre d'éléments à sauter pour la pagination
  const skip = (page - 1) * limit;

  // Construction des conditions WHERE pour filtrer les matchs
  const whereConditions: any = {
    // Statuts des matchs à inclure (exclu les matchs terminés)
    status: {
      in: ["SCHEDULED", "TIMED", "IN_PLAY", "PAUSED"],
    },
    // Seulement les matchs futurs ou en cours
    date: {
      gte: new Date(),
    },
  };

  // Filtre par code de compétition si fourni
  if (leagueCode) {
    whereConditions.competition = {
      code: leagueCode,
    };
  }


  // Filtre par équipe (slug transformé en termes de recherche)
  if (teamSlug) {
    // On re-transforme le slug en nom (ex: "paris-saint-germain" -> "Paris Saint Germain")
    // On filtre les termes trop courts et "fc"
    // On utilise 'mode: insensitive' pour ignorer les majuscules/minuscules
    const searchTerms = teamSlug
      .split("-")
      .filter((term) => term.length > 2 && term.toLowerCase() !== "fc");

    whereConditions.OR = [
      {
        home_team: {
          AND: searchTerms.map((term) => ({
            name: { contains: term, mode: "insensitive" },
          })),
        },
      },
      {
        away_team: {
          AND: searchTerms.map((term) => ({
            name: { contains: term, mode: "insensitive" },
          })),
        },
      },
    ];
  }


  // Filtre pour les matchs "à l'affiche" (hot)
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
 * Met à jour un match existant
 * Utilise le type Prisma.MatchUpdateInput pour garantir la sécurité du typage
 * Filtre automatiquement les valeurs undefined
 */
export async function updateMatch(id: string, updateData: UpdateMatchInput) {

  // Construction de l'objet de mise à jour typé avec Prisma
  // Chaque champ n'est ajouté que s'il est défini (pas undefined)
  const dataToUpdate: Prisma.MatchUpdateInput = {
    ...(updateData.status !== undefined && { status: updateData.status }),
    ...(updateData.home_score !== undefined && { home_score: updateData.home_score }),
    ...(updateData.away_score !== undefined && { away_score: updateData.away_score }),
    ...(updateData.is_featured !== undefined && { is_featured: updateData.is_featured }),
    ...(updateData.featured_name !== undefined && { featured_name: updateData.featured_name }),
  };


  const updatedMatch = await prisma.match.update({
    where: { id },
    data: dataToUpdate,
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
 * Supprime un match de la base de données
 * ⚠️ Attention: cette action est irréversible
 */
export async function deleteMatch(id: string) {
  const deletedMatch = await prisma.match.delete({
    where: { id },
  });

  return deletedMatch;
}
