import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserTokenEntity } from 'src/infrastructure/database/schema';
import { UserTokenRepository } from 'src/modules/auth-flows/repositories/user-token.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserTokenEntity])],
  providers: [UserTokenRepository],
  exports: [UserTokenRepository],
})
export class UserTokenRepositoryModule {}
