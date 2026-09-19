/**
 * Shared API contract types.
 *
 * Mirrors the NestJS backend response envelope produced by
 * `TransformInterceptor` and `AllExceptionsFilter`.
 */

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: string | number | boolean | undefined;
}

/** Success envelope: `{ success: true, message, data, meta? }` */
export interface ApiResponse<T> {
  success: true;
  message: string;
  data: T;
  meta?: PaginationMeta;
  unread?: number;
}

/** Paginated payload shape returned by `paginate()` in the backend. */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
  unread?: number;
}

/** Error envelope: `{ success: false, message, statusCode, errors? }` */
export interface ApiErrorBody {
  success: false;
  message: string;
  statusCode: number;
  errors?: string[];
}

/** Normalized error surfaced to the UI. */
export class ApiError extends Error {
  readonly statusCode: number;
  readonly errors: string[];

  constructor(message: string, statusCode = 500, errors: string[] = []) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export interface ListResult<T> {
  data: T[];
  meta: PaginationMeta;
  unread?: number;
}
