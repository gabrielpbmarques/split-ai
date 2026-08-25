import { Module } from '@nestjs/common';

import { GenerateAiResponseService } from './generate-ai-response.service';

@Module({
  providers: [GenerateAiResponseService],
  exports: [GenerateAiResponseService],
})
export class GenerateAiResponseModule {}
