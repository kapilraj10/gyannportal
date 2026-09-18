import { SetMetadata } from '@nestjs/common';

export const PUBLIC_KEY = 'isPublic';

/**
 * Marks a route as publicly accessible (no JWT required).
 * JwtAuthGuard skips public routes.
 */
export const Public = () => SetMetadata(PUBLIC_KEY, true);