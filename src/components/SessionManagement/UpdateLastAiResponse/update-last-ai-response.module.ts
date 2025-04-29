import { Module } from '@nestjs/common';
import { UpdateLastAiResponseService } from 'src/components/SessionManagement/UpdateLastAiResponse/update-last-ai-response.service';
import { RepositoriesModule } from 'src/repositories/repositories.module';

@Module({
  imports: [RepositoriesModule],
  providers: [UpdateLastAiResponseService],
  exports: [UpdateLastAiResponseService],
})
export class UpdateLastAiResponseModule {}
