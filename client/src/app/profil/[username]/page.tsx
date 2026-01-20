"use client"

import Image from "next/image";
import styles from "./page.module.css";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IUser } from "@/types/user";



export default function Page({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = use(params);

  const [user, setUser] = useState<IUser | null>(null);

  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/users/${username}`, {
          method: "GET",
        });

        if (!response.ok) { router.push("/404") }

        const data = await response.json()
        setUser(data)
      
      } catch (error) {
        console.error("Erreur", error);
        router.push("/404");
      }
    };

    getUser();

  }, [username, router])

  const totalGames = (user?.stats?.wins_count ?? 0) + (user?.stats?.losses_count ?? 0);

  return (
    <main className={styles.main}>
      <section className={styles.profil}>
        <Image
          className={styles.avatar}
          src="/default-avatar.jpg"
          width={200}
          height={200}
          alt="Avatar du membre"
        />
        <div className={styles.bio}>
          <h2>{user?.username}</h2>
          <p>Membre depuis 02/2021</p>
          <p>{(user?.stats?.wins_count ?? 0) + (user?.stats?.losses_count ?? 0)} pronostics</p>
          <p>{(user?.stats?.wins_count ?? 0) * 5 - (user?.stats?.losses_count ?? 0)} points</p>
        </div>
      </section>
      <div className={styles.wrapper}>
        <section className={styles.pronos}>
          <h2>Derniers pronos</h2>
          <div>
            {user?.predictions.slice(0, 4).map((p, index) => (
              <article key={index} className={styles.prono}>
                <p>{user?.predictions[index].match.home_team.name} - {user?.predictions[index].match.away_team.name}</p>
                <div className={styles.choice}>
                  <p className={p.prediction_value === "HOME" ? styles.active : ""}>1</p>
                  <p className={p.prediction_value === "DRAW" ? styles.active : ""}>N</p>
                  <p className={p.prediction_value === "AWAY" ? styles.active : ""}>2</p>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className={styles.stats}>
          <h2>Statistiques</h2>
          <div>
            <article className={styles.stat}>
              <Image
                className={styles.logo}
                src="/croissance.png"
                width={50}
                height={50}
                alt="Logo - Retourner vers l'accueil"
              />
              <p>Meilleure série: {user?.stats?.best_streak}</p>
            </article>
            <article className={styles.stat}>
              <Image
                className={styles.logo}
                src="/prix.png"
                width={50}
                height={50}
                alt="Logo - Retourner vers l'accueil"
              />
              <p>Pronos gagnants: {(user?.stats?.wins_count ?? 0)}</p>
            </article>
            <article className={styles.stat}>
              <Image
                className={styles.logo}
                src="/taux.png"
                width={50}
                height={50}
                alt="Logo - Retourner vers l'accueil"
              />
              <p>Taux de réussite: {((user?.stats?.wins_count ?? 0) * 100 / totalGames).toFixed(2)}%</p>
            </article>
          </div>
        </section>
      </div>
    </main>
  )
}