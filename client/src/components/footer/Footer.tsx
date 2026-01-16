import styles from "./Footer.module.css";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <nav className={styles.footerNav} aria-label="Pied de page">
          <ul>
            <li>
              <Link href="/about">À propos</Link>
            </li>
            <li>
              <Link href="/mentions-legales">Mentions légales</Link>
            </li>
            <li>
              <Link href="/contact">Contact</Link>
            </li>
          </ul>
        </nav>

        <Link className={styles.footerLogo} href="/" aria-label="NostradaKick">
          <Image
            className={styles.logo}
            src="/logo-nostradakick.png"
            width={500}
            height={500}
            alt="Logo - Retourner vers l'accueil"
          />
        </Link>

        <div className={styles.footerRight}>
          <span>© {year} NostradaKick — Projet pédagogique</span>
        </div>
      </div>
    </footer>
  );
}
