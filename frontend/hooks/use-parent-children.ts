"use client";

import { useEffect, useState } from "react";

import { parentsApi } from "@/lib/api";

import type { ParentChild } from "@/types/domain";

export function useParentChildren() {
  const [children, setChildren] = useState<ParentChild[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void parentsApi
      .getMyChildren()
      .then(setChildren)
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  return { children, loading };
}