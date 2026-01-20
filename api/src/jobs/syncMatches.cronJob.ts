import { CronJob } from "cron";
import { syncAllMatches } from "../services/sync.service.ts";



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

console.log('⏰ Cron Job démarré - Synchronisation toutes les 20 minutes');



// ## SYNCHRONISATION AU DÉMARRAGE DU SERVEUR
// Permet d'avoir des données fraîches dès le lancement du serveur
console.log('\n📡 Synchronisation initiale des matchs au démarrage...\n');
syncAllMatches().catch(err => console.error('Erreur sync initiale matchs:', err));