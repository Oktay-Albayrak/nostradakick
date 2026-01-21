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

export type PredictionValue =
  |"HOME" // "1"
  |"DRAW" // "N"
  |"AWAY"; // "2"

export type PredictionStatus =
  |"PENDING"
  |"WON"
  |"LOST"
  |"CANCELLED";

export interface ICompetition {
  id: string;
  api_id: number;
  name: string;
  code: string;  // Timestamps
  created_at?: string;
  updated_at?: string;
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

  // Relations (objets complets)
  home_team: ITeam;
  away_team: ITeam;
  competition: ICompetition;
  predictions?: IPrediction[];
  
  // Timestamps
  created_at?: string;
  updated_at?: string;

  // Propriétés UI (optionnelles)
  isHot?: boolean;
  showPredictions?: boolean;
}

export interface IPrediction {
  id: string;
  prediction_value: PredictionValue;
  status: PredictionStatus;
  match_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}