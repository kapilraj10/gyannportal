import type { Course } from "@/types/domain";

import { createResourceApi } from "./factory";

export interface CourseInput {
  name: string;
  code: string;
  subjectId: string;
  teacherId?: string;
  classId: string;
  sectionId?: string;
  academicYearId?: string;
  status?: string;
}

export const coursesApi = createResourceApi<Course, CourseInput, Partial<CourseInput>>(
  "/courses",
);