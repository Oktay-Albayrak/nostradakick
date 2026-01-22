"use client";

import Link from "next/link";
import DeletePredictionButton from "./DeletePredictionButton";
import styles from "./admin.module.css";

interface PredictionActionsProps {
  predictionId: string;
  userName: string;
  matchName: string;
}

export default function PredictionActions({
  predictionId,
  userName,
  matchName,
}: PredictionActionsProps) {
  return (
    <div className={styles.actions}>
      <Link
        href={`/profil/${userName}`}
        className={styles.actionButton}
      >
        Voir utilisateur
      </Link>
      <DeletePredictionButton
        predictionId={predictionId}
        userName={userName}
        matchName={matchName}
      />
    </div>
  );
}
