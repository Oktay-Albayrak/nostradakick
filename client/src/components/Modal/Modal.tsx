/**
 * COMPOSANT MODAL
 * 
 * Popup réutilisable pour :
 * - Confirmations avant une action
 * - Messages de succès
 * - Messages d'erreur
 * 
 * Props:
 * - isOpen: booléen pour afficher/cacher
 * - title: titre du modal
 * - message: message principal
 * - onConfirm: callback si utilisateur clique "Confirmer"
 * - onCancel: callback si utilisateur clique "Annuler"
 * - confirmText: texte du bouton de confirmation (défaut: "Confirmer")
 * - cancelText: texte du bouton d'annulation (défaut: "Annuler")
 * - isConfirmation: si true = boutons Confirmer/Annuler, si false = bouton OK seulement
 */

"use client";

import styles from "./Modal.module.css";

interface ModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  isConfirmation?: boolean; // true = deux boutons, false = un seul bouton OK
}

export default function Modal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  isConfirmation = true,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button 
            className={styles.closeBtn} 
            onClick={onCancel}
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        <div className={styles.body}>
          <p className={styles.message}>{message}</p>
        </div>

        <div className={styles.footer}>
          {isConfirmation ? (
            <>
              <button 
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={onCancel}
              >
                {cancelText}
              </button>
              <button 
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={onConfirm}
              >
                {confirmText}
              </button>
            </>
          ) : (
            <button 
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
