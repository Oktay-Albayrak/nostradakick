"use client"

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [messageError, setMessageError] = useState([]);

  const router = useRouter();
  const { login } = useAuth();

  async function handleForm(formData: FormData) {
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const response = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password
        }),
        credentials: 'include',
      })
      const result = await response.json();
      if (response.status >= 300) {
        setMessageError(result.error);
      } else {
        login();
        router.push("/");
      }
    } catch (e) {
      console.error("error : ", e as Error);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.leftPane}>
          <h1 className={styles.title}>Se connecter</h1>

          <form action={handleForm} className={styles.form}>
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
              <div className={styles.passwordWrapper}>
                <input
                  type="password"
                  name="password"
                  className={styles.input}
                  placeholder="Votre mot de passe"
                  required
                />
                <span
                  className={styles.passwordIcon}
                  aria-hidden="true"
                >
                  👁
                </span>
              </div>
            </label>

            <div className={styles.forgotRow}>
              <Link href="#" className={styles.forgotLink}>
                Mot de passe oublié ?
              </Link>
            </div>
            {messageError && messageError.map((msg, index) => (
              <p key={index} className={styles.error}>{msg}</p>
            ))}
            <button type="submit" className={styles.submitButton}>
              Se connecter
            </button>
          </form>
          
        </div>

        <div className={styles.rightPane}>
          <h2 className={styles.subtitle}>Nouveau sur NostradaKick ?</h2>
          <p className={styles.helperText}>
            Créez un compte pour suivre vos pronostics, comparer vos stats
            avec les autres membres et ne rien rater des prochains matchs.
          </p>
          <Link href="/register" className={styles.secondaryButton}>
            Créer un compte
          </Link>
        </div>
      </section>
    </main>
  );
}

