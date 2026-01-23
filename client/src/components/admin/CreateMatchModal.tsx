"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./admin.module.css";
import { IMatch, ICompetition, ITeam } from "@/types/match";

interface CreateMatchModalProps {
  match?: IMatch;
  competitions: ICompetition[];
  onClose: () => void;
}

export default function CreateMatchModal({
  match,
  competitions,
  onClose,
}: CreateMatchModalProps) {
  const router = useRouter();
  const isEditMode = !!match;

  const [formData, setFormData] = useState({
    api_id: match?.api_id || "",
    date: match ? new Date(match.date).toISOString().slice(0, 16) : "",
    status: match?.status || "SCHEDULED",
    home_team_id: match?.home_team.id || "",
    away_team_id: match?.away_team.id || "",
    competition_id: match?.competition.id || "",
    home_score: match?.home_score?.toString() || "",
    away_score: match?.away_score?.toString() || "",
    is_featured: match?.is_featured || false,
    featured_name: match?.featured_name || "",
  });

  const [teams, setTeams] = useState<ITeam[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Récupérer les équipes depuis les matchs existants
  useEffect(() => {
    async function fetchTeams() {
      try {
        const response = await fetch("http://localhost:4000/api/matches?page=1&limit=1000");
        if (response.ok) {
          const matches: IMatch[] = await response.json();
          // Extraire toutes les équipes uniques
          const uniqueTeams = new Map<string, ITeam>();
          matches.forEach((m) => {
            if (!uniqueTeams.has(m.home_team.id)) {
              uniqueTeams.set(m.home_team.id, m.home_team);
            }
            if (!uniqueTeams.has(m.away_team.id)) {
              uniqueTeams.set(m.away_team.id, m.away_team);
            }
          });
          setTeams(Array.from(uniqueTeams.values()));
        }
      } catch (e) {
        console.error("Erreur lors de la récupération des équipes:", e);
      }
    }
    fetchTeams();
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "home_score" || name === "away_score") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? "" : value,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const payload: any = {
        date: new Date(formData.date).toISOString(),
        status: formData.status,
        home_team_id: formData.home_team_id,
        away_team_id: formData.away_team_id,
        competition_id: formData.competition_id,
        home_score:
          formData.home_score === "" ? null : parseInt(formData.home_score),
        away_score:
          formData.away_score === "" ? null : parseInt(formData.away_score),
        is_featured: formData.is_featured,
        featured_name: formData.featured_name || null,
      };

      if (!isEditMode) {
        // Création : ajouter api_id
        payload.api_id = parseInt(formData.api_id);
      }

      const url = isEditMode
        ? `http://localhost:4000/api/matches/${match.id}`
        : "http://localhost:4000/api/matches";

      const method = isEditMode ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.error || data.message || "Erreur lors de l'enregistrement"
        );
      }

      setSuccess(true);
      setTimeout(() => {
        router.refresh();
        onClose();
      }, 1500);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Erreur lors de l'enregistrement"
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "600px" }}
      >
        <h2 className={styles.modalTitle}>
          {isEditMode ? "Modifier le match" : "Créer un nouveau match"}
        </h2>

        {error && <div className={styles.modalError}>{error}</div>}
        {success && (
          <div className={styles.modalSuccess}>
            {isEditMode
              ? "Match modifié avec succès !"
              : "Match créé avec succès !"}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          {!isEditMode && (
            <label className={styles.modalLabel}>
              API ID
              <input
                type="number"
                name="api_id"
                value={formData.api_id}
                onChange={handleChange}
                className={styles.modalInput}
                required
                disabled={isLoading}
              />
            </label>
          )}

          <label className={styles.modalLabel}>
            Date et heure
            <input
              type="datetime-local"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={styles.modalInput}
              required
              disabled={isLoading}
            />
          </label>

          <label className={styles.modalLabel}>
            Statut
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={styles.modalInput}
              required
              disabled={isLoading}
            >
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
          </label>

          <label className={styles.modalLabel}>
            Compétition
            <select
              name="competition_id"
              value={formData.competition_id}
              onChange={handleChange}
              className={styles.modalInput}
              required
              disabled={isLoading}
            >
              <option value="">Sélectionner une compétition</option>
              {competitions.map((comp) => (
                <option key={comp.id} value={comp.id}>
                  {comp.name}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.modalLabel}>
            Équipe à domicile
            <select
              name="home_team_id"
              value={formData.home_team_id}
              onChange={handleChange}
              className={styles.modalInput}
              required
              disabled={isLoading}
            >
              <option value="">Sélectionner une équipe</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.modalLabel}>
            Équipe à l'extérieur
            <select
              name="away_team_id"
              value={formData.away_team_id}
              onChange={handleChange}
              className={styles.modalInput}
              required
              disabled={isLoading}
            >
              <option value="">Sélectionner une équipe</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </label>

          <div style={{ display: "flex", gap: "1rem" }}>
            <label className={styles.modalLabel} style={{ flex: 1 }}>
              Score domicile
              <input
                type="number"
                name="home_score"
                value={formData.home_score}
                onChange={handleChange}
                className={styles.modalInput}
                min="0"
                disabled={isLoading}
                placeholder="Optionnel"
              />
            </label>

            <label className={styles.modalLabel} style={{ flex: 1 }}>
              Score extérieur
              <input
                type="number"
                name="away_score"
                value={formData.away_score}
                onChange={handleChange}
                className={styles.modalInput}
                min="0"
                disabled={isLoading}
                placeholder="Optionnel"
              />
            </label>
          </div>

          <label
            className={styles.modalLabel}
            style={{ flexDirection: "row", alignItems: "center", gap: "0.5rem" }}
          >
            <input
              type="checkbox"
              name="is_featured"
              checked={formData.is_featured}
              onChange={handleChange}
              disabled={isLoading}
            />
            <span>Match featured (Hot)</span>
          </label>

          {formData.is_featured && (
            <label className={styles.modalLabel}>
              Nom du featured
              <input
                type="text"
                name="featured_name"
                value={formData.featured_name}
                onChange={handleChange}
                className={styles.modalInput}
                disabled={isLoading}
                placeholder="Ex: Le Classique, Choc au sommet..."
              />
            </label>
          )}

          <div className={styles.modalButtons}>
            <button
              type="button"
              onClick={onClose}
              className={styles.modalCancelButton}
              disabled={isLoading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className={styles.modalConfirmButton}
              disabled={isLoading || success}
            >
              {isLoading
                ? "Enregistrement..."
                : isEditMode
                ? "Modifier"
                : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
