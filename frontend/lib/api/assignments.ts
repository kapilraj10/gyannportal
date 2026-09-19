import type { ListResult, PaginationParams } from "@/types/api";
import type { Assignment } from "@/types/domain";

import { del, get, getList, patch, post } from "./helpers";

export interface AssignmentInput {
  title: string;
  description?: string;
  courseId?: string;
  classId?: string;
  sectionId?: string;
  dueDate?: string;
  maxMarks?: number;
  status?: string;
}

export const assignmentsApi = {
  list: (params?: PaginationParams): Promise<ListResult<Assignment>> =>
    getList<Assignment>("/assignments", params),

  get: (id: string): Promise<Assignment> => get<Assignment>(`/assignments/${id}`),

  create: (input: AssignmentInput): Promise<Assignment> =>
    post<Assignment, AssignmentInput>("/assignments", input).then((r) => r.data),

  update: (id: string, input: Partial<AssignmentInput>): Promise<Assignment> =>
    patch<Assignment, Partial<AssignmentInput>>(`/assignments/${id}`, input).then(
      (r) => r.data,
    ),

  remove: (id: string): Promise<null> =>
    del<null>(`/assignments/${id}`).then(() => null),

  submit: (id: string, input: { text?: string; fileUrl?: string }): Promise<unknown> =>
    post<unknown, { text?: string; fileUrl?: string }>(
      `/assignments/${id}/submit`,
      input,
    ).then((r) => r.data),

  listSubmissions: (id: string): Promise<unknown> =>
    get<unknown>(`/assignments/${id}/submissions`),
};