import { API_URL } from "@/config/api";
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./admin.module.css";

interface DeleteUserButtonProps {
  userId: string;
  username: string;
}

export default function DeleteUserButton({
  userId,
  username,
}: DeleteUserButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleDelete() {
    if (
      !confirm(
        `Êtes-vous sûr de vouloir supprimer l'utilisateur "${username}" ?\n\nCette action est irréversible et supprimera toutes les données associées (pronostics, statistiques).`
      )
    ) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_URL}/api/users/${userId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Erreur lors de la suppression");
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
        title="Supprimer cet utilisateur"
      >
        {isDeleting ? "Suppression..." : "Supprimer"}
      </button>
      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  );
}
