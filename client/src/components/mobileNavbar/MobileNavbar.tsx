import Image from "next/image";
import Link from "next/link";
import styles from "./MobileNavbar.module.css"

export default function MobileNavbar() {
  return (
    <nav className={styles.nav}>
      <Link href="/">
        <Image
          className={styles.icon}
          src="/home-icon.png"
          width={500}
          height={500}
          alt="Retourner vers l'accueil"
        />
      </Link>
      <Link href="/matchs">
        <Image
          className={styles.icon}
          src="/match-icon.png"
          width={500}
          height={500}
          alt="Voir la page des matchs"
        />
      </Link>
      <Link href="/pronos">
        <Image
          className={styles.icon}
          src="/prono-icon.png"
          width={500}
          height={500}
          alt="Voir les pronostics des membres"
        />
      </Link>
      <Link href="/search">
        <Image
          className={styles.icon}
          src="/search-icon.png"
          width={500}
          height={500}
          alt="Rechercher un match ou une compétition précise"
        />
      </Link>
      <Link href="/dashboard">
        <Image
          className={styles.icon}
          src="/user-icon.png"
          width={500}
          height={500}
          alt="Voir mon profil"
        />
      </Link>
    </nav>
  )
}

