import { IMatch } from "./match";
import { IUser } from "./user";

export type PredictionValue = "HOME" | "DRAW" | "AWAY";

export type PredictionStatus = "PENDING" | "WON" | "LOST" | "CANCELLED";

export interface IPrediction {
  id: string;
  prediction_value: PredictionValue;
  status: PredictionStatus;
  user_id: string;
  match_id: string;
  created_at: string;
  updated_at: string;

  // Relations
  match: IMatch;
  user: Pick<IUser, "id" | "username" | "avatar_url">;
}
