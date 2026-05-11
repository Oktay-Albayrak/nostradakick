"use client";

import { API_URL } from "@/config/api";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./admin.module.css";
import { IMatch, ICompetition } from "@/types/match";
import TeamSearchInput, { type CreateTeamData } from "./TeamSearchInput";
import CompetitionSearchInput, { type CreateCompetitionData } from "./CompetitionSearchInput";

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

  // Champs pour créer une compétition / équipes directement dans le formulaire
  const [newComp, setNewComp] = useState({ name: "", code: "", emblem_url: "", country: "" });
  const [newHomeTeam, setNewHomeTeam] = useState({ name: "", tla: "", crest_url: "", country: "" });
  const [newAwayTeam, setNewAwayTeam] = useState({ name: "", tla: "", crest_url: "", country: "" });
  const [isCreatingComp, setIsCreatingComp] = useState(false);
  const [isCreatingHomeTeam, setIsCreatingHomeTeam] = useState(false);
  const [isCreatingAwayTeam, setIsCreatingAwayTeam] = useState(false);

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

  async function createNewTeam(data: CreateTeamData) {
    const response = await fetch(`${API_URL}/api/teams`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        name: data.name,
        tla: data.tla,
        crest_url: data.crest_url || "",
        country: data.country,
        ...(data.short_name && { short_name: data.short_name }),
      }),
    });

    if (!response.ok) {
      const res = await response.json();
      throw new Error(res.message || res.details?.join?.(" ") || "Erreur lors de la création de l'équipe");
    }

    return await response.json();
  }

  async function createNewCompetition(data: CreateCompetitionData) {
    const response = await fetch(`${API_URL}/api/competitions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        name: data.name,
        ...(data.code && { code: data.code }),
        emblem_url: data.emblem_url || "",
        country: data.country,
      }),
    });

    if (!response.ok) {
      const res = await response.json();
      throw new Error(res.message || res.details?.join?.(" ") || "Erreur lors de la création de la compétition");
    }

    return await response.json();
  }

  async function handleCreateCompetitionFromForm() {
    if (!newComp.name.trim() || !newComp.country.trim()) return;
    setIsCreatingComp(true);
    setError(null);
    try {
      const comp = await createNewCompetition({
        name: newComp.name.trim(),
        code: newComp.code.trim() || undefined,
        emblem_url: newComp.emblem_url.trim(),
        country: newComp.country.trim(),
      });
      setFormData((prev) => ({ ...prev, competition_id: comp.id }));
      setNewComp({ name: "", code: "", emblem_url: "", country: "" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur création compétition");
    } finally {
      setIsCreatingComp(false);
    }
  }

  async function handleCreateHomeTeamFromForm() {
    if (!newHomeTeam.name.trim() || !newHomeTeam.tla.trim() || !newHomeTeam.country.trim()) return;
    setIsCreatingHomeTeam(true);
    setError(null);
    try {
      const team = await createNewTeam({
        name: newHomeTeam.name.trim(),
        tla: newHomeTeam.tla.trim().slice(0, 6),
        crest_url: newHomeTeam.crest_url.trim(),
        country: newHomeTeam.country.trim(),
      });
      setFormData((prev) => ({ ...prev, home_team_id: team.id }));
      setNewHomeTeam({ name: "", tla: "", crest_url: "", country: "" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur création équipe");
    } finally {
      setIsCreatingHomeTeam(false);
    }
  }

  async function handleCreateAwayTeamFromForm() {
    if (!newAwayTeam.name.trim() || !newAwayTeam.tla.trim() || !newAwayTeam.country.trim()) return;
    setIsCreatingAwayTeam(true);
    setError(null);
    try {
      const team = await createNewTeam({
        name: newAwayTeam.name.trim(),
        tla: newAwayTeam.tla.trim().slice(0, 6),
        crest_url: newAwayTeam.crest_url.trim(),
        country: newAwayTeam.country.trim(),
      });
      setFormData((prev) => ({ ...prev, away_team_id: team.id }));
      setNewAwayTeam({ name: "", tla: "", crest_url: "", country: "" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur création équipe");
    } finally {
      setIsCreatingAwayTeam(false);
    }
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
        // Pour la création, l'id est auto-généré par Prisma
        const payload: any = {
          date: dateTime.toISOString(),
          status: formData.status,
          home_team_id: formData.home_team_id,
          away_team_id: formData.away_team_id,
          competition_id: formData.competition_id,
          is_featured: formData.is_featured,
        };

        // N'envoyer les scores que s'ils sont renseignés (évite d'envoyer null)
        if (formData.home_score !== "") {
          payload.home_score = parseInt(formData.home_score, 10);
        }
        if (formData.away_score !== "") {
          payload.away_score = parseInt(formData.away_score, 10);
        }

        // N'envoyer featured_name que s'il y a une valeur non vide
        if (formData.featured_name && formData.featured_name.trim() !== "") {
          payload.featured_name = formData.featured_name.trim();
        }

        const response = await fetch(`${API_URL}/api/matches`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const data = await response.json();
          const message = data.details?.length
            ? data.details.join(". ")
            : data.error || data.message || "Erreur lors de l'enregistrement";
          throw new Error(message);
        }

        setSuccess(true);
        onClose();
        setTimeout(() => {
          window.location.href = "/admin/matchs";
        }, 800);
      } else {
        // Pour la modification
        const payload: any = {
          status: formData.status,
          is_featured: formData.is_featured,
        };

        if (formData.home_score !== "") {
          payload.home_score = parseInt(formData.home_score, 10);
        }
        if (formData.away_score !== "") {
          payload.away_score = parseInt(formData.away_score, 10);
        }

        if (formData.featured_name && formData.featured_name.trim() !== "") {
          payload.featured_name = formData.featured_name.trim();
        }

        const response = await fetch(
          `${API_URL}/api/matches/${match.id}`,
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
          const message = data.details?.length
            ? data.details.join(". ")
            : data.error || data.message || "Erreur lors de l'enregistrement";
          throw new Error(message);
        }

        setSuccess(true);
        onClose();
        setTimeout(() => {
          window.location.href = "/admin/matchs";
        }, 800);
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
          <div className={styles.dateTimeRow}>
            <label className={styles.modalLabel} style={{ flex: 1 }}>
              Date
              <div className={styles.dateSelects}>
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
              <div className={styles.timeSelects}>
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
          {!isEditMode && (
            <div className={styles.createBlock}>
              <div className={styles.createBlockTitle}>Ou créer une nouvelle compétition</div>
              <div className={styles.createBlockGrid}>
                <input
                  type="text"
                  value={newComp.name}
                  onChange={(e) => setNewComp((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Nom *"
                  className={styles.modalInput}
                  disabled={isLoading || isCreatingComp}
                />
                <input
                  type="text"
                  value={newComp.code}
                  onChange={(e) => setNewComp((p) => ({ ...p, code: e.target.value }))}
                  placeholder="Code (optionnel)"
                  className={styles.modalInput}
                  disabled={isLoading || isCreatingComp}
                  maxLength={10}
                />
                <input
                  type="text"
                  value={newComp.emblem_url}
                  onChange={(e) => setNewComp((p) => ({ ...p, emblem_url: e.target.value }))}
                  placeholder="URL emblème"
                  className={styles.modalInput}
                  disabled={isLoading || isCreatingComp}
                />
                <input
                  type="text"
                  value={newComp.country}
                  onChange={(e) => setNewComp((p) => ({ ...p, country: e.target.value }))}
                  placeholder="Pays *"
                  className={styles.modalInput}
                  disabled={isLoading || isCreatingComp}
                />
              </div>
              <button
                type="button"
                onClick={handleCreateCompetitionFromForm}
                disabled={!newComp.name.trim() || !newComp.country.trim() || isLoading || isCreatingComp}
                className={styles.modalConfirmButton}
                style={{ marginTop: "6px", padding: "6px 12px" }}
              >
                {isCreatingComp ? "Création..." : "Créer la compétition"}
              </button>
            </div>
          )}

          <TeamSearchInput
            value={formData.home_team_id}
            onChange={(id) => setFormData((prev) => ({ ...prev, home_team_id: id }))}
            label="Équipe à domicile"
            disabled={isLoading}
            onCreateNew={createNewTeam}
          />
          {!isEditMode && (
            <div className={styles.createBlock}>
              <div className={styles.createBlockTitle}>Ou créer une nouvelle équipe (domicile)</div>
              <div className={styles.createBlockGrid}>
                <input
                  type="text"
                  value={newHomeTeam.name}
                  onChange={(e) => setNewHomeTeam((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Nom *"
                  className={styles.modalInput}
                  disabled={isLoading || isCreatingHomeTeam}
                />
                <input
                  type="text"
                  value={newHomeTeam.tla}
                  onChange={(e) => setNewHomeTeam((p) => ({ ...p, tla: e.target.value.toUpperCase() }))}
                  placeholder="TLA * (ex: PSG)"
                  className={styles.modalInput}
                  disabled={isLoading || isCreatingHomeTeam}
                  maxLength={6}
                />
                <input
                  type="text"
                  value={newHomeTeam.crest_url}
                  onChange={(e) => setNewHomeTeam((p) => ({ ...p, crest_url: e.target.value }))}
                  placeholder="URL logo"
                  className={styles.modalInput}
                  disabled={isLoading || isCreatingHomeTeam}
                />
                <input
                  type="text"
                  value={newHomeTeam.country}
                  onChange={(e) => setNewHomeTeam((p) => ({ ...p, country: e.target.value }))}
                  placeholder="Pays *"
                  className={styles.modalInput}
                  disabled={isLoading || isCreatingHomeTeam}
                />
              </div>
              <button
                type="button"
                onClick={handleCreateHomeTeamFromForm}
                disabled={!newHomeTeam.name.trim() || !newHomeTeam.tla.trim() || !newHomeTeam.country.trim() || isLoading || isCreatingHomeTeam}
                className={styles.modalConfirmButton}
                style={{ marginTop: "6px", padding: "6px 12px" }}
              >
                {isCreatingHomeTeam ? "Création..." : "Créer l'équipe"}
              </button>
            </div>
          )}

          <TeamSearchInput
            value={formData.away_team_id}
            onChange={(id) => setFormData((prev) => ({ ...prev, away_team_id: id }))}
            label="Équipe à l'extérieur"
            disabled={isLoading}
            onCreateNew={createNewTeam}
          />
          {!isEditMode && (
            <div className={styles.createBlock}>
              <div className={styles.createBlockTitle}>Ou créer une nouvelle équipe (extérieur)</div>
              <div className={styles.createBlockGrid}>
                <input
                  type="text"
                  value={newAwayTeam.name}
                  onChange={(e) => setNewAwayTeam((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Nom *"
                  className={styles.modalInput}
                  disabled={isLoading || isCreatingAwayTeam}
                />
                <input
                  type="text"
                  value={newAwayTeam.tla}
                  onChange={(e) => setNewAwayTeam((p) => ({ ...p, tla: e.target.value.toUpperCase() }))}
                  placeholder="TLA * (ex: OM)"
                  className={styles.modalInput}
                  disabled={isLoading || isCreatingAwayTeam}
                  maxLength={6}
                />
                <input
                  type="text"
                  value={newAwayTeam.crest_url}
                  onChange={(e) => setNewAwayTeam((p) => ({ ...p, crest_url: e.target.value }))}
                  placeholder="URL logo"
                  className={styles.modalInput}
                  disabled={isLoading || isCreatingAwayTeam}
                />
                <input
                  type="text"
                  value={newAwayTeam.country}
                  onChange={(e) => setNewAwayTeam((p) => ({ ...p, country: e.target.value }))}
                  placeholder="Pays *"
                  className={styles.modalInput}
                  disabled={isLoading || isCreatingAwayTeam}
                />
              </div>
              <button
                type="button"
                onClick={handleCreateAwayTeamFromForm}
                disabled={!newAwayTeam.name.trim() || !newAwayTeam.tla.trim() || !newAwayTeam.country.trim() || isLoading || isCreatingAwayTeam}
                className={styles.modalConfirmButton}
                style={{ marginTop: "6px", padding: "6px 12px" }}
              >
                {isCreatingAwayTeam ? "Création..." : "Créer l'équipe"}
              </button>
            </div>
          )}

          <div className={styles.dateTimeRow}>
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
