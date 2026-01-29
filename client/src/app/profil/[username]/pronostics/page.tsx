import styles from "./page.module.css";
import { notFound } from "next/navigation";
import { IUserStats } from "@/types/userStats";
import ReturnButton from "@/components/ReturnButton/ReturnButton";
import PredictionList from "./components/PredictionList";

// On définit le type des props
interface PageProps {
  params: Promise<{ username: string }>;
}

export default async function ProfilPronos({ params }: PageProps) {
  // 1. On récupère le username
  const { username } = await params;

  // 2. On récupère les données directement sur le serveur
  // Note : "cache: 'no-store'" ou "next: { revalidate: 60 }" permet de gérer la mise en cache
  const response = await fetch(`http://localhost:4000/api/users/${username}`, {
    cache: "no-store",
  });

  // 3. Si l'utilisateur n'est pas trouvé, on renvoie vers la page 404 de Next.js
  if (!response.ok) {
    notFound();
  }

  const user: IUserStats = await response.json();

  const sortedPredictions = user.predictions?.sort((a, b) =>
    new Date(b.match.date).getTime() - new Date(a.match.date).getTime()
  ) || [];

  // Calculs préparés côté serveur
  const wins = user.stats?.wins_count ?? 0;
  const losses = user.stats?.losses_count ?? 0;
  const totalGames = wins + losses;
  const points = Math.max(0, wins * 5 - losses); // Minimum 0 point
  const winRate = totalGames > 0 ? ((wins * 100) / totalGames).toFixed(2) : "0";

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
        <button className={styles.filterButton}>Filtres</button>
      </div>

      <section className={styles.mainGrid}>
        {/* 3. COLONNE GAUCHE : FILTRES PAR STATUT */}
        <aside className={styles.filterList}>
          <ReturnButton className={styles.returnButton}/>
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
          <h1 className={styles.sectionTitle}>Pronostics de {user.username}</h1>
          <PredictionList
            predictions={sortedPredictions}
          />
        </main>

        {/* 5. COLONNE DROITE : STATS RAPIDES */}
        <aside className={styles.statsSection}>
          <h2 className={styles.sidebarTitle}>Mes stats</h2>
          <div className={styles.statsGrid}>
            <div className={`${styles.statCard} ${styles.smallCard}`}>
              <span className={styles.statValue}>{wins}</span>
              <span className={styles.statLabel}>Gagnés</span>
            </div>

            <div className={`${styles.statCard} ${styles.smallCard}`}>
              <span className={styles.statValue}>{losses}</span>
              <span className={styles.statLabel}>Perdus</span>
            </div>

            <div className={`${styles.statCard} ${styles.smallCard}`}>
              <span className={styles.statValue}>{points}</span>
              <span className={styles.statLabel}>points</span>
            </div>

            <div className={`${styles.statCard} ${styles.smallCard}`}>
              <span className={styles.statValue}>{winRate}%</span>
              <span className={styles.statLabel}>Taux de réussite</span>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
