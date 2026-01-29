"use client";

import Link from "next/link";
import Image from "next/image";
import styles from "./Header.module.css";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

export default function Header() {
  const { isLoggedIn, role } = useAuth();
  const [username, setUsername] = useState<string>("Champion");

  // On récupère le pseudo pour le seed de l'avatar
  useEffect(() => {
    if (isLoggedIn) {
      fetch("http://localhost:4000/api/auth/me", { credentials: "include" })
        .then((res) => res.json())
        .then((data) => {
          if (data.username) setUsername(data.username);
        })
        .catch(() => setUsername("Kickeur"));
    }
  }, [isLoggedIn]);

  const avatarUrl = `https://api.dicebear.com/7.x/adventurer/png?seed=${username}`;

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <Link href="/">
          <Image
            className={styles.logo}
            src="/logo-nostradakick.png"
            width={120}
            height={120}
            alt="Logo - Accueil"
            priority
          />
        </Link>
        <Link className={styles.navlinks} href="/">
          Accueil
        </Link>
        <Link className={styles.navlinks} href="/matchs">
          Matchs
        </Link>
        <Link className={styles.navlinks} href="/pronos">
          Pronos
        </Link>
        {isLoggedIn && role === "ADMIN" && (
          <Link className={styles.navlinks} href="/admin">
            Dashboard
          </Link>
        )}
      </nav>
      <div className={styles.buttons}>
        {isLoggedIn && role === "ADMIN" && (
          <Link href="/admin" className={styles.adminMobileLink}>
            <Image
              src="/dashboard-icon.png"
              width={24}
              height={24}
              alt="Admin"
              className={styles.adminIcon}
            />
          </Link>
        )}
        {!isLoggedIn ? (
          <Link
            className={`${styles.button} ${styles.registerButton}`}
            href="/register"
          >
            S&apos;inscrire
          </Link>
        ) : (
          /* Avatar dynamique quand connecté */
          <Link className={styles.userAvatarWrapper} href="/dashboard">
            <Image
              src={avatarUrl}
              width={40}
              height={40}
              alt="Profil"
              className={styles.userAvatar}
              unoptimized
            />
          </Link>
        )}

        <Link
          className={`${styles.button} ${styles.loginButton}`}
          href={isLoggedIn ? "/logout" : "/login"}
        >
          {isLoggedIn ? "Déconnexion" : "Se connecter"}
        </Link>
      </div>
    </header>
  );
}
