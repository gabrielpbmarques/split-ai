import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { CreateAgentController } from './create-agent.controller';
import { CreateAgentService } from './create-agent.service';

@Module({
  imports: [RepositoriesModule],
  controllers: [CreateAgentController],
  providers: [CreateAgentService],
  exports: [CreateAgentService],
})
export class CreateAgentModule {}
