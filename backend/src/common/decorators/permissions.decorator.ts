import { SetMetadata } from '@nestjs/common';
import { Permission } from '../enums/permission.enum.js';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Restrict a route (or controller) to the given permissions.
 *
 * The user's role must be assigned at least one of the listed permissions.
 *
 * @example
 * @Permissions(Permission.STUDENT_CREATE)
 */
export const Permissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);