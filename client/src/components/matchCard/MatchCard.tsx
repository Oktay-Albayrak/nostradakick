/**
 * COMPOSANT MATCHCARD
 * * Affiche une carte de match avec :
 * - Les informations du match (compétition, équipes, date/heure ou score)
 * - Les boutons de prédiction (si connecté et match non terminé)
 * - L'état du pronostic de l'utilisateur (couleur du bouton)
 * * MODIFICATIONS :
 * - Si le match est FINISHED : Affiche le statut en bas et les noms sous les logos.
 * - Si la carte est en mode compact (Aside) : Garde l'affichage des TLA via .teamTla.
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Modal from "@/components/Modal/Modal";
import styles from "./MatchCard.module.css";
import { IMatch } from "@/types/match";

interface MatchProps {
  match: IMatch;
  isHot?: boolean;
  showPredictions?: boolean;
  showStatus?: boolean;
  showFullTeamNames?: boolean;
}

export default function MatchCard({
  match,
  isHot,
  showPredictions = true,
  showStatus = false,
}: MatchProps) {
  const { isLoggedIn, user_id } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPrediction, setSelectedPrediction] = useState<string | null>(
    null,
  );

  // Détermination du statut
  const isFinished = match.status === "FINISHED";

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "OK",
    isConfirmation: false,
    onConfirm: () => {},
  });

  const [pendingPrediction, setPendingPrediction] = useState<
    "HOME" | "DRAW" | "AWAY" | null
  >(null);

  // Récupération du pronostic
  useEffect(() => {
    if (!user_id || !match.id || isFinished) return;
    const fetchUserPrediction = async () => {
      try {
        const response = await fetch(
          `http://localhost:4000/api/predictions?user_id=${user_id}&match_id=${match.id}`,
          { credentials: "include" },
        );
        if (response.ok) {
          const prediction = await response.json();
          setSelectedPrediction(prediction.prediction_value);
        }
      } catch (error) {
        console.error("Erreur pronostic:", error);
      }
    };
    fetchUserPrediction();
  }, [user_id, match.id, isFinished]);

  if (!match) return null;

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      SCHEDULED: "📅 Programmé",
      TIMED: "⏰ À venir",
      IN_PLAY: "🔴 En cours",
      PAUSED: "⏸️ Mi-temps",
      FINISHED: "✅ Terminé",
      POSTPONED: "⏳ Reporté",
      CANCELLED: "❌ Annulé",
    };
    return statusMap[status] || status;
  };

  const handlePrediction = (predictionValue: "HOME" | "DRAW" | "AWAY") => {
    if (!isLoggedIn) {
      setModalConfig({
        isOpen: true,
        title: "⚠️ Non connecté",
        message: "Connectez-vous pour parier",
        confirmText: "OK",
        isConfirmation: false,
        onConfirm: () => {},
      });
      return;
    }
    setPendingPrediction(predictionValue);
    setModalConfig({
      isOpen: true,
      title: "⚽ Confirmation",
      message: "Confirmer votre pronostic ?",
      confirmText: "Confirmer",
      isConfirmation: true,
      onConfirm: () => {},
    });
  };

  const submitPrediction = async () => {
    if (!pendingPrediction || !user_id) return;
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:4000/api/predictions", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id,
          match_id: match.id,
          prediction_value: pendingPrediction,
        }),
      });
      if (response.ok) {
        setSelectedPrediction(pendingPrediction);
        setModalConfig({
          isOpen: true,
          title: "✅ Succès",
          message: "Enregistré !",
          confirmText: "OK",
          isConfirmation: false,
          onConfirm: () => {},
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const { day, time } = getFormattedDate(match.date);
  const homeTeam = match.home_team;
  const awayTeam = match.away_team;

  function getFormattedDate(dateString: string) {
    const matchDate = new Date(dateString);
    const now = new Date();
    const isToday = matchDate.toDateString() === now.toDateString();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const isTomorrow = matchDate.toDateString() === tomorrow.toDateString();
    const time = matchDate.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const day = isToday
      ? "Aujourd'hui"
      : isTomorrow
        ? "Demain"
        : `${matchDate.toLocaleDateString("fr-FR", { weekday: "short" })} ${matchDate.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}`;
    return { day, time };
  }

  // Le badge de statut s'affiche si forcé (Aside) ou si match fini
  const displayStatusBadge = isFinished || showStatus;

  return (
    <>
      <article
        className={`${styles.card} ${!showPredictions ? styles.compactCard : ""} ${displayStatusBadge ? styles.cardWithStatus : ""}`}
      >
        <section>
          <div className={styles.competitionBadge}>
            {match.competition.name}
          </div>
          {isHot && <span className={styles.hotBadge}>🔥</span>}
        </section>

        <Link
          href={`/matchs/${match.api_id}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <section className={styles.mainInfo}>
            {/* HOME TEAM */}
            <div className={styles.teamBox}>
              <div className={styles.crestContainer}>
                <Image
                  src={homeTeam.crest_url}
                  alt={homeTeam.tla}
                  width={65}
                  height={65}
                  unoptimized
                />
              </div>

              {/* CAS 1 : Vignette Compacte (Aside) -> Affiche le TLA simple */}
              {!showPredictions && !isFinished && (
                <span className={styles.teamTla}>{homeTeam.tla}</span>
              )}

              {/* CAS 2 : Match Terminé -> Affiche Nom (Desktop) ou TLA (Mobile) */}
              {isFinished && (
                <div className={styles.teamNameUnder}>
                  <span className={styles.btnFullName}>{homeTeam.name}</span>
                  <span className={styles.btnTlaName}>
                    {homeTeam.short_name}
                  </span>
                </div>
              )}
            </div>

            {/* SCORE OU DATE */}
            <div className={styles.dateTime}>
              {match.status === "FINISHED" ||
              match.status === "IN_PLAY" ||
              match.status === "PAUSED" ? (
                /* Affichage pour les scores (Finis ou Live) */
                <>
                  <span className={styles.dateLabel}>
                    {day} - {time}
                  </span>
                  {match.home_score !== null && (
                    <div className={styles.scoreBox}>
                      <span className={styles.scoreLabel}>
                        {match.home_score}
                      </span>
                      <span className={styles.scoreSeparator}>-</span>
                      <span className={styles.scoreLabel}>
                        {match.away_score}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                /* Affichage original (À venir) */
                <>
                  <span className={styles.dateLabel}>{day}</span>
                  <span className={styles.timeLabel}>{time}</span>
                </>
              )}
            </div>

            {/* AWAY TEAM */}
            <div className={styles.teamBox}>
              <div className={styles.crestContainer}>
                <Image
                  src={awayTeam.crest_url}
                  alt={awayTeam.tla}
                  width={65}
                  height={65}
                  unoptimized
                />
              </div>

              {!showPredictions && !isFinished && (
                <span className={styles.teamTla}>{awayTeam.tla}</span>
              )}

              {isFinished && (
                <div className={styles.teamNameUnder}>
                  <span className={styles.btnFullName}>{awayTeam.name}</span>
                  <span className={styles.btnTlaName}>
                    {awayTeam.short_name}
                  </span>
                </div>
              )}
            </div>

            {/* BADGE STATUT CENTRAL */}
            {displayStatusBadge && (
              <div className={styles.competitionBadgeStatus}>
                {getStatusLabel(match.status)}
              </div>
            )}
          </section>
        </Link>

        {match.featured_name && (
          <div className={styles.derbyName}>{match.featured_name}</div>
        )}

        {/* GRILLE DE PRONOS (Matchs à venir uniquement) */}
        {!isFinished && showPredictions && (
          <section
            className={styles.predictionGrid}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={`${styles.predButton} ${selectedPrediction === "HOME" ? styles.selected : ""}`}
              onClick={() => handlePrediction("HOME")}
              disabled={isLoading}
            >
              <span className={styles.btnFullName}>{homeTeam.name}</span>
              <span className={styles.btnTlaName}>{homeTeam.tla}</span>
            </button>
            <button
              className={`${styles.predButton} ${selectedPrediction === "DRAW" ? styles.selected : ""}`}
              onClick={() => handlePrediction("DRAW")}
              disabled={isLoading}
            >
              <span className={styles.btnFullName}>Match Nul</span>
              <span className={styles.btnTlaName}>NUL</span>
            </button>
            <button
              className={`${styles.predButton} ${selectedPrediction === "AWAY" ? styles.selected : ""}`}
              onClick={() => handlePrediction("AWAY")}
              disabled={isLoading}
            >
              <span className={styles.btnFullName}>{awayTeam.name}</span>
              <span className={styles.btnTlaName}>{awayTeam.tla}</span>
            </button>
          </section>
        )}
      </article>

      <Modal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={() =>
          modalConfig.isConfirmation
            ? submitPrediction()
            : setModalConfig({ ...modalConfig, isOpen: false })
        }
        onCancel={() => setModalConfig({ ...modalConfig, isOpen: false })}
        confirmText={modalConfig.confirmText}
        isConfirmation={modalConfig.isConfirmation}
      />
    </>
  );
}
