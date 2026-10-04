import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AccessScopeService } from 'src/auth/access-scope.service';
import { AuthenticationGuard } from 'src/auth/authentication.guard';
import { AuthorizationGuard } from 'src/auth/authorization.guard';
import { PrincipalResolverService } from 'src/auth/principal-resolver.service';
import { TokenVerifier } from 'src/auth/token.verifier';
import { ApiKeyRepositoryModule } from 'src/repositories/api-key.repository.module';
import { OrganizationRepositoryModule } from 'src/repositories/organization.repository.module';

@Module({
  imports: [ApiKeyRepositoryModule, OrganizationRepositoryModule],
  providers: [
    TokenVerifier,
    PrincipalResolverService,
    AccessScopeService,
    { provide: APP_GUARD, useClass: AuthenticationGuard },
    { provide: APP_GUARD, useClass: AuthorizationGuard },
  ],
  exports: [PrincipalResolverService, AccessScopeService],
})
export class AuthModule {}
