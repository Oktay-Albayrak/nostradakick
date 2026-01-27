"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./admin.module.css";
import { IMatch, ICompetition } from "@/types/match";
import TeamSearchInput from "./TeamSearchInput";
import CompetitionSearchInput from "./CompetitionSearchInput";

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

  const matchTime = match ? new Date(match.date).toTimeString().slice(0, 5) : "00:00";
  const matchDate = match ? new Date(match.date) : new Date();
  const [formData, setFormData] = useState({
    day: match ? matchDate.getDate().toString().padStart(2, "0") : new Date().getDate().toString().padStart(2, "0"),
    month: match ? (matchDate.getMonth() + 1).toString().padStart(2, "0") : (new Date().getMonth() + 1).toString().padStart(2, "0"),
    year: match ? matchDate.getFullYear().toString() : new Date().getFullYear().toString(),
    hour: matchTime.split(":")[0] || "00",
    minute: matchTime.split(":")[1] || "00",
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

  async function createNewTeam(name: string) {
    const response = await fetch("http://localhost:4000/api/teams", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        name,
        country: "Unknown",
        tla: "N/A",
        crest_url: "",
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Erreur lors de la création de l'équipe");
    }

    return await response.json();
  }

  async function createNewCompetition(name: string, code: string) {
    const response = await fetch("http://localhost:4000/api/competitions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        name,
        code,
        country: "Unknown",
        emblem_url: "",
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Erreur lors de la création de la compétition");
    }

    return await response.json();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Combiner date et heure
      const dateString = `${formData.year}-${formData.month.padStart(2, "0")}-${formData.day.padStart(2, "0")}`;
      const timeString = `${formData.hour.padStart(2, "0")}:${formData.minute.padStart(2, "0")}`;
      const dateTime = new Date(`${dateString}T${timeString}`);
      
      if (!isEditMode) {
        // Pour la création, on doit générer un id et un api_id
        const payload = {
          id: crypto.randomUUID(),
          api_id: Date.now(), // Utiliser un timestamp comme api_id temporaire
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

        const response = await fetch("http://localhost:4000/api/matches", {
          method: "POST",
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
      } else {
        // Pour la modification
        const payload = {
          status: formData.status,
          home_score:
            formData.home_score === "" ? null : parseInt(formData.home_score),
          away_score:
            formData.away_score === "" ? null : parseInt(formData.away_score),
          is_featured: formData.is_featured,
          featured_name: formData.featured_name || null,
        };

        const response = await fetch(
          `http://localhost:4000/api/matches/${match.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(payload),
          }
        );

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
      }

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
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <select
                  name="day"
                  value={formData.day}
                  onChange={handleChange}
                  className={styles.modalInput}
                  required
                  disabled={isLoading}
                  style={{ flex: 1 }}
                >
                  {Array.from({ length: 31 }, (_, i) => {
                    const day = (i + 1).toString().padStart(2, "0");
                    return (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    );
                  })}
                </select>
                <select
                  name="month"
                  value={formData.month}
                  onChange={handleChange}
                  className={styles.modalInput}
                  required
                  disabled={isLoading}
                  style={{ flex: 1 }}
                >
                  <option value="01">Janvier</option>
                  <option value="02">Février</option>
                  <option value="03">Mars</option>
                  <option value="04">Avril</option>
                  <option value="05">Mai</option>
                  <option value="06">Juin</option>
                  <option value="07">Juillet</option>
                  <option value="08">Août</option>
                  <option value="09">Septembre</option>
                  <option value="10">Octobre</option>
                  <option value="11">Novembre</option>
                  <option value="12">Décembre</option>
                </select>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className={styles.modalInput}
                  required
                  disabled={isLoading}
                  style={{ flex: 1 }}
                >
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = (new Date().getFullYear() + i).toString();
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>
            </label>
            <label className={styles.modalLabel} style={{ flex: 1 }}>
              Heure (24h)
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <select
                  name="hour"
                  value={formData.hour}
                  onChange={handleChange}
                  className={styles.modalInput}
                  required
                  disabled={isLoading}
                  style={{ flex: 1 }}
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i.toString().padStart(2, "0")}>
                      {i.toString().padStart(2, "0")}
                    </option>
                  ))}
                </select>
                <span style={{ alignSelf: "center", padding: "0 0.25rem" }}>:</span>
                <select
                  name="minute"
                  value={formData.minute}
                  onChange={handleChange}
                  className={styles.modalInput}
                  required
                  disabled={isLoading}
                  style={{ flex: 1 }}
                >
                  {Array.from({ length: 60 }, (_, i) => (
                    <option key={i} value={i.toString().padStart(2, "0")}>
                      {i.toString().padStart(2, "0")}
                    </option>
                  ))}
                </select>
              </div>
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

          <CompetitionSearchInput
            value={formData.competition_id}
            onChange={(id) => setFormData((prev) => ({ ...prev, competition_id: id }))}
            label="Compétition"
            disabled={isLoading}
            onCreateNew={createNewCompetition}
          />

          <TeamSearchInput
            value={formData.home_team_id}
            onChange={(id) => setFormData((prev) => ({ ...prev, home_team_id: id }))}
            label="Équipe à domicile"
            disabled={isLoading}
            onCreateNew={createNewTeam}
          />

          <TeamSearchInput
            value={formData.away_team_id}
            onChange={(id) => setFormData((prev) => ({ ...prev, away_team_id: id }))}
            label="Équipe à l'extérieur"
            disabled={isLoading}
            onCreateNew={createNewTeam}
          />

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
