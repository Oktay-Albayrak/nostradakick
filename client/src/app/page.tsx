import styles from "./page.module.css";
import MatchCard from "@/components/matchCard/MatchCard";
import { IMatch } from "../types/match";

export default async function Home() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/matches`);
  if (!response.ok) {
    return <div>Erreur lors du chargement des matchs</div>;
  }

  const matchs: IMatch[] = await response.json();
  const homeMatchs = matchs.slice(0, 6);

  return (
    <div className={styles.page}>
      {/* SEARCH BAR */}
      <section className={styles.searchSection}>
        <input
          type="search"
          placeholder="Rechercher un match ou une compétition ..."
          className={styles.searchInput}
          aria-label="Rechercher un match ou une compétition"
        />
      </section>

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

          <button className={styles.primaryButton} type="button">
            Voir tous les matchs
          </button>
        </div>

        {/* DERNIERS PRONOSTICS */}
        <div>
          <h2 className={styles.sectionTitle}>Derniers pronostics</h2>

          <div className={styles.pronoList}>
            <div className={styles.pronoRow}>
              <span className={styles.pronoLabel}>HACmen | HAC - OM</span>
              <div className={styles.picks}>
                <span className={`${styles.pick} ${styles.pickActive}`}>1</span>
                <span className={styles.pick}>N</span>
                <span className={styles.pick}>2</span>
              </div>
            </div>

            <div className={styles.pronoRow}>
              <span className={styles.pronoLabel}>ParisienFou | PFC - OL</span>
              <div className={styles.picks}>
                <span className={`${styles.pick} ${styles.pickActive}`}>1</span>
                <span className={styles.pick}>N</span>
                <span className={styles.pick}>2</span>
              </div>
            </div>

            <div className={styles.pronoRow}>
              <span className={styles.pronoLabel}>
                ParisienFou | PSG - LOSC
              </span>
              <div className={styles.picks}>
                <span className={`${styles.pick} ${styles.pickActive}`}>1</span>
                <span className={styles.pick}>N</span>
                <span className={styles.pick}>2</span>
              </div>
            </div>

            <div className={styles.pronoRow}>
              <span className={styles.pronoLabel}>MomoHenni | HAC - OM</span>
              <div className={styles.picks}>
                <span className={styles.pick}>1</span>
                <span className={styles.pick}>N</span>
                <span className={`${styles.pick} ${styles.pickActive}`}>2</span>
              </div>
            </div>
          </div>

          <button className={styles.primaryButton} type="button">
            Voir tous les pronostics
          </button>
        </div>
      </section>
    </div>
  );
}
