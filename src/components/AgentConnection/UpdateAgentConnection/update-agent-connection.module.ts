import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { UpdateAgentConnectionController } from './update-agent-connection.controller';
import { UpdateAgentConnectionService } from './update-agent-connection.service';

@Module({
  imports: [RepositoriesModule],
  controllers: [UpdateAgentConnectionController],
  providers: [UpdateAgentConnectionService],
  exports: [UpdateAgentConnectionService],
})
export class UpdateAgentConnectionModule {}
