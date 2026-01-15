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
          <MatchCard />
          <MatchCard isHot={true} />
          <MatchCard isHot={true} />
          <MatchCard />
          <MatchCard isHot={true} />
          <MatchCard isHot={true} />
          <MatchCard />
          <MatchCard isHot={true} />
          <MatchCard isHot={true} />
        </main>

        {/* 5. COLONNE DROITE : À L'AFFICHE */}
        <aside className={styles.featuredSection}>
          <h2 className={styles.sidebarTitle}>A l&apos;Affiche</h2>
          <div className={styles.featuredGrid}>
            {/* Cartes plus petites */}
            <MatchCard showPredictions={false} isHot={true} />
            <MatchCard showPredictions={false} />
            <MatchCard showPredictions={false} />
            <MatchCard showPredictions={false} />
            <MatchCard showPredictions={false} />
          </div>
        </aside>
      </section>
    </div>
  );
}
