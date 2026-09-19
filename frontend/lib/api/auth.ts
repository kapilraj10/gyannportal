import type { ApiResponse } from "@/types/api";
import type { AuthResponse, RefreshTokenResponse } from "@/types/auth";
import type { User } from "@/types/domain";

import { get, patch, post } from "./helpers";

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterSchoolInput {
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

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export const authApi = {
  login: (input: LoginInput): Promise<AuthResponse> =>
    post<AuthResponse, LoginInput>("/auth/login", input).then((r) => ({
      ...r.data,
      message: r.message,
    })),

  registerSchool: (input: RegisterSchoolInput): Promise<AuthResponse> =>
    post<AuthResponse, RegisterSchoolInput>("/auth/register-school", input).then(
      (r) => ({ ...r.data, message: r.message }),
    ),

  refresh: (refreshToken: string): Promise<RefreshTokenResponse> =>
    post<RefreshTokenResponse, { refreshToken: string }>("/auth/refresh", {
      refreshToken,
    }).then((r) => r.data),

  logout: (refreshToken?: string): Promise<null> =>
    post<null, { refreshToken?: string }>("/auth/logout", { refreshToken })
      .then(() => null)
      .catch(() => null),

  getMe: (): Promise<User> => get<User>("/auth/me"),

  changePassword: (input: ChangePasswordInput): Promise<ApiResponse<null>> =>
    post<null, ChangePasswordInput>("/auth/change-password", input),

  updateProfile: (input: { name?: string; phone?: string; avatar?: string }): Promise<User> =>
    patch<User, { name?: string; phone?: string; avatar?: string }>(
      "/users/me",
      input,
    ).then((r) => r.data),
};