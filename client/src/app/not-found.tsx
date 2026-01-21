import Link from "next/link";
import styles from "./notFound.module.css";

export default function NotFound() {
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <h1 className={styles.title}>404</h1>
        <h2 className={styles.subtitle}>Page non trouvée</h2>

        <section className={styles.section}>
          <p className={styles.paragraph}>
            Désolé, la page que vous recherchez n&apos;existe pas ou a été déplacée.
          </p>

          <div className={styles.buttonContainer}>
            <Link href="/" className={styles.button}>
              Retourner à l&apos;accueil
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}