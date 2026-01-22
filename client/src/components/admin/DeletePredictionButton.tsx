"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./admin.module.css";

interface DeletePredictionButtonProps {
  predictionId: string;
  userName: string;
  matchName: string;
}

export default function DeletePredictionButton({
  predictionId,
  userName,
  matchName,
}: DeletePredictionButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleDelete() {
    if (
      !confirm(
        `Êtes-vous sûr de vouloir supprimer le pronostic de ${userName} pour ${matchName} ?`
      )
    ) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:4000/api/predictions/${predictionId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la suppression");
      }

      // Rafraîchir la page pour mettre à jour la liste
      router.refresh();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Erreur lors de la suppression"
      );
      setIsDeleting(false);
    }
  }

  return (
    <div>
      <button
        className={`${styles.actionButton} ${styles.deleteButton}`}
        onClick={handleDelete}
        disabled={isDeleting}
        title="Supprimer ce pronostic"
      >
        {isDeleting ? "Suppression..." : "Supprimer"}
      </button>
      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  );
}
