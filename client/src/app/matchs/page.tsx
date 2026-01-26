import MatchCard from "@/components/matchCard/MatchCard";
import styles from "./page.module.css";
import { ICompetition, IMatch } from "@/types/match";
import InfiniteMatches from "@/components/InfiniteMatches/InfiniteMatches";
import Link from "next/link";
import MobileCompetitionMenu from "@/components/MobileCompetitionMenu/MobileCompetitionMenu";
import SearchBar from "@/components/search/searchBar";

export default async function Matchs({
  searchParams,
}: {
  searchParams: Promise<{ league?: string; filter?: string; team?: string }>;
}) {
  // 1. On récupère la ligue depuis l'URL (si elle existe)
  const params = await searchParams;
  const selectedLeague = params.league || "";
  const selectedTeam = params.team || "";
  const isHotFilter = params.filter === "hot";

  // --- 1. APPELS API EN PARALLÈLE ---

  // A. Fetch des compétitions (pour la sidebar gauche)
  const leaguesResponse = await fetch("http://localhost:4000/api/competitions");
  const leagues = await leaguesResponse.json();

  // B. Fetch des matchs DYNAMIQUES (pour la colonne centrale)
  let apiURL = `http://localhost:4000/api/matches?page=1&limit=10`;
  if (selectedLeague) apiURL += `&league=${selectedLeague}`;
  if (selectedTeam) apiURL += `&team=${selectedTeam}`;
  if (isHotFilter) apiURL += `&filter=hot`;

  const matchesResponse = await fetch(apiURL, { cache: "no-store" });
  if (!matchesResponse.ok) {
    return <div>Erreur lors du chargement des matchs</div>;
  }
  const initialMatches: IMatch[] = await matchesResponse.json();

  // C. Fetch des matchs VEDETTES (pour l'aside droite - FIXE)
  const featuredResponse = await fetch(
    `http://localhost:4000/api/matches?filter=hot&limit=6`,
    { next: { revalidate: 300 } },
  ); // Cache de 5 min car ce sont les mêmes pour tout le monde);
  const featuredMatches: IMatch[] = featuredResponse.ok
    ? await featuredResponse.json()
    : [];

  // --- 2. PRÉPARATION DE L'AFFICHAGE ---

  // On cherche l'objet compétition qui a le même code que celui de l'URL
  const currentLeague = leagues.find(
    (league: ICompetition) => league.code === selectedLeague,
  );

  // HELPER POUR LES LIENS (pour ne pas se répéter)
  const getUrl = (lCode: string = "", hot: boolean = isHotFilter) => {
    const p = new URLSearchParams();
    if (lCode) p.set("league", lCode);
    if (hot) p.set("filter", "hot");
    const qs = p.toString();
    return qs ? `/matchs?${qs}` : "/matchs";
  };

  // Changer le titre (h1) selon ce qui est affiché
  const getSectionTitle = () => {
    if (isHotFilter) return "Matchs à l'affiche 🔥";
    if (selectedTeam)
      return `Prochains matchs : ${selectedTeam.replace(/-/g, " ").toUpperCase()}`;
    if (selectedLeague) return `Prochains matchs de ${currentLeague?.name}`;
    return "Matchs à venir";
  };

  return (
    <div className={styles.container}>
      {/* 1. BARRE DE RECHERCHE (Visible uniquement sur Desktop) */}
      <SearchBar />

      {/* 2. FILTRES MOBILES (Cachés sur Desktop) */}
      <div className={styles.mobileFilters}>
        <Link
          href={getUrl(selectedLeague, !isHotFilter)}
          className={`${styles.hotButton} ${isHotFilter ? styles.activeHot : ""}`}
        >
          🔥 HOT
        </Link>
        <MobileCompetitionMenu
          leagues={leagues}
          currentFilter={isHotFilter ? "hot" : null}
        />
      </div>
      <section className={styles.mainGrid}>
        {/* 3. COLONNE GAUCHE : LISTE DES COMPETITIONS */}
        <aside className={styles.competitionList}>
          <h2 className={styles.sidebarTitle}>Top Compétitions</h2>
          <ul>
            <li className={styles.sidebarItem}>
              <Link
                href={getUrl("", isHotFilter)}
                className={
                  !selectedLeague && !selectedTeam ? styles.activeLeague : ""
                }
              >
                Toutes les compétitions
              </Link>
            </li>
            {leagues.map((league: ICompetition) => (
              <li key={league.id} className={styles.sidebarItem}>
                {/* On utilise Link pour changer l'URL et déclencher le refresh serveur */}
                <Link
                  href={getUrl(league.code, isHotFilter)}
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
          <h1 className={styles.sectionTitle}>{getSectionTitle()}</h1>
          <div className={styles.matchGrid}>
            {/* Quand initialMatches change (suite au clic Link), InfiniteMatches se reset tout seul */}
            <InfiniteMatches
              key={`${selectedLeague}-${isHotFilter}-${selectedTeam}`}
              initialMatches={initialMatches}
              league={selectedLeague}
              isHot={isHotFilter}
              team={selectedTeam}
            />
          </div>
        </main>

        {/* 5. COLONNE DROITE : À L'AFFICHE */}
        <aside className={styles.featuredSection}>
          <h2 className={styles.sidebarTitle}>A l&apos;Affiche</h2>
          <div className={styles.featuredGrid}>
            {featuredMatches.map((m) => (
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
