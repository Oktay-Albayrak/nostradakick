"use client";

import Link from "next/link";
import DeleteUserButton from "./DeleteUserButton";
import ResetPasswordButton from "./ResetPasswordButton";
import styles from "./admin.module.css";

interface UserActionsProps {
  userId: string;
  username: string;
}

export default function UserActions({ userId, username }: UserActionsProps) {
  return (
    <div className={styles.actions}>
      <Link
        href={`/profil/${username}`}
        className={styles.actionButton}
      >
        Voir
      </Link>
      <button
        className={styles.actionButton}
        title="Modifier (à implémenter)"
      >
        Modifier
      </button>
      <ResetPasswordButton userId={userId} username={username} />
      <DeleteUserButton userId={userId} username={username} />
    </div>
  );
}
