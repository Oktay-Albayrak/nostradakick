import styles from "./page.module.css";

export default function Home() {
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
            <div className={styles.matchCard}>
              <p className={styles.teams}>HAC - OM</p>
              <p className={styles.matchMeta}>Ven. 16/01</p>
              <p className={styles.matchMeta}>21:00</p>
            </div>

            <div className={styles.matchCard}>
              <p className={styles.teams}>PFC - OL</p>
              <p className={styles.matchMeta}>Ven. 16/01</p>
              <p className={styles.matchMeta}>21:00</p>
            </div>

            <div className={styles.matchCard}>
              <p className={styles.teams}>SCF - HCS</p>
              <p className={styles.matchMeta}>Ven. 16/01</p>
              <p className={styles.matchMeta}>21:00</p>
            </div>

            <div className={styles.matchCard}>
              <p className={styles.teams}>PSG - LOSC</p>
              <p className={styles.matchMeta}>Ven. 16/01</p>
              <p className={styles.matchMeta}>21:00</p>
            </div>
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
              <span className={styles.pronoLabel}>ParisienFou | PSG - LOSC</span>
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