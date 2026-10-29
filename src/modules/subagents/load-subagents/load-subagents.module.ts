import { Module } from '@nestjs/common';

import { AntiPersonalLeakModule } from 'src/modules/subagents/anti-personal-leak/anti-personal-leak.module';
import { AntiPromptInjectionModule } from 'src/modules/subagents/anti-prompt-injection/anti-prompt-injection.module';
import { InternetResearchModule } from 'src/modules/subagents/internet-research/internet-research.module';
import { LoadSubagentsService } from 'src/modules/subagents/load-subagents/load-subagents.service';

@Module({
  imports: [
    AntiPromptInjectionModule,
    AntiPersonalLeakModule,
    InternetResearchModule,
  ],
  providers: [LoadSubagentsService],
  exports: [LoadSubagentsService],
})
export class LoadSubagentsModule {}
