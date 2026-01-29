import {
  UserRole,
  MatchStatus,
  PredictionValue,
  PredictionStatus,
} from "../generated/prisma/client.ts";
import { prisma } from "../src/lib/prisma.ts";

/**
 * Génère un UUID déterministe basé sur un préfixe et un index
 */
function generateFixedUuid(
  type: "user" | "comp" | "team" | "match" | "pred",
  index: number,
): string {
  const prefixes = { user: "1", comp: "2", team: "3", match: "4", pred: "5" };
  const hexIndex = index.toString(16).padStart(12, "0");
  return `00000000-${prefixes[type]}000-4000-9000-${hexIndex}`;
}

/**
 * Retourne une valeur aléatoire d'un tableau
 */
function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]!;
}

/**
 * Détermine le statut d'une prédiction en fonction du match
 */
function determinePredictionStatus(
  match: any,
  predictionValue: PredictionValue,
): PredictionStatus {
  if (match.status !== MatchStatus.FINISHED) {
    return PredictionStatus.PENDING;
  }

  if (match.home_score === null || match.away_score === null) {
    return PredictionStatus.CANCELLED;
  }

  const actualResult =
    match.home_score > match.away_score
      ? PredictionValue.HOME
      : match.home_score < match.away_score
        ? PredictionValue.AWAY
        : PredictionValue.DRAW;

  return actualResult === predictionValue
    ? PredictionStatus.WON
    : PredictionStatus.LOST;
}

async function main() {
  console.log("🚀 Début du seeding...");

  // 1. Nettoyage des prédictions et utilisateurs uniquement
  console.log("🧹 Nettoyage des prédictions et utilisateurs...");
  await prisma.prediction.deleteMany();
  await prisma.userStat.deleteMany();
  await prisma.user.deleteMany();
  // await prisma.competitionTeam.deleteMany();

  // 2. Récupération des matchs existants (dans les 2 semaines autour d'aujourd'hui)
  console.log("📥 Récupération des matchs en base...");
  const now = new Date();
  const twoWeeksAgo = new Date(now);
  twoWeeksAgo.setDate(now.getDate() - 14);
  const twoWeeksAhead = new Date(now);
  twoWeeksAhead.setDate(now.getDate() + 14);

  const matches = await prisma.match.findMany({
    where: {
      date: {
        gte: twoWeeksAgo,
        lte: twoWeeksAhead,
      },
    },
    include: {
      home_team: true,
      away_team: true,
      competition: true,
    },
    orderBy: {
      date: "asc",
    },
  });

  if (matches.length === 0) {
    console.error("❌ Aucun match trouvé en base de données !");
    console.log(
      "💡 Veuillez d'abord exécuter le seed qui crée les compétitions et matchs.",
    );
    return;
  }

  console.log(`✅ ${matches.length} matchs trouvés`);

  // 3. Récupération des compétitions
  const competitions = await prisma.competition.findMany();
  console.log(`✅ ${competitions.length} compétitions trouvées`);

  // 4. Récupération des équipes
  const teams = await prisma.team.findMany();
  console.log(`✅ ${teams.length} équipes trouvées`);

  // // Vérification et création des relations CompetitionTeam manquantes
  // console.log("🔗 Vérification des relations équipes-compétitions...");

  // // Récupérer toutes les relations existantes
  // const existingRelations = await prisma.competitionTeam.findMany();
  // const existingRelationsSet = new Set(
  //   existingRelations.map(rel => `${rel.team_id}-${rel.competition_id}`)
  // );

  // // Parcourir tous les matchs pour identifier les relations nécessaires
  // const relationsToCreate: { team_id: string; competition_id: string }[] = [];

  // for (const match of matches) {
  //   // Relation home_team <-> competition
  //   const homeRelationKey = `${match.home_team_id}-${match.competition_id}`;
  //   if (!existingRelationsSet.has(homeRelationKey)) {
  //     relationsToCreate.push({
  //       team_id: match.home_team_id,
  //       competition_id: match.competition_id,
  //     });
  //     existingRelationsSet.add(homeRelationKey); // Éviter les doublons
  //   }

  //   // Relation away_team <-> competition
  //   const awayRelationKey = `${match.away_team_id}-${match.competition_id}`;
  //   if (!existingRelationsSet.has(awayRelationKey)) {
  //     relationsToCreate.push({
  //       team_id: match.away_team_id,
  //       competition_id: match.competition_id,
  //     });
  //     existingRelationsSet.add(awayRelationKey);
  //   }
  // }

  // // Créer les relations manquantes
  // if (relationsToCreate.length > 0) {
  //   console.log(`  ⚙️ Création de ${relationsToCreate.length} relations manquantes...`);

  //   for (const relation of relationsToCreate) {
  //     await prisma.competitionTeam.create({
  //       data: relation,
  //     });
  //   }

  //   console.log(`  ✅ Relations créées`);
  // } else {
  //   console.log(`  ✅ Toutes les relations existent déjà`);
  // }

  // 5. Création des utilisateurs (Admin + 9 membres)
  console.log("👥 Création des utilisateurs...");
  const users = [];
  for (let i = 1; i <= 10; i++) {
    const userId = generateFixedUuid("user", i);
    const user = await prisma.user.create({
      data: {
        id: userId,
        username: `user_${i}`,
        email: `user${i}@example.com`,
        password_hash: "fake_hash",
        role: i === 1 ? UserRole.ADMIN : UserRole.MEMBER,
        avatar_url:
          i === 1
            ? "https://api.dicebear.com/7.x/avataaars/png?seed=admin"
            : `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(`user_${i}`)}`,
        stats: {
          create: {
            wins_count: 0,
            losses_count: 0,
            best_streak: 0,
          },
        },
      },
    });
    users.push(user);
  }

  // 6. Création des prédictions
  console.log("🎯 Création des prédictions...");
  const predictions = [];
  const predictionValues = [
    PredictionValue.HOME,
    PredictionValue.DRAW,
    PredictionValue.AWAY,
  ];
  let predIndex = 1;

  for (const user of users) {
    // Chaque utilisateur fait des prédictions sur 60-80% des matchs de manière aléatoire
    const numberOfPredictions = Math.floor(
      matches.length * (0.6 + Math.random() * 0.2),
    );

    // Mélanger les matchs et en prendre un sous-ensemble
    const shuffledMatches = [...matches].sort(() => Math.random() - 0.5);
    const matchesToPredict = shuffledMatches.slice(0, numberOfPredictions);

    for (const match of matchesToPredict) {
      const predictionValue = randomChoice(predictionValues);
      const status = determinePredictionStatus(match, predictionValue);

      try {
        const prediction = await prisma.prediction.create({
          data: {
            id: generateFixedUuid("pred", predIndex++),
            prediction_value: predictionValue,
            status: status,
            user_id: user.id,
            match_id: match.id,
          },
        });
        predictions.push(prediction);
      } catch (error) {
        // Si doublon (ne devrait pas arriver avec notre logique), on passe
        console.warn(
          `⚠️ Prédiction déjà existante pour user ${user.username} et match ${match.id}`,
        );
      }
    }

    console.log(`  ✓ ${user.username}: ${matchesToPredict.length} prédictions`);
  }

  // 7. Mise à jour des statistiques utilisateurs
  console.log("📊 Calcul des statistiques...");
  for (const user of users) {
    const userPredictions = predictions.filter((p) => p.user_id === user.id);
    const wins = userPredictions.filter(
      (p) => p.status === PredictionStatus.WON,
    ).length;
    const losses = userPredictions.filter(
      (p) => p.status === PredictionStatus.LOST,
    ).length;

    // Calcul du meilleur streak (séquence de victoires consécutives)
    let currentStreak = 0;
    let bestStreak = 0;

    // Trier les prédictions par date de création
    const sortedPredictions = userPredictions
      .filter(
        (p) =>
          p.status === PredictionStatus.WON ||
          p.status === PredictionStatus.LOST,
      )
      .sort((a, b) => a.created_at.getTime() - b.created_at.getTime());

    for (const pred of sortedPredictions) {
      if (pred.status === PredictionStatus.WON) {
        currentStreak++;
        bestStreak = Math.max(bestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    await prisma.userStat.update({
      where: { user_id: user.id },
      data: {
        wins_count: wins,
        losses_count: losses,
        best_streak: bestStreak,
      },
    });

    const pending = userPredictions.filter(
      (p) => p.status === PredictionStatus.PENDING,
    ).length;
    console.log(
      `  ✓ ${user.username}: ${wins}W / ${losses}L / ${pending}P (streak: ${bestStreak})`,
    );
  }

  console.log(`\n✅ Seeding terminé :
  - ${competitions.length} Compétitions (existantes)
  - ${teams.length} Équipes (existantes)
  - ${users.length} Utilisateurs créés
  - ${predictions.length} Prédictions créées`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
