import { IMatch, MatchStatus } from "@/types/match";

export interface IUser {
  id: string;
  username: string;
  stats?: IUserStat | null;
  predictions: IPrediction[];
}

export interface IUserStat {
  wins_count: number;
  losses_count: number;
  best_streak: number;
}

export interface IPrediction {
  id: string;
  prediction_value: "HOME" | "DRAW" | "AWAY";
  status: MatchStatus;
  match: IMatch
}
