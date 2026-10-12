import { Injectable } from '@nestjs/common';

@Injectable()
export class BuildSystemPromptService {
  async execute(
    systemPrompt: string,
    promptVariables?: Record<string, unknown>,
  ): Promise<string> {
    const formattedVariables = Object.entries(promptVariables || {})
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    const sections = [systemPrompt.trim()];
    if (formattedVariables) {
      sections.push(`## Variáveis\n${formattedVariables}`);
    }
    sections.push(`TODAY_DATE: ${new Date().toLocaleDateString()}`);

    return sections.join('\n\n');
  }
}
