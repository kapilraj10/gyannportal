import type { User } from "./domain";

export type { User } from "./domain";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  message: string;
  accessToken: string;
  refreshToken?: string;
  user: User;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken?: string;
}