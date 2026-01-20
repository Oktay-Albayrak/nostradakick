export type UserRole = "MEMBER" | "ADMIN";

export interface IUser {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}
