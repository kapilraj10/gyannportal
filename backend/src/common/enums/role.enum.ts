/**
 * Centralized user roles for the GyannPortal platform.
 *
 * Mirrors the seeded `Role.name` values stored in the database.
 */
export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  SCHOOL_ADMIN = 'SCHOOL_ADMIN',
  TEACHER = 'TEACHER',
  PARENT = 'PARENT',
  STUDENT = 'STUDENT',
}

export const ALL_ROLES: Role[] = [
  Role.SUPER_ADMIN,
  Role.SCHOOL_ADMIN,
  Role.TEACHER,
  Role.PARENT,
  Role.STUDENT,
];