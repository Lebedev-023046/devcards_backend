import { Role } from '@prisma/client';
import { Request } from 'express';

export interface AuthenticatedUser {
  id: string;
  email?: string;
  role?: Role;
  name?: string;
}

export type AuthenticatedRequest = Request & {
  user?: AuthenticatedUser;
};
