"use client";

import { useCallback, useEffect, useState } from "react";

import type { PaginationMeta } from "@/types/api";

interface UsePaginationOptions {
  page?: number;
  limit?: number;
}

interface UsePaginationResult {
  page: number;
  limit: number;
  meta: PaginationMeta | null;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setMeta: (meta: PaginationMeta | null) => void;
  reset: () => void;
}

/** Client-side pagination state shared by list pages. */
export function usePagination(
  options: UsePaginationOptions = {},
): UsePaginationResult {
  const [page, setPage] = useState(options.page ?? 1);
  const [limit, setLimit] = useState(options.limit ?? 10);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);

  const applyMeta = useCallback((next: PaginationMeta | null) => {
    setMeta(next);
  }, []);

  const reset = useCallback(() => {
    setPage(1);
    setMeta(null);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [limit]);

  return { page, limit, meta, setPage, setLimit, setMeta: applyMeta, reset };
}