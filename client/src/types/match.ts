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
  tla: string;
  crest_url: string;
  country: string;
}

export interface IMatch {
  id: string;
  api_id: number;
  date: string; // String ISO car passe par du JSON
  status: MatchStatus;
  home_score: number | null;
  away_score: number | null;

  // Relations
  home_team: ITeam;
  away_team: ITeam;
  competition: ICompetition;

  // Propriétés UI (optionnelles)
  isHot?: boolean;
  showPredictions?: boolean;
}
