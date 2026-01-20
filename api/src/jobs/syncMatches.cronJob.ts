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

console.log('⏰ Cron Job démarré (Matchs) - Synchronisation toutes les 20 minutes');



/**
 * Lance une synchronisation 2 minutes après le démarrage du serveur
 * Récupère tout les infos des matchs (equipes, etc) sans surcharger l'API au démarrage
 */

console.log('⏳ Synchronisation des matchs prévue dans 2 minutes...');

/*setTimeout(() => {
  console.log("\n🌍 Lancement de la synchronisation des matchs...\n");
  syncAllMatches().catch(err => console.error('Erreur sync matchs:', err));
}, 2 * 60 * 1000); // 2 minutes en millisecondes*/

// ## SYNCHRONISATION AU DÉMARRAGE DU SERVEUR
// Permet de récupérer les infos (pays, etc.) et d'avoir des données fraîches dès le lancement du serveur
console.log('\n📡 Synchronisation initiale des competitions au démarrage...\n');
syncAllMatches().catch(err => console.error('Erreur sync initiale competitions:', err));