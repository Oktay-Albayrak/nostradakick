"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import styles from "./page.module.css";
import { useAuth } from "@/context/AuthContext";
import AdminStats from "@/components/admin/AdminStats";

export default function AdminDashboard() {
  const { isLoggedIn, role } = useAuth();
  const router = useRouter();
  const isAuthorized = isLoggedIn && role === "ADMIN";

  useEffect(() => {
    // Pas connecté → /login
    if (!isLoggedIn) {
      router.replace("/login");
      return;
    }

    // Connecté mais pas ADMIN → /dashboard
    if (role !== "ADMIN") {
      router.replace("/dashboard");
      return;
    }

    // Connecté + ADMIN → autorisé
  }, [isLoggedIn, role, router]);

  if (!isAuthorized) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        Chargement...
      </div>
    );
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