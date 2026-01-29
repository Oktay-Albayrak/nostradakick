import styles from "./page.module.css";
import MatchCard from "@/components/matchCard/MatchCard";
import { IMatch } from "../types/match";
import SearchBar from "@/components/search/searchBar";
import Link from "next/link";
import { IPrediction } from "../types/prediction";

export default async function Home() {
  let matchs: IMatch[] = [];
  let predictions: IPrediction[] = [];
  let matchsError = false;
  let predictionsError = false;

  // Récupération des matchs à venir (6 pour l'accueil)
  try {
    const matchResponse = await fetch(
      "http://localhost:4000/api/matches?page=1&limit=6",
      { cache: "no-store" }
    );
    if (matchResponse.ok) {
      const rawMatchs = await matchResponse.json();
      matchs = Array.isArray(rawMatchs) ? rawMatchs : [];
    } else {
      matchsError = true;
    }
  } catch (error) {
    console.error("Erreur lors du fetch des matchs:", error);
    matchsError = true;
  }

  // Récupération des prédictions de l'API et on en récupère 4 à afficher
  try {
    const predictionsResponse = await fetch(
      "http://localhost:4000/api/predictions",
      { cache: "no-store" }
    );
    if (predictionsResponse.ok) {
      const rawPredictions = await predictionsResponse.json();
      predictions = Array.isArray(rawPredictions) ? rawPredictions : [];
    } else {
      predictionsError = true;
    }
  } catch (error) {
    console.error("Erreur lors du fetch des pronostics:", error);
    predictionsError = true;
  }

  const homeMatchs = matchs.slice(0, 6);
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
            {matchsError ? (
              <p className={styles.errorMessage}>
                Erreur lors du chargement des matchs. Vérifiez que l&apos;API est démarrée.
              </p>
            ) : matchs.length > 0 ? (
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
            {predictionsError ? (
              <p className={styles.errorMessage}>
                Erreur lors du chargement des pronostics.
              </p>
            ) : predictions.length > 0 ? (
              pronos.map((prediction) => (
                <div key={prediction.id} className={styles.pronoRow}>
                  <span className={styles.pronoLabel}>
                    <Link className={styles.userLink} href={`/profil/${prediction.user.username}`}>{prediction.user.username}</Link> - <Link className={styles.pronoMatchLink} href={`/matchs/${prediction.match.id}`}>{prediction.match.home_team.short_name || prediction.match.home_team.name} - {prediction.match.away_team.short_name || prediction.match.away_team.name}</Link>
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
