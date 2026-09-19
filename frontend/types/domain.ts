/**
 * Domain models mirrored from the Prisma schema.
 *
 * Only the fields consumed by the frontend are declared here; the backend
 * remains the source of truth. Optional fields keep us resilient to backend
 * select projection changes.
 */

export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";
export type Gender = "MALE" | "FEMALE" | "OTHER";
export type SchoolStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";
export type SchoolType = "PRIVATE" | "GOVERNMENT" | "COMMUNITY" | "INSTITUTIONAL";
export type SchoolLevel =
  | "PRIMARY"
  | "SECONDARY"
  | "HIGHER_SECONDARY"
  | "COLLEGE"
  | "UNIVERSITY";
export type BranchStatus = "ACTIVE" | "INACTIVE";
export type AcademicYearStatus = "ACTIVE" | "INACTIVE" | "COMPLETED";
export type EntityStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "COMPLETED";
export type EnrollmentStatus = "ACTIVE" | "PROMOTED" | "TRANSFERRED" | "WITHDRAWN" | "COMPLETED";
export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED" | "HALF_DAY";
export type ExamStatus = "SCHEDULED" | "ONGOING" | "COMPLETED" | "CANCELLED";
export type AssignmentStatus = "DRAFT" | "PUBLISHED" | "CLOSED";
export type SubmissionStatus = "PENDING" | "SUBMITTED" | "LATE" | "GRADED";
export type ParentChildRelationship = "FATHER" | "MOTHER" | "GUARDIAN" | "OTHER";
export type NotificationType =
  | "GENERAL"
  | "ANNOUNCEMENT"
  | "ATTENDANCE"
  | "ASSIGNMENT"
  | "EXAM"
  | "RESULT"
  | "FEE"
  | "EVENT";

export interface School {
  id: string;
  name: string;
  code: string;
  registrationNumber?: string | null;
  schoolType?: SchoolType;
  level?: SchoolLevel;
  establishedYear?: number | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
  logoUrl?: string | null;
  status: SchoolStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface Branch {
  id: string;
  schoolId: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  isMain?: boolean;
  status: BranchStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface AcademicYear {
  id: string;
  schoolId: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  status: AcademicYearStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClassEntity {
  id: string;
  schoolId: string;
  academicYearId: string;
  name: string;
  code: string;
  description?: string | null;
  status: EntityStatus;
  academicYear?: AcademicYear;
  sections?: Section[];
  _count?: { sections?: number; enrollments?: number; courses?: number };
  createdAt?: string;
  updatedAt?: string;
}

export interface Section {
  id: string;
  schoolId: string;
  classId: string;
  name: string;
  capacity?: number | null;
  status: EntityStatus;
  class?: ClassEntity;
  _count?: { enrollments?: number };
  createdAt?: string;
  updatedAt?: string;
}

export interface Subject {
  id: string;
  schoolId: string;
  name: string;
  code: string;
  description?: string | null;
  status: EntityStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface Course {
  id: string;
  schoolId: string;
  subjectId: string;
  teacherId?: string | null;
  classId: string;
  sectionId?: string | null;
  academicYearId?: string | null;
  name: string;
  code: string;
  status: EntityStatus;
  subject?: Subject;
  teacher?: Teacher;
  class?: ClassEntity;
  section?: Section;
  createdAt?: string;
  updatedAt?: string;
}

export interface Student {
  id: string;
  userId: string;
  schoolId: string;
  studentCode: string;
  dateOfBirth?: string | null;
  gender?: Gender;
  address?: string | null;
  admissionDate?: string | null;
  bloodGroup?: string | null;
  guardianName?: string | null;
  guardianPhone?: string | null;
  status: EntityStatus;
  user?: User;
  enrollments?: Enrollment[];
  class?: ClassEntity | null;
  section?: Section | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Teacher {
  id: string;
  userId: string;
  schoolId: string;
  employeeCode: string;
  qualification?: string | null;
  specialization?: string | null;
  joiningDate?: string | null;
  status: EntityStatus;
  user?: User;
  courses?: Course[];
  _count?: { courses?: number };
  createdAt?: string;
  updatedAt?: string;
}

export interface Parent {
  id: string;
  userId: string;
  schoolId: string;
  occupation?: string | null;
  address?: string | null;
  status: EntityStatus;
  user?: User;
  children?: ParentChild[];
  _count?: { children?: number };
  createdAt?: string;
  updatedAt?: string;
}

export interface ParentChild {
  id: string;
  parentId: string;
  studentId: string;
  relationship: ParentChildRelationship;
  isPrimary: boolean;
  student?: Student;
  parent?: Parent;
}

export interface Enrollment {
  id: string;
  schoolId: string;
  studentId: string;
  classId: string;
  sectionId?: string | null;
  academicYearId: string;
  rollNumber?: number | null;
  status: EnrollmentStatus;
  student?: Student;
  class?: ClassEntity;
  section?: Section;
  academicYear?: AcademicYear;
  createdAt?: string;
  updatedAt?: string;
}

export interface Attendance {
  id: string;
  schoolId: string;
  studentId: string;
  classId?: string | null;
  sectionId?: string | null;
  academicYearId?: string | null;
  date: string;
  status: AttendanceStatus;
  remarks?: string | null;
  markedById?: string | null;
  student?: Student;
  createdAt?: string;
  updatedAt?: string;
}

export interface Assignment {
  id: string;
  schoolId: string;
  courseId?: string | null;
  classId?: string | null;
  sectionId?: string | null;
  teacherId?: string | null;
  title: string;
  description?: string | null;
  dueDate: string;
  maxMarks?: number | null;
  status: AssignmentStatus;
  course?: Course;
  class?: ClassEntity;
  section?: Section;
  _count?: { submissions?: number };
  createdAt?: string;
  updatedAt?: string;
}

export interface Exam {
  id: string;
  schoolId: string;
  academicYearId?: string | null;
  classId?: string | null;
  name: string;
  examType?: string | null;
  startDate: string;
  endDate: string;
  status: ExamStatus;
  class?: ClassEntity;
  _count?: { results?: number };
  createdAt?: string;
  updatedAt?: string;
}

export interface Result {
  id: string;
  schoolId: string;
  examId: string;
  studentId: string;
  subjectId?: string | null;
  marksObtained: number;
  maxMarks: number;
  grade?: string | null;
  remarks?: string | null;
  exam?: Exam;
  student?: Student;
  subject?: Subject;
  createdAt?: string;
  updatedAt?: string;
}

export interface AppNotification {
  id: string;
  schoolId?: string | null;
  userId?: string | null;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface AuditLog {
  id: string;
  schoolId?: string | null;
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  description?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  user?: User;
}

export interface RoleSummary {
  id: string;
  name: string;
  description?: string | null;
  permissions?: string[];
  _count?: { users?: number; rolePermissions?: number };
}

export interface PermissionSummary {
  id: string;
  name: string;
  description?: string | null;
}

/** Re-exported to avoid a circular import with `types/auth.ts`. */
export interface User {
  id: string;
  schoolId?: string | null;
  branchId?: string | null;
  name: string;
  email: string;
  phone?: string | null;
  gender?: Gender | null;
  avatarUrl?: string | null;
  status: UserStatus;
  roleId: string;
  role: string;
  roleName?: string;
  permissions?: string[];
  school?: School | null;
  branch?: Branch | null;
  student?: Student | null;
  teacher?: Teacher | null;
  parent?: Parent | null;
  lastLoginAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
