import { app } from "./src/app.ts";
import { config } from "./config.ts";

/* import "./src/jobs/syncMatches.cronJob.ts"; // Toutes les 20 min
import "./src/jobs/syncCompetitions.cronJob.ts"; // 1er du mois à 3h02
import "./src/jobs/syncStandings.cronJob.ts"; // Toutes les 3 heures à la minute 10'
import "./src/jobs/syncMetadaCompetitions.cronJob.ts"; // 15 août à 4h02
 */

import {
  syncAllCompetitions,
  syncAllMatches,
  syncStandings,
  //syncMatchesForCompetition,
} from "./src/services/sync.service.ts";

// Route de test pour synchroniser TOUTES les compétitions manuellement
app.get("/api/admin/test-sync-competitions", async (req, res) => {
  try {
    // On teste avec toutes les compétitions
    await syncAllCompetitions();
    res.json({
      message: "Synchro réussie !",
      info: "Vérifie ton interface client ou Prisma Studio.",
    });
  } catch (error: any) {
    res.status(500).json({
      error: "La synchro a échoué",
      details: error.message,
    });
  }
});

// Route de test pour synchroniser TOUS les matchs manuellement
app.get("/api/admin/test-sync-matches", async (req, res) => {
  try {
    await syncAllMatches();
    res.json({
      message: "Synchro des matchs réussie !",
      info: "6 ligues synchronisé en parallèle",
    });
  } catch (error: any) {
    res.status(500).json({
      error: "La synchro a échoué",
      detail: error.message,
    });
  }
});

app.get("/api/admin/test-sync-standig", async (req, res) => {
  try {
    // On teste avec toutes les compétitions
    await syncStandings();
    res.json({
      message: "Synchro réussie !",
      info: "Vérifie ton interface client ou Prisma Studio.",
    });
  } catch (error: any) {
    res.status(500).json({
      error: "La synchro a échoué",
      details: error.message,
    });
  }
});

// lancement de l'app express
app.listen(config.port, () => {
  console.log(`Server started at http://localhost:${config.port}`);
});
