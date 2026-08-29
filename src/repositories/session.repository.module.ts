import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionEntity } from 'src/entities';

import { SessionRepository } from './session.repository';

@Module({
  imports: [TypeOrmModule.forFeature([SessionEntity])],
  providers: [SessionRepository],
  exports: [SessionRepository],
})
export class SessionRepositoryModule {}
