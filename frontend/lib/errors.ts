import { ApiError } from "@/types/api";

/** Best-effort message extraction from any thrown value. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.errors?.length ? error.errors.join(", ") : error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}