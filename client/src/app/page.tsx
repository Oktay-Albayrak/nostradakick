import { API_URL } from "@/config/api";
/* eslint-disable react/no-unescaped-entities */
import styles from "./page.module.css";
import MatchCard from "@/components/matchCard/MatchCard";
import { IMatch } from "../types/match";
import SearchBar from "@/components/search/searchBar";
import Link from "next/link";
import { IPrediction } from "../types/prediction";
import Image from "next/image";
import TrendingBar from "@/components/TrendingBar/TrendingBar";
import HomeContent from "@/components/HomeContent/HomeContent";

export default async function Home() {
  // Récupération des matchs de l'API et on récupère 6 matchs à afficher
  const matchResponse = await fetch(`${API_URL}/api/matches`);
  if (!matchResponse.ok) {
    return <div>Erreur lors du chargement des matchs</div>;
  }

  const matchs: IMatch[] = await matchResponse.json();
  const homeMatchs = matchs.slice(0, 6);

  // Récupération des prédictions de l'API et on en récupère 4 à afficher
  const predictionsResponse = await fetch(
    `${API_URL}/api/predictions`,
  );
  if (!predictionsResponse.ok) {
    return <div>Erreur lors du chargement des derniers pronos</div>;
  }

  const predictions: IPrediction[] = await predictionsResponse.json();
  const pronos = predictions.slice(0, 4);

  return (
    <div className={styles.page}>
      <HomeContent
        hero={
          <>
            <header className={styles.hero}>
              {/* HERO SECTION */}
              <div className={styles.heroContent}>
                <span className={styles.heroBadge}>Saison 2025/2026</span>
                <h1 className={styles.heroTitle}>
                  Ne regardez plus le foot, <br />
                  <span className={styles.highlight}>
                    anticipez-le avec Nostradakick.
                  </span>
                </h1>
                <p className={styles.heroSubtitle}>
                  L'outil indispensable pour repérer les{" "}
                  <strong>sommets du football européen</strong> et partager vos{" "}
                  <strong>pronostics</strong> avec la communauté sur le Big 5 et
                  la Ligue des Champions.
                </p>
                <div className={styles.heroActions}>
                  <Link href="/matchs" className={styles.ctaPrimary}>
                    Explorer les matchs
                  </Link>
                  <Link href="/inscription" className={styles.ctaSecondary}>
                    Rejoindre l'élite
                  </Link>
                </div>
              </div>
            </header>
            {/* SEARCH BAR POSITIONNÉE À CHEVAL SUR LE HERO */}
            <section className={styles.searchOverlap}>
              <SearchBar />
            </section>
          </>
        }
        argumentsSection={
          <>
            {/* SECTION ARGUMENTS (Pourquoi Nostradakick ?) */}
            <section className={styles.featuresSection}>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>🔥</div>
                <h3>Détecteur de Chocs</h3>
                <p>
                  Notre algorithme identifie les vrais sommets du Big 5 et de la
                  Ligue des Champions.
                </p>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>📊</div>
                <h3>Stats Communautaires</h3>
                <p>
                  Visualisez les tendances de vote en temps réel sur chaque
                  affiche.
                </p>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>🏆</div>
                <h3>Historique Complet</h3>
                <p>
                  Accédez aux résultats passés pour affiner vos futures
                  analyses.
                </p>
              </div>
            </section>
          </>
        }
        trendingBar={
          <>
            {/* TRENDING BAR */}
            <div className={styles.trendingContainer}>
              <TrendingBar />
            </div>
          </>
        }
        mainGrid={
          <>
            {/* CONTENU PRINCIPAL (Ta grille actuelle optimisée) */}
            <main className={styles.container}>
              {" "}
              <section className={styles.mainGrid}>
                {/* MATCHS À VENIR */}
                <div>
                  <h2 className={styles.sectionTitle}>Matchs à venir</h2>

                  <div className={styles.matchGrid}>
                    {matchs.length > 0 ? (
                      homeMatchs.map((m) => {
                        // On crée une version locale du match pour la Home
                        const matchWithShortNames = {
                          ...m,
                          home_team: {
                            ...m.home_team,
                            name: m.home_team.short_name || m.home_team.name,
                          },
                          away_team: {
                            ...m.away_team,
                            name: m.away_team.short_name || m.away_team.name,
                          },
                        };

                        return (
                          <div key={m.id} className={styles.matchCardWrapper}>
                            <MatchCard
                              match={matchWithShortNames}
                              showPredictions={true}
                            />
                          </div>
                        );
                      })
                    ) : (
                      <p>Aucun match prévu pour le moment.</p>
                    )}
                  </div>

                  <Link className={styles.primaryButton} href="/matchs">
                    Voir tous les matchs
                  </Link>
                </div>

                {/* DERNIERS PRONOSTICS */}
                <div>
                  <h2 className={styles.sectionTitle}>Derniers pronostics</h2>

                  <div className={styles.pronoList}>
                    {predictions.length > 0 ? (
                      pronos.map((prediction) => (
                        <div key={prediction.id} className={styles.pronoRow}>
                          <div className={styles.userInfo}>
                            {/* Avatar stylisé */}
                            <div className={styles.avatarPlaceholder}>
                              {prediction.user.avatar_url ? (
                                <Image
                                  src={prediction.user.avatar_url}
                                  alt="avatar"
                                  width={32}
                                  height={32}
                                  className={styles.avatarImg}
                                />
                              ) : (
                                prediction.user.username.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div className={styles.pronoText}>
                              <Link
                                className={styles.userLink}
                                href={`/profil/${prediction.user.username}`}
                              >
                                {prediction.user.username}
                              </Link>
                              <span className={styles.pronoAction}>
                                {" "}
                                a pronostiqué sur{" "}
                              </span>
                              <Link
                                className={styles.pronoMatchLink}
                                href={`/matchs/${prediction.match.id}`}
                              >
                                {prediction.match.home_team.short_name} -{" "}
                                {prediction.match.away_team.short_name}
                              </Link>
                            </div>
                          </div>

                          <div className={styles.picks}>
                            {["HOME", "DRAW", "AWAY"].map((v) => (
                              <span
                                key={v}
                                className={`${styles.pick} ${prediction.prediction_value === v ? styles.pickActive : ""}`}
                              >
                                {v === "HOME" ? "1" : v === "DRAW" ? "N" : "2"}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p>Aucun pronostic pour le moment.</p>
                    )}
                  </div>

                  <Link href="/pronos" className={styles.primaryButton}>
                    Voir tous les pronostics
                  </Link>
                </div>
              </section>
            </main>
          </>
        }
      />
    </div>
  );
}
