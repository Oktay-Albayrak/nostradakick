"use client";

import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer"; // Hook pour détecter la visibilité
import { IMatch } from "@/types/match";
import MatchCard from "../matchCard/MatchCard";
import styles from "./InfiniteMatches.module.css";

interface InfiniteMatchesProps {
  initialMatches: IMatch[]; // Les 10 premiers matchs envoyés par le serveur
}

export default function InfiniteMatches({
  initialMatches,
}: InfiniteMatchesProps) {
  // --- ÉTAT (STATE) ---

  // On stocke la liste complète des matchs affichés
  const [matches, setMatches] = useState<IMatch[]>(initialMatches);

  // On garde en mémoire la prochaine page à charger (on commence à 2 car la 1 est déjà là)
  const [page, setPage] = useState<number>(2);

  // Permet de savoir s'il reste des matchs à charger côté serveur
  const [hasMore, setHasMore] = useState<boolean>(true);

  // Évite de lancer plusieurs requêtes en même temps si l'utilisateur scrolle vite
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // --- DÉTECTION DU BAS DE PAGE ---

  // ref : on l'attachera à une <div> en bas de liste
  // inView : devient 'true' dès que cette <div> apparaît à l'écran
  const { ref, inView } = useInView();

  // --- LOGIQUE DE CHARGEMENT ---

  useEffect(() => {
    // Si la <div> de fin est visible ET qu'il reste des matchs ET qu'on ne charge pas déjà
    if (inView && hasMore && !isLoading) {
      loadMoreMatches();
    }
  }, [inView]); // On re-vérifie à chaque fois que 'inView' change

  const loadMoreMatches = async () => {
    if (isLoading) return;

    setIsLoading(true); // On bloque les autres appels potentiels

    try {
      // On appelle l'API avec les Query Parameters : ?page=X&limit=10
      const response = await fetch(
        `http://localhost:4000/api/matches?page=${page}&limit=10`
      );
      const newMatches: IMatch[] = await response.json();

      if (newMatches.length === 0) {
        // Si l'API renvoie un tableau vide, c'est qu'on a atteint la fin de la saison
        setHasMore(false);
      } else {
        // On "spread" (...) les anciens matchs et on ajoute les nouveaux à la suite
        setMatches((previous) => {
          // FILTRE ANTI-DOUBLONS :
          // On ne garde que les matchs dont l'ID n'est pas déjà dans la liste actuelle
          const existingIds = new Set(previous.map((m) => m.id));
          const uniqueNewMatches = newMatches.filter(
            (m) => !existingIds.has(m.id)
          );

          return [...previous, ...uniqueNewMatches];
        });

        // On incrémente le numéro de page pour le prochain coup
        setPage((previous) => previous + 1);
      }
    } catch (err) {
      console.error(
        "Erreur lors du chargement des matchs supplémentaires",
        err
      );
    } finally {
      setIsLoading(false); // On libère le verrou, peu importe si ça a réussi ou échoué
    }
  };

  // --- AFFICHAGE (RENDERING) ---

  return (
    <>
      {/* La grille de matchs actuelle */}
      <div className={styles.wrapper}>
        <div className={styles.grid}>
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      </div>

      {/* LA SENTINELLE : 
          C'est cet élément que l'on surveille. 
          Dès qu'il entre dans le champ de vision (inView), le chargement commence.
      */}
      <div ref={ref} className={styles.sentinel}>
        {isLoading && (
          <>
            <div className={styles.loader}></div>
            <p>🔄 Chargement des prochains matchs...</p>
          </>
        )}
        {!hasMore && matches.length > 0 && (
          <p className={styles.finished}>
            🏁 Vous avez vu tous les prochains matchs.
          </p>
        )}
      </div>
    </>
  );
}
