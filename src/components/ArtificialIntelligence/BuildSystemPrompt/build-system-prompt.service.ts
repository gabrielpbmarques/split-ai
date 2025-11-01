import { Injectable } from '@nestjs/common';
import { DynamicStructuredTool } from 'langchain';
import { NormalizePromptInstructionsService } from 'src/components/ArtificialIntelligence/NormalizePromptInstructions/normalize-prompt-instructions.service';
import { AIInstructions } from 'src/types';

@Injectable()
export class BuildSystemPromptService {
  constructor(
    private normalizePromptInstructionsService: NormalizePromptInstructionsService,
  ) {}

  async execute(
    instructions: AIInstructions,
    tools: DynamicStructuredTool[],
    promptVariables?: Record<string, any>,
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
