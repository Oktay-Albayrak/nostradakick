"use client";

import Calendar from "react-calendar";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import styles from "./ArchiveControls.module.css";
import Link from "next/link";

// Type pour react-calendar (évite le soulignement rouge du 'any')
type CalendarValue = Date | null | [Date | null, Date | null];

export default function ArchiveControls({
  selectedDate,
  showOnlyChips = false,
}: {
  selectedDate: string;
  showOnlyChips: boolean;
}) {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // On définit "hier" comme date maximum autorisée
  const yesterday = new Date();
  yesterday.setHours(0, 0, 0, 0);
  yesterday.setDate(yesterday.getDate() - 1);

  /**
   * Génération dynamique des jours pour les pastilles :
   * On part d'hier et on remonte jusqu'au Lundi de la semaine précédente.
   */
  const generateLastDays = () => {
    const dates: string[] = [];
    const tempDate = new Date();
    tempDate.setDate(tempDate.getDate() - 1); // Commencer à hier

    // Trouver le lundi de la semaine précédente
    const lastMonday = new Date();
    const dayOfWeek = lastMonday.getDay(); // 0 (Dim) à 6 (Sam)
    const diffToMonday = dayOfWeek === 0 ? 13 : dayOfWeek + 6; // Recul pour atteindre lundi dernier ou précédent
    lastMonday.setDate(lastMonday.getDate() - diffToMonday);
    lastMonday.setHours(0, 0, 0, 0);

    // Remplir le tableau tant qu'on est pas remonté avant ce Lundi
    while (tempDate >= lastMonday) {
      dates.push(tempDate.toISOString().split("T")[0]);
      tempDate.setDate(tempDate.getDate() - 1);
    }
    return dates;
  };

  const lastDays = generateLastDays();

  const selectedTeam = searchParams.get("team"); // On récupère l'équipe si elle existe
  const currentStatus = searchParams.get("status");

  const handleToggleArchive = () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    const params = new URLSearchParams(searchParams.toString());

    if (selectedDate || currentStatus === "past") {
      // Désactiver le mode archive / résultats
      params.delete("date");
      params.delete("status");
    } else {
      // Activer le mode archive
      // On utilise "status=past" pour permettre l'infinite scroll vers l'arrière
      params.set("status", "past");
      params.delete("filter"); // On enlève le filtre HOT
      params.delete("date"); // On s'assure qu'aucune date fixe ne bloque l'infinite scroll
    }
    router.push(`/matchs?${params.toString()}`);
  };

  /* Gère le changement de date (pastilles ou calendrier) */
  function handleDateChange(value: CalendarValue | string) {
    let dateStr = "";

    if (value instanceof Date) {
      // Correction du décalage timezone pour le calendrier
      const offset = value.getTimezoneOffset();
      const localDate = new Date(value.getTime() - offset * 60 * 1000);
      dateStr = localDate.toISOString().split("T")[0];
    } else if (typeof value === "string") {
      dateStr = value;
    }

    if (!dateStr) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("date", dateStr);

    // IMPORTANT : Si on choisit une date précise, on supprime "status=past"
    // pour que le serveur n'affiche que ce jour-là et pas toute l'archive.
    params.delete("status");

    router.push(`/matchs?${params.toString()}`);
  }

  const isPastActive = !!selectedDate || currentStatus === "past";

  // AFFICHAGE DES PASTILLES (Mode Bandeau Horizontal)
  if (showOnlyChips) {
    if (!isLoggedIn) return null;
    return (
      <div className={styles.dateStripUniversal}>
        <div className={styles.dateScroll}>
          {lastDays.map((d) => (
            <button
              key={d}
              onClick={() => handleDateChange(d)}
              className={`${styles.dateChip} ${selectedDate === d ? styles.activeChip : ""}`}
            >
              {new Date(d).toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "2-digit",
              })}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* BOUTON MOBILE (Filtre rapide) */}
      <button
        className={`${styles.archiveMobileBtn} ${isPastActive ? styles.activeArchive : ""}`}
        onClick={handleToggleArchive}
      >
        ⚽ {isPastActive ? "VOIR MATCHS À VENIR" : "RÉSULTATS"}
      </button>

      {/* BLOC DESKTOP (Sidebar) */}
      <div className={styles.desktopArchiveBox}>
        <h3 className={styles.sidebarTitle}>Anciens Matchs</h3>
        <button
          onClick={handleToggleArchive}
          className={`${styles.desktopToggle} ${isPastActive ? styles.activeArchive : ""}`}
        >
          {isPastActive
            ? "⬅ Retour matchs à venir"
            : "Afficher les précédents matchs"}
        </button>

        <div className={styles.calendarPositioner}>
          <div
            className={`${styles.calendarWrapper} ${!isLoggedIn ? styles.blurred : ""}`}
          >
            <Calendar
              onChange={(val) => handleDateChange(val as CalendarValue)}
              value={selectedDate ? new Date(selectedDate) : null}
              maxDate={yesterday}
              locale="fr-FR"
              className={styles.customCalendar}
            />
          </div>
          {!isLoggedIn && (
            <div className={styles.overlay}>
              <Link href="/login" className={styles.loginLink}>
                Connectez-vous pour voir les scores
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
