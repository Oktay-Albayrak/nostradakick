// Popup réutilisable pour confirmations, succès, erreurs (deux boutons ou un seul selon isConfirmation)
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
  isConfirmation?: boolean; // true = Confirmer/Annuler, false = OK seulement
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
