"use client";

import { ICompetition } from "@/types/match";
import Link from "next/link";
import { useState } from "react";
import styles from "./MobileCompetitionMenu.module.css";

export default function MobileCompetitionMenu({
  leagues,
}: {
  leagues: ICompetition[];
}) {
  const [isOpen, setIsOpen] = useState(false);

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
              Fermer
            </button>
          </div>
          <ul className={styles.overlayList}>
            <li onClick={() => setIsOpen(false)}>
              <Link href="/matchs">Toutes</Link>
            </li>
            {leagues.map((league) => (
              <li key={league.id} onClick={() => setIsOpen(false)}>
                <Link href={`/matchs?league=${league.code}`}>
                  {league.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
