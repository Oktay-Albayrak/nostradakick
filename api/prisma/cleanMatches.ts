import { prisma } from "../src/lib/prisma.ts";

/**
 * Script pour nettoyer les matchs, équipes et compétitions
 * Conserve : Users, UserStats, Predictions, PredictionValues, PredictionStatus
 * Supprime : Match, Team, Competition (et leurs statuts associés)
 */
async function main() {
  try {
    console.log("🧹 Début du nettoyage de la base de données...\n");

    // Ordre important : supprimer selon les dépendances (FK)
    // Les Predictions dépendent des Matchs, donc on les supprime d'abord
    
    console.log("🗑️  Suppression des prédictions...");
    const deletedPredictions = await prisma.prediction.deleteMany({});
    console.log(`✅ ${deletedPredictions.count} prédictions supprimées`);

    console.log("🗑️  Suppression des matchs...");
    const deletedMatches = await prisma.match.deleteMany({});
    console.log(`✅ ${deletedMatches.count} matchs supprimés`);

    console.log("🗑️  Suppression des relations compétition-équipe...");
    const deletedCompTeams = await prisma.competitionTeam.deleteMany({});
    console.log(`✅ ${deletedCompTeams.count} relations supprimées`);

    console.log("🗑️  Suppression des équipes...");
    const deletedTeams = await prisma.team.deleteMany({});
    console.log(`✅ ${deletedTeams.count} équipes supprimées`);

    console.log("🗑️  Suppression des compétitions...");
    const deletedCompetitions = await prisma.competition.deleteMany({});
    console.log(`✅ ${deletedCompetitions.count} compétitions supprimées`);

    console.log("\n✨ Nettoyage terminé avec succès !\n");
    console.log("📊 Données conservées :");
    console.log("  ✅ Users");
    console.log("  ✅ UserStats");
    console.log("  ✅ Roles (MEMBER, ADMIN)");
    console.log("\n🎯 Données supprimées :");
    console.log("  ❌ Matchs");
    console.log("  ❌ Équipes");
    console.log("  ❌ Compétitions");
    console.log("  ❌ Prédictions (liées aux matchs)");

  } catch (error) {
    console.error("❌ Erreur lors du nettoyage :", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();