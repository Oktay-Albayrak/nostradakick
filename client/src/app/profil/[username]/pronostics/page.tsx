import Link from "next/link";
import styles from "./page.module.css";
import { notFound } from "next/navigation";
import { IUserStats } from "@/types/userStats";

// On définit le type des props
interface PageProps {
  params: Promise<{ username: string }>;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);

  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'short', // "mer."
    day: '2-digit',   // "07"
    month: '2-digit', // "01"
    hour: '2-digit',  // "19"
    minute: '2-digit' // "45"
  }).format(date);
};

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

  // Calculs préparés côté serveur
  const wins = user.stats?.wins_count ?? 0;
  const losses = user.stats?.losses_count ?? 0;
  const totalGames = wins + losses;
  const points = wins * 5 - losses;
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
            {user.predictions?.map((p, index) => (
              <article key={p.id || index} className={styles.pronoCard}>
                <div className={styles.matchHeader}>
                  <div className={styles.competition}>{p.match.competition.name}</div>
                  <div className={styles.matchDate}>{formatDate(p.match.date)}</div>
                </div>
                <div className={styles.matchInfo}>
                  <p className={styles.teams}>{p.match.home_team.name} - {p.match.away_team.name}</p>
                  <div className={styles.choice}>
                    <span className={`${styles.pick} ${p.prediction_value === "HOME" ? styles.pickActive : ""}`}>1</span>
                    <span className={`${styles.pick} ${p.prediction_value === "DRAW" ? styles.pickActive : ""}`}>N</span>
                    <span className={`${styles.pick} ${p.prediction_value === "AWAY" ? styles.pickActive : ""}`}>2</span>
                  </div>
                </div>
                <div className={styles.status}>
                  <span className={styles.statusPending}>{p.status}</span>
                </div>
              </article>
            ))}
          </div>
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
