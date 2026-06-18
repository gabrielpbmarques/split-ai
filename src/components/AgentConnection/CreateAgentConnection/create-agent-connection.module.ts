import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { CreateAgentConnectionController } from './create-agent-connection.controller';
import { CreateAgentConnectionService } from './create-agent-connection.service';

@Module({
  imports: [RepositoriesModule],
  controllers: [CreateAgentConnectionController],
  providers: [CreateAgentConnectionService],
  exports: [CreateAgentConnectionService],
})
export class CreateAgentConnectionModule {}
