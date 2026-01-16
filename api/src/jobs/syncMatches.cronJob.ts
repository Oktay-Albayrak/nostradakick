import { CronJob } from "cron";
import { syncMatchesForCompetition } from "../services/sync.service.ts";



// ## CONFIGURATION
// Liste des ligues à synchroniser
const LEAGUES_TO_SYNC = ["FL1", "PL", "CL", "BL1", "SA", "PD"];



// ## FONCTION DE SYNCHRONISATION PARALLÈLE
/**
 * Synchronise toutes les ligues EN MÊME TEMPS (parallèle)
 * Les 6 appels API partent simultanément
 */
async function syncAllLeagues() {
  console.log(`\n🚀 Début de la synchronisation à ${new Date().toLocaleString('fr-FR')}`);
  console.log(`📋 Ligues: ${LEAGUES_TO_SYNC.join(', ')}\n`);

  // Lancer toutes les synchronisations en parallèle
  const promisesSyncLeagues = LEAGUES_TO_SYNC.map(async (leagueCode) => {
    try {
      console.log(`🕒 [${leagueCode}] Démarrage...`);
      
      // Synchroniser la ligue (récupère matchs, équipes, résultats, etc.)
      await syncMatchesForCompetition(leagueCode);
      
      console.log(`✅ [${leagueCode}] Terminé`);
      
    } catch (error) {
      // Si erreur, on affiche mais ça n'arrête pas les autres
      console.error(`❌ [${leagueCode}] Erreur:`, error);
    }
  });

  // Attend que TOUTES les synchronisations soient terminées
  await Promise.all(promisesSyncLeagues);

  console.log(`\n🏁 Synchronisation terminée\n`);
}



// ## CRON JOB - TOUTES LES 15 MINUTES
// Créer le cron job qui s'exécute toutes les 15 minutes
const job = new CronJob(
  '*/15 * * * *',  // Toutes les 15 minutes
  syncAllLeagues,  // Fonction à exécuter
  null,
  true,            // Démarre automatiquement
  'Europe/Paris'
);



// Démarrer le cron
job.start();

console.log('⏰ Cron Job démarré - Synchronisation toutes les 15 minutes');



// ## SYNCHRONISATION AU DÉMARRAGE DU SERVEUR
// Lancer une première synchronisation immédiatement
console.log('\n📡 Synchronisation initiale au démarrage...\n');
syncAllLeagues().catch(err => console.error('Erreur:', err));