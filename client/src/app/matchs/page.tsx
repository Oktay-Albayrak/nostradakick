import MatchCard from "@/components/matchCard/MatchCard";
import styles from "./page.module.css";
import { ICompetition, IMatch } from "@/types/match";
import InfiniteMatches from "@/components/InfiniteMatches/InfiniteMatches";
import Link from "next/link";
import MobileCompetitionMenu from "@/components/MobileCompetitionMenu/MobileCompetitionMenu";

export default async function Matchs({
  searchParams,
}: {
  searchParams: Promise<{ league?: string }>;
}) {
  // 1. On récupère la ligue depuis l'URL (si elle existe)
  const params = await searchParams;
  const selectedLeague = params.league || "";
  console.log("Ligue sélectionnée :", selectedLeague);
  const leaguesResponse = await fetch("http://localhost:4000/api/competitions");
  const leagues = await leaguesResponse.json();

  const matchesResponse = await fetch(
    `http://localhost:4000/api/matches?page=1&limit=10${selectedLeague ? `&league=${selectedLeague}` : ""}`,
    { cache: "no-store" },
  );
  if (!matchesResponse.ok) {
    return <div>Erreur lors du chargement des matchs</div>;
  }

  // On cherche l'objet compétition qui a le même code que celui de l'URL
  const currentLeague = leagues.find(
    (league: ICompetition) => league.code === selectedLeague,
  );

  const initialMatches: IMatch[] = await matchesResponse.json();
  const featuredMatchs = initialMatches.slice(0, 6);

  return (
    <div className={styles.container}>
      {/* 1. BARRE DE RECHERCHE (Visible uniquement sur Desktop) */}
      <section className={styles.searchSection}>
        <input
          type="search"
          placeholder="Rechercher un match ou une compétition ..."
          className={styles.searchInput}
          aria-label="Rechercher un match ou une compétition"
        />
      </section>

      {/* 2. FILTRES MOBILES (Cachés sur Desktop) */}
      <div className={styles.mobileFilters}>
        <button className={styles.hotButton}>🔥 HOT</button>
        <MobileCompetitionMenu leagues={leagues} />
      </div>
      <section className={styles.mainGrid}>
        {/* 3. COLONNE GAUCHE : LISTE DES COMPETITIONS */}
        <aside className={styles.competitionList}>
          <h2 className={styles.sidebarTitle}>Top Compétitions</h2>
          <ul>
            <li className={styles.sidebarItem}>
              <Link
                href="/matchs"
                className={!selectedLeague ? styles.activeLeague : ""}
              >
                Toutes les compétitions
              </Link>
            </li>
            {leagues.map((league: ICompetition) => (
              <li key={league.id} className={styles.sidebarItem}>
                {/* On utilise Link pour changer l'URL et déclencher le refresh serveur */}
                <Link
                  href={`/matchs?league=${league.code}`}
                  className={
                    selectedLeague === league.code ? styles.activeLeague : ""
                  }
                >
                  {league.name}
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        {/* 4. COLONNE CENTRALE : MATCHS À VENIR */}
        <main className={styles.matchsContent}>
          <h1 className={styles.sectionTitle}>
            {selectedLeague
              ? `Prochains matchs de ${currentLeague.name}`
              : "Matchs à venir"}
          </h1>
          <div className={styles.matchGrid}>
            {/* Quand initialMatches change (suite au clic Link), InfiniteMatches se reset tout seul */}
            <InfiniteMatches
              key={selectedLeague}
              initialMatches={initialMatches}
            />
          </div>
        </main>

        {/* 5. COLONNE DROITE : À L'AFFICHE */}
        <aside className={styles.featuredSection}>
          <h2 className={styles.sidebarTitle}>A l&apos;Affiche</h2>
          <div className={styles.featuredGrid}>
            {featuredMatchs.map((m) => (
              <MatchCard
                key={`featured-${m.id}`}
                match={m}
                showPredictions={false}
                isHot={true}
              />
            ))}
          </div>
        </aside>
      </section>
    </div>
  );
}
