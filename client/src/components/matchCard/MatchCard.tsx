import Image from "next/image";
import styles from "./MatchCard.module.css";

export default function MatchCard() {
  return (
    <div>
      <article className={styles.card}>
        <section>
          <div className={styles.competitionBadge}>Competition</div>
          <span className={styles.hotBadge}>🔥</span>
        </section>
        <section className={styles.mainInfo}>
          {/* HOME TEAM */}
          <div className={styles.teamBox}>
            <div className={styles.crestContainer}>
              <Image
                src="https://crests.football-data.org/524.png"
                alt="logo_paris-saint-germain"
                width={64}
                height={64}
              />
            </div>
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
                src="https://crests.football-data.org/516.png"
                alt="logo_olympique-marseille"
                width={64}
                height={64}
              />
            </div>
          </div>
        </section>
        <section className={styles.predictionGrid}>
          {/* Bouton Victoire Domicile */}
          <button className={styles.predButton}>
            <span className={styles.btnFullName}>Paris Saint-Germain</span>
            <span className={styles.btnTlaName}>PSG</span>
          </button>

          {/* Bouton Nul (Le texte "Nul" reste souvent identique) */}
          <button className={styles.predButton}>
            <span className={styles.btnFullName}>Match Nul</span>
            <span className={styles.btnTlaName}>NUL</span>
          </button>

          {/* Bouton Victoire Extérieur */}
          <button className={styles.predButton}>
            <span className={styles.btnFullName}>Olympique de Marseille</span>
            <span className={styles.btnTlaName}>OM</span>
          </button>
        </section>
      </article>
    </div>
  );
}
