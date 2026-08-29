import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserTokenEntity } from 'src/entities';

import { UserTokenRepository } from './user-token.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserTokenEntity])],
  providers: [UserTokenRepository],
  exports: [UserTokenRepository],
})
export class UserTokenRepositoryModule {}
