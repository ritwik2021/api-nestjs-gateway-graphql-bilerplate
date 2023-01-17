import { ThrottlerGuard } from '@nestjs/throttler';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * @class GqlThrottlerGuard
 * @extends ThrottlerGuard
 * @description This is a guard class that extends the functionality of the ThrottlerGuard from NestJS/Throttler.
 * It is used to handle GraphQL requests and responses for rate limiting.
 * @author Ritwik Rohitashwa
 */
@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
  getRequestResponse(context: ExecutionContext) {
    const gqlCtx = GqlExecutionContext.create(context);
    const ctx = gqlCtx.getContext();
    return { req: ctx.req, res: ctx.req.res };
  }
}
