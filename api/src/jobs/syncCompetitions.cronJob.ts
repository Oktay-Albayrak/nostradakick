import { CronJob } from "cron";
import { syncAllCompetitions } from "../services/sync.service.ts";



/**
 * Synchronise les infos des COMPÉTITIONS (pays, emblèmes, etc.)
 * Exécuté le 1er de chaque mois à 3h du matin
 * 
 * Pattern cron : minute heure jour mois jour_semaine
 * '0 3 1 * *' = À 3h00 le 1er jour de chaque mois
 */

const competitionsCronJob = new CronJob(
  '0 3 1 * *',
  syncAllCompetitions,
  null,
  true,
  'Europe/Paris'
);

competitionsCronJob.start();

console.log('🌍 Cron pour les Compétitions démarré - Synchronisation le 1er de chaque mois à 3h00');



/**
 * Lance une synchronisation 2 minutes après le démarrage du serveur
 * Permet de récupérer les infos manquantes (pays, etc.) sans surcharger l'API au démarrage
 */

console.log('⏳ Synchronisation des compétitions prévue dans 2 minutes...');

setTimeout(() => {
  console.log("\n🌍 Lancement de la synchronisation des compétitions...\n");
  syncAllCompetitions().catch(err => console.error('Erreur sync competitions:', err));
}, 2 * 60 * 1000); // 2 minutes en millisecondes