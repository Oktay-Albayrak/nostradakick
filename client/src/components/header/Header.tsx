"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import styles from "./Header.module.css"

export default function Header() {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <Link href="/">
          <Image
            className={styles.logo}
            src="/logo-nostradakick.png"
            width={500}
            height={500}
            alt="Logo - Retourner vers l'accueil"
          />
        </Link>
        <Link className={styles.navlinks} href="/">Accueil</Link>
        <Link className={styles.navlinks} href="/matchs">Matchs</Link>
        <Link className={styles.navlinks} href="/pronos">Pronos</Link>
      </nav>
      <div className={styles.buttons}>
        {!isDashboard && (
          <Link className={`${styles.button} ${styles.registerButton}`} href="/register">S&apos;inscrire</Link>
        )}
        {isDashboard && (
          <div className={styles.userIcon}>
            <Image
              src="/user-icon.png"
              width={32}
              height={32}
              alt="Icône utilisateur"
            />
          </div>
        )}
        <Link className={`${styles.button} ${styles.loginButton}`} href={isDashboard ? "/logout" : "/login"}>
          {isDashboard ? "Déconnexion" : "Se connecter"}
        </Link>
      </div>
    </header>
  )
}