import MatchCard from "@/components/matchCard/MatchCard";
import styles from "./page.module.css";
import { ICompetition, IMatch } from "@/types/match";
import InfiniteMatches from "@/components/InfiniteMatches/InfiniteMatches";
import Link from "next/link";
import MobileCompetitionMenu from "@/components/MobileCompetitionMenu/MobileCompetitionMenu";

export default async function Matchs({
  searchParams,
}: {
  searchParams: Promise<{ league?: string; filter?: string }>;
}) {
  // 1. On récupère la ligue depuis l'URL (si elle existe)
  const params = await searchParams;
  const selectedLeague = params.league || "";
  const isHotFilter = params.filter === "hot";

  const leaguesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/competitions`);
  const leagues = await leaguesResponse.json();

  const matchesResponse = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/matches?page=1&limit=10${selectedLeague ? `&league=${selectedLeague}` : ""}`,
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

  // --- LOGIQUE DE FILTRAGE HOT ---
  // Pour la colonne centrale : on filtre si le bouton HOT est activé
  const displayMatches = isHotFilter
    ? initialMatches.filter((m) => m.is_featured)
    : initialMatches;

  // Pour l'Aside : on veut TOUJOURS les "is_featured", peu importe le bouton HOT
  // On filtre les matchs qui sont soit marqués "featured" en DB, soit très populaires
  const featuredMatches = initialMatches
    .filter(
      (m) => m.is_featured === true || (m.popularity && m.popularity > 50),
    )
    // S'il n'y a pas assez de matchs "Hot", on complète avec les 3 premiers de la liste
    .concat(initialMatches.filter((m) => !m.is_featured))
    .slice(0, 6); // On en garde 5 maximum pour ne pas étouffer l'aside

  // 3. HELPER POUR LES LIENS (pour ne pas se répéter)
  const getUrl = (lCode: string = "", hot: boolean = isHotFilter) => {
    const p = new URLSearchParams();
    if (lCode) p.set("league", lCode);
    if (hot) p.set("filter", "hot");
    const qs = p.toString();
    return qs ? `/matchs?${qs}` : "/matchs";
  };

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
                className={!selectedLeague ? styles.activeLeague : ""}
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
          <h1 className={styles.sectionTitle}>
            {isHotFilter
              ? "Matchs à l'affiche 🔥"
              : selectedLeague
                ? `Prochains matchs de ${currentLeague?.name}`
                : "Matchs à venir"}
          </h1>
          <div className={styles.matchGrid}>
            {/* Quand initialMatches change (suite au clic Link), InfiniteMatches se reset tout seul */}
            <InfiniteMatches
              key={`${selectedLeague}-${isHotFilter}`}
              initialMatches={displayMatches}
              league={selectedLeague}
              isHot={isHotFilter}
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
