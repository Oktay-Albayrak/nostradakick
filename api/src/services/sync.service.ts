import axios from "axios";
import { prisma } from "../lib/prisma.ts";
import { MatchStatus } from "../../generated/prisma/client.ts";


const FOOTBALL_API_URL = "https://api.football-data.org/v4";
const TOKEN = process.env.FOOTBALL_DATA_API_TOKEN;

const LEAGUES_TO_SYNC = ["FL1", "PL", "CL", "BL1", "SA", "PD"];

/**
 * SYNCHRONISATION DES MATCHS (Parallèle possible)
 */
export async function syncAllMatches() {
  console.log(`\n⚽ Lancement synchro matchs : ${new Date().toISOString()}`);

  const promises = LEAGUES_TO_SYNC.map(async (leagueCode) => {
    try {
      const response = await axios.get(`${FOOTBALL_API_URL}/competitions/${leagueCode}/matches`, {
        headers: { "X-Auth-Token": TOKEN }
      });

      const { matches, competition } = response.data;

      const dbComp = await prisma.competition.upsert({
        where: 
        { 
          api_id: competition.id 
        },
        update: 
        { 
          name: competition.name, 
          emblem_url: competition.emblem 
        },
        create: 
        { 
          api_id: competition.id, 
          name: competition.name, 
          code: competition.code, 
          emblem_url: competition.emblem,
          country: competition.area?.name || "Unknown"
        }
      });

      // On traite les matchs de la ligue
      for (const m of matches) {
        if (!m.homeTeam?.id || !m.awayTeam?.id) continue;

        // Note: On crée l'équipe si elle n'existe pas, sans faire d'appel API supplémentaire
        const [homeTeam, awayTeam] = await Promise.all([
          prisma.team.upsert({
            where: 
            { 
              api_id: m.homeTeam.id 
            },
            update: 
            { 
              crest_url: m.homeTeam.crest 
            },
            create: { 
              api_id: m.homeTeam.id, 
              name: m.homeTeam.shortName, 
              tla: m.homeTeam.tla || "N/A", 
              crest_url: m.homeTeam.crest || "", 
              country: "Unknown" 
            }
          }),
          prisma.team.upsert({
            where: 
            { 
              api_id: m.awayTeam.id 
            },
            update: 
            { 
              crest_url: m.awayTeam.crest 
            },
            create: 
            { 
              api_id: m.awayTeam.id, 
              name: m.awayTeam.shortName, 
              tla: m.awayTeam.tla || "N/A", 
              crest_url: m.awayTeam.crest || "", 
              country: "Unknown" 
            }
          })
        ]);

        await prisma.match.upsert({
          where: 
          { 
            api_id: m.id 
          },
          update: 
          {
            status: m.status as MatchStatus,
            home_score: m.score?.fullTime?.home ?? null,
            away_score: m.score?.fullTime?.away ?? null,
            date: new Date(m.utcDate),
          },
          create:
          {
            api_id: m.id,
            date: new Date(m.utcDate),
            status: m.status as MatchStatus,
            home_team_id: homeTeam.id,
            away_team_id: awayTeam.id,
            competition_id: dbComp.id,
            home_score: m.score?.fullTime?.home ?? null,
            away_score: m.score?.fullTime?.away ?? null,
          }
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
      const response = await axios.get(`${FOOTBALL_API_URL}/competitions/${leagueCode}/teams`, {
        headers: { "X-Auth-Token": TOKEN }
      });

      const { competition, teams } = response.data;

      // 🔍 L'API renvoie le pays dans competition.area.name
      const countryName = competition.area?.name || "Unknown";


      // 1. Mise à jour de la Compétition avec son pays
      const dbComp = await prisma.competition.upsert({
        where: 
        { 
          api_id: competition.id 
        },
        update: 
        { 
          name: competition.name,
          emblem_url: competition.emblem,
          country: countryName
        },
        create: { 
          api_id: competition.id, 
          name: competition.name, 
          code: competition.code, 
          emblem_url: competition.emblem, 
          country: countryName
        }
      });

      // 2. Mise à jour des équipes et de leur pays (via team.area.name)
      for (const team of teams) {
        const teamCountry = team.area?.name || "Unknown";

        const dbTeam = await prisma.team.upsert({
          where: 
          { 
            api_id: team.id 
          },
          update: 
          { 
            country: teamCountry, 
            crest_url: team.crest 
          },
          create: 
          { 
            api_id: team.id, 
            name: team.shortName, 
            tla: team.tla || "N/A", 
            crest_url: team.crest || "", 
            country: teamCountry
          }
        });

        // 3. Relation Competition <-> Team
        await prisma.competitionTeam.upsert({
          where: { 
            team_id_competition_id: { 
              team_id: dbTeam.id, 
              competition_id: dbComp.id 
            } 
          },
          update: {},
          create: { 
            team_id: dbTeam.id, 
            competition_id: dbComp.id 
          }
        });
      }
      console.log(`✅ ${leagueCode} Pays enregistré : ${countryName}`);
    } catch (error: any) {
      console.error(`❌ Erreur ${leagueCode}:`, error.response?.data?.message || error.message);
    }
  });

  await Promise.all(promises);
}



/**
 * 🌍 FONCTION : Met à jour uniquement le PAYS et l'EMBLÈME des compétitions
 * Appelée 4 minutes après le démarrage, puis 1 fois par an.
 */
export async function syncCompetitionsMetadata() {
  console.log(`\n🏆 Maj des pays des compétitions : ${new Date().toISOString()}`);

  const promises = LEAGUES_TO_SYNC.map(async (leagueCode) => {
    try {
      const response = await axios.get(`${FOOTBALL_API_URL}/competitions/${leagueCode}`, {
        headers: { "X-Auth-Token": TOKEN }
      });

      const comp = response.data;
      
      await prisma.competition.upsert({
        where: { api_id: comp.id },
        update: { 
          country: comp.area?.name || "Unknown",
          emblem_url: comp.emblem 
        },
        create: { 
          api_id: comp.id, 
          name: comp.name, 
          code: comp.code, 
          country: comp.area?.name || "Unknown",
          emblem_url: comp.emblem 
        }
      });
      console.log(`✅ [${leagueCode}] Pays mis à jour: ${comp.area?.name}`);
    } catch (error: any) {
      console.error(`❌ [${leagueCode}] Erreur Metadata:`, error.message);
    }
  });

  await Promise.all(promises);
}