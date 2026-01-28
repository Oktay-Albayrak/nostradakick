import { CronJob } from "cron";
import { syncAllMatches } from "../services/sync.service.ts";
import { prisma } from "../lib/prisma.ts";
import { recalculateUserStats } from "../services/userStat.service.ts";



/**
 * Synchronise les MATCHS de toutes les ligues toutes les 20 minutes
 * 6 appels API en parallèle (respecte le quota de 10/min)
 */

/**
 * FONCTION WRAPPER : Sync + Recalcule des stats
 * 
 * Après chaque synchronisation de matchs :
 * 1. Récupère les users qui ont des prédictions finalisées
 * 2. Recalcule leurs stats (audit/correction des incohérences)
 */
async function syncMatchesAndUpdateStats() {
  try {
    await syncAllMatches();

    const affectedUsers = await prisma.prediction.findMany({
      where: {
        status: {
          in: ["WON", "LOST"]
        }
      },
      select: { 
        user_id: true,
        user: { select: { username: true } }
      },
      distinct: ["user_id"]
    });

    for (const { user_id, user } of affectedUsers) {
      await recalculateUserStats(user_id);
    }

    const usernames = affectedUsers.map(u => u.user.username).join(', ');
    console.log(`📊 Stats recalculées pour ${affectedUsers.length} utilisateur(s) après la synchro des matchs: ${usernames}`);
  } catch (error) {
    console.error("❌ Erreur lors de la synchro et du recalcule des stats:", error);
  }
}

// ## CRON JOB - TOUTES LES 20 MINUTES
// Créer le cron job qui s'exécute toutes les 20 minutes
const matchCronJob = new CronJob(
  '*/20 * * * *',  // Toutes les 20 minutes
  syncMatchesAndUpdateStats,  // Fonction à exécuter
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
syncMatchesAndUpdateStats().catch(err => console.error('Erreur sync initiale competitions:', err));