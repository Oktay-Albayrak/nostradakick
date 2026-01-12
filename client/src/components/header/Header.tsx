import Link from "next/link";
import Image from "next/image";
import styles from "./Header.module.css"

export default function Header() {
  return (
    <header className={styles.header}>
      <Link href="/">
        <Image
          className={styles.logo}
          src="/nostrada-logo.png"
          width={500}
          height={500}
          alt="Logo - Retourner vers l'accueil"
        />
      </Link>
      <div className={styles.buttons}>
        <Link className={styles.button} href="/register">S&apos;inscrire</Link>
        <Link className={styles.button} href="/login">Se connecter</Link>
      </div>
    </header>
  )
}