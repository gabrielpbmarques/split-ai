import { Module } from '@nestjs/common';
import { ArtificialIntelligenceModule } from 'src/components/ArtificialIntelligence/artificial-intelligence.module';
import { SessionModule } from 'src/components/Session/session.module';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { AttendantController } from './attendant.controller';
import { AttendantService } from './attendant.service';

@Module({
  imports: [RepositoriesModule, ArtificialIntelligenceModule, SessionModule],
  providers: [AttendantService],
  controllers: [AttendantController],
  exports: [AttendantService],
})
export class AttendantModule {}
