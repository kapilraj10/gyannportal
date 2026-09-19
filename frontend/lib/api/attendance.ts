import type { ListResult, PaginationParams } from "@/types/api";
import type { Attendance } from "@/types/domain";

import { del, get, getList, post } from "./helpers";

export interface AttendanceMarkInput {
  classId: string;
  sectionId?: string;
  date: string;
  records: Array<{ studentId: string; status: string; remarks?: string }>;
}

export const attendanceApi = {
  mark: (input: AttendanceMarkInput): Promise<unknown> =>
    post<unknown, AttendanceMarkInput>("/attendance", input).then(
      (r) => r.data,
    ),

  summary: (params?: Record<string, string>): Promise<unknown> =>
    get<unknown>("/attendance/summary", params),

  list: (params?: PaginationParams): Promise<ListResult<Attendance>> =>
    getList<Attendance>("/attendance", params),

  get: (id: string): Promise<Attendance> => get<Attendance>(`/attendance/${id}`),

  remove: (id: string): Promise<null> =>
    del<null>(`/attendance/${id}`).then(() => null),
};