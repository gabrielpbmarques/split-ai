import { SetMetadata } from '@nestjs/common';
import { REQUIRED_PERMISSIONS_KEY } from 'src/auth/auth.constants';
import { Permission } from 'src/auth/permissions';

export const RequirePermissions = (
  ...permissions: Permission[]
): MethodDecorator & ClassDecorator =>
  SetMetadata(REQUIRED_PERMISSIONS_KEY, permissions);
