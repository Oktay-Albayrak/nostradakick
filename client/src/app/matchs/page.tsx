import { API_URL } from "@/config/api";
import MatchCard from "@/components/matchCard/MatchCard";
import styles from "./page.module.css";
import { ICompetition, IMatch } from "@/types/match";
import InfiniteMatches from "@/components/InfiniteMatches/InfiniteMatches";
import Link from "next/link";
import MobileCompetitionMenu from "@/components/MobileCompetitionMenu/MobileCompetitionMenu";
import SearchBar from "@/components/search/searchBar";
import ArchiveControls from "@/components/ArchiveControls/ArchiveControls";

export default async function Matchs({
  searchParams,
}: {
  searchParams: Promise<{
    league?: string;
    filter?: string;
    team?: string;
    date?: string;
    status?: string;
  }>;
}) {
  // 1. Extraction des paramètres de recherche depuis l'URL
  const params = await searchParams;
  const selectedLeague = params.league || "";
  const selectedTeam = params.team || "";
  const selectedDate = params.date || "";
  const status = params.status || "";
  const isHotFilter = params.filter === "hot";
  const isArchiveMode = !!selectedDate;

  // --- 1. APPELS API EN PARALLÈLE ---

  // Construction de l'URL pour les matchs avec tous les filtres actifs
  const query = new URLSearchParams({
    page: "1",
    limit: "10",
    ...(selectedLeague && { league: selectedLeague }),
    ...(selectedTeam && { team: selectedTeam }),
    ...(isHotFilter && { filter: "hot" }),
    ...(selectedDate && { date: selectedDate }),
    ...(status && { status: status }),
    ...(!status && !selectedDate && { status: "upcoming" }),
  });

  const [leaguesRes, matchesRes, featuredRes] = await Promise.all([
    fetch(`${API_URL}/api/competitions`),
    fetch(`${API_URL}/api/matches?${query.toString()}`, {
      cache: "no-store",
    }),
    fetch(`${API_URL}/api/matches?filter=hot&limit=6`, {
      next: { revalidate: 300 },
    }),
  ]);

  if (!matchesRes.ok) return <div>Erreur lors du chargement des matchs</div>;

  const leagues: ICompetition[] = await leaguesRes.json();
  const initialMatches: IMatch[] = await matchesRes.json();
  const featuredMatches: IMatch[] = featuredRes.ok
    ? await featuredRes.json()
    : [];

  // --- 2. LOGIQUE D'AFFICHAGE ---

  const currentLeague = leagues.find((l) => l.code === selectedLeague);

  /** * Construit l'URL pour les liens de navigation interne (Ligue, Hot, Date)
   */
  const getUrl = (lCode = "", hot = isHotFilter, date = selectedDate) => {
    const p = new URLSearchParams();
    if (lCode) p.set("league", lCode);
    if (hot) p.set("filter", "hot");
    if (date) p.set("date", date);
    const qs = p.toString();
    return qs ? `/matchs?${qs}` : "/matchs";
  };

  const getSectionTitle = () => {
    // 1. Priorité aux résultats passés (status === "past")
    if (status === "past") {
      if (selectedTeam)
        return `Résultats passés : ${selectedTeam.replace(/-/g, " ").toUpperCase()}`;
      if (selectedLeague)
        return `Résultats passés : ${currentLeague?.name || "la compétition"}`;
      return "Archives : Tous les résultats"; // Cas "Toutes les compétitions" + mode archive
    }

    // 2. Priorité à une date précise (Calendrier / Pastilles)
    if (isArchiveMode) {
      return `Résultats du ${new Date(selectedDate).toLocaleDateString("fr-FR")}`;
    }

    // 3. Filtre "Hot"
    if (isHotFilter) return "Matchs à l'affiche 🔥";

    // 4. Mode "Futur" (par défaut)
    if (selectedTeam) {
      return `Prochains matchs : ${selectedTeam.replace(/-/g, " ").toUpperCase()}`;
    }
    if (selectedLeague) {
      return `Prochains matchs de ${currentLeague?.name}`;
    }

    return "Matchs à venir";
  };

  return (
    <div className={styles.container}>
      <SearchBar />

      {/* FILTRES MOBILES */}
      <div className={styles.mobileFilters}>
        <Link
          href={getUrl(selectedLeague, !isHotFilter, "")}
          className={`${styles.hotButton} ${isHotFilter ? styles.activeHot : ""}`}
        >
          🔥 HOT
        </Link>
        <MobileCompetitionMenu
          leagues={leagues}
          currentFilter={isHotFilter ? "hot" : null}
        />
        <ArchiveControls selectedDate={selectedDate} showOnlyChips={false} />
      </div>

      <section className={styles.mainGrid}>
        {/* SIDEBAR GAUCHE : LIGUES */}
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
            {leagues.map((league) => (
              <li key={league.id} className={styles.sidebarItem}>
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
          {/* Bloc Archive intégré en bas de sidebar desktop */}
          <ArchiveControls selectedDate={selectedDate} showOnlyChips={false} />
        </aside>

        {/* COLONNE CENTRALE : MATCHS */}
        <main className={styles.matchsContent}>
          {/* Pastilles de date (uniquement si connecté et mode archive actif) */}
          <ArchiveControls selectedDate={selectedDate} showOnlyChips={true} />

          <h1 className={styles.sectionTitle}>{getSectionTitle()}</h1>

          <div className={styles.matchGrid}>
            <InfiniteMatches
              key={`${selectedLeague}-${isHotFilter}-${selectedTeam}-${selectedDate}-${status}`}
              initialMatches={initialMatches}
              league={selectedLeague}
              isHot={isHotFilter}
              team={selectedTeam}
              date={selectedDate}
              status={status}
            />
          </div>
        </main>

        {/* ASIDE DROITE : MATCHS HOT */}
        <aside className={styles.featuredSection}>
          <h2 className={styles.sidebarTitle}>A l&apos;Affiche</h2>
          <div className={styles.featuredGrid}>
            {featuredMatches.map((m) => (
              <MatchCard
                key={`featured-${m.id}`}
                match={m}
                isCompact={true}
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
