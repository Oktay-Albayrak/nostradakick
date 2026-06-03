"use client";

import { API_URL } from "@/config/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { IPrediction } from "@/types/prediction";
import { useAuth } from "@/context/AuthContext";
import PredictionActions from "@/components/admin/PredictionActions";

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function getPredictionLabel(value: string): string {
  switch (value) {
    case "HOME":
      return "1";
    case "DRAW":
      return "N";
    case "AWAY":
      return "2";
    default:
      return value;
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "PENDING":
      return "En attente";
    case "WON":
      return "Gagné";
    case "LOST":
      return "Perdu";
    case "CANCELLED":
      return "Annulé";
    default:
      return status;
  }
}

export default function AdminPronostics() {
  const { isLoggedIn, role, authFetch } = useAuth();
  const router = useRouter();
  
  const [predictions, setPredictions] = useState<IPrediction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const isAuthorized = isLoggedIn && role === "ADMIN";

  // Vérification de l'authentification et du rôle ADMIN
  useEffect(() => {
    // Redirection si non authentifié ou non admin
    if (!isLoggedIn) {
      router.replace("/login");
      return;
    }
    if (role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [isLoggedIn, role, router]);

  // Récupération des pronostics
  useEffect(() => {
    if (!isAuthorized) return;

    async function loadData() {
      try {
        setIsLoadingData(true);
        setError(null);

        const response = await authFetch(`${API_URL}/api/predictions`, {
          cache: "no-store",
        });

        if (!response.ok) {
          setError("Erreur lors du chargement des pronostics");
        } else {
          const data = await response.json();
          setPredictions(data);
        }
      } catch (e) {
        setError("Impossible de charger les pronostics");
        console.error("Erreur:", e);
      } finally {
        setIsLoadingData(false);
      }
    }

    loadData();
  }, [isAuthorized, authFetch]);

  if (!isAuthorized || isLoadingData) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        Chargement...
      </div>
    );
  }

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <Link href="/admin" className={styles.backLink}>
          ← Retour au tableau de bord
        </Link>
        <h1 className={styles.title}>Gestionnaire pronostics</h1>
      </div>

      <section className={styles.content}>
        <div className={styles.toolbar}>
          <input
            type="search"
            placeholder="Rechercher un utilisateur ou un match..."
            className={styles.searchInput}
            aria-label="Rechercher un pronostic"
          />
          <select className={styles.filterSelect}>
            <option value="all">Tous les statuts</option>
            <option value="PENDING">En attente</option>
            <option value="WON">Gagnés</option>
            <option value="LOST">Perdus</option>
            <option value="CANCELLED">Annulés</option>
          </select>
        </div>

        {error ? (
          <div className={styles.errorMessage}>{error}</div>
        ) : predictions.length === 0 ? (
          <div className={styles.emptyMessage}>Aucun pronostic trouvé</div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Utilisateur</th>
                  <th>Match</th>
                  <th>Pronostic</th>
                  <th>Statut</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map((prediction) => (
                  <tr key={prediction.id}>
                    <td>
                      <div className={styles.userCell}>
                        <span className={styles.username}>
                          {prediction.user.username}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.matchCell}>
                        <span className={styles.teamName}>
                          {prediction.match.home_team.name}
                        </span>
                        <span className={styles.vs}>vs</span>
                        <span className={styles.teamName}>
                          {prediction.match.away_team.name}
                        </span>
                        <span className={styles.competition}>
                          {prediction.match.competition.name}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`${styles.predictionBadge} ${
                          styles[prediction.prediction_value.toLowerCase()]
                        }`}
                      >
                        {getPredictionLabel(prediction.prediction_value)}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${
                          styles[`status${prediction.status}`]
                        }`}
                      >
                        {getStatusLabel(prediction.status)}
                      </span>
                    </td>
                    <td>{formatDate(prediction.created_at)}</td>
                    <td>
                      <PredictionActions
                        predictionId={prediction.id}
                        userName={prediction.user.username}
                        matchName={`${prediction.match.home_team.name} vs ${prediction.match.away_team.name}`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}