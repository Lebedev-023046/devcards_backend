import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import {
  AuthenticatedRequest,
  AuthenticatedUser,
} from 'src/auth/types/authenticated-request.type';

type ReqUserKey = keyof AuthenticatedUser;
type ReqUserValue = AuthenticatedUser[ReqUserKey];

export const ReqUser = createParamDecorator<
  ReqUserKey | undefined,
  AuthenticatedUser | ReqUserValue | undefined
>((key, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
  const user = request.user;

  if (!key) {
    return user;
  }

  return user?.[key];
});
