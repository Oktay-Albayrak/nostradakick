import { CronJob } from "cron";
import { syncAllMatches } from "../services/sync.service.ts";

if (process.env.ENV !== "env") {
  /**
    * Synchronise les MATCHS de toutes les ligues toutes les 20 minutes
    * 6 appels API en parallèle (respecte le quota de 10/min)
  */

  // ## CRON JOB - TOUTES LES 20 MINUTES
  // Créer le cron job qui s'exécute toutes les 20 minutes
  const matchCronJob = new CronJob(
    '*/20 * * * *',  // Toutes les 20 minutes
    syncAllMatches,  // Fonction à exécuter
    null,
    true,            // Démarre automatiquement
    'Europe/Paris'
  );



  // Démarrer le cron
  matchCronJob.start();

  console.log('⏰ Cron Job démarré (Matchs) - Synchronisation toutes les 20 minutes');



  console.log('⏳ Synchronisation des matchs prévue immédiatement...');

  // ## SYNCHRONISATION AU DÉMARRAGE DU SERVEUR
  // Récupère tout les infos des matchs (Équipes, etc) et d'avoir des données fraîches dès le lancement du serveur
  console.log('\n📡 Synchronisation initiale des competitions au démarrage...\n');
  syncAllMatches().catch(err => console.error('Erreur sync initiale competitions:', err));
}

