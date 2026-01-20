import Link from "next/link";
import styles from "./page.module.css";

export default async function AdminDashboard() {

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>Tableau de bord administrateur</h1>
        <Link href="/" className={styles.backLink}>
          ← Retour à l&apos;accueil
        </Link>
      </div>

      <section className={styles.statsGrid}>
        <article className={styles.statCard}>
          <div className={styles.statIcon}>👥</div>
          <div className={styles.statContent}>
            <h3 className={styles.statValue}>1,234</h3>
            <p className={styles.statLabel}>Utilisateurs</p>
          </div>
        </article>

        <article className={styles.statCard}>
          <div className={styles.statIcon}>📊</div>
          <div className={styles.statContent}>
            <h3 className={styles.statValue}>5,678</h3>
            <p className={styles.statLabel}>Pronostics</p>
          </div>
        </article>

        <article className={styles.statCard}>
          <div className={styles.statIcon}>⚽</div>
          <div className={styles.statContent}>
            <h3 className={styles.statValue}>890</h3>
            <p className={styles.statLabel}>Matchs</p>
          </div>
        </article>

        <article className={styles.statCard}>
          <div className={styles.statIcon}>🏆</div>
          <div className={styles.statContent}>
            <h3 className={styles.statValue}>12</h3>
            <p className={styles.statLabel}>Compétitions</p>
          </div>
        </article>
      </section>

    </main>
  );
}
