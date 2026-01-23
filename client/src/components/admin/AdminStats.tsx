"use client";

import { useEffect, useState } from "react";
import { IAdminStats } from "@/types/admin";
import styles from "../../app/admin/page.module.css";

function formatNumber(num: number): string {
  return num.toLocaleString("fr-FR");
}

export default function AdminStats() {
  const [stats, setStats] = useState<IAdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("http://localhost:4000/api/admin/stats", {
          credentials: "include", // Important : envoie automatiquement les cookies
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Erreur lors du chargement");
        }

        const data = await response.json();
        setStats(data);
      } catch (e) {
        setError("Erreur");
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        Chargement des statistiques...
      </div>
    );
  }

  if (error) {
    return null; // N'affiche rien en cas d'erreur
  }

  return (
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
  );
}
