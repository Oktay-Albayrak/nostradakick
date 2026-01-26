import {
  syncAllMatches,
  syncAllCompetitions,
  syncStandings,
  syncCompetitionsMetadata,
} from "../services/sync.service.ts";

// Petit helper pour la clarté
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function runFullSync() {
  console.log("🚀 Lancement d'une synchronisation MANUELLE complète...");
  console.log(
    "⚠️ Respect du quota strict (10 req/min) : pause de 45s entre les blocs.\n",
  );

  try {
    // 1. Compétitions
    console.log("⏳ 1/4 - Synchronisation des Compétitions...");
    await syncAllCompetitions();
    console.log(
      "💤 Pause de sécurité (45s) pour réinitialiser le quota API...",
    );
    await delay(45000);

    // 2. Standings
    console.log("⏳ 2/4 - Synchronisation des Classements (Standings)...");
    await syncStandings();
    console.log(
      "💤 Pause de sécurité (45s) pour réinitialiser le quota API...",
    );
    await delay(45000);

    // 3. Matchs
    console.log("⏳ 3/4 - Synchronisation des Matchs...");
    await syncAllMatches();
    console.log(
      "💤 Pause de sécurité (45s) pour réinitialiser le quota API...",
    );
    await delay(45000);

    // 4. Metadata
    console.log("⏳ 4/4 - Synchronisation des Métadonnées...");
    await syncCompetitionsMetadata();

    console.log("\n✅ Synchronisation manuelle terminée avec succès !");
  } catch (error: any) {
    if (error?.response?.status === 429) {
      console.error(
        "\n❌ Erreur 429 : Quota dépassé. Attendez 1 minute avant de relancer.",
      );
    } else {
      console.error("\n❌ Échec de la synchronisation manuelle :", error);
    }
    process.exit(1);
  }
}

runFullSync();
