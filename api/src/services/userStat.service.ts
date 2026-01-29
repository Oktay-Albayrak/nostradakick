import { prisma } from "../lib/prisma.ts";

/**
 * RECALCULE ET MET À JOUR LES STATS DE L'UTILISATEUR
 * 
 * Logique :
 * 1. Récupère TOUTES les prédictions finalisées (status = WON ou LOST)
 * 2. Trie par date de création (ordre chronologique)
 * 3. Calcule :
 *    - wins_count : nombre total de WON
 *    - losses_count : nombre total de LOST
 *    - best_streak : meilleure série de victoires consécutives
 * 4. Upsert dans UserStat (crée si existe pas, update sinon)
 * 
 * Idempotent : peut être appelé N fois, résultat toujours cohérent
 * Utilisé par : 
 *   - predictions.controller.ts (quand le statut change)
 *   - syncMatches.cronJob.ts (périodiquement pour audit)
 */
export async function recalculateUserStats(userId: string) {
  try {
    // 0. Récupère l'utilisateur pour afficher son username
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true }
    });

    // 1. Récupère toutes les prédictions finalisées triées par date
    const predictions = await prisma.prediction.findMany({
      where: {
        user_id: userId,
        status: {
          in: ["WON", "LOST"] // Prédictions finalisées uniquement
        }
      },
      orderBy: {
        created_at: "asc" // Ordre chronologique pour calculer les streaks
      }
    });

    // 2. Calcule les statistiques
    let wins_count = 0;
    let losses_count = 0;
    let best_streak = 0;
    let current_streak = 0;

    for (const prediction of predictions) {
      if (prediction.status === "WON") {
        wins_count++;
        current_streak++; // Continue la série
        // Mise à jour du meilleur streak
        if (current_streak > best_streak) {
          best_streak = current_streak;
        }
      } else if (prediction.status === "LOST") {
        losses_count++;
        current_streak = 0; // Réinitialise la série
      }
    }

    // 3. Upsert dans UserStat
    const updatedStats = await prisma.userStat.upsert({
      where: { user_id: userId },
      update: {
        wins_count,
        losses_count,
        best_streak
      },
      create: {
        user_id: userId,
        wins_count,
        losses_count,
        best_streak
      }
    });

    console.log(`✅ Stats actualisées pour ${user?.username || userId}:`, {
      wins_count,
      losses_count,
      best_streak
    });

    return updatedStats;

  } catch (error) {
    console.error(`❌ Erreur lors du recalcul des stats pour l'utilisateur ${userId}:`, error);
    throw error;
  }
}
