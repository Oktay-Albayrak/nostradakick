import {
  syncAllMatches,
  syncAllCompetitions,
  syncStandings,
  syncCompetitionsMetadata,
} from "../services/sync.service.ts";

async function runFullSync() {
  console.log("🚀 Lancement d'une synchronisation MANUELLE complète...");
  console.log("⚠️ Respect du quota : pause de 2-5 secondes entre les blocs.\n");

  try {
    // 1. Compétitions (Noms, logos, pays)
    console.log("⏳ 1/4 - Synchronisation des Compétitions...");
    await syncAllCompetitions();
    await new Promise((r) => setTimeout(r, 2000));

    // 2. Standings (Nécessaire pour le calcul du Top 5)
    console.log("⏳ 2/4 - Synchronisation des Classements (Standings)...");
    await syncStandings();
    await new Promise((r) => setTimeout(r, 2000));

    // 3. Matchs (Avec ta logique Hot / Prestige)
    console.log("⏳ 3/4 - Synchronisation des Matchs...");
    await syncAllMatches();
    await new Promise((r) => setTimeout(r, 2000));

    // 4. Metadata (Finalisation des pays des équipes)
    console.log("⏳ 4/4 - Synchronisation des Métadonnées...");
    await syncCompetitionsMetadata();

    console.log("\n✅ Synchronisation manuelle terminée avec succès !");
  } catch (error) {
    console.error("\n❌ Échec de la synchronisation manuelle :");
    console.error(error);
    process.exit(1);
  }
}

runFullSync();
