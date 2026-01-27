import { Prisma, prisma } from "../lib/prisma.ts";
import type {
  CreateMatchInput,
  UpdateMatchInput,
} from "../validations/match.validation.ts";

/**
 * Crée ou met à jour un match (upsert) basé sur l'id
 * Si le match existe déjà (même id), il sera mis à jour
 * Sinon, un nouveau match sera créé
 */
export async function createMatch(createData: CreateMatchInput) {
  const match = await prisma.match.upsert({
    // Recherche le match par son id
    where: { id: createData.id },

    // Si le match n'existe pas, on le crée avec toutes les données
    create: {
      id: createData.id,
      api_id: createData.api_id, // à supprimer après mise à jour bdd
      date: new Date(createData.date),
      status: createData.status ?? "SCHEDULED",
      home_score: createData.home_score ?? null,
      away_score: createData.away_score ?? null,
      home_team_id: createData.home_team_id,
      away_team_id: createData.away_team_id,
      competition_id: createData.competition_id,
      venue: createData.venue ?? null,
      is_featured: createData.is_featured ?? false,
      featured_name: createData.featured_name ?? null,
    },

    // Si le match existe déjà, on le met à jour avec les nouvelles données
    // L'opérateur ?? remplace undefined par une valeur par défaut
    update: {
      date: new Date(createData.date),
      status: createData.status ?? "SCHEDULED",
      home_score: createData.home_score ?? null,
      away_score: createData.away_score ?? null,
      venue: createData.venue ?? null,
      is_featured: createData.is_featured ?? false,
      featured_name: createData.featured_name ?? null,
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
 * Récupère tous les matchs avec filtres optionnels
 * Pagination intégrée avec page et limit
 */
export async function findAllMatches(
  page: number = 1,
  limit: number = 10,
  leagueCode?: string,
  teamSlug?: string,
  isHot: boolean = false,
  date?: string,
  status?: string, // Paramètre ajouté pour basculer entre passé/futur
) {
  // Calcul du nombre d'éléments à sauter pour la pagination
  const skip = (page - 1) * limit;

  // Initialisation des conditions WHERE
  const whereConditions: any = {};

  /**
   * 1. GESTION DU FILTRE TEMPOREL (HIÉRARCHIE)
   */
  if (date) {
    // PRIORITÉ MAX : Sélection d'un jour précis (Pastilles ou Calendrier)
    // On affiche uniquement les matchs de ce jour-là
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    whereConditions.date = {
      gte: startOfDay,
      lte: endOfDay,
    };
    // Pas de filtre de status ici pour voir les scores finis et les éventuels reports du jour
  } else if (status === "past") {
    // PRIORITÉ 2 : Mode "Résultats/Archives" sans date fixe (Bouton sidebar ou mobile)
    // On veut remonter le temps indéfiniment au scroll
    whereConditions.date = {
      lt: new Date(), // Tout ce qui est avant l'instant T
    };
    whereConditions.status = {
      in: ["FINISHED", "AWARDED"],
    };
  } else {
    // MODE PAR DÉFAUT : Prochains matchs (Futur)
    whereConditions.date = {
      gte: new Date(),
    };
    whereConditions.status = {
      in: ["SCHEDULED", "TIMED", "IN_PLAY", "PAUSED"],
    };
  }

  /**
   * 2. FILTRES DE CONTENU (COMPÉTITION, ÉQUIPE, HOT)
   */
  if (leagueCode) {
    whereConditions.competition = { code: leagueCode };
  }

  if (teamSlug) {
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

  if (isHot) {
    whereConditions.is_featured = true;
  }

  /**
   * 3. EXÉCUTION ET TRI
   */
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
      // Si on est dans le passé (date ou status), on veut le plus récent en premier
      date: status === "past" || date ? "desc" : "asc",
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
 * Met à jour un match existant
 * Utilise le type Prisma.MatchUpdateInput pour garantir la sécurité du typage
 * Filtre automatiquement les valeurs undefined
 */
export async function updateMatch(id: string, updateData: UpdateMatchInput) {
  // Construction de l'objet de mise à jour typé avec Prisma
  // Chaque champ n'est ajouté que s'il est défini (pas undefined)
  const dataToUpdate: Prisma.MatchUpdateInput = {
    ...(updateData.status !== undefined && { status: updateData.status }),
    ...(updateData.home_score !== undefined && {
      home_score: updateData.home_score,
    }),
    ...(updateData.away_score !== undefined && {
      away_score: updateData.away_score,
    }),
    ...(updateData.venue !== undefined && { venue: updateData.venue }),
    ...(updateData.is_featured !== undefined && {
      is_featured: updateData.is_featured,
    }),
    ...(updateData.featured_name !== undefined && {
      featured_name: updateData.featured_name,
    }),
    ...(updateData.popularity !== undefined && {
      popularity: updateData.popularity,
    }),
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
