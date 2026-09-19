import type { ListResult, PaginationParams } from "@/types/api";
import type { Enrollment } from "@/types/domain";

import { del, get, getList, patch, post } from "./helpers";

export interface EnrollmentInput {
  studentId: string;
  classId: string;
  sectionId?: string;
  academicYearId?: string;
  rollNumber?: number;
  status?: string;
}

export const enrollmentsApi = {
  list: (params?: PaginationParams): Promise<ListResult<Enrollment>> =>
    getList<Enrollment>("/enrollments", params),

  get: (id: string): Promise<Enrollment> => get<Enrollment>(`/enrollments/${id}`),

  create: (input: EnrollmentInput): Promise<Enrollment> =>
    post<Enrollment, EnrollmentInput>("/enrollments", input).then(
      (r) => r.data,
    ),

  bulkCreate: (input: {
    classId: string;
    sectionId?: string;
    academicYearId?: string;
    studentIds: string[];
  }): Promise<unknown> =>
    post<unknown, typeof input>("/enrollments/bulk", input).then((r) => r.data),

  update: (id: string, input: Partial<EnrollmentInput>): Promise<Enrollment> =>
    patch<Enrollment, Partial<EnrollmentInput>>(`/enrollments/${id}`, input).then(
      (r) => r.data,
    ),

  remove: (id: string): Promise<null> =>
    del<null>(`/enrollments/${id}`).then(() => null),
};