"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { IUser } from "@/types/user";
import { IUserStats } from "@/types/userStats";

export default function DashboardPage() {
  const [userInfo, setUserInfo] = useState<IUser | null>(null);
  const [userStats, setUserStats] = useState<IUserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // 1. Récupérer l'utilisateur connecté
        const userMeResponse = await fetch("http://localhost:4000/api/auth/me", {
          credentials: "include",
          cache: "no-store",
        });

        if (!userMeResponse.ok) {
          setUserInfo(null);
          setIsLoading(false);
          return;
        }

        const userData: IUser = await userMeResponse.json();
        setUserInfo(userData);

        // 2. Récupérer les stats complètes (avec pronos et stats)
        const statsResponse = await fetch(
          `http://localhost:4000/api/users/${userData.username}`,
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
        setUserInfo(null);
        setUserStats(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  if (!userInfo) {
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
          src={userInfo.avatar_url || "/default-avatar.jpg"}
          width={200}
          height={200}
          alt="Avatar du membre"
        />
        <div className={styles.bio}>
          <h2>{userInfo.username}</h2>
          <p>E-mail : {userInfo.email}</p>
          <p>Membre depuis : {new Date(userInfo.created_at).toLocaleDateString("fr-FR")}</p>
          <p>Rôle : {userInfo.role}</p>
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
            {userStats?.predictions?.slice(0, 4).map((p, index) => (
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
