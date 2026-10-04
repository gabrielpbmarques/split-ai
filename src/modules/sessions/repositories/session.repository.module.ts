import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SessionEntity } from 'src/infrastructure/database/schema';
import { SessionRepository } from 'src/modules/sessions/repositories/session.repository';

@Module({
  imports: [TypeOrmModule.forFeature([SessionEntity])],
  providers: [SessionRepository],
  exports: [SessionRepository],
})
export class SessionRepositoryModule {}
