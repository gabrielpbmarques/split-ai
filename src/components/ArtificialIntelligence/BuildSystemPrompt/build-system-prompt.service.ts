import { Injectable } from '@nestjs/common';
import { NormalizePromptInstructionsService } from 'src/components/ArtificialIntelligence/NormalizePromptInstructions/normalize-prompt-instructions.service';
import { AIInstructions, AISourceType, CustomDocument } from 'src/types';

@Injectable()
export class BuildSystemPromptService {
  constructor(
    private normalizePromptInstructionsService: NormalizePromptInstructionsService,
  ) {}

  execute(
    context: CustomDocument[],
    instructions: AIInstructions,
    sources?: AISourceType[],
  ): string {
    const textPrompt =
      this.normalizePromptInstructionsService.execute(instructions);

    const source = context
      .map((doc: CustomDocument) => doc.pageContent)
      .join(' ');

    if (!sources) {
      const final = `${textPrompt}\nData de hoje: ${new Date().toLocaleDateString()}\nReferência de conhecimento:\n${source}`;
      return this.escapeTemplateBraces(final);
    }

    const groupedSources = context.reduce(
      (acc, doc) => {
        const type = (doc.metadata?.source_type as AISourceType) || 'unknown';
        if (!acc[type]) acc[type] = [];
        acc[type].push(doc.pageContent as string);
        return acc;
      },
      {} as Record<string, string[]>,
    );

    let sourceSection = '';
    for (const [type, content] of Object.entries(groupedSources)) {
      sourceSection += `\n${type.toUpperCase()}:\n- ${content.join('\n- ')}\n`;
    }

    const final = `${textPrompt}\nData de hoje: ${new Date().toLocaleDateString()}\nReferência de conhecimento:\n${sourceSection}`;
    return this.escapeTemplateBraces(final);
  }

  private escapeTemplateBraces(str: string): string {
    if (!str) return str;
    return str.replace(/[{}]/g, (m) => (m === '{' ? '{{' : '}}'));
  }
}
