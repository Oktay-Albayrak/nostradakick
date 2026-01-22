import axios from "axios";
import { prisma } from "../lib/prisma.ts";
import { MatchStatus } from "../../generated/prisma/client.ts";
import { COMPETITION_NAMES_MAP } from "../config/metadata.ts";
import { getMatchHotStatus } from "./feature-logic.service.ts";

const FOOTBALL_API_URL = "https://api.football-data.org/v4";
const TOKEN = process.env.FOOTBALL_DATA_API_TOKEN;

const LEAGUES_TO_SYNC = ["FL1", "PL", "CL", "BL1", "SA", "PD"];

/**
 * FONCTION : Synchronisation des classements
 * Essentielle pour que globalTop5 puisse fonctionner dans syncAllMatches
 */
export async function syncStandings() {
  console.log("📊 Début de la synchro des classements...");
  for (const leagueCode of LEAGUES_TO_SYNC) {
    if (leagueCode === "CL") continue;
    try {
      const response = await axios.get(
        `${FOOTBALL_API_URL}/competitions/${leagueCode}/standings`,
        {
          headers: { "X-Auth-Token": TOKEN },
        },
      );
      const compApiId = response.data.competition.id;
      const table = response.data.standings[0].table;
      const dbComp = await prisma.competition.findUnique({
        where: { api_id: compApiId },
      });
      if (!dbComp) continue;

      for (const row of table) {
        const team = await prisma.team.upsert({
          where: { api_id: row.team.id },
          update: { short_name: row.team.shortName, crest_url: row.team.crest },
          create: {
            api_id: row.team.id,
            name: row.team.name,
            short_name: row.team.shortName,
            tla: row.team.tla || "N/A",
            crest_url: row.team.crest || "",
            country: dbComp.country,
          },
        });

        await prisma.standing.upsert({
          where: {
            team_id_competition_id: {
              team_id: team.id,
              competition_id: dbComp.id,
            },
          },
          update: { rank: row.position },
          create: {
            rank: row.position,
            team_id: team.id,
            competition_id: dbComp.id,
          },
        });

        await prisma.competitionTeam.upsert({
          where: {
            team_id_competition_id: {
              team_id: team.id,
              competition_id: dbComp.id,
            },
          },
          update: {},
          create: { team_id: team.id, competition_id: dbComp.id },
        });
      }
      console.log(`✅ Standings mis à jour pour ${leagueCode}`);

      // petite pause de 1 sec entre chaque ligue pour être safe
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (e) {
      console.error(`❌ Erreur standings ${leagueCode}`);
    }
  }
}

/**
 * SYNCHRONISATION DES MATCHS (Parallèle possible)
 */
export async function syncAllMatches() {
  console.log(`\n⚽ Lancement synchro matchs : ${new Date().toISOString()}`);

  // LOGIQUE : Récupérer les IDs Top 5 pour calculer les matchs "Hot"
  const standings = await prisma.standing.findMany({
    where: { rank: { lte: 5 } },
    select: { team: { select: { api_id: true } } },
  });
  const globalTop5 = new Set(standings.map((s) => s.team.api_id));

  const promises = LEAGUES_TO_SYNC.map(async (leagueCode) => {
    try {
      const response = await axios.get(
        `${FOOTBALL_API_URL}/competitions/${leagueCode}/matches`,
        {
          headers: { "X-Auth-Token": TOKEN },
        },
      );

      const { matches, competition } = response.data;
      const displayName = COMPETITION_NAMES_MAP[leagueCode] || competition.name;

      const dbComp = await prisma.competition.upsert({
        where: {
          api_id: competition.id,
        },
        update: {
          name: displayName,
          emblem_url: competition.emblem,
        },
        create: {
          api_id: competition.id,
          name: displayName,
          code: competition.code,
          emblem_url: competition.emblem,
          country: competition.area?.name || "Unknown",
        },
      });

      // On traite les matchs de la ligue
      for (const m of matches) {
        if (!m.homeTeam?.id || !m.awayTeam?.id) continue;

        // LOGIQUE : Calcul du statut "Hot"
        const { isHot, name: hotName } = getMatchHotStatus(m, globalTop5);

        // Note: On crée l'équipe si elle n'existe pas, sans faire d'appel API supplémentaire
        const [homeTeam, awayTeam] = await Promise.all([
          prisma.team.upsert({
            where: {
              api_id: m.homeTeam.id,
            },
            update: {
              crest_url: m.homeTeam.crest,
              short_name: m.homeTeam.shortName,
            },
            create: {
              api_id: m.homeTeam.id,
              name: m.homeTeam.name,
              short_name: m.homeTeam.shortName,
              tla: m.homeTeam.tla || "N/A",
              crest_url: m.homeTeam.crest || "",
              country: "Unknown",
            },
          }),
          prisma.team.upsert({
            where: {
              api_id: m.awayTeam.id,
            },
            update: {
              crest_url: m.awayTeam.crest,
              short_name: m.awayTeam.shortName,
            },
            create: {
              api_id: m.awayTeam.id,
              name: m.awayTeam.name,
              short_name: m.awayTeam.shortName,
              tla: m.awayTeam.tla || "N/A",
              crest_url: m.awayTeam.crest || "",
              country: "Unknown",
            },
          }),
        ]);

        await prisma.match.upsert({
          where: {
            api_id: m.id,
          },
          update: {
            status: m.status as MatchStatus,
            is_featured: isHot,
            featured_name: hotName,
            home_score: m.score?.fullTime?.home ?? null,
            away_score: m.score?.fullTime?.away ?? null,
            date: new Date(m.utcDate),
          },
          create: {
            api_id: m.id,
            date: new Date(m.utcDate),
            status: m.status as MatchStatus,
            is_featured: isHot,
            featured_name: hotName,
            home_team_id: homeTeam.id,
            away_team_id: awayTeam.id,
            competition_id: dbComp.id,
            home_score: m.score?.fullTime?.home ?? null,
            away_score: m.score?.fullTime?.away ?? null,
          },
        });
      }
      return leagueCode;
    } catch (error: any) {
      console.error(`❌ Erreur ${leagueCode}:`, error.message);
    }
  });

  await Promise.all(promises);
  console.log("🏁 Fin de synchro des matchs.");
}

/**
 * 🌍 SYNCHRO COMPÉTITIONS + ÉQUIPES + PAYS + RELATIONS
 * Cette fonction règle ton problème de "Country" pour tout le monde en 6 requêtes.
 */
export async function syncAllCompetitions() {
  console.log(`\n🌍 Maj des Compétitions et Pays...`);

  // On lance en parallèle pour les 6 ligues (6 requêtes < 10)
  const promises = LEAGUES_TO_SYNC.map(async (leagueCode) => {
    try {
      // On récupère les équipes, ce qui nous donne aussi les infos de la compétition
      const response = await axios.get(
        `${FOOTBALL_API_URL}/competitions/${leagueCode}/teams`,
        {
          headers: { "X-Auth-Token": TOKEN },
        },
      );

      const { competition, teams } = response.data;

      // LOGIQUE : Nom propre via mapping
      const displayName = COMPETITION_NAMES_MAP[leagueCode] || competition.name;

      // 🔍 L'API renvoie le pays dans competition.area.name
      const countryName = competition.area?.name || "Unknown";

      // 1. Mise à jour de la Compétition avec son pays
      const dbComp = await prisma.competition.upsert({
        where: {
          api_id: competition.id,
        },
        update: {
          name: displayName,
          emblem_url: competition.emblem,
          country: countryName,
        },
        create: {
          api_id: competition.id,
          name: displayName,
          code: competition.code,
          emblem_url: competition.emblem,
          country: countryName,
        },
      });

      // 2. Mise à jour des équipes et de leur pays (via team.area.name)
      for (const team of teams) {
        const teamCountry = team.area?.name || "Unknown";

        const dbTeam = await prisma.team.upsert({
          where: {
            api_id: team.id,
          },
          update: {
            country: teamCountry,
            crest_url: team.crest,
            short_name: team.shortName,
          },
          create: {
            api_id: team.id,
            name: team.shortName,
            short_name: team.shortName,
            tla: team.tla || "N/A",
            crest_url: team.crest || "",
            country: teamCountry,
          },
        });

        // 3. Relation Competition <-> Team
        await prisma.competitionTeam.upsert({
          where: {
            team_id_competition_id: {
              team_id: dbTeam.id,
              competition_id: dbComp.id,
            },
          },
          update: {},
          create: {
            team_id: dbTeam.id,
            competition_id: dbComp.id,
          },
        });
      }
      console.log(`✅ ${leagueCode} Pays enregistré : ${countryName}`);
    } catch (error: any) {
      console.error(
        `❌ Erreur ${leagueCode}:`,
        error.response?.data?.message || error.message,
      );
    }
  });

  await Promise.all(promises);
}

/**
 * 🌍 FONCTION : Met à jour uniquement le PAYS et l'EMBLÈME des compétitions
 * Appelée 4 minutes après le démarrage, puis 1 fois par an.
 */
export async function syncCompetitionsMetadata() {
  console.log(
    `\n🏆 Maj des pays des compétitions : ${new Date().toISOString()}`,
  );

  const promises = LEAGUES_TO_SYNC.map(async (leagueCode) => {
    try {
      const response = await axios.get(
        `${FOOTBALL_API_URL}/competitions/${leagueCode}`,
        {
          headers: { "X-Auth-Token": TOKEN },
        },
      );

      const comp = response.data;
      const displayName = COMPETITION_NAMES_MAP[leagueCode] || comp.name;

      await prisma.competition.upsert({
        where: { api_id: comp.id },
        update: {
          name: displayName,
          country: comp.area?.name || "Unknown",
          emblem_url: comp.emblem,
        },
        create: {
          api_id: comp.id,
          name: displayName,
          code: comp.code,
          country: comp.area?.name || "Unknown",
          emblem_url: comp.emblem,
        },
      });
      console.log(`✅ [${leagueCode}] Pays mis à jour: ${comp.area?.name}`);
    } catch (error: any) {
      console.error(`❌ [${leagueCode}] Erreur Metadata:`, error.message);
    }
  });

  await Promise.all(promises);
}
