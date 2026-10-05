import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { AuthenticationGuard } from 'src/auth/authentication.guard';
import { AuthorizationGuard } from 'src/auth/authorization.guard';
import { PrincipalResolverService } from 'src/auth/principal-resolver.service';
import { TokenVerifier } from 'src/auth/token.verifier';

@Module({
  providers: [
    TokenVerifier,
    PrincipalResolverService,
    { provide: APP_GUARD, useClass: AuthenticationGuard },
    { provide: APP_GUARD, useClass: AuthorizationGuard },
  ],
})
export class AuthModule {}
