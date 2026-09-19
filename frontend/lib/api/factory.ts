import type { ListResult, PaginationParams } from "@/types/api";

import { del, get, getList, patch, post } from "./helpers";

/**
 * Builds a typed CRUD resource client for a REST endpoint.
 *
 * `T`    – resource returned by the backend
 * `C`    – create payload
 * `U`    – update payload (partial)
 */
export function createResourceApi<T, C = Record<string, unknown>, U = Partial<C>>(
  basePath: string,
) {
  return {
    list: (params?: PaginationParams): Promise<ListResult<T>> =>
      getList<T>(basePath, params),

    get: (id: string): Promise<T> => get<T>(`${basePath}/${id}`),

    create: (data: C): Promise<T> =>
      post<T, C>(basePath, data).then((r) => r.data),

    update: (id: string, data: U): Promise<T> =>
      patch<T, U>(`${basePath}/${id}`, data).then((r) => r.data),

    remove: (id: string): Promise<null> =>
      del<null>(`${basePath}/${id}`).then((r) => r.data),
  };
}