import MatchCard from "@/components/matchCard/MatchCard";
import styles from "./page.module.css";
import { IMatch } from "@/types/match";

export default async function Matchs() {
  const response = await fetch("http://localhost:5000/api/matches");
  if (!response.ok) {
    return <div>Erreur lors du chargement des matchs</div>;
  }

  const matchs: IMatch[] = await response.json();
  const featuredMatchs = matchs.slice(0, 3);

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
          <div className={styles.matchGrid}>
            {matchs.length > 0 ? (
              matchs.map((m) => <MatchCard key={m.id} match={m} />)
            ) : (
              <p>Aucun match prévu pour le moment.</p>
            )}
          </div>
        </main>

        {/* 5. COLONNE DROITE : À L'AFFICHE */}
        <aside className={styles.featuredSection}>
          <h2 className={styles.sidebarTitle}>A l&apos;Affiche</h2>
          <div className={styles.featuredGrid}>
            {featuredMatchs.map((m) => (
              <MatchCard
                key={`featured-${m.id}`}
                match={m}
                showPredictions={false}
                isHot={true}
              />
            ))}
          </div>
        </aside>
      </section>
    </div>
  );
}
