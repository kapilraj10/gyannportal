import type { ListResult, PaginationParams } from "@/types/api";
import type { Exam } from "@/types/domain";

import { del, get, getList, patch, post } from "./helpers";

export interface ExamInput {
  name: string;
  examType?: string;
  classId?: string;
  academicYearId?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

export const examsApi = {
  list: (params?: PaginationParams): Promise<ListResult<Exam>> =>
    getList<Exam>("/exams", params),

  get: (id: string): Promise<Exam> => get<Exam>(`/exams/${id}`),

  create: (input: ExamInput): Promise<Exam> =>
    post<Exam, ExamInput>("/exams", input).then((r) => r.data),

  update: (id: string, input: Partial<ExamInput>): Promise<Exam> =>
    patch<Exam, Partial<ExamInput>>(`/exams/${id}`, input).then((r) => r.data),

  remove: (id: string): Promise<null> =>
    del<null>(`/exams/${id}`).then(() => null),
};