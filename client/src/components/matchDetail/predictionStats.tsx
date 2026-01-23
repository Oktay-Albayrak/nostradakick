import styles from "./matchDetail.module.css";
import { IMatch } from "@/types/match";

interface predictionStatsProps {
  match: IMatch;
}

export default function PredictionStats({ match }: predictionStatsProps) {
  // Calcule les pourcentages des prédictions pour afficher les statistiques
  const totalPredictions = match.predictions?.length || 0;
  
  if (totalPredictions === 0) {
    return null; // Aucune prédiction à afficher
  }

  const homeCount = match.predictions?.filter(param => param.prediction_value === "HOME").length || 0;
  const drawCount = match.predictions?.filter(param => param.prediction_value === "DRAW").length || 0;
  const awayCount = match.predictions?.filter(param => param.prediction_value === "AWAY").length || 0;

  const homePercentage = ((homeCount / totalPredictions) * 100).toFixed(1);
  const drawPercentage = ((drawCount / totalPredictions) * 100).toFixed(1);
  const awayPercentage = ((awayCount / totalPredictions) * 100).toFixed(1);

  return (
    <section className={styles.statsSection}>
      <h2 className={styles.sectionTitle}>
        📊 Statistiques des pronostics ({totalPredictions} vote{totalPredictions > 1 ? "s" : ""})
      </h2>

      <div className={styles.statsGrid}>
        {/* Victoire Domicile */}
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statIcon}>🏠</span>
            <span className={styles.statTeam}>{match.home_team.name}</span>
          </div>
          <div className={styles.statBar}>
            <div 
              className={styles.statBarFill} 
              style={{ 
                width: `${homePercentage}%`,
                background: "linear-gradient(90deg, #1a3a7a 0%, #3562a6 100%)"
              }}
            ></div>
          </div>
          <div className={styles.statFooter}>
            <span className={styles.statPercentage}>{homePercentage}%</span>
            <span className={styles.statCount}>{homeCount} vote{homeCount > 1 ? "s" : ""}</span>
          </div>
        </div>

        {/* Match Nul */}
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statIcon}>🤝</span>
            <span className={styles.statTeam}>Match Nul</span>
          </div>
          <div className={styles.statBar}>
            <div 
              className={styles.statBarFill} 
              style={{ 
                width: `${drawPercentage}%`,
                background: "linear-gradient(90deg, #666 0%, #999 100%)"
              }}
            ></div>
          </div>
          <div className={styles.statFooter}>
            <span className={styles.statPercentage}>{drawPercentage}%</span>
            <span className={styles.statCount}>{drawCount} vote{drawCount > 1 ? "s" : ""}</span>
          </div>
        </div>

        {/* Victoire Extérieur */}
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statIcon}>✈️</span>
            <span className={styles.statTeam}>{match.away_team.name}</span>
          </div>
          <div className={styles.statBar}>
            <div 
              className={styles.statBarFill} 
              style={{ 
                width: `${awayPercentage}%`,
                background: "linear-gradient(90deg, #ffd700 0%, #e0bf00 100%)"
              }}
            ></div>
          </div>
          <div className={styles.statFooter}>
            <span className={styles.statPercentage}>{awayPercentage}%</span>
            <span className={styles.statCount}>{awayCount} vote{awayCount > 1 ? "s" : ""}</span>
          </div>
        </div>
      </div>

      {/* Affiche les tendances selon la répartition des prédictions */}
      <div className={styles.trendCard}>
        {homeCount > drawCount && homeCount > awayCount && (
          <p>🔥 La communauté pense que <strong>{match.home_team.name}</strong> va gagner !</p>
        )}
        
        {awayCount > homeCount && awayCount > drawCount && (
          <p>🔥 La communauté pense que <strong>{match.away_team.name}</strong> va gagner !</p>
        )}
        
        {drawCount > homeCount && drawCount > awayCount && (
          <p>🤝 La communauté pense qu&apos;il y aura <strong>match nul</strong> !</p>
        )}
        
        {homeCount === awayCount && homeCount > drawCount && (
          <p>⚖️ Les prédictions sont <strong>partagées</strong> entre les deux équipes !</p>
        )}
        
        {homeCount === drawCount && homeCount > awayCount && (
          <p>⚖️ Les prédictions sont <strong>partagées</strong> entre victoire domicile et match nul !</p>
        )}
        
        {drawCount === awayCount && drawCount > homeCount && (
          <p>⚖️ Les prédictions sont <strong>partagées</strong> entre match nul et victoire extérieur !</p>
        )}
        
        {homeCount === drawCount && drawCount === awayCount && (
          <p>🎲 Parfaite égalité ! Les trois scénarios sont aussi probables les uns que les autres !</p>
        )}
      </div>
    </section>
  );
}