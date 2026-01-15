import Image from "next/image";
import styles from "./MatchCard.module.css";
/* import { Competition, Match, Team } from "@prisma-db"; */

interface MatchProps {
  /* match: Match; */
  isHot?: boolean /* Afficher ou non le hotBadge */;
  showPredictions?: boolean /* Afficher ou non les boutons */;
}

export default function MatchCard({
  /* match, */
  isHot,
  showPredictions = true,
}: MatchProps) {
  const staticMatch = {
    home_team: {
      name: "Paris Saint-Germain",
      tla: "PSG",
      crest_url: "https://crests.football-data.org/524.png",
    },
    away_team: {
      name: "Olympique de Marseille",
      tla: "OM",
      crest_url: "https://crests.football-data.org/516.png",
    },
    date: "2026-01-16T21:00:00",
    competition: { name: "Ligue 1" },
  };

  const m = staticMatch;

  return (
    <div>
      <article
        className={`${styles.card} ${
          !showPredictions ? styles.compactCard : ""
        }`}
      >
        <section>
          <div className={styles.competitionBadge}>Competition</div>
          {isHot && <span className={styles.hotBadge}>🔥</span>}
        </section>
        <section className={styles.mainInfo}>
          {/* HOME TEAM */}
          <div className={styles.teamBox}>
            <div className={styles.crestContainer}>
              <Image
                src={m.home_team.crest_url}
                alt={`logo-{m.home_team.tla}`}
                width={65}
                height={65}
              />
            </div>
            {!showPredictions && (
              <span className={styles.teamNameUnder}>{m.home_team.tla}</span>
            )}
          </div>
          {/* TIMESTAMP */}
          <div className={styles.dateTime}>
            <p className={styles.dateText}>Date</p>
            <p className={styles.timeText}>Heure</p>
          </div>
          {/* AWAY TEAM */}
          <div className={styles.teamBox}>
            <div className={styles.crestContainer}>
              <Image
                src={m.away_team.crest_url}
                alt="logo_olympique-marseille"
                width={65}
                height={65}
              />
            </div>
            {!showPredictions && (
              <span className={styles.teamNameUnder}>{m.away_team.tla}</span>
            )}
          </div>
        </section>
        {/* Affichage conditionnel des boutons */}
        {showPredictions && (
          <section className={styles.predictionGrid}>
            {/* Bouton Victoire Domicile */}
            <button className={styles.predButton}>
              <span className={styles.btnFullName}>{m.home_team.name}</span>
              <span className={styles.btnTlaName}>{m.home_team.tla}</span>
            </button>

            {/* Bouton Nul (Le texte "Nul" reste souvent identique) */}
            <button className={styles.predButton}>
              <span className={styles.btnFullName}>Match Nul</span>
              <span className={styles.btnTlaName}>NUL</span>
            </button>

            {/* Bouton Victoire Extérieur */}
            <button className={styles.predButton}>
              <span className={styles.btnFullName}>{m.away_team.name}</span>
              <span className={styles.btnTlaName}>{m.away_team.tla}</span>
            </button>
          </section>
        )}
      </article>
    </div>
  );
}
