/**
 * COMPOSANT MATCHCARD
 * 
 * Affiche une carte de match avec :
 * - Les informations du match (compétition, équipes, date/heure ou score)
 * - Les boutons de prédiction (si connecté et match non terminé)
 * - L'état du pronostic de l'utilisateur (couleur du bouton)
 * 
 * Props :
 * - match: objet IMatch contenant tous les détails du match
 * - isHot: affiche un badge 🔥 si c'est un match "à l'affiche"
 * - showPredictions: affiche les boutons de prédiction (défaut: true)
 * - showStatus: affiche le badge de statut du match (défaut: false)
 * - showFullTeamNames: affiche les noms complets des équipes (défaut: false)
 * 
 * Cliquable : cliquer sur la carte redirige vers /matchs/{api_id}
 * Les boutons de prédiction ne déclenchent pas la navigation.
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
  isHot?: boolean /* Afficher ou non le hotBadge */;
  showPredictions?: boolean /* Afficher ou non les boutons */;
  showStatus?: boolean /* Afficher ou non le badge de statut */;
  showFullTeamNames?: boolean /* Afficher le nom complet des équipes */;
}

export default function MatchCard({
  match,
  isHot,
  showPredictions = true,
  showStatus = false,
  showFullTeamNames = false,
}: MatchProps) {
  // Récupération du contexte d'authentification
  const { isLoggedIn, user_id } = useAuth();
  
  // État pour gérer le chargement lors de la soumission d'une prédiction
  const [isLoading, setIsLoading] = useState(false);
  
  // État pour stocker la prédiction sélectionnée par l'utilisateur ("HOME", "DRAW", "AWAY")
  const [selectedPrediction, setSelectedPrediction] = useState<string | null>(null);

  // États pour gérer les modals
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    isConfirmation: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "OK",
    isConfirmation: false,
    onConfirm: () => {},
  });

  // Valeur temporaire du pronostic en attente de confirmation
  const [pendingPrediction, setPendingPrediction] = useState<"HOME" | "DRAW" | "AWAY" | null>(null);

  /**
   * USEEFFECT - CHARGER LE PRONOSTIC EXISTANT
   * 
   * S'exécute quand :
   * - user_id change (utilisateur connecté/déconnecté)
   * - match.id change (nouveau match affiché)
   * 
   * Objectif :
   * - Récupère le pronostic existant de cet utilisateur pour ce match
   * - Affiche le bouton choisi en couleur différente (classe .selected)
   * - Persiste même après un refresh ou un changement de page
   * 
   * Appel API :
   * - GET /api/predictions?user_id=X&match_id=Y
   */
  useEffect(() => {
    if (!user_id || !match.id) return;

    const fetchUserPrediction = async () => {
      try {
        console.log("🔍 Chargement du pronostic existant pour user:", user_id, "match:", match.id);
        const response = await fetch(
          `http://localhost:4000/api/predictions?user_id=${user_id}&match_id=${match.id}`,
          { credentials: "include" }
        );

        if (response.ok) {
          const prediction = await response.json();
          console.log("✅ Prédiction existante trouvée:", prediction.prediction_value);
          setSelectedPrediction(prediction.prediction_value);
        } else if (response.status === 404) {
          console.log("ℹ️ Aucun pronostic existant pour ce match");
          setSelectedPrediction(null);
        } else {
          console.error("❌ Erreur API:", response.status);
        }
      } catch (error) {
        console.error("💥 Erreur lors du chargement du pronostic:", error);
      }
    };

    fetchUserPrediction();
  }, [user_id, match.id]);

  // Si pour une raison X le match est absent, on affiche rien
  if (!match) return null;

  // Fonction pour obtenir le label du statut
  /**
   * FONCTION GETSTATUSLABEL
   * 
   * Traduit les statuts en français avec émojis.
   * Utilisée pour afficher le badge de statut du match.
   * 
   * Statuts possibles :
   * - SCHEDULED : Match programmé
   * - IN_PLAY : Match en cours
   * - FINISHED : Match terminé
   * - POSTPONED : Match reporté
   * - CANCELLED : Match annulé
   * etc.
   */
  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      "SCHEDULED": "📅 Programmé",
      "TIMED": "⏰ À venir",
      "IN_PLAY": "🔴 En cours",
      "PAUSED": "⏸️ Mi-temps",
      "FINISHED": "✅ Terminé",
      "POSTPONED": "⏳ Reporté",
      "CANCELLED": "❌ Annulé",
    };
    return statusMap[status] || status;
  };

  // Fonction pour créer/mettre à jour une prédiction
  /**
   * FONCTION HANDLEPREDICTION
   * 
   * Gère toute la logique de création/modification d'une prédiction :
   * 
   * Étapes :
   * 1. Vérifie que l'utilisateur est connecté (sinon alerte)
   * 2. Affiche un modal de confirmation avec le choix
   * 3. Si "Modifier" : indique que c'est une modification
   * 4. Envoie POST à /api/predictions avec :
   *    - user_id (UUID)
   *    - match_id (UUID)
   *    - prediction_value ("HOME", "DRAW", "AWAY")
   * 5. Affiche un message de succès dans un modal
   * 
   * Upsert Pattern :
   * - Si (user_id, match_id) existe : mise à jour
   * - Sinon : création
   */
  const handlePrediction = (predictionValue: "HOME" | "DRAW" | "AWAY") => {
    if (!isLoggedIn || !user_id) {
      // Afficher un modal d'erreur si pas connecté
      setModalConfig({
        isOpen: true,
        title: "⚠️ Non connecté",
        message: "Vous devez être connecté pour faire un pronostic",
        confirmText: "OK",
        isConfirmation: false,
        onConfirm: () => {},
      });
      return;
    }

    // Déterminer le label du choix
    const predictionLabels: Record<string, string> = {
      "HOME": homeTeam.name,
      "DRAW": "Match Nul",
      "AWAY": awayTeam.name,
    };

    const isModifying = selectedPrediction !== null;
    const message = isModifying
      ? `Vous êtes sur le point de modifier votre pronostic en "${predictionLabels[predictionValue]}".\n\nConfirmez-vous ?`
      : `Confirmer votre pronostic: "${predictionLabels[predictionValue]}"?`;

    // Stocker le pronostic temporaire en attente
    setPendingPrediction(predictionValue);

    // Afficher le modal de confirmation
    setModalConfig({
      isOpen: true,
      title: isModifying ? "📝 Modifier le pronostic" : "⚽ Confirmer le pronostic",
      message,
      confirmText: isModifying ? "Modifier" : "Confirmer",
      isConfirmation: true,
      onConfirm: () => {}, // Sera appelée par le Modal component
    });
  };

  // Fonction pour soumettre la prédiction après confirmation
  const submitPrediction = async () => {
    if (!pendingPrediction || !user_id) return;

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:4000/api/predictions", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id,
          match_id: match.id,
          prediction_value: pendingPrediction,
        }),
      });

      if (response.ok) {
        console.log("✅ Prédiction enregistrée avec succès");
        
        const predictionLabels: Record<string, string> = {
          "HOME": homeTeam.name,
          "DRAW": "Match Nul",
          "AWAY": awayTeam.name,
        };

        // Mettre à jour le pronostic sélectionné
        setSelectedPrediction(pendingPrediction);
        setPendingPrediction(null);
        
        // Afficher une notification de succès
        setModalConfig({
          isOpen: true,
          title: "✅ Succès",
          message: `Votre pronostic "${predictionLabels[pendingPrediction]}" a été enregistré !`,
          confirmText: "OK",
          isConfirmation: false,
          onConfirm: () => {},
        });
      } else {
        const error = await response.json();
        console.error("❌ Erreur lors de l'enregistrement:", error);
        
        setModalConfig({
          isOpen: true,
          title: "❌ Erreur",
          message: "Erreur lors de l'enregistrement du pronostic",
          confirmText: "OK",
          isConfirmation: false,
          onConfirm: () => {},
        });
      }
    } catch (error) {
      console.error("💥 Erreur réseau:", error);
      
      setModalConfig({
        isOpen: true,
        title: "❌ Erreur de connexion",
        message: "Impossible de se connecter au serveur",
        confirmText: "OK",
        isConfirmation: false,
        onConfirm: () => {},
      });
    } finally {
      setIsLoading(false);
    }
  };

  // On utilise les vraies données issues de Prisma
  /**
   * EXTRACTION DES DONNÉES DU MATCH
   * 
   * - day, time : formatage de la date ISO du match
   * - homeTeam, awayTeam : objets complets des équipes avec leurs détails
   */
  const { day, time } = getFormattedDate(match.date);
  const homeTeam = match.home_team;
  const awayTeam = match.away_team;

  /**
   * FONCTION GETFORMATTEDDATE
   * 
   * Formatte la date en français :
   * - Aujourd'hui ou Demain si dans les 2 prochains jours
   * - Sinon : "Lun 15/01"
   * 
   * Retour : { day: string, time: string }
   */
  function getFormattedDate(dateString: string) {
    const matchDate = new Date(dateString);
    const now = new Date();

    // Comparaison des jours
    const isToday = matchDate.toDateString() === now.toDateString();

    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const isTomorrow = matchDate.toDateString() === tomorrow.toDateString();

    const time = matchDate.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    let day = "";
    if (isToday) {
      day = "Aujourd'hui";
    } else if (isTomorrow) {
      day = "Demain";
    } else {
      const dayName = matchDate.toLocaleDateString("fr-FR", {
        weekday: "short",
      });
      const dayMonth = matchDate.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
      });
      day = `${dayName} ${dayMonth}`;
    }

    return { day, time };
  }

  const cardClassName = `${styles.card} ${
    !showPredictions ? styles.compactCard : ""
  } ${showStatus ? styles.cardWithStatus : ""}`;

  return (
    <>
    <article className={cardClassName}>
      <section>
        <div className={styles.competitionBadge}>
          {match.competition.name}
        </div>
        {isHot && <span className={styles.hotBadge}>🔥</span>}
      </section>
      
      {/* LIEN CLIQUABLE SEULEMENT SUR LES ÉQUIPES, HORAIRE ET AVATARS */}
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
                alt={`logo-${homeTeam.tla}`}
                width={65}
                height={65}
              />
            </div>
            {!showPredictions && (
              <span className={styles.teamNameUnder}>
                {showFullTeamNames ? homeTeam.name : homeTeam.tla}
              </span>
            )}
          </div>
          {/* TIMESTAMP ou SCORE */}
          <div className={styles.dateTime}>
            {(match.status === "FINISHED" || match.status === "IN_PLAY") && 
            match.home_score !== null && match.away_score !== null ? (
              // Afficher le score si match terminé ou en cours
              <div className={styles.scoreBox}>
                <span className={styles.scoreLabel}>{match.home_score}</span>
                <span className={styles.scoreSeparator}>-</span>
                <span className={styles.scoreLabel}>{match.away_score}</span>
              </div>
            ) : (
              // Afficher la date et l'heure sinon
              <>
                <span className={styles.dateLabel}>{day}</span>
                <span className={styles.timeLabel}>{time}</span>
              </>
            )}
          </div>
          {showStatus && (
            <div className={styles.competitionBadgeStatus}>
              {getStatusLabel(match.status)}
            </div>
          )}
          {/* AWAY TEAM */}
          <div className={styles.teamBox}>
            <div className={styles.crestContainer}>
              <Image
                src={awayTeam.crest_url}
                alt={`logo-${awayTeam.tla}`}
                width={65}
                height={65}
              />
            </div>
            {!showPredictions && (
              <span className={styles.teamNameUnder}>
                {showFullTeamNames ? awayTeam.name : awayTeam.tla}
              </span>
            )}
          </div>
        </section>
      </Link>
      
      <section>
        {/* NOM DU DERBY (Affiché uniquement s'il existe) */}
        {match.featured_name && (
          <div className={styles.derbyName}>{match.featured_name}</div>
        )}
      </section>
      {/* Affichage conditionnel des boutons */}
      {showPredictions && isLoggedIn && (
          <section className={styles.predictionGrid} onClick={(e) => e.stopPropagation()}>
            {/* Bouton Victoire Domicile */}
            <button
              className={`${styles.predButton} ${selectedPrediction === "HOME" ? styles.selected : ""}`}
              onClick={() => handlePrediction("HOME")}
              disabled={isLoading}
            >
              <span className={styles.btnFullName}>{homeTeam.name}</span>
              <span className={styles.btnTlaName}>{homeTeam.tla}</span>
            </button>

            {/* Bouton Nul */}
            <button
              className={`${styles.predButton} ${selectedPrediction === "DRAW" ? styles.selected : ""}`}
              onClick={() => handlePrediction("DRAW")}
              disabled={isLoading}
            >
              <span className={styles.btnFullName}>Match Nul</span>
              <span className={styles.btnTlaName}>NUL</span>
            </button>

            {/* Bouton Victoire Extérieur */}
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
        {/* Message si pas connecté */}
        {showPredictions && !isLoggedIn && (
          <section className={styles.predictionGrid}>
            <p style={{ textAlign: "center", color: "#999", gridColumn: "1 / -1" }}>
              <a href="/login" style={{ color: "#007bff", textDecoration: "none", fontWeight: "600" }}>
                Connectez-vous
              </a>
              {" "}pour faire un pronostic
            </p>
          </section>
        )}
    </article>

    {/* Modal pour les confirmations et messages */}
    <Modal
      isOpen={modalConfig.isOpen}
      title={modalConfig.title}
      message={modalConfig.message}
      onConfirm={() => {
        // Si modal de confirmation = soumettre la prédiction
        if (modalConfig.isConfirmation) {
          submitPrediction();
        } else {
          // Si modal de succès/erreur = fermer le modal
          setModalConfig({
            isOpen: false,
            title: "",
            message: "",
            confirmText: "OK",
            isConfirmation: false,
            onConfirm: () => {},
          });
        }
      }}
      onCancel={() => {
        setModalConfig({
          isOpen: false,
          title: "",
          message: "",
          confirmText: "OK",
          isConfirmation: false,
          onConfirm: () => {},
        });
        setPendingPrediction(null);
      }}
      confirmText={modalConfig.confirmText}
      isConfirmation={modalConfig.isConfirmation}
    />
    </>
  );
}
