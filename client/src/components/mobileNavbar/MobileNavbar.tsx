import Image from "next/image";
import Link from "next/link";
import styles from "./MobileNavbar.module.css";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

interface Props {
  onSearchClick: () => void;
}

export default function MobileNavbar({ onSearchClick }: Props) {
  const { isLoggedIn } = useAuth();
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
    <nav className={styles.nav}>
      <Link href="/">
        <Image
          className={styles.icon}
          src="/home-icon.png"
          width={35}
          height={35}
          alt="Retourner vers l'accueil"
        />
      </Link>
      <Link href="/matchs">
        <Image
          className={styles.icon}
          src="/match-icon.png"
          width={35}
          height={35}
          alt="Voir la page des matchs"
        />
      </Link>
      <Link href="/pronos">
        <Image
          className={styles.icon}
          src="/prono-icon.png"
          width={35}
          height={35}
          alt="Voir les pronostics des membres"
        />
      </Link>
      <div onClick={onSearchClick} className={styles.navItem}>
        <Image
          className={styles.icon}
          src="/search-icon.png"
          width={35}
          height={35}
          alt="Rechercher"
        />
      </div>
      <Link href="/dashboard" className={styles.avatarLink}>
        <Image
          className={isLoggedIn ? styles.userAvatar : styles.icon}
          src={isLoggedIn ? avatarUrl : "/user-icon.png"}
          width={40}
          height={40}
          alt="Mon profil"
        />
      </Link>
    </nav>
  );
}
