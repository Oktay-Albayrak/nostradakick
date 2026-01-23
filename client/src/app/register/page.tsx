"use client"

import { useState } from 'react';
import Link from "next/link";
import styles from "./page.module.css";

export default function RegisterPage() {
  const [messageError, setMessageError] = useState([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [username, setUsername] = useState("");

  async function handleForm(formData: FormData) {
    const username = formData.get("username");
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL_CLIENT}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password
        }),
      })
      const result = await response.json();
      if (response.status >= 300) {
        setMessageError(result.error);
      } else {
        setUsername(result.username);
        setIsRegistered(true);
      }
    } catch (e) {
      console.error("error : ", e as Error);
    }
  }

  return (
    <main className={styles.page}>
      { isRegistered ? (
        <div className={styles.registered}>
          <h1>Inscription validée ✔</h1>
          <h3>Bienvenue <span className={styles.username}>{username}</span>! 👋</h3>
          <Link href="/login" className={styles.continue}>Continuer ᯓ➤</Link>
        </div>
      ) : (
        <section className={styles.card}>
          <h1 className={styles.title}>Créer un compte</h1>
          <p className={styles.helperText}>
            Rejoins NostradaKick pour créer tes pronostics, suivre tes stats
            et te comparer aux autres membres.
          </p>

          <form action={handleForm} className={styles.form}>
            <label className={styles.field}>
              <span className={styles.label}>Pseudo</span>
              <input
                type="text"
                name="username"
                className={styles.input}
                placeholder="Pseudo123"
                required
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Adresse e-mail</span>
              <input
                type="email"
                name="email"
                className={styles.input}
                placeholder="name@example.com"
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Mot de passe</span>
              <input
                type="password"
                name="password"
                className={styles.input}
                  placeholder="Choisissez un mot de passe sécurisé"
              />
              <p className={styles.condition}>Au minimum une majuscule, une minuscule, un chiffre.</p>
            </label>
            {messageError && messageError.map((msg, index) => (
              <p key={index} className={styles.error}>{msg}</p>
            ))}
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
      )}
    </main>
  );
}

