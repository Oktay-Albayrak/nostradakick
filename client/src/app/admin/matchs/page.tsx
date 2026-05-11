import { API_URL } from "@/config/api";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import styles from "./page.module.css";
import { IMatch, ICompetition } from "@/types/match";
import { IUser } from "@/types/user";
import CreateMatchButton from "@/components/admin/CreateMatchButton";
import MatchTable from "@/components/admin/MatchTable";

// Toujours revalider pour que la liste des matchs soit à jour après création/suppression
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminMatchs() {
  // Récupération du cookie accessToken
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  // Vérification de l'authentification et du rôle ADMIN
  let currentUser: IUser | null = null;
  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    
    if (accessToken) {
      headers["Cookie"] = `accessToken=${accessToken}`;
    }

    const userResponse = await fetch(`${API_URL}/api/auth/me`, {
      cache: "no-store",
      headers,
    });

    if (userResponse.ok) {
      currentUser = await userResponse.json();
    }
  } catch (e) {
    console.error("Erreur lors de la vérification de l'utilisateur:", e);
  }

  // Redirection si non authentifié ou non admin
  if (!currentUser) {
    redirect("/login");
  }

  if (currentUser.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Récupération des matchs (tous les matchs, pas seulement ceux à venir)
  let matches: IMatch[] = [];
  let competitions: ICompetition[] = [];
  let error: string | null = null;

  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    
    if (accessToken) {
      headers["Cookie"] = `accessToken=${accessToken}`;
    }

    // Récupérer tous les matchs (avec une limite élevée pour l'admin)
    // Le paramètre all=true désactive les filtres par défaut pour afficher tous les matchs
    // (sauf les matchs terminés FINISHED/AWARDED)
    const matchesResponse = await fetch(
      `${API_URL}/api/matches?page=1&limit=1000&all=true`,
      {
        cache: "no-store",
        headers,
      }
    );

    // Récupérer les compétitions pour les filtres
    const competitionsResponse = await fetch(
      `${API_URL}/api/competitions`,
      {
        cache: "no-store",
        headers,
      }
    );

    if (!matchesResponse.ok) {
      error = "Erreur lors du chargement des matchs";
    } else {
      const data = await matchesResponse.json();
      matches = Array.isArray(data) ? data : [];
    }

    if (competitionsResponse.ok) {
      competitions = await competitionsResponse.json();
    }
  } catch (e) {
    error = "Impossible de charger les matchs";
    console.error("Erreur:", e);
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
