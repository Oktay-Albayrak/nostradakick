import axios from "axios";
import { prisma } from "../lib/prisma.ts";
import { MatchStatus } from "../../generated/prisma/client.ts";

const FOOTBALL_API_URL = "https://api.football-data.org/v4";
const TOKEN = process.env.FOOTBALL_DATA_API_TOKEN;

export async function syncMatchesForCompetition(competitionCode: string) {
  try {
    console.log(`🔄 Synchro lancée pour ${competitionCode}...`);

    const response = await axios.get(
      `${FOOTBALL_API_URL}/competitions/${competitionCode}/matches`,
      {
        headers: { "X-Auth-Token": TOKEN },
      }
    );

    // On extrait les données avec des noms clairs
    const matches = response.data.matches;
    const compData = response.data.competition;
    const areaName =
      response.data.area?.name || compData?.area?.name || "Unknown";

    // 1. Upsert de la compétition
    const dbCompetition = await prisma.competition.upsert({
      where: { api_id: compData.id },
      update: {
        name: compData.name,
        emblem_url: compData.emblem,
      },
      create: {
        api_id: compData.id,
        name: compData.name,
        code: compData.code,
        country: areaName,
        emblem_url: compData.emblem,
      },
    });

    for (const m of matches) {
      // 2. Upsert Équipe Domicile
      const homeTeam = await prisma.team.upsert({
        where: { api_id: m.homeTeam.id },
        update: { crest_url: m.homeTeam.crest },
        create: {
          api_id: m.homeTeam.id,
          name: m.homeTeam.name,
          tla: m.homeTeam.tla || "N/A",
          crest_url: m.homeTeam.crest || "",
          country: areaName, // On utilise le pays de la compétition par défaut
        },
      });

      // 3. Upsert Équipe Extérieur
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

      // 4. Upsert du Match
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
    console.log(`✅ ${matches.length} matchs synchronisés avec succès.`);
  } catch (error) {
    console.error("❌ Erreur de synchronisation détaillée:", error);
    throw error;
  }
}
