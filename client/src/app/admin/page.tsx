import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import styles from "./page.module.css";
import { IAdminStats } from "@/types/admin";
import { IUser } from "@/types/user";

function formatNumber(num: number): string {
  return num.toLocaleString("fr-FR");
}

export default async function AdminDashboard() {
  // Récupération du cookie accessToken
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  // Vérification de l'authentification et du rôle ADMIN
  let currentUser: IUser | null = null;
  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    
    if (accessToken) {
      headers["Cookie"] = `accessToken=${accessToken}`;
    }

    const userResponse = await fetch("http://localhost:4000/api/auth/me", {
      cache: "no-store",
      headers,
    });

    if (userResponse.ok) {
      currentUser = await userResponse.json();
    }
  } catch (e) {
    console.error("Erreur lors de la vérification de l'utilisateur:", e);
  }

  // Redirection si non authentifié ou non admin
  if (!currentUser) {
    redirect("/login");
  }

  if (currentUser.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Récupération des statistiques
  let stats: IAdminStats | null = null;
  let error: string | null = null;

  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    
    if (accessToken) {
      headers["Cookie"] = `accessToken=${accessToken}`;
    }

    const response = await fetch("http://localhost:4000/api/admin/stats", {
      cache: "no-store",
      headers,
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

      <section className={styles.actionsGrid}>
        <Link href="/admin/users" className={styles.actionCard}>
          <div className={styles.actionIcon}>👥</div>
          <h2 className={styles.actionTitle}>Gestionnaire users</h2>
          <p className={styles.actionDescription}>
            Gérer les utilisateurs, modifier leurs informations, réinitialiser les mots de passe
          </p>
        </Link>

        <Link href="/admin/pronostics" className={styles.actionCard}>
          <div className={styles.actionIcon}>📊</div>
          <h2 className={styles.actionTitle}>Gestionnaire pronostics</h2>
          <p className={styles.actionDescription}>
            Consulter et gérer tous les pronostics des membres du site
          </p>
        </Link>
      </section>
    </main>
  );
}
