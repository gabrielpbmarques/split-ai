import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';
import { UpdateAgentController } from './update-agent.controller';
import { UpdateAgentService } from './update-agent.service';

@Module({
  imports: [RepositoriesModule],
  controllers: [UpdateAgentController],
  providers: [UpdateAgentService],
  exports: [UpdateAgentService],
})
export class UpdateAgentModule {}
