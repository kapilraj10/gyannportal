import type { ListResult, PaginationParams } from "@/types/api";
import type { Attendance, Assignment, Exam, Result, Student } from "@/types/domain";

import { del, get, getList, patch, post } from "./helpers";

export interface StudentInput {
  name?: string;
  email?: string;
  phone?: string;
  studentCode?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  admissionDate?: string;
  bloodGroup?: string;
  guardianName?: string;
  guardianPhone?: string;
  classId?: string;
  sectionId?: string;
  academicYearId?: string;
  status?: string;
}

export const studentsApi = {
  list: (params?: PaginationParams): Promise<ListResult<Student>> =>
    getList<Student>("/students", params),

  get: (id: string): Promise<Student> => get<Student>(`/students/${id}`),

  create: (input: StudentInput): Promise<Student> =>
    post<Student, StudentInput>("/students", input).then((r) => r.data),

  update: (id: string, input: Partial<StudentInput>): Promise<Student> =>
    patch<Student, Partial<StudentInput>>(`/students/${id}`, input).then(
      (r) => r.data,
    ),

  remove: (id: string): Promise<null> =>
    del<null>(`/students/${id}`).then(() => null),

  // Student portal
  getMyProfile: (): Promise<Student> => get<Student>("/students/me"),
  getMyClasses: (): Promise<unknown> => get<unknown>("/students/me/classes"),
  getMyAttendance: (params?: PaginationParams): Promise<ListResult<Attendance>> =>
    getList<Attendance>("/students/me/attendance", params),
  getMyAssignments: (params?: PaginationParams): Promise<ListResult<Assignment>> =>
    getList<Assignment>("/students/me/assignments", params),
  getMyExams: (params?: PaginationParams): Promise<ListResult<Exam>> =>
    getList<Exam>("/students/me/exams", params),
  getMyResults: (params?: PaginationParams): Promise<ListResult<Result>> =>
    getList<Result>("/students/me/results", params),
  getMyNotifications: (params?: PaginationParams): Promise<ListResult<unknown>> =>
    getList<unknown>("/students/me/notifications", params),
  getDashboard: (): Promise<unknown> => get<unknown>("/students/me/dashboard"),
};