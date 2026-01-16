import { CronJob } from "cron";
import { syncMatchesForCompetition } from "./services/sync.service";

// Ligues à synchroniser depuis l'API football-data
// Ordre : Ligue 1 FR, Premier League UK, Champions League, Bundesliga DE, Serie A IT, La Liga ES
const LEAGUES_TO_SYNC = ["FL1", "PL", "CL", "BL1", "SA", "PD"];
let currentLeagueIndex = 0;

/**
 * Synchronise une ligue à la fois (round-robin).
 * Chaque cron fait UNE ligue puis passe à la suivante pour éviter de surcharger l'API externe.
 */
async function syncNextLeague() {
  const leagueCode = LEAGUES_TO_SYNC[currentLeagueIndex];

  // Vérifier que la ligue existe
  if(!leagueCode) {
    console.error("Erreur: League non trouvée");
    return;
  }

  // Capture les erreurs de l'API 
  try {
    console.log(`🕒 Début de la synchronisation pour ${leagueCode} à ${new Date().toISOString()}`);
    await syncMatchesForCompetition(leagueCode);
    console.log(`✅ Synchronisation terminée pour ${leagueCode}`)
  } catch (error) {
    // On log mais on continue (le cron doit pas s'arrêter pour 1 erreur API)
    console.error(`❌ Erreur lors de la synchronisation pour ${leagueCode}:`, error)
  }

  // Passe à la ligue suivante (modulo = revenir à 0 après la dernière)
  currentLeagueIndex = (currentLeagueIndex + 1) % LEAGUES_TO_SYNC.length;
}

// Cron Job : exécuté toutes les minutes pour sync des matchs
// Pattern '* * * * *' = min heure jour mois jour semaine
// Fuseau horaire Paris pour que les logs matchent l'heure serveur
const job = new CronJob(
  '* * * * *',
  syncNextLeague,
  null,
  true, // autoStart
  'Europe/Paris'
);

job.start();
console.log('⏰ Cron Job démarré - sync des matchs toutes les minutes.');