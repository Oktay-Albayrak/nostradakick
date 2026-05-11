import { API_URL } from "@/config/api";
import Image from "next/image";
import styles from "./page.module.css";
import { notFound } from "next/navigation";
import { IUserStats } from "@/types/userStats";
import { IUser } from "@/types/user";
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
  const response = await fetch(`${API_URL}/api/users/${username}`, {
    cache: "no-store",
  });

  // 3. Si l'utilisateur n'est pas trouvé, on renvoie vers la page 404 de Next.js
  if (!response.ok) {
    notFound();
  }

  const data = await response.json();
  const user: IUser = {
    id: data.id,
    username: data.username,
    email: data.email,
    avatar_url: data.avatar_url,
    role: data.role,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
  const userStats: IUserStats = {
    id: data.id,
    username: data.username,
    stats: data.stats,
    predictions: data.predictions,
  };

  // Calculs préparés côté serveur
  const wins = userStats.stats?.wins_count ?? 0;
  const losses = userStats.stats?.losses_count ?? 0;
  const totalGames = wins + losses;
  const points = Math.max(0, wins * 5 - losses); // Minimum 0 point
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
          <p>Membre depuis : {new Date(user.created_at).toLocaleDateString("fr-FR")}</p>
          <p>{userStats.predictions?.length ?? 0} pronostics</p>
          <p>{points} points</p>
        </div>
      </section>

      <div className={styles.wrapper}>
        <section className={styles.pronos}>
          <h2>Derniers pronos</h2>
          <div>
            {userStats?.predictions?.sort((a, b) => new Date(b.match.date).getTime() - new Date(a.match.date).getTime()).slice(0, 4).map((p, index) => (
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
              Voir tous ses pronostics ➜
            </Link>
          </div>
        </section>

        <section className={styles.stats}>
          <h2>Statistiques</h2>
          <div>
            <article className={styles.stat}>
              <Image className={styles.logo} src="/croissance.png" width={50} height={50} alt="Série" />
              <p>Meilleure série gagnante : {userStats.stats?.best_streak ?? 0}</p>
            </article>
            <article className={styles.stat}>
              <Image className={styles.logo} src="/prix.png" width={50} height={50} alt="Gagnants" />
              <p>Pronostics gagnants : {wins}</p>
            </article>
            <article className={styles.stat}>
              <Image className={styles.logo} src="/taux.png" width={50} height={50} alt="Taux" />
              <p>Taux de réussite :{winRate}%</p>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}