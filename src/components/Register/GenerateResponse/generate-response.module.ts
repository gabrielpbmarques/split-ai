import { Module } from '@nestjs/common';
import { GenerateResponseService } from 'src/components/Register/GenerateResponse/generate-response.service';
import { GenerateAiResponseModule } from 'src/components/AIIntegration/Common/generate-ai-response.module';

@Module({
  imports: [GenerateAiResponseModule],
  providers: [GenerateResponseService],
  exports: [GenerateResponseService],
})
export class GenerateResponseModule {}
