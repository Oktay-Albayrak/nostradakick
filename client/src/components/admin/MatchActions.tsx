"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./admin.module.css";
import { IMatch, ICompetition } from "@/types/match";
import CreateMatchModal from "./CreateMatchModal";

interface MatchActionsProps {
  match: IMatch;
  competitions: ICompetition[];
}

export default function MatchActions({ match, competitions }: MatchActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleDelete() {
    if (
      !confirm(
        `Êtes-vous sûr de vouloir supprimer le match "${match.home_team.name} vs ${match.away_team.name}" ?\n\nCette action est irréversible et supprimera toutes les prédictions associées.`
      )
    ) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:4000/api/matches/${match.id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || data.message || "Erreur lors de la suppression");
      }

      // Rechargement complet pour que la liste soit à jour
      window.location.href = "/admin/matchs";
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Erreur lors de la suppression"
      );
      setIsDeleting(false);
    }
  }

  return (
    <>
      <div className={styles.actions}>
        <button
          className={`${styles.actionButton} ${styles.editButton}`}
          onClick={() => setShowEditModal(true)}
          title="Modifier ce match"
        >
          Modifier
        </button>
        <button
          className={`${styles.actionButton} ${styles.deleteButton}`}
          onClick={handleDelete}
          disabled={isDeleting}
          title="Supprimer ce match"
        >
          {isDeleting ? "Suppression..." : "Supprimer"}
        </button>
      </div>
      {error && <p className={styles.errorText}>{error}</p>}
      
      {showEditModal && (
        <CreateMatchModal
          match={match}
          competitions={competitions}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </>
  );
}
