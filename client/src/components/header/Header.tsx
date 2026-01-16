import Link from "next/link";
import Image from "next/image";
import styles from "./Header.module.css"
import { cookies } from "next/headers";

export default async function Header() {

  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.has('accessToken');

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
        {!isLoggedIn && (
          <Link className={`${styles.button} ${styles.registerButton}`} href="/register">S&apos;inscrire</Link>
        )}
        {isLoggedIn && (
          <div className={styles.userIcon}>
            <Image
              src="/user-icon.png"
              width={32}
              height={32}
              alt="Icône utilisateur"
            />
          </div>
        )}
        <Link className={`${styles.button} ${styles.loginButton}`} href={isLoggedIn ? "/logout" : "/login"}>
          {isLoggedIn ? "Déconnexion" : "Se connecter"}
        </Link>
      </div>
    </header>
  )
}