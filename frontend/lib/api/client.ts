import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";

import { ApiError, type ApiErrorBody } from "@/types/api";

import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from "../token";

/**
 * Centralized Axios client.
 *
 * Responsibilities:
 * - Attach the access token to every request.
 * - On `401`, transparently refresh the session using the refresh token and
 *   replay the original request exactly once.
 * - Collapse concurrent `401`s into a single refresh ("single-flight") and
 *   queue the waiting requests so we never stampede `/auth/refresh`.
 * - Normalize everything into {@link ApiError} for consistent UI handling.
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8020/api/v1";

const AUTH_ENDPOINTS = ["/auth/login", "/auth/register-school", "/auth/refresh"];

const isAuthEndpoint = (url?: string): boolean =>
  !!url && AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint));

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let refreshPromise: Promise<string> | null = null;

function notifySessionExpired(): void {
  clearTokens();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("auth:session-expired"));
  }
}

/**
 * Attempts to refresh the access token using the stored refresh token.
 * Uses a single-flight pattern to prevent concurrent refresh requests.
 */
async function requestNewAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    notifySessionExpired();
    throw new ApiError("No active session", 401);
  }

  try {
    const response = await axios.post(
      `${API_BASE_URL}/auth/refresh`,
      { refreshToken },
      { headers: { "Content-Type": "application/json" } },
    );

    const payload = response.data?.data ?? {};
    const accessToken: string | undefined =
      payload.accessToken ?? response.data?.accessToken;
    const nextRefreshToken: string | undefined =
      payload.refreshToken ?? response.data?.refreshToken;

    if (!accessToken) {
      throw new ApiError("Refresh response missing access token", 401);
    }

    setTokens(accessToken, nextRefreshToken);
    return accessToken;
  } catch {
    notifySessionExpired();
    throw new ApiError("Session expired", 401);
  }
}

/** Ensures only one refresh request is in flight at a time. */
function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = requestNewAccessToken().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status;
    const url = original?.url;

    const shouldRefresh =
      status === 401 &&
      !!original &&
      !original._retry &&
      !isAuthEndpoint(url) &&
      !!getRefreshToken();

    if (shouldRefresh) {
      original._retry = true;

      try {
        const accessToken = await refreshAccessToken();
        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch {
        return Promise.reject(toApiError(error));
      }
    }

    if (status === 401 && !isAuthEndpoint(url)) {
      notifySessionExpired();
    }

    return Promise.reject(toApiError(error));
  },
);

/** Convert any thrown value into a normalized {@link ApiError}. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const body = error.response?.data;

    if (body && typeof body.message === "string") {
      return new ApiError(
        body.message,
        body.statusCode ?? error.response?.status ?? 500,
        body.errors ?? [],
      );
    }

    if (error.code === "ERR_NETWORK") {
      return new ApiError(
        "Unable to reach the server. Please check your connection.",
        0,
      );
    }

    return new ApiError(
      error.message || "Something went wrong",
      error.response?.status ?? 500,
    );
  }

  if (error instanceof Error) {
    return new ApiError(error.message);
  }

  return new ApiError("An unexpected error occurred");
}

export type { AxiosRequestConfig };