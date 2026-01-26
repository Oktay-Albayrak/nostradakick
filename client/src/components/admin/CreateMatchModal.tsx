"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./admin.module.css";
import { IMatch, ICompetition } from "@/types/match";

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
    date: match ? new Date(match.date).toISOString().slice(0, 10) : "",
    time: match ? new Date(match.date).toTimeString().slice(0, 5) : "",
    status: match?.status || "SCHEDULED",
    home_team_id: match?.home_team.id || "",
    away_team_id: match?.away_team.id || "",
    competition_id: match?.competition.id || "",
    home_score: match?.home_score?.toString() || "",
    away_score: match?.away_score?.toString() || "",
    is_featured: match?.is_featured || false,
    featured_name: match?.featured_name || "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
      // Combiner date et heure
      const dateTime = new Date(`${formData.date}T${formData.time}`);
      
      const payload: {
        date: string;
        status: string;
        home_team_id: string;
        away_team_id: string;
        competition_id: string;
        home_score: number | null;
        away_score: number | null;
        is_featured: boolean;
        featured_name: string | null;
      } = {
        date: dateTime.toISOString(),
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
          <div style={{ display: "flex", gap: "1rem" }}>
            <label className={styles.modalLabel} style={{ flex: 1 }}>
              Date
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={styles.modalInput}
                required
                disabled={isLoading}
                lang="fr"
              />
            </label>
            <label className={styles.modalLabel} style={{ flex: 1 }}>
              Heure (24h)
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className={styles.modalInput}
                required
                disabled={isLoading}
                step="60"
              />
            </label>
          </div>

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
            Compétition (ID)
            <input
              type="text"
              name="competition_id"
              value={formData.competition_id}
              onChange={handleChange}
              className={styles.modalInput}
              required
              disabled={isLoading}
              placeholder="Entrer l'ID de la compétition"
            />
          </label>

          <label className={styles.modalLabel}>
            Équipe à domicile (ID)
            <input
              type="text"
              name="home_team_id"
              value={formData.home_team_id}
              onChange={handleChange}
              className={styles.modalInput}
              required
              disabled={isLoading}
              placeholder="Entrer l'ID de l'équipe à domicile"
            />
          </label>

          <label className={styles.modalLabel}>
            Équipe à l{"'"}extérieur (ID)
            <input
              type="text"
              name="away_team_id"
              value={formData.away_team_id}
              onChange={handleChange}
              className={styles.modalInput}
              required
              disabled={isLoading}
              placeholder="Entrer l'ID de l'équipe à l'extérieur"
            />
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
