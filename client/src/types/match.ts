import { IUser } from "./user";

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
  | "HOME" // "1"
  | "DRAW" // "N"
  | "AWAY"; // "2"

export type PredictionStatus = "PENDING" | "WON" | "LOST" | "CANCELLED";

export interface ICompetition {
  id: string;
  api_id: number;
  name: string;
  code: string; // Timestamps
  created_at?: string;
  updated_at?: string;
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
  venue?: string | null; // Stade non fourni par le Free Tier de l'API, on le laisse pour plus tard

  // Relations (objets complets)
  home_team: ITeam;
  away_team: ITeam;
  competition: ICompetition;
  predictions?: IPrediction[];

  // Timestamps
  created_at?: string;
  updated_at?: string;

  // Propriétés Logique Métier
  is_featured: boolean;
  featured_name: string | null;
  popularity: number;

  // Propriétés UI
  isHot?: boolean; // Basé sur popularity > X
}

export interface IPrediction {
  id: string;
  prediction_value: PredictionValue;
  status: PredictionStatus;
  match_id: string;
  match: IMatch;
  user_id: string;
  user: IUser;
  created_at: string;
  updated_at: string;
}
