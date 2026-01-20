import styles from "./page.module.css";

export default function AProposPage() {
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <h1 className={styles.title}>À propos de NostradaKick</h1>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Le projet</h2>
          <p className={styles.paragraph}>
            NostradaKick est une plateforme web communautaire dédiée aux passionnés
            de football. Elle permet de consulter les matchs à venir, de soumettre
            des pronostics sur des rencontres réelles et de suivre l&apos;évolution de
            ses performances au fil du temps.
          </p>

          <p className={styles.paragraph}>
            L&apos;objectif de la plateforme est de proposer un environnement clair et
            accessible favorisant l&apos;analyse, la comparaison des pronostics et
            l&apos;échange entre utilisateurs autour des compétitions sportives.
          </p>
        </section>
      </section>
    </main>
  );
}
