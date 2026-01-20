import { CronJob } from "cron";
import { syncAllCompetitions } from "../services/sync.service.ts";



/**
 * Synchronise les infos des COMPÉTITIONS (pays, emblèmes, etc.)
 * Exécuté le 1er de chaque mois à 3h et 2minutes du matin
 * 
 * Pattern cron : minute heure jour mois jour_semaine
 * '2 3 1 * *' = À 3h02 le 1er jour de chaque mois
 */

const competitionsCronJob = new CronJob(
  '2 3 1 * *',
  syncAllCompetitions,
  null,
  true,
  'Europe/Paris'
);

competitionsCronJob.start();

console.log('🌍 Cron pour les Compétitions démarré - Synchronisation le 1er de chaque mois à 3h02');



// ## SYNCHRONISATION AU DÉMARRAGE DU SERVEUR
// Permet de récupérer les infos (pays, etc.) et d'avoir des données fraîches dès le lancement du serveur
/*console.log('\n📡 Synchronisation initiale des competitions au démarrage...\n');
syncAllCompetitions().catch(err => console.error('Erreur sync initiale competitions:', err));*/

console.log('⏳ Synchronisation des Competitions prévue dans 2 minutes...');

setTimeout(() => {
  console.log("\n🌍 Lancement de la synchronisation des matchs...\n");
  syncAllCompetitions().catch(err => console.error('Erreur sync matchs:', err));
}, 2 * 60 * 1000); // 2 minutes en millisecondes