import Link from "next/link";
import styles from "./page.module.css";

export default function RegisterPage() {
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <h1 className={styles.title}>Créer un compte</h1>
        <p className={styles.helperText}>
          Rejoins NostradaKick pour créer tes pronostics, suivre tes stats
          et te comparer aux autres membres.
        </p>

        <form className={styles.form}>
          <label className={styles.field}>
            <span className={styles.label}>Pseudo</span>
            <input
              type="text"
              name="username"
              className={styles.input}
              placeholder="ParisienFou"
              required
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Adresse e-mail</span>
            <input
              type="email"
              name="email"
              className={styles.input}
              placeholder="vous@example.com"
              required
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Mot de passe</span>
            <input
              type="password"
              name="password"
              className={styles.input}
              placeholder="Votre mot de passe"
              required
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Confirmer le mot de passe</span>
            <input
              type="password"
              name="confirmPassword"
              className={styles.input}
              placeholder="Répétez le mot de passe"
              required
            />
          </label>

          <button type="submit" className={styles.submitButton}>
            S&apos;inscrire
          </button>
        </form>

        <p className={styles.loginHint}>
          Déjà un compte ?{" "}
          <Link href="/login" className={styles.loginLink}>
            Se connecter
          </Link>
        </p>
      </section>
    </main>
  );
}

