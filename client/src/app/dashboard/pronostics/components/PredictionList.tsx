"use client"; // Obligatoire pour le state

import { useState } from "react";
import styles from "./page.module.css";
import { IPrediction } from "@/types/match";

interface Props {
  predictions: IPrediction[];
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);

  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'short', // "mer."
    day: '2-digit',   // "07"
    month: '2-digit', // "01"
    hour: '2-digit',  // "19"
    minute: '2-digit' // "45"
  }).format(date);
};

export default function PredictionList({ predictions }: Props) {
  const [visibleCount, setVisibleCount] = useState(10);

  const showMore = () => {
    setVisibleCount((prev) => prev + 10);
  };

  const visiblePredictions = predictions.slice(0, visibleCount);

  return (
    <>
      <div className={styles.pronosticsGrid}>
        {visiblePredictions.map((p, index) => (
          <article key={p.id || index} className={styles.pronoCard}>
            <div className={styles.matchHeader}>
              <div className={styles.competition}>{p.match.competition.name}</div>
              <div className={styles.matchDate}>{formatDate(p.match.date)}</div>
            </div>
            <div className={styles.matchInfo}>
              <p className={styles.teams}>{p.match.home_team.name} - {p.match.away_team.name}</p>
              {p.status === "PENDING" &&
                <div className={styles.choice}>
                  <span className={`${styles.pick} ${p.prediction_value === "HOME" ? styles.pickActive : ""}`}>1</span>
                  <span className={`${styles.pick} ${p.prediction_value === "DRAW" ? styles.pickActive : ""}`}>N</span>
                  <span className={`${styles.pick} ${p.prediction_value === "AWAY" ? styles.pickActive : ""}`}>2</span>
                </div>
              }
              {(["LOST", "WON"].includes(p.status) && p.match.home_score !== null && p.match.away_score !== null) && (() => {
                const h = p.match.home_score;
                const a = p.match.away_score;
                const actualResult = h > a ? "HOME" : a > h ? "AWAY" : "DRAW";

                return (
                  <div className={styles.choice}>
                    <span className={`
                          ${styles.pick}
                          ${actualResult === "HOME" ? styles.pickGood : ""} 
                          ${p.prediction_value === "HOME" && actualResult !== "HOME" ? styles.pickWrong : ""}
                        `}>
                      1
                    </span>
                    <span className={`
                          ${styles.pick}
                          ${actualResult === "DRAW" ? styles.pickGood : ""}
                          ${p.prediction_value === "DRAW" && actualResult !== "DRAW" ? styles.pickWrong : ""}
                        `}>
                      N
                    </span>
                    <span className={`
                          ${styles.pick}
                          ${actualResult === "AWAY" ? styles.pickGood : ""}
                          ${p.prediction_value === "AWAY" && actualResult !== "AWAY" ? styles.pickWrong : ""}
                        `}>
                      2
                    </span>
                  </div>
                );
              })()}

            </div>
            <div className={styles.status}>
              {p.status === "PENDING" ? (
                <span className={styles.statusPending}>En attente</span>
              )
                : (p.status === "WON" ? (
                  <span className={styles.statusWon}>✓ Gagné</span>
                )
                  : (
                    <span className={styles.statusLost}>✗ Perdu</span>
                  ))}
            </div>
          </article>
        ))}
      </div>

      {visibleCount < predictions.length && (
        <button onClick={showMore} className={styles.loadMoreButton}>
          Voir plus de pronostics
        </button>
      )}
    </>
  );
}