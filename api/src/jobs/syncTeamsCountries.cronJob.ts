import { CronJob } from "cron";
import { syncAllTeamsCountries } from "../services/sync.service.ts";

/**
 * Synchronise les pays des équipes le 15 août à 4h02 chaque année
 * Date choisie car c'est le début de la plupart des championnats européens
 * 
 * Pattern cron : minute heure jour mois jour_semaine
 * '2 4 15 8 *' = À 4h02 le 15 août de chaque année
 */
const teamsCountriesCronJob = new CronJob(
  '2 4 15 8 *',  // 15 août à 4h02 chaque année
  syncAllTeamsCountries,
  null,
  true,
  'Europe/Paris'
);

teamsCountriesCronJob.start();
console.log('🌎 Cron pour les pays des équipes démarré - Synchronisation le 15 août à 4h02');

/**
 * Lance une synchronisation 3 minutes après le démarrage du serveur
 * Permet de compléter les pays manquants sans bloquer le démarrage
 */
setTimeout(() => {
  console.log("\n🌎 Lancement de la synchronisation des pays des équipes...\n");
  syncAllTeamsCountries().catch(err => console.error('Erreur sync teams countries:', err));
}, 3 * 60 * 1000); // 3 minutes en millisecondes
