import axios from "axios";
import { PrismaClient } from "../../generated/prisma/client";

const prisma = new PrismaClient();

export async function syncFootballData() {
  const TOKEN = process.env.FOOTBALL_DATA_API_TOKEN;

  // On récupère les matchs d'une compétition spécifique (ex: PL pour Premier League)
  const response = await axios.get(
    "https://api.football-data.org/v4/competitions/PL/matches",
    {
      headers: { "X-Auth-Token": TOKEN },
    }
  );

  const remoteMatches = response.data.matches;

  for (const match of remoteMatches) {
    // On utilise l'id de l'API pour ne pas créer de doublons
    await prisma.match.upsert({
      where: { api_id: match.id },
      update: {
        status: match.status,
        home_score: match.score.fullTime.home,
        away_score: match.score.fullTime.away,
      },
      create: {
        api_id: match.id,
        date: new Date(match.utcDate),
        status: match.status,
        // Ici il faudra s'assurer que les teams existent déjà ou les créer aussi via upsert
        home_team: { connect: { api_id: match.homeTeam.id } },
        away_team: { connect: { api_id: match.awayTeam.id } },
        competition: { connect: { api_id: response.data.competition.id } },
      },
    });
  }
}
