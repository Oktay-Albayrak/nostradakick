import Link from "next/link";
import styles from "./page.module.css";
import { IAdminStats } from "@/types/admin";

function formatNumber(num: number): string {
  return num.toLocaleString("fr-FR");
}

export default async function AdminDashboard() {
  let stats: IAdminStats | null = null;
  let error: string | null = null;

  try {
    const response = await fetch("http://localhost:4000/api/admin/stats", {
      cache: "no-store",
    });

    if (!response.ok) {
      error = "Erreur lors du chargement des statistiques";
    } else {
      stats = await response.json();
    }
  } catch (e) {
    error = "Impossible de charger les statistiques";
    console.error("Erreur:", e);
  }

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>Tableau de bord administrateur</h1>
        <Link href="/" className={styles.backLink}>
          ← Retour à l&apos;accueil
        </Link>
      </div>

      {error ? (
        <div className={styles.errorMessage}>{error}</div>
      ) : (
        <section className={styles.statsGrid}>
          <article className={styles.statCard}>
            <div className={styles.statIcon}>👥</div>
            <div className={styles.statContent}>
              <h3 className={styles.statValue}>
                {stats ? formatNumber(stats.usersCount) : "0"}
              </h3>
              <p className={styles.statLabel}>Utilisateurs</p>
            </div>
          </article>

          <article className={styles.statCard}>
            <div className={styles.statIcon}>📊</div>
            <div className={styles.statContent}>
              <h3 className={styles.statValue}>
                {stats ? formatNumber(stats.predictionsCount) : "0"}
              </h3>
              <p className={styles.statLabel}>Pronostics</p>
            </div>
          </article>

          <article className={styles.statCard}>
            <div className={styles.statIcon}>⚽</div>
            <div className={styles.statContent}>
              <h3 className={styles.statValue}>
                {stats ? formatNumber(stats.matchesCount) : "0"}
              </h3>
              <p className={styles.statLabel}>Matchs</p>
            </div>
          </article>

          <article className={styles.statCard}>
            <div className={styles.statIcon}>🏆</div>
            <div className={styles.statContent}>
              <h3 className={styles.statValue}>
                {stats ? formatNumber(stats.competitionsCount) : "0"}
              </h3>
              <p className={styles.statLabel}>Compétitions</p>
            </div>
          </article>
        </section>
      )}
    </main>
  );
}
