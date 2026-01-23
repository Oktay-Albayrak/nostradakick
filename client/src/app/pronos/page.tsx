import Image from "next/image";
import styles from "./page.module.css";
import { notFound } from "next/navigation";
import { IPrediction } from "@/types/match";
import SearchBar from "@/components/search/searchBar";

interface UserPredictionGroup {
  user: IPrediction["user"];
  predictions: IPrediction[];
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);

  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "short", // "mer."
    day: "2-digit", // "07"
    month: "2-digit", // "01"
    hour: "2-digit", // "19"
    minute: "2-digit", // "45"
  }).format(date);
};

export default async function Pronos() {
  // On récupère les données directement sur le serveur
  // Note : "cache: 'no-store'" ou "next: { revalidate: 60 }" permet de gérer la mise en cache
  const response = await fetch("http://localhost:4000/api/predictions", {
    cache: "no-store",
  });

  //  On renvoie vers la page 404 de Next.js si erreur
  if (!response.ok) {
    notFound();
  }

  const predictions: IPrediction[] = await response.json();

  const groupPredictionsByUser = (predictions: IPrediction[]) => {
    const grouped = predictions
      .filter((p) => p.status === "PENDING")
      .reduce(
        (acc, prediction) => {
          const userId = prediction.user.id;

          // Si l'utilisateur n'est pas encore dans l'accumulateur, on l'ajoute
          if (!acc[userId]) {
            acc[userId] = {
              user: prediction.user,
              predictions: [],
            };
          }

          // On ajoute la prédiction à cet utilisateur
          acc[userId].predictions.push(prediction);
          return acc;
        },
        {} as Record<string, UserPredictionGroup>,
      );

    // On transforme l'objet en tableau et on ne garde que les 3 derniers pronos
    return Object.values(grouped).map((group) => ({
      ...group,
      // On trie par date (si présent) et on prend les 3 premiers
      latestPredictions: group.predictions
        // .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Optionnel selon ton besoin
        .slice(0, 3),
      hasMore: group.predictions.length > 3,
    }));
  };

  const pronos = groupPredictionsByUser(predictions);

  return (
    <main className={styles.main}>
      {/* SEARCH BAR */}
      <SearchBar />

      {/* CONTENU PRINCIPAL - Liste des pronostics */}
      <section className={styles.mainGrid}>
        <h1 className={styles.sectionTitleH1}>
          Pronostics des membres du sites
        </h1>

        <div className={styles.pronoList}>
          {pronos.map((group) => (
            <div key={group.user.id} className={styles.userGroup}>
              <div className={styles.userInfo}>
                <Image
                  className={styles.avatar}
                  src="/default-avatar.jpg"
                  width={200}
                  height={200}
                  alt="Avatar du membre"
                />
                <div className={styles.profilColumn}>
                  <span className={styles.username}>{group.user.username}</span>
                </div>
              </div>
              {group.latestPredictions.map((prono) => (
                <div key={prono.id} className={styles.pronoRow}>
                  <div className={styles.matchInfo}>
                    <div className={styles.pronoLabel}>
                      {prono.match.home_team.name} -{" "}
                      {prono.match.away_team.name}
                    </div>
                    <div className={styles.picks}>
                      <span
                        className={`${styles.pick} ${prono.prediction_value === "HOME" ? styles.pickActive : ""}`}
                      >
                        1
                      </span>
                      <span
                        className={`${styles.pick} ${prono.prediction_value === "DRAW" ? styles.pickActive : ""}`}
                      >
                        N
                      </span>
                      <span
                        className={`${styles.pick} ${prono.prediction_value === "AWAY" ? styles.pickActive : ""}`}
                      >
                        2
                      </span>
                    </div>
                    <div className={styles.timestamp}>
                      publié le {formatDate(prono.updated_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
