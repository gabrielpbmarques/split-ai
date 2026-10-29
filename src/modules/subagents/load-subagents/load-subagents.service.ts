import { Injectable } from '@nestjs/common';
import type { SubAgent } from 'deepagents';

import { AntiPersonalLeakService } from 'src/modules/subagents/anti-personal-leak/anti-personal-leak.service';
import { AntiPromptInjectionService } from 'src/modules/subagents/anti-prompt-injection/anti-prompt-injection.service';
import { InternetResearchService } from 'src/modules/subagents/internet-research/internet-research.service';

@Injectable()
export class LoadSubagentsService {
  constructor(
    private readonly antiPromptInjectionService: AntiPromptInjectionService,
    private readonly antiPersonalLeakService: AntiPersonalLeakService,
    private readonly internetResearchService: InternetResearchService,
  ) {}

  async execute(): Promise<SubAgent[]> {
    const antiPromptInjectionAgent = this.antiPromptInjectionService.execute();
    const antiPersonalLeakAgent = this.antiPersonalLeakService.execute();
    const internetResearchAgent = this.internetResearchService.execute();

    return Promise.all([
      antiPromptInjectionAgent,
      antiPersonalLeakAgent,
      internetResearchAgent,
    ]);
  }
}
