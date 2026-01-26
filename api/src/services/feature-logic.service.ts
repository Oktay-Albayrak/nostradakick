import { CL_ELITE_IDS, RIVALRIES } from "../config/metadata.ts";

export interface IFootballApiMatch {
  id: number;
  utcDate: string;
  status: string;
  tla: string;
  crest: string;
  competition: { id: number; code: string; name: string };
  homeTeam: { id: number; name: string; tla: string; crest: string };
  awayTeam: { id: number; name: string; tla: string; crest: string };
  score: {
    fullTime: { home: number | null; away: number | null };
  };
}

interface HotStatus {
  isHot: boolean;
  name: string | null;
}

export function getMatchHotStatus(
  match: IFootballApiMatch,
  top5Ids: Set<number>,
): HotStatus {
  const homeApiId = match.homeTeam.id;
  const awayApiId = match.awayTeam.id;

  // 1. Check DERBY
  const derby = RIVALRIES.find(
    (rivalry) =>
      rivalry.teams.includes(homeApiId) && rivalry.teams.includes(awayApiId),
  );

  if (derby) {
    return { isHot: true, name: derby.name };
  }

  // 2. Check PRESTIGE (Top 5 vs Top 5)
  if (top5Ids.has(homeApiId) && top5Ids.has(awayApiId)) {
    return { isHot: true, name: "Choc au sommet" };
  }

  // 3. Check CHAMPIONS LEAGUE (Optionnel : Tout match de phase finale ou gros choc)
  if (match.competition.code === "CL") {
    // On crée un groupe "Prestige" : Top 5 actuel OU liste Elite (Ajax, etc.)
    const isHomeElite =
      top5Ids.has(homeApiId) || CL_ELITE_IDS.includes(homeApiId);
    const isAwayElite =
      top5Ids.has(awayApiId) || CL_ELITE_IDS.includes(awayApiId);

    // Un match de CL est "Hot" uniquement si les DEUX sont dans le groupe Prestige
    if (isHomeElite && isAwayElite) {
      return { isHot: true, name: "Affiche CL" };
    }
  }

  return { isHot: false, name: null };
}
