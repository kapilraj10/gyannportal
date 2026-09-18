import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum.js';

export const ROLES_KEY = 'roles';

/**
 * Restrict a route (or controller) to the given roles.
 *
 * @example
 * @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

/** Alias kept for backwards compatibility with string-typed callers. */
export const RolesDecorator = Roles;