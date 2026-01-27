"use client";

import { ICompetition } from "@/types/match";
import Link from "next/link";
import { useState } from "react";
import styles from "./MobileCompetitionMenu.module.css";

export default function MobileCompetitionMenu({
  leagues,
  currentFilter,
}: {
  leagues: ICompetition[];
  currentFilter: string | null;
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Helper pour construire l'URL avec le filtre HOT s'il existe
  const buildUrl = (code?: string) => {
    const params = new URLSearchParams();
    if (code) params.set("league", code);
    if (currentFilter === "hot") params.set("filter", "hot");

    const queryString = params.toString();
    return queryString ? `/matchs?${queryString}` : "/matchs";
  };

  return (
    <>
      <button className={styles.filterButton} onClick={() => setIsOpen(true)}>
        🏆 Compétitions
      </button>
      {isOpen && (
        <div className={styles.mobileOverlay}>
          <div className={styles.overlayHeader}>
            <h3>Choisir une compétition</h3>
            <button
              className={styles.closeButton}
              onClick={() => setIsOpen(false)}
            >
              X
            </button>
          </div>
          <ul className={styles.overlayList}>
            <li onClick={() => setIsOpen(false)}>
              <Link href={buildUrl()}>Toutes</Link>
            </li>
            {leagues.map((league) => (
              <li key={league.id} onClick={() => setIsOpen(false)}>
                <Link href={buildUrl(league.code)}>{league.name}</Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
