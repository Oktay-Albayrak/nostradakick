import MatchCard from "@/components/matchCard/MatchCard";
import styles from "./page.module.css";

export default async function Matchs() {
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
        <button className={styles.filterButton}>Compétitions</button>
      </div>

      <section className={styles.mainGrid}>
        {/* 3. COLONNE GAUCHE : LISTE DES COMPETITIONS */}
        <aside className={styles.competitionList}>
          <h2 className={styles.sidebarTitle}>Top Compétitions</h2>
          <ul>
            <li>CAN 2025</li>
            <li>Ligue 1</li>
            <li>Premer League</li>
            <li>Liga</li>
            <li>Bundesliga</li>
            <li>Champions League</li>
            <li>Serie A</li>
            <li>FIFA World Cup</li>
          </ul>
        </aside>
        {/* 4. COLONNE CENTRALE : MATCHS À VENIR */}
        <main className={styles.matchsContent}>
          <h1 className={styles.sectionTitle}>Matchs à venir</h1>

          <MatchCard />

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
        </main>

        {/* 5. COLONNE DROITE : À L'AFFICHE */}
        <aside className={styles.featuredSection}>
          <h2 className={styles.sidebarTitle}>A l&apos;Affiche</h2>
          <div className={styles.featuredGrid}>
            {/* Cartes plus petites */}
            <div className={`${styles.matchCard} ${styles.smallCard}`}>
              <span className={styles.hotBadge} title="Match à l'affiche">
                🔥
              </span>
              <p className={styles.teams}>PFC - OL</p>
              <p className={styles.matchMeta}>Ven. 16/01</p>
              <p className={styles.matchMeta}>21:00</p>
            </div>

            <div className={`${styles.matchCard} ${styles.smallCard}`}>
              {" "}
              <p className={styles.teams}>SCF - HCS</p>
              <p className={styles.matchMeta}>Ven. 16/01</p>
              <p className={styles.matchMeta}>21:00</p>
            </div>

            <div className={`${styles.matchCard} ${styles.smallCard}`}>
              {" "}
              <p className={styles.teams}>PSG - LOSC</p>
              <p className={styles.matchMeta}>Ven. 16/01</p>
              <p className={styles.matchMeta}>21:00</p>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
