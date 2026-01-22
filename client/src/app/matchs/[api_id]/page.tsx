"use client";

import NotFound from "../../404/page";
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

  // Récupérer les params de la route (Promise en Next.js 15+)
  useEffect(() => {
    (async () => {
      const resolvedParams = await params;
      setApiId(resolvedParams.api_id);
    })();
  }, [params]);

  // Récupérer le match depuis l'API
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

        // Vérification de l'existence des données essentielles
        if (!matchData || !matchData.home_team || !matchData.away_team) {
          throw new Error("Match data incomplete");
        }

        console.log("✨ All data OK, rendering match");
        setMatch(matchData);
        setError(null);
      } catch (err) {
        console.error("💥 Error fetching match:", err);
        setError(err instanceof Error ? err.message : "Erreur lors du chargement");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatch();
  }, [api_id]);

  if (isLoading) {
    return <div className={styles.container}>Chargement...</div>;
  }

  if (error || !match) {
    return <NotFound />;
  }

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