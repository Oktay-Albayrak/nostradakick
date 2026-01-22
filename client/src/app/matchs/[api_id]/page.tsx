/**
 * PAGE DE DÉTAIL D'UN MATCH
 * 
 * Route : /matchs/[api_id]
 * 
 * Affiche :
 * - La carte du match avec tous les détails
 * - Les statistiques de prédictions
 * - Bouton retour vers la liste des matchs
 * 
 * Composant CLIENT pour accéder au contexte d'authentification
 * et effectuer les appels API côté client.
 */

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
  // État pour stocker les données du match
  const [match, setMatch] = useState<IMatch | null>(null);
  
  // État de chargement pendant la récupération des données
  const [isLoading, setIsLoading] = useState(true);
  
  // État pour stocker les messages d'erreur
  const [error, setError] = useState<string | null>(null);
  
  // État pour stocker l'api_id résolu (params est une Promise en Next.js 15+)
  const [api_id, setApiId] = useState<string | null>(null);

  /**
   * USEEFFECT 1 - RÉSOUDRE LES PARAMS
   * 
   * Nécessaire car en Next.js 15+, les params sont maintenant des Promises.
   * 
   * Objectif :
   * - Attendre que params se résolve
   * - Extraire api_id et le stocker dans le state
   * 
   * Dependencies : [params]
   * - Se réexécute si les params changent (changement de route)
   */
  useEffect(() => {
    (async () => {
      const resolvedParams = await params;
      setApiId(resolvedParams.api_id);
    })();
  }, [params]);

  /**
   * USEEFFECT 2 - RÉCUPÉRER LE MATCH
   * 
   * S'exécute une fois que api_id est disponible.
   * 
   * Objectif :
   * - Appel GET /api/matches/{api_id}
   * - Récupère tous les détails du match
   * - Valide que les données essentielles existent
   * - Gère les erreurs (404, données manquantes, etc.)
   * 
   * Validation :
   * - match doit avoir home_team et away_team
   * - Sinon : affiche la page 404
   * 
   * Dependencies : [api_id]
   * - Se réexécute si api_id change
   */
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

        // Validation des données essentielles
        // Vérification que home_team et away_team existent
        // Sinon affiche 404 (données corrompues ou API défaillante)
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