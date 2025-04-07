import { Injectable } from '@nestjs/common';
import { NormalizePromptInstructionsService } from '../NormalizePromptInstructions/normalize-prompt-instructions.service';
import { AIInstructions } from 'src/types/AIInstructions';
import { AISourceType } from 'src/types/AISourceType';
import { CustomDocument } from 'src/types/CustomDocument';

@Injectable()
export class BuildSystemPromptService {
  constructor(
    private normalizePromptInstructionsService: NormalizePromptInstructionsService,
  ) {}

  async execute(
    context: CustomDocument[],
    instructions: AIInstructions,
    sources?: AISourceType[],
  ): Promise<string> {
    const textPrompt =
      this.normalizePromptInstructionsService.execute(instructions);
    const source = context.map((doc: any) => doc.pageContent).join(' ');

    if (!sources)
      return `${textPrompt}\nFonte: ${source}`
        .replace(/{/g, '{{')
        .replace(/}/g, '}}');

    const groupedSources = context.reduce(
      (acc, doc) => {
        const type = (doc.metadata.source_type as AISourceType) || 'unknown';
        if (!acc[type]) acc[type] = [];
        acc[type].push(doc.pageContent);
        return acc;
      },
      {} as Record<string, string[]>,
    );

    let sourceSection = '';
    for (const [type, content] of Object.entries(groupedSources)) {
      sourceSection += `\n${type.toUpperCase()}:\n- ${content.join('\n- ')}\n`;
    }

    return `${textPrompt}\nFontes:\n${sourceSection}`
      .replace(/{/g, '{{')
      .replace(/}/g, '}}');
  }
}
