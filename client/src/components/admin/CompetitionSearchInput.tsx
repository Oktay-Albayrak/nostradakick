"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./admin.module.css";

interface Competition {
  id: string;
  name: string;
  code: string;
}

interface CompetitionSearchInputProps {
  value: string;
  onChange: (competitionId: string) => void;
  placeholder?: string;
  label: string;
  disabled?: boolean;
  onCreateNew?: (name: string, code: string) => Promise<Competition>;
}

export default function CompetitionSearchInput({
  value,
  onChange,
  placeholder = "Rechercher une compétition...",
  label,
  disabled = false,
  onCreateNew,
}: CompetitionSearchInputProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCompetitionName, setNewCompetitionName] = useState("");
  const [newCompetitionCode, setNewCompetitionCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Charger la compétition sélectionnée au montage si value est définie
  useEffect(() => {
    if (value && !selectedCompetition) {
      fetchCompetitionById(value);
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

  async function fetchCompetitionById(competitionId: string) {
    try {
      const response = await fetch(`http://localhost:4000/api/competitions?limit=1000`);
      if (response.ok) {
        const allCompetitions: Competition[] = await response.json();
        const competition = allCompetitions.find((c) => c.id === competitionId);
        if (competition) {
          setSelectedCompetition(competition);
          setSearchQuery(competition.name);
        }
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de la compétition:", error);
    }
  }

  async function searchCompetitions(query: string) {
    if (query.length < 2) {
      setCompetitions([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `http://localhost:4000/api/competitions?q=${encodeURIComponent(query)}&limit=10`
      );
      if (response.ok) {
        const results: Competition[] = await response.json();
        setCompetitions(results);
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
    setSelectedCompetition(null);
    
    if (query.length >= 2) {
      searchCompetitions(query);
    } else {
      setCompetitions([]);
      setShowDropdown(false);
    }
  }

  function handleSelectCompetition(competition: Competition) {
    setSelectedCompetition(competition);
    setSearchQuery(competition.name);
    setShowDropdown(false);
    onChange(competition.id);
  }

  async function handleCreateNew() {
    if (!newCompetitionName.trim() || !newCompetitionCode.trim() || !onCreateNew) return;

    setIsCreating(true);
    try {
      const newCompetition = await onCreateNew(
        newCompetitionName.trim(),
        newCompetitionCode.trim().toUpperCase()
      );
      setSelectedCompetition(newCompetition);
      setSearchQuery(newCompetition.name);
      onChange(newCompetition.id);
      setShowCreateForm(false);
      setNewCompetitionName("");
      setNewCompetitionCode("");
    } catch (error) {
      console.error("Erreur lors de la création de la compétition:", error);
      alert("Erreur lors de la création de la compétition");
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
          ) : competitions.length > 0 ? (
            <>
              {competitions.map((competition) => (
                <div
                  key={competition.id}
                  onClick={() => handleSelectCompetition(competition)}
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
                  {competition.name} ({competition.code})
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
              Aucune compétition trouvée
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
            Créer une nouvelle compétition
          </div>
          <input
            type="text"
            value={newCompetitionName}
            onChange={(e) => setNewCompetitionName(e.target.value)}
            placeholder="Nom de la compétition"
            className={styles.modalInput}
            style={{ marginBottom: "8px" }}
            disabled={isCreating}
          />
          <input
            type="text"
            value={newCompetitionCode}
            onChange={(e) => setNewCompetitionCode(e.target.value)}
            placeholder="Code (ex: WC98)"
            className={styles.modalInput}
            style={{ marginBottom: "8px" }}
            disabled={isCreating}
            maxLength={10}
          />
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              onClick={handleCreateNew}
              disabled={!newCompetitionName.trim() || !newCompetitionCode.trim() || isCreating}
              className={styles.modalConfirmButton}
              style={{ flex: 1, padding: "6px 12px" }}
            >
              {isCreating ? "Création..." : "Créer"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreateForm(false);
                setNewCompetitionName("");
                setNewCompetitionCode("");
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
