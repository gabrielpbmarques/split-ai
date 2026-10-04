import { SetMetadata } from '@nestjs/common';
import { REQUIRE_ACTIVE_ORGANIZATION_KEY } from 'src/auth/auth.constants';

export const RequireActiveOrganization = (): MethodDecorator & ClassDecorator =>
  SetMetadata(REQUIRE_ACTIVE_ORGANIZATION_KEY, true);
