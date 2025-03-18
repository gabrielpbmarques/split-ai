import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export type UserType = 'worker' | 'establishment' | 'company' | 'admin';

export const Roles = (...roles: UserType[]) => SetMetadata(ROLES_KEY, roles);
