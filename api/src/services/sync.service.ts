import axios from "axios";
import { prisma } from "../lib/prisma.ts";
import { MatchStatus } from "../../generated/prisma/client.ts";


const FOOTBALL_API_URL = "https://api.football-data.org/v4";
const TOKEN = process.env.FOOTBALL_DATA_API_TOKEN;



// Liste des codes de compétitions autorisés par le plan gratuit (Free Tier)
const LEAGUES_TO_SYNC = ["FL1", "PL", "CL", "BL1", "SA", "PD"];



/**
 * 🎯 FONCTION 1 : Synchronise les MATCHS de toutes les ligues EN PARALLÈLE (via la fonction syncMatchesForCompetition)
 * Utilisé par le cron toutes les 15 minutes
 * ⚡ Rapide : ~4-6 secondes (6 appels API en parallèle)
 */

export async function syncAllMatches() {
  console.log(`\n⚽ Début de la synchronisation des MATCHS à ${new Date().toLocaleString('fr-FR')}`);
  console.log(`📋 Ligues: ${LEAGUES_TO_SYNC.join(', ')}\n`);

  // Lancer TOUTES les synchronisations EN MÊME TEMPS
  const promisesSyncMatches = LEAGUES_TO_SYNC.map(async (leagueCode) => {
    try {
      console.log(`🕒 [${leagueCode}] Démarrage...`);

      await syncMatchesForCompetition(leagueCode);
      
      console.log(`✅ [${leagueCode}] Terminé`);
      return { leagueCode, status: 'success' };

    } catch (error) {
      console.error(`❌ [${leagueCode}] Erreur:`, error);

      return { leagueCode, status: 'error', error };
    }
  });

  const results = await Promise.all(promisesSyncMatches);

  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;

  console.log(`\n🏁 Synchronisation des matchs terminée`);
  console.log(`📊 Résultats: ${successCount} succès, ${errorCount} erreurs\n`);
}



/**
 * 🌍 FONCTION 2 : Synchronise les infos des COMPÉTITIONS (pays, emblèmes, etc.)
 * Utilisé par le cron 1 fois par mois pour mettre à jour les métadonnées
 * 🐢 Moins urgent car les infos changent rarement
 */

export async function syncAllCompetitions() {
  console.log(`\n🌍 Début de la synchronisation des COMPÉTITIONS à ${new Date().toLocaleString('fr-FR')}`);
  console.log(`📋 Ligues: ${LEAGUES_TO_SYNC.join(', ')}\n`);

  const promisesSyncCompetitions = LEAGUES_TO_SYNC.map(async (leagueCode) => {
    try {
      console.log(`🕒 [${leagueCode}] Mise à jour des infos...`);
      
      if (!TOKEN) {
        throw new Error("Token API manquant");
      }

      // Récupérer les infos de la compétition
      const response = await axios.get(
        `${FOOTBALL_API_URL}/competitions/${leagueCode}`,
        { headers: { "X-Auth-Token": TOKEN } }
      );

      const comp = response.data;
      const areaName = comp.area?.name || "Unknown";

      // Mettre à jour ou créer UNIQUEMENT la compétition (pas les matchs)
      await prisma.competition.upsert({
        where: { api_id: comp.id },
        update: {
          name: comp.name,
          emblem_url: comp.emblem,
          country: areaName,
        },
        create: {
          api_id: comp.id,
          name: comp.name,
          code: comp.code,
          country: areaName,
          emblem_url: comp.emblem,
        },
      });

      console.log(`✅ [${leagueCode}] Infos mises à jour (pays: ${areaName})`);

      return { leagueCode, status: 'success' };

      
    } catch (error) {
      console.error(`❌ [${leagueCode}] Erreur:`, error);

      return { leagueCode, status: 'error', error };
    }
  });

  const results = await Promise.all(promisesSyncCompetitions);

  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;

  console.log(`\n🏁 Synchronisation des compétitions terminée`);
  console.log(`📊 Résultats: ${successCount} succès, ${errorCount} erreurs\n`);
}



/**
 * 📝 Synchronise les matchs d'UNE SEULE compétition
 * Appelé par syncAllMatches() pour chaque ligue en parallèle
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
