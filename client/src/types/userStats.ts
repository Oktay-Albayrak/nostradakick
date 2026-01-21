import { IMatch } from "@/types/match";

export interface IUserStats {
  id: string;
  username: string;
  stats?: IUserP | null;
  predictions: IPrediction[];
}

export interface IUserP {
  wins_count: number;
  losses_count: number;
  best_streak: number;
}

export interface IPrediction {
  id: string;
  prediction_value: "HOME" | "DRAW" | "AWAY";
  status: "PENDING" | "WON" | "LOST" | "CANCELLED";
  match: IMatch
}
