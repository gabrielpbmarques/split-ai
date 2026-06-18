import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { DeleteAgentConnectionController } from './delete-agent-connection.controller';
import { DeleteAgentConnectionService } from './delete-agent-connection.service';

@Module({
  imports: [RepositoriesModule],
  controllers: [DeleteAgentConnectionController],
  providers: [DeleteAgentConnectionService],
  exports: [DeleteAgentConnectionService],
})
export class DeleteAgentConnectionModule {}
