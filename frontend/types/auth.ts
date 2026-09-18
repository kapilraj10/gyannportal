export interface School {
  id: string;
  name: string;
  code: string;
  status?: string;
}

export interface Branch {
  id: string;
  name: string;
  address?: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  status?: string;
  role: string;
  schoolId: string;
  school: School;
  branch?: Branch | null;
}

export interface AuthResponse {
  message: string;
  accessToken: string;
  refreshToken?: string;
  user: User;
}