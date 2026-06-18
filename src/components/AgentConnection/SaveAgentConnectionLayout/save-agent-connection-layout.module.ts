import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { SaveAgentConnectionLayoutController } from './save-agent-connection-layout.controller';
import { SaveAgentConnectionLayoutService } from './save-agent-connection-layout.service';

@Module({
  imports: [RepositoriesModule],
  controllers: [SaveAgentConnectionLayoutController],
  providers: [SaveAgentConnectionLayoutService],
  exports: [SaveAgentConnectionLayoutService],
})
export class SaveAgentConnectionLayoutModule {}
