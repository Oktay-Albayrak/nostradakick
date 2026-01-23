// Page de détail d'un match (/matchs/[api_id]) avec stats de prédictions
"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import MatchCard from "@/components/matchCard/MatchCard";
import PredictionStats from "@/components/matchDetail/predictionStats";
import styles from "./page.module.css";
import { IMatch } from "@/types/match";
import { useEffect, useState } from "react";

interface MatchDetailPageProps {
  params: {
    api_id: string;
  };
}

export default function MatchDetailPage({ params }: MatchDetailPageProps) {
  const [match, setMatch] = useState<IMatch | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [api_id, setApiId] = useState<string | null>(null);

  // Résout les params (Promise en Next.js 15+) et récupère l'api_id
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setApiId(resolvedParams.api_id);
    };
    resolveParams();
  }, [params]);

  // Récupère les détails du match une fois que l'api_id est disponible
  useEffect(() => {
    if (!api_id) return;

    const fetchMatch = async () => {
      try {
        setIsLoading(true);
        console.log("🔍 Fetching match with api_id:", api_id);

        const response = await fetch(
          `http://localhost:4000/api/matches/${api_id}`,
          {
            cache: 'no-store'
          }
        );

        console.log("📡 API Response status:", response.status);

        if (!response.ok) {
          throw new Error(`API returned status: ${response.status}`);
        }

        const matchData: IMatch = await response.json();
        console.log("✅ Match received:", JSON.stringify(matchData, null, 2));

        // Valide que home_team et away_team existent
        if (!matchData || !matchData.home_team || !matchData.away_team) {
          throw new Error("Match data incomplete");
        }

        console.log("✨ All data OK, rendering match");
        setMatch(matchData);
        setError(null);
      } catch (err) {
        console.error("💥 Error fetching match:", err);
        // Traite les erreurs pour afficher le bon message d'erreur
        setError(err instanceof Error ? err.message : "Erreur lors du chargement");
      } finally {
        // IMPORTANT : terminate loading dans tous les cas (succès ou erreur)
        setIsLoading(false);
      }
    };

    fetchMatch();
  }, [api_id]);

  /**
   * RENDU CONDITIONNEL
   * 
   * 1. Si isLoading : affiche "Chargement..."
   * 2. Si error ou !match : affiche page 404
   * 3. Sinon : affiche le match avec ses détails
   */
  if (isLoading) {
    return <div className={styles.container}>Chargement...</div>;
  }

  if (error || !match) {
    notFound();
  }

  // Calcul du booléen pour désactiver les boutons de prédiction
  // (les matchs terminés ne peuvent pas être prédits)
  const isMatchFinished = match.status === "FINISHED";
    return (
      <div className={styles.container}>
        {/* Lien retour */}
        <Link href="/matchs" style={{ marginBottom: "1.5rem", display: "inline-block", color: "#007bff", textDecoration: "none", fontWeight: "600" }}>
          ← Retour aux matchs
        </Link>

        {/* Carte du match avec ou sans possibilité de faire un prono */}
        <MatchCard match={match} showPredictions={!isMatchFinished} showStatus={true} showFullTeamNames={true} />

        {/* Statistiques des prédictions */}
        {match.predictions && match.predictions.length > 0 && (
          <PredictionStats match={match} />
        )}
      </div>
    );
  }