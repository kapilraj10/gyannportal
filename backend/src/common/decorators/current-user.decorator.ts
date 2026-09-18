import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Returns the authenticated user attached to the request.
 *
 * Supports property access:
 *   @CurrentUser() user
 *   @CurrentUser('id')
 *   @CurrentUser('role')
 *   @CurrentUser('schoolId')
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return data ? undefined : null;
    }

    return data ? user[data] : user;
  },
);