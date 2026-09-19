import type { AxiosRequestConfig } from "axios";

import type {
  ApiResponse,
  ListResult,
  PaginatedResponse,
  PaginationParams,
} from "@/types/api";

import { api, toApiError } from "./client";

/**
 * Typed request helpers built on top of the configured Axios client.
 *
 * They unwrap the backend `{ success, message, data, meta }` envelope and
 * normalize errors, so feature code never touches Axios directly.
 */

export interface RequestOptions extends AxiosRequestConfig {
  /** Optional success message override returned by the backend. */
  fallbackMessage?: string;
}

export async function request<T>(
  config: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  try {
    const response = await api.request<ApiResponse<T>>(config);
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function get<T>(
  url: string,
  params?: Record<string, unknown>,
  options?: RequestOptions,
): Promise<T> {
  const response = await request<T>({ ...options, url, method: "GET", params });
  return response.data;
}

export async function getList<T>(
  url: string,
  params?: PaginationParams,
  options?: RequestOptions,
): Promise<ListResult<T>> {
  const response = await request<T[] | PaginatedResponse<T>>({
    ...options,
    url,
    method: "GET",
    params,
  });

  const payload = response.data;
  const raw = (payload as PaginatedResponse<T>)?.data;
  const data = Array.isArray(payload) ? payload : (raw ?? []);
  const meta = response.meta ??
    (payload as PaginatedResponse<T>)?.meta ?? {
      page: params?.page ?? 1,
      limit: params?.limit ?? data.length,
      total: data.length,
      totalPages: 1,
    };

  return { data, meta, unread: response.unread };
}

export async function post<T, B = unknown>(
  url: string,
  body?: B,
  options?: RequestOptions,
): Promise<ApiResponse<T>> {
  return request<T>({ ...options, url, method: "POST", data: body });
}

export async function patch<T, B = unknown>(
  url: string,
  body?: B,
  options?: RequestOptions,
): Promise<ApiResponse<T>> {
  return request<T>({ ...options, url, method: "PATCH", data: body });
}

export async function put<T, B = unknown>(
  url: string,
  body?: B,
  options?: RequestOptions,
): Promise<ApiResponse<T>> {
  return request<T>({ ...options, url, method: "PUT", data: body });
}

export async function del<T = null>(
  url: string,
  options?: RequestOptions,
): Promise<ApiResponse<T>> {
  return request<T>({ ...options, url, method: "DELETE" });
}
