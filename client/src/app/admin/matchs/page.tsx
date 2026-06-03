"use client";

import { API_URL } from "@/config/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { IMatch, ICompetition } from "@/types/match";
import { useAuth } from "@/context/AuthContext";
import CreateMatchButton from "@/components/admin/CreateMatchButton";
import MatchTable from "@/components/admin/MatchTable";

export default function AdminMatchs() {
  const { isLoggedIn, role, authFetch } = useAuth();
  const router = useRouter();
  
  const [matches, setMatches] = useState<IMatch[]>([]);
  const [competitions, setCompetitions] = useState<ICompetition[]>([]);
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

  // Récupération des matchs (tous les matchs, pas seulement ceux à venir)
  useEffect(() => {
    if (!isAuthorized) return;

    async function loadData() {
      try {
        setIsLoadingData(true);
        setError(null);

        // Récupérer tous les matchs (avec une limite élevée pour l'admin)
        // Le paramètre all=true désactive les filtres par défaut pour afficher tous les matchs
        // (sauf les matchs terminés FINISHED/AWARDED)
        // Récupérer les compétitions pour les filtres
        const [matchesRes, competitionsRes] = await Promise.all([
          authFetch(`${API_URL}/api/matches?page=1&limit=1000&all=true`, {
            cache: "no-store",
          }),
          authFetch(`${API_URL}/api/competitions`, {
            cache: "no-store",
          }),
        ]);

        if (!matchesRes.ok) {
          setError("Erreur lors du chargement des matchs");
        } else {
          const data = await matchesRes.json();
          setMatches(Array.isArray(data) ? data : []);
        }

        if (competitionsRes.ok) {
          const compData = await competitionsRes.json();
          setCompetitions(compData);
        }
      } catch (e) {
        setError("Impossible de charger les matchs");
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
        <div className={styles.titleRow}>
          <h1 className={styles.title}>Gestionnaire matchs</h1>
          <CreateMatchButton competitions={competitions} />
        </div>
      </div>

      <section className={styles.content}>
        {error ? (
          <div className={styles.errorMessage}>{error}</div>
        ) : (
          <MatchTable matches={matches} competitions={competitions} />
        )}
      </section>
    </main>
  );
}