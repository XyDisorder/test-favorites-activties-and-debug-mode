import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class ThrottlerGqlGuard extends ThrottlerGuard {
  getRequestResponse(context: ExecutionContext) {
    const gqlCtx = GqlExecutionContext.create(context);
    const ctx = gqlCtx.getContext();
    return { req: ctx.req, res: ctx.res };
  }

  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Extract IP from GraphQL context request
    return (
      req?.ip ||
      req?.connection?.remoteAddress ||
      req?.headers?.['x-forwarded-for']?.split(',')[0] ||
      'unknown'
    );
  }
}
