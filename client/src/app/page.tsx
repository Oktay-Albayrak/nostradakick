import styles from "./page.module.css";
import MatchCard from "@/components/matchCard/MatchCard";
import { IMatch } from "../types/match";
import SearchBar from "@/components/search/searchBar";
import Link from "next/link";
import { IPrediction } from "../types/prediction";

export default async function Home() {

  // Récupération des matchs de l'API et on récupère 6 matchs à afficher
  const matchResponse = await fetch("http://localhost:4000/api/matches");
  if (!matchResponse.ok) {
    return <div>Erreur lors du chargement des matchs</div>;
  }

  const matchs: IMatch[] = await matchResponse.json();
  const homeMatchs = matchs.slice(0, 6);

  
  // Récupération des prédictions de l'API et on en récupère 4 à afficher
  const predictionsResponse = await fetch("http://localhost:4000/api/predictions");
  if (!predictionsResponse.ok) {
    return <div>Erreur lors du chargement des derniers pronos</div>;
  }
  
  const predictions: IPrediction[] = await predictionsResponse.json();
  const pronos = predictions.slice(0, 4);

  return (
    <div className={styles.page}>
      {/* SEARCH BAR */}
      <SearchBar />

      {/* CONTENU PRINCIPAL */}
      <section className={styles.mainGrid}>
        {/* MATCHS À VENIR */}
        <div>
          <h2 className={styles.sectionTitle}>Matchs à venir</h2>

          <div className={styles.matchGrid}>
            {matchs.length > 0 ? (
              homeMatchs.map((m) => <MatchCard key={m.id} match={m} />)
            ) : (
              <p>Aucun match prévu pour le moment.</p>
            )}
          </div>

          <Link className={styles.primaryButton} href="/matchs">
            Voir tous les matchs
          </Link>
        </div>

        {/* DERNIERS PRONOSTICS */}
        <div>
          <h2 className={styles.sectionTitle}>Derniers pronostics</h2>

          <div className={styles.pronoList}>
            {predictions.length > 0 ? (
              pronos.map((prediction) => (
                <div key={prediction.id} className={styles.pronoRow}>
                  <span className={styles.pronoLabel}>
                    {prediction.user.username} | {prediction.match.home_team.short_name || prediction.match.home_team.name} - {prediction.match.away_team.short_name || prediction.match.away_team.name}
                  </span>
                  <div className={styles.picks}>
                    <span className={`${styles.pick} ${prediction.prediction_value === "HOME" ? styles.pickActive : ""}`}>
                      1
                    </span>
                    <span className={`${styles.pick} ${prediction.prediction_value === "DRAW" ? styles.pickActive : ""}`}>
                      N
                    </span>
                    <span className={`${styles.pick} ${prediction.prediction_value === "AWAY" ? styles.pickActive : ""}`}>
                      2
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p>Aucun pronostic pour le moment.</p>
            )}
          </div>

          <Link href="/pronos" className={styles.primaryButton}>
            Voir tous les pronostics
          </Link>
        </div>
      </section>
    </div>
  );
}
