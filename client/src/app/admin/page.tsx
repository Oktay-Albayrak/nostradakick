export const dynamic = "force-dynamic";

import { API_URL } from "@/config/api";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import styles from "./page.module.css";
import { IUser } from "@/types/user";
import AdminStats from "@/components/admin/AdminStats";

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

    const userResponse = await fetch(`${API_URL}/api/auth/me`, {
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

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>Tableau de bord administrateur</h1>
        <Link href="/" className={styles.backLink}>
          ← Retour à l&apos;accueil
        </Link>
      </div>

      <AdminStats />

      <section className={styles.actionsGrid}>
        <Link href="/admin/users" className={styles.actionCard}>
          <div className={styles.actionIcon}>👥</div>
          <h2 className={styles.actionTitle}>Gestionnaire users</h2>
          <p className={styles.actionDescription}>
            Gérer les utilisateurs, modifier leurs informations, réinitialiser les mots de passe
          </p>
        </Link>

        <Link href="/admin/matchs" className={styles.actionCard}>
          <div className={styles.actionIcon}>⚽</div>
          <h2 className={styles.actionTitle}>Gestionnaire matchs</h2>
          <p className={styles.actionDescription}>
            Ajouter, modifier et supprimer les matchs du site
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
