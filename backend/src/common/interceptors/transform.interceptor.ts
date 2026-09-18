import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface Envelope<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: unknown;
}

/**
 * Wraps controller responses into the consistent success envelope:
 * `{ success: true, message, data, meta? }`
 *
 * Services return either a plain payload or an object shaped like
 * `{ message?, data, meta? }`. Responses that already contain a `success`
 * flag are passed through untouched.
 */
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Envelope<T>>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<Envelope<T>> {
    return next.handle().pipe(
      map((body) => {
        if (body === undefined || body === null) {
          return {
            success: true,
            message: 'Operation completed successfully',
            data: null as unknown as T,
          };
        }

        const candidate = body as unknown as Record<string, unknown>;

        if (
          typeof candidate === 'object' &&
          !Array.isArray(candidate) &&
          'success' in candidate
        ) {
          return candidate as unknown as Envelope<T>;
        }

        if (
          typeof candidate === 'object' &&
          !Array.isArray(candidate) &&
          'data' in candidate
        ) {
          return {
            success: true,
            message:
              typeof candidate.message === 'string'
                ? candidate.message
                : 'Operation completed successfully',
            data: candidate.data as T,
            ...(candidate.meta !== undefined ? { meta: candidate.meta } : {}),
          };
        }

        return {
          success: true,
          message: 'Operation completed successfully',
          data: body,
        };
      }),
    );
  }
}