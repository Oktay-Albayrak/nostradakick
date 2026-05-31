import { CronJob } from "cron";
import { syncStandings } from "../services/sync.service.ts";

/**
 * Synchronise les CLASSEMENTS toutes les 3 heures à la minute 10
 * (Ex: 00:10, 03:10, 06:10...)
 * Cela évite de heurter le cron des matchs qui tourne à :00, :20, :40
 */
const standingsCronJob = new CronJob(
  "10 */3 * * *",
  async () => {
    try {
      await syncStandings();
      console.log("✅ Cron Standings terminé avec succès.");
    } catch (err) {
      console.error("❌ Erreur dans le Cron Standings:", err);
    }
  },
  null,
  true,
  "Europe/Paris",
);

standingsCronJob.start();


console.log('⏳ Synchronisation des standing prévue 4 minutes...');
// Au démarrage du serveur, on l'exécute après 4 minutes
// (Les matchs sont à 1 min, les compétitions à 2 min, les métadonnées à 3 min)
setTimeout(
  () => {
    console.log("📊 Lancement de la synchronisation initiale des Standings...");
    syncStandings().catch((err) => console.error(err));
  },
  4 * 60 * 1000, // 4 minutes
);

console.log("📊 Cron Job Standings démarré - Toutes les 3h à la minute 10");
