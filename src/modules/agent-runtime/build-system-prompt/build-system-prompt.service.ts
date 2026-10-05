import { Injectable } from '@nestjs/common';

import { NormalizePromptInstructionsService } from 'src/modules/agent-runtime/normalize-prompt-instructions/normalize-prompt-instructions.service';
import type { AgentTool, AIInstructions } from 'src/shared/contracts';

@Injectable()
export class BuildSystemPromptService {
  constructor(
    private normalizePromptInstructionsService: NormalizePromptInstructionsService,
  ) {}

  async execute(
    instructions: AIInstructions,
    tools: AgentTool[],
    promptVariables?: Record<string, unknown>,
  ): Promise<string> {
    const textPrompt = this.normalizePromptInstructionsService.execute(
      instructions,
      tools,
      promptVariables,
    );

    const final = `
      ${textPrompt}\n
      TODAY_DATE: ${new Date().toLocaleDateString()}\n
    `;
    return final;
  }
}
