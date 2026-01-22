import Image from "next/image";
import styles from "./page.module.css";
import { notFound } from "next/navigation";
import { IUserStats } from "@/types/userStats";
import Link from "next/link";

// On définit le type des props
interface PageProps {
  params: Promise<{ username: string }>;
}

export default async function Profil({ params }: PageProps) {
  // 1. On récupère le username
  const { username } = await params;

  // 2. On récupère les données directement sur le serveur
  // Note : "cache: 'no-store'" ou "next: { revalidate: 60 }" permet de gérer la mise en cache
  const response = await fetch(`http://localhost:4000/api/users/${username}`, {
    cache: "no-store",
  });

  // 3. Si l'utilisateur n'est pas trouvé, on renvoie vers la page 404 de Next.js
  if (!response.ok) {
    notFound();
  }

  const user: IUserStats = await response.json();

  // Calculs préparés côté serveur
  const wins = user.stats?.wins_count ?? 0;
  const losses = user.stats?.losses_count ?? 0;
  const totalGames = wins + losses;
  const points = wins * 5 - losses;
  const winRate = totalGames > 0 ? ((wins * 100) / totalGames).toFixed(2) : "0";

  return (
    <main className={styles.main}>
      <section className={styles.profil}>
        <Image
          className={styles.avatar}
          src="/default-avatar.jpg"
          width={200}
          height={200}
          alt={`Avatar de ${user.username}`}
        />
        <div className={styles.bio}>
          <h2>{user.username}</h2>
          <p>Membre depuis 02/2021</p>
          <p>{totalGames} pronostics</p>
          <p>{points} points</p>
        </div>
      </section>

      <div className={styles.wrapper}>
        <section className={styles.pronos}>
          <h2>Derniers pronos</h2>
          <div>
            {user.predictions?.slice(0, 4).map((p, index) => (
              <article key={p.id || index} className={styles.prono}>
                <p>
                  {p.match.home_team.name} - {p.match.away_team.name}
                </p>
                <div className={styles.choice}>
                  <p className={p.prediction_value === "HOME" ? styles.active : ""}>1</p>
                  <p className={p.prediction_value === "DRAW" ? styles.active : ""}>N</p>
                  <p className={p.prediction_value === "AWAY" ? styles.active : ""}>2</p>
                </div>
              </article>
            ))}
            <Link href={`/profil/${username}/pronostics`} className={styles.goPronos}>
              tous les pronos ➜
            </Link>
          </div>
        </section>

        <section className={styles.stats}>
          <h2>Statistiques</h2>
          <div>
            <article className={styles.stat}>
              <Image className={styles.logo} src="/croissance.png" width={50} height={50} alt="Série" />
              <p>Meilleure série: {user.stats?.best_streak ?? 0}</p>
            </article>
            <article className={styles.stat}>
              <Image className={styles.logo} src="/prix.png" width={50} height={50} alt="Gagnants" />
              <p>Pronos gagnants: {wins}</p>
            </article>
            <article className={styles.stat}>
              <Image className={styles.logo} src="/taux.png" width={50} height={50} alt="Taux" />
              <p>Taux de réussite: {winRate}%</p>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}