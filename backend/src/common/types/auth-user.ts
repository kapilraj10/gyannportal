/**
 * Authenticated user object attached to `request.user` by JwtAuthGuard.
 */
export interface AuthUser {
  id: string;
  userId: string;
  email: string;
  schoolId: string;
  roleId: string;
  role: string;
}

export type AuthUserKey = keyof AuthUser;