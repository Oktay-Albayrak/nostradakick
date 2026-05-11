import { API_URL } from "@/config/api";
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./searchOverlay.module.css";
import { ICompetition, IMatch, ITeam } from "@/types/match";
import { slugify } from "@/utils/format";

interface SearchResults {
  leagues: ICompetition[];
  teams: ITeam[];
  matches: IMatch[];
}

export default function SearchOverlay({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const router = useRouter();

  // Debounce : on attend que l'utilisateur arrête de taper (300ms)
  useEffect(() => {
    if (query.length >= 3) {
      const timer = setTimeout(async () => {
        const response = await fetch(
          `${API_URL}/api/search/suggestions?q=${encodeURIComponent(query)}`,
        );
        const data = await response.json();
        setResults(data);
      }, 300);
      return () => clearTimeout(timer);
    }
    return () => setResults(null);
  }, [query]);

  if (!isOpen) return null;

  const navigateTo = (path: string) => {
    router.push(path);
    onClose();
    setQuery("");
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.header}>
        <button onClick={onClose} className={styles.backBtn}>
          ←
        </button>
        <div className={styles.inputWrapper}>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher équipe, ligue..."
            className={styles.input}
          />
          {query && (
            <button onClick={() => setQuery("")} className={styles.clearBtn}>
              ✕
            </button>
          )}
        </div>
      </div>

      <div className={styles.body}>
        {!results && query.length >= 3 && (
          <div className={styles.loader}>Chargement...</div>
        )}

        {results && (
          <div className={styles.resultsList}>
            {/* COMPÉTITIONS */}
            {results.leagues.map((league: ICompetition) => (
              <div
                key={league.id}
                className={styles.resultItem}
                onClick={() => navigateTo(`/matchs?league=${league.code}`)}
              >
                <div className={`${styles.badge} ${styles.leagueBadge}`}>
                  Ligue
                </div>
                <div className={styles.resultInfo}>
                  <span className={styles.name}>{league.name}</span>
                </div>
              </div>
            ))}

            {/* ÉQUIPES */}
            {results.teams.map((team: ITeam) => (
              <div
                key={team.id}
                className={styles.resultItem}
                onClick={() => navigateTo(`/matchs?team=${slugify(team.name)}`)}
              >
                <div className={`${styles.badge} ${styles.teamBadge}`}>
                  Équipe
                </div>
                <div className={styles.resultInfo}>
                  <span className={styles.name}>{team.name}</span>
                  <span className={styles.subText}>
                    {team.tla} • {team.country}
                  </span>
                </div>
              </div>
            ))}

            {/* MATCHS PRÉCIS */}
            {results.matches.map((match: IMatch) => (
              <div
                key={match.id}
                className={styles.resultItem}
                onClick={() => navigateTo(`/matchs/${match.id}`)}
              >
                <div className={`${styles.badge} ${styles.matchBadge}`}>
                  Match
                </div>
                <div className={styles.resultInfo}>
                  <span className={styles.name}>
                    {match.home_team.name} vs {match.away_team.name}
                  </span>
                  <span className={styles.subText}>
                    {new Date(match.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {results &&
          results.leagues.length === 0 &&
          results.teams.length === 0 &&
          results.matches.length === 0 && (
            // eslint-disable-next-line react/no-unescaped-entities
            <div className={styles.noResult}>Aucun résultat pour "{query}"</div>
          )}
      </div>
    </div>
  );
}
