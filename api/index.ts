import { app } from "./src/app.ts";
import { config } from "./config.ts";
import "./src/jobs/syncMatches.cronJob.ts"

import {
  syncAllCompetitions,
  syncMatchesForCompetition,
} from "./src/services/sync.service.ts";

// Route temporaire pour tester le Token et la synchro
app.get("/api/admin/test-sync-all", async (req, res) => {
  try {
    // On teste avec toutes les compétitions
    await syncAllCompetitions();
    res.json({
      message:
        "Synchro réussie ! Vérifie ton interface client ou Prisma Studio.",
    });
  } catch (error: any) {
    res.status(500).json({
      error: "La synchro a échoué",
      details: error.message,
    });
  }
});

app.get("/api/admin/test-sync-one", async (req, res) => {
  try {
    // On teste avec une compétition
    await syncMatchesForCompetition("CL");
    res.json({
      message:
        "Synchro réussie ! Vérifie ton interface client ou Prisma Studio.",
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
