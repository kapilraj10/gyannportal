import type { ListResult, PaginationParams } from "@/types/api";
import type { Result } from "@/types/domain";

import { del, get, getList, patch, post } from "./helpers";

export interface ResultInput {
  examId: string;
  studentId: string;
  subjectId?: string;
  marksObtained: number;
  maxMarks: number;
  grade?: string;
  remarks?: string;
}

export const resultsApi = {
  list: (params?: PaginationParams): Promise<ListResult<Result>> =>
    getList<Result>("/results", params),

  get: (id: string): Promise<Result> => get<Result>(`/results/${id}`),

  create: (input: ResultInput): Promise<Result> =>
    post<Result, ResultInput>("/results", input).then((r) => r.data),

  bulkCreate: (input: {
    examId: string;
    subjectId?: string;
    entries: Array<{
      studentId: string;
      marksObtained: number;
      maxMarks: number;
      grade?: string;
    }>;
  }): Promise<unknown> =>
    post<unknown, typeof input>("/results/bulk", input).then((r) => r.data),

  update: (id: string, input: Partial<ResultInput>): Promise<Result> =>
    patch<Result, Partial<ResultInput>>(`/results/${id}`, input).then(
      (r) => r.data,
    ),

  remove: (id: string): Promise<null> =>
    del<null>(`/results/${id}`).then(() => null),
};