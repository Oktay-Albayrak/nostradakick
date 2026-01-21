export type MatchStatus =
  | "SCHEDULED"
  | "TIMED"
  | "IN_PLAY"
  | "PAUSED"
  | "FINISHED"
  | "SUSPENDED"
  | "POSTPONED"
  | "CANCELLED"
  | "AWARDED";

export interface ICompetition {
  id: string;
  api_id: number;
  name: string;
  code: string;
  emblem_url: string;
  country: string;
}

export interface ITeam {
  id: string;
  api_id: number;
  name: string;
  short_name: string | null;
  tla: string;
  crest_url: string;
  country: string;
}

export interface IMatch {
  id: string;
  api_id: number;
  date: string;
  status: MatchStatus;
  home_score: number | null;
  away_score: number | null;

  // Relations
  home_team: ITeam;
  away_team: ITeam;
  competition: ICompetition;

  // Propriétés Logique Métier
  is_featured: boolean;
  featured_name: string | null;
  popularity: number;

  // Propriétés UI
  isHot?: boolean; // Basé sur popularity > X
}
