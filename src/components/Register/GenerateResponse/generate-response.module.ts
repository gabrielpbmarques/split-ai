import { Module } from '@nestjs/common';
import { GenerateResponseService } from './generate-response.service';
import { GenerateAiResponseModule } from '../Common/generate-ai-response.module';

@Module({
  imports: [GenerateAiResponseModule],
  providers: [GenerateResponseService],
  exports: [GenerateResponseService],
})
export class GenerateResponseModule {}
