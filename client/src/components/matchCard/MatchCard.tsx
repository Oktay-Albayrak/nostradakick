import Image from "next/image";
import styles from "./MatchCard.module.css";
import { IMatch } from "@/types/match";

interface MatchProps {
  match: IMatch;
  isHot?: boolean /* Afficher ou non le hotBadge */;
  showPredictions?: boolean /* Afficher ou non les boutons */;
}

export default function MatchCard({
  match,
  isHot,
  showPredictions = true,
}: MatchProps) {
  // Si pour une raison X le match est absent, on affiche rien
  if (!match) return null;

  // Fonction pour obtenir le label du statut
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

  // On utilise les vraies données issues de Prisma
  const { day, time } = getFormattedDate(match.date);
  const homeTeam = match.home_team;
  const awayTeam = match.away_team;

  // Formatage propre de l'heure
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
  }`;

  return (
    <div>
      <article className={cardClassName}>
        <section>
          <div className={styles.competitionBadge}>
            {match.competition.name}
          </div>
          {isHot && <span className={styles.hotBadge}>🔥</span>}
          <div className={styles.competitionBadgeStatus}>
            {getStatusLabel(match.status)}
            </div>
        </section>
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
              <span className={styles.teamNameUnder}>{homeTeam.tla}</span>
            )}
          </div>
          {/* TIMESTAMP */}
          <div className={styles.dateTime}>
            <span className={styles.dateLabel}>{day}</span>
            <span className={styles.timeLabel}>{time}</span>
          </div>
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
              <span className={styles.teamNameUnder}>{awayTeam.tla}</span>
            )}
          </div>
        </section>
        {/* Affichage conditionnel des boutons */}
        {showPredictions && (
          <section className={styles.predictionGrid}>
            {/* Bouton Victoire Domicile */}
            <button className={styles.predButton}>
              <span className={styles.btnFullName}>{homeTeam.name}</span>
              <span className={styles.btnTlaName}>{homeTeam.tla}</span>
            </button>

            {/* Bouton Nul */}
            <button className={styles.predButton}>
              <span className={styles.btnFullName}>Match Nul</span>
              <span className={styles.btnTlaName}>NUL</span>
            </button>

            {/* Bouton Victoire Extérieur */}
            <button className={styles.predButton}>
              <span className={styles.btnFullName}>{awayTeam.name}</span>
              <span className={styles.btnTlaName}>{awayTeam.tla}</span>
            </button>
          </section>
        )}
      </article>
    </div>
  );
}
