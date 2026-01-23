"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./searchBar.module.css";
import { ICompetition, IMatch, ITeam } from "@/types/match";
import { slugify } from "@/utils/format";

interface SearchResults {
  leagues: ICompetition[];
  teams: ITeam[];
  matches: IMatch[];
}

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length >= 3) {
      setLoading(true);
      const timer = setTimeout(async () => {
        try {
          const response = await fetch(
            `http://localhost:4000/api/search/suggestions?q=${encodeURIComponent(query)}`,
          );
          const data = await response.json();
          setResults(data);
        } finally {
          setLoading(false);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [query]);

  const navigateTo = (path: string) => {
    router.push(path);
    setIsOpen(false);
    setQuery("");
  };

  return (
    <div className={styles.searchWrapper} ref={wrapperRef}>
      <div
        className={`${styles.searchField} ${isOpen && query.length >= 3 ? styles.activeField : ""}`}
      >
        <span className={styles.icon}>🔍</span>
        <input
          className={styles.input}
          placeholder="Rechercher une équipe, un match..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        {query && (
          <button className={styles.clearBtn} onClick={() => setQuery("")}>
            ✕
          </button>
        )}
      </div>

      {isOpen && query.length >= 3 && (
        <div className={styles.dropdown}>
          {loading ? (
            <div className={styles.message}>Chargement...</div>
          ) : (
            <div className={styles.resultsList}>
              {/* SECTION LIGUES (Ici on utilise enfin ICompetition) */}
              {results?.leagues?.map((league: ICompetition) => (
                <div
                  key={league.id}
                  className={styles.resultItem}
                  onClick={() => navigateTo(`/matchs?league=${league.code}`)}
                >
                  <div className={styles.logoContainer}>
                    {/* Si tu as un emblème pour la ligue */}
                    {league.emblem_url ? (
                      <Image
                        src={league.emblem_url}
                        alt=""
                        width={30}
                        height={30}
                        unoptimized
                      />
                    ) : (
                      <span className={styles.matchIcon}>🏆</span>
                    )}
                  </div>
                  <div className={styles.info}>
                    <span className={styles.name}>{league.name}</span>
                    <span className={`${styles.badge} ${styles.leagueBadge}`}>
                      Compétition
                    </span>
                  </div>
                </div>
              ))}
              {/* SECTION ÉQUIPES */}
              {results?.teams?.map((team: ITeam) => (
                <div
                  key={team.id}
                  className={styles.resultItem}
                  onClick={() =>
                    navigateTo(`/matchs?team=${slugify(team.name)}`)
                  }
                >
                  <div className={styles.logoContainer}>
                    <Image
                      src={team.crest_url}
                      alt=""
                      width={30}
                      height={30}
                      unoptimized
                    />
                  </div>
                  <div className={styles.info}>
                    <span className={styles.name}>{team.name}</span>
                    <span className={`${styles.badge} ${styles.teamBadge}`}>
                      Équipe
                    </span>
                  </div>
                </div>
              ))}

              {/* SECTION MATCHS */}
              {results?.matches?.map((match: IMatch) => (
                <div
                  key={match.id}
                  className={styles.resultItem}
                  onClick={() => navigateTo(`/matchs/${match.api_id}`)}
                >
                  <div className={styles.matchIcon}>⚽</div>
                  <div className={styles.info}>
                    <span className={styles.name}>
                      {match.home_team.name} vs {match.away_team.name}
                    </span>
                    <span className={`${styles.badge} ${styles.matchBadge}`}>
                      Match
                    </span>
                  </div>
                </div>
              ))}
              {/* SECTION AUCUN RÉSULTAT */}
              {!loading &&
                results &&
                results.leagues.length === 0 &&
                results.teams.length === 0 &&
                results.matches.length === 0 && (
                  <div className={styles.message}>
                    Aucun résultat pour &quot;{query}&quot;
                  </div>
                )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
