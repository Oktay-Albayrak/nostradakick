import { API_URL } from "@/config/api";
"use client";

import { useState } from "react";
import styles from "./admin.module.css";

interface ResetPasswordButtonProps {
  userId: string;
  username: string;
}

export default function ResetPasswordButton({
  userId,
  username,
}: ResetPasswordButtonProps) {
  const [isResetting, setIsResetting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function generateRandomPassword(): string {
    const length = 12;
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    // Assurer au moins une majuscule, une minuscule et un chiffre
    password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
    password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
    password += "0123456789"[Math.floor(Math.random() * 10)];
    // Remplir le reste
    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    // Mélanger
    return password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");
  }

  function handleOpenModal() {
    const generatedPassword = generateRandomPassword();
    setNewPassword(generatedPassword);
    setConfirmPassword(generatedPassword);
    setError(null);
    setSuccess(false);
    setShowModal(true);
  }

  function handleCloseModal() {
    setShowModal(false);
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
    setSuccess(false);
  }

  async function handleReset() {
    if (!newPassword || newPassword.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    // Validation regex (majuscule, minuscule, chiffre)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(newPassword)) {
      setError(
        "Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre"
      );
      return;
    }

    setIsResetting(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_URL}/api/users/${userId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            password: newPassword,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.error || data.message || "Erreur lors de la réinitialisation"
        );
      }

      setSuccess(true);
      setTimeout(() => {
        handleCloseModal();
      }, 2000);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Erreur lors de la réinitialisation"
      );
    } finally {
      setIsResetting(false);
    }
  }

  return (
    <>
      <button
        className={`${styles.actionButton} ${styles.resetButton}`}
        onClick={handleOpenModal}
        title="Réinitialiser le mot de passe"
      >
        Reset MDP
      </button>

      {showModal && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className={styles.modalTitle}>
              Réinitialiser le mot de passe
            </h2>
            <p className={styles.modalSubtitle}>
              Utilisateur : <strong>{username}</strong>
            </p>

            {error && <div className={styles.modalError}>{error}</div>}
            {success && (
              <div className={styles.modalSuccess}>
                Mot de passe réinitialisé avec succès !
              </div>
            )}

            <div className={styles.modalForm}>
              <label className={styles.modalLabel}>
                Nouveau mot de passe
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={styles.modalInput}
                  placeholder="Généré automatiquement"
                  disabled={isResetting}
                />
              </label>

              <label className={styles.modalLabel}>
                Confirmer le mot de passe
                <input
                  type="text"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={styles.modalInput}
                  placeholder="Généré automatiquement"
                  disabled={isResetting}
                />
              </label>

              <div className={styles.modalButtons}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className={styles.modalCancelButton}
                  disabled={isResetting}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const generated = generateRandomPassword();
                    setNewPassword(generated);
                    setConfirmPassword(generated);
                  }}
                  className={styles.modalGenerateButton}
                  disabled={isResetting}
                >
                  Régénérer
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className={styles.modalConfirmButton}
                  disabled={isResetting || success}
                >
                  {isResetting ? "Réinitialisation..." : "Confirmer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
