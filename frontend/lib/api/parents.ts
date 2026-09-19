import type { ListResult, PaginationParams } from "@/types/api";
import type {
  Assignment,
  Attendance,
  Exam,
  Parent,
  ParentChild,
  Result,
} from "@/types/domain";

import { del, get, getList, patch, post } from "./helpers";

export interface ParentInput {
  name?: string;
  email?: string;
  phone?: string;
  occupation?: string;
  address?: string;
  childIds?: string[];
  status?: string;
}

export const parentsApi = {
  list: (params?: PaginationParams): Promise<ListResult<Parent>> =>
    getList<Parent>("/parents", params),

  get: (id: string): Promise<Parent> => get<Parent>(`/parents/${id}`),

  create: (input: ParentInput): Promise<Parent> =>
    post<Parent, ParentInput>("/parents", input).then((r) => r.data),

  update: (id: string, input: Partial<ParentInput>): Promise<Parent> =>
    patch<Parent, Partial<ParentInput>>(`/parents/${id}`, input).then(
      (r) => r.data,
    ),

  remove: (id: string): Promise<null> =>
    del<null>(`/parents/${id}`).then(() => null),

  // Parent portal
  getMyChildren: (): Promise<ParentChild[]> =>
    get<ParentChild[]>("/parents/me/children"),

  getChildProfile: (studentId: string): Promise<unknown> =>
    get<unknown>(`/parents/me/children/${studentId}`),

  getChildAttendance: (
    studentId: string,
    params?: PaginationParams,
  ): Promise<ListResult<Attendance>> =>
    getList<Attendance>(`/parents/me/children/${studentId}/attendance`, params),

  getChildAssignments: (
    studentId: string,
    params?: PaginationParams,
  ): Promise<ListResult<Assignment>> =>
    getList<Assignment>(
      `/parents/me/children/${studentId}/assignments`,
      params,
    ),

  getChildExams: (
    studentId: string,
    params?: PaginationParams,
  ): Promise<ListResult<Exam>> =>
    getList<Exam>(`/parents/me/children/${studentId}/exams`, params),

  getChildResults: (
    studentId: string,
    params?: PaginationParams,
  ): Promise<ListResult<Result>> =>
    getList<Result>(`/parents/me/children/${studentId}/results`, params),

  getChildNotifications: (
    studentId: string,
    params?: PaginationParams,
  ): Promise<ListResult<unknown>> =>
    getList<unknown>(`/parents/me/children/${studentId}/notifications`, params),

  getDashboard: (): Promise<unknown> => get<unknown>("/parents/me/dashboard"),
};