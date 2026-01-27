"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./admin.module.css";

interface Team {
  id: string;
  name: string;
  short_name?: string;
  tla?: string;
}

interface TeamSearchInputProps {
  value: string;
  onChange: (teamId: string) => void;
  placeholder?: string;
  label: string;
  disabled?: boolean;
  onCreateNew?: (name: string) => Promise<Team>;
}

export default function TeamSearchInput({
  value,
  onChange,
  placeholder = "Rechercher une équipe...",
  label,
  disabled = false,
  onCreateNew,
}: TeamSearchInputProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [teams, setTeams] = useState<Team[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Charger l'équipe sélectionnée au montage si value est définie
  useEffect(() => {
    if (value && !selectedTeam) {
      fetchTeamById(value);
    }
  }, [value]);

  // Fermer le dropdown si on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function fetchTeamById(teamId: string) {
    try {
      const response = await fetch(`http://localhost:4000/api/teams?limit=1000`);
      if (response.ok) {
        const allTeams: Team[] = await response.json();
        const team = allTeams.find((t) => t.id === teamId);
        if (team) {
          setSelectedTeam(team);
          setSearchQuery(team.name);
        }
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de l'équipe:", error);
    }
  }

  async function searchTeams(query: string) {
    if (query.length < 2) {
      setTeams([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `http://localhost:4000/api/teams?q=${encodeURIComponent(query)}&limit=10`
      );
      if (response.ok) {
        const results: Team[] = await response.json();
        setTeams(results);
        setShowDropdown(true);
      }
    } catch (error) {
      console.error("Erreur lors de la recherche:", error);
    } finally {
      setIsSearching(false);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const query = e.target.value;
    setSearchQuery(query);
    setSelectedTeam(null);
    
    if (query.length >= 2) {
      searchTeams(query);
    } else {
      setTeams([]);
      setShowDropdown(false);
    }
  }

  function handleSelectTeam(team: Team) {
    setSelectedTeam(team);
    setSearchQuery(team.name);
    setShowDropdown(false);
    onChange(team.id);
  }

  async function handleCreateNew() {
    if (!newTeamName.trim() || !onCreateNew) return;

    setIsCreating(true);
    try {
      const newTeam = await onCreateNew(newTeamName.trim());
      setSelectedTeam(newTeam);
      setSearchQuery(newTeam.name);
      onChange(newTeam.id);
      setShowCreateForm(false);
      setNewTeamName("");
    } catch (error) {
      console.error("Erreur lors de la création de l'équipe:", error);
      alert("Erreur lors de la création de l'équipe");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div style={{ position: "relative" }}>
      <label className={styles.modalLabel}>
        {label}
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => {
            if (searchQuery.length >= 2) {
              setShowDropdown(true);
            }
          }}
          className={styles.modalInput}
          placeholder={placeholder}
          required
          disabled={disabled}
        />
      </label>

      {showDropdown && (
        <div
          ref={dropdownRef}
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            backgroundColor: "white",
            border: "1px solid #ccc",
            borderRadius: "4px",
            maxHeight: "200px",
            overflowY: "auto",
            zIndex: 1000,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          {isSearching ? (
            <div style={{ padding: "8px", textAlign: "center" }}>Recherche...</div>
          ) : teams.length > 0 ? (
            <>
              {teams.map((team) => (
                <div
                  key={team.id}
                  onClick={() => handleSelectTeam(team)}
                  style={{
                    padding: "8px 12px",
                    cursor: "pointer",
                    borderBottom: "1px solid #eee",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f5f5f5";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "white";
                  }}
                >
                  {team.name} {team.short_name && `(${team.short_name})`}
                </div>
              ))}
              {onCreateNew && (
                <div
                  onClick={() => {
                    setShowCreateForm(true);
                    setShowDropdown(false);
                  }}
                  style={{
                    padding: "8px 12px",
                    cursor: "pointer",
                    backgroundColor: "#e3f2fd",
                    fontWeight: "bold",
                    borderTop: "2px solid #2196f3",
                  }}
                >
                  + Créer "{searchQuery}"
                </div>
              )}
            </>
          ) : searchQuery.length >= 2 ? (
            <div style={{ padding: "8px 12px" }}>
              Aucune équipe trouvée
              {onCreateNew && (
                <div
                  onClick={() => {
                    setShowCreateForm(true);
                    setShowDropdown(false);
                  }}
                  style={{
                    marginTop: "8px",
                    padding: "8px",
                    cursor: "pointer",
                    backgroundColor: "#e3f2fd",
                    borderRadius: "4px",
                    fontWeight: "bold",
                  }}
                >
                  + Créer "{searchQuery}"
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {showCreateForm && onCreateNew && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            backgroundColor: "white",
            border: "1px solid #2196f3",
            borderRadius: "4px",
            padding: "12px",
            zIndex: 1001,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            marginTop: "4px",
          }}
        >
          <div style={{ marginBottom: "8px", fontWeight: "bold" }}>
            Créer une nouvelle équipe
          </div>
          <input
            type="text"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            placeholder="Nom de l'équipe"
            className={styles.modalInput}
            style={{ marginBottom: "8px" }}
            disabled={isCreating}
          />
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              onClick={handleCreateNew}
              disabled={!newTeamName.trim() || isCreating}
              className={styles.modalConfirmButton}
              style={{ flex: 1, padding: "6px 12px" }}
            >
              {isCreating ? "Création..." : "Créer"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreateForm(false);
                setNewTeamName("");
              }}
              className={styles.modalCancelButton}
              style={{ flex: 1, padding: "6px 12px" }}
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
