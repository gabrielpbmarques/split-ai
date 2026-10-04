import { Module } from '@nestjs/common';

import { GenerateAiResponseModule } from 'src/modules/agent-runtime/generate-ai-response/generate-ai-response.module';
import { ResolveAgentModule } from 'src/modules/agent-runtime/resolve-agent/resolve-agent.module';
import { ExtractOcrTextService } from 'src/modules/sources/extract-ocr-text/extract-ocr-text.service';

@Module({
  imports: [GenerateAiResponseModule, ResolveAgentModule],
  providers: [ExtractOcrTextService],
  exports: [ExtractOcrTextService],
})
export class ExtractOcrTextModule {}
