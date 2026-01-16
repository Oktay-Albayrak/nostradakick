import {
  PrismaClient,
  UserRole,
  MatchStatus,
  PredictionValue,
  PredictionStatus,
} from "../generated/prisma/client.ts";

import { prisma } from "../src/lib/prisma.ts";


/**
 * Génère un UUID déterministe basé sur un préfixe et un index
 * Exemple : generateFixedUuid('user', 1) -> '00000000-0000-0000-0000-000000000001'
 */
function generateFixedUuid(type: 'user' | 'comp' | 'team' | 'match' | 'pred', index: number): string {
  const prefixes = { user: '1', comp: '2', team: '3', match: '4', pred: '5' };
  const hexIndex = index.toString(16).padStart(12, '0');
  return `00000000-${prefixes[type]}000-4000-9000-${hexIndex}`;
}

// --- DONNÉES DE CONFIGURATION ---
const COMPETITIONS = [
  {
    id: '10000000-0000-4000-9000-000000000001',
    api_id: 2001,
    name: 'Champions League',
    code: 'CL',
    country: 'Europe',
    emblem_url: 'https://crests.football-data.org/CL.png',
  },
  {
    id: '10000000-0000-4000-9000-000000000002',
    api_id: 2015,
    name: 'Ligue 1',
    code: 'FL1',
    country: 'France',
    emblem_url: 'https://crests.football-data.org/L1.png',
  },
  {
    id: '10000000-0000-4000-9000-000000000003',
    api_id: 2021,
    name: 'Premier League',
    code: 'PL',
    country: 'England',
    emblem_url: 'https://crests.football-data.org/PL.png',
  },
  {
    id: '10000000-0000-4000-9000-000000000004',
    api_id: 2014,
    name: 'La Liga',
    code: 'PD',
    country: 'Spain',
    emblem_url: 'https://crests.football-data.org/PD.png',
  },
];

const TEAMS = [
  { id: '20000000-0000-4000-9000-000000000001', api_id: 524, name: 'Paris Saint-Germain', tla: 'PSG', country: 'France' },
  { id: '20000000-0000-4000-9000-000000000002', api_id: 516, name: 'Marseille', tla: 'OM', country: 'France' },
  { id: '20000000-0000-4000-9000-000000000003', api_id: 64, name: 'Liverpool FC', tla: 'LIV', country: 'England' },
  { id: '20000000-0000-4000-9000-000000000004', api_id: 65, name: 'Manchester City', tla: 'MCI', country: 'England' },
  { id: '20000000-0000-4000-9000-000000000005', api_id: 86, name: 'Real Madrid CF', tla: 'RMA', country: 'Spain' },
  { id: '20000000-0000-4000-9000-000000000006', api_id: 81, name: 'FC Barcelona', tla: 'FCB', country: 'Spain' },
  { id: '20000000-0000-4000-9000-000000000007', api_id: 5, name: 'FC Bayern München', tla: 'FCB', country: 'Germany' },
  { id: '20000000-0000-4000-9000-000000000008', api_id: 4, name: 'Borussia Dortmund', tla: 'BVB', country: 'Germany' },
];

async function main() {
  console.log("🚀 Début du seeding massif...");

  // 1. Nettoyage complet
  await prisma.prediction.deleteMany();
  await prisma.match.deleteMany();
  await prisma.competitionTeam.deleteMany();
  await prisma.team.deleteMany();
  await prisma.competition.deleteMany();
  await prisma.userStat.deleteMany();
  await prisma.user.deleteMany();

  // 2. Utilisateurs (Admin + 10 membres)
  console.log("👥 Création des utilisateurs...");
  const users = [];
  for (let i = 1; i <= 10; i++) {
    const userId = generateFixedUuid('user', i);
    const user = await prisma.user.create({
      data: {
        id: userId,
        username: `user_${i}`,
        email: `user${i}@example.com`,
        password_hash: "fake_hash",
        role: i === 1 ? UserRole.ADMIN : UserRole.MEMBER,
        stats: {
          create: {
            wins_count: Math.floor(Math.random() * 20),
            losses_count: Math.floor(Math.random() * 20),
            best_streak: Math.floor(Math.random() * 5),
          },
        },
      },
    });
    users.push(user);
  }

  // 3. Compétitions
  console.log("🏆 Création des compétitions...");
  const createdCompetitions = await Promise.all(
    COMPETITIONS.map((c) =>
      prisma.competition.create({
        data: {
          id: c.id,
          api_id: c.api_id,
          name: c.name,
          code: c.code,
          country: c.country,
          emblem_url: c.emblem_url,
        },
      })
    )
  );

  // 4. Équipes
  console.log("⚽ Création des équipes...");
  const createdTeams = await Promise.all(
    TEAMS.map((t) =>
      prisma.team.create({
        data: {
          id: t.id,
          api_id: t.api_id,
          name: t.name,
          tla: t.tla,
          country: t.country,
          crest_url: `https://crests.football-data.org/${t.api_id}.png`,
        },
      })
    )
  );

  // 5. Liaison Équipes <-> Compétitions (On met toutes les équipes dans toutes les compètes pour le seed)
  console.log("🔗 Liaison équipes et compétitions...");
  for (const comp of createdCompetitions) {
    await prisma.competitionTeam.createMany({
      data: createdTeams.map((t) => ({
        team_id: t.id,
        competition_id: comp.id,
      })),
    });
  }

  // 6. Matchs (Passés et Futurs)
  console.log("📅 Génération des matchs...");
  const matchData = [];

  // Générer 20 matchs aléatoires
  for (let i = 0; i < 20; i++) {
    const matchId = generateFixedUuid('match', i);
    const isPast = i < 10;
    const homeTeam =
      createdTeams[Math.floor(Math.random() * createdTeams.length)];
    let awayTeam =
      createdTeams[Math.floor(Math.random() * createdTeams.length)];
    while (awayTeam.id === homeTeam.id)
      awayTeam = createdTeams[Math.floor(Math.random() * createdTeams.length)];

    const date = new Date();
    date.setDate(date.getDate() + (isPast ? -i : i)); // Matchs étalés sur 10 jours avant/après

    matchData.push({
      id: matchId,
      api_id: 2000 + i,
      date: date,
      status: isPast ? MatchStatus.FINISHED : MatchStatus.SCHEDULED,
      home_team_id: homeTeam.id,
      away_team_id: awayTeam.id,
      competition_id:
        createdCompetitions[
          Math.floor(Math.random() * createdCompetitions.length)
        ].id,
      home_score: isPast ? Math.floor(Math.random() * 5) : null,
      away_score: isPast ? Math.floor(Math.random() * 5) : null,
    });
  }

  let iteration = 0;

  for (const m of matchData) {
    const createdMatch = await prisma.match.create({ data: m });

    // 7. Prédictions pour chaque match
    // Chaque utilisateur parie sur environ 50% des matchs
    for (const user of users) {
      if (Math.random() > 0.5) {
        const predictionId = generateFixedUuid('pred', iteration);
        iteration++;

        const values = [
          PredictionValue.HOME,
          PredictionValue.DRAW,
          PredictionValue.AWAY,
        ];
        const val = values[Math.floor(Math.random() * values.length)];

        let status = PredictionStatus.PENDING;
        if (createdMatch.status === MatchStatus.FINISHED) {
          // Logique simple pour déterminer si le pari est gagné
          const actualResult =
            createdMatch.home_score! > createdMatch.away_score!
              ? PredictionValue.HOME
              : createdMatch.home_score! < createdMatch.away_score!
                ? PredictionValue.AWAY
                : PredictionValue.DRAW;
          status =
            val === actualResult ? PredictionStatus.WON : PredictionStatus.LOST;
        }

        await prisma.prediction.create({
          data: {
            id: predictionId,
            user_id: user.id,
            match_id: createdMatch.id,
            prediction_value: val,
            status: status,
          },
        });
      }
    }
  }

  console.log(`✅ Seeding terminé :
  - ${users.length} Utilisateurs
  - ${createdCompetitions.length} Compétitions
  - ${createdTeams.length} Équipes
  - ${matchData.length} Matchs
  - Des centaines de prédictions générées`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
