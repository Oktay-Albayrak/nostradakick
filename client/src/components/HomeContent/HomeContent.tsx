/* eslint-disable react/no-unescaped-entities */
"use client";

import { useAuth } from "@/context/AuthContext";
import styles from "../../app/page.module.css";
import Image from "next/image";

interface HomeContentProps {
  hero: React.ReactNode;
  argumentsSection: React.ReactNode;
  trendingBar: React.ReactNode;
  mainGrid: React.ReactNode;
}

export default function HomeContent({
  hero,
  argumentsSection,
  trendingBar,
  mainGrid,
}: HomeContentProps) {
  const { isLoggedIn, user } = useAuth();

  const currentUsername = user?.username ?? "Kickeur";
  const avatarUrl = user?.avatar_url
    ? user.avatar_url
    : `https://api.dicebear.com/7.x/adventurer/png?seed=${currentUsername}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

  return (
    <>
      {/* Affiché uniquement pour les visiteurs */}
      {!isLoggedIn ? (
        <>
          {hero}
          <main className={styles.container}>{argumentsSection}</main>
        </>
      ) : (
        /* CE QUI S'AFFICHE POUR LES CONNECTÉS À LA PLACE DU HERO */
        <div className={styles.welcomeSection}>
          <div className={styles.welcomeInner}>
            <div className={styles.welcomeMain}>
              <div className={styles.profileHeader}>
                <div className={styles.avatarWrapper}>
                  <Image
                    src={avatarUrl}
                    alt="Avatar"
                    width={65}
                    height={65}
                    className={styles.avatar}
                  />
                </div>
                <h1 className={styles.welcomeTitle}>
                  Content de te revoir sur NostradaKick,{" "}
                  <span className={styles.username}>{currentUsername}</span>
                </h1>
              </div>
              <p className={styles.welcomeSubtitle}>
                Prêt pour une nouvelle série de victoires ?
              </p>
            </div>
            <div className={styles.dateContainer}>
              <div className={styles.dateBadge}>
                {new Date().toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toujours affiché : Le ruban bleu */}
      {trendingBar}

      {/* Toujours affiché : La grille de matchs/pronos */}
      {/* On ajoute une marge en haut si on est connecté pour l'esthétique */}
      <div style={isLoggedIn ? { marginTop: "3rem" } : {}}>{mainGrid}</div>
    </>
  );
}
