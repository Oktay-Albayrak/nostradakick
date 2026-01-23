"use client";

import { useState } from "react";
import styles from "../../app/admin/matchs/page.module.css";
import { ICompetition } from "@/types/match";
import CreateMatchModal from "./CreateMatchModal";

interface CreateMatchButtonProps {
  competitions: ICompetition[];
}

export default function CreateMatchButton({ competitions }: CreateMatchButtonProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        className={styles.createButton}
        onClick={() => setShowModal(true)}
      >
        <span>+</span>
        <span>Ajouter un match</span>
      </button>
      
      {showModal && (
        <CreateMatchModal
          competitions={competitions}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
