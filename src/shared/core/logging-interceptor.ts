import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { GqlExecutionContext } from '@nestjs/graphql';
import { tap } from 'rxjs/operators';

/**
 * LoggingInterceptor
 *
 * @description Interceptor to log incoming requests.
 * Logs the request method, url, and the time it took to process the request.
 *
 * @class LoggingInterceptor
 * @implements {NestInterceptor}
 * @author Ritwik Rohitashwa
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const req = context.switchToHttp().getRequest();
    if (req) {
      const method = req.method;
      const url = req.url;
      return next.handle().pipe(
        tap(() => {
          Logger.log(`${method} ${url} ${Date.now() - now}ms`, context.getClass().name);
        })
      );
    } else {
      const ctx: any = GqlExecutionContext.create(context);
      const resolverName = ctx.constructorRef.name;
      const info = ctx.getInfo();
      return next.handle().pipe(
        tap(() => {
          Logger.log(`${info.parentType} "${info.fieldName}" ${Date.now() - now}ms`, resolverName);
        })
      );
    }
  }
}
