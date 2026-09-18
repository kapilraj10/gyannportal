import { api } from "./api";
import { clearAccessToken, setAccessToken } from "./token";
import { AuthResponse, User } from "@/types/auth";

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterSchoolData {
  schoolName: string;
  schoolCode: string;

  registrationNumber?: string;
  schoolType?: string;
  level?: string;
  establishedYear?: number;

  schoolEmail?: string;
  phone?: string;
  website?: string;
  address?: string;

  adminName: string;
  adminEmail: string;
  adminPhone?: string;
  adminPassword: string;

  branchName?: string;
  branchAddress?: string;
}

interface Envelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function login(data: LoginData): Promise<AuthResponse> {
  const response = await api.post<Envelope<AuthResponse>>("/auth/login", data);
  const payload = response.data.data;

  setAccessToken(payload.accessToken);

  return payload;
}

export async function registerSchool(
  data: RegisterSchoolData,
): Promise<AuthResponse> {
  const response = await api.post<Envelope<AuthResponse>>(
    "/auth/register-school",
    data,
  );
  const payload = response.data.data;

  setAccessToken(payload.accessToken);

  return payload;
}

export async function getMe(): Promise<User> {
  const response = await api.get<Envelope<User>>("/auth/me");

  return response.data.data;
}

export async function logout() {
  clearAccessToken();
}

// =====================================================
// DASHBOARD API
// =====================================================

export interface SuperAdminDashboardData {
  schools: {
    total: number;
    active: number;
    suspended: number;
    pending: number;
  };
  users: {
    total: number;
    byRole: Array<{ role: string; count: number }>;
  };
  profiles: {
    students: number;
    teachers: number;
    parents: number;
  };
  recentSchools: Array<{
    id: string;
    name: string;
    code: string;
    status: string;
    createdAt: string;
    _count: { users: number; students: number };
  }>;
  recentRegistrations: Array<{
    id: string;
    name: string;
    email: string;
    role: { name: string };
    createdAt: string;
  }>;
}

export interface SchoolAdminDashboardData {
  school: {
    id: string;
    name: string;
    code: string;
    status: string;
    logo: string | null;
  };
  activeAcademicYear: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: string;
  } | null;
  counts: {
    students: number;
    teachers: number;
    parents: number;
    classes: number;
    sections: number;
    subjects: number;
    courses: number;
    exams: number;
    assignments: number;
  };
  today: {
    attendance: number;
    notices: number;
  };
  recentActivities: Array<{
    id: string;
    action: string;
    entity: string;
    entityId: string | null;
    metadata: Record<string, unknown> | null;
    createdAt: string;
    user: { id: string; name: string; role: { name: string } };
  }>;
}

export interface TeacherDashboardData {
  teacherId: string;
  activeAcademicYear: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: string;
  } | null;
  counts: {
    myClasses: number;
    myStudents: number;
    myCourses: number;
    pendingAssignments: number;
    pendingSubmissions: number;
    ungradedSubmissions: number;
  };
  today: {
    attendance: number;
  };
  unreadNotifications: number;
  recentActivities: Array<{
    id: string;
    action: string;
    entity: string;
    entityId: string | null;
    metadata: Record<string, unknown> | null;
    createdAt: string;
  }>;
}

export interface StudentDashboardData {
  student: {
    id: string;
    studentCode: string;
    user: { id: string; name: string; avatar: string | null };
    enrollments: Array<{
      class: { id: string; name: string; code: string };
      section: { id: string; name: string };
    }>;
  };
  activeAcademicYear: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: string;
  } | null;
  counts: {
    totalAssignments: number;
    pendingAssignments: number;
    upcomingExams: number;
  };
  upcomingExams: Array<{
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: string;
    academicYear: { name: string };
  }>;
  recentResults: Array<{
    id: string;
    marks: number;
    grade: string | null;
    publishedAt: string | null;
    exam: { id: string; name: string };
    subject: { id: string; name: string; code: string };
  }>;
  today: {
    attendance: number;
  };
  unreadNotifications: number;
}

export interface ParentDashboardData {
  children: Array<{
    id: string;
    studentCode: string;
    status: string;
    user: { id: string; name: string; avatar: string | null };
    enrollments: Array<{
      class: { id: string; name: string; code: string };
      section: { id: string; name: string };
    }>;
  }>;
  counts: {
    totalChildren: number;
    totalAssignments: number;
    pendingAssignments: number;
    upcomingExams: number;
  };
  upcomingExams: Array<{
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: string;
    academicYear: { name: string };
  }>;
  recentResults: Array<{
    id: string;
    marks: number;
    grade: string | null;
    publishedAt: string | null;
    studentId: string;
    exam: { id: string; name: string };
    subject: { id: string; name: string; code: string };
    student: { id: string; user: { name: string } };
  }>;
  today: {
    attendance: number;
  };
  unreadNotifications: number;
}

export async function getSuperAdminDashboard(): Promise<SuperAdminDashboardData> {
  const response = await api.get<Envelope<SuperAdminDashboardData>>(
    "/super-admin/dashboard",
  );
  return response.data.data;
}

export async function getSchoolAdminDashboard(
  schoolId?: string,
): Promise<SchoolAdminDashboardData> {
  const params = schoolId ? { schoolId } : {};
  const response = await api.get<Envelope<SchoolAdminDashboardData>>(
    "/school-admin/dashboard",
    { params },
  );
  return response.data.data;
}

export async function getTeacherDashboard(): Promise<TeacherDashboardData> {
  const response = await api.get<Envelope<TeacherDashboardData>>(
    "/teachers/me/dashboard",
  );
  return response.data.data;
}

export async function getStudentDashboard(): Promise<StudentDashboardData> {
  const response = await api.get<Envelope<StudentDashboardData>>(
    "/students/me/dashboard",
  );
  return response.data.data;
}

export async function getParentDashboard(): Promise<ParentDashboardData> {
  const response = await api.get<Envelope<ParentDashboardData>>(
    "/parents/me/dashboard",
  );
  return response.data.data;
}