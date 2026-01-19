import Link from "next/link";
import styles from "./page.module.css";

export default async function MesPronostics() {
  // const predictions = await getUserPredictions();

  return (
    <div className={styles.container}>
      {/* 1. BARRE DE RECHERCHE (Visible uniquement sur Desktop) */}
      <section className={styles.searchSection}>
        <input
          type="search"
          placeholder="Rechercher un match ou une compétition ..."
          className={styles.searchInput}
          aria-label="Rechercher un match ou une compétition"
        />
      </section>

      {/* 2. FILTRES MOBILES (Cachés sur Desktop) */}
      <div className={styles.mobileFilters}>
        <button className={styles.hotButton}>🔥 HOT</button>
        <button className={styles.filterButton}>Filtres</button>
      </div>

      <section className={styles.mainGrid}>
        {/* 3. COLONNE GAUCHE : FILTRES PAR STATUT */}
        <aside className={styles.filterList}>
          <Link href="/dashboard" className={styles.backLink}>
            ← Retour
          </Link>
          <h2 className={styles.sidebarTitle}>Filtres</h2>
          <ul>
            <li>Tous</li>
            <li>En attente</li>
            <li>Gagnés</li>
            <li>Perdus</li>
          </ul>
        </aside>

        {/* 4. COLONNE CENTRALE : MES PRONOSTICS */}
        <main className={styles.pronosticsContent}>
          <h1 className={styles.sectionTitle}>Mes pronostics</h1>

          <div className={styles.pronosticsGrid}>
            <article className={styles.pronoCard}>
              <div className={styles.matchHeader}>
                <div className={styles.competition}>Ligue 1</div>
                <div className={styles.matchDate}>Ven. 16/01 - 21:00</div>
              </div>
              <div className={styles.matchInfo}>
                <p className={styles.teams}>Havre AC - O. de Marseille</p>
                <div className={styles.choice}>
                  <span className={`${styles.pick} ${styles.pickActive}`}>1</span>
                  <span className={styles.pick}>N</span>
                  <span className={styles.pick}>2</span>
                </div>
              </div>
              <div className={styles.status}>
                <span className={styles.statusPending}>En attente</span>
              </div>
            </article>

            <article className={styles.pronoCard}>
              <div className={styles.matchHeader}>
                <div className={styles.competition}>Ligue 1</div>
                <div className={styles.matchDate}>Sam. 17/01 - 15:00</div>
              </div>
              <div className={styles.matchInfo}>
                <p className={styles.teams}>Paris FC - O. Lyonnais</p>
                <div className={styles.choice}>
                  <span className={`${styles.pick} ${styles.pickActive}`}>1</span>
                  <span className={styles.pick}>N</span>
                  <span className={styles.pick}>2</span>
                </div>
              </div>
              <div className={styles.status}>
                <span className={styles.statusPending}>En attente</span>
              </div>
            </article>

            <article className={styles.pronoCard}>
              <div className={styles.matchHeader}>
                <div className={styles.competition}>Ligue 1</div>
                <div className={styles.matchDate}>Dim. 18/01 - 17:00</div>
              </div>
              <div className={styles.matchInfo}>
                <p className={styles.teams}>Paris SG - Lille</p>
                <div className={styles.choice}>
                  <span className={`${styles.pick} ${styles.pickActive}`}>1</span>
                  <span className={styles.pick}>N</span>
                  <span className={styles.pick}>2</span>
                </div>
              </div>
              <div className={styles.status}>
                <span className={styles.statusWon}>✓ Gagné</span>
              </div>
            </article>

            <article className={styles.pronoCard}>
              <div className={styles.matchHeader}>
                <div className={styles.competition}>Ligue 1</div>
                <div className={styles.matchDate}>Lun. 19/01 - 20:00</div>
              </div>
              <div className={styles.matchInfo}>
                <p className={styles.teams}>SC Frileuse - Havre CS</p>
                <div className={styles.choice}>
                  <span className={styles.pick}>1</span>
                  <span className={`${styles.pick} ${styles.pickActive}`}>N</span>
                  <span className={styles.pick}>2</span>
                </div>
              </div>
              <div className={styles.status}>
                <span className={styles.statusLost}>✗ Perdu</span>
              </div>
            </article>

            <article className={styles.pronoCard}>
              <div className={styles.matchHeader}>
                <div className={styles.competition}>Champions League</div>
                <div className={styles.matchDate}>Mar. 20/01 - 20:00</div>
              </div>
              <div className={styles.matchInfo}>
                <p className={styles.teams}>Real Madrid - Bayern Munich</p>
                <div className={styles.choice}>
                  <span className={styles.pick}>1</span>
                  <span className={styles.pick}>N</span>
                  <span className={`${styles.pick} ${styles.pickActive}`}>2</span>
                </div>
              </div>
              <div className={styles.status}>
                <span className={styles.statusWon}>✓ Gagné</span>
              </div>
            </article>
          </div>
        </main>

        {/* 5. COLONNE DROITE : STATS RAPIDES */}
        <aside className={styles.statsSection}>
          <h2 className={styles.sidebarTitle}>Mes stats</h2>
          <div className={styles.statsGrid}>
            <div className={`${styles.statCard} ${styles.smallCard}`}>
              <span className={styles.statValue}>12</span>
              <span className={styles.statLabel}>Gagnés</span>
            </div>

            <div className={`${styles.statCard} ${styles.smallCard}`}>
              <span className={styles.statValue}>5</span>
              <span className={styles.statLabel}>Perdus</span>
            </div>

            <div className={`${styles.statCard} ${styles.smallCard}`}>
              <span className={styles.statValue}>8</span>
              <span className={styles.statLabel}>En attente</span>
            </div>

            <div className={`${styles.statCard} ${styles.smallCard}`}>
              <span className={styles.statValue}>70%</span>
              <span className={styles.statLabel}>Taux de réussite</span>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
