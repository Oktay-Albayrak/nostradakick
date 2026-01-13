import Image from "next/image";
import styles from "./Footer.module.css";
import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <nav className={styles.footerNav} aria-label="Pied de page">
          <ul>
            <li>
              <Link href="/a-propos">À propos</Link>
            </li>
            <li>
              <Link href="/mentions-legales">Mentions légales</Link>
            </li>
            <li>
              <Link href="/contact">Contact</Link>
            </li>
          </ul>
        </nav>

        <div className={styles.footerLogo} aria-label="NostradaKick">
          <Image
            src="/logo-nostradakick.png"
            alt="Logo NostradaKick"
            width={150}
            height={50}
          />
        </div>

        <div className={styles.footerRight}>
          <span>© {year} NostradaKick — Projet pédagogique</span>
        </div>
      </div>
    </footer>
  );
}
