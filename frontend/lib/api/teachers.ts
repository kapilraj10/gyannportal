import type { ListResult, PaginationParams } from "@/types/api";
import type {
  Assignment,
  Attendance,
  Course,
  Result,
  Teacher,
} from "@/types/domain";

import { del, get, getList, patch, post } from "./helpers";

export interface TeacherInput {
  name?: string;
  email?: string;
  phone?: string;
  employeeCode?: string;
  qualification?: string;
  specialization?: string;
  joiningDate?: string;
  status?: string;
}

export interface MarkAttendanceInput {
  classId: string;
  sectionId?: string;
  date: string;
  records: Array<{ studentId: string; status: string; remarks?: string }>;
}

export const teachersApi = {
  list: (params?: PaginationParams): Promise<ListResult<Teacher>> =>
    getList<Teacher>("/teachers", params),

  get: (id: string): Promise<Teacher> => get<Teacher>(`/teachers/${id}`),

  create: (input: TeacherInput): Promise<Teacher> =>
    post<Teacher, TeacherInput>("/teachers", input).then((r) => r.data),

  update: (id: string, input: Partial<TeacherInput>): Promise<Teacher> =>
    patch<Teacher, Partial<TeacherInput>>(`/teachers/${id}`, input).then(
      (r) => r.data,
    ),

  remove: (id: string): Promise<null> =>
    del<null>(`/teachers/${id}`).then(() => null),

  // Teacher portal
  getMyProfile: (): Promise<Teacher> => get<Teacher>("/teachers/me"),
  getMyClasses: (): Promise<unknown> => get<unknown>("/teachers/me/classes"),
  getMyStudents: (params?: PaginationParams): Promise<ListResult<Teacher>> =>
    getList<Teacher>("/teachers/me/students", params),
  getMyCourses: (): Promise<Course[]> => get<Course[]>("/teachers/me/courses"),
  markAttendance: (input: MarkAttendanceInput): Promise<unknown> =>
    post<unknown, MarkAttendanceInput>("/teachers/me/attendance", input).then(
      (r) => r.data,
    ),
  getMyAttendance: (params?: PaginationParams): Promise<ListResult<Attendance>> =>
    getList<Attendance>("/teachers/me/attendance", params),

  getMyAssignments: (params?: PaginationParams): Promise<ListResult<Assignment>> =>
    getList<Assignment>("/teachers/me/assignments", params),
  createAssignment: (input: Record<string, unknown>): Promise<Assignment> =>
    post<Assignment, Record<string, unknown>>(
      "/teachers/me/assignments",
      input,
    ).then((r) => r.data),
  updateAssignment: (
    id: string,
    input: Record<string, unknown>,
  ): Promise<Assignment> =>
    patch<Assignment, Record<string, unknown>>(
      `/teachers/me/assignments/${id}`,
      input,
    ).then((r) => r.data),
  deleteAssignment: (id: string): Promise<null> =>
    del<null>(`/teachers/me/assignments/${id}`).then(() => null),
  getAssignmentSubmissions: (id: string): Promise<unknown> =>
    get<unknown>(`/teachers/me/assignments/${id}/submissions`),
  gradeSubmission: (
    submissionId: string,
    input: { grade: string; feedback?: string },
  ): Promise<unknown> =>
    patch<unknown, { grade: string; feedback?: string }>(
      `/teachers/me/assignments/submissions/${submissionId}/grade`,
      input,
    ).then((r) => r.data),

  getMyResults: (params?: PaginationParams): Promise<ListResult<Result>> =>
    getList<Result>("/teachers/me/results", params),
  createResult: (input: Record<string, unknown>): Promise<Result> =>
    post<Result, Record<string, unknown>>("/teachers/me/results", input).then(
      (r) => r.data,
    ),
  updateResult: (id: string, input: Record<string, unknown>): Promise<Result> =>
    patch<Result, Record<string, unknown>>(`/teachers/me/results/${id}`, input).then(
      (r) => r.data,
    ),

  getMyNotifications: (params?: PaginationParams): Promise<ListResult<unknown>> =>
    getList<unknown>("/teachers/me/notifications", params),
  getDashboard: (): Promise<unknown> => get<unknown>("/teachers/me/dashboard"),
};