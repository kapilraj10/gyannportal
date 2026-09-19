/**
 * Token storage.
 *
 * Security notes:
 * - The access token lives in memory first and is mirrored to `sessionStorage`
 *   so it survives a page reload within the same tab. It is intentionally NOT
 *   written to `localStorage`.
 * - The refresh token is only ever stored in `sessionStorage`.
 *
 * The backend issues tokens via the response body (not httpOnly cookies), so
 * this is the strongest storage available without a backend contract change.
 */

const ACCESS_TOKEN_KEY = "gyann_access_token";
const REFRESH_TOKEN_KEY = "gyann_refresh_token";

let accessTokenMemory: string | null = null;

function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage;
}

export function getAccessToken(): string | null {
  if (accessTokenMemory) return accessTokenMemory;
  return storage()?.getItem(ACCESS_TOKEN_KEY) ?? null;
}

export function setAccessToken(token: string): void {
  accessTokenMemory = token;
  storage()?.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  accessTokenMemory = null;
  storage()?.removeItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return storage()?.getItem(REFRESH_TOKEN_KEY) ?? null;
}

export function setRefreshToken(token: string): void {
  storage()?.setItem(REFRESH_TOKEN_KEY, token);
}

export function clearRefreshToken(): void {
  storage()?.removeItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken?: string): void {
  setAccessToken(accessToken);
  if (refreshToken) setRefreshToken(refreshToken);
}

export function clearTokens(): void {
  clearAccessToken();
  clearRefreshToken();
}

/** Legacy helper kept for backwards compatibility. */
export function clearAccessTokenOnly(): void {
  clearAccessToken();
}
