import { ForbiddenException, NotFoundException } from '@nestjs/common';
import type { DatabaseService } from '../../database/database.service.js';
import { Role } from '../enums/role.enum.js';
import type { AuthUser } from '../types/auth-user.js';

/**
 * Resolves the tenant (school) a write operation should target.
 *
 * Only SUPER_ADMIN may target an arbitrary school by explicitly supplying it.
 * Everyone else is always pinned to their own school — the requested value is
 * ignored so a forged `schoolId` can never cross tenants.
 */
export function resolveSchoolId(
  user: AuthUser,
  requested?: string | null,
): string {
  if (user.role === Role.SUPER_ADMIN && requested) {
    return requested;
  }
  return user.schoolId;
}

/**
 * Throws 403 unless the user may access the given school.
 */
export function assertSameSchool(user: AuthUser, schoolId: string): void {
  if (user.role === Role.SUPER_ADMIN) {
    return;
  }
  if (schoolId !== user.schoolId) {
    throw new ForbiddenException(
      'You do not have permission to access this resource',
    );
  }
}

/**
 * Asserts that the authenticated user is allowed to access the given student.
 *
 * - SUPER_ADMIN: any student
 * - SCHOOL_ADMIN: students inside their own school
 * - TEACHER: students inside their own school
 * - PARENT: only students linked through ParentStudent
 * - STUDENT: only their own student record
 */
export async function assertStudentAccess(
  prisma: DatabaseService,
  user: AuthUser,
  studentId: string,
): Promise<void> {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { id: true, schoolId: true, userId: true },
  });

  if (!student) {
    throw new NotFoundException('Student not found');
  }

  if (user.role === Role.SUPER_ADMIN) {
    return;
  }

  if (user.role === Role.SCHOOL_ADMIN || user.role === Role.TEACHER) {
    if (student.schoolId !== user.schoolId) {
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }
    return;
  }

  if (user.role === Role.STUDENT) {
    if (student.userId !== user.userId) {
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }
    return;
  }

  if (user.role === Role.PARENT) {
    const link = await prisma.parentStudent.findFirst({
      where: {
        studentId,
        parent: { userId: user.userId },
      },
      select: { id: true },
    });

    if (!link) {
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }
    return;
  }

  throw new ForbiddenException(
    'You do not have permission to access this resource',
  );
}

/**
 * Resolves the current parent profile id for a PARENT user.
 */
export async function getParentProfileId(
  prisma: DatabaseService,
  user: AuthUser,
): Promise<string> {
  const parent = await prisma.parent.findUnique({
    where: { userId: user.userId },
    select: { id: true },
  });

  if (!parent) {
    throw new NotFoundException('Parent profile not found');
  }

  return parent.id;
}

/**
 * Resolves the current student profile for a STUDENT user.
 */
export async function getStudentProfile(
  prisma: DatabaseService,
  user: AuthUser,
): Promise<{ id: string; schoolId: string; userId: string }> {
  const student = await prisma.student.findUnique({
    where: { userId: user.userId },
    select: { id: true, schoolId: true, userId: true },
  });

  if (!student) {
    throw new NotFoundException('Student profile not found');
  }

  return student;
}