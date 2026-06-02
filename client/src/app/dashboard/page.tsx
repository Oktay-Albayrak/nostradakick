"use client";

import { API_URL } from "@/config/api";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { IUserStats } from "@/types/userStats";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { user, isLoggedIn } = useAuth();

  const [userStats, setUserStats] = useState<IUserStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {

    if (!isLoggedIn || !user) {
      setIsLoadingStats(false);
      return;
    }


    const loadStats = async () => {
      try {
        // 1. Récupérer l'utilisateur connecté
        const statsResponse = await fetch(
          `${API_URL}/api/auth/me`, 
          {
          cache: "no-store",
        }
      );

        if (statsResponse.ok) {
          const statsData: IUserStats = await statsResponse.json(); 
          setUserStats(statsData);
        } else {
          setUserStats(null);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        setUserStats(null);
      } finally {
        setIsLoadingStats(false);
      }
    };

    loadStats();
  }, [isLoggedIn, user]);

  if (isLoadingStats) {
    return <div>Chargement...</div>;
  }

  if (!user) {
    return (
      <div>
        Non connecté. <Link href="/login">Se connecter</Link>
      </div>
    );
  }

  return (
    <main className={styles.main}>
      <section className={styles.profil}>
        <Image
          className={styles.avatar}
          src={user.avatar_url || "/default-avatar.jpg"}
          width={200}
          height={200}
          alt="Avatar du membre"
        />
        <div className={styles.bio}>
          <h2>{user.username}</h2>
          <p>E-mail : {user.email}</p>
          <p>Membre depuis : {new Date(user.created_at).toLocaleDateString("fr-FR")}</p>
          <p>{user.role}</p>
          <p>{userStats?.predictions?.length ?? 0} pronostics</p>
          <p>
            {userStats?.stats
              ? Math.max(0, userStats.stats.wins_count * 5 - (userStats.stats.losses_count || 0))
              : 0}{" "}
            points gagnés
          </p>
          <Link href="/profil/edit" className={styles.editButton}>
            Modifier mon profil
          </Link>
        </div>
      </section>
      <div className={styles.wrapper}>
        <section className={styles.pronos}>
          <div className={styles.pronosHeader}>
            <h2>Mes derniers pronos</h2>
          </div>
          <div>
            {userStats?.predictions?.sort((a, b) => new Date(b.match.date).getTime() - new Date(a.match.date).getTime()).slice(0, 4).map((p, index) => (
              <article key={p.id || index} className={styles.prono}>
                <p>
                  {p.match.home_team.name} - {p.match.away_team.name}
                </p>
                <div className={styles.choice}>
                  <p className={p.prediction_value === "HOME" ? styles.active : ""}>1</p>
                  <p className={p.prediction_value === "DRAW" ? styles.active : ""}>N</p>
                  <p className={p.prediction_value === "AWAY" ? styles.active : ""}>2</p>
                </div>
              </article>
            ))}
            <Link href="/dashboard/pronostics" className={styles.viewAllLink}>
              Voir tous mes pronostics →
            </Link>
          </div>
        </section>
        <section className={styles.stats}>
          <h2>Mes statistiques</h2>
          <div>
            <article className={styles.stat}>
              <Image
                className={styles.logo}
                src="/croissance.png"
                width={50}
                height={50}
                alt="Meilleure série gagnante"
              />
              <p>Meilleure série gagnante : {userStats?.stats?.best_streak ?? 0}</p>
            </article>
            <article className={styles.stat}>
              <Image
                className={styles.logo}
                src="/prix.png"
                width={50}
                height={50}
                alt="Pronostics gagnants"
              />
              <p>Pronostics gagnants : {userStats?.stats?.wins_count ?? 0}</p>
            </article>
            <article className={styles.stat}>
              <Image
                className={styles.logo}
                src="/taux.png"
                width={50}
                height={50}
                alt="Taux de réussite"
              />
              <p>
                Taux de réussite :{" "}
                {userStats?.stats && userStats.stats.wins_count + userStats.stats.losses_count > 0
                  ? (
                      ((userStats.stats.wins_count * 100) /
                        (userStats.stats.wins_count + userStats.stats.losses_count)) as number
                    ).toFixed(2)
                  : 0}
                %
              </p>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
