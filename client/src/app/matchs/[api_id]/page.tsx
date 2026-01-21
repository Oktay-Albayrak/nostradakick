import NotFound from "../../404/page";
import Link from "next/link";
import MatchCard from "@/components/matchCard/MatchCard";
import PredictionStats from "@/components/matchDetail/predictionStats";
import styles from "./page.module.css";
import { IMatch } from "@/types/match";

interface MatchDetailPageProps {
  params: {
    api_id: string;
  };
}

export default async function MatchDetailPage({ params }: MatchDetailPageProps) {
  // Récupérer le match depuis l'API
  try {
    // IMPORTANT: Dans Next.js 15+, params est une Promise
    const { api_id } = await params;
    
    console.log("🔍 Fetching match with api_id:", api_id);
    
    const response = await fetch(
      `http://localhost:4000/api/matches/${api_id}`,
      {
        cache: 'no-store' // Toujours récupérer les données fraîches
      }
    );

    console.log("📡 API Response status:", response.status);

    if (!response.ok) {
      console.error(`❌ API returned status: ${response.status}`);
      return <NotFound />;
    }

    const match: IMatch = await response.json();
    console.log("✅ Match received:", JSON.stringify(match, null, 2));
    console.log("🏠 Home team:", match?.home_team);
    console.log("✈️ Away team:", match?.away_team);

    // Vérification de l'existence des données essentielles
    if (!match || !match.home_team || !match.away_team) {
      console.error("❌ Match data incomplete:", { 
        match: !!match,
        home_team: !!match?.home_team, 
        away_team: !!match?.away_team,
        home_team_name: match?.home_team?.name,
        away_team_name: match?.away_team?.name
      });
      return <NotFound />;
    }

    console.log("✨ All data OK, rendering match");
    
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
  } catch (error) {
    console.error("💥 Error fetching match:", error);
    return <NotFound />;
  }
}