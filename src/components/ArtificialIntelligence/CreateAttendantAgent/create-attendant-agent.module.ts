import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { CreateAttendantAgentController } from './create-attendant-agent.controller';
import { CreateAttendantAgentService } from './create-attendant-agent.service';

@Module({
  imports: [RepositoriesModule],
  providers: [CreateAttendantAgentService],
  controllers: [CreateAttendantAgentController],
  exports: [CreateAttendantAgentService],
})
export class CreateAttendantAgentModule {}
