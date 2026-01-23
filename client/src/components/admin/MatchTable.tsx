"use client";

import { useState } from "react";
import { IMatch, ICompetition } from "@/types/match";
import styles from "../../app/admin/matchs/page.module.css";
import MatchActions from "./MatchActions";
import MatchFilters from "./MatchFilters";

interface MatchTableProps {
  matches: IMatch[];
  competitions: ICompetition[];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "SCHEDULED":
      return "Programmé";
    case "TIMED":
      return "Programmé";
    case "IN_PLAY":
      return "En cours";
    case "PAUSED":
      return "Pause";
    case "FINISHED":
      return "Terminé";
    case "SUSPENDED":
      return "Suspendu";
    case "POSTPONED":
      return "Reporté";
    case "CANCELLED":
      return "Annulé";
    case "AWARDED":
      return "Attribué";
    default:
      return status;
  }
}

export default function MatchTable({ matches, competitions }: MatchTableProps) {
  const [filteredMatches, setFilteredMatches] = useState<IMatch[]>(matches);

  if (matches.length === 0) {
    return <div className={styles.emptyMessage}>Aucun match trouvé</div>;
  }

  return (
    <>
      <MatchFilters
        matches={matches}
        competitions={competitions}
        onFilteredMatchesChange={setFilteredMatches}
      />

      {filteredMatches.length === 0 ? (
        <div className={styles.emptyMessage}>
          Aucun match ne correspond aux critères de recherche
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Match</th>
                <th>Compétition</th>
                <th>Score</th>
                <th>Statut</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMatches.map((match) => (
                <tr key={match.id}>
                  <td>{formatDate(match.date)}</td>
                  <td>
                    <div className={styles.matchCell}>
                      <span className={styles.teamName}>
                        {match.home_team.name}
                      </span>
                      <span className={styles.vs}>vs</span>
                      <span className={styles.teamName}>
                        {match.away_team.name}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={styles.competition}>
                      {match.competition.name}
                    </span>
                  </td>
                  <td>
                    {match.home_score !== null && match.away_score !== null ? (
                      <span className={styles.score}>
                        {match.home_score} - {match.away_score}
                      </span>
                    ) : (
                      <span className={styles.noScore}>-</span>
                    )}
                  </td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${
                        styles[`status${match.status}`]
                      }`}
                    >
                      {getStatusLabel(match.status)}
                    </span>
                  </td>
                  <td>
                    {match.is_featured ? (
                      <span className={styles.featuredBadge}>
                        {match.featured_name || "Hot"}
                      </span>
                    ) : (
                      <span className={styles.notFeatured}>-</span>
                    )}
                  </td>
                  <td>
                    <MatchActions match={match} competitions={competitions} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
