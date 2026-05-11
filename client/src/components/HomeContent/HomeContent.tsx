/* eslint-disable react/no-unescaped-entities */
"use client";

import { API_URL } from "@/config/api";

import { useAuth } from "@/context/AuthContext";
import styles from "../../app/page.module.css";
import { useEffect, useState } from "react";
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
  const { isLoggedIn } = useAuth();
  const [currentUsername, setCurrentUsername] = useState("Champion");
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  useEffect(() => {
    // On ne lance le fetch que si l'utilisateur est considéré comme connecté
    if (isLoggedIn) {
      fetch(`${API_URL}/api/auth/me`, {
        method: "GET",
        // Si tu utilises des cookies (sessions), cette ligne est CRUCIALE :
        credentials: "include",
        // Si tu utilises un Token dans le localStorage, décommente ça :
        /* headers: { 
        "Authorization": `Bearer ${localStorage.getItem('votre_token_key')}` 
      } */
      })
        .then((res) => {
          if (!res.ok) throw new Error("Session invalide ou expirée");
          return res.json();
        })
        .then((data) => {
          // data devrait contenir l'objet utilisateur complet
          if (data && data.username) {
            setCurrentUsername(data.username);
            if (data.avatar) setUserAvatar(data.avatar);
          }
        })
        .catch((err) => {
          console.error("Erreur auth/me:", err);
          setCurrentUsername("Kickeur"); // Fallback propre
        });
    }
  }, [isLoggedIn]);

  const avatarUrl = userAvatar
    ? userAvatar
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
