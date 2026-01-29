"use client";

import { useState, useMemo, useEffect } from "react";
import { IMatch, ICompetition } from "@/types/match";
import styles from "../../app/admin/matchs/page.module.css";

interface MatchFiltersProps {
  matches: IMatch[];
  competitions: ICompetition[];
  onFilteredMatchesChange: (filteredMatches: IMatch[]) => void;
}

export default function MatchFilters({
  matches,
  competitions,
  onFilteredMatchesChange,
}: MatchFiltersProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompetition, setSelectedCompetition] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Filtrer les matchs en fonction des critères
  const filteredMatches = useMemo(() => {
    let filtered = [...matches];

    // Filtre par recherche (nom des équipes ou compétition)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (match) =>
          match.home_team.name.toLowerCase().includes(query) ||
          match.away_team.name.toLowerCase().includes(query) ||
          match.competition.name.toLowerCase().includes(query)
      );
    }

    // Filtre par compétition (id pour gérer les compétitions sans code / créées à la main)
    if (selectedCompetition !== "all") {
      filtered = filtered.filter(
        (match) => match.competition.id === selectedCompetition
      );
    }

    // Filtre par statut
    if (selectedStatus !== "all") {
      filtered = filtered.filter((match) => match.status === selectedStatus);
    }

    return filtered;
  }, [matches, searchQuery, selectedCompetition, selectedStatus]);

  // Notifier le parent des matchs filtrés
  useEffect(() => {
    onFilteredMatchesChange(filteredMatches);
  }, [filteredMatches, onFilteredMatchesChange]);

  return (
    <div className={styles.toolbar}>
      <input
        type="search"
        placeholder="Rechercher un match..."
        className={styles.searchInput}
        aria-label="Rechercher un match"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <select
        className={styles.filterSelect}
        value={selectedCompetition}
        onChange={(e) => setSelectedCompetition(e.target.value)}
      >
        <option value="all">Toutes les compétitions</option>
        {competitions.map((comp) => (
          <option key={comp.id} value={comp.id}>
            {comp.name}
          </option>
        ))}
      </select>
      <select
        className={styles.filterSelect}
        value={selectedStatus}
        onChange={(e) => setSelectedStatus(e.target.value)}
      >
        <option value="all">Tous les statuts</option>
        <option value="SCHEDULED">Programmé</option>
        <option value="TIMED">Programmé</option>
        <option value="IN_PLAY">En cours</option>
        <option value="PAUSED">Pause</option>
        <option value="FINISHED">Terminé</option>
        <option value="SUSPENDED">Suspendu</option>
        <option value="POSTPONED">Reporté</option>
        <option value="CANCELLED">Annulé</option>
        <option value="AWARDED">Attribué</option>
      </select>
    </div>
  );
}
