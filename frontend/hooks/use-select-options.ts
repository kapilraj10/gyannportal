"use client";

import { useEffect, useState } from "react";

import { academicYearsApi, classesApi, sectionsApi, subjectsApi } from "@/lib/api";

export interface SelectOptions {
  classes: Array<{ label: string; value: string }>;
  sections: Array<{ label: string; value: string }>;
  subjects: Array<{ label: string; value: string }>;
  academicYears: Array<{ label: string; value: string }>;
}

export function useSelectOptions(): SelectOptions {
  const [classes, setClasses] = useState<SelectOptions["classes"]>([]);
  const [sections, setSections] = useState<SelectOptions["sections"]>([]);
  const [subjects, setSubjects] = useState<SelectOptions["subjects"]>([]);
  const [academicYears, setAcademicYears] = useState<SelectOptions["academicYears"]>([]);

  useEffect(() => {
    void classesApi
      .list({ page: 1, limit: 500 })
      .then((result) =>
        setClasses(result.data.map((row) => ({ label: row.name, value: row.id }))),
      )
      .catch(() => undefined);

    void sectionsApi
      .list({ page: 1, limit: 500 })
      .then((result) =>
        setSections(
          result.data.map((row) => ({
            label: `${row.name}${row.class ? ` (${row.class.name})` : ""}`,
            value: row.id,
          })),
        ),
      )
      .catch(() => undefined);

    void subjectsApi
      .list({ page: 1, limit: 500 })
      .then((result) =>
        setSubjects(result.data.map((row) => ({ label: row.name, value: row.id }))),
      )
      .catch(() => undefined);

    void academicYearsApi
      .list({ page: 1, limit: 500 })
      .then((result) =>
        setAcademicYears(
          result.data.map((row) => ({ label: row.name, value: row.id })),
        ),
      )
      .catch(() => undefined);
  }, []);

  return { classes, sections, subjects, academicYears };
}