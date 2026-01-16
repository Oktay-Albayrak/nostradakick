import axios from "axios";
import { prisma } from "../lib/prisma.ts";
import { MatchStatus } from "../../generated/prisma/client.ts";

const FOOTBALL_API_URL = "https://api.football-data.org/v4";
const TOKEN = process.env.FOOTBALL_DATA_API_TOKEN;

// Liste des codes de compétitions autorisés par le plan gratuit (Free Tier)
const LEAGUES_TO_SYNC = ["FL1", "PL", "CL", "BL1", "SA", "PD"];

/**
 * Fonction principale pour synchroniser toutes les ligues définies ci-dessus
 */
export async function syncAllCompetitions() {
  console.log("🚀 Début de la synchronisation globale...");

  for (const code of LEAGUES_TO_SYNC) {
    try {
      // On lance la synchro pour une ligue précise
      await syncMatchesForCompetition(code);

      // Pause de 6 secondes pour ne pas dépasser 10 requêtes / minute (limite API Free), on risque de se faire bloquer si on lance 6 requetes d'un coup
      console.log(`⏳ Pause de 6s pour respecter le quota API...`);
      await new Promise((resolve) => setTimeout(resolve, 6000));
    } catch (error) {
      console.error(
        `⚠️ Échec de la synchronisation pour la ligue ${code}, passage à la suivante.`
      );
    }
  }

  console.log("🏁 Toutes les compétitions sélectionnées ont été traitées !");
}

/**
 * Fonction de synchronisation pour une seule compétition
 */
export async function syncMatchesForCompetition(competitionCode: string) {
  try {
    console.log(`🔄 Synchro lancée pour ${competitionCode}...`);

    if (!TOKEN) {
      throw new Error(
        "Le Token API Football-Data est manquant dans le fichier .env"
      );
    }

    const response = await axios.get(
      `${FOOTBALL_API_URL}/competitions/${competitionCode}/matches`,
      {
        headers: { "X-Auth-Token": TOKEN },
      }
    );

    const matches = response.data.matches;
    const competitionData = response.data.competition;
    // On sécurise la récupération du pays (area)
    const areaName =
      response.data.area?.name || competitionData?.area?.name || "Unknown";

    // 1. Mise à jour ou Création de la compétition
    const dbCompetition = await prisma.competition.upsert({
      where: { api_id: competitionData.id },
      update: {
        name: competitionData.name,
        emblem_url: competitionData.emblem,
      },
      create: {
        api_id: competitionData.id,
        name: competitionData.name,
        code: competitionData.code,
        country: areaName,
        emblem_url: competitionData.emblem,
      },
    });

    for (const m of matches) {
      // 🛡️ SÉCURITÉ : Si une équipe n'est pas encore définie (cas fréquent en CL)
      if (!m.homeTeam?.id || !m.awayTeam?.id) {
        console.log(
          `⏭️ Match sauté (équipes non définies) : ${
            m.homeTeam?.name || "TBD"
          } vs ${m.awayTeam?.name || "TBD"}`
        );
        continue; // On passe au match suivant
      }
      // 2. Mise à jour ou Création Équipe Domicile
      const homeTeam = await prisma.team.upsert({
        where: { api_id: m.homeTeam.id },
        update: { crest_url: m.homeTeam.crest },
        create: {
          api_id: m.homeTeam.id,
          name: m.homeTeam.name,
          tla: m.homeTeam.tla || "N/A",
          crest_url: m.homeTeam.crest || "",
          country: areaName,
        },
      });

      // 3. Mise à jour ou Création Équipe Extérieur
      const awayTeam = await prisma.team.upsert({
        where: { api_id: m.awayTeam.id },
        update: { crest_url: m.awayTeam.crest },
        create: {
          api_id: m.awayTeam.id,
          name: m.awayTeam.name,
          tla: m.awayTeam.tla || "N/A",
          crest_url: m.awayTeam.crest || "",
          country: areaName,
        },
      });

      // 4. Mise à jour ou Création du Match
      await prisma.match.upsert({
        where: { api_id: m.id },
        update: {
          status: m.status as MatchStatus,
          home_score: m.score?.fullTime?.home ?? null,
          away_score: m.score?.fullTime?.away ?? null,
          date: new Date(m.utcDate),
        },
        create: {
          api_id: m.id,
          date: new Date(m.utcDate),
          status: m.status as MatchStatus,
          home_team_id: homeTeam.id,
          away_team_id: awayTeam.id,
          competition_id: dbCompetition.id,
          home_score: m.score?.fullTime?.home ?? null,
          away_score: m.score?.fullTime?.away ?? null,
        },
      });
    }
    console.log(
      `✅ ${matches.length} matchs synchronisés pour ${competitionCode}.`
    );
  } catch (error: any) {
    console.error(
      `❌ Erreur de synchronisation (${competitionCode}):`,
      error.response?.data?.message || error.message
    );
    throw error;
  }
}
